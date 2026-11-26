import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { env } from '../../../config/env';
import { prisma } from '../../../config/prisma';
import {
  csrfMiddleware,
  ensureCsrfCookie,
  errorHandler,
  notFoundHandler,
} from '../../../middleware';
import { emailService } from '../../../services/email.service';
import { sha256 } from '../../../utils/crypto';
import { authRouter } from '../auth.routes';

function createAuthTestApp() {
  const testApp = express();
  testApp.use(express.json());
  testApp.use(cookieParser());
  testApp.use(ensureCsrfCookie);
  testApp.use('/api', csrfMiddleware);
  testApp.use('/api/auth', authRouter);
  testApp.use('/api', notFoundHandler);
  testApp.use(errorHandler);
  return testApp;
}

describe('Auth & Users module integration', () => {
  const testApp = createAuthTestApp();
  const testEmail = `auth-test-${Date.now()}@lunar.local`;
  const testPassword = 'OrbitPassword123';
  const newPassword = 'NewOrbitPassword456';

  const capturedVerificationTokens: string[] = [];
  const capturedResetTokens: string[] = [];

  beforeAll(() => {
    vi.spyOn(emailService, 'sendVerificationEmail').mockImplementation(async (_to, token) => {
      capturedVerificationTokens.push(token);
      return { delivered: true, mode: 'console' };
    });
    vi.spyOn(emailService, 'sendPasswordResetEmail').mockImplementation(async (_to, token) => {
      capturedResetTokens.push(token);
      return { delivered: true, mode: 'console' };
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.$disconnect();
  });

  async function getCsrfAgent() {
    const agent = request.agent(testApp);
    const csrfRes = await agent.get('/api/auth/csrf');
    expect(csrfRes.status).toBe(200);
    expect(typeof csrfRes.body.csrfToken).toBe('string');
    return { agent, csrfToken: csrfRes.body.csrfToken as string };
  }

  it('GET /api/auth/csrf issues CSRF cookie and returns { csrfToken }', async () => {
    const res = await request(testApp).get('/api/auth/csrf');
    expect(res.status).toBe(200);
    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.body.csrfToken.length).toBeGreaterThan(16);
    const setCookie = res.headers['set-cookie'];
    expect(Array.isArray(setCookie)).toBe(true);
    expect(setCookie.some((c: string) => c.startsWith(`${env.CSRF_COOKIE_NAME}=`))).toBe(true);
  });

  it('POST /api/auth/register validates password strength and rejects weak passwords', async () => {
    const { agent, csrfToken } = await getCsrfAgent();
    const res = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: testEmail, password: 'weak' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/auth/register creates unverified user, hashes password, creates verification token, and rejects duplicates', async () => {
    const { agent, csrfToken } = await getCsrfAgent();
    const res = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({
        email: `  ${testEmail.toUpperCase()} `,
        password: testPassword,
        confirmPassword: testPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.verificationRequired).toBe(true);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.emailVerified).toBe(false);
    expect(res.body.user.role).toBe('USER');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.citizen).toBeNull();
    expect(capturedVerificationTokens).toHaveLength(1);

    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
      include: { citizen: true, emailVerificationTokens: true },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.citizen).toBeNull();
    expect(dbUser!.passwordHash).not.toBe(testPassword);
    expect(dbUser!.passwordHash.startsWith('$2')).toBe(true);
    expect(dbUser!.emailVerificationTokens).toHaveLength(1);
    expect(dbUser!.emailVerificationTokens[0].tokenHash).toBe(
      sha256(capturedVerificationTokens[0])
    );

    const dupRes = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: testEmail, password: testPassword });
    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('POST /api/auth/resend-verification invalidates prior token and returns generic 200', async () => {
    const { agent, csrfToken } = await getCsrfAgent();

    const unknownRes = await agent
      .post('/api/auth/resend-verification')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: 'nobody-here@lunar.local' });
    expect(unknownRes.status).toBe(200);

    const resendRes = await agent
      .post('/api/auth/resend-verification')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: testEmail });
    expect(resendRes.status).toBe(200);
    expect(resendRes.body.message).toBe(unknownRes.body.message);
    expect(capturedVerificationTokens).toHaveLength(2);

    // First token should now be invalidated (reused/invalidated)
    const oldVerifyRes = await agent
      .post('/api/auth/verify-email')
      .set('X-CSRF-Token', csrfToken)
      .send({ token: capturedVerificationTokens[0] });
    expect(oldVerifyRes.status).toBe(400);
    expect(oldVerifyRes.body.error.code).toBe('TOKEN_ALREADY_USED');
  });

  it('POST /api/auth/verify-email rejects invalid/expired tokens and verifies valid token transactionally', async () => {
    const { agent, csrfToken } = await getCsrfAgent();

    const invalidRes = await agent
      .post('/api/auth/verify-email')
      .set('X-CSRF-Token', csrfToken)
      .send({ token: 'nonexistent-token' });
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body.error.code).toBe('INVALID_VERIFICATION_TOKEN');

    // Create an expired token directly in DB to verify expiry branch
    const user = await prisma.user.findUniqueOrThrow({ where: { email: testEmail } });
    const expiredRaw = 'expired-verify-token-123';
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(expiredRaw),
        expiresAt: new Date(Date.now() - 60_000),
      },
    });
    const expiredRes = await agent
      .post('/api/auth/verify-email')
      .set('X-CSRF-Token', csrfToken)
      .send({ token: expiredRaw });
    expect(expiredRes.status).toBe(400);
    expect(expiredRes.body.error.code).toBe('TOKEN_EXPIRED');

    // Verify with latest valid token
    const validRes = await agent
      .post('/api/auth/verify-email')
      .set('X-CSRF-Token', csrfToken)
      .send({ token: capturedVerificationTokens[1] });
    expect(validRes.status).toBe(200);
    expect(validRes.body.user.emailVerified).toBe(true);

    // Reusing the same token fails with 400
    const reuseRes = await agent
      .post('/api/auth/verify-email')
      .set('X-CSRF-Token', csrfToken)
      .send({ token: capturedVerificationTokens[1] });
    expect(reuseRes.status).toBe(400);
    expect(reuseRes.body.error.code).toBe('TOKEN_ALREADY_USED');
  });

  it('POST /api/auth/login, GET /api/auth/me, and POST /api/auth/logout manage sessions and cookies properly', async () => {
    const { agent, csrfToken } = await getCsrfAgent();

    // Unauthenticated /me returns 401
    const unauthMe = await agent.get('/api/auth/me');
    expect(unauthMe.status).toBe(401);

    // Wrong password returns generic 401
    const badLogin = await agent
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: testEmail, password: 'WrongPassword123' });
    expect(badLogin.status).toBe(401);
    expect(badLogin.body.error.message).toBe('Invalid email or password');

    // Unknown email returns identical generic 401
    const unknownLogin = await agent
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: 'missing@lunar.local', password: testPassword });
    expect(unknownLogin.status).toBe(401);
    expect(unknownLogin.body.error.message).toBe('Invalid email or password');

    // Valid login sets HttpOnly session cookie + CSRF cookie
    const loginRes = await agent
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrfToken)
      .send({ email: testEmail, password: testPassword });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.email).toBe(testEmail);
    expect(loginRes.body.user.emailVerified).toBe(true);
    expect(loginRes.body.user.passwordHash).toBeUndefined();
    expect(loginRes.body.user.instagram).toEqual({ connected: false });

    const setCookies = loginRes.headers['set-cookie'] as string[];
    const sessionCookie = setCookies.find((c) => c.startsWith(`${env.SESSION_COOKIE_NAME}=`));
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie!.toLowerCase()).toContain('httponly');
    expect(sessionCookie!.toLowerCase()).toContain('samesite=lax');

    const newCsrfToken = loginRes.body.csrfToken as string;
    expect(typeof newCsrfToken).toBe('string');

    // Authenticated GET /api/auth/me returns full profile summary
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testEmail);
    expect(meRes.body.citizenshipStatus).toBe('NONE');
    expect(meRes.body.citizen).toBeNull();
    expect(meRes.body.instagram).toEqual({ connected: false });
    expect(meRes.body.eligibility).toBeNull();

    // Logout revokes session in DB and clears cookie
    const logoutRes = await agent
      .post('/api/auth/logout')
      .set('X-CSRF-Token', newCsrfToken)
      .send({});
    expect(logoutRes.status).toBe(200);

    const meAfterLogout = await agent.get('/api/auth/me');
    expect(meAfterLogout.status).toBe(401);
  });

  it('POST /api/auth/forgot-password & /api/auth/reset-password update password and revoke ALL active sessions', async () => {
    const { agent: sessionA, csrfToken: csrfA } = await getCsrfAgent();
    const { agent: sessionB, csrfToken: csrfB } = await getCsrfAgent();

    const loginA = await sessionA
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrfA)
      .send({ email: testEmail, password: testPassword });
    expect(loginA.status).toBe(200);

    const loginB = await sessionB
      .post('/api/auth/login')
      .set('X-CSRF-Token', csrfB)
      .send({ email: testEmail, password: testPassword });
    expect(loginB.status).toBe(200);

    // Forgot password for nonexistent and existent emails both return generic 200
    const { agent: anon, csrfToken: anonCsrf } = await getCsrfAgent();
    const unknownForgot = await anon
      .post('/api/auth/forgot-password')
      .set('X-CSRF-Token', anonCsrf)
      .send({ email: 'unknown-user@lunar.local' });
    expect(unknownForgot.status).toBe(200);

    const validForgot = await anon
      .post('/api/auth/forgot-password')
      .set('X-CSRF-Token', anonCsrf)
      .send({ email: testEmail });
    expect(validForgot.status).toBe(200);
    expect(validForgot.body.message).toBe(unknownForgot.body.message);
    expect(capturedResetTokens).toHaveLength(1);

    const resetRes = await anon
      .post('/api/auth/reset-password')
      .set('X-CSRF-Token', anonCsrf)
      .send({
        token: capturedResetTokens[0],
        password: newPassword,
        confirmPassword: newPassword,
      });
    expect(resetRes.status).toBe(200);

    // Reusing reset token fails
    const reuseReset = await anon
      .post('/api/auth/reset-password')
      .set('X-CSRF-Token', anonCsrf)
      .send({ token: capturedResetTokens[0], password: newPassword });
    expect(reuseReset.status).toBe(400);
    expect(reuseReset.body.error.code).toBe('TOKEN_ALREADY_USED');

    // BOTH sessionA and sessionB must now be revoked!
    expect((await sessionA.get('/api/auth/me')).status).toBe(401);
    expect((await sessionB.get('/api/auth/me')).status).toBe(401);

    // Old password fails, new password works
    const oldPwLogin = await anon
      .post('/api/auth/login')
      .set('X-CSRF-Token', anonCsrf)
      .send({ email: testEmail, password: testPassword });
    expect(oldPwLogin.status).toBe(401);

    const newPwLogin = await anon
      .post('/api/auth/login')
      .set('X-CSRF-Token', anonCsrf)
      .send({ email: testEmail, password: newPassword });
    expect(newPwLogin.status).toBe(200);
  });
});
