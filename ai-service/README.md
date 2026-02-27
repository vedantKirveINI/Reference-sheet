# Sheets AI Service

Express/TypeScript AI service for the sheet application (runs on port 3001 by default).

## Getting Node

- **With nvm:** Run `nvm use` in this directory (uses `.nvmrc`).
- **Otherwise:** Install [Node.js](https://nodejs.org/) 18+.

## Setup

```bash
npm install
cp .env.sample .env
# Edit .env and set PORT, DATABASE_URL, and your OpenAI API key.
```

## Scripts

| Command       | Description              |
|--------------|--------------------------|
| `npm run dev` | Start dev server (watch) |
| `npm run build` | Compile TypeScript     |
| `npm start`  | Run production build    |

## Environment

See `.env.sample` for required variables (e.g. `PORT`, `DATABASE_URL`, OpenAI key).
