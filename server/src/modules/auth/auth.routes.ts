import { Router } from 'express';
import {
  authMiddleware,
  authRateLimiter,
  optionalAuthMiddleware,
  sensitiveRateLimiter,
} from '../../middleware';
import { asyncHandler } from '../../utils/errors';
import { authController } from './auth.controller';

export const authRouter = Router();

authRouter.get('/csrf', (req, res) => authController.csrf(req, res));

authRouter.post('/register', authRateLimiter, asyncHandler(authController.register));

authRouter.post('/verify-email', authRateLimiter, asyncHandler(authController.verifyEmail));

authRouter.post(
  '/resend-verification',
  sensitiveRateLimiter,
  optionalAuthMiddleware,
  asyncHandler(authController.resendVerification)
);

authRouter.post('/login', authRateLimiter, asyncHandler(authController.login));

authRouter.post('/logout', optionalAuthMiddleware, asyncHandler(authController.logout));

authRouter.get('/me', authMiddleware, asyncHandler(authController.me));

authRouter.post(
  '/forgot-password',
  sensitiveRateLimiter,
  asyncHandler(authController.forgotPassword)
);

authRouter.post(
  '/reset-password',
  sensitiveRateLimiter,
  asyncHandler(authController.resetPassword)
);

export default authRouter;
