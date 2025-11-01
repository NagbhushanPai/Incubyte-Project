import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'adminpass';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({ data: { email: adminEmail, password: hash, role: 'ADMIN' } as any });
    console.log('Admin user created:', adminEmail);
  }

  const count = await prisma.sweet.count();
  if (count === 0) {
    await prisma.sweet.createMany({ data: [
      { name: 'Chocolate Bar', category: 'Chocolate', price: 1.99, quantity: 50 },
      { name: 'Gummy Bears', category: 'Gummies', price: 0.99, quantity: 100 },
      { name: 'Sour Worms', category: 'Gummies', price: 1.49, quantity: 30 },
    ] });
    console.log('Seeded sweets');
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => process.exit(0));
