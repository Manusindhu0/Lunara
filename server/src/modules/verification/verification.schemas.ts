import type { EligibilityVerification, VerificationStatus } from '@prisma/client';
import { z } from 'zod';

export const adminReviewSchema = z.object({
  userId: z.string().uuid('Valid userId UUID is required'),
  status: z.enum(['VERIFIED', 'FAILED']),
  reason: z.string().trim().min(3, 'Review reason is required').max(500),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export type AdminReviewInput = z.infer<typeof adminReviewSchema>;

export interface EligibilityResult {
  status: VerificationStatus;
  verificationMethod: string;
  reason: string;
  verifiedAt: string | null;
  expiresAt: string | null;
  provider: string;
  isMock: boolean;
}

export interface EligibilityVerificationDTO extends EligibilityResult {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationStatusDTO {
  status: VerificationStatus;
  verification: EligibilityVerificationDTO | null;
  mockModeEnabled: boolean;
}

export function resolveEffectiveVerificationStatus(
  record: Pick<EligibilityVerification, 'status' | 'expiresAt'>
): VerificationStatus {
  if (
    record.status === 'VERIFIED' &&
    record.expiresAt !== null &&
    record.expiresAt.getTime() <= Date.now()
  ) {
    return 'EXPIRED';
  }
  return record.status;
}

export function toEligibilityVerificationDTO(
  record: EligibilityVerification
): EligibilityVerificationDTO {
  const effectiveStatus = resolveEffectiveVerificationStatus(record);
  const rawResult =
    record.result && typeof record.result === 'object' && !Array.isArray(record.result)
      ? (record.result as Record<string, unknown>)
      : null;

  const isMock =
    typeof rawResult?.isMock === 'boolean'
      ? rawResult.isMock
      : record.provider === 'mock_dev' || record.verificationType === 'MOCK_VERIFICATION';

  return {
    id: record.id,
    status: effectiveStatus,
    verificationMethod: record.verificationType,
    reason: record.reason ?? '',
    verifiedAt: record.verifiedAt ? record.verifiedAt.toISOString() : null,
    expiresAt: record.expiresAt ? record.expiresAt.toISOString() : null,
    provider: record.provider,
    isMock,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
