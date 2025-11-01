import request from 'supertest';
import app, { prisma } from '../src/app';

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Auth edge cases', () => {
  test('register missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    expect(res.status).toBe(400);
  });

  test('login invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'noone@example.com', password: 'bad' });
    expect(res.status).toBe(401);
  });

  test('duplicate registration returns 409', async () => {
    const email = `dup+${Date.now()}@example.com`;
    const r1 = await request(app).post('/api/auth/register').send({ email, password: 'pass' });
    expect(r1.status).toBe(200);
    const r2 = await request(app).post('/api/auth/register').send({ email, password: 'pass' });
    expect(r2.status).toBe(409);
  });
});
