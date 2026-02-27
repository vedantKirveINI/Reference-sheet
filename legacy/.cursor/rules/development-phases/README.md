# Sheet Development Roadmap
**Phased Frontend Rebuild - React + Vite (CSR)**

## Overview

This directory contains individual development phases for rebuilding Sheet's frontend from scratch. Each phase is designed to be completed independently but follows a logical sequence.

**Key Principles:**
- ✅ Learn from Teable's architecture (monorepo, component patterns, layout structure)
- ✅ Learn from old frontend code (existing integrations, API patterns, WebSocket usage)
- ✅ Follow all rules defined in `/cursor/technical/` and `/cursor/functional/`
- ✅ Build a custom Canvas-based grid (not Handsontable)
- ✅ Keep backend integration minimal (no changes to backend unless critical)
- ✅ Maintain Keycloak authentication (no changes to auth)

---

## Phase Structure

Each phase file includes:
1. **Phase Overview** - What will be built and why
2. **Reference Analysis** - How Teable and old code solve similar problems
3. **Rules Checklist** - Which rules apply to this phase
4. **Implementation Prompt** - Copy-paste prompt for Cursor AI to code the phase
5. **Acceptance Criteria** - How to verify the phase is complete

---

## Phases

| Phase | File | Priority | Duration | Status |
|-------|------|----------|----------|--------|
| 0 | `phase-0-project-setup.md` | CRITICAL | 1-2 days | Ready ✅ |
| 1 | `phase-1-auth-routing.md` | CRITICAL | 2-3 days | Ready ✅ |
| 2 | `phase-2-layout-structure.md` | CRITICAL | 2-3 days | Ready ✅ |
| 3 | `phase-3-canvas-grid-foundation.md` | CRITICAL | 5-7 days | Ready ✅ |
| 4 | `phase-4-cell-rendering.md` | CRITICAL | 3-4 days | Ready ✅ |
| 5 | `phase-5-cell-editing.md` | HIGH | 3-4 days | Ready ✅ |
| 6 | `phase-6-selection-interaction.md` | HIGH | 2-3 days | Ready ✅ |
| 7 | `phase-7-column-row-operations.md` | HIGH | 2-3 days | Ready ✅ |
| 8 | `phase-8-views-switching.md` | HIGH | 3-4 days | Ready ✅ |
| 9 | `phase-9-realtime-sync.md` | HIGH | 2-3 days | Ready ✅ |
| 10 | `phase-10-forms-ui.md` | MEDIUM | 2-3 days | Ready ✅ |
| 11 | `phase-11-filters-sorting.md` | MEDIUM | 2-3 days | Ready ✅ |
| 12 | `phase-12-mobile-responsive.md` | MEDIUM | 2-3 days | Ready ✅ |

---

## How to Use These Phases

### Before Starting a Phase

1. **Read the phase file** completely
2. **Study the Reference Analysis** section
3. **Review the applicable rules** from `/cursor/technical/`
4. **Understand the acceptance criteria**

### Implementing a Phase

1. **Copy the Implementation Prompt** from the phase file
2. **Paste it into Cursor AI** with context
3. **Let Cursor AI generate the code**
4. **Verify against Acceptance Criteria**
5. **Run tests and linters**

### Starting the Next Phase

1. Mark current phase as **COMPLETE** in this README
2. Read the next phase file
3. Repeat the process

---

## Reference Codebase Learning

### From Teable (`reference/teable`)

**Architecture Patterns:**
- Monorepo structure with `apps/`, `packages/`, `plugins/`
- Feature-based organization (`features/`)
- Layout pattern: `AppLayout` → `BaseLayout/SpaceLayout` → Page content
- Provider hierarchy for global state
- Server-side props for data hydration

**Key Files to Reference:**
- `apps/nextjs-app/src/features/app/layouts/BaseLayout.tsx` - Layout structure
- `apps/nextjs-app/src/pages/base/[baseId]/[tableId]/[viewId].tsx` - Page routing
- `apps/nextjs-app/src/features/app/blocks/table/Table.tsx` - Table component pattern
- `apps/nextjs-app/src/features/app/blocks/view/*/` - Different view implementations

**Concepts to Adopt:**
- Context-based provider pattern for shared state
- Server data hydration with React Query
- Session/Authentication via SessionProvider
- Localization with next-i18n

### From Old Frontend (`frontend/src`)

**Existing Integration:**
- Keycloak authentication (keep as-is)
- WebSocket client connection setup (`websocket/client`)
- OUTE-DS component usage
- Handsontable integration (to be replaced with Canvas)
- Router-based page organization

**Key Files to Reference:**
- `pages/WelcomeScreen/index.jsx` - Main application page
- `pages/WelcomeScreen/hooks/useHandsontable.ts` - Data loading and state
- `routes/index.jsx` - React Router setup
- `components/AuthRoute/index.jsx` - Auth protection pattern
- `App.jsx` - Root component structure

**Concepts to Keep:**
- Route protection via AuthRoute component
- Socket.io integration for real-time updates
- OUTE-DS component library
- Keycloak authentication (no changes)

---

## Technology Stack (Confirmed)

**Frontend:**
- React 18 (Functional components, Hooks)
- Vite (Build tool, fast dev server)
- React Router 6 (Client-side routing)
- React Query (Server state management)
- Zustand (UI state management)
- Canvas 2D API (Grid rendering)
- OUTE-DS (UI components)
- SCSS Modules (Styling)

**Backend (NO CHANGES):**
- NestJS (Existing, keep as-is)
- Keycloak (Auth, keep as-is)
- WebSocket (Real-time sync via Socket.io-client)
- Prisma (ORM, no schema changes needed)

---

## Recommended Order

**Foundation (Phases 0-2):** Get the project structure, auth, and routing working
→ **Core Grid (Phases 3-7):** Build the canvas grid and interactions
→ **Views & Operations (Phases 8-11):** Add different views and complex features
→ **Polish (Phase 12):** Mobile responsive and UX refinements

---

## Key Rules for Development

When implementing any phase, always reference:

1. **TECH-REACT-STRUCT-001** - Component structure & ordering (16 steps)
2. **TECH-REACT-STRUCT-002** - Hook structure & ordering (13 steps)
3. **TECH-REACT-STRUCT-003** - Best practices
4. **TECH-REACT-001** - Feature module structure
5. **TECH-FRONTEND-001** - Canvas grid architecture
6. **TECH-CSS-001** - CSS architecture (OUTE-DS + CSS Modules)
7. **Relevant TECH-* rules** for the specific phase

---

## Getting Help

For each phase:
1. Read the "Reference Analysis" section first
2. Check the "Rules Checklist"
3. Use the "Implementation Prompt" verbatim
4. Verify "Acceptance Criteria"

If stuck:
1. Look at the reference codebase files mentioned
2. Review the applicable rules
3. Ask for specific clarification on implementation details

---

## Notes

- **No backend changes**: Use existing APIs as-is
- **Keep auth simple**: Keycloak handles authentication, no modifications
- **Focus on UI**: This rebuild is primarily a frontend exercise
- **Learn iteratively**: Each phase builds on the previous one
- **Reference often**: Teable and old code have proven patterns

---

**Status:** Ready to begin Phase 0
**Next Step:** Read `phase-0-project-setup.md`

