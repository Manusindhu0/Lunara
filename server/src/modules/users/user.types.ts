import type { UserRole, VerificationStatus } from '@prisma/client';

export interface AuthCitizenSummaryDto {
  id: string;
  citizenId: string;
  username: string;
  displayName: string;
  districtId: string;
  department: string;
  profession: string;
  status: string;
  avatarUrl: string | null;
  suitColor: string;
}

export interface AuthInstagramSummaryDto {
  connected: boolean;
  provider?: string;
  username?: string;
  profilePictureUrl?: string | null;
  connectedAt?: string;
}

export interface AuthEligibilitySummaryDto {
  status: VerificationStatus;
  provider: string;
  verificationType: string;
  reason: string | null;
  verifiedAt: string | null;
  expiresAt: string | null;
}

export type CitizenshipStatus = 'NONE' | 'PENDING' | 'MANUAL_REVIEW' | 'ELIGIBLE' | 'CITIZEN' | 'SUSPENDED';

export interface SafeUserDto {
  id: string;
  email: string;
  emailVerified: boolean;
  role: UserRole;
  createdAt: string;
}

export interface UserProfileDto extends SafeUserDto {
  citizenshipStatus: CitizenshipStatus;
  citizen: AuthCitizenSummaryDto | null;
  instagram: AuthInstagramSummaryDto;
  eligibility: AuthEligibilitySummaryDto | null;
}
