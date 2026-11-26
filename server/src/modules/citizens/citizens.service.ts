import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { generateCitizenId } from '../../utils/citizenId';
import {
  assignPlacementSlot,
  getDistrictForDepartment,
  type DepartmentId,
} from '../../utils/citizenPlacement';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/errors';
import { instagramService } from '../instagram/instagram.service';
import type { InstagramStatusDTO } from '../instagram/instagram.schemas';
import { verificationService } from '../verification/verification.service';
import type { VerificationStatusDTO } from '../verification/verification.schemas';
import { citizensRepository } from './citizens.repository';
import {
  adminPatchCitizenSchema,
  type ApplyCitizenshipInput,
  type ListCitizensQuery,
  PROTECTED_CITIZEN_PATCH_FIELDS,
  type PublicCitizenDTO,
  toPublicCitizenDTO,
  userPatchCitizenSchema,
} from './citizens.schemas';

export interface CitizenshipStatusDTO {
  emailVerified: boolean;
  instagram: InstagramStatusDTO;
  eligibility: VerificationStatusDTO;
  citizenship: {
    hasCitizenship: boolean;
    citizen: PublicCitizenDTO | null;
  };
}

export interface PaginatedCitizensDTO {
  citizens: PublicCitizenDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class CitizensService {
  async getCitizenshipStatus(user: {
    id: string;
    emailVerified: boolean;
  }): Promise<CitizenshipStatusDTO> {
    const [instagram, eligibility, citizen] = await Promise.all([
      instagramService.getStatus(user.id),
      verificationService.getStatus(user.id),
      citizensRepository.findByUserId(user.id),
    ]);

    return {
      emailVerified: user.emailVerified,
      instagram,
      eligibility,
      citizenship: {
        hasCitizenship: Boolean(citizen),
        citizen: citizen ? toPublicCitizenDTO(citizen) : null,
      },
    };
  }

  async getMyCitizen(userId: string): Promise<PublicCitizenDTO> {
    const citizen = await citizensRepository.findByUserId(userId);
    if (!citizen) {
      throw new NotFoundError('No citizenship record found for this account', 'CITIZEN_NOT_FOUND');
    }
    return toPublicCitizenDTO(citizen);
  }

  async applyForCitizenship(
    userId: string,
    input: ApplyCitizenshipInput
  ): Promise<PublicCitizenDTO> {
    const departmentSlug = (input.departmentId ?? input.department) as DepartmentId;
    const normalizedUsername = input.username.toLowerCase();

    const createdCitizen = await prisma.$transaction(async (tx) => {
      const existingCitizen = await citizensRepository.findByUserId(userId, tx);
      if (existingCitizen) {
        throw new ConflictError(
          'This account already holds LUNAR citizenship',
          'CITIZENSHIP_ALREADY_EXISTS'
        );
      }

      const latestVerification = await citizensRepository.findLatestVerificationByUserId(userId, tx);
      const now = new Date();
      const isEligibilityValid =
        latestVerification !== null &&
        latestVerification.status === 'VERIFIED' &&
        (latestVerification.expiresAt === null || latestVerification.expiresAt > now);

      if (!isEligibilityValid) {
        throw new ForbiddenError(
          'Verified citizenship eligibility is required before applying',
          'ELIGIBILITY_REQUIRED'
        );
      }

      const department = await citizensRepository.findDepartmentBySlug(departmentSlug, tx);
      if (!department) {
        throw new BadRequestError(`Unknown department: ${departmentSlug}`, 'INVALID_DEPARTMENT');
      }

      if (!department.professions.includes(input.profession)) {
        throw new BadRequestError(
          `Profession "${input.profession}" does not belong to ${department.name}`,
          'INVALID_PROFESSION'
        );
      }

      const existingUsername = await citizensRepository.findByUsername(normalizedUsername, tx);
      if (existingUsername) {
        throw new ConflictError('Username is already claimed by another citizen', 'USERNAME_TAKEN');
      }

      const sequence = await citizensRepository.incrementSequence(tx);
      const citizenId = generateCitizenId(sequence);
      const isFoundingCitizen = sequence <= 100;

      const existingPositions = await citizensRepository.listAllPositions(tx);
      const placement = assignPlacementSlot(
        departmentSlug,
        existingPositions.map((p) => ({ x: p.positionX, z: p.positionZ }))
      );

      const createdRef = await citizensRepository.createCitizen(tx, {
        citizenId,
        userId,
        username: normalizedUsername,
        displayName: input.displayName,
        astronautType: input.astronautType,
        suitColor: input.suitColor,
        bio: input.bio,
        departmentId: department.id,
        profession: input.profession,
        districtId: placement.districtId,
        buildingId: placement.buildingId,
        positionX: placement.x,
        positionY: placement.y,
        positionZ: placement.z,
        rotationY: placement.rotationY,
        currentActivity: `Arrived in ${placement.districtId} — ${input.profession} orientation`,
        isFoundingCitizen,
      });

      const starterAchievements = ['FIRST_ARRIVAL'];
      if (sequence <= 50) {
        starterAchievements.push('PIONEER');
      }
      if (isFoundingCitizen) {
        starterAchievements.push('FOUNDING_100');
      }
      await citizensRepository.unlockAchievementsBySlugs(tx, createdRef.id, starterAchievements);

      const hydrated = await citizensRepository.findByRecordId(createdRef.id, tx);
      if (!hydrated) {
        throw new Error('Failed to load newly created citizen record');
      }
      return hydrated;
    });

    return toPublicCitizenDTO(createdCitizen);
  }

  async listCitizens(query: ListCitizensQuery): Promise<PaginatedCitizensDTO> {
    const where: Prisma.CitizenWhereInput = {};

    if (query.query && query.query.length > 0) {
      const q = query.query;
      where.OR = [
        { citizenId: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
        { profession: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (query.department && query.department !== 'ALL') {
      where.department = { slug: query.department };
    }

    const districtFilter = query.district ?? query.districtId;
    if (districtFilter && districtFilter !== 'ALL') {
      where.districtId = districtFilter;
    }

    if (query.rank && query.rank !== 'ALL') {
      where.careerRank = query.rank;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    const sortKey = query.sort ?? query.sortBy ?? 'newest';
    let orderBy: Prisma.CitizenOrderByWithRelationInput[];
    switch (sortKey) {
      case 'oldest':
        orderBy = [{ joinedAt: 'asc' }, { citizenId: 'asc' }];
        break;
      case 'xp':
        orderBy = [{ xp: 'desc' }, { joinedAt: 'asc' }];
        break;
      case 'level':
        orderBy = [{ level: 'desc' }, { xp: 'desc' }];
        break;
      case 'contribution':
        orderBy = [{ totalContribution: 'desc' }, { xp: 'desc' }];
        break;
      case 'name':
        orderBy = [{ displayName: 'asc' }];
        break;
      case 'newest':
      default:
        orderBy = [{ joinedAt: 'desc' }, { citizenId: 'desc' }];
        break;
    }

    const skip = (query.page - 1) * query.limit;
    const { rows, total } = await citizensRepository.listPaginated({
      where,
      orderBy,
      skip,
      take: query.limit,
    });

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      citizens: rows.map(toPublicCitizenDTO),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
      },
    };
  }

  async checkUsername(username: string): Promise<{
    username: string;
    valid: boolean;
    available: boolean;
  }> {
    const normalized = username.trim().toLowerCase();
    const valid = /^[a-z0-9_]{3,20}$/.test(normalized);
    if (!valid) {
      return { username: normalized, valid: false, available: false };
    }

    const existing = await citizensRepository.findByUsername(normalized);
    return {
      username: normalized,
      valid: true,
      available: !existing,
    };
  }

  async getPublicCitizen(citizenId: string): Promise<PublicCitizenDTO> {
    const citizen = await citizensRepository.findByCitizenId(citizenId);
    if (!citizen) {
      throw new NotFoundError(`Citizen not found: ${citizenId}`, 'CITIZEN_NOT_FOUND');
    }
    return toPublicCitizenDTO(citizen);
  }

  async updateCitizen(
    citizenId: string,
    actor: { id: string; role: 'USER' | 'ADMIN' },
    rawBody: unknown
  ): Promise<PublicCitizenDTO> {
    const existing = await citizensRepository.findByCitizenId(citizenId);
    if (!existing) {
      throw new NotFoundError(`Citizen not found: ${citizenId}`, 'CITIZEN_NOT_FOUND');
    }

    const isAdmin = actor.role === 'ADMIN';
    if (existing.userId !== actor.id && !isAdmin) {
      throw new ForbiddenError(
        'You do not have permission to update this citizen profile',
        'FORBIDDEN'
      );
    }

    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      throw new BadRequestError('Request body must be a JSON object', 'INVALID_BODY');
    }

    const bodyRecord = rawBody as Record<string, unknown>;

    if (!isAdmin) {
      const attemptedProtectedFields = Object.keys(bodyRecord).filter((key) =>
        PROTECTED_CITIZEN_PATCH_FIELDS.has(key)
      );
      if (attemptedProtectedFields.length > 0) {
        throw new ForbiddenError(
          `Modification of protected citizen fields is forbidden: ${attemptedProtectedFields.join(', ')}`,
          'PROTECTED_FIELD_FORBIDDEN'
        );
      }

      const parsed = userPatchCitizenSchema.parse(rawBody);
      const updated = await citizensRepository.updateCitizen(existing.id, {
        ...(parsed.displayName !== undefined ? { displayName: parsed.displayName } : {}),
        ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
        ...(parsed.suitColor !== undefined ? { suitColor: parsed.suitColor } : {}),
        ...(parsed.currentActivity !== undefined
          ? { currentActivity: parsed.currentActivity }
          : {}),
      });

      return toPublicCitizenDTO(updated);
    }

    const parsed = adminPatchCitizenSchema.parse(rawBody);
    const updateData: Prisma.CitizenUpdateInput = {
      ...(parsed.displayName !== undefined ? { displayName: parsed.displayName } : {}),
      ...(parsed.bio !== undefined ? { bio: parsed.bio } : {}),
      ...(parsed.suitColor !== undefined ? { suitColor: parsed.suitColor } : {}),
      ...(parsed.currentActivity !== undefined ? { currentActivity: parsed.currentActivity } : {}),
      ...(parsed.careerRank !== undefined ? { careerRank: parsed.careerRank } : {}),
      ...(parsed.xp !== undefined ? { xp: parsed.xp } : {}),
      ...(parsed.level !== undefined ? { level: parsed.level } : {}),
      ...(parsed.colonyCredits !== undefined ? { colonyCredits: parsed.colonyCredits } : {}),
      ...(parsed.isFoundingCitizen !== undefined
        ? { isFoundingCitizen: parsed.isFoundingCitizen }
        : {}),
      ...(parsed.status !== undefined ? { status: parsed.status } : {}),
    };

    if (parsed.departmentId !== undefined) {
      const dept = await citizensRepository.findDepartmentBySlug(parsed.departmentId);
      if (!dept) {
        throw new BadRequestError(
          `Unknown department: ${parsed.departmentId}`,
          'INVALID_DEPARTMENT'
        );
      }
      const nextProfession = parsed.profession ?? existing.profession;
      if (!dept.professions.includes(nextProfession)) {
        throw new BadRequestError(
          `Profession "${nextProfession}" does not belong to ${dept.name}`,
          'INVALID_PROFESSION'
        );
      }
      updateData.department = { connect: { id: dept.id } };
      updateData.districtId = getDistrictForDepartment(parsed.departmentId);
      if (parsed.profession !== undefined) {
        updateData.profession = parsed.profession;
      }
    } else if (parsed.profession !== undefined) {
      if (!existing.department.professions.includes(parsed.profession)) {
        throw new BadRequestError(
          `Profession "${parsed.profession}" does not belong to ${existing.department.name}`,
          'INVALID_PROFESSION'
        );
      }
      updateData.profession = parsed.profession;
    }

    const updated = await citizensRepository.updateCitizen(existing.id, updateData);
    return toPublicCitizenDTO(updated);
  }
}

export const citizensService = new CitizensService();
