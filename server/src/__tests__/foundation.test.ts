import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { app } from '../app';
import { prisma } from '../config/prisma';
import { decryptSecret, encryptSecret, generateRandomToken, sha256 } from '../utils/crypto';

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Foundation: crypto utils', () => {
  it('hashes tokens deterministically with sha256', () => {
    const token = generateRandomToken();
    expect(token).toHaveLength(64);
    expect(sha256(token)).toHaveLength(64);
    expect(sha256(token)).toBe(sha256(token));
  });

  it('encrypts and decrypts secrets using AES-256-GCM', () => {
    const secret = 'ig_access_token_sample_12345';
    const encrypted = encryptSecret(secret);
    expect(encrypted.startsWith('v1:')).toBe(true);
    expect(encrypted).not.toContain(secret);
    expect(decryptSecret(encrypted)).toBe(secret);
  });

  it('rejects tampered ciphertext', () => {
    const encrypted = encryptSecret('sensitive-payload');
    const parts = encrypted.split(':');
    parts[3] = 'ff' + parts[3].slice(2);
    expect(() => decryptSecret(parts.join(':'))).toThrow();
  });
});

describe('Foundation: health, csrf, and seeded data', () => {
  it('GET /api/health returns connected database status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('connected');
  });

  it('GET /api/csrf returns csrfToken and sets cookie', async () => {
    const res = await request(app).get('/api/csrf');
    expect(res.status).toBe(200);
    expect(typeof res.body.csrfToken).toBe('string');
    expect(res.body.csrfToken.length).toBeGreaterThan(16);
    const setCookie = res.headers['set-cookie'];
    expect(Array.isArray(setCookie)).toBe(true);
    expect(setCookie.some((c: string) => c.startsWith('lunar_csrf='))).toBe(true);
  });

  it('blocks mutating /api requests without CSRF token', async () => {
    const res = await request(app).post('/api/nonexistent').send({});
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_INVALID');
  });

  it('allows mutating /api requests with matching CSRF cookie and header (returns 404 for unknown route)', async () => {
    const agent = request.agent(app);
    const csrfRes = await agent.get('/api/csrf');
    const token = csrfRes.body.csrfToken as string;

    const res = await agent.post('/api/nonexistent').set('X-CSRF-Token', token).send({});
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
  });

  it('has seeded 6 departments, 14 achievements, and CitizenSequence row', async () => {
    const [deptCount, achCount, seq] = await Promise.all([
      prisma.department.count(),
      prisma.achievement.count(),
      prisma.citizenSequence.findUnique({ where: { id: 1 } }),
    ]);

    expect(deptCount).toBe(6);
    expect(achCount).toBe(14);
    expect(seq).toEqual({ id: 1, lastValue: 0 });
  });
});
