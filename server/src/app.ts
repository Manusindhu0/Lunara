import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { prisma } from './config/prisma';
import {
  csrfMiddleware,
  ensureCsrfCookie,
  errorHandler,
  generalRateLimiter,
  issueCsrfCookie,
  notFoundHandler,
} from './middleware';
import { authRouter } from './modules/auth/auth.routes';
import { citizenshipRouter, citizensRouter } from './modules/citizens/citizens.routes';
import { departmentsRouter } from './modules/departments/departments.routes';
import { instagramRouter } from './modules/instagram/instagram.routes';
import { verificationRouter } from './modules/verification/verification.routes';
import { asyncHandler } from './utils/errors';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(ensureCsrfCookie);
  app.use('/api', generalRateLimiter);

  app.get(
    '/api/health',
    asyncHandler(async (_req, res) => {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: 'ok',
        database: 'connected',
        environment: env.NODE_ENV,
        mockVerificationEnabled: env.DEV_MOCK_VERIFICATION && !env.isProduction,
        timestamp: new Date().toISOString(),
      });
    })
  );

  app.get('/api/csrf', (req, res) => {
    const existing = req.cookies?.[env.CSRF_COOKIE_NAME];
    const csrfToken =
      typeof existing === 'string' && existing.length > 0 ? existing : issueCsrfCookie(res);
    res.json({ csrfToken });
  });

  // Protect all mutating /api/* routes with Origin/Referer + double-submit CSRF verification
  app.use('/api', csrfMiddleware);

  // MOUNT_POINT: auth-api -> mount /api/auth, /api/instagram, /api/verification routers here
  app.use('/api/auth', authRouter);
  app.use('/api/instagram', instagramRouter);
  app.use('/api/verification', verificationRouter);

  // MOUNT_POINT: colony-api -> mount /api/citizenship, /api/citizens, /api/departments routers here
  app.use('/api/citizenship', citizenshipRouter);
  app.use('/api/citizens', citizensRouter);
  app.use('/api/departments', departmentsRouter);

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
