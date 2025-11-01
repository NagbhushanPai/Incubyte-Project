# Sweets App — Full-Stack MVP

![CI Status](https://github.com/NagbhushanPai/Incubyte-Project/actions/workflows/ci.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![SQLite](https://img.shields.io/badge/Database-SQLite-lightblue)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, full-stack application for managing and purchasing sweets. Features user authentication, inventory management, admin controls, and comprehensive testing.

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite (dev/test), PostgreSQL (production-ready)
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Auth**: JWT tokens with role-based access control (RBAC)
- **Testing**: Jest (unit/integration), Playwright (E2E)
- **CI/CD**: GitHub Actions

## Features

### User Management

- User registration and login with JWT tokens
- Password hashing with bcrypt
- Role-based access control (User, Admin)

### Sweets Inventory

- Create, read, update, delete sweets (admin only)
- Search and filter sweets by name, category, or price
- Purchase sweets with real-time inventory updates
- Restock inventory (admin only)

### Frontend

- Responsive, modern UI with Tailwind CSS
- Protected routes and auth flow
- Admin dashboard with full CRUD capabilities
- Real-time sweets listing and purchase flow
- Login/logout functionality

## Quick Start

### Prerequisites

- Node.js 18+ installed
- SQLite (included with Node)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/NagbhushanPai/Incubyte-Project.git
   cd Incubyte-Project
   ```

2. **Backend setup**

   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npx ts-node src/seed.ts
   npm run dev
   ```

   - Backend runs on `http://localhost:4000`
   - API: `http://localhost:4000/api`
   - Seeded admin: `admin@example.com` / `adminpass`

3. **Frontend setup** (in another terminal)

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   - Frontend runs on `http://localhost:5173` (or next available port)

4. **Access the app**
   - Open `http://localhost:5173` in your browser
   - Login with admin credentials or register a new user

## Testing

### Backend Tests (Unit + Integration)

```bash
cd backend
npm test
```

Tests cover:

- Auth endpoints (register, login, edge cases)
- Sweets CRUD and inventory management
- Admin-only enforcement

### Frontend E2E Tests (Playwright)

```bash
cd frontend
npm run test:e2e
```

Requires backend running on `http://localhost:4000`.

## API Endpoints

### Auth

- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Login and get JWT token

### Sweets (Protected - require auth token)

- `GET /api/sweets` — List all sweets
- `GET /api/sweets/search?q=...&category=...&minPrice=...&maxPrice=...` — Search sweets
- `POST /api/sweets` — Create a sweet (anyone authenticated)
- `PUT /api/sweets/:id` — Update a sweet
- `DELETE /api/sweets/:id` — Delete a sweet (admin only)

### Inventory

- `POST /api/sweets/:id/purchase` — Purchase a sweet (decreases quantity)
- `POST /api/sweets/:id/restock` — Restock a sweet (admin only, increases quantity)

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts           # Server entry (starts listener)
│   │   ├── app.ts             # Express app (testable)
│   │   ├── routes/            # Auth and sweets routes
│   │   ├── middleware/        # JWT auth middleware
│   │   └── seed.ts            # DB seed script
│   ├── __tests__/             # Jest tests (unit/integration)
│   ├── prisma/
│   │   └── schema.prisma      # SQLite schema
│   ├── jest.config.cjs        # Jest configuration
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx           # React entry
│   │   ├── App.tsx            # Routes
│   │   ├── api.ts             # API client
│   │   ├── context/           # Auth context
│   │   └── pages/             # Pages (Login, Register, Dashboard)
│   ├── e2e/                   # Playwright E2E tests
│   ├── playwright.config.ts   # Playwright config
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD
└── README.md (this file)
```

## Development Notes

### Database

- **Development/Testing**: SQLite (`backend/dev.db`)
- **Production**: Update `backend/.env` to use PostgreSQL (`DATABASE_URL=postgresql://...`)
- Migrations stored in `backend/prisma/migrations/`

### Environment Variables

Backend (`.env`):

```
DATABASE_URL=file:./dev.db
JWT_SECRET=supersecretdev
PORT=4000
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=adminpass
```

Frontend (`.env`):

```
VITE_API_URL=http://localhost:4000/api
```

### Adding Tests

- Unit/integration tests: add to `backend/__tests__/*.test.ts`
- E2E tests: add to `frontend/e2e/*.spec.ts`
- Run tests before pushing to main — CI will run them automatically

## Continuous Integration

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. Runs backend tests on push/PR
2. Builds frontend on successful backend tests
3. Reports status as badges

To see workflow details, visit [Actions](https://github.com/NagbhushanPai/Incubyte-Project/actions).

## Example Usage

### Register a User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}'
```

Returns: `{"token":"eyJhbGc..."}`

### Get Sweets (with auth token)

```bash
curl -X GET http://localhost:4000/api/sweets \
  -H "Authorization: Bearer <your-token>"
```

### Purchase a Sweet

```bash
curl -X POST http://localhost:4000/api/sweets/<sweet-id>/purchase \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity":1}'
```

## Roadmap

- [ ] Docker Compose setup for local Postgres + app
- [ ] Production build and deployment guides
- [ ] Admin dashboard improvements (charts, stats)
- [ ] Payment integration (Stripe, PayPal)
- [ ] User profile and order history
- [ ] Email notifications

## License

MIT

## Questions?

For questions or issues, open a GitHub issue or contact the maintainers.
