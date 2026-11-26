import { env } from '../../config/env';
import { ForbiddenError } from '../../utils/errors';
import { verificationRepository } from './verification.repository';
import type { EligibilityResult } from './verification.schemas';

export interface EligibilityProvider {
  checkEligibility(userId: string): Promise<EligibilityResult>;
}

const DEFAULT_VERIFICATION_TTL_DAYS = 30;

export class OfficialInstagramEligibilityProvider implements EligibilityProvider {
  async checkEligibility(userId: string): Promise<EligibilityResult> {
    const igConnection = await verificationRepository.findInstagramConnectionByUserId(userId);

    if (!igConnection) {
      return {
        status: 'FAILED',
        verificationMethod: 'OFFICIAL_INSTAGRAM_CHECK',
        reason: 'Connect an Instagram account first.',
        verifiedAt: null,
        expiresAt: null,
        provider: 'instagram_official',
        isMock: false,
      };
    }

    // Never fabricate a follower check when Meta API does not expose follow verification.
    return {
      status: 'UNAVAILABLE',
      verificationMethod: 'OFFICIAL_API_LIMITATION',
      reason:
        'Instagram APIs available to third-party apps do not provide a general endpoint to verify whether a user follows @lunar. Official verification is currently unavailable without approved Meta partner permissions or manual review.',
      verifiedAt: null,
      expiresAt: null,
      provider: 'instagram_official',
      isMock: false,
    };
  }
}

export class DevMockEligibilityProvider implements EligibilityProvider {
  async checkEligibility(_userId: string): Promise<EligibilityResult> {
    if (env.isProduction || env.NODE_ENV === 'production' || !env.DEV_MOCK_VERIFICATION) {
      throw new ForbiddenError(
        'DevMockEligibilityProvider cannot be invoked outside development/test with DEV_MOCK_VERIFICATION=true',
        'MOCK_VERIFICATION_DISABLED'
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + DEFAULT_VERIFICATION_TTL_DAYS * 24 * 60 * 60 * 1000);

    return {
      status: 'VERIFIED',
      verificationMethod: 'MOCK_VERIFICATION',
      reason:
        'MOCK VERIFICATION (Development Mode Only): Simulated citizenship eligibility approved for local testing.',
      verifiedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      provider: 'mock_dev',
      isMock: true,
    };
  }
}
