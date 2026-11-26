import { Router } from 'express';
import {
  authMiddleware,
  requireRole,
  requireVerifiedEmail,
  sensitiveRateLimiter,
} from '../../middleware';
import { asyncHandler } from '../../utils/errors';
import { verificationController } from './verification.controller';

export const verificationRouter = Router();

verificationRouter.post(
  '/check-eligibility',
  authMiddleware,
  requireVerifiedEmail,
  sensitiveRateLimiter,
  asyncHandler((req, res) => verificationController.checkEligibility(req, res))
);

verificationRouter.get(
  '/status',
  authMiddleware,
  asyncHandler((req, res) => verificationController.status(req, res))
);

verificationRouter.post(
  '/admin/review',
  authMiddleware,
  requireRole('ADMIN'),
  asyncHandler((req, res) => verificationController.adminReview(req, res))
);

export default verificationRouter;
