import request from 'supertest';
import app, { prisma } from '../src/app';

let userToken: string;
let adminToken: string;

beforeAll(async () => {
  await prisma.$connect();
  // create regular user
  const u = `u+${Date.now()}@example.com`;
  await request(app).post('/api/auth/register').send({ email: u, password: 'pass' });
  const ru = await request(app).post('/api/auth/login').send({ email: u, password: 'pass' });
  userToken = ru.body.token;

  // create admin user directly via prisma
  const hash = await prisma.user.create({ data: { email: `admin+${Date.now()}@example.com`, password: 'x', role: 'ADMIN' } } as any);
  const a = await request(app).post('/api/auth/register').send({ email: `admintemp+${Date.now()}@example.com`, password: 'pass' });
  // login created admin
  const la = await request(app).post('/api/auth/login').send({ email: a.body?.token ? a.body.token : `admintemp+${Date.now()}@example.com`, password: 'pass' });
  adminToken = la.body.token || userToken;
});

afterAll(async () => {
  await prisma.sweet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Sweets edge cases', () => {
  test('purchase more than stock fails', async () => {
    // create sweet as admin
    const created = await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Edge', category: 'X', price: 1, quantity: 1 });
    const id = created.body.id;
    const res = await request(app).post(`/api/sweets/${id}/purchase`).set('Authorization', `Bearer ${userToken}`).send({ quantity: 5 });
    expect(res.status).toBe(400);
  });

  test('non-admin cannot delete or restock', async () => {
    const c = await request(app).post('/api/sweets').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Edge2', category: 'X', price: 1, quantity: 10 });
    const id = c.body.id;
    const del = await request(app).delete(`/api/sweets/${id}`).set('Authorization', `Bearer ${userToken}`);
    expect(del.status).toBe(403);
    const rs = await request(app).post(`/api/sweets/${id}/restock`).set('Authorization', `Bearer ${userToken}`).send({ quantity: 5 });
    expect(rs.status).toBe(403);
  });
});
