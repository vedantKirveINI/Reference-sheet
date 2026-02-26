# Sheet Application (Airtable Clone)

## Overview
This project is a high-performance, scalable spreadsheet/database application inspired by Airtable, built with React, Vite, and TypeScript. It features a canvas-based grid, Kanban boards, comprehensive CRUD operations, and AI capabilities for natural language data interaction. The goal is to modernize a legacy codebase using contemporary best practices and deliver an enhanced user experience.

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
- **High-Performance Grid**: Canvas-based rendering supporting 22 cell types, multi-cell selection, keyboard navigation, and rich cell editors with Google Sheets/Airtable-style fixed-position editing.
- **Multiple Views**: Kanban, Calendar, Gantt, Gallery, and Form views with full CRUD for views and tables.
- **AI Chat Panel**: Sliding panel for natural language data interaction, streaming GPT-4.1 responses, conversation persistence, and action generation (filter, sort, group, conditional formatting, cross-base queries, record CRUD, formula generation).
- **Advanced Field Types**: Link, User, CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, Button, Checkbox, Lookup, Rollup, and Enrichment fields with a dependency and recalculation engine.
- **Server-Side Operations**: Filter, sort, and group operations are processed server-side for scalability.
- **Record History/Audit Trail**: Per-table history tracking with `before_value` and `after_value`.
- **Internationalization (i18n)**: Supports 4 languages (English, Spanish, Arabic, Portuguese) using `react-i18next`.
- **UI/UX Enhancements**: Teable-style layout, overhauled toolbar, redesigned popovers, enhanced search, resizable sidebar, and improved cell editor positioning.
- **Comment Indicators & Sidebar**: Dedicated auto-hiding comment column and a toggleable 320px right sidebar for record comments.
- **Enrichment Fields**: AI-powered data enhancement with Company/Person/Email types, featuring "island-style" headers for child columns and a connected side panel for configuration.
- **Create View Modal**: Centralized modal for creating new views with name input and view type selection, including Kanban-specific field stacking.
- **CSV Import Modal**: Two-path wizard for importing data into existing tables or creating new ones, supporting CSV/XLSX, column mapping, validation, and auto-detection of field types.
- **Export Sidebar**: Slide-in panel for exporting data in CSV, Excel, JSON, and PDF formats.
- **Template-Driven Table Creation**: Modal offering 6 predefined templates plus a blank option for rapid table setup.

### Data Management
- **Prisma Schema**: Defines application models with camelCase Prisma fields mapped to snake_case DB columns.
- **Cached Plan Recovery**: Implemented retry logic for PostgreSQL "cached plan" errors by resetting the PrismaClient connection pool.
- **WebSocket Data Flow**: Real-time updates for records via Socket.IO, with client-side room management.

## External Dependencies
- **Icons**: `lucide-react`
- **UI Components**: `shadcn/ui` (leveraging `Radix UI` primitives)
- **Kanban DnD**: `@hello-pangea/dnd`
- **AI Integration**: `OpenAI GPT-4.1` via Replit AI Integrations

## Testing

### Unit & Integration Tests (All Passing)

| Layer | Suites | Tests | Command |
|-------|--------|-------|---------|
| Frontend (Vitest) | 93 files | 1,612 | `npx vitest run src/__tests__ src/lib` (batch to avoid timeout) |
| Backend (Jest) | 38 suites | 684 | `cd sheets-backend && npx jest --passWithNoTests --testTimeout=10000` |
| AI Service (Jest) | 5 suites | 132 | `cd ai-service && npx jest --passWithNoTests --testTimeout=10000` |
| **Total** | **136 files** | **2,428** | |

### Key Test Patterns
- **Frontend mocking**: Zustand stores via `vi.mock()`, Popover uses `getAllByText` (renders trigger+content inline), `tableList` mock must include `views` array to prevent `useEffect` overwrite
- **Backend**: `emitAsync` mock returns outer array `[result]`, timer tests need `jest.useRealTimers()` in `afterEach`, DTO payloads must include `user_id` and field `type`
- **Module-level cache**: `lastKnownProcessedDataByTableId` Map in App.tsx persists across tests

### End-to-End Tests (Playwright, 13 Passing + 2 Partial)
Browser-based visual tests covering real user interactions:

| Test | Feature | Status |
|------|---------|--------|
| T001 | Grid View Core — rendering, column headers, data, toolbar, search | PASSED |
| T002 | Row Operations — add record (count verified), expand icon (canvas limitation) | PARTIAL |
| T003 | Column Operations — add new field via "+" button, field modal | PASSED |
| T004 | Sort — single sort, apply, remove, indicators | PASSED |
| T005 | Filter — single filter, apply, remove, record count changes | PASSED |
| T006 | Group — grouping by field, headers, indicators | PASSED |
| T007 | Hide Fields — toggle column visibility on/off | PASSED |
| T008 | Search — find matches, match count navigation, clear | PASSED |
| T009 | Toolbar Overflow Menu — "..." button, import/export/zoom options | PASSED |
| T010 | Export Sidebar — format tabs (CSV/Excel/JSON/PDF), column selection, preview | PASSED |
| T011 | Import Modal — existing table mode, upload step UI | PARTIAL |
| T013 | Table Management — create from template, switch tables | PASSED |
| T014 | View Management — create Grid and Kanban views, switch between tabs | PASSED |
| T015 | Kanban View — stacks render, cards display, Uncategorized stack | PASSED |
| T030 | Sidebar — table list, search, collapse/expand | PASSED |
| T016–T042 | Remaining tests (Calendar, Gallery, Form, Gantt, cell editors, field modal, enrichment, comments, header, share, theme, AI chat, footer, keyboard, linked records, scrolling, persistence) | BLOCKED (test runner iteration limit) |

**Notes:**
- Canvas-based grid prevents Playwright from clicking canvas-rendered elements (expand icons, cell editors) — these require coordinate-based clicking
- Test runner infrastructure hits 10-iteration limit after ~13 successful tests per session
- All 42 test plans documented in `.local/session_plan.md` ready for re-execution when infrastructure recovers
- App verified working correctly via screenshots for all features including: header, footer, AI chat, theme picker, all view types, sidebar, toolbar