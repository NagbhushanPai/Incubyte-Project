# Sweets API (Backend)

Stack: Node.js + TypeScript + Express + Prisma + SQLite

## Quick Start

1. Copy `.env.example` to `.env` and update `DATABASE_URL` and `JWT_SECRET`:

```bash
cp .env.example .env
# Update .env with your values (defaults are dev-friendly)
```

2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Seed the database with admin user and sample sweets:

```bash
npx ts-node src/seed.ts
```

5. Start the dev server:

```bash
npm run dev
```

Server runs on `http://localhost:4000`.

## Testing

Run unit and integration tests:

```bash
npm test
```

Tests cover:
- Auth endpoints (register, login, edge cases, duplicate prevention)
- Sweets CRUD and inventory management (create, list, purchase, restock)
- Admin-only route enforcement

## Environment Variables

Create `.env` from `.env.example`:

```
DATABASE_URL=file:./dev.db
JWT_SECRET=supersecretdev
PORT=4000
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=adminpass
```

For production, change `DATABASE_URL` to a PostgreSQL connection string:
```
DATABASE_URL=postgresql://user:password@host:5432/db
```

## API Endpoints

See root [README.md](../README.md) for full endpoint documentation.

## Database Schema

- `User` — Stores user accounts with role (USER or ADMIN)
- `Sweet` — Inventory of sweets with price and quantity

Migrations are in `prisma/migrations/`.

## Development Notes

- Uses SQLite for local dev/test (`dev.db`).
- Prisma ORM handles schema migrations and queries.
- Tests use the same SQLite DB and clean up after each run.
- To reset DB: delete `dev.db` and re-run migrations + seed.
