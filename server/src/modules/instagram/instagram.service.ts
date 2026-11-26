import { Prisma } from '@prisma/client';
import { env } from '../../config/env';
import { encryptSecret, generateRandomToken, sha256 } from '../../utils/crypto';
import { instagramRepository } from './instagram.repository';
import {
  type InstagramConnectResponseDTO,
  type InstagramStatusDTO,
  toInstagramConnectionDTO,
} from './instagram.schemas';

const INSTAGRAM_OAUTH_AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize';
const INSTAGRAM_OAUTH_TOKEN_URL = 'https://api.instagram.com/oauth/access_token';
const INSTAGRAM_GRAPH_ME_URL = 'https://graph.instagram.com/me';
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const UNAVAILABLE_REASON =
  'Instagram OAuth requires Meta App credentials (INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, INSTAGRAM_REDIRECT_URI).';

interface InstagramTokenExchangeResponse {
  access_token?: string;
  user_id?: string | number;
  expires_in?: number;
}

interface InstagramProfileResponse {
  id?: string | number;
  user_id?: string | number;
  username?: string;
  profile_picture_url?: string;
}

export class InstagramService {
  buildFrontendRedirect(params: Record<string, string>): string {
    const url = new URL('/citizenship', env.CLIENT_URL);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  async initiateConnect(userId: string): Promise<InstagramConnectResponseDTO> {
    if (!env.isInstagramConfigured) {
      return {
        configured: false,
        status: 'UNAVAILABLE',
        authorizationUrl: null,
        reason: UNAVAILABLE_REASON,
      };
    }

    const rawState = generateRandomToken(32);
    const stateHash = sha256(rawState);
    const expiresAt = new Date(Date.now() + OAUTH_STATE_TTL_MS);

    await instagramRepository.createOAuthState({
      stateHash,
      userId,
      expiresAt,
    });

    const authorizeUrl = new URL(INSTAGRAM_OAUTH_AUTHORIZE_URL);
    authorizeUrl.searchParams.set('client_id', env.INSTAGRAM_CLIENT_ID!);
    authorizeUrl.searchParams.set('redirect_uri', env.INSTAGRAM_REDIRECT_URI!);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', 'instagram_business_basic');
    authorizeUrl.searchParams.set('state', rawState);

    return {
      configured: true,
      status: 'READY',
      authorizationUrl: authorizeUrl.toString(),
    };
  }

  async handleCallback(input: {
    code?: string;
    state?: string;
    error?: string;
    authenticatedUserId?: string;
  }): Promise<string> {
    if (input.error) {
      return this.buildFrontendRedirect({ ig_error: input.error });
    }

    if (!input.code || !input.state) {
      return this.buildFrontendRedirect({ ig_error: 'missing_code' });
    }

    if (!env.isInstagramConfigured) {
      return this.buildFrontendRedirect({ ig_error: 'not_configured' });
    }

    const now = new Date();
    const stateHash = sha256(input.state);
    const oauthState = await instagramRepository.findOAuthStateByHash(stateHash);

    if (!oauthState) {
      return this.buildFrontendRedirect({ ig_error: 'invalid_state' });
    }

    if (oauthState.usedAt !== null) {
      return this.buildFrontendRedirect({ ig_error: 'state_already_used' });
    }

    if (oauthState.expiresAt <= now) {
      return this.buildFrontendRedirect({ ig_error: 'state_expired' });
    }

    if (input.authenticatedUserId && oauthState.userId !== input.authenticatedUserId) {
      return this.buildFrontendRedirect({ ig_error: 'state_mismatch' });
    }

    const consumed = await instagramRepository.consumeOAuthState(oauthState.id, now);
    if (!consumed) {
      return this.buildFrontendRedirect({ ig_error: 'invalid_state' });
    }

    try {
      const tokenPayload = await this.exchangeCodeForToken(input.code);
      if (!tokenPayload.access_token) {
        return this.buildFrontendRedirect({ ig_error: 'token_exchange_failed' });
      }

      const profile = await this.fetchInstagramProfile(tokenPayload.access_token);
      const rawId = profile.id ?? profile.user_id ?? tokenPayload.user_id;
      const providerUserId = rawId !== undefined ? String(rawId).trim() : '';
      const username = typeof profile.username === 'string' ? profile.username.trim() : '';

      if (!providerUserId || !username) {
        return this.buildFrontendRedirect({ ig_error: 'profile_fetch_failed' });
      }

      const existingIdentity = await instagramRepository.findConnectionByProviderIdentity(
        'instagram',
        providerUserId
      );
      if (existingIdentity && existingIdentity.userId !== oauthState.userId) {
        return this.buildFrontendRedirect({ ig_error: 'already_linked' });
      }

      const accessTokenEncrypted = encryptSecret(tokenPayload.access_token);
      const tokenExpiresAt =
        typeof tokenPayload.expires_in === 'number' && tokenPayload.expires_in > 0
          ? new Date(Date.now() + tokenPayload.expires_in * 1000)
          : null;

      await instagramRepository.upsertConnection({
        userId: oauthState.userId,
        provider: 'instagram',
        providerUserId,
        username,
        profilePictureUrl:
          typeof profile.profile_picture_url === 'string' ? profile.profile_picture_url : null,
        accessTokenEncrypted,
        tokenExpiresAt,
      });

      return this.buildFrontendRedirect({ ig_connected: '1' });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return this.buildFrontendRedirect({ ig_error: 'already_linked' });
      }
      return this.buildFrontendRedirect({ ig_error: 'oauth_exchange_failed' });
    }
  }

  async getStatus(userId: string): Promise<InstagramStatusDTO> {
    const connection = await instagramRepository.findConnectionByUserId(userId);
    return {
      configured: env.isInstagramConfigured,
      connected: Boolean(connection),
      connection: connection ? toInstagramConnectionDTO(connection) : null,
    };
  }

  async disconnect(userId: string): Promise<{ disconnected: boolean }> {
    const deleted = await instagramRepository.deleteConnectionByUserId(userId);
    return { disconnected: deleted };
  }

  private async exchangeCodeForToken(code: string): Promise<InstagramTokenExchangeResponse> {
    const body = new URLSearchParams({
      client_id: env.INSTAGRAM_CLIENT_ID!,
      client_secret: env.INSTAGRAM_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: env.INSTAGRAM_REDIRECT_URI!,
      code,
    });

    const response = await fetch(INSTAGRAM_OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Instagram token exchange failed with status ${response.status}`);
    }

    return (await response.json()) as InstagramTokenExchangeResponse;
  }

  private async fetchInstagramProfile(accessToken: string): Promise<InstagramProfileResponse> {
    const url = new URL(INSTAGRAM_GRAPH_ME_URL);
    url.searchParams.set('fields', 'id,username,profile_picture_url');
    url.searchParams.set('access_token', accessToken);

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Instagram profile fetch failed with status ${response.status}`);
    }

    return (await response.json()) as InstagramProfileResponse;
  }
}

export const instagramService = new InstagramService();
