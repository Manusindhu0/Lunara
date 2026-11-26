import { Router } from 'express';
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireVerifiedEmail,
} from '../../middleware';
import { asyncHandler } from '../../utils/errors';
import { instagramController } from './instagram.controller';

export const instagramRouter = Router();

instagramRouter.get(
  '/connect',
  authMiddleware,
  requireVerifiedEmail,
  asyncHandler((req, res) => instagramController.connect(req, res))
);

instagramRouter.get(
  '/callback',
  optionalAuthMiddleware,
  asyncHandler((req, res) => instagramController.callback(req, res))
);

instagramRouter.get(
  '/status',
  authMiddleware,
  asyncHandler((req, res) => instagramController.status(req, res))
);

instagramRouter.delete(
  '/disconnect',
  authMiddleware,
  asyncHandler((req, res) => instagramController.disconnect(req, res))
);

export default instagramRouter;
