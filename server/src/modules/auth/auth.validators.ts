import { z } from 'zod';

export const emailSchema = z
  .string({ required_error: 'Email address is required' })
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address')
  .max(255, 'Email address is too long');

export const strongPasswordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => data.confirmPassword === undefined || data.password === data.confirmPassword,
    {
      message: 'Password confirmation does not match',
      path: ['confirmPassword'],
    }
  );

export const verifyEmailSchema = z.object({
  token: z
    .string({ required_error: 'Verification token is required' })
    .trim()
    .min(1, 'Verification token is required'),
});

export const resendVerificationSchema = z.object({
  email: emailSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .max(128, 'Password must not exceed 128 characters'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z
      .string({ required_error: 'Reset token is required' })
      .trim()
      .min(1, 'Reset token is required'),
    password: strongPasswordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => data.confirmPassword === undefined || data.password === data.confirmPassword,
    {
      message: 'Password confirmation does not match',
      path: ['confirmPassword'],
    }
  );

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
