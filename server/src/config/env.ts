import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    SESSION_COOKIE_NAME: z.string().min(1).default('lunar_session'),
    CSRF_COOKIE_NAME: z.string().min(1).default('lunar_csrf'),
    SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(7),
    COOKIE_SECURE: z.enum(['true', 'false']).optional(),
    ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY must be a 64-character hex string (32 bytes)'),
    RESEND_API_KEY: z
      .string()
      .optional()
      .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
    EMAIL_FROM: z.string().min(1).default('LUNAR Colony <noreply@lunar.local>'),
    INSTAGRAM_CLIENT_ID: z
      .string()
      .optional()
      .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
    INSTAGRAM_CLIENT_SECRET: z
      .string()
      .optional()
      .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
    INSTAGRAM_REDIRECT_URI: z
      .string()
      .optional()
      .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
    DEV_MOCK_VERIFICATION: z
      .enum(['true', 'false'])
      .optional()
      .default('false')
      .transform((v) => v === 'true'),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && data.DEV_MOCK_VERIFICATION) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DEV_MOCK_VERIFICATION'],
        message: 'DEV_MOCK_VERIFICATION cannot be true when NODE_ENV=production',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid server environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid server environment configuration');
}

const raw = parsed.data;

const allowedOrigins = Array.from(
  new Set([
    raw.CLIENT_URL,
    ...raw.CORS_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  ])
);

export const env = {
  ...raw,
  isProduction: raw.NODE_ENV === 'production',
  isDevelopment: raw.NODE_ENV === 'development',
  isTest: raw.NODE_ENV === 'test',
  cookieSecure:
    raw.COOKIE_SECURE !== undefined ? raw.COOKIE_SECURE === 'true' : raw.NODE_ENV === 'production',
  allowedOrigins,
  isEmailConfigured: Boolean(raw.RESEND_API_KEY),
  isInstagramConfigured: Boolean(
    raw.INSTAGRAM_CLIENT_ID && raw.INSTAGRAM_CLIENT_SECRET && raw.INSTAGRAM_REDIRECT_URI
  ),
} as const;

export type AppEnv = typeof env;
