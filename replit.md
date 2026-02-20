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
- Island CSS utilities: .island, .island-elevated, .island-subtle, .island-focus, .brand-gradient

## System Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, shadcn/ui components, Radix UI primitives
- **Grid Rendering**: Canvas 2D API (high-performance, devicePixelRatio-aware)
- **State Management**: Zustand (6 dedicated stores)
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
- `views/`: Contains distinct application views: `grid/`, `kanban/`, `calendar/`, and `gantt/`.
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
- **Modals and Popovers**: Sort, Filter (with type-specific value inputs), Group, FieldModal, Export, Import (4-step wizard), Share (with member management).
- **Visual Feedback**: Active toolbar buttons with summary info, column highlights (sorted=blue, filtered=yellow, grouped=green).
- **View CRUD**: Create/rename/delete views via API, header view pills with inline rename, context menu, confirmation dialogs.
- **Table CRUD**: Create/rename/delete tables via API, sidebar table list with inline rename, delete confirmation.
- **Expanded Record**: Prev/Next navigation, Delete/Duplicate/Copy URL actions, all 22 field type editors.
- **Confirmation Dialogs**: Reusable ConfirmDialog component for all destructive actions.
- **Sheet Name Editing**: Persisted to backend via API.
- **Loading States**: TableSkeleton with animated pulse loading.
- **Footer Bar**: Three-zone footer — Left: record count + contextual column summary (hover-driven, with aggregation dropdown per column type), Center: AI island chat (Popover-based chat panel with message history, mock AI responses), Right: sort/filter/group badges (only visible when active). Statistics store (Zustand, persisted) tracks per-column aggregation preferences and hovered column. Supports numeric (Sum/Avg/Min/Max/Range/Median), date (Earliest/Latest), and universal (Count/Filled/Empty/%Filled/Unique) functions.
- **Field Operations via REST**: Create (POST /field/create_field), Update (PUT /field/update_field), Delete (POST /field/update_fields_status) — all use REST APIs with optimistic UI updates and rollback on failure.

### API Endpoints (src/services/api.ts)
- View: POST /view/create_view, POST /view/update_view, POST /view/delete_view, POST /view/get_views, PUT /view/update_sort, PUT /view/update_filter, PUT /view/update_group_by, PUT /view/update_column_meta
- Table: POST /table/create_table, PUT /table/update_table (rename), PUT /table/update_tables (soft delete with status: inactive)
- Field: POST /field/create_field, PUT /field/update_field, POST /field/update_fields_status
- Record: PUT /record/update_records_status
- File: POST /file/get-upload-url (note: legacy uses separate FILE_UPLOAD_SERVER), confirm-upload
- Share: GET /asset/get_members, POST /asset/invite_members, POST /asset/share (general access), GET /user-sdk/search
- Import: POST /table/add_csv_data_to_new_table, POST /table/add_csv_data_to_existing_table (multipart)
- Export: POST /table/export_data_to_csv (blob)
- Sheet: PUT /base/update_base_sheet_name
- Sheet lifecycle: POST /sheet/create_sheet, POST /sheet/get_sheet

## Recent Changes (2026-02-20)
- **Teable-style UX Enhancements (Complete)**:
  - **Toolbar Overhaul** (sub-header.tsx): 48px height with border-t, split layout — LEFT (Add record + operators: HideFields, Filter, Sort, Group, RowHeight) and RIGHT (SearchBar, More popover with Import/Export, Zoom controls). Color-coded active states: Filter=violet (bg-violet-100), Sort=orange (bg-orange-100), Group=green (bg-green-100), HideFields=bg-secondary. AlertTriangle warning icon on active filter. Row height icon changes dynamically per level (Rows2/Rows3/Rows4/StretchVertical). Text labels visible on lg+ screens. Dynamic button text: Filter shows field names ("Filtered by Name and 2 more"), Sort/Group show counts ("Sorted by 2 fields"). Buttons highlight as active when popover is open (even with no rules).
  - **Filter/Sort/Group Popovers (Teable-style rebuild)**: All three popovers redesigned to match Teable's UX. Sort/Group show searchable field picker on empty state (click field to add first rule). Filter shows empty text + Add condition buttons. All use custom Popover-based FieldSelector with field type icons (no native selects). Custom OrderSelect dropdowns with Asc/Desc icons. Conjunction selector (Where/And/Or) for filters. Auto-apply on every change (no Apply/Clear buttons). Group limited to 3 fields max.
  - **Enhanced SearchBar** (search-bar.tsx): New pill-style expanding search component. Collapsed=icon button, expanded=rounded-full pill (w-80) with field selector dropdown, "Find in view" input, match count + prev/next navigation, X close. Cmd+F/Ctrl+F opens, Esc closes, Enter/Shift+Enter navigates matches. 300ms debounce.
  - **View Pill Context Menu**: Enriched with Rename, Export CSV (grid only), Duplicate (API call), Lock/Unlock toggle, Pin/Unpin toggle, Delete (red, disabled if last). Separators between groups. Lock/Pin icons shown on pills.
  - **View Pills Polish**: max-w-52 with truncation, h-7, text-xs font-medium, auto-scroll active pill into view.
  - **Resizable Sidebar**: Drag-to-resize right edge (min 200px, default 256px, max 400px), hover-to-peek overlay when collapsed, Cmd+B/Ctrl+B toggle shortcut. Width persisted to localStorage.
  - **Collaborator Avatars**: Real data from /asset/get_members API. Circular avatar badges in header (before Share button) with initials, deterministic color hashing, overlap styling, ring-2 ring-white, +N overflow badge.
  - **Search Canvas Integration**: Search query wired through to canvas renderer. Matching cells highlighted with yellow background (rgba(250,204,21,0.2)), current match emphasized (0.6 opacity). Match count + prev/next navigation connected to actual data.
  - **Field Type Selector**: Categorized into 7 sections (AI & Enrichment highlighted at top with brand gradient + sparkle badge, Basic, Select, Date & Time, Contact, Media, Advanced). Search/filter input. Increased max-h-72.
  - **Mock Data Removed**: Deleted src/lib/mock-data.ts. Removed fallback-to-mock in useSheetData.ts. App.tsx cleaned of all usingMockData guards. Proper error/empty state on connection failure.
  - **Header**: TableInfo → ExpandViewList → ViewList (polished pills) → AddView → spacer → CollabAvatars → Separator → Share → UserMenu

- **Teable-style Layout Restructure (Complete)**:
  - **Layout**: Sidebar (tables-only) on left, Header+Toolbar+Content on right. No more tab bar.
  - **Sidebar** (sidebar.tsx): Collapsible with <</>>, "+ Create" table button, table list with Table2 icons, per-table DropdownMenu (Rename/Delete), delete confirmation Dialog, drag-to-resize, hover-to-peek
  - **main-layout.tsx**: Horizontal flex layout (sidebar | main), TabBar removed entirely, Cmd+B keyboard shortcut
  - View CRUD fully moved from sidebar to header (create/rename/delete via API + store)
  - "+ Add record" button in toolbar for quick record creation
  - Row header enhanced: drag handle (GripVertical), checkbox, expand icon on hover
  - Field Name Lines control (1/2/3 lines) added to Row Height dropdown, stored in ui-store
  - Footer: styled record count badge with brand colors, "← hover to select summary" hint

- **Cell Editor Migration (Phase 1-5)**:
  - Added `src/lib/countries.ts`: Full country database (50+ countries with ISO codes, dial codes, currency codes/symbols, flag URL helper using flagcdn.com, canvas flag drawing with image cache)
  - Added `src/lib/validators/`: Currency, Phone Number, Address validation/parsing utilities ported from legacy. Barrel export via index.ts. Address validator respects IGNORE_FIELD for legacy data compatibility.
  - Added `src/lib/formatters.ts`: Centralized formatting functions for Currency (symbol + value), Phone (dial code + number), Address (comma-separated fields)
  - Updated `src/views/grid/canvas/cell-painters.ts`: Currency renderer now parses ICurrencyData and shows flag + code + symbol + divider + value. Phone renderer parses IPhoneNumberData and shows flag + dial code + divider + number. Address renderer parses IAddressData and formats comma-separated. Formula/Enrichment renderers now check computedFieldMeta for error/loading states. Added `paintError` (red bg + text + icon placeholder) and `paintLoading` (skeleton gradient or centered text).
  - Updated `src/views/grid/cell-editor-overlay.tsx`: Currency editor now saves ICurrencyData with searchable country picker, flag images, currency code/symbol display. Phone editor now saves IPhoneNumberData with full country list (50+ countries), flag images, dial code. Address editor now saves IAddressData structured object with fullName, addressLineOne, addressLineTwo, zipCode, city, state, country fields.
  - Updated `src/views/grid/cell-renderer.tsx`: Currency and Phone cells show flag images alongside formatted data. Address cells format structured data.
  - Updated `src/types/cell.ts`: ICurrencyData.currencyValue now accepts string | number for legacy compatibility.

## Future TODO
- **AI Backend Integration**: Connect AI chat island to a real backend (LLM API). Support natural language queries for sorting, filtering, grouping, field creation, data summarization, and formula generation. Requires API key management and streaming response support.

## External Dependencies
- **Backend Service**: `https://sheet-v1.gofo.app` (REST API and Socket.IO for real-time updates)
- **Authentication**: Keycloak (for token authentication via Axios interceptor)
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd
