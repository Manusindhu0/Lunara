import type { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/prisma';

const userProfileInclude = {
  citizen: {
    select: {
      id: true,
      citizenId: true,
      username: true,
      displayName: true,
      districtId: true,
      profession: true,
      status: true,
      avatarUrl: true,
      suitColor: true,
      department: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
  },
  instagramConnection: {
    select: {
      id: true,
      provider: true,
      username: true,
      profilePictureUrl: true,
      connectedAt: true,
    },
  },
  eligibilityVerifications: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: {
      status: true,
      provider: true,
      verificationType: true,
      reason: true,
      verifiedAt: true,
      expiresAt: true,
    },
  },
} satisfies Prisma.UserInclude;

export type UserWithProfileRecord = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;

export const safeUserSelect = {
  id: true,
  email: true,
  emailVerified: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUserRecord = Prisma.UserGetPayload<{
  select: typeof safeUserSelect;
}>;

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
  },

  findSafeById(id: string): Promise<SafeUserRecord | null> {
    return prisma.user.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  },

  findProfileById(id: string): Promise<UserWithProfileRecord | null> {
    return prisma.user.findUnique({
      where: { id },
      include: userProfileInclude,
    });
  },

  createUser(
    data: { email: string; passwordHash: string; role?: UserRole },
    tx: Prisma.TransactionClient = prisma
  ): Promise<SafeUserRecord> {
    return tx.user.create({
      data: {
        email: data.email.trim().toLowerCase(),
        passwordHash: data.passwordHash,
        emailVerified: false,
        role: data.role ?? 'USER',
      },
      select: safeUserSelect,
    });
  },

  markEmailVerified(
    userId: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<SafeUserRecord> {
    return tx.user.update({
      where: { id: userId },
      data: { emailVerified: true },
      select: safeUserSelect,
    });
  },

  updatePasswordHash(
    userId: string,
    passwordHash: string,
    tx: Prisma.TransactionClient = prisma
  ): Promise<SafeUserRecord> {
    return tx.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: safeUserSelect,
    });
  },
};
