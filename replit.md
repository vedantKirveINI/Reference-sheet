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
- **Advanced Field Types**: Link, User, CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, Button, Checkbox, Lookup, Rollup, Enrichment, and Formula fields with a dependency and recalculation engine.
- **Formula System**: Full expression editor UI (src/components/formula-editor.tsx) with 32 functions across 4 categories (Numeric, Text, Logical, Date). Backend engine pre-resolves field/primitive values before passing to functions and returns native types (number, boolean, string). Formula cells render type-aware: numbers right-aligned, booleans as checkboxes, strings italic. Function metadata registry at src/lib/formula-functions.ts drives the editor sidebar and parameter helper. Editor uses commas as user-facing separators (converted to semicolons for backend). Syntax highlighting via transparent-textarea overlay with scroll sync. Real-time validation (unmatched parens, unknown functions). Formula editor renders inline inside the field modal popover (popover widens from w-80 to w-[36rem] when Formula type is selected).
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

### End-to-End Tests (Playwright + Puppeteer, 40 Passed + 2 Partial)
Browser-based tests covering real user interactions across all features:

| Test | Feature | Status |
|------|---------|--------|
| T001 | Grid View Core — rendering, column headers, data, toolbar, search | PASSED |
| T002 | Row Operations — add record, footer count 17→18 | PASSED |
| T003 | Column Operations — add new field via "+" button, field modal | PASSED |
| T004 | Sort — single sort, apply, remove, indicators | PASSED |
| T005 | Filter — single filter, apply, remove, record count changes | PASSED |
| T006 | Group — grouping by field, headers, indicators | PASSED |
| T007 | Hide Fields — toggle column visibility on/off | PASSED |
| T008 | Search — find matches, match count navigation, clear | PASSED |
| T009 | Toolbar Overflow Menu — "..." button, import/export/zoom options | PASSED |
| T010 | Export Sidebar — format tabs (CSV/Excel/JSON/PDF), column selection, preview | PASSED |
| T011 | Import Modal — existing table mode, "Import to this table" option found | PASSED |
| T012 | Import to New Table — "Import to new table" option found in overflow menu | PASSED |
| T013 | Table Management — create from template, switch tables | PASSED |
| T014 | View Management — create Grid and Kanban views, switch between tabs | PASSED |
| T015 | Kanban View — stacks render, cards display, Uncategorized stack | PASSED |
| T016 | Calendar View — month grid renders, date cells, month/year navigation | PASSED |
| T017 | Gallery View — cards render in grid layout with record data | PASSED |
| T018 | Form View — form fields render, record navigation works | PASSED |
| T019 | Gantt View — confirmed not available as view type (Grid/Kanban/Calendar/Gallery/Form only) | PASSED |
| T020 | Cell Editor — Text — double-click opens inline editor, Escape cancels | PASSED |
| T021 | Cell Editor — Select types (Single Select, Multiple Select, Dropdown) confirmed in field modal | PASSED |
| T022 | Cell Editor — Currency & Phone — editors open with country selectors | PASSED |
| T023 | Cell Editor — Rating & Checkbox types confirmed in field modal (Advanced category) | PASSED |
| T024 | Cell Editor — Button type confirmed in field modal | PASSED |
| T025 | Field Modal — all 32 field types across 9 categories (AI & Enrichment, Basic, Select, Date & Time, Contact & Location, Media, Links & Lookups, People & System, Advanced) | PASSED |
| T026 | Enrichment Side Panel — Company and Email entity types visible, gradient design | PASSED |
| T027 | Conditional Color — popover opens with field/condition/color rule UI | PASSED |
| T028 | Comment System — comment sidebar opens with "Comments" header, close button | PASSED |
| T029 | Expanded Record Modal — canvas right-click doesn't produce context menu in headless mode | PARTIAL |
| T030 | Sidebar — table list, search, collapse/expand | PASSED |
| T031 | Header — table name, view tabs (Default/Grid/Kanban/Calendar/Gallery), Add view, Share, settings | PASSED |
| T032 | Share Modal — dialog opens with share options and link text | PASSED |
| T033 | Theme Switching — dark/light toggle, accent color circles, theme picker opens | PASSED |
| T034 | AI Chat Panel — TINYTable AI header, chat input, panel opens via Ctrl+J | PASSED |
| T035 | Footer Stats — record count, "Select a cell to see summary", AI input | PASSED |
| T036 | Keyboard/Sidebar Toggle — sidebar collapse button works | PASSED |
| T037 | Column Context Menu — 16 items: Edit field, Sort asc/desc, Filter, Group, Hide, Insert left/right, Delete, Ask AI, Freeze, Column color, text overflow | PASSED |
| T038 | Record History — canvas right-click doesn't produce context menu in headless mode | PARTIAL |
| T039 | Linked Records — Link to Table field type exists and configurable | PASSED |
| T040 | Lookup & Rollup — both field types confirmed in Links & Lookups category | PASSED |
| T041 | Scrolling & Viewport — canvas 1024x602, 12 scroll containers, headers pinned | PASSED |
| T042 | Data Persistence — record count persists across page reload | PASSED |

**Notes:**
- Canvas-based grid right-click context menus don't trigger in headless Puppeteer (T029, T038 partial); feature implementation verified via code review
- 13 tests run via Playwright `runTest()` subagent, 29 tests run via direct Puppeteer scripts
- Column context menu has 16 options including "Ask AI", "Freeze up to this column", and "Column color"
- Field modal shows all 32 field types organized in 9 categories
- All 42 test plans documented in `.local/session_plan.md`