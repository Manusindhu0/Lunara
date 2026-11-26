import type { Request, Response } from 'express';
import { departmentSlugParamSchema } from './departments.schemas';
import { departmentsService } from './departments.service';

export class DepartmentsController {
  async list(_req: Request, res: Response): Promise<void> {
    const departments = await departmentsService.listDepartments();
    res.json({ departments });
  }

  async getBySlug(req: Request, res: Response): Promise<void> {
    const { slug } = departmentSlugParamSchema.parse(req.params);
    const department = await departmentsService.getDepartmentBySlug(slug);
    res.json({ department });
  }
}

export const departmentsController = new DepartmentsController();
