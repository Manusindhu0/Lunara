import type { Achievement, Citizen, CitizenAchievement, Department } from '@prisma/client';
import { z } from 'zod';
import { DEPARTMENT_IDS, DISTRICT_IDS, type DepartmentId, type DistrictId } from '../../utils/citizenPlacement';

export const CAREER_RANKS = [
  'Citizen',
  'Specialist',
  'Senior Specialist',
  'Department Lead',
  'Mission Commander',
  'Colony Council',
] as const;

export type CareerRank = (typeof CAREER_RANKS)[number];

export const CITIZEN_STATUSES = [
  'ACTIVE',
  'ON DUTY',
  'RESEARCHING',
  'MAINTENANCE',
  'OFF-DUTY',
  'SUSPENDED',
] as const;

export type CitizenStatus = (typeof CITIZEN_STATUSES)[number];

export const ASTRONAUT_TYPES = [
  'engineer',
  'scientist',
  'medic',
  'commander',
  'technician',
  'civilian',
] as const;

export type AstronautType = (typeof ASTRONAUT_TYPES)[number];

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PublicAchievementDTO {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: AchievementRarity;
}

export interface PublicCitizenDTO {
  citizenId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  astronautType: AstronautType;
  suitColor: string;
  bio: string;
  department: DepartmentId;
  profession: string;
  rank: CareerRank;
  districtId: DistrictId;
  buildingId: string;
  location: {
    x: number;
    y: number;
    z: number;
    rotationY: number;
    districtId: DistrictId;
    buildingId: string;
  };
  currentActivity: string;
  status: CitizenStatus;
  joinedAt: string;
  xp: number;
  level: number;
  colonyCredits: number;
  achievements: PublicAchievementDTO[];
  isFoundingCitizen: boolean;
  contributionStats: {
    missionsCompleted: number;
    structuresContributed: number;
    totalContribution: number;
    evaSessions: number;
    discoveryCount: number;
  };
  isDemo: false;
}

export type CitizenWithRelations = Citizen & {
  department: Department;
  achievements: Array<
    CitizenAchievement & {
      achievement: Achievement;
    }
  >;
};

export function toPublicCitizenDTO(citizen: CitizenWithRelations): PublicCitizenDTO {
  const departmentSlug = citizen.department.slug as DepartmentId;
  const districtId = citizen.districtId as DistrictId;

  return {
    citizenId: citizen.citizenId,
    username: citizen.username,
    displayName: citizen.displayName,
    avatarUrl: citizen.avatarUrl,
    astronautType: citizen.astronautType as AstronautType,
    suitColor: citizen.suitColor,
    bio: citizen.bio,
    department: departmentSlug,
    profession: citizen.profession,
    rank: citizen.careerRank as CareerRank,
    districtId,
    buildingId: citizen.buildingId,
    location: {
      x: citizen.positionX,
      y: citizen.positionY,
      z: citizen.positionZ,
      rotationY: citizen.rotationY,
      districtId,
      buildingId: citizen.buildingId,
    },
    currentActivity: citizen.currentActivity,
    status: citizen.status as CitizenStatus,
    joinedAt: citizen.joinedAt.toISOString(),
    xp: citizen.xp,
    level: citizen.level,
    colonyCredits: citizen.colonyCredits,
    achievements: citizen.achievements.map((entry) => ({
      id: entry.achievement.slug,
      name: entry.achievement.name,
      description: entry.achievement.description,
      icon: entry.achievement.icon,
      unlockedAt: entry.unlockedAt.toISOString(),
      rarity: entry.achievement.rarity as AchievementRarity,
    })),
    isFoundingCitizen: citizen.isFoundingCitizen,
    contributionStats: {
      missionsCompleted: citizen.missionsCompleted,
      structuresContributed: citizen.structuresContributed,
      totalContribution: citizen.totalContribution,
      evaSessions: citizen.evaSessions,
      discoveryCount: citizen.discoveryCount,
    },
    isDemo: false,
  };
}

export const applyCitizenshipSchema = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .regex(
        /^[a-z0-9_]{3,20}$/,
        'Username must be 3-20 characters using only lowercase letters, numbers, and underscores'
      ),
    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(50, 'Display name must be at most 50 characters'),
    bio: z
      .string()
      .trim()
      .min(10, 'Bio must be at least 10 characters')
      .max(500, 'Bio must be at most 500 characters'),
    departmentId: z.enum(DEPARTMENT_IDS).optional(),
    department: z.enum(DEPARTMENT_IDS).optional(),
    profession: z.string().trim().min(2).max(80),
    astronautType: z.enum(ASTRONAUT_TYPES),
    suitColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Suit color must be a valid 6-digit hex color'),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.departmentId && !data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['departmentId'],
        message: 'departmentId is required',
      });
    }
    if (data.departmentId && data.department && data.departmentId !== data.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['departmentId'],
        message: 'departmentId and department must match when both are supplied',
      });
    }
  });

export type ApplyCitizenshipInput = z.infer<typeof applyCitizenshipSchema>;

export const listCitizensQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  query: z.string().trim().max(100).optional(),
  department: z.enum([...DEPARTMENT_IDS, 'ALL']).optional(),
  district: z.enum([...DISTRICT_IDS, 'ALL']).optional(),
  districtId: z.enum([...DISTRICT_IDS, 'ALL']).optional(),
  rank: z.enum([...CAREER_RANKS, 'ALL']).optional(),
  status: z.enum([...CITIZEN_STATUSES, 'ALL']).optional(),
  sort: z.enum(['newest', 'oldest', 'xp', 'level', 'contribution', 'name']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'xp', 'level', 'contribution', 'name']).optional(),
});

export type ListCitizensQuery = z.infer<typeof listCitizensQuerySchema>;

export const citizenIdParamSchema = z.object({
  citizenId: z.string().trim().min(1).toUpperCase(),
});

export const checkUsernameQuerySchema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(50),
});

export const PROTECTED_CITIZEN_PATCH_FIELDS = new Set([
  'id',
  '_internalId',
  'citizenId',
  'userId',
  'username',
  'rank',
  'careerRank',
  'xp',
  'level',
  'colonyCredits',
  'isFoundingCitizen',
  'department',
  'departmentId',
  'profession',
  'districtId',
  'buildingId',
  'positionX',
  'positionY',
  'positionZ',
  'rotationY',
  'location',
  'status',
  'joinedAt',
  'achievements',
  'contributionStats',
  'missionsCompleted',
  'structuresContributed',
  'totalContribution',
  'evaSessions',
  'discoveryCount',
  'avatarUrl',
  'astronautType',
]);

export const userPatchCitizenSchema = z
  .object({
    displayName: z.string().trim().min(2).max(50).optional(),
    bio: z.string().trim().min(10).max(500).optional(),
    suitColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Suit color must be a valid 6-digit hex color')
      .optional(),
    currentActivity: z.string().trim().min(2).max(140).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one editable field must be provided',
  });

export const adminPatchCitizenSchema = z
  .object({
    displayName: z.string().trim().min(2).max(50).optional(),
    bio: z.string().trim().min(10).max(500).optional(),
    suitColor: z
      .string()
      .trim()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Suit color must be a valid 6-digit hex color')
      .optional(),
    currentActivity: z.string().trim().min(2).max(140).optional(),
    careerRank: z.enum(CAREER_RANKS).optional(),
    xp: z.number().int().min(0).optional(),
    level: z.number().int().min(1).optional(),
    colonyCredits: z.number().int().min(0).optional(),
    isFoundingCitizen: z.boolean().optional(),
    status: z.enum(CITIZEN_STATUSES).optional(),
    departmentId: z.enum(DEPARTMENT_IDS).optional(),
    profession: z.string().trim().min(2).max(80).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UserPatchCitizenInput = z.infer<typeof userPatchCitizenSchema>;
export type AdminPatchCitizenInput = z.infer<typeof adminPatchCitizenSchema>;
