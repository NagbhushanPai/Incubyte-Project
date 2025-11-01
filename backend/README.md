# Sweets API (Backend)

Stack: Node.js + TypeScript + Express + Prisma + PostgreSQL

Quick start

1. Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies: `npm install`.
3. Generate Prisma client and run migrations:

   npx prisma migrate dev --name init

4. Start the server:

   npm run dev

Endpoints:

- POST /api/auth/register
- POST /api/auth/login
- Protected routes require Authorization: Bearer <token>
- CRUD and inventory endpoints under /api/sweets

Notes: You need a running Postgres instance. For local development, create a database `sweetsdb` and set `DATABASE_URL` accordingly.
