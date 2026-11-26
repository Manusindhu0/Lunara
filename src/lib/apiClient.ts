// ============================================================
// LUNAR — Phase 3: Typed Cookie & CSRF-Aware API Client
// ============================================================

export interface ApiErrorDetails {
  fieldErrors?: Record<string, string[] | string>;
  issues?: Array<{ path?: (string | number)[]; message: string }>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: ApiErrorDetails | unknown;

  constructor(
    message: string,
    status: number,
    code = 'API_ERROR',
    details?: ApiErrorDetails | unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError || (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: string }).name === 'ApiError' &&
    typeof (error as { status?: unknown }).status === 'number'
  );
}

const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

const CSRF_COOKIE_NAMES = [
  'lunar_csrf',
  'csrf_token',
  'csrfToken',
  'XSRF-TOKEN',
  'xsrf-token',
] as const;

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

let cachedCsrfToken: string | null = null;
let csrfFetchInFlight: Promise<string | null> | null = null;

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function readCsrfCookie(): string | null {
  if (typeof document === 'undefined' || !document.cookie) {
    return null;
  }
  const cookies = document.cookie.split(';');
  for (const name of CSRF_COOKIE_NAMES) {
    const prefix = `${name}=`;
    for (const raw of cookies) {
      const trimmed = raw.trim();
      if (trimmed.startsWith(prefix)) {
        const value = decodeURIComponent(trimmed.slice(prefix.length));
        if (value) return value;
      }
    }
  }
  return null;
}

export function getCsrfToken(): string | null {
  return readCsrfCookie() ?? cachedCsrfToken;
}

export function clearCsrfToken(): void {
  cachedCsrfToken = null;
}

async function fetchCsrfEndpoint(path: string): Promise<string | null> {
  const res = await fetch(buildApiUrl(path), {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  const headerToken = res.headers.get('x-csrf-token');
  if (headerToken) {
    cachedCsrfToken = headerToken;
    return headerToken;
  }

  if (!res.ok) {
    return null;
  }

  const cookieAfter = readCsrfCookie();
  if (cookieAfter) {
    cachedCsrfToken = cookieAfter;
    return cookieAfter;
  }

  try {
    const data = (await res.json()) as { csrfToken?: string; token?: string };
    const token = data?.csrfToken ?? data?.token ?? null;
    if (token) {
      cachedCsrfToken = token;
      return token;
    }
  } catch {
    // Ignore non-JSON csrf endpoint responses
  }

  return null;
}

export async function ensureCsrfToken(): Promise<string | null> {
  const existing = getCsrfToken();
  if (existing) {
    return existing;
  }

  if (csrfFetchInFlight) {
    return csrfFetchInFlight;
  }

  csrfFetchInFlight = (async () => {
    try {
      const primary = await fetchCsrfEndpoint('/api/auth/csrf');
      if (primary) return primary;
      return await fetchCsrfEndpoint('/api/csrf');
    } catch {
      return null;
    } finally {
      csrfFetchInFlight = null;
    }
  })();

  return csrfFetchInFlight;
}

function parseErrorPayload(
  payload: unknown,
  status: number,
  fallbackStatusText: string
): ApiError {
  if (typeof payload === 'string' && payload.trim()) {
    return new ApiError(payload.trim(), status, `HTTP_${status}`);
  }

  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const nestedError =
      obj.error && typeof obj.error === 'object'
        ? (obj.error as Record<string, unknown>)
        : null;

    const message =
      (typeof nestedError?.message === 'string' && nestedError.message) ||
      (typeof obj.message === 'string' && obj.message) ||
      (typeof obj.error === 'string' && obj.error) ||
      fallbackStatusText ||
      `Request failed with status ${status}`;

    const code =
      (typeof nestedError?.code === 'string' && nestedError.code) ||
      (typeof obj.code === 'string' && obj.code) ||
      `HTTP_${status}`;

    const details =
      nestedError?.details ??
      obj.details ??
      obj.errors ??
      obj.fieldErrors ??
      undefined;

    return new ApiError(message, status, code, details);
  }

  return new ApiError(
    fallbackStatusText || `Request failed with status ${status}`,
    status,
    `HTTP_${status}`
  );
}

export interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  skipCsrf?: boolean;
}

export async function apiRequest<TResponse = unknown>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options: ApiRequestOptions = {}
): Promise<TResponse> {
  const { skipCsrf = false, headers: customHeaders, ...restOptions } = options;
  const headers = new Headers(customHeaders);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (MUTATING_METHODS.has(method) && !skipCsrf && !headers.has('X-CSRF-Token')) {
    const csrfToken = await ensureCsrfToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...restOptions,
      method,
      credentials: 'include',
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });
  } catch (networkErr) {
    const msg =
      networkErr instanceof Error && networkErr.message
        ? networkErr.message
        : 'Unable to reach LUNAR command server';
    throw new ApiError(msg, 0, 'NETWORK_ERROR', networkErr);
  }

  const responseCsrf = response.headers.get('x-csrf-token');
  if (responseCsrf) {
    cachedCsrfToken = responseCsrf;
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get('content-type') ?? '';
  let parsedBody: unknown = null;

  if (contentType.includes('application/json')) {
    try {
      parsedBody = await response.json();
    } catch {
      parsedBody = null;
    }
  } else {
    try {
      const text = await response.text();
      if (text) {
        try {
          parsedBody = JSON.parse(text);
        } catch {
          parsedBody = text;
        }
      }
    } catch {
      parsedBody = null;
    }
  }

  if (!response.ok) {
    throw parseErrorPayload(parsedBody, response.status, response.statusText);
  }

  return parsedBody as TResponse;
}

export const apiClient = {
  get: <TResponse = unknown>(path: string, options?: ApiRequestOptions) =>
    apiRequest<TResponse>('GET', path, undefined, options),
  post: <TResponse = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<TResponse>('POST', path, body, options),
  put: <TResponse = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<TResponse>('PUT', path, body, options),
  patch: <TResponse = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<TResponse>('PATCH', path, body, options),
  delete: <TResponse = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<TResponse>('DELETE', path, body, options),
};

export default apiClient;
