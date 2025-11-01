import request from 'supertest';
import app, { prisma } from '../src/app';

let token: string;

beforeAll(async () => {
  await prisma.$connect();
  // create a user and login
  const email = `test+${Date.now()}@example.com`;
  await request(app).post('/api/auth/register').send({ email, password: 'pass123' });
  const res = await request(app).post('/api/auth/login').send({ email, password: 'pass123' });
  token = res.body.token;
});

afterAll(async () => {
  await prisma.sweet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Sweets', () => {
  test('create, list, purchase', async () => {
    const create = await request(app).post('/api/sweets').set('Authorization', `Bearer ${token}`).send({ name: 'Test', category: 'Gummy', price: 1.5, quantity: 5 });
    expect(create.status).toBe(201);
    const list = await request(app).get('/api/sweets').set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body)).toBe(true);
    const id = create.body.id;
    const purchase = await request(app).post(`/api/sweets/${id}/purchase`).set('Authorization', `Bearer ${token}`).send({ quantity: 2 });
    expect(purchase.status).toBe(200);
    expect(purchase.body.quantity).toBe(3);
  });
});
