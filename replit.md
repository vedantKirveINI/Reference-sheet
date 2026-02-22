# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, similar to Airtable, built with React + Vite + TypeScript. It features a high-performance, canvas-based grid view, a Kanban board, and comprehensive CRUD operations for data management. It's a complete rebuild from a legacy codebase, focusing on performance, scalability, and an enhanced user experience.

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
- **Styling**: Tailwind CSS v4, shadcn/ui components, Radix UI primitives, dark mode
- **Grid Rendering**: Canvas 2D API
- **State Management**: Zustand
- **Kanban DnD**: @hello-pangea/dnd
- **Icons**: lucide-react

### Project Structure
The `src/` directory is organized into logical units:
- `App.tsx`: Main application entry point.
- `lib/`: Utility functions and mock data generation.
- `types/`: Type definitions.
- `hooks/`: Custom React hooks.
- `stores/`: Zustand stores for various application states.
- `services/`: API integration, data formatters.
- `components/`: Reusable UI components.
- `views/`: Distinct application views (grid, kanban, calendar, gantt, gallery, form).
- `auth/`: User authentication components.

### Core Features and Implementations
- **Canvas Grid**: High-performance rendering with support for 22 cell types, multi-cell selection, keyboard navigation, footer statistics, and context menus for extensive data manipulation. Includes rich cell editors specific to each field type (e.g., Address, Phone, File Upload, Ranking, SCQ/MCQ/DropDown).
- **Kanban View**: Drag-and-drop functionality, customizable cards, and per-stack record creation.
- **Calendar View**: Displays records based on DateTime/CreatedTime fields with navigation and overflow indicators.
- **Gantt View**: Horizontal timeline with split panel, date field selectors, scale toggles, and synchronized scrolling.
- **Modals and Popovers**: Comprehensive modals for sorting, filtering, grouping, field management, flexible data export (CSV/Excel/JSON), and a 4-step import wizard with auto-matching and validation. Share functionality with member management.
- **Visual Feedback**: Active toolbar buttons, column highlights for sorted/filtered/grouped data, and enrichment column grouping.
- **View & Table Management**: Full CRUD operations for views and tables via API, including inline renaming and confirmation dialogs.
- **Expanded Record**: Detailed view with navigation, actions (Delete/Duplicate/Copy URL), and all 22 field type editors.
- **Footer Bar**: Displays record count, contextual column summaries with aggregation, and an AI island chat popover.
- **Field Operations**: Create, update, and delete fields using REST APIs with optimistic UI updates.
- **Teable-style UX/Layout**: Overhauled toolbar, redesigned filter/sort/group popovers, enhanced search, refined view pill context menus, resizable sidebar, collaborator avatars, categorized field type selector, and improved header layout.
- **Cell Editor Enhancements**: Integrated country database, validators, and formatters for Currency, Phone Number, and Address fields. Simplified inline editors for Currency (symbol prefix) and Phone Number (compact with country code dropdown). MCQ/Dropdown auto-commit on blur, YesNo/Checkbox single-click toggle.
- **Additional Views**: Gallery View with responsive card grid and Form View with record sidebar.
- **Undo/Redo System**: Application-wide undo/redo for cell changes.
- **Persistence**: Locked/pinned view IDs persisted in localStorage.
- **New Field Types**: 10 new field types including Link (cross-table references), User, CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, Button, Checkbox, Lookup, and Rollup.
- **Link Field System**: Supports bidirectional linking (OneOne, OneMany, ManyOne, ManyMany) with parameterized SQL queries. OneOne uses DB-level unique constraints. Cascade cleanup on record delete removes junction/FK references and triggers recalculation.
- **Lookup & Rollup**: Computed fields with dependency resolution, 14 aggregate functions, and type-aware function validation. `hasError` flag for broken lookups when source link/field is deleted.
- **Dependency & Recalculation Engine**: `reference` table tracks field-to-field dependencies. FieldDependencyService manages dependency edges. DependencyGraphService uses recursive CTE + topological sort to determine calculation order. ComputedRecalcService batch-recalculates Lookup/Rollup values on data changes and broadcasts via Socket.IO (`computed_field_update` event).
- **Field Validation**: `isRequired` and `isUnique` constraints enforced during record creation/update.
- **Comment System**: Full CRUD with threading, reactions, and soft deletes, integrated into the expanded record modal.
- **Button Field**: Tracks clicks with `openUrl`/`runScript` actions, maxCount click limit, resetCount, and confirmation dialog support.
- **System Field Auto-Population**: `__created_by`/`__last_updated_by` from JWT and `__auto_number` via SERIAL. LastModifiedBy/Time supports selective field tracking via `trackedFieldIds` option.
- **Field Defaults**: Checkbox and User fields support `defaultValue` in options, auto-applied on record creation.
- **Collaborator Components**: UserAvatar, UserAvatarGroup, and CollaboratorPicker.
- **Cell Editors**: Dedicated editors for Link, User, Button, Checkbox, Lookup, and Rollup fields.
- **Field Modal Categories**: Reorganized categories for better discoverability.
- **Multi-Selection**: Enhanced column header selection (single/range), Shift+Arrow key cell range extension, and coordinated row/cell/column selections.
- **Text Wrap/Clip/Overflow**: Per-field text display modes (Clip, Wrap, Overflow) stored in per-column metadata (`columnTextWrapModes` in UI store). Set via toolbar dropdown (Google Sheets style) or column header right-click context menu. Canvas renderer resolves wrap mode per-column during painting. **Dynamic row heights**: CoordinateManager supports per-row variable heights via prefix sums and binary search; renderer auto-calculates row heights for wrapped text by measuring text width, capped at 300px. Overflow mode skips cell clipping for text overflow. Wrap/Overflow supported for String, Number, DateTime, CreatedTime, Currency, PhoneNumber, Address, Formula, AutoNumber, LastModifiedTime. Column headers show ↩/→ icon indicators for non-default wrap modes.
- **Conditional Row Coloring**: Multi-rule conditional coloring with AND/OR condition groups per rule. Each rule has multiple conditions (field, operator, value), conjunction logic, and background color. First-match-wins priority. Store-level sanitization ensures backward compatibility with old single-condition format. Dedicated popover UI with rule cards and condition management.
- **Find & Replace**: Floating island panel (420px) with spacious layout — search row with field selector/match counter/navigation, replace row with Replace/Replace All buttons. Accessible via Ctrl+F (find) and Ctrl+H (replace), Escape to close.

### API Endpoints (src/services/api.ts)
- **View**: `/view/create_view`, `/view/update_view`, `/view/delete_view`, `/view/get_views`, `/view/update_sort`, `/view/update_filter`, `/view/update_group_by`, `/view/update_column_meta`
- **Table**: `/table/create_table`, `/table/update_table`, `/table/update_tables`
- **Field**: `/field/create_field`, `/field/update_field`, `/field/update_fields_status`
- **Record**: `/record/update_records_status`
- **File**: `/file/get-upload-url`, `/file/confirm-upload`
- **Share**: `/asset/get_members`, `/asset/invite_members`, `/asset/share`, `/user-sdk/search`
- **Import**: `/table/add_csv_data_to_new_table`, `/table/add_csv_data_to_existing_table`
- **Export**: `/table/export_data_to_csv`
- **Sheet**: `/base/update_base_sheet_name`, `/sheet/create_sheet`, `/sheet/get_sheet`
- **Comment**: `/comment/create`, `/comment/list`, `/comment/count`, `/comment/update`, `/comment/delete/:id`, `/comment/reaction/add`, `/comment/reaction/remove`
- **Button**: `/record/button-click`

## Backend Integration (Local NestJS)
- **Backend**: Local NestJS server at port 3000 (`sheets-backend/`), proxied via Vite at `/api`
- **Database**: PostgreSQL (Neon-backed via Replit)
- **Cache**: Redis (local, port 6379, started inline with backend)
- **Socket.IO**: Backend on port 3000, frontend connects via Vite proxy
- **Auth**: Dev mode bypass with JWT token (365-day expiry), auto-injected via `VITE_AUTH_TOKEN`
- **VITE_API_BASE_URL**: Set to `/api` (proxied to `http://localhost:3000`)
- **Sheet Params**: `VITE_DEFAULT_SHEET_PARAMS` cleared; frontend auto-creates sheet on first load
- **Comment System**: Uses `public.__comments` table (TEXT columns for table_id/record_id), mapped to frontend's `created_by` nested format in API layer
- **Permission System**: Dev mode grants full access (`ENV=development`), guards bypassed for comments

### Verified Working Features (End-to-End)
- Sheet creation/loading via `create_sheet`/`get_sheet` with stale URL recovery
- Socket connection, room joining, record fetching (`getRecord`/`recordsFetched`)
- Cell editing (`row_update`), record creation (`row_create`), record deletion (`update_records_status`)
- Field CRUD (`create_field`, `update_field`, `update_fields_status`)
- View CRUD (`create_view`, `update_view`, `delete_view`, `get_views`)
- Table CRUD (`create_table`, `update_table`)
- Comment CRUD with threading, reactions, and soft deletes
- Member listing (`get_members` with dev mode mock data)
- Sort/Filter/Group updates via HTTP

## Test Data
- **Sheet**: "TINYTable Demo" (baseId: nL1BAPDEvZDC7BIoOMnhTkzo)
- **Projects Table** (cmly6jsee002flopwjq72seel): 8 records, 21 fields
  - Base fields: Name, Description, Status, Priority, Budget, Start Date, Contact Email, Contact Phone, Website URL, Active, Progress, Team Size, Tags
  - Advanced fields: CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, Assigned To (User), Open (Button), Tasks (Link - symmetric OneMany from Tasks), Task Count (Rollup - counts linked tasks)
- **Tasks Table** (cmly6jsoy002vlopwgvcgr7m8): 10 records, 11 fields
  - Base fields: Task Name, Description, Status, Priority, Assignee Email, Due Date, Hours Estimated, Urgent, Task Tags
  - Advanced fields: Project (Link - ManyOne to Projects), Project Budget (Lookup - retrieves Budget via Project link)
- **Comments**: 12 sample comments across both tables
- **Seed Script**: `scripts/seed-test-data.cjs` (run with `node scripts/seed-test-data.cjs`)
- **Advanced Fields Script**: `scripts/seed-advanced-fields.cjs` (run with `node scripts/seed-advanced-fields.cjs`)
- **Auto-load**: VITE_DEFAULT_SHEET_PARAMS env var points frontend to test sheet

## External Dependencies
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd