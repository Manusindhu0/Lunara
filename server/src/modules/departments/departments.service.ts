import { NotFoundError } from '../../utils/errors';
import { departmentsRepository } from './departments.repository';
import { type DepartmentDTO, toDepartmentDTO } from './departments.schemas';

const CANONICAL_ORDER = [
  'ENGINEERING',
  'BIOSCIENCE',
  'RESEARCH',
  'SECURITY',
  'COMMUNICATIONS',
  'CULTURE',
];

export class DepartmentsService {
  async listDepartments(): Promise<DepartmentDTO[]> {
    const rows = await departmentsRepository.findAll();
    const sorted = [...rows].sort((a, b) => {
      const idxA = CANONICAL_ORDER.indexOf(a.slug);
      const idxB = CANONICAL_ORDER.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
    return sorted.map(toDepartmentDTO);
  }

  async getDepartmentBySlug(slug: string): Promise<DepartmentDTO> {
    const dept = await departmentsRepository.findBySlug(slug);
    if (!dept) {
      throw new NotFoundError(`Department not found: ${slug}`, 'DEPARTMENT_NOT_FOUND');
    }
    return toDepartmentDTO(dept);
  }
}

export const departmentsService = new DepartmentsService();
