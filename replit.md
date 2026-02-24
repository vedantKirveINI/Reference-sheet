# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, aiming to replicate and enhance functionalities similar to Airtable. Built with React, Vite, and TypeScript, it focuses on high performance, scalability, and an improved user experience, particularly through a canvas-based grid view and a Kanban board. The application offers comprehensive CRUD operations for data management and integrates AI capabilities for natural language data interaction. It seeks to modernize a legacy codebase using current best practices.

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
- **Comment Indicators**: Simple speech bubble icon on row headers (fetched via `/comment/counts-by-table` endpoint).
- **Enrichment Fields**: AI-powered data enhancement with Company/Person/Email enrichment types. Parent enrichment field creates child output columns with purple-tinted headers, collapse/expand grouping, play button trigger in empty cells, loading state during processing, and "Enrich All Records" in column header context menu. Config at `src/config/enrichment-mapping.ts`. APIs: createEnrichmentField, processEnrichment, processEnrichmentForAll. Enrichment creation uses a **connected side panel** (not inline) — when "Enrichment" type is selected in the add-field popover, a side panel appears attached to the right (or left if near screen edge) with entity type cards, identifier mapping, output field selection, and auto-update toggle. Side panel component: `EnrichmentSidePanel` in `field-modal.tsx`. Side panel has AI-forward design: gradient header (purple→blue), gradient text, floating sparkle animation, glow effects on selected cards, backdrop-blur on inputs, and pulse animations. Column store synced via `useEffect` in `grid-view.tsx` to populate identifier mapping dropdowns. CSS animations (`animate-float`, `animate-pulse-smooth`) defined in `src/index.css`.
- **Export Sidebar**: Export functionality uses a right slide-in sidebar panel (not a centered modal) with CSV, Excel, JSON, and PDF formats.
- **Hide Fields Popover**: Hide fields uses a toolbar dropdown popover (matching Filter/Sort/Group pattern), not a modal.
- **Row Header UX**: Row numbers always visible on hover alongside checkbox and expand controls; single-click expand icon opens record detail.
- **Template-Driven Table Creation**: "New Table" button opens a modal (`src/components/create-table-modal.tsx`) with 6 predefined templates (CRM Contacts, Sales Pipeline, Content Calendar, Project Tracker, Bug Tracker, Inventory) plus a blank table option with custom name input. Templates defined in `src/config/table-templates.ts`. Uses `create_table` + `create_multiple_fields` API endpoints to create table with proper schema. Each template specifies field names and types (SHORT_TEXT, NUMBER, DATE).

### Data Management
- **Prisma Schema**: Defines models like Space, Base, TableMeta, Field, View, Comment, AiConversation, etc., with camelCase Prisma fields mapped to snake_case DB columns.
- **Seed Data**: `sheets-backend/src/dataMigration/seed-demo-data.ts` creates 3 tables (Companies 15 records, Contacts 10 records, Pipeline 8 deals) with real GTM data via API endpoints. Uses `fields_info` format with numeric field IDs for `create_record`. Removes default empty records via `update_records_status`. Run with `npx tsx src/dataMigration/seed-demo-data.ts`.
- **Cached Plan Recovery**: When PostgreSQL raises "cached plan must not change result type" (after ALTER TABLE from field creation), `record.service.ts` throws a `CachedPlanError`. The HTTP controller (`withCachedPlanRetry`) and WebSocket gateway catch it, call `$disconnect()/$connect()` on PrismaClient to reset the connection pool (NOT `DEALLOCATE ALL` which breaks Prisma's internal prepared statements), then retry the query.
- **WebSocket Data Flow**: Real-time updates for records via Socket.IO, with client-side room management.
- **Frontend Sheet Resolution**: `useSheetData.ts` fallback logic iterates sheets in reverse order, looking for one with active tables (skips empty auto-created sheets).

## External Dependencies
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (leveraging Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd
- **AI Integration**: OpenAI GPT-4.1 via Replit AI Integrations