import { env } from '../../config/env';
import { NotFoundError } from '../../utils/errors';
import {
  DevMockEligibilityProvider,
  type EligibilityProvider,
  OfficialInstagramEligibilityProvider,
} from './verification.providers';
import { verificationRepository } from './verification.repository';
import {
  type AdminReviewInput,
  type EligibilityVerificationDTO,
  type VerificationStatusDTO,
  toEligibilityVerificationDTO,
} from './verification.schemas';

const DEFAULT_ADMIN_REVIEW_TTL_DAYS = 30;

export function isMockVerificationEnabled(): boolean {
  return env.NODE_ENV !== 'production' && env.DEV_MOCK_VERIFICATION === true;
}

export class VerificationService {
  private readonly officialProvider = new OfficialInstagramEligibilityProvider();
  private readonly devMockProvider = new DevMockEligibilityProvider();

  private selectProvider(): EligibilityProvider {
    if (isMockVerificationEnabled()) {
      return this.devMockProvider;
    }
    return this.officialProvider;
  }

  async checkEligibility(
    userId: string
  ): Promise<EligibilityVerificationDTO & { mockModeEnabled: boolean }> {
    const provider = this.selectProvider();
    const result = await provider.checkEligibility(userId);

    const record = await verificationRepository.createVerification({
      userId,
      provider: result.provider,
      verificationType: result.verificationMethod,
      status: result.status,
      reason: result.reason,
      verifiedAt: result.verifiedAt ? new Date(result.verifiedAt) : null,
      expiresAt: result.expiresAt ? new Date(result.expiresAt) : null,
      result: {
        verificationMethod: result.verificationMethod,
        provider: result.provider,
        isMock: result.isMock,
      },
    });

    return {
      ...toEligibilityVerificationDTO(record),
      mockModeEnabled: isMockVerificationEnabled(),
    };
  }

  async getStatus(userId: string): Promise<VerificationStatusDTO> {
    const latest = await verificationRepository.findLatestByUserId(userId);
    const verification = latest ? toEligibilityVerificationDTO(latest) : null;

    return {
      status: verification ? verification.status : 'NOT_STARTED',
      verification,
      mockModeEnabled: isMockVerificationEnabled(),
    };
  }

  async adminReview(
    adminUserId: string,
    input: AdminReviewInput
  ): Promise<EligibilityVerificationDTO> {
    const targetUser = await verificationRepository.findUserById(input.userId);
    if (!targetUser) {
      throw new NotFoundError('Target user not found', 'USER_NOT_FOUND');
    }

    const now = new Date();
    const ttlDays = input.expiresInDays ?? DEFAULT_ADMIN_REVIEW_TTL_DAYS;
    const verifiedAt = input.status === 'VERIFIED' ? now : null;
    const expiresAt =
      input.status === 'VERIFIED'
        ? new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000)
        : null;

    const record = await verificationRepository.createVerification({
      userId: input.userId,
      provider: 'admin_manual',
      verificationType: 'ADMIN_MANUAL_REVIEW',
      status: input.status,
      reason: input.reason,
      verifiedAt,
      expiresAt,
      result: {
        reviewedByAdminId: adminUserId,
        reviewedAt: now.toISOString(),
        isMock: false,
      },
    });

    return toEligibilityVerificationDTO(record);
  }
}

export const verificationService = new VerificationService();
