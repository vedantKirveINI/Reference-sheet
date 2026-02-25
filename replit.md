# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, aiming to replicate and enhance functionalities similar to Airtable. Built with React, Vite, and TypeScript, it focuses on high performance, scalability, and an improved user experience, particularly through a canvas-based grid view and a Kanban board. The application offers comprehensive CRUD operations for data management and integrates AI capabilities for natural language data interaction. It seeks to modernize a legacy codebase using current best practices.

## Running the Application

### Three Services
1. **Frontend** (port 5000): `npm run dev` — Vite dev server serving the React app
2. **Backend API** (port 3000): NestJS backend with Redis — `redis-server --daemonize yes ... && node dist/main.js`
3. **AI Service** (port 3001): Express/TypeScript AI service — `npx tsx src/server.ts`

### Required Environment Variables
- `ENV=development` — Bypasses external permission API, grants full owner access
- `JWT_SECRET=hockeystick` — Matches hardcoded symmetric key in token.utils.ts
- `REDIS_HOST=127.0.0.1` — Redis connection host
- `REDIS_PORT=6379` — Redis connection port
- `VITE_DEFAULT_SHEET_PARAMS` — Base64-encoded JSON with keys `a` (baseId), `t` (tableId), `v` (viewId)
- `VITE_AUTH_TOKEN` — JWT token for API authentication (set in .env)
- `OPENAI_API_KEY` — (Optional) Required only for AI features; service starts without it

### Backend Build & Deploy
- Backend uses **pnpm** with private registry at `https://npm.gofo.app/` (auth token in `sheets-backend/.npmrc`)
- After any backend source changes: `cd sheets-backend && pnpm run build` then restart Backend API workflow
- Prisma migrations: `cd sheets-backend && npx prisma migrate deploy`

### Seeding Data
- Run `node scripts/seed-test-data.cjs` to populate demo data (requires Backend API running)
- Creates "TINYTable Demo" sheet with Projects (8 records) and Tasks (10 records) tables
- Generates `seed-result.json` with IDs; update `VITE_DEFAULT_SHEET_PARAMS` accordingly
- Phone number fields use JSONB format: `{ countryCode, countryNumber, phoneNumber }`
- NUMBER fields require options: `{ allowNegative: boolean, allowFraction: boolean }`

### Current Seed IDs
- baseId: `GOY6LUyZOoz2pLr42XEd6Gnn`
- Projects table: `cmm1ty9nt00049ntx3n3a3541`, view: `cmm1ty9ol00059ntxja044wi5`
- Tasks table: `cmm1ty9xs000l9ntxppocgroj`, view: `cmm1ty9ye000m9ntxtsuf7byr`

## User Preferences
- Legacy folder must remain completely untouched
- Do NOT copy code from legacy - recreate fresh with best practices
- Canvas-based grid rendering (not HTML/CSS) for performance at scale
- Tailwind v4 with CSS-based configuration
- Island design pattern: UI elements float as self-contained, elevated islands (rounded corners, subtle shadows/depth, backdrop blur)
- Brand: TINYTable (green gradient #369B7D → #4FDB95), SVG logo at brand/tiny-sheet.svg, copied to src/assets/
- Brand color tokens: brand-50 through brand-900 defined in src/index.css @theme, primary color is #39A380
- Island CSS utilities: .island, .island-elevated, .island-subtle, .island-focus, .brand-gradient (all with dark mode variants)
- Theme system: Accent color presets (10 colors), dark/light mode toggle, URL param embedding (?theme=dark&accent=hex)
- Theme-aware header/footer with accent gradient tints, branded active view pills, sidebar highlights

## System Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI
- **State Management**: Zustand
- **Backend**: NestJS
- **AI Service**: Express/TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: Socket.IO

### Core Features
- **High-Performance Grid**: Canvas-based rendering supporting 22 cell types, multi-cell selection, keyboard navigation, and rich cell editors.
- **Multiple Views**: Kanban, Calendar, Gantt, Gallery, and Form views with full CRUD for views and tables.
- **AI Chat Panel**: A sliding panel for natural language interaction with data, streaming GPT-4.1 responses, conversation persistence, and action generation (filter, sort, group, conditional formatting, cross-base queries, record CRUD, formula generation).
- **Advanced Field Types**: Link, User, CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, Button, Checkbox, Lookup, and Rollup with a dependency and recalculation engine.
- **Server-Side Operations**: Filter, sort, and group operations are processed server-side for scalability with large datasets.
- **Record History/Audit Trail**: Per-table history tracking with `before_value` and `after_value` for changes.
- **Internationalization (i18n)**: 4 languages (English, Spanish, Arabic, Portuguese) via `react-i18next` with 3 namespaces (common, grid, views). Toolbar, field modal, sort/group/filter modals, and cell editors all use `t()` translation calls.
- **Workflow CTA**: Island-styled sidebar card linking to future workflow automation builder.
- **UI/UX Enhancements**: Teable-style layout, overhauled toolbar, redesigned popovers, enhanced search, resizable sidebar, and improved cell editor positioning.
- **Column Color Persistence**: Column colors are saved via `updateColumnMeta` using the backend's array format `[{id: numericFieldId, color: "#hex"}]`. The color-loading `useEffect` reads `columnMeta` from the view, matches by `String(c.rawId) === fieldId`, and populates `useUIStore.columnColors`. Dependencies: `_currentView?.id`, `_currentView?.columnMeta`, `currentTableId`, `activeData?.columns?.length`. Hide-field persistence also uses the array format with `is_hidden` and `width`.
- **Comment Indicators**: Dedicated auto-hiding comment column between row header and first data column. When any row has comments, a 28px-wide column appears showing speech bubble icons on commented rows. When no rows have comments, the column hides completely (zero width). Implemented via `effectiveRowHeaderWidth` getter in `renderer.ts` and dynamic `rowHeaderWidth` in `CoordinateManager`. Comment counts fetched via `/comment/counts-by-table` endpoint.
- **Persistent Comment Sidebar**: Always-visible 320px comment panel on the right side of the grid. Clicking any row or comment icon updates the sidebar to show that record's comments. State managed via `commentSidebarRecordId` in `useGridViewStore`. Comment column clicks (between `rowHeaderWidth` and `effectiveRowHeaderWidth`) are intercepted in `grid-view.tsx` `handleClick` to set the sidebar record. `CommentPanel` rendered in `App.tsx` alongside the grid view area. Shows placeholder when no record is selected.
- **Enrichment Fields**: AI-powered data enhancement with Company/Person/Email enrichment types. Parent enrichment field creates child output columns with purple-tinted headers, collapse/expand grouping, play button trigger in empty cells, loading state during processing, and "Enrich All Records" in column header context menu. Config at `src/config/enrichment-mapping.ts`. APIs: createEnrichmentField, processEnrichment, processEnrichmentForAll. Enrichment creation uses a **connected side panel** (not inline) — when "Enrichment" type is selected in the add-field popover, a side panel appears attached to the right (or left if near screen edge) with entity type cards, identifier mapping, output field selection, and auto-update toggle. Side panel component: `EnrichmentSidePanel` in `field-modal.tsx`. Side panel has AI-forward design: gradient header (purple→blue), gradient text, floating sparkle animation, glow effects on selected cards, backdrop-blur on inputs, and pulse animations. Column store synced via `useEffect` in `grid-view.tsx` to populate identifier mapping dropdowns. CSS animations (`animate-float`, `animate-pulse-smooth`) defined in `src/index.css`.
- **Export Sidebar**: Export functionality uses a right slide-in sidebar panel (not a centered modal) with CSV, Excel, JSON, and PDF formats.
- **Hide Fields Popover**: Hide fields uses a toolbar dropdown popover (matching Filter/Sort/Group pattern), not a modal.
- **Row Header UX**: Row numbers always visible on hover alongside checkbox and expand controls; single-click expand icon opens record detail.
- **Template-Driven Table Creation**: "New Table" button opens a modal (`src/components/create-table-modal.tsx`) with 6 predefined templates (CRM Contacts, Sales Pipeline, Content Calendar, Project Tracker, Bug Tracker, Inventory) plus a blank table option with custom name input. Templates defined in `src/config/table-templates.ts`. Uses `create_table` + `create_multiple_fields` API endpoints to create table with proper schema. Each template specifies field names and types (SHORT_TEXT, NUMBER, DATE).

### Data Management
- **Prisma Schema**: Defines models like Space, Base, TableMeta, Field, View, Comment, AiConversation, etc., with camelCase Prisma fields mapped to snake_case DB columns.
- **Seed Data**: `scripts/seed-test-data.cjs` creates demo data via API endpoints. Phone numbers must be JSONB objects `{ countryCode, countryNumber, phoneNumber }`. NUMBER fields require `{ allowNegative, allowFraction }` options.
- **Cached Plan Recovery**: When PostgreSQL raises "cached plan must not change result type" (after ALTER TABLE from field creation), `record.service.ts` throws a `CachedPlanError`. The HTTP controller (`withCachedPlanRetry`) and WebSocket gateway catch it, call `$disconnect()/$connect()` on PrismaClient to reset the connection pool (NOT `DEALLOCATE ALL` which breaks Prisma's internal prepared statements), then retry the query.
- **WebSocket Data Flow**: Real-time updates for records via Socket.IO, with client-side room management.
- **Frontend Sheet Resolution**: `useSheetData.ts` fallback logic iterates sheets in reverse order, looking for one with active tables (skips empty auto-created sheets).

## External Dependencies
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (leveraging Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd
- **AI Integration**: OpenAI GPT-4.1 via Replit AI Integrations
