# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, similar to Airtable, built with React + Vite + TypeScript. It leverages shadcn/ui and Tailwind CSS for a modern, responsive interface. The application features a high-performance, canvas-based grid view, a Kanban board, and comprehensive CRUD operations for data management. It's a complete rebuild from a legacy codebase, focusing on performance, scalability, and an enhanced user experience.

## User Preferences
- Legacy folder must remain completely untouched
- Do NOT copy code from legacy - recreate fresh with best practices
- Canvas-based grid rendering (not HTML/CSS) for performance at scale
- Tailwind v4 with CSS-based configuration

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
- `views/`: Contains distinct application views like `grid/` and `kanban/`.
- `auth/`: User authentication components.

### Core Features and Implementations
- **Canvas Grid**: High-performance rendering with GridRenderer, CoordinateManager, and 22 Cell Painters. Supports devicePixelRatio scaling, scroll sync, sticky headers, column freezing, resizing, reordering.
- **Data Management**: 22 distinct cell types with specific rendering and editing.
- **User Interactions**: Multi-cell range selection, keyboard navigation, footer statistics, visual grouping.
- **Context Menus**: Header and record context menus with field CRUD, sorting, filtering, grouping, freezing, hiding.
- **Rich Cell Editors**: Type-specific editors for all 22 field types (Address, Phone, Signature, File Upload with presigned URL, Ranking with drag-reorder, enhanced SCQ/MCQ/DropDown).
- **Kanban View**: @hello-pangea/dnd drag-and-drop, stack-by field selection, customize cards popover, per-stack add record buttons, type-aware cell renderers on cards.
- **Modals and Popovers**: Sort, Filter (with type-specific value inputs), Group, FieldModal, Export, Import (4-step wizard), Share (with member management).
- **Visual Feedback**: Active toolbar buttons with summary info, column highlights (sorted=blue, filtered=yellow, grouped=green).
- **View CRUD**: Create/rename/delete views via API, sidebar with search filter, inline rename, confirmation dialogs.
- **Table CRUD**: Create/rename/delete tables via API, tab bar with inline rename, delete confirmation.
- **Expanded Record**: Prev/Next navigation, Delete/Duplicate/Copy URL actions, all 22 field type editors.
- **Confirmation Dialogs**: Reusable ConfirmDialog component for all destructive actions.
- **Sheet Name Editing**: Persisted to backend via API.
- **Loading States**: TableSkeleton with animated pulse loading.

### API Endpoints (src/services/api.ts)
- View: create, rename, delete, list, update_sort, update_filter, update_group_by, update_column_meta
- Table: create, rename, delete
- Field: update_fields_status
- File: get-upload-url, confirm-upload
- Share: members, invite, update-role, remove-member, general-access
- Import: csv (multipart)
- Export: export (blob)
- Asset: rename (sheet name)

## External Dependencies
- **Backend Service**: `https://sheet-v1.gofo.app` (REST API and Socket.IO for real-time updates)
- **Authentication**: Keycloak (for token authentication via Axios interceptor)
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd
