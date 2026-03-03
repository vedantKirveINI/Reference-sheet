# Sheets Frontend

React + Vite frontend for the sheet application (port 5000). Connects to the sheets backend API and AI service.

## Getting Node

- **With nvm:** Run `nvm use` in this directory (add a `.nvmrc` with e.g. `20` if needed).
- **Otherwise:** Install [Node.js](https://nodejs.org/) 18+.

## Setup

```bash
npm install
cp .env.sample .env
# Edit .env with VITE_* variables (API URL, auth, etc.).
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Environment

See `.env.sample` for required `VITE_*` variables. Backend and AI service must be running for full functionality.
