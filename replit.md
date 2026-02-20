# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, similar to Airtable, built with React + Vite + TypeScript. It leverages shadcn/ui and Tailwind CSS for a modern, responsive interface. The application features a high-performance, canvas-based grid view, a Kanban board, and comprehensive CRUD operations for data management. It's a complete rebuild from a legacy codebase, focusing on performance, scalability, and an enhanced user experience. The ambition is to provide a powerful and intuitive data management tool with real-time collaboration capabilities.

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
- **Icons**: lucide-react

### Project Structure
The `src/` directory is organized into logical units:
- `App.tsx`: Main application entry point and data processing.
- `lib/`: Utility functions and mock data generation.
- `types/`: Comprehensive type definitions for all application entities (cells, grids, columns, records, selections, views, context menus, grouping, keyboard).
- `hooks/`: Custom React hooks, notably `useSheetData.ts` for backend integration.
- `stores/`: Zustand stores for managing UI state, view data, field configurations, grid interactions, modal controls, and statistics.
- `services/`: API integration (Axios, Socket.IO), data formatters, URL parameter handling, and collaboration scaffolding.
- `components/`: Reusable UI components from shadcn/ui and custom layout components (header, sidebar, tab bar, sub-header).
- `views/`: Contains distinct application views like `grid/` and `kanban/`, each with its specific components and logic. The `grid/canvas/` sub-directory houses the core canvas rendering engine, coordinate management, and cell painting functions.
- `auth/`: User authentication components.

### Core Features and Implementations
- **Canvas Grid**: Utilizes a `GridRenderer` class for high-performance rendering, `CoordinateManager` for viewport calculations and hit testing, and specialized `Cell Painters` for 22 different cell types. Supports devicePixelRatio scaling, requestAnimationFrame, scroll synchronization, sticky headers, column freezing, resizing, and reordering.
- **Data Management**: Supports 22 distinct cell types (e.g., String, Number, SCQ, MCQ, DateTime, Currency, FileUpload, Formula), each with specific rendering and editing capabilities.
- **User Interactions**: Implements multi-cell range selection, keyboard navigation with auto-scroll, footer statistics bar with per-column statistics, and visual grouping with collapsible rows.
- **Context Menus**: Provides comprehensive context menus for both header and record interactions, including field CRUD, sorting, filtering, grouping, freezing, hiding, and record manipulation.
- **Rich Cell Editors**: Type-specific cell editors and expanded record editors for all 22 field types, including complex editors for Address, Phone, Signature, File Upload, Ranking, and enhanced SCQ/MCQ/DropDown.
- **Kanban View**: Dedicated Kanban board with stack-by field selection and draggable cards.
- **Modals and Popovers**: All major configurations (Sort, Filter, Group, FieldModal, Export, Import, Share) are implemented as inline Popovers or Dialogs, anchored to toolbar buttons for improved UX.
- **Visual Feedback**: Active toolbar buttons display summary information, and column highlights (light blue for sorted, light yellow for filtered, light green for grouped) provide immediate visual cues.
- **Loading States**: Includes a `TableSkeleton` component for animated pulse loading.

## External Dependencies
- **Backend Service**: `https://sheet-v1.gofo.app` (REST API and Socket.IO for real-time updates)
- **Authentication**: Keycloak (for token authentication via Axios interceptor)
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (which uses Radix UI primitives)