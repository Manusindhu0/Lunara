import { Router } from 'express';
import { asyncHandler } from '../../utils/errors';
import { departmentsController } from './departments.controller';

export const departmentsRouter = Router();

departmentsRouter.get(
  '/',
  asyncHandler((req, res) => departmentsController.list(req, res))
);

departmentsRouter.get(
  '/:slug',
  asyncHandler((req, res) => departmentsController.getBySlug(req, res))
);

export default departmentsRouter;
