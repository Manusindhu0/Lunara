// ============================================================
// LUNAR — Phase 3: Safe Internal Redirect Utilities
// ============================================================

export function sanitizeRedirectPath(
  candidate: string | null | undefined,
  fallback = '/world'
): string {
  if (!candidate || typeof candidate !== 'string') {
    return fallback;
  }
  const trimmed = candidate.trim();
  // Allow only relative internal paths starting with a single slash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }
  return trimmed;
}

export function buildAuthRedirectUrl(basePath: string, returnPath: string): string {
  const safeReturn = sanitizeRedirectPath(returnPath, '/world');
  if (safeReturn === '/' || safeReturn === basePath) {
    return basePath;
  }
  return `${basePath}?redirect=${encodeURIComponent(safeReturn)}`;
}
