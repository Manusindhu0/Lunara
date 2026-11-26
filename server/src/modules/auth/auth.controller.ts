import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env';
import { issueCsrfCookie } from '../../middleware';
import { authService } from './auth.service';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.validators';

function getSessionCookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.cookieSecure,
    path: '/',
    ...(maxAge !== undefined ? { maxAge } : {}),
  };
}

export const authController = {
  csrf(_req: Request, res: Response): void {
    const csrfToken = issueCsrfCookie(res);
    res.setHeader('X-CSRF-Token', csrfToken);
    res.status(200).json({ csrfToken });
  },

  async register(req: Request, res: Response): Promise<void> {
    const body = registerSchema.parse(req.body);
    const result = await authService.register({
      email: body.email,
      password: body.password,
    });

    res.status(201).json(result);
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const body = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail({
      token: body.token,
    });

    res.status(200).json(result);
  },

  async resendVerification(req: Request, res: Response): Promise<void> {
    const body = resendVerificationSchema.parse(req.body ?? {});
    const result = await authService.resendVerification({
      email: body.email,
      authenticatedUserId: req.user?.id,
    });

    res.status(200).json(result);
  },

  async login(req: Request, res: Response): Promise<void> {
    const body = loginSchema.parse(req.body);
    const userAgentHeader = req.get('user-agent');
    const result = await authService.login({
      email: body.email,
      password: body.password,
      userAgent: userAgentHeader ? userAgentHeader.slice(0, 512) : null,
      ipAddress: req.ip ?? null,
    });

    res.cookie(
      env.SESSION_COOKIE_NAME,
      result.rawSessionToken,
      getSessionCookieOptions(result.maxAgeMs)
    );
    const csrfToken = issueCsrfCookie(res);
    res.setHeader('X-CSRF-Token', csrfToken);

    res.status(200).json({
      user: result.user,
      csrfToken,
    });
  },

  async logout(req: Request, res: Response): Promise<void> {
    const result = await authService.logout(req.session?.id);
    res.clearCookie(env.SESSION_COOKIE_NAME, getSessionCookieOptions());
    res.status(200).json(result);
  },

  async me(req: Request, res: Response): Promise<void> {
    const profile = await authService.getMe(req.user!.id);
    res.status(200).json({
      user: profile,
      citizenshipStatus: profile.citizenshipStatus,
      citizen: profile.citizen,
      instagram: profile.instagram,
      eligibility: profile.eligibility,
    });
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const body = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword({
      email: body.email,
    });

    res.status(200).json(result);
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const body = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword({
      token: body.token,
      password: body.password,
    });

    res.clearCookie(env.SESSION_COOKIE_NAME, getSessionCookieOptions());
    res.status(200).json(result);
  },
};
