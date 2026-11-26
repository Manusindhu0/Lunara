import type { Department } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class DepartmentsRepository {
  async findAll(): Promise<Department[]> {
    return prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string): Promise<Department | null> {
    return prisma.department.findUnique({
      where: { slug: slug.toUpperCase() },
    });
  }
}

export const departmentsRepository = new DepartmentsRepository();
