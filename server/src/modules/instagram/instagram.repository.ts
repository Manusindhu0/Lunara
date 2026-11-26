import type { InstagramConnection, InstagramOAuthState } from '@prisma/client';
import { prisma } from '../../config/prisma';

export type SafeInstagramConnectionRecord = Pick<
  InstagramConnection,
  'id' | 'userId' | 'provider' | 'providerUserId' | 'username' | 'profilePictureUrl' | 'tokenExpiresAt' | 'connectedAt' | 'updatedAt'
>;

export class InstagramRepository {
  async createOAuthState(data: {
    stateHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<InstagramOAuthState> {
    return prisma.instagramOAuthState.create({ data });
  }

  async findOAuthStateByHash(stateHash: string): Promise<InstagramOAuthState | null> {
    return prisma.instagramOAuthState.findUnique({
      where: { stateHash },
    });
  }

  async consumeOAuthState(id: string, now: Date): Promise<boolean> {
    const result = await prisma.instagramOAuthState.updateMany({
      where: {
        id,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });
    return result.count === 1;
  }

  async findConnectionByUserId(userId: string): Promise<SafeInstagramConnectionRecord | null> {
    return prisma.instagramConnection.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        provider: true,
        providerUserId: true,
        username: true,
        profilePictureUrl: true,
        tokenExpiresAt: true,
        connectedAt: true,
        updatedAt: true,
      },
    });
  }

  async findConnectionByProviderIdentity(
    provider: string,
    providerUserId: string
  ): Promise<Pick<InstagramConnection, 'id' | 'userId'> | null> {
    return prisma.instagramConnection.findUnique({
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    });
  }

  async upsertConnection(data: {
    userId: string;
    provider: string;
    providerUserId: string;
    username: string;
    profilePictureUrl: string | null;
    accessTokenEncrypted: string;
    tokenExpiresAt: Date | null;
  }): Promise<SafeInstagramConnectionRecord> {
    return prisma.instagramConnection.upsert({
      where: { userId: data.userId },
      update: {
        provider: data.provider,
        providerUserId: data.providerUserId,
        username: data.username,
        profilePictureUrl: data.profilePictureUrl,
        accessTokenEncrypted: data.accessTokenEncrypted,
        tokenExpiresAt: data.tokenExpiresAt,
      },
      create: data,
      select: {
        id: true,
        userId: true,
        provider: true,
        providerUserId: true,
        username: true,
        profilePictureUrl: true,
        tokenExpiresAt: true,
        connectedAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteConnectionByUserId(userId: string): Promise<boolean> {
    const result = await prisma.instagramConnection.deleteMany({
      where: { userId },
    });
    return result.count > 0;
  }
}

export const instagramRepository = new InstagramRepository();
