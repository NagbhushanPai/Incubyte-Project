import request from 'supertest';
import app, { prisma } from '../src/app';

beforeAll(async () => {
  // use test db by setting env if needed
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Auth', () => {
  test('register -> login flow', async () => {
    const email = `test+${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({ email, password: 'pass123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    const login = await request(app).post('/api/auth/login').send({ email, password: 'pass123' });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();
  });
});
