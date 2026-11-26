import { Router } from 'express';
import {
  authMiddleware,
  requireVerifiedEmail,
  sensitiveRateLimiter,
} from '../../middleware';
import { asyncHandler } from '../../utils/errors';
import { citizensController } from './citizens.controller';

export const citizenshipRouter = Router();

citizenshipRouter.get(
  '/status',
  authMiddleware,
  asyncHandler((req, res) => citizensController.getCitizenshipStatus(req, res))
);

citizenshipRouter.get(
  '/me',
  authMiddleware,
  asyncHandler((req, res) => citizensController.getMyCitizen(req, res))
);

citizenshipRouter.post(
  '/apply',
  authMiddleware,
  requireVerifiedEmail,
  sensitiveRateLimiter,
  asyncHandler((req, res) => citizensController.apply(req, res))
);

export const citizensRouter = Router();

citizensRouter.get(
  '/',
  asyncHandler((req, res) => citizensController.list(req, res))
);

citizensRouter.get(
  '/check-username',
  asyncHandler((req, res) => citizensController.checkUsername(req, res))
);

citizensRouter.get(
  '/:citizenId/public',
  asyncHandler((req, res) => citizensController.getPublic(req, res))
);

citizensRouter.get(
  '/:citizenId',
  asyncHandler((req, res) => citizensController.getPublic(req, res))
);

citizensRouter.patch(
  '/:citizenId',
  authMiddleware,
  asyncHandler((req, res) => citizensController.update(req, res))
);

export default citizensRouter;
