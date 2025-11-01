Postgres setup (Windows)

1. Install Postgres (https://www.postgresql.org/download/windows/)
2. Create database: in psql or pgAdmin run: `CREATE DATABASE sweetsdb;`
3. Update `.env` with the correct `DATABASE_URL`.
4. Run migrations: `npx prisma migrate dev --name init` and then `node ./dist/seed.js` after building or `ts-node src/seed.ts`.
