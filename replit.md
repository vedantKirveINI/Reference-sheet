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
- **Link Field System**: Supports bidirectional linking with parameterized SQL queries for creation/deletion.
- **Lookup & Rollup**: Computed fields with dependency resolution and 14 aggregate functions.
- **Field Validation**: `isRequired` and `isUnique` constraints enforced during record creation/update.
- **Comment System**: Full CRUD with threading, reactions, and soft deletes, integrated into the expanded record modal.
- **Button Field**: Tracks clicks and supports `openUrl`/`runScript` actions.
- **System Field Auto-Population**: `__created_by`/`__last_updated_by` from JWT and `__auto_number` via SERIAL.
- **Collaborator Components**: UserAvatar, UserAvatarGroup, and CollaboratorPicker.
- **Cell Editors**: Dedicated editors for Link, User, Button, Checkbox, Lookup, and Rollup fields.
- **Field Modal Categories**: Reorganized categories for better discoverability.
- **Multi-Selection**: Enhanced column header selection (single/range), Shift+Arrow key cell range extension, and coordinated row/cell/column selections.
- **Text Wrap/Clip/Overflow**: Configurable text display modes (Clip, Wrap, Overflow) for canvas cell painters, controlled via toolbar dropdown.
- **Conditional Row Coloring**: Rule-based conditional coloring with a dedicated UI for rule creation (field, operator, value, color) and optimized renderer evaluation.
- **Find & Replace**: Extended search bar with "Replace with" input and "Replace"/"Replace All" functionality, accessible via Ctrl+H.

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

## External Dependencies
- **Backend Service**: `https://sheet-v1.gofo.app` (REST API and Socket.IO)
- **Authentication**: Keycloak
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd