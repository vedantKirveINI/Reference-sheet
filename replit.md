# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, similar to Airtable, built with React + Vite + TypeScript. It leverages shadcn/ui and Tailwind CSS for a modern, responsive interface. The application features a high-performance, canvas-based grid view, a Kanban board, and comprehensive CRUD operations for data management. It's a complete rebuild from a legacy codebase, focusing on performance, scalability, and an enhanced user experience.

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
- **Styling**: Tailwind CSS v4, shadcn/ui components, Radix UI primitives, dark mode via .dark class + CSS variable overrides
- **Grid Rendering**: Canvas 2D API (high-performance, devicePixelRatio-aware, light/dark grid themes)
- **State Management**: Zustand (6 dedicated stores + theme state in ui-store)
- **Kanban DnD**: @hello-pangea/dnd (DragDropContext/Droppable/Draggable)
- **Icons**: lucide-react

### Project Structure
The `src/` directory is organized into logical units:
- `App.tsx`: Main application entry point and data processing.
- `lib/`: Utility functions and mock data generation.
- `types/`: Comprehensive type definitions for all application entities.
- `hooks/`: Custom React hooks, notably `useSheetData.ts` for backend integration.
- `stores/`: Zustand stores for managing UI state, view data, field configurations, grid interactions, modal controls, and statistics.
- `services/`: API integration (Axios, Socket.IO), data formatters, URL parameter handling.
- `components/`: Reusable UI components from shadcn/ui and custom layout components.
- `views/`: Contains distinct application views: `grid/`, `kanban/`, `calendar/`, `gantt/`, `gallery/`, and `form/`.
- `auth/`: User authentication components.

### Core Features and Implementations
- **Canvas Grid**: High-performance rendering with GridRenderer, CoordinateManager, and 22 Cell Painters. Supports devicePixelRatio scaling, scroll sync, sticky headers, column freezing, resizing, reordering.
- **Data Management**: 22 distinct cell types with specific rendering and editing.
- **User Interactions**: Multi-cell range selection, keyboard navigation, footer statistics, visual grouping.
- **Context Menus**: Header and record context menus with field CRUD, sorting, filtering, grouping, freezing, hiding.
- **Rich Cell Editors**: Type-specific editors for all 22 field types (Address, Phone, Signature, File Upload with presigned URL, Ranking with drag-reorder, enhanced SCQ/MCQ/DropDown).
- **Kanban View**: @hello-pangea/dnd drag-and-drop, stack-by field selection, customize cards popover, per-stack add record buttons, type-aware cell renderers on cards.
- **Calendar View**: Monthly calendar grid showing records on DateTime/CreatedTime fields, month navigation, today highlight, weekend styling, overflow "+N more" indicators, date field selector dropdown.
- **Gantt View**: Horizontal timeline with split panel (record list + timeline bars), start/end date field selectors, Day/Week/Month scale toggle, today line, bar tooltips, point events as diamonds, synced vertical scrolling.
- **Modals and Popovers**: Sort, Filter (with type-specific value inputs), Group, FieldModal, Export (format selection CSV/Excel/JSON, column selection, scope selection, encoding options, preview, progress), Import (4-step wizard: Upload CSV/XLSX → Column Mapping with fuzzy auto-match → Validation with row-level errors → Summary & Import with progress bar; backend API integration via `importToExistingTable`/`importToNewTable` with fallback to client-side record creation), Share (with member management).
- **Visual Feedback**: Active toolbar buttons with summary info, column highlights (sorted=blue, filtered=yellow, grouped=green). Enrichment column grouping with purple/indigo tint on headers and cells, collapse/expand chevron on parent headers, "+N fields" badge when collapsed, locked reorder (enrichment groups cannot be split), and hide-fields modal showing enrichment parent-child hierarchy.
- **View CRUD**: Create/rename/delete views via API, header view pills with inline rename, context menu, confirmation dialogs.
- **Table CRUD**: Create/rename/delete tables via API, sidebar table list with inline rename, delete confirmation.
- **Expanded Record**: Prev/Next navigation, Delete/Duplicate/Copy URL actions, all 22 field type editors.
- **Confirmation Dialogs**: Reusable ConfirmDialog component for all destructive actions.
- **Sheet Name Editing**: Persisted to backend via API.
- **Loading States**: TableSkeleton with animated pulse loading.
- **Footer Bar**: Three-zone footer — Left: record count + contextual column summary (hover-driven, with aggregation dropdown per column type), Center: AI island chat (Popover-based chat panel with message history, mock AI responses), Right: sort/filter/group badges (only visible when active).
- **Field Operations via REST**: Create (POST /field/create_field), Update (PUT /field/update_field), Delete (POST /field/update_fields_status) — all use REST APIs with optimistic UI updates and rollback on failure.
- **Teable-style UX Enhancements**: Toolbar overhaul, redesigned Filter/Sort/Group Popovers, enhanced SearchBar, enriched View Pill Context Menu, polished View Pills, resizable Sidebar, Collaborator Avatars, Search Canvas Integration, categorized Field Type Selector, and a refined Header layout.
- **Teable-style Layout Restructure**: Sidebar (tables-only) on left, Header+Toolbar+Content on right. "+ Add record" button in toolbar, enhanced Row header, Field Name Lines control, styled footer.
- **Cell Editor Migration**: Implemented country database, validators (Currency, Phone Number, Address), and formatters. Updated cell painters and cell editor overlay for Currency, Phone, and Address fields to handle structured data and display flags.
- **Additional Views**: Gallery View with responsive card grid, cover images, and field display. Form View with record sidebar, field-type-specific inputs, and navigation.
- **Undo/Redo System**: Zustand store with undo/redo stacks for cell changes.
- **Kanban Toolbar Controls**: StackedBy field selector and Customize Cards popover.
- **Fetch/Sync Button**: RefreshCw icon button in sub-header toolbar for non-default views.
- **Lock/Pin View Persistence**: localStorage-backed locked/pinned view ID sets.
- **Interactive Freeze Column Handle**: Drag handle for adjusting frozen column boundaries.
- **Row Header Checkboxes**: Canvas-rendered checkboxes for selection.
- **Dynamic Last Modify Timestamp**: localStorage-based tracking displayed in the header.
- **10 New Field Types**: Link (cross-table references), User (collaborator assignment), CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber (system fields), Button (clickable actions with openUrl/runScript), Checkbox (boolean toggle), Lookup (values from linked records), Rollup (aggregate linked data with 14 functions).
- **Link Field System**: Backend service with parameterized SQL queries (SQL injection prevention), bidirectional linking with symmetric link creation/deletion.
- **Lookup & Rollup**: Computed fields resolved in dependency order (Link → Lookup → Rollup). 14 rollup functions: countall, counta, count, sum, average, max, min, and, or, xor, array_join, array_unique, array_compact, concatenate.
- **Field Validation**: isRequired/isUnique constraints enforced on createRecord/updateRecord. isRequired checks null/empty/undefined, isUnique queries database excluding current record.
- **Comment System**: Full CRUD with threading (parent_id), reactions (JSONB), soft deletes. Backend via `public.__comments` table. Frontend CommentPanel with reply threading, emoji reactions, edit/delete actions, integrated into expanded record modal as toggleable sidebar.
- **Button Field**: Click endpoint tracking clickCount and lastClicked in JSONB, supporting openUrl/runScript/none action types.
- **System Field Auto-Population**: __created_by/__last_updated_by as JSONB user info from JWT, __auto_number via SERIAL.
- **Collaborator Components**: UserAvatar with consistent color hashing, UserAvatarGroup with +N overflow, CollaboratorPicker with search integration.
- **Cell Editors**: LinkEditor (tag-style multi-select with search), UserEditor (collaborator picker), ButtonEditor (styled action button), CheckboxEditor (toggle), LookupRollupConfigEditor (link field/lookup field/rollup function selectors).
- **Field Modal Categories**: "Links & Lookups" (Link, Lookup, Rollup), "People & System" (User, CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber), expanded "Advanced" (Checkbox, Button added).
- **AI Backend Integration (Future)**: Connect AI chat island to a real backend (LLM API) for natural language queries.
- **Multi-Selection System (Fixed)**: Column header clicks now reliably select entire columns (drag-reorder only starts after 5px movement). Shift+click column headers for multi-column range selection. Shift+Arrow keys extend cell selection range (Excel-like). Row/cell/column selections are properly coordinated (selecting one type clears the other). Row header matches Teable: checkbox at 0.25, expand icon at 0.75, combined states for selected+hovered. Corner header checkbox selects/deselects all rows.
- **Canvas Rendering**: Pixel-perfect canvas with integer rounding in resize, proper CSS positioning (top-0 left-0 vs inset-0 to prevent stretching).
- **Toolbar Labels**: Button text visible at sm breakpoint (640px+) instead of lg (1024px+).
- **Cell Editor UX Improvements**: MCQ/DropDown multi-select auto-commits on blur (no "Done" button needed). YesNo/Checkbox toggle on single click (no double-click). Phone number editor redesigned as compact inline with common country code dropdown (+1, +44, etc.). Currency editor simplified to USD/EUR select + value input (reduced real estate).
- **No Flags/Maps in Painters**: Currency, PhoneNumber, and ZipCode canvas painters stripped of all flag/map rendering. Currency shows "USD $100.00" (code + symbol + value). Phone shows "+1 555-1234". ZipCode shows "US 90210". Currency editor supports 10 currencies (USD, EUR, GBP, JPY, CNY, INR, CAD, AUD, CHF, KRW) via simple select dropdown.

### API Endpoints (src/services/api.ts)
- View: POST /view/create_view, POST /view/update_view, POST /view/delete_view, POST /view/get_views, PUT /view/update_sort, PUT /view/update_filter, PUT /view/update_group_by, PUT /view/update_column_meta
- Table: POST /table/create_table, PUT /table/update_table (rename), PUT /table/update_tables (soft delete with status: inactive)
- Field: POST /field/create_field, PUT /field/update_field, POST /field/update_fields_status
- Record: PUT /record/update_records_status
- File: POST /file/get-upload-url, confirm-upload
- Share: GET /asset/get_members, POST /asset/invite_members, POST /asset/share (general access), GET /user-sdk/search
- Import: POST /table/add_csv_data_to_new_table (JSON: table_name, baseId, user_id, is_first_row_header, url, columns_info), POST /table/add_csv_data_to_existing_table (JSON: tableId, baseId, viewId, is_first_row_header, url, columns_info)
- Export: POST /table/export_data_to_csv (JSON: baseId, tableId, viewId; returns CSV blob stream)
- Sheet: PUT /base/update_base_sheet_name
- Sheet lifecycle: POST /sheet/create_sheet, POST /sheet/get_sheet
- Comment: POST /comment/create, GET /comment/list, GET /comment/count, PATCH /comment/update, DELETE /comment/delete/:id, POST /comment/reaction/add, POST /comment/reaction/remove
- Button: POST /record/button-click

## External Dependencies
- **Backend Service**: `https://sheet-v1.gofo.app` (REST API and Socket.IO for real-time updates)
- **Authentication**: Keycloak (for token authentication via Axios interceptor)
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd