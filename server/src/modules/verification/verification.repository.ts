import type { EligibilityVerification, Prisma, VerificationStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';

export class VerificationRepository {
  async findUserById(userId: string): Promise<{ id: string } | null> {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
  }

  async findInstagramConnectionByUserId(userId: string): Promise<{
    id: string;
    username: string;
    tokenExpiresAt: Date | null;
  } | null> {
    return prisma.instagramConnection.findUnique({
      where: { userId },
      select: {
        id: true,
        username: true,
        tokenExpiresAt: true,
      },
    });
  }

  async createVerification(data: {
    userId: string;
    provider: string;
    verificationType: string;
    status: VerificationStatus;
    result?: Prisma.InputJsonValue;
    reason?: string | null;
    verifiedAt?: Date | null;
    expiresAt?: Date | null;
  }): Promise<EligibilityVerification> {
    return prisma.eligibilityVerification.create({ data });
  }

  async findLatestByUserId(userId: string): Promise<EligibilityVerification | null> {
    return prisma.eligibilityVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const verificationRepository = new VerificationRepository();
