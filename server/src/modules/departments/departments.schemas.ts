import type { Department } from '@prisma/client';
import { z } from 'zod';
import type { DepartmentId, DistrictId } from '../../utils/citizenPlacement';

export const departmentSlugParamSchema = z.object({
  slug: z.string().trim().min(1).toUpperCase(),
});

export interface DepartmentDTO {
  id: DepartmentId;
  slug: DepartmentId;
  name: string;
  primaryDistrictId: DistrictId;
  districtId: DistrictId;
  description: string;
  accentColor: string;
  professions: string[];
}

export function toDepartmentDTO(dept: Department): DepartmentDTO {
  return {
    id: dept.slug as DepartmentId,
    slug: dept.slug as DepartmentId,
    name: dept.name,
    primaryDistrictId: dept.districtId as DistrictId,
    districtId: dept.districtId as DistrictId,
    description: dept.description,
    accentColor: dept.accentColor,
    professions: [...dept.professions],
  };
}
