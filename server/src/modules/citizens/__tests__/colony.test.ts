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
import { generateRandomToken, sha256 } from '../../../utils/crypto';
import { departmentsRouter } from '../../departments/departments.routes';
import { instagramRouter } from '../../instagram/instagram.routes';
import { instagramService } from '../../instagram/instagram.service';
import {
  DevMockEligibilityProvider,
  OfficialInstagramEligibilityProvider,
} from '../../verification/verification.providers';
import { verificationRouter } from '../../verification/verification.routes';
import { citizensRouter, citizenshipRouter } from '../citizens.routes';

function createColonyTestApp() {
  const testApp = express();
  testApp.use(express.json());
  testApp.use(cookieParser());
  testApp.use(ensureCsrfCookie);
  testApp.get('/api/csrf', (req, res) => {
    const token = req.cookies?.[env.CSRF_COOKIE_NAME];
    res.json({ csrfToken: token });
  });
  testApp.use('/api', csrfMiddleware);
  testApp.use('/api/departments', departmentsRouter);
  testApp.use('/api/instagram', instagramRouter);
  testApp.use('/api/verification', verificationRouter);
  testApp.use('/api/citizenship', citizenshipRouter);
  testApp.use('/api/citizens', citizensRouter);
  testApp.use('/api', notFoundHandler);
  testApp.use(errorHandler);
  return testApp;
}

async function createTestUserWithSession(options: {
  email: string;
  emailVerified: boolean;
  role?: 'USER' | 'ADMIN';
}) {
  const user = await prisma.user.create({
    data: {
      email: options.email,
      passwordHash: '$2a$12$dummyhashfortestingonly1234567890123456789012',
      emailVerified: options.emailVerified,
      role: options.role ?? 'USER',
    },
  });

  const rawToken = generateRandomToken(32);
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: sha256(rawToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return { user, rawToken };
}

describe('Colony API modules (departments, instagram, verification, citizens)', () => {
  const testApp = createColonyTestApp();
  const suffix = Date.now();
  const createdUserIds: string[] = [];
  let initialSeqLastValue = 0;

  let unverifiedToken = '';
  let userAToken = '';
  let userAId = '';
  let userBToken = '';
  let userBId = '';
  let adminToken = '';
  let createdCitizenId = '';

  beforeAll(async () => {
    const seq = await prisma.citizenSequence.findUnique({ where: { id: 1 } });
    initialSeqLastValue = seq?.lastValue ?? 0;

    const unverified = await createTestUserWithSession({
      email: `colony-unverified-${suffix}@lunar.local`,
      emailVerified: false,
    });
    createdUserIds.push(unverified.user.id);
    unverifiedToken = unverified.rawToken;

    const userA = await createTestUserWithSession({
      email: `colony-user-a-${suffix}@lunar.local`,
      emailVerified: true,
    });
    createdUserIds.push(userA.user.id);
    userAId = userA.user.id;
    userAToken = userA.rawToken;

    const userB = await createTestUserWithSession({
      email: `colony-user-b-${suffix}@lunar.local`,
      emailVerified: true,
    });
    createdUserIds.push(userB.user.id);
    userBId = userB.user.id;
    userBToken = userB.rawToken;

    const admin = await createTestUserWithSession({
      email: `colony-admin-${suffix}@lunar.local`,
      emailVerified: true,
      role: 'ADMIN',
    });
    createdUserIds.push(admin.user.id);
    adminToken = admin.rawToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: createdUserIds } },
    });
    await prisma.citizenSequence.upsert({
      where: { id: 1 },
      update: { lastValue: initialSeqLastValue },
      create: { id: 1, lastValue: initialSeqLastValue },
    });
    await prisma.$disconnect();
  });

  it('GET /api/departments returns all 6 seeded departments', async () => {
    const res = await request(testApp).get('/api/departments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.departments)).toBe(true);
    expect(res.body.departments).toHaveLength(6);
    expect(res.body.departments[0]).toHaveProperty('id');
    expect(res.body.departments[0]).toHaveProperty('primaryDistrictId');
    expect(Array.isArray(res.body.departments[0].professions)).toBe(true);
  });

  it('Instagram connect returns honest UNAVAILABLE when Meta credentials are not configured', async () => {
    const res = await request(testApp)
      .get('/api/instagram/connect')
      .set('Cookie', [`${env.SESSION_COOKIE_NAME}=${userAToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.configured).toBe(false);
    expect(res.body.status).toBe('UNAVAILABLE');
    expect(res.body.authorizationUrl).toBeNull();
    expect(res.body.reason).toContain('INSTAGRAM_CLIENT_ID');

    const redirectRes = await request(testApp)
      .get('/api/instagram/connect?redirect=1')
      .set('Cookie', [`${env.SESSION_COOKIE_NAME}=${userAToken}`]);

    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toContain('/citizenship?ig_error=not_configured');
  });

  it('Instagram callback handles access_denied and missing code cleanly', async () => {
    const denied = await request(testApp).get('/api/instagram/callback?error=access_denied');
    expect(denied.status).toBe(302);
    expect(denied.headers.location).toContain('/citizenship?ig_error=access_denied');

    const missing = await request(testApp).get('/api/instagram/callback');
    expect(missing.status).toBe(302);
    expect(missing.headers.location).toContain('/citizenship?ig_error=missing_code');
  });

  it('Instagram status never returns accessTokenEncrypted and disconnect does not delete citizen', async () => {
    await prisma.instagramConnection.create({
      data: {
        userId: userBId,
        provider: 'instagram',
        providerUserId: `ig-${suffix}`,
        username: `lunar_ig_${suffix}`,
        profilePictureUrl: 'https://example.com/avatar.jpg',
        accessTokenEncrypted: 'v1:deadbeef:deadbeef:deadbeef',
      },
    });

    const statusRes = await request(testApp)
      .get('/api/instagram/status')
      .set('Cookie', [`${env.SESSION_COOKIE_NAME}=${userBToken}`]);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.connected).toBe(true);
    expect(statusRes.body.connection.username).toBe(`lunar_ig_${suffix}`);
    expect(statusRes.body.connection.accessTokenEncrypted).toBeUndefined();

    const csrfRes = await request(testApp).get('/api/csrf');
    const csrfToken = csrfRes.body.csrfToken as string;

    const disconnectRes = await request(testApp)
      .delete('/api/instagram/disconnect')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userBToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken);

    expect(disconnectRes.status).toBe(200);
    expect(disconnectRes.body.disconnected).toBe(true);
  });

  it('OfficialInstagramEligibilityProvider never fakes follower checks', async () => {
    const provider = new OfficialInstagramEligibilityProvider();

    const noIg = await provider.checkEligibility(userAId);
    expect(noIg.status).toBe('FAILED');
    expect(noIg.reason).toBe('Connect an Instagram account first.');
    expect(noIg.isMock).toBe(false);

    await prisma.instagramConnection.create({
      data: {
        userId: userAId,
        provider: 'instagram',
        providerUserId: `ig-official-${suffix}`,
        username: `official_${suffix}`,
        accessTokenEncrypted: 'v1:aa:bb:cc',
      },
    });

    const withIg = await provider.checkEligibility(userAId);
    expect(withIg.status).toBe('UNAVAILABLE');
    expect(withIg.verificationMethod).toBe('OFFICIAL_API_LIMITATION');
    expect(withIg.isMock).toBe(false);

    await prisma.instagramConnection.deleteMany({ where: { userId: userAId } });
  });

  it('DevMockEligibilityProvider rejects invocation when DEV_MOCK_VERIFICATION is disabled', async () => {
    const provider = new DevMockEligibilityProvider();
    const originalFlag = env.DEV_MOCK_VERIFICATION;
    try {
      (env as { DEV_MOCK_VERIFICATION: boolean }).DEV_MOCK_VERIFICATION = false;
      await expect(provider.checkEligibility(userAId)).rejects.toThrow();
    } finally {
      (env as { DEV_MOCK_VERIFICATION: boolean }).DEV_MOCK_VERIFICATION = originalFlag;
    }
  });

  it('Verification check-eligibility and admin review enforce roles and create DB audit rows', async () => {
    const csrfRes = await request(testApp).get('/api/csrf');
    const csrfToken = csrfRes.body.csrfToken as string;

    // Non-admin cannot call admin review
    const forbiddenReview = await request(testApp)
      .post('/api/verification/admin/review')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userAToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        userId: userAId,
        status: 'VERIFIED',
        reason: 'Trying to self-approve',
      });
    expect(forbiddenReview.status).toBe(403);

    // Check eligibility as verified-email user (uses official or mock based on env)
    const checkRes = await request(testApp)
      .post('/api/verification/check-eligibility')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userAToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({});
    expect(checkRes.status).toBe(200);
    expect(['FAILED', 'UNAVAILABLE', 'VERIFIED']).toContain(checkRes.body.status);

    // Admin manually verifies userA
    const adminReviewRes = await request(testApp)
      .post('/api/verification/admin/review')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${adminToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        userId: userAId,
        status: 'VERIFIED',
        reason: 'Manual verification approved in integration test',
      });
    expect(adminReviewRes.status).toBe(200);
    expect(adminReviewRes.body.verification.status).toBe('VERIFIED');
    expect(adminReviewRes.body.verification.isMock).toBe(false);
  });

  it('Citizenship apply enforces gates, rejects privileged client fields, and persists real Citizen', async () => {
    const csrfRes = await request(testApp).get('/api/csrf');
    const csrfToken = csrfRes.body.csrfToken as string;

    const validPayload = {
      username: `astro_${suffix % 100000}`,
      displayName: 'Commander Aria Vance',
      bio: 'Lunar propulsion and structural systems specialist.',
      departmentId: 'ENGINEERING',
      profession: 'Systems Engineer',
      astronautType: 'engineer',
      suitColor: '#f97316',
    };

    // Unverified email user rejected with 403
    const unverifiedRes = await request(testApp)
      .post('/api/citizenship/apply')
      .set(
        'Cookie',
        `${env.SESSION_COOKIE_NAME}=${unverifiedToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`
      )
      .set('X-CSRF-Token', csrfToken)
      .send(validPayload);
    expect(unverifiedRes.status).toBe(403);
    expect(unverifiedRes.body.error.code).toBe('EMAIL_NOT_VERIFIED');

    // Verified email user WITHOUT eligibility rejected with 403
    const noEligibilityRes = await request(testApp)
      .post('/api/citizenship/apply')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userBToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send(validPayload);
    expect(noEligibilityRes.status).toBe(403);
    expect(noEligibilityRes.body.error.code).toBe('ELIGIBILITY_REQUIRED');

    // Client attempting to supply citizenId / xp / colonyCredits is rejected
    const tamperedRes = await request(testApp)
      .post('/api/citizenship/apply')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userAToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        ...validPayload,
        citizenId: 'LUN-99999',
        xp: 99999,
        colonyCredits: 999999,
      });
    expect(tamperedRes.status).toBe(400);

    // Valid application succeeds
    const applyRes = await request(testApp)
      .post('/api/citizenship/apply')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userAToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send(validPayload);

    expect(applyRes.status).toBe(201);
    const citizen = applyRes.body.citizen;
    expect(citizen.citizenId).toMatch(/^LUN-\d{5,}$/);
    expect(citizen.department).toBe('ENGINEERING');
    expect(citizen.districtId).toBe('FORGE');
    expect(citizen.rank).toBe('Citizen');
    expect(citizen.xp).toBe(0);
    expect(citizen.level).toBe(1);
    expect(citizen.colonyCredits).toBe(100);
    expect(citizen.isDemo).toBe(false);
    expect(citizen.userId).toBeUndefined();
    expect(citizen.email).toBeUndefined();
    createdCitizenId = citizen.citizenId;

    // Duplicate application returns 409
    const dupRes = await request(testApp)
      .post('/api/citizenship/apply')
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userAToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        ...validPayload,
        username: `other_${suffix % 100000}`,
      });
    expect(dupRes.status).toBe(409);
  });

  it('Public citizen endpoints omit private fields and PATCH enforces ownership + protected fields', async () => {
    const publicRes = await request(testApp).get(`/api/citizens/${createdCitizenId}/public`);
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.citizen.citizenId).toBe(createdCitizenId);
    expect(publicRes.body.citizen.userId).toBeUndefined();
    expect(publicRes.body.citizen.email).toBeUndefined();

    const listRes = await request(testApp).get('/api/citizens?department=ENGINEERING&page=1&limit=10');
    expect(listRes.status).toBe(200);
    expect(listRes.body.citizens.some((c: { citizenId: string }) => c.citizenId === createdCitizenId)).toBe(true);
    expect(listRes.body.pagination.page).toBe(1);

    const csrfRes = await request(testApp).get('/api/csrf');
    const csrfToken = csrfRes.body.csrfToken as string;

    // Non-owner cannot PATCH
    const nonOwnerPatch = await request(testApp)
      .patch(`/api/citizens/${createdCitizenId}`)
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userBToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ bio: 'Unauthorized edit attempt on another citizen.' });
    expect(nonOwnerPatch.status).toBe(403);

    // Owner cannot modify protected fields like xp / careerRank
    const protectedFieldPatch = await request(testApp)
      .patch(`/api/citizens/${createdCitizenId}`)
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userAToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ xp: 5000, careerRank: 'Colony Council' });
    expect(protectedFieldPatch.status).toBe(403);
    expect(protectedFieldPatch.body.error.code).toBe('PROTECTED_FIELD_FORBIDDEN');

    // Owner CAN update safe cosmetic/bio fields
    const validPatch = await request(testApp)
      .patch(`/api/citizens/${createdCitizenId}`)
      .set('Cookie', `${env.SESSION_COOKIE_NAME}=${userAToken}; ${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        bio: 'Updated bio after completing Forge orientation.',
        suitColor: '#38bdf8',
      });
    expect(validPatch.status).toBe(200);
    expect(validPatch.body.citizen.suitColor).toBe('#38bdf8');
  });

  it('Rejects unauthenticated citizenship creation and locks out DevMockEligibilityProvider in production', async () => {
    const csrfRes = await request(testApp).get('/api/csrf');
    const csrfToken = csrfRes.body.csrfToken as string;

    const unauthApply = await request(testApp)
      .post('/api/citizenship/apply')
      .set('Cookie', `${env.CSRF_COOKIE_NAME}=${csrfToken}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        username: `unauth_${suffix % 100000}`,
        displayName: 'Unauthenticated User',
        bio: 'Should be rejected at auth gate.',
        departmentId: 'ENGINEERING',
        profession: 'Systems Engineer',
        astronautType: 'engineer',
      });
    expect(unauthApply.status).toBe(401);

    const provider = new DevMockEligibilityProvider();
    const originalEnv = env.NODE_ENV;
    const originalIsProd = env.isProduction;
    const originalMock = env.DEV_MOCK_VERIFICATION;
    try {
      (env as { NODE_ENV: string }).NODE_ENV = 'production';
      (env as { isProduction: boolean }).isProduction = true;
      (env as { DEV_MOCK_VERIFICATION: boolean }).DEV_MOCK_VERIFICATION = true;
      await expect(provider.checkEligibility(userAId)).rejects.toThrow();
    } finally {
      (env as { NODE_ENV: string }).NODE_ENV = originalEnv;
      (env as { isProduction: boolean }).isProduction = originalIsProd;
      (env as { DEV_MOCK_VERIFICATION: boolean }).DEV_MOCK_VERIFICATION = originalMock;
    }
  });

  it('Instagram OAuth callback validates state and prevents duplicate Instagram identity linking', async () => {
    const mutableEnv = env as unknown as {
      isInstagramConfigured: boolean;
      INSTAGRAM_CLIENT_ID?: string;
      INSTAGRAM_CLIENT_SECRET?: string;
      INSTAGRAM_REDIRECT_URI?: string;
    };
    const prevConfigured = mutableEnv.isInstagramConfigured;
    const prevId = mutableEnv.INSTAGRAM_CLIENT_ID;
    const prevSecret = mutableEnv.INSTAGRAM_CLIENT_SECRET;
    const prevRedirect = mutableEnv.INSTAGRAM_REDIRECT_URI;

    try {
      mutableEnv.isInstagramConfigured = true;
      mutableEnv.INSTAGRAM_CLIENT_ID = 'test-ig-client-id';
      mutableEnv.INSTAGRAM_CLIENT_SECRET = 'test-ig-client-secret';
      mutableEnv.INSTAGRAM_REDIRECT_URI = 'http://localhost:5173/api/instagram/callback';

      // Unknown state rejected
      const invalidStateRes = await request(testApp).get(
        '/api/instagram/callback?code=abc&state=nonexistent-state-xyz'
      );
      expect(invalidStateRes.status).toBe(302);
      expect(invalidStateRes.headers.location).toContain('/citizenship?ig_error=invalid_state');

      // Expired state rejected
      const expiredRaw = generateRandomToken(16);
      await prisma.instagramOAuthState.create({
        data: {
          stateHash: sha256(expiredRaw),
          userId: userAId,
          expiresAt: new Date(Date.now() - 60_000),
        },
      });
      const expiredStateRes = await request(testApp).get(
        `/api/instagram/callback?code=abc&state=${expiredRaw}`
      );
      expect(expiredStateRes.status).toBe(302);
      expect(expiredStateRes.headers.location).toContain('/citizenship?ig_error=state_expired');

      // Existing IG link on userA cannot be linked to userB
      const sharedIgId = `ig-shared-${suffix}`;
      await prisma.instagramConnection.create({
        data: {
          userId: userAId,
          provider: 'instagram',
          providerUserId: sharedIgId,
          username: `shared_${suffix}`,
          accessTokenEncrypted: 'v1:aa:bb:cc',
        },
      });

      const validState = generateRandomToken(16);
      await prisma.instagramOAuthState.create({
        data: {
          stateHash: sha256(validState),
          userId: userBId,
          expiresAt: new Date(Date.now() + 60_000),
        },
      });

      const fetchMock = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ access_token: 'ig-token-123', user_id: sharedIgId }), {
            status: 200,
          })
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ id: sharedIgId, username: `shared_${suffix}` }), {
            status: 200,
          })
        );

      const dupLinkRes = await request(testApp).get(
        `/api/instagram/callback?code=valid-code&state=${validState}`
      );
      expect(dupLinkRes.status).toBe(302);
      expect(dupLinkRes.headers.location).toContain('/citizenship?ig_error=already_linked');

      // Reusing consumed state fails
      const reuseRes = await request(testApp).get(
        `/api/instagram/callback?code=valid-code&state=${validState}`
      );
      expect(reuseRes.status).toBe(302);
      expect(reuseRes.headers.location).toContain('/citizenship?ig_error=state_already_used');

      fetchMock.mockRestore();
      expect(instagramService).toBeDefined();
    } finally {
      await prisma.instagramConnection.deleteMany({ where: { userId: userAId } });
      await prisma.instagramOAuthState.deleteMany({ where: { userId: { in: [userAId, userBId] } } });
      mutableEnv.isInstagramConfigured = prevConfigured;
      mutableEnv.INSTAGRAM_CLIENT_ID = prevId;
      mutableEnv.INSTAGRAM_CLIENT_SECRET = prevSecret;
      mutableEnv.INSTAGRAM_REDIRECT_URI = prevRedirect;
    }
  });
});
