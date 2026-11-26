import { NotFoundError } from '../../utils/errors';
import {
  userRepository,
  type SafeUserRecord,
  type UserWithProfileRecord,
} from './user.repository';
import type {
  AuthCitizenSummaryDto,
  AuthEligibilitySummaryDto,
  AuthInstagramSummaryDto,
  CitizenshipStatus,
  SafeUserDto,
  UserProfileDto,
} from './user.types';

export function toSafeUserDto(user: SafeUserRecord): SafeUserDto {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

function resolveCitizenshipStatus(
  citizen: UserWithProfileRecord['citizen'],
  eligibility: UserWithProfileRecord['eligibilityVerifications'][number] | undefined
): CitizenshipStatus {
  if (citizen) {
    return citizen.status === 'SUSPENDED' ? 'SUSPENDED' : 'CITIZEN';
  }
  if (!eligibility) {
    return 'NONE';
  }
  switch (eligibility.status) {
    case 'VERIFIED':
      return 'ELIGIBLE';
    case 'PENDING':
      return 'PENDING';
    case 'MANUAL_REVIEW':
      return 'MANUAL_REVIEW';
    default:
      return 'NONE';
  }
}

export function toUserProfileDto(record: UserWithProfileRecord): UserProfileDto {
  const citizen: AuthCitizenSummaryDto | null = record.citizen
    ? {
        id: record.citizen.id,
        citizenId: record.citizen.citizenId,
        username: record.citizen.username,
        displayName: record.citizen.displayName,
        districtId: record.citizen.districtId,
        department: record.citizen.department.slug,
        profession: record.citizen.profession,
        status: record.citizen.status,
        avatarUrl: record.citizen.avatarUrl,
        suitColor: record.citizen.suitColor,
      }
    : null;

  const instagram: AuthInstagramSummaryDto = record.instagramConnection
    ? {
        connected: true,
        provider: record.instagramConnection.provider,
        username: record.instagramConnection.username,
        profilePictureUrl: record.instagramConnection.profilePictureUrl,
        connectedAt: record.instagramConnection.connectedAt.toISOString(),
      }
    : {
        connected: false,
      };

  const latestEligibility = record.eligibilityVerifications[0];
  const eligibility: AuthEligibilitySummaryDto | null = latestEligibility
    ? {
        status: latestEligibility.status,
        provider: latestEligibility.provider,
        verificationType: latestEligibility.verificationType,
        reason: latestEligibility.reason,
        verifiedAt: latestEligibility.verifiedAt
          ? latestEligibility.verifiedAt.toISOString()
          : null,
        expiresAt: latestEligibility.expiresAt
          ? latestEligibility.expiresAt.toISOString()
          : null,
      }
    : null;

  return {
    id: record.id,
    email: record.email,
    emailVerified: record.emailVerified,
    role: record.role,
    createdAt: record.createdAt.toISOString(),
    citizenshipStatus: resolveCitizenshipStatus(record.citizen, latestEligibility),
    citizen,
    instagram,
    eligibility,
  };
}

export const userService = {
  toSafeUserDto,
  toUserProfileDto,

  async getUserByEmail(email: string) {
    return userRepository.findByEmail(email);
  },

  async getSafeUserById(userId: string): Promise<SafeUserDto | null> {
    const user = await userRepository.findSafeById(userId);
    return user ? toSafeUserDto(user) : null;
  },

  async getUserProfileById(userId: string): Promise<UserProfileDto | null> {
    const record = await userRepository.findProfileById(userId);
    return record ? toUserProfileDto(record) : null;
  },

  async getUserProfileOrThrow(userId: string): Promise<UserProfileDto> {
    const profile = await this.getUserProfileById(userId);
    if (!profile) {
      throw new NotFoundError('User account not found', 'USER_NOT_FOUND');
    }
    return profile;
  },
};
