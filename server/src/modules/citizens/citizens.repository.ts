import type { Department, EligibilityVerification, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import type { CitizenWithRelations } from './citizens.schemas';

const CITIZEN_RELATIONS_INCLUDE = {
  department: true,
  achievements: {
    include: {
      achievement: true,
    },
    orderBy: {
      unlockedAt: 'asc' as const,
    },
  },
};

export class CitizensRepository {
  async findByUserId(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<CitizenWithRelations | null> {
    const client = tx ?? prisma;
    return client.citizen.findUnique({
      where: { userId },
      include: CITIZEN_RELATIONS_INCLUDE,
    });
  }

  async findByCitizenId(
    citizenId: string,
    tx?: Prisma.TransactionClient
  ): Promise<CitizenWithRelations | null> {
    const client = tx ?? prisma;
    return client.citizen.findUnique({
      where: { citizenId: citizenId.toUpperCase() },
      include: CITIZEN_RELATIONS_INCLUDE,
    });
  }

  async findByUsername(
    username: string,
    tx?: Prisma.TransactionClient
  ): Promise<{ id: string } | null> {
    const client = tx ?? prisma;
    return client.citizen.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
  }

  async findDepartmentBySlug(
    slug: string,
    tx?: Prisma.TransactionClient
  ): Promise<Department | null> {
    const client = tx ?? prisma;
    return client.department.findUnique({
      where: { slug: slug.toUpperCase() },
    });
  }

  async findLatestVerificationByUserId(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<EligibilityVerification | null> {
    const client = tx ?? prisma;
    return client.eligibilityVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementSequence(tx: Prisma.TransactionClient): Promise<number> {
    const row = await tx.citizenSequence.upsert({
      where: { id: 1 },
      update: { lastValue: { increment: 1 } },
      create: { id: 1, lastValue: 1 },
    });
    return row.lastValue;
  }

  async listAllPositions(
    tx: Prisma.TransactionClient
  ): Promise<Array<{ positionX: number; positionZ: number }>> {
    return tx.citizen.findMany({
      select: {
        positionX: true,
        positionZ: true,
      },
    });
  }

  async createCitizen(
    tx: Prisma.TransactionClient,
    data: {
      citizenId: string;
      userId: string;
      username: string;
      displayName: string;
      astronautType: string;
      suitColor: string;
      bio: string;
      departmentId: string;
      profession: string;
      districtId: string;
      buildingId: string;
      positionX: number;
      positionY: number;
      positionZ: number;
      rotationY: number;
      currentActivity: string;
      isFoundingCitizen: boolean;
    }
  ): Promise<{ id: string }> {
    return tx.citizen.create({
      data: {
        ...data,
        avatarUrl: null,
        careerRank: 'Citizen',
        status: 'ACTIVE',
        xp: 0,
        level: 1,
        colonyCredits: 100,
      },
      select: { id: true },
    });
  }

  async unlockAchievementsBySlugs(
    tx: Prisma.TransactionClient,
    citizenRecordId: string,
    slugs: string[]
  ): Promise<void> {
    if (slugs.length === 0) return;

    const achievements = await tx.achievement.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });

    if (achievements.length === 0) return;

    await tx.citizenAchievement.createMany({
      data: achievements.map((ach) => ({
        citizenId: citizenRecordId,
        achievementId: ach.id,
      })),
      skipDuplicates: true,
    });
  }

  async findByRecordId(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<CitizenWithRelations | null> {
    const client = tx ?? prisma;
    return client.citizen.findUnique({
      where: { id },
      include: CITIZEN_RELATIONS_INCLUDE,
    });
  }

  async listPaginated(params: {
    where: Prisma.CitizenWhereInput;
    orderBy: Prisma.CitizenOrderByWithRelationInput[];
    skip: number;
    take: number;
  }): Promise<{ rows: CitizenWithRelations[]; total: number }> {
    const [rows, total] = await Promise.all([
      prisma.citizen.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
        include: CITIZEN_RELATIONS_INCLUDE,
      }),
      prisma.citizen.count({ where: params.where }),
    ]);

    return { rows, total };
  }

  async updateCitizen(
    id: string,
    data: Prisma.CitizenUpdateInput
  ): Promise<CitizenWithRelations> {
    return prisma.citizen.update({
      where: { id },
      data,
      include: CITIZEN_RELATIONS_INCLUDE,
    });
  }
}

export const citizensRepository = new CitizensRepository();
