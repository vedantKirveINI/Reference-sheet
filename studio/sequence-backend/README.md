# Sequence Backend

Stateful sequence orchestrator for TinySequence - handles sequences, executions, webhooks, and AI formula generation.

## Prerequisites

- **Node.js** 18+ (for `--watch` in dev mode)
- **PostgreSQL** 12+

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the sample env file and set your values:

```bash
cp .env.sample .env
```

Edit `.env` and set at minimum:

- **`DATABASE_URL`** – PostgreSQL connection string (required)

Example:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/sequence_db
```

### 3. Create the database

Create a PostgreSQL database if it doesn't exist:

```bash
createdb sequence_db
```

Or via `psql`:

```sql
CREATE DATABASE sequence_db;
```

### 4. Start the server

**Development** (with auto-restart on file changes):

```bash
npm run dev
```

**Production**:

```bash
npm start
```

The server runs on **http://localhost:3002** by default.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SEQUENCE_PORT` | No | `3002` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `SCHEDULER_POLL_INTERVAL_MS` | No | `10000` | Scheduler poll interval (ms) |
| `LOG_LEVEL` | No | `info` | Log level |
| `LOG_SLOW_QUERY_THRESHOLD_MS` | No | `100` | Slow query log threshold (ms) |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | No* | — | OpenAI API key (for AI formula) |
| `OPEN_AI_KEY` | No* | — | Alternative OpenAI API key |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | No | — | Custom OpenAI base URL |

\* Required only for `/api/ai-formula` endpoints.

## API Endpoints

| Path | Description |
|------|-------------|
| `GET /api/health` | Health check |
| `/api/sequences` | Sequence CRUD |
| `/api/executions` | Execution management |
| `/api/webhooks` | Webhook triggers |
| `/api/ai-formula` | AI formula generation (requires OpenAI key) |

## Database

On first run, the backend creates these tables if they don't exist:

- `sequences` – Sequence definitions
- `sequence_executions` – Execution state
- `sequence_execution_logs` – Execution logs
- `hitl_tasks` – Human-in-the-loop tasks

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server (production) |
| `npm run dev` | Start with watch mode (development) |
