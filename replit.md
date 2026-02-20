# Sheet Application (Airtable Clone)

## Overview
A modern spreadsheet/database application (similar to Airtable) built with React + Vite + TypeScript, using shadcn/ui + Tailwind CSS for styling. This is a fresh rebuild migrating from a legacy MUI/Emotion codebase.

## Current State
- **Phase 1 MVP Complete**: Core layout shell + Grid View with 6 cell types and 100 mock records
- The legacy/ folder is READ-ONLY reference - never modify it

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand (6 stores)
- **Icons**: lucide-react
- **UI Primitives**: Radix UI (via shadcn/ui)

### Project Structure
```
src/
├── App.tsx                  # Main app, wires layout + grid view + mock data
├── main.tsx                 # Entry point
├── index.css                # Tailwind + shadcn theme variables
├── lib/
│   ├── utils.ts             # cn() utility
│   └── mock-data.ts         # Generates 100 realistic records
├── types/
│   ├── index.ts             # Re-exports all types
│   ├── cell.ts              # CellType enum + 22 cell interfaces
│   ├── grid.ts              # IGridConfig, IGridTheme, ROW_HEIGHT_DEFINITIONS
│   ├── column.ts            # IColumn interface
│   ├── record.ts            # IRecord, IRowHeader, ITableData
│   ├── selection.ts         # Selection types
│   ├── view.ts              # ViewType, IView
│   ├── context-menu.ts      # Context menu types
│   ├── grouping.ts          # Group config types
│   └── keyboard.ts          # Keyboard navigation types
├── stores/
│   ├── index.ts             # Re-exports all stores
│   ├── ui-store.ts          # Sidebar, zoom, theme, row height, current view
│   ├── view-store.ts        # View list management
│   ├── fields-store.ts      # Column/field management with visibility
│   ├── grid-view-store.ts   # Grid scroll, selection, active cell
│   ├── modal-control-store.ts # Modal open/close state
│   └── statistics-store.ts  # Field statistics with persistence
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx, badge.tsx, input.tsx
│   │   ├── separator.tsx, tooltip.tsx, scroll-area.tsx
│   │   ├── dropdown-menu.tsx, tabs.tsx
│   └── layout/
│       ├── main-layout.tsx  # Composition of all layout pieces
│       ├── header.tsx       # Top bar (title, share, user)
│       ├── sidebar.tsx      # Collapsible sidebar with view list
│       ├── tab-bar.tsx      # Table tabs
│       └── sub-header.tsx   # Toolbar (sort, filter, group, etc.)
└── views/
    └── grid/
        ├── grid-view.tsx    # Main grid with virtual scrolling
        ├── cell-renderer.tsx # Renders cells by type
        ├── column-header.tsx # Column headers with resize
        └── row-header.tsx   # Row numbers with selection

legacy/                      # READ-ONLY reference (MUI/Emotion codebase)
```

### Cell Types Supported (MVP)
1. String - Text display/edit
2. Number - Right-aligned numeric
3. SCQ (Single Choice) - Colored badge
4. MCQ (Multiple Choice) - Multiple colored badges
5. DropDown - Colored badge (similar to SCQ)
6. YesNo - Checkbox toggle

### Zustand Stores
- **useUIStore**: sidebar state, zoom level, row height, theme, current view type
- **useViewStore**: list of views, current view ID, CRUD operations
- **useFieldsStore**: all columns, visibility filtering, column updates
- **useGridViewStore**: scroll position, active cell, selected cells/rows
- **useModalControlStore**: sort/filter/group/hide-fields modal visibility
- **useStatisticsStore**: field statistics with localStorage persistence

## Configuration
- **Port**: 5000 (required by Replit)
- **Host**: 0.0.0.0 with allowedHosts: true (required for Replit proxy)
- **Path alias**: @ -> src/ (configured in vite.config.ts and tsconfig)

## User Preferences
- Legacy folder must remain completely untouched
- Do NOT copy code from legacy - recreate fresh with best practices
- Using HTML/CSS grid approach for MVP (not canvas)
- Tailwind v4 with CSS-based configuration

## Remaining Phases
- Phase 2: Additional cell types (DateTime, Currency, Phone, Address, etc.)
- Phase 3: Column operations (freeze, drag reorder, hide)
- Phase 4: Row operations (insert, delete, duplicate, expand)
- Phase 5: Context menus
- Phase 6: Kanban view
- Phase 7: Grouping, sorting, filtering
- Phase 8: Import/export
- Phase 9: Sharing, auth, socket.io integration
