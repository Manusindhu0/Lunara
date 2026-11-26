import type { InstagramConnection } from '@prisma/client';
import { z } from 'zod';

export const instagramConnectQuerySchema = z.object({
  redirect: z.enum(['0', '1', 'true', 'false']).optional(),
});

export const instagramCallbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
  error_reason: z.string().optional(),
  error_description: z.string().optional(),
});

export interface InstagramConnectionDTO {
  username: string;
  profilePictureUrl: string | null;
  connectedAt: string;
  tokenExpiresAt: string | null;
  isExpired: boolean;
}

export interface InstagramStatusDTO {
  configured: boolean;
  connected: boolean;
  connection: InstagramConnectionDTO | null;
}

export interface InstagramConnectResponseDTO {
  configured: boolean;
  status?: 'READY' | 'UNAVAILABLE';
  authorizationUrl: string | null;
  reason?: string;
}

export function toInstagramConnectionDTO(
  connection: Pick<
    InstagramConnection,
    'username' | 'profilePictureUrl' | 'connectedAt' | 'tokenExpiresAt'
  >
): InstagramConnectionDTO {
  const now = new Date();
  return {
    username: connection.username,
    profilePictureUrl: connection.profilePictureUrl,
    connectedAt: connection.connectedAt.toISOString(),
    tokenExpiresAt: connection.tokenExpiresAt ? connection.tokenExpiresAt.toISOString() : null,
    isExpired: Boolean(connection.tokenExpiresAt && connection.tokenExpiresAt <= now),
  };
}
