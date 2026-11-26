import type { CookieOptions, NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { generateRandomToken, timingSafeEqualString } from '../utils/crypto';
import { ForbiddenError } from '../utils/errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function getCsrfCookieOptions(): CookieOptions {
  return {
    httpOnly: false,
    sameSite: 'lax',
    secure: env.cookieSecure,
    path: '/',
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function issueCsrfCookie(res: Response): string {
  const token = generateRandomToken(32);
  res.cookie(env.CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
  return token;
}

export function ensureCsrfCookie(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    const existing = req.cookies?.[env.CSRF_COOKIE_NAME];
    if (typeof existing !== 'string' || existing.length === 0) {
      const token = issueCsrfCookie(res);
      if (req.cookies) {
        req.cookies[env.CSRF_COOKIE_NAME] = token;
      }
    }
  }
  next();
}

function isOriginAllowed(origin: string): boolean {
  return env.allowedOrigins.includes(origin);
}

export function csrfMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const originHeader = req.get('origin');
  const refererHeader = req.get('referer');

  if (originHeader) {
    if (!isOriginAllowed(originHeader)) {
      next(new ForbiddenError('Request origin is not allowed', 'CSRF_ORIGIN_INVALID'));
      return;
    }
  } else if (refererHeader) {
    try {
      const refererOrigin = new URL(refererHeader).origin;
      if (!isOriginAllowed(refererOrigin)) {
        next(new ForbiddenError('Request referer is not allowed', 'CSRF_ORIGIN_INVALID'));
        return;
      }
    } catch {
      next(new ForbiddenError('Malformed referer header', 'CSRF_ORIGIN_INVALID'));
      return;
    }
  }

  const cookieToken = req.cookies?.[env.CSRF_COOKIE_NAME];
  const headerToken = req.get('x-csrf-token');

  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    cookieToken.length === 0 ||
    headerToken.length === 0 ||
    !timingSafeEqualString(cookieToken, headerToken)
  ) {
    next(new ForbiddenError('Invalid or missing CSRF token', 'CSRF_INVALID'));
    return;
  }

  next();
}
