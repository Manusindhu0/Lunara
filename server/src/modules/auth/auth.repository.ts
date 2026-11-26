import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';

export const authRepository = {
  createEmailVerificationToken(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    tx: Prisma.TransactionClient = prisma
  ) {
    return tx.emailVerificationToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  },

  invalidateUnusedEmailVerificationTokens(
    userId: string,
    usedAt: Date,
    tx: Prisma.TransactionClient = prisma
  ) {
    return tx.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: { usedAt },
    });
  },

  findEmailVerificationTokenByHash(tokenHash: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });
  },

  async consumeEmailVerificationToken(
    id: string,
    usedAt: Date,
    tx: Prisma.TransactionClient = prisma
  ): Promise<number> {
    const result = await tx.emailVerificationToken.updateMany({
      where: {
        id,
        usedAt: null,
      },
      data: { usedAt },
    });
    return result.count;
  },

  createSession(
    data: {
      userId: string;
      tokenHash: string;
      expiresAt: Date;
      userAgent: string | null;
      ipAddress: string | null;
    },
    tx: Prisma.TransactionClient = prisma
  ) {
    return tx.session.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
      },
    });
  },

  revokeSessionById(sessionId: string, revokedAt: Date) {
    return prisma.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: { revokedAt },
    });
  },

  revokeAllActiveSessionsForUser(
    userId: string,
    revokedAt: Date,
    tx: Prisma.TransactionClient = prisma
  ) {
    return tx.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: { revokedAt },
    });
  },

  invalidateUnusedPasswordResetTokens(
    userId: string,
    usedAt: Date,
    tx: Prisma.TransactionClient = prisma
  ) {
    return tx.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: { usedAt },
    });
  },

  createPasswordResetToken(
    data: { userId: string; tokenHash: string; expiresAt: Date },
    tx: Prisma.TransactionClient = prisma
  ) {
    return tx.passwordResetToken.create({
      data: {
        userId: data.userId,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  },

  findPasswordResetTokenByHash(tokenHash: string) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  },

  async consumePasswordResetToken(
    id: string,
    usedAt: Date,
    tx: Prisma.TransactionClient = prisma
  ): Promise<number> {
    const result = await tx.passwordResetToken.updateMany({
      where: {
        id,
        usedAt: null,
      },
      data: { usedAt },
    });
    return result.count;
  },
};
