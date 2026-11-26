import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { sha256 } from '../utils/crypto';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

const ACTIVITY_UPDATE_INTERVAL_MS = 5 * 60 * 1000;

async function resolveSession(req: Request): Promise<void> {
  if (req.user && req.session) {
    return;
  }

  const rawToken = req.cookies?.[env.SESSION_COOKIE_NAME];
  if (typeof rawToken !== 'string' || rawToken.length === 0) {
    return;
  }

  const tokenHash = sha256(rawToken);
  const now = new Date();

  const sessionRecord = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          emailVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!sessionRecord || sessionRecord.revokedAt !== null || sessionRecord.expiresAt <= now) {
    return;
  }

  req.user = sessionRecord.user;
  req.session = {
    id: sessionRecord.id,
    userId: sessionRecord.userId,
    expiresAt: sessionRecord.expiresAt,
    lastActivityAt: sessionRecord.lastActivityAt,
    userAgent: sessionRecord.userAgent,
    ipAddress: sessionRecord.ipAddress,
  };

  if (now.getTime() - sessionRecord.lastActivityAt.getTime() > ACTIVITY_UPDATE_INTERVAL_MS) {
    void prisma.session
      .update({
        where: { id: sessionRecord.id },
        data: { lastActivityAt: now },
      })
      .catch(() => undefined);
  }
}

export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resolveSession(req);
    next();
  } catch (err) {
    next(err);
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await resolveSession(req);
    if (!req.user || !req.session) {
      throw new UnauthorizedError('Valid session required', 'UNAUTHORIZED');
    }
    next();
  } catch (err) {
    next(err);
  }
}

export function requireVerifiedEmail(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required', 'UNAUTHORIZED'));
    return;
  }

  if (!req.user.emailVerified) {
    next(
      new ForbiddenError(
        'Email verification is required to perform this action',
        'EMAIL_NOT_VERIFIED'
      )
    );
    return;
  }

  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required', 'UNAUTHORIZED'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions', 'INSUFFICIENT_ROLE'));
      return;
    }

    next();
  };
}
