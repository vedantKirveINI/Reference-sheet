# Sheets Backend

NestJS backend API for the sheet application (port 3000). Uses Prisma, PostgreSQL, Redis, and Socket.IO.

## Getting Node

- **With nvm:** Run `nvm use` in this directory (uses `.nvmrc`).
- **Otherwise:** Install [Node.js](https://nodejs.org/) 18+.

## Setup

```bash
pnpm install
cp .env.sample .env
# Edit .env with your config (DB, Redis, JWT, etc.).
npx prisma generate
pnpm run migrate:prod   # or migrate (dev)
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run start:dev` | Dev server with watch |
| `pnpm run build` | Build for production |
| `pnpm run start:prod` | Run production build |
| `pnpm run migrate` | Prisma migrate (dev) |
| `pnpm run migrate:prod` | Prisma migrate (deploy) |

## Environment

See `.env.sample` for required variables (e.g. `DATABASE_URL`, `REDIS_HOST`, `JWT_SECRET`).
