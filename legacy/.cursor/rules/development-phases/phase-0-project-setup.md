# Phase 0: Project Setup & Scaffolding
**CRITICAL | Duration: 1-2 days | Status: Not Started**

## 🎯 Phase Overview

This phase sets up the foundational project structure for Sheet's React + Vite rebuild. We'll create:
- ✅ Vite configuration with React support
- ✅ Monorepo structure (`apps/web`, `packages/sdk`, etc.)
- ✅ TypeScript configuration
- ✅ Package.json with dependencies
- ✅ CSS Module support with SCSS
- ✅ Path aliases for clean imports
- ✅ Environment variables setup
- ✅ Base folder structure

**Why:** A solid foundation prevents architectural debt and makes future phases smoother.

---

## 📚 Reference Analysis

### How Teable Does It

**Monorepo Structure:**
```
teable/
├── apps/
│   └── nextjs-app/              # Main app
│       ├── src/
│       │   ├── features/        # Feature modules
│       │   ├── pages/           # Next.js pages (we'll use Router)
│       │   ├── components/      # Shared components
│       │   ├── api/             # API utilities
│       │   ├── lib/             # Helpers
│       │   └── styles/          # Global styles
│       ├── next.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── ui-lib/                  # UI components (Teable's design system)
│   ├── sdk/                     # Shared business logic, grid
│   ├── db-main-prisma/          # Database types
│   └── ...
```

**Key Insights:**
- Clear separation of concerns (apps vs packages)
- Shared code in packages/ (reusable across multiple apps)
- Path aliases for clean imports (`@/components`, `@/features`)
- TypeScript configuration extends base config

### How Old Frontend Does It

**Single App Structure:**
```
frontend/src/
├── pages/                       # Page components
│   ├── WelcomeScreen/
│   ├── AiEnrichment/
│   └── Redirect/
├── components/                  # Reusable components (OUTE-DS)
├── routes/                      # React Router setup
├── websocket/                   # Socket.io client
├── hooks/                       # Custom hooks
└── utils/                       # Utility functions
```

**What to Keep:**
- Simple router setup using React Router
- Keycloak integration pattern
- OUTE-DS component usage
- WebSocket client initialization pattern

---

## 🛠️ Technical Implementation

### Vite Configuration

**Key Features:**
- React 18 with Fast Refresh
- TypeScript support
- CSS Modules with SCSS
- Build optimizations
- Environment variable handling

### File Structure (After Phase 0)

```
frontend/
├── apps/
│   └── web/                     # Main React SPA
│       ├── src/
│       │   ├── pages/           # Page components (React Router)
│       │   ├── features/        # Feature modules
│       │   ├── components/      # Reusable components
│       │   ├── hooks/           # Custom React hooks
│       │   ├── store/           # Zustand stores
│       │   ├── utils/           # Utilities
│       │   ├── types/           # TypeScript types
│       │   ├── styles/          # Global styles
│       │   ├── api/             # API client
│       │   ├── App.tsx          # Root component
│       │   ├── main.tsx         # Entry point
│       │   └── Router.tsx       # React Router config
│       ├── index.html           # HTML entry
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── package.json
│       └── README.md
│
├── packages/
│   ├── ui-lib/                  # OUTE-DS wrapper components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── sdk/                     # Shared business logic
│       ├── src/
│       │   ├── grid/            # Grid engine (Canvas)
│       │   ├── types/           # Common types
│       │   ├── utils/           # Utilities
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                 # Root monorepo
├── pnpm-workspace.yaml          # pnpm workspaces
└── tsconfig.base.json           # Base TypeScript config
```

---

## 📋 Rules Checklist

- [ ] **TECH-REACT-STRUCT-001** - Component structure will follow 16-step order
- [ ] **TECH-REACT-001** - Feature modules organized by feature
- [ ] **TECH-CSS-001** - SCSS Modules + OUTE-DS setup
- [ ] **TECH-FRONTEND-001** - Canvas grid foundation prepared
- [ ] TypeScript strict mode enabled
- [ ] Path aliases configured (`@/`, `@components/`, etc.)
- [ ] Environment variables documented
- [ ] No backend modifications

---

## 🚀 Implementation Prompt

Copy this entire section and provide it to Cursor AI along with the phase overview:

```
## Setup Sheet's Frontend Project (Phase 0)

You are helping rebuild Sheet's frontend from scratch. Before any coding, let's set up the project foundation.

### Context:
- Learn from Teable's monorepo structure (reference/teable/)
- Learn from old frontend (frontend/src/)
- Use React 18 + Vite (CSR only, no SSR)
- Use existing backend integration (no backend changes)
- Use Keycloak auth (no changes)
- Build custom Canvas grid (not Handsontable)
- Keep OUTE-DS for UI components
- Use SCSS Modules for styling
- Use Zustand for UI state + React Query for server state

### Task:
Create the complete project scaffolding with these files and folders:

1. **Root Configuration:**
   - package.json (monorepo root with pnpm workspaces)
   - pnpm-workspace.yaml (define workspaces)
   - tsconfig.base.json (base TypeScript config)

2. **Apps/web/ (Main React App):**
   - vite.config.ts (React + TypeScript + CSS Modules)
   - tsconfig.json (extends base config with path aliases)
   - package.json (dependencies for React, Vite, TypeScript, Router, Query, Zustand)
   - index.html (entry point)
   - src/main.tsx (React entry, ReactDOM.render)
   - src/App.tsx (root component with Router)
   - src/Router.tsx (React Router v6 setup with routes)
   - Complete folder structure (pages/, features/, components/, hooks/, store/, utils/, api/, types/, styles/)

3. **Packages/ui-lib/ (OUTE-DS Wrapper):**
   - package.json (package definition)
   - tsconfig.json (extends base)
   - src/index.ts (barrel export)
   - Folder structure (components/, types/)

4. **Packages/sdk/ (Grid & Shared Logic):**
   - package.json (package definition)
   - tsconfig.json (extends base)
   - src/index.ts (barrel export)
   - Folder structure (grid/, types/, utils/)

### Requirements:
- Use TypeScript strict mode
- Configure path aliases: @/, @components/, @features/, @hooks/, @utils/, @store/, @api/, @types/
- Support SCSS Modules
- Fast Refresh for development
- Proper environment variable handling (.env.example)
- All packages use consistent versions
- No backend API changes
- Document dependency versions clearly

### Reference Files:
- Teable: reference/teable/apps/nextjs-app/tsconfig.json (for path aliases)
- Teable: reference/teable/apps/nextjs-app/package.json (for dependencies)
- Old Frontend: frontend/package.json (for dependency versions)
- Old Frontend: frontend/src/routes/index.jsx (for Router pattern)

### Output:
Generate all the configuration files and project structure. Use actual React patterns shown in the references.
```

---

## ✅ Acceptance Criteria

After Phase 0, verify:

- [ ] **Project Structure Created**
  - [ ] `apps/web/` folder exists with complete structure
  - [ ] `packages/ui-lib/` folder exists
  - [ ] `packages/sdk/` folder exists
  - [ ] Root configuration files present

- [ ] **Build Configuration**
  - [ ] `vite.config.ts` properly configured for React
  - [ ] TypeScript strict mode enabled
  - [ ] Path aliases working (`@/`, `@components/`, etc.)
  - [ ] CSS Modules with SCSS support
  - [ ] Fast Refresh enabled for dev

- [ ] **Package Management**
  - [ ] `pnpm-workspace.yaml` defines all workspaces
  - [ ] Root `package.json` has workspaces defined
  - [ ] Dependencies consistent across packages
  - [ ] All necessary libraries installed

- [ ] **Entry Point**
  - [ ] `index.html` points to `src/main.tsx`
  - [ ] `main.tsx` initializes React app
  - [ ] `App.tsx` includes Router setup
  - [ ] `Router.tsx` has placeholder routes

- [ ] **Type Safety**
  - [ ] No TypeScript errors
  - [ ] All configs extend `tsconfig.base.json`
  - [ ] Strict mode enabled
  - [ ] Path aliases resolve correctly

- [ ] **Documentation**
  - [ ] `.env.example` created with required vars
  - [ ] `README.md` explains structure
  - [ ] Comments in config files explaining purpose

- [ ] **No Backend Changes**
  - [ ] Backend untouched
  - [ ] Keycloak auth unchanged
  - [ ] No modifications to existing APIs

---

## 📌 Next Phase

Once Phase 0 is complete and verified:
1. ✅ Project builds successfully (`pnpm build`)
2. ✅ Dev server starts (`pnpm dev`)
3. ✅ All type checks pass (`pnpm type-check`)
4. ✅ No linter errors (`pnpm lint`)

→ **Move to Phase 1: Auth & Routing**

