# Docker & Deployment Guide

This file contains instructions for containerizing the app and setting up Docker Compose (ready for when Docker is fully installed).

## Prerequisites

- Docker and Docker Compose installed
- Port 5173 (frontend), 4000 (backend), 5432 (Postgres) available locally

## Planned Setup

### Architecture

```
┌─────────────────────────────────────────┐
│  Docker Compose Network                 │
├─────────────────────────────────────────┤
│  Frontend (React):  localhost:5173       │
│  Backend (API):    localhost:4000        │
│  Database (PG):    postgres:5432         │
└─────────────────────────────────────────┘
```

### Containers

1. **Frontend** — React app (Vite dev/prod)
2. **Backend** — Express API with Node.js
3. **PostgreSQL** — Database service

## Next Steps (When Docker is Ready)

1. **Create `Dockerfile` files** for frontend and backend
2. **Create `docker-compose.yml`** to orchestrate all services
3. **Update `.env` files** for Docker environment
4. **Build and run** with `docker-compose up`

### Example docker-compose.yml structure (coming soon)

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: sweetsdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/sweetsdb
      JWT_SECRET: your_secret_here
    ports:
      - "4000:4000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Steps to Complete When Ready

Tell me "set up Docker" and I will:

1. Create Dockerfiles for backend and frontend
2. Create docker-compose.yml with Postgres, backend, and frontend
3. Add .dockerignore files to optimize image builds
4. Update CI/CD to build Docker images
5. Provide deployment instructions for Heroku, Railway, or AWS

For now, the app runs in development mode on localhost with SQLite. Docker will enable:

- Production-grade deployment
- Reproducible environments across machines
- PostgreSQL for production data
- Container orchestration and scaling
