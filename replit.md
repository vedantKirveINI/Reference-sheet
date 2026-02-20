# Sheet Application (Airtable Clone)

## Overview
A modern spreadsheet/database application (similar to Airtable) built with React + Vite + TypeScript, using shadcn/ui + Tailwind CSS for styling. Features a high-performance canvas-based grid view, Kanban board, and full CRUD operations. This is a fresh rebuild migrating from a legacy MUI/Emotion codebase.

## Current State
- **All 9 Phases Complete**: Canvas grid, all cell types, column/row operations, context menus, Kanban view, sort/filter/group, import/export, sharing UI
- **Bug Fixes Complete (Feb 2026)**: All 6 previously broken features now working:
  - Context menu Sort (A→Z / Z→A) — wired to sortConfig state
  - Context menu Freeze/Unfreeze columns — calls renderer directly
  - Row Height dropdown (Short/Medium/Tall/Extra Tall) — uses RowHeightLevel store
  - Search toolbar — inline search input with real-time record filtering
  - Zoom +/- buttons — full canvas zoom with coordinate conversion
- **Gap Features Complete (Feb 2026)**: 5 major gap features implemented:
  - Multi-cell range selection (click+drag, Shift+click, column header click) with blue highlight painting
  - Footer statistics bar with per-column stats (Count, Sum, Average, Min, Max) and dropdown pickers
  - Visual grouping with collapsible group header rows (colored bars, expand/collapse toggles, count badges)
  - Keyboard clipboard shortcuts (Ctrl+C/V for copy/paste of cells and ranges as TSV)
  - Auto-scroll on keyboard navigation (viewport scrolls to keep active cell visible)
- The legacy/ folder is READ-ONLY reference - never modify it
- Frontend-only (no backend yet) - uses mock data
- **Gap analysis complete** — 15 gaps identified, 10 key gaps now addressed

## Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Grid Rendering**: Canvas 2D API (high-performance, devicePixelRatio-aware)
- **State Management**: Zustand (6 stores)
- **Icons**: lucide-react
- **UI Primitives**: Radix UI (via shadcn/ui)

### Project Structure
```
src/
├── App.tsx                  # Main app, wires everything + data processing
├── main.tsx                 # Entry point
├── index.css                # Tailwind + shadcn theme variables
├── lib/
│   ├── utils.ts             # cn() utility
│   └── mock-data.ts         # Generates 100 realistic records across 18 columns
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
│   ├── fields-store.ts      # Column/field management with visibility + hidden columns
│   ├── grid-view-store.ts   # Grid scroll, selection, active cell, expanded record
│   ├── modal-control-store.ts # All modal open/close state (sort, filter, group, hide, export, import, share)
│   └── statistics-store.ts  # Field statistics with persistence
├── services/
│   └── collaboration.ts     # Socket.io collaboration service scaffolding
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx, badge.tsx, input.tsx
│   │   ├── separator.tsx, tooltip.tsx, scroll-area.tsx
│   │   ├── dropdown-menu.tsx, tabs.tsx
│   │   ├── dialog.tsx, switch.tsx
│   └── layout/
│       ├── main-layout.tsx  # Composition of all layout pieces
│       ├── header.tsx       # Top bar (title, share, collaborator avatars, user menu)
│       ├── sidebar.tsx      # Collapsible sidebar with view list
│       ├── tab-bar.tsx      # Table tabs
│       └── sub-header.tsx   # Toolbar (sort, filter, group, hide, search, import, export, row actions)
├── views/
│   ├── grid/
│   │   ├── grid-view.tsx        # React wrapper: canvas + scroll overlay + events
│   │   ├── canvas/
│   │   │   ├── types.ts         # Canvas-specific types (IRenderRect, IVisibleRange, etc.)
│   │   │   ├── theme.ts         # Grid theme constants (colors, fonts, dimensions)
│   │   │   ├── coordinate-manager.ts # Viewport calc, hit testing, frozen columns
│   │   │   ├── renderer.ts      # Main canvas paint engine (GridRenderer class)
│   │   │   └── cell-painters.ts # Paint functions for all 22 cell types
│   │   ├── footer-stats-bar.tsx      # Per-column statistics bar (Count/Sum/Avg/Min/Max)
│   │   ├── cell-editor-overlay.tsx  # HTML editing overlay positioned over canvas cells
│   │   ├── cell-renderer.tsx        # React cell renderer (used by editing overlay)
│   │   ├── context-menu.tsx         # Right-click context menu (portal-based)
│   │   ├── expanded-record-modal.tsx # Full record view with editable fields
│   │   ├── hide-fields-modal.tsx    # Toggle column visibility
│   │   ├── sort-modal.tsx           # Multi-field sort rules
│   │   ├── filter-modal.tsx         # Multi-condition filters with type-aware operators
│   │   ├── group-modal.tsx          # Multi-level grouping
│   │   ├── export-modal.tsx         # CSV/JSON export
│   │   ├── import-modal.tsx         # CSV/JSON import with column mapping
│   │   ├── column-header.tsx        # Legacy HTML column header (unused)
│   │   └── row-header.tsx           # Legacy HTML row header (unused)
│   ├── kanban/
│   │   ├── kanban-view.tsx      # Kanban board with stack-by field selector
│   │   ├── kanban-card.tsx      # Draggable card component
│   │   └── kanban-stack.tsx     # Stack/column with drop target
│   ├── sharing/
│   │   └── share-modal.tsx      # Share link, permissions, collaborator management
│   └── auth/
│       └── user-menu.tsx        # User dropdown with theme toggle

legacy/                          # READ-ONLY reference (MUI/Emotion codebase)
```

### Cell Types Supported (All 22)
1. String - Text display/edit
2. Number - Right-aligned numeric
3. SCQ (Single Choice) - Colored badge
4. MCQ (Multiple Choice) - Multiple colored badges with +N overflow
5. DropDown - Colored badge
6. YesNo - Checkbox toggle
7. DateTime - Formatted date
8. CreatedTime - Read-only timestamp with lock icon
9. Currency - Formatted currency right-aligned
10. PhoneNumber - Phone text
11. Address - Address text truncated
12. Signature - "Signed"/"Not signed" indicator
13. Slider - Progress bar with percentage
14. FileUpload - File count with paperclip icon
15. Time - Formatted time
16. Ranking - Numbered badges
17. Rating - Filled/empty star polygons
18. OpinionScale - Number badge
19. Formula - Italic read-only text
20. List - Comma-separated chips
21. Enrichment - Text with sparkle indicator
22. ZipCode - Zip code text

### Canvas Grid Architecture
- **GridRenderer class**: Main paint engine with devicePixelRatio scaling, requestAnimationFrame rendering
- **CoordinateManager**: Precomputed column offsets, visible range calculation, hit testing, frozen column support
- **Cell Painters**: Individual paint functions per cell type with helpers (drawRoundedRect, drawTruncatedText, drawStar, drawCheckmark)
- **Scroll mechanism**: Transparent overlay div with native scrollbars synced to canvas render state
- **Sticky headers**: Row headers (left) and column headers (top) painted over scrolled cells
- **Column freeze**: Frozen columns stay fixed with gradient shadow separator
- **Column resize**: Mouse drag on header edge with cursor feedback
- **Column reorder**: Drag-and-drop with ghost header and insertion indicator

### Zustand Stores
- **useUIStore**: sidebar state, zoom level, row height, theme, current view type
- **useViewStore**: list of views, current view ID, CRUD operations
- **useFieldsStore**: all columns, visibility filtering, hidden column IDs, toggle visibility
- **useGridViewStore**: scroll position, active cell, selected rows, expanded record ID
- **useModalControlStore**: sort/filter/group/hide-fields/export/import/share modal visibility
- **useStatisticsStore**: field statistics with localStorage persistence

## Configuration
- **Port**: 5000 (required by Replit)
- **Host**: 0.0.0.0 with allowedHosts: true (required for Replit proxy)
- **Path alias**: @ -> src/ (configured in vite.config.ts and tsconfig)

## User Preferences
- Legacy folder must remain completely untouched
- Do NOT copy code from legacy - recreate fresh with best practices
- Canvas-based grid rendering (not HTML/CSS) for performance at scale
- Tailwind v4 with CSS-based configuration

## Future Work
- Backend integration with real API endpoints
- Real socket.io connection for collaboration (scaffolding in place)
- Authentication with real auth provider
- Database-backed persistence
- Advanced grouping with visual group header rows in canvas
