import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { emailService } from '../../services/email.service';
import { generateRandomToken, sha256 } from '../../utils/crypto';
import { BadRequestError, ConflictError, UnauthorizedError } from '../../utils/errors';
import { toSafeUserDto, userRepository, userService, type UserProfileDto } from '../users';
import { authRepository } from './auth.repository';

const BCRYPT_COST = 12;
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
// Precomputed valid bcrypt hash used to equalize timing when login email is not found.
const DUMMY_BCRYPT_HASH = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';

export interface RegisterResult {
  user: UserProfileDto;
  message: string;
  verificationRequired: boolean;
  emailDeliveryMode?: 'resend' | 'console' | 'disabled';
  devVerificationUrl?: string;
}

export interface VerifyEmailResult {
  user: UserProfileDto;
  message: string;
}

export interface LoginResult {
  user: UserProfileDto;
  rawSessionToken: string;
  maxAgeMs: number;
}

export const authService = {
  async register(input: { email: string; password: string }): Promise<RegisterResult> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existing = await userRepository.findByEmail(normalizedEmail);
    if (existing) {
      throw new ConflictError('An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
    const rawToken = generateRandomToken(32);
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

    let createdUser;
    try {
      createdUser = await prisma.$transaction(async (tx) => {
        const user = await userRepository.createUser(
          {
            email: normalizedEmail,
            passwordHash,
            role: 'USER',
          },
          tx
        );

        await authRepository.createEmailVerificationToken(
          {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
          tx
        );

        return user;
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictError(
          'An account with this email already exists',
          'EMAIL_ALREADY_EXISTS'
        );
      }
      throw err;
    }

    const emailResult = await emailService.sendVerificationEmail(createdUser.email, rawToken);
    const isDevConsoleFallback =
      env.NODE_ENV === 'development' && !env.isProduction && emailResult.mode === 'console';

    const userDto: UserProfileDto = {
      ...toSafeUserDto(createdUser),
      citizenshipStatus: 'NONE',
      citizen: null,
      instagram: { connected: false },
      eligibility: null,
    };

    return {
      user: userDto,
      message: isDevConsoleFallback
        ? 'Account registered in Dev Console Mode (no email provider configured). Use the local verification link below or configure RESEND_API_KEY in server/.env for real email delivery.'
        : 'Account registered. Check your inbox for the verification link.',
      verificationRequired: true,
      emailDeliveryMode: emailResult.mode,
      ...(isDevConsoleFallback
        ? {
            devVerificationUrl: `/verify-email?token=${encodeURIComponent(rawToken)}`,
          }
        : {}),
    };
  },

  async verifyEmail(input: { token: string }): Promise<VerifyEmailResult> {
    const tokenHash = sha256(input.token);
    const record = await authRepository.findEmailVerificationTokenByHash(tokenHash);

    if (!record) {
      throw new BadRequestError('Invalid verification token.', 'INVALID_VERIFICATION_TOKEN');
    }

    if (record.usedAt !== null) {
      throw new BadRequestError(
        'This verification link has already been used.',
        'TOKEN_ALREADY_USED'
      );
    }

    const now = new Date();
    if (record.expiresAt <= now) {
      throw new BadRequestError(
        'This verification link has expired. Please request a new one.',
        'TOKEN_EXPIRED'
      );
    }

    await prisma.$transaction(async (tx) => {
      const consumedCount = await authRepository.consumeEmailVerificationToken(record.id, now, tx);
      if (consumedCount === 0) {
        throw new BadRequestError(
          'This verification link has already been used.',
          'TOKEN_ALREADY_USED'
        );
      }

      await userRepository.markEmailVerified(record.userId, tx);
      await authRepository.invalidateUnusedEmailVerificationTokens(record.userId, now, tx);
    });

    const userProfile = await userService.getUserProfileOrThrow(record.userId);

    return {
      user: userProfile,
      message: 'Email address verified. Lunar uplink confirmed.',
    };
  },

  async resendVerification(input: {
    email?: string;
    authenticatedUserId?: string;
  }): Promise<{ message: string }> {
    const genericMessage =
      'If an unverified account matches that email, a verification link has been sent.';

    if (!input.authenticatedUserId && !input.email) {
      throw new BadRequestError('Email address is required', 'EMAIL_REQUIRED');
    }

    const targetUser = input.authenticatedUserId
      ? await userRepository.findSafeById(input.authenticatedUserId)
      : await userRepository.findByEmail(input.email!);

    // If an authenticated user explicitly submitted a different email, avoid mutating another user
    // and return the generic non-enumerating response unless it's their own account.
    if (
      input.authenticatedUserId &&
      targetUser &&
      input.email &&
      targetUser.email !== input.email.trim().toLowerCase()
    ) {
      const otherUser = await userRepository.findByEmail(input.email);
      if (!otherUser || otherUser.emailVerified) {
        return { message: genericMessage };
      }
      const rawToken = generateRandomToken(32);
      const tokenHash = sha256(rawToken);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MS);

      await prisma.$transaction(async (tx) => {
        await authRepository.invalidateUnusedEmailVerificationTokens(otherUser.id, now, tx);
        await authRepository.createEmailVerificationToken(
          { userId: otherUser.id, tokenHash, expiresAt },
          tx
        );
      });

      await emailService.sendVerificationEmail(otherUser.email, rawToken);
      return { message: genericMessage };
    }

    if (!targetUser) {
      return { message: genericMessage };
    }

    if (targetUser.emailVerified) {
      if (input.authenticatedUserId === targetUser.id) {
        return { message: 'Your email address is already verified.' };
      }
      return { message: genericMessage };
    }

    const rawToken = generateRandomToken(32);
    const tokenHash = sha256(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MS);

    await prisma.$transaction(async (tx) => {
      await authRepository.invalidateUnusedEmailVerificationTokens(targetUser.id, now, tx);
      await authRepository.createEmailVerificationToken(
        {
          userId: targetUser.id,
          tokenHash,
          expiresAt,
        },
        tx
      );
    });

    await emailService.sendVerificationEmail(targetUser.email, rawToken);

    return { message: genericMessage };
  },

  async login(input: {
    email: string;
    password: string;
    userAgent: string | null;
    ipAddress: string | null;
  }): Promise<LoginResult> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      await bcrypt.compare(input.password, DUMMY_BCRYPT_HASH);
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const rawSessionToken = generateRandomToken(32);
    const tokenHash = sha256(rawSessionToken);
    const maxAgeMs = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + maxAgeMs);

    await authRepository.createSession({
      userId: user.id,
      tokenHash,
      expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    const userProfile = await userService.getUserProfileOrThrow(user.id);

    return {
      user: userProfile,
      rawSessionToken,
      maxAgeMs,
    };
  },

  async logout(sessionId?: string): Promise<{ message: string }> {
    if (sessionId) {
      await authRepository.revokeSessionById(sessionId, new Date());
    }
    return { message: 'Signed out successfully.' };
  },

  async getMe(userId: string): Promise<UserProfileDto> {
    return userService.getUserProfileOrThrow(userId);
  },

  async forgotPassword(input: { email: string }): Promise<{ message: string }> {
    const genericMessage =
      'If an account matches that email, recovery instructions have been dispatched.';
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      return { message: genericMessage };
    }

    const rawToken = generateRandomToken(32);
    const tokenHash = sha256(rawToken);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PASSWORD_RESET_TTL_MS);

    await prisma.$transaction(async (tx) => {
      await authRepository.invalidateUnusedPasswordResetTokens(user.id, now, tx);
      await authRepository.createPasswordResetToken(
        {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
        tx
      );
    });

    await emailService.sendPasswordResetEmail(user.email, rawToken);

    return { message: genericMessage };
  },

  async resetPassword(input: { token: string; password: string }): Promise<{ message: string }> {
    const tokenHash = sha256(input.token);
    const record = await authRepository.findPasswordResetTokenByHash(tokenHash);

    if (!record) {
      throw new BadRequestError('Invalid password reset token.', 'INVALID_RESET_TOKEN');
    }

    if (record.usedAt !== null) {
      throw new BadRequestError(
        'This password reset link has already been used.',
        'TOKEN_ALREADY_USED'
      );
    }

    const now = new Date();
    if (record.expiresAt <= now) {
      throw new BadRequestError(
        'This password reset link has expired. Please request a new one.',
        'TOKEN_EXPIRED'
      );
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    await prisma.$transaction(async (tx) => {
      const consumedCount = await authRepository.consumePasswordResetToken(record.id, now, tx);
      if (consumedCount === 0) {
        throw new BadRequestError(
          'This password reset link has already been used.',
          'TOKEN_ALREADY_USED'
        );
      }

      await userRepository.updatePasswordHash(record.userId, passwordHash, tx);
      await authRepository.invalidateUnusedPasswordResetTokens(record.userId, now, tx);
      await authRepository.revokeAllActiveSessionsForUser(record.userId, now, tx);
    });

    return {
      message: 'Security credentials updated. You may now sign in.',
    };
  },
};
