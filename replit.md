# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, similar to Airtable, built with React + Vite + TypeScript. It features a high-performance, canvas-based grid view, a Kanban board, and comprehensive CRUD operations for data management. It focuses on performance, scalability, and an enhanced user experience, aiming to rebuild a legacy codebase with modern best practices.

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
- **Styling**: Tailwind CSS v4, shadcn/ui components, Radix UI primitives
- **Grid Rendering**: Canvas 2D API
- **State Management**: Zustand
- **Kanban DnD**: @hello-pangea/dnd
- **Icons**: lucide-react

### Core Features and Implementations
- **Canvas Grid**: High-performance rendering for 22 cell types, multi-cell selection, keyboard navigation, footer statistics, and context menus. Includes rich cell editors.
- **Kanban View**: Drag-and-drop functionality and customizable cards.
- **Calendar View**: Displays records based on DateTime/CreatedTime fields.
- **Gantt View**: Horizontal timeline with split panel and synchronized scrolling.
- **Modals and Popovers**: Comprehensive modals for sorting, filtering, grouping, field management, data export/import, and sharing.
- **Visual Feedback**: Active toolbar, column highlights, and enrichment grouping.
- **View & Table Management**: Full CRUD operations for views and tables.
- **Expanded Record**: Detailed view with navigation, actions, and all field type editors.
- **Footer Bar**: Displays record count, contextual column summaries, and an AI chat trigger.
- **AI Chat Panel**: Full-featured sliding panel for natural language data interaction, streaming GPT-4.1 responses, conversation persistence, and action generation (filter/sort/group/conditional coloring, cross-base queries, record CRUD, formula generation). Includes rich markdown rendering, "TINYTable AI" persona, thinking indicators, message actions, and onboarding.
- **Field Operations**: Create, update, and delete fields via REST APIs with optimistic UI.
- **Teable-style UX/Layout**: Overhauled toolbar, redesigned popovers, enhanced search, refined view pills, resizable sidebar, and improved header layout.
- **Cell Editor Enhancements**: Integrated country database, validators, and formatters for specific field types; simplified inline editors.
- **Cell Editor Positioning**: Google Sheets-level editor overlay with zoom-aware CSS transform scaling, position clamping to container bounds, preventScroll focus, scroll-state preservation on close, and ref-based direct DOM repositioning during scroll for zero-jitter tracking.
- **Additional Views**: Gallery View and Form View.
- **Undo/Redo System**: Application-wide undo/redo for cell changes.
- **Persistence**: Locked/pinned view IDs persisted in localStorage.
- **New Field Types**: Link, User, CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, Button, Checkbox, Lookup, and Rollup.
- **Link Field System**: Supports bidirectional linking with parameterized SQL and cascade cleanup.
- **Lookup & Rollup**: Computed fields with dependency resolution, aggregate functions, and type-aware validation.
- **Dependency & Recalculation Engine**: Tracks field dependencies, uses topological sort for calculation order, and batch-recalculates values via Socket.IO.
- **Field Validation**: `isRequired` and `isUnique` constraints enforced.
- **Comment System**: Full CRUD with threading, reactions, and soft deletes.
- **Button Field**: Tracks clicks with `openUrl`/`runScript` actions, click limits, and confirmation dialogs.
- **System Field Auto-Population**: `__created_by`/`__last_updated_by` from JWT and `__auto_number` via SERIAL.
- **Field Defaults**: Checkbox and User fields support `defaultValue`.
- **Collaborator Components**: UserAvatar, UserAvatarGroup, and CollaboratorPicker.
- **Cell Editors**: Dedicated editors for new field types.
- **Cross-Table Record Navigation**: Clickable linked record chips for multi-level drilling.
- **Field Modal Categories**: Reorganized for better discoverability.
- **Multi-Selection**: Enhanced column header selection, Shift+Arrow key cell range extension, and coordinated selections.
- **Text Wrap/Clip/Overflow**: Per-field text display modes with dynamic row heights and icon indicators.
- **Conditional Row Coloring**: Multi-rule conditional coloring with AND/OR condition groups and background colors.
- **Find & Replace**: Floating island panel with search, replace, and navigation.

### Server-Side Filter/Sort/Group
- **Filter/Sort/Group operations run server-side** on the backend (not client-side) to handle 10,000+ records correctly
- Backend reads view-level filter/sort/group config from the View model when fetching records
- REST endpoints (`/view/update_filter`, `/view/update_sort`, `/view/update_group_by`) persist config changes with `should_stringify: true`
- After persisting, backend re-fetches records and emits `recordsFetched` + `sort_updated`/`filter_updated`/`group_by_updated` socket events
- Frontend `processedData` useMemo only does: client-side search filtering + server-provided group header injection
- Group points fetched from `GET /record/group-points` endpoint, supports up to 3 nested levels (depth 0, 1, 2)
- Group header records use `__group__` ID prefix and `__group_meta__` cell key for metadata
- Collapse/expand logic tracks active group keys per depth level for proper ancestor tracking
- Sort uses `NULLS LAST` for both ASC and DESC to keep empty records at the bottom
- View config sync: `_currentView` effect triggers on viewId + serialized sort/filter/group keys

### Backend Integration
- **Backend**: NestJS server at port 3000.
- **AI Service**: Express/TypeScript server at port 3001, using OpenAI GPT-4.1 via Replit AI Integrations.
- **Database**: PostgreSQL (Replit Helium).
- **Cache**: Redis (in-memory, started by Backend API workflow).
- **Socket.IO**: For real-time updates.
- **Auth**: Dev mode bypass with JWT (ENV=development bypasses external permission checks).
- **Package Manager**: pnpm (private npm registry at npm.gofo.app for sheets-backend).

### Prisma Schema (sheets-backend/prisma/schema.prisma)
- Schema restored to match original production schema (Feb 2026)
- Models: Space, Base, TableMeta, field, View, DataStream, TriggerSchedule, ScheduledTrigger, Ops, Reference, comments, ai_conversations, ai_messages, ai_approved_contexts
- Column naming: All models use snake_case columns with @map annotations. Table names are snake_case with @@map.
- All original columns, types, @map annotations, relations, and indexes preserved exactly
- Feature columns added: status (Space, Base, TableMeta, View, DataStream, ScheduledTrigger), source (Base), orderColumn (View), isLocked (View), lookupOptions/order/enrichment/hasError/expression (field)
- No unused columns: isPrimary, isComputed, isRequired, isUnique, isDefault, trigger_time all removed
- ScheduledTrigger includes tableId, originalFieldId, originalTime columns for time-based trigger tracking
- Reference model tracks field-to-field dependencies for computed field recalculation
- Database synced via `prisma db push` (not migrations) due to schema/migration column naming discrepancies

### Seed Data
- Sheet "TINYTable Demo" with Projects (8 records, 18+ fields) and Tasks (10 records, 10 fields)
- Advanced fields: Link (Tasks→Projects), CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, User (Assigned To), Button (Open)
- 11 sample comments across projects and tasks
- Seed scripts: `scripts/seed-test-data.cjs`, `scripts/seed-advanced-fields.cjs`
- Seed result stored in `seed-result.json` with baseId, tableIds, viewIds, recordIds
- VITE_DEFAULT_SHEET_PARAMS env var points frontend to the seeded sheet

### Debug Seed Data
- Sheet "Field Type Debug" with 150 records covering all 29 field types for stress testing
- Seed script: `scripts/seed-debug-table.cjs` (run with `node scripts/seed-debug-table.cjs`)
- Seed result stored in `seed-debug-result.json`
- Creates fields via API, then populates all data via direct SQL (parameterized queries) to bypass the backend's `logUpdateHistory` raw SQL issue with special characters
- Field types covered: SHORT_TEXT, LONG_TEXT, SCQ, MCQ, NUMBER, CURRENCY, RATING, SLIDER, OPINION_SCALE, CHECKBOX, DATE, TIME, EMAIL, PHONE_NUMBER, ADDRESS, ZIP_CODE, YES_NO, LIST, RANKING, DROP_DOWN, DROP_DOWN_STATIC, SIGNATURE, FILE_PICKER, AUTO_NUMBER, CREATED_BY, LAST_MODIFIED_BY, LAST_MODIFIED_TIME, USER, BUTTON
- Data distribution: Records 1-30 normal, 31-55 small/minimal, 56-80 large/max, 81-105 edge cases (unicode, boundary), 106-130 sparse (random nulls), 131-150 invalid/malformed

### WebSocket Data Flow
- `getRecord` event: backend fetches records and broadcasts to viewId room via `server.to(viewId).emit('recordsFetched', ...)`. Also sends directly to requesting client socket as fallback if client hasn't joined the room yet (race condition fix).
- `joinRoom`/`leaveRoom`: clients manage room membership for real-time updates. Initial load joins both tableId and viewId rooms.
- Header uses placeholder view IDs (`default-grid`, `default-kanban`) before real views load. Click handlers guard against these placeholder IDs to prevent invalid backend requests.
- Socket singleton (`src/services/socket.ts`): checks `socket.connected || socket.active` to prevent duplicate connections from React StrictMode double-mounting; `disconnectSocket()` calls `removeAllListeners()` before `disconnect()`.

### Per-Table Record History / Audit Trail
- Each user table gets a companion `_history` table (e.g., `"baseId"."tableId_history"`) created automatically
- History table schema: `id SERIAL`, `record_id INTEGER`, `field_id VARCHAR`, `field_name VARCHAR`, `before_value JSONB`, `after_value JSONB`, `action VARCHAR` (create/update/delete), `changed_by JSONB`, `changed_at TIMESTAMPTZ`
- Index on `(record_id, changed_at DESC)` for fast per-record lookups
- Logging hooks in `RecordService`: `createRecord`/`createRecordV2` (field-level create entries), `updateRecord`/`updateRecordColumns`/`updateRecordsByFilters` (before/after diffs), `updateRecordsStatus` (delete snapshots)
- Deduplication guard in `logUpdateHistory`: checks for existing entries with same record_id, field_id, and action within 2-second window to prevent duplicate history writes from concurrent events
- `changed_by` stored as `{"id": "user-id"}` JSONB; frontend reads `id`, `name`, `email`, or `user_id` keys
- Backfill migration runs on startup to create history tables for pre-existing tables
- API endpoint: `GET /record/history?tableId=&baseId=&recordId=&page=&pageSize=`
- Frontend: `RecordHistoryPanel` component in expanded record modal, toggled via clock icon button
- Frontend API: `getRecordHistory()` in `src/services/api.ts`

### Link Field System
- Link fields use FK columns (`__fk_{fieldId}` / `__fk_{fieldId}_ref`) for relationships, NOT the field's `dbFieldName`
- `resolveLinkFields` in `link-field.service.ts` resolves linked record display values at query time
- Virtual field types (LINK, LOOKUP, ROLLUP, FORMULA) are excluded from `lookupDbFieldName` resolution to prevent SQL errors referencing nonexistent columns
- Symmetric link fields (OneMany side) use `lookupFieldId` pointing to the primary field of the foreign table for display titles

### Internationalization (i18n)
- Framework: `react-i18next` + `i18next` + `i18next-browser-languagedetector`
- Config: `src/i18n.ts`, initialized in `src/main.tsx`
- Translation files: `src/locales/{lang}/common.json` (namespace-based)
- Languages: English (en) as default, Spanish (es) as proof-of-concept
- 59+ frontend files have strings extracted and replaced with `t()` calls
- Language switcher in sidebar bottom (globe icon), persists selection to localStorage
- Covers: layout, grid, kanban, calendar, gallery, gantt, form, sharing, comments, editors, record history

## External Dependencies
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd
- **AI Integration**: OpenAI GPT-4.1 via Replit AI Integrations