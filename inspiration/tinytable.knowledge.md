# TinyTable (Airtable Clone) — Complete Knowledge Base

> This document is a comprehensive brain dump of everything built, decided, discussed, and learned during the development of the TinyTable project (an Airtable-style spreadsheet/database application). It is intended to serve as a complete knowledge transfer so that work can continue seamlessly on a new account or with a new collaborator.

---

## Table of Contents

1. [Project Vision & Goals](#1-project-vision--goals)
2. [Origin Story & Migration Context](#2-origin-story--migration-context)
3. [Core Tech Stack & Why](#3-core-tech-stack--why)
4. [Build Journey — The 9 Phases](#4-build-journey--the-9-phases)
5. [Bug Fixes — 6 Broken Features](#5-bug-fixes--6-broken-features)
6. [Gap Analysis — 15 Identified Gaps](#6-gap-analysis--15-identified-gaps)
7. [Advanced Features — 5 Major Implementations](#7-advanced-features--5-major-implementations)
8. [Architecture Deep Dive](#8-architecture-deep-dive)
9. [Canvas Grid Engine — How It Works](#9-canvas-grid-engine--how-it-works)
10. [All 22 Cell Types](#10-all-22-cell-types)
11. [Zustand State Management — 6 Stores](#11-zustand-state-management--6-stores)
12. [Data Flow & Processing Pipeline](#12-data-flow--processing-pipeline)
13. [Grouping System — Design Decision](#13-grouping-system--design-decision)
14. [Edge Cases & Gotchas](#14-edge-cases--gotchas)
15. [File-by-File Guide](#15-file-by-file-guide)
16. [Dependencies & Versions](#16-dependencies--versions)
17. [Configuration & Environment](#17-configuration--environment)
18. [User Preferences & Hard Rules](#18-user-preferences--hard-rules)
19. [What's Left to Build](#19-whats-left-to-build)
20. [Lessons Learned & Design Principles](#20-lessons-learned--design-principles)

---

## 1. Project Vision & Goals

**TinyTable** is a modern, high-performance spreadsheet/database application modeled after Airtable. The goal is to provide:

- A **canvas-based grid view** that can handle thousands of rows without performance degradation (unlike HTML table-based grids)
- A **Kanban board view** for visual workflow management
- Full **CRUD operations** on records, columns, and views
- **Sort, filter, group** capabilities with multi-rule support
- **Import/export** (CSV and JSON)
- **Sharing and collaboration** UI (scaffolded, not yet wired to backend)
- A beautiful, responsive UI using shadcn/ui components with Tailwind CSS

The project is currently **frontend-only** with mock data. Backend integration is the next major milestone.

There is a `sheets-backend/` directory in the repo containing a NestJS backend (with Dockerfile, build scripts, etc.) from an earlier iteration. This backend is **not currently integrated** with the frontend — the frontend uses mock data exclusively. When backend integration happens, evaluate whether to use this existing NestJS backend or start fresh.

The user's primary philosophy: **UX and user experience come first, above code maintainability.** Every decision should optimize for what feels best to the end user.

---

## 2. Origin Story & Migration Context

This project started as a **migration** from a legacy codebase that used:
- **MUI (Material UI)** for components
- **Emotion** for CSS-in-JS styling
- HTML-based grid rendering (which had performance issues at scale)

The decision was made to rebuild from scratch rather than incrementally migrate because:
- The tech stack differences were too fundamental (MUI vs shadcn/ui, Emotion vs Tailwind)
- Canvas rendering required a completely different architecture than HTML tables
- Starting fresh allowed best practices from day one

**Critical rule**: The `legacy/` folder contains the old codebase and is **READ-ONLY reference only**. It must never be modified. Code should not be copied from it — instead, we study it for feature parity and then recreate with modern approaches.

---

## 3. Core Tech Stack & Why

| Technology | Purpose | Why This Choice |
|---|---|---|
| **React 18.3** | UI framework | Industry standard, component model fits well |
| **TypeScript** | Type safety | Catches bugs at compile time, better DX |
| **Vite** | Build tool | Fast HMR, modern ESM-native bundling |
| **Canvas 2D API** | Grid rendering | Performance at scale — HTML tables can't handle 10K+ rows smoothly |
| **Tailwind CSS v4** | Styling | Utility-first, CSS-based config (v4 uses CSS not JS config) |
| **shadcn/ui** | UI components | Beautiful defaults, fully customizable, Radix UI primitives underneath |
| **Zustand** | State management | Lightweight, no boilerplate, works great with React 18 |
| **Radix UI** | UI primitives | Accessible, unstyled, composable (powers shadcn/ui) |
| **lucide-react** | Icons | Clean, consistent icon set |
| **@dnd-kit** | Drag and drop | Used in Kanban view for card dragging |
| **papaparse** | CSV parsing | Robust CSV parser for import/export |
| **dayjs** | Date formatting | Lightweight Moment.js alternative |
| **socket.io-client** | Real-time collab | Scaffolded for future WebSocket collaboration |

### Important: Tailwind v4
Tailwind v4 uses **CSS-based configuration** (not `tailwind.config.js`). The theme variables are defined in `src/index.css` using CSS custom properties. The Vite plugin `@tailwindcss/vite` handles processing.

---

## 4. Build Journey — The 9 Phases

The application was built in 9 sequential phases:

### Phase 1: Foundation
- Project scaffolding with Vite + React + TypeScript
- Tailwind v4 setup with shadcn/ui
- Basic layout components (header, sidebar, tab bar)
- Type system design (all interfaces and enums)

### Phase 2: Canvas Grid Engine
- `GridRenderer` class — the main paint engine
- `CoordinateManager` — viewport calculations, hit testing
- Canvas setup with `devicePixelRatio` scaling for crisp rendering on Retina displays
- Transparent scroll overlay div that syncs native scrollbars with canvas paint state

### Phase 3: Cell Type Rendering
- `cell-painters.ts` — individual paint functions for all 22 cell types
- Helper functions: `drawRoundedRect`, `drawTruncatedText`, `drawStar`, `drawCheckmark`
- Each cell type paints differently (badges for SCQ/MCQ, stars for Rating, progress bars for Slider, etc.)

### Phase 4: Column & Row Operations
- Column resize (drag on header edge with cursor feedback)
- Column reorder (drag-and-drop with ghost header and insertion indicator)
- Row add, delete, duplicate, insert above/below
- Column add, delete, duplicate, insert before/after

### Phase 5: Context Menus
- Portal-based right-click context menu
- Different menus for column headers vs data cells
- Sort, freeze, hide, insert, delete, duplicate options

### Phase 6: Kanban View
- `kanban-view.tsx` — board layout with stack-by field selector
- `kanban-card.tsx` — draggable card using @dnd-kit
- `kanban-stack.tsx` — droppable column
- Cards show key fields from each record

### Phase 7: Sort, Filter, Group Modals
- `sort-modal.tsx` — multi-field sort rules with asc/desc
- `filter-modal.tsx` — multi-condition filters with type-aware operators
- `group-modal.tsx` — multi-level grouping (first level implemented)
- All use shadcn/ui Dialog components

### Phase 8: Import/Export
- `export-modal.tsx` — CSV and JSON export with column selection
- `import-modal.tsx` — CSV/JSON import with column mapping and append/replace modes
- Uses papaparse for CSV parsing

### Phase 9: Sharing UI
- `share-modal.tsx` — share link generation, permissions, collaborator management
- Scaffolded UI (not connected to real backend)

---

## 5. Bug Fixes — 5 Broken Features

After the 9 phases, testing revealed 5 features that were built but not working correctly:

### Bug 1: Context Menu Sort (A→Z / Z→A)
**Problem**: The sort options in the right-click context menu weren't wired to the actual sort state.
**Fix**: Connected the context menu's sort callback to the `sortConfig` state in App.tsx via `onSortColumn` prop, which calls `setSortConfig([{ columnId, direction }])`.

### Bug 2: Context Menu Freeze/Unfreeze Columns
**Problem**: Freeze/unfreeze wasn't working from the context menu.
**Fix**: Wired the freeze callback to call the renderer's `setFrozenColumns()` method directly on the `GridRenderer` instance.

### Bug 3: Row Height Dropdown
**Problem**: The row height selector in the sub-header toolbar wasn't changing row heights.
**Fix**: Connected the dropdown to `useUIStore`'s `rowHeightLevel` state. The `RowHeightLevel` enum (Short=32px, Medium=56px, Tall=84px, ExtraTall=108px) is used by the renderer when calculating row positions and painting.

### Bug 4: Search Toolbar
**Problem**: The search button opened nothing.
**Fix**: Implemented an inline search input that appears in the sub-header. Real-time text filtering searches across all cell `displayData` values. The search query flows through `processedData` in App.tsx.

### Bug 5: Zoom +/- Buttons
**Problem**: Zoom buttons in the sub-header weren't functional.
**Fix**: Connected to `useUIStore`'s `zoomLevel` state. The zoom works by passing a `zoomScale` factor to the `GridRenderer` which adjusts canvas painting dimensions. The scroll overlay's width and height are multiplied by zoomScale to create the correct scrollable area. All mouse hit testing divides coordinates by zoomScale to convert back to logical grid coordinates. This is a canvas-native zoom, not a CSS transform.

---

## 6. Gap Analysis — 15 Identified Gaps

A comprehensive comparison between the legacy codebase and the new implementation identified 15 gaps. Here they are with their status:

### Addressed (10 gaps):
1. **Multi-cell range selection** — DONE (click+drag, Shift+click, column header select)
2. **Footer statistics bar** — DONE (Count, Sum, Average, Min, Max per column)
3. **Visual grouping with collapsible headers** — DONE (colored bars, expand/collapse)
4. **Keyboard clipboard shortcuts** — DONE (Ctrl+C/V with TSV format)
5. **Auto-scroll on keyboard navigation** — DONE (viewport follows active cell)
6. **Context menu sort wiring** — DONE (bug fix)
7. **Freeze columns from context menu** — DONE (bug fix)
8. **Row height selection** — DONE (bug fix)
9. **Search functionality** — DONE (bug fix)
10. **Zoom controls** — DONE (bug fix)

### Remaining (5 gaps — future work):
11. **Interactive freeze handle** — Visual drag handle between frozen/unfrozen columns
12. **Row header checkboxes** — Checkbox in each row header for multi-select
13. **Row header expand icons** — Expand icon in row header to open record detail
14. **Enhanced scrollbar** — Custom scrollbar styling for virtual scrolling feel
15. **Undo/redo** — Command history with Ctrl+Z / Ctrl+Shift+Z

---

## 7. Advanced Features — 5 Major Implementations

### 7a. Multi-Cell Range Selection
**How it works:**
- **Click+Drag**: `mousedown` starts tracking, `mousemove` updates selection range, `mouseup` finalizes
- **Shift+Click**: Extends selection from active cell to clicked cell
- **Column Header Click**: Selects entire column (row 0 to totalRows-1)
- **Visual**: Blue semi-transparent overlay painted on canvas via `drawSelectionRange()` in renderer
- **State**: `selectionRange` stored as `{ startRow, startCol, endRow, endCol }` in grid-view component state
- **Group headers are excluded** from selection highlighting (they render but selection skips them)

### 7b. Footer Statistics Bar
**How it works:**
- Fixed 28px bar at the bottom of the grid view
- Each column gets a cell in the footer that can display a statistic
- Click a footer cell to open a dropdown picker: None, Count, Sum, Average, Min, Max
- Statistics are computed from actual data records (group headers excluded)
- Stats configuration persisted to `localStorage` via `useStatisticsStore`
- The footer scrolls horizontally in sync with the grid (same `scrollLeft`)
- Frozen columns' stats stay fixed, just like the frozen column cells above

### 7c. Visual Grouping
**How it works:**
- User configures grouping via the Group modal (pick a field + direction)
- `processedData` in App.tsx sorts records by group field, then inserts **marker records**
- Marker records have IDs prefixed with `__group__` and contain group metadata in a special `__group_meta__` cell
- The renderer detects these markers and paints colored group header rows instead of normal cells
- 5 color schemes cycle through groups (blue, green, amber, purple, pink)
- Each group header shows: expand/collapse chevron, field name, value, record count badge
- Collapsed groups hide their child records (done at the data level — collapsed groups don't insert data records)
- `collapsedGroups` state (a `Set<string>`) tracks which groups are collapsed

**Design Decision**: We chose marker records over a separate linear row system because:
- Simpler implementation — no need for a parallel index mapping layer
- Works naturally with the existing rendering loop
- Trade-off: all operations (selection, clipboard, navigation, editing) must check for `__group__` prefix and skip

### 7d. Keyboard Clipboard (Ctrl+C / Ctrl+V)
**How it works:**
- **Copy (Ctrl+C)**:
  - Single cell: copies `displayData` to clipboard
  - Range selection: builds TSV (tab-separated values) string from all selected cells
  - Group header rows are skipped when copying ranges
- **Paste (Ctrl+V)**:
  - Reads clipboard text, splits by newlines and tabs
  - Pastes starting from active cell position
  - Each value updates the corresponding record's cell via `onCellChange`
  - Cannot paste onto group header rows (they're skipped)
  - If pasting multiple rows, group header target rows are skipped over

### 7e. Auto-Scroll on Keyboard Navigation
**How it works:**
- When arrow keys / Tab move the active cell, the viewport checks if the new cell is visible
- If the cell is below the visible area, `scrollTop` is adjusted to show it
- If the cell is above, `scrollLeft` or `scrollTop` is adjusted
- Uses the scroll overlay div's `scrollTo()` method
- Accounts for zoom level when calculating positions
- Group header rows are skipped during navigation (arrow up/down jumps over them)

---

## 8. Architecture Deep Dive

### Component Hierarchy
```
App.tsx (data owner, processes sort/filter/group/search)
└── MainLayout (header + sidebar + toolbar + content area)
    ├── Header (title, share button, collaborator avatars, user menu)
    ├── Sidebar (collapsible, view list with grid/kanban)
    ├── TabBar (table tabs)
    ├── SubHeader (toolbar: sort, filter, group, hide, search, zoom, row height, import, export)
    └── Content Area
        ├── GridView (canvas + overlay + events + footer)
        │   ├── <canvas> element (painted by GridRenderer)
        │   ├── Scroll overlay div (transparent, provides native scrollbars)
        │   ├── CellEditorOverlay (HTML input positioned over active cell)
        │   ├── ContextMenu (portal-based right-click menu)
        │   └── FooterStatsBar (statistics bar at bottom)
        └── KanbanView (alternative view)
            ├── KanbanStack × N
            └── KanbanCard × N
```

### Data Ownership
- **App.tsx** owns `tableData` (the source of truth)
- `processedData` is a `useMemo` derivative that applies: filter → search → sort → group
- All mutations (cell change, add/delete row, add/delete column) go through callbacks defined in App.tsx
- Processed data flows down to GridView/KanbanView as props

### Canvas vs React Split
- **Canvas**: All grid cell rendering, headers, row numbers, selection highlights, group headers, active cell border
- **React**: Cell editing overlay (HTML inputs for text editing), context menus, modals, footer stats bar, toolbar
- This split gives us canvas performance for rendering but HTML accessibility for editing

---

## 9. Canvas Grid Engine — How It Works

### GridRenderer Class (`renderer.ts`, ~812 lines)
The main paint engine. Key methods:
- `render()` — orchestrates full frame paint via `requestAnimationFrame`
- `drawBackground()` — fills canvas white
- `drawCells()` — iterates visible range, calls cell painters
- `drawColumnHeaders()` — paints header row with column names + type icons
- `drawRowHeaders()` — paints row numbers (left column)
- `drawFrozenColumns()` — renders frozen columns on top with shadow separator
- `drawActiveCell()` — blue border around the currently active cell
- `drawSelectionRange()` — blue overlay for multi-cell selection (skips group headers)
- `drawGroupHeaderRow()` — colored group separator with chevron, label, count badge
- `drawAppendRow()` — the "+" row at the bottom for adding new records

### CoordinateManager Class (`coordinate-manager.ts`, ~194 lines)
Handles all position math:
- `getColumnOffset(colIndex)` — precomputed cumulative column widths
- `getVisibleRange(scrollTop, scrollLeft, viewportWidth, viewportHeight)` — which rows/cols are visible
- `hitTest(x, y, scrollTop, scrollLeft)` — converts mouse position to { rowIndex, colIndex, region }
- `getTotalWidth()` / `getTotalHeight()` — full scrollable dimensions
- Frozen column awareness — hit testing checks frozen area before scrolled area

### Cell Painters (`cell-painters.ts`, ~488 lines)
Individual paint functions per cell type:
- `paintStringCell`, `paintNumberCell`, `paintSCQCell`, `paintMCQCell`, etc.
- Shared helpers: `drawRoundedRect`, `drawTruncatedText`, `drawStar`, `drawCheckmark`, `drawBadge`
- Colors for badges come from `GRID_THEME.chipColors` (10 color pairs)
- Star polygons are computed mathematically for Rating cells

### Theme Constants (`theme.ts`)
- `headerHeight: 34`, `rowHeaderWidth: 60`, `defaultRowHeight: 32`
- Font: Inter, 13px for both headers and cells
- Active cell border: `#3b82f6` (blue-500), 2px width
- Chip colors: 10 predefined bg+text color pairs

### Scroll Mechanism
- A transparent `<div>` overlays the canvas with `overflow: auto`
- Its inner div is sized to the full grid dimensions (causes scrollbars)
- On scroll, the scroll position syncs to the renderer which repaints
- This gives us native scrollbar behavior without custom scrollbar code

---

## 10. All 22 Cell Types

Each cell type has a TypeScript interface and a canvas painter:

| # | Type | Display | Editing |
|---|---|---|---|
| 1 | String | Left-aligned text, truncated | Text input |
| 2 | Number | Right-aligned number | Number input |
| 3 | SCQ (Single Choice) | Colored rounded badge | Dropdown select |
| 4 | MCQ (Multiple Choice) | Multiple colored badges + "+N" overflow | Multi-select |
| 5 | DropDown | Colored badge (same as SCQ visually) | Dropdown |
| 6 | YesNo | Checkmark or empty checkbox | Toggle on click |
| 7 | DateTime | Formatted date string (MM/DD/YYYY) | Date picker |
| 8 | CreatedTime | Timestamp with lock icon (read-only) | Not editable |
| 9 | Currency | "$X,XXX.XX" right-aligned | Number input |
| 10 | PhoneNumber | Phone text | Text input |
| 11 | Address | Address text, truncated | Text input |
| 12 | Signature | "Signed" / "Not signed" indicator | Toggle |
| 13 | Slider | Progress bar with percentage label | Slider input |
| 14 | FileUpload | File count with paperclip icon | File picker |
| 15 | Time | Formatted time string | Time input |
| 16 | Ranking | Numbered circle badge | Number input |
| 17 | Rating | Filled/empty star polygons (1-5) | Click stars |
| 18 | OpinionScale | Number in circle badge | Number input |
| 19 | Formula | Italic text (read-only, computed) | Not editable |
| 20 | List | Comma-separated chips | Text input |
| 21 | Enrichment | Text with sparkle ✨ indicator | Text input |
| 22 | ZipCode | Zip code text | Text input |

---

## 11. Zustand State Management — 6 Stores

### useUIStore (`ui-store.ts`)
- `sidebarExpanded` — sidebar open/close (responsive default: open on desktop)
- `currentView` — "grid" or "kanban"
- `zoomLevel` — 50-200%, default 100%
- `rowHeightLevel` — Short/Medium/Tall/ExtraTall
- `theme` — "light" or "dark"
- `activeCell` / `selectedCells` — cell selection state (partially used, grid-view has its own)
- Persisted to localStorage (sidebar, zoom, theme, row height)

### useViewStore (`view-store.ts`)
- List of views (default: Grid View + Kanban View)
- Current view ID
- CRUD operations for views

### useFieldsStore (`fields-store.ts`)
- All columns with visibility state
- `hiddenColumnIds` — Set of hidden column IDs
- `toggleColumnVisibility(columnId)` — show/hide columns

### useGridViewStore (`grid-view-store.ts`)
- `scrollPosition` — { scrollTop, scrollLeft }
- `activeCell` — currently focused cell
- `selectedRows` — set of selected row indices
- `expandedRecordId` — which record is shown in expanded modal

### useModalControlStore (`modal-control-store.ts`)
- Boolean flags for every modal: sort, filter, group, hideFields, export, import, share
- Open/close methods for each

### useStatisticsStore (`statistics-store.ts`)
- `columnStatisticConfig` — Record<columnId, StatisticsFunction>
- StatisticsFunction enum: None, Count, Sum, Average, Min, Max
- `statisticsMenu` — state for the dropdown picker (open, position, columnId)
- Persisted to localStorage

---

## 12. Data Flow & Processing Pipeline

```
Raw tableData (App.tsx state)
    │
    ├── Filter (filterConfig rules applied)
    │     └── Each rule: column + operator + value
    │     └── Conjunction: AND / OR between rules
    │
    ├── Search (searchQuery applied)
    │     └── Matches any cell's displayData
    │
    ├── Sort (sortConfig + groupConfig applied)
    │     └── Group fields sort first, then explicit sort rules
    │
    ├── Group (groupConfig applied)
    │     └── Insert __group__ marker records between groups
    │     └── Collapsed groups: only marker, no data records
    │
    └── = processedData (passed to GridView/KanbanView)
```

The pipeline is a single `useMemo` in App.tsx with dependency on `[tableData, sortConfig, filterConfig, groupConfig, searchQuery, collapsedGroups]`.

---

## 13. Grouping System — Design Decision

### The Marker Record Approach

We chose to implement grouping by inserting **marker records** directly into the data array rather than maintaining a separate linear row index. Here's why and how:

**How it works:**
1. Records are sorted by the group field
2. For each group boundary, a marker record is created with:
   - `id: "__group__<fieldName>:<value>"`
   - A special `__group_meta__` cell containing: `{ fieldName, value, count, isCollapsed, key }`
3. If a group is collapsed, only the marker is inserted (child records are omitted)
4. The renderer checks each record's ID — if it starts with `__group__`, it paints a group header row instead of normal cells

**What operations must check for `__group__` prefix:**
- Active cell setting (don't set on group headers)
- Cell editing (don't allow editing group headers)
- Double-click (don't open editor on group headers)
- Context menu (don't show cell context menu on group headers)
- Selection range rendering (skip group headers in selection highlight)
- Clipboard copy (skip group headers when building TSV)
- Clipboard paste (skip group headers as paste targets)
- Keyboard navigation (arrow keys skip over group headers)
- F2 / Enter editing (don't enter edit mode on group headers)
- Shift+Enter expand record (don't expand group headers)
- Drag-select start (don't begin drag on group headers)
- Row numbers (group headers show special numbers, not sequential)

**Trade-offs:**
- Pro: Simple, no parallel index system needed
- Pro: Works naturally with existing render loop
- Con: Every operation must defensively check for markers
- Con: Row indices in the processed data include group headers (not pure data indices)

---

## 14. Edge Cases & Gotchas

### Zoom Scaling
- Zoom is applied as CSS `transform: scale(zoomLevel/100)` on the grid container
- Hit testing must divide mouse coordinates by the zoom factor
- Auto-scroll calculations must account for zoom when computing scroll positions
- The scroll overlay's dimensions must be adjusted for zoom

### Frozen Columns
- Frozen columns paint on top of scrolled content with a gradient shadow separator
- Hit testing checks the frozen area first (it's on top)
- The footer stats bar also freezes the same columns
- Column reorder must not reorder into/out of the frozen zone

### devicePixelRatio
- Canvas dimensions are multiplied by `window.devicePixelRatio` for crisp rendering
- All drawing coordinates are scaled by DPR
- CSS dimensions stay at logical pixels
- This is critical for Retina displays

### Row Heights
- 4 levels: Short (32px), Medium (56px), Tall (84px), ExtraTall (108px)
- Changes affect all rows uniformly
- The coordinate manager recalculates total height when row height changes
- Group header rows use the same height as data rows

### Mock Data
- `mock-data.ts` generates 100 realistic records with 18 columns
- Columns cover multiple cell types for testing
- Names, emails, addresses are randomly generated but realistic
- The mock data is generated once with `useMemo(() => generateMockTableData(), [])` — stable across re-renders

### Context Menu Positioning
- Uses React portals to render outside the grid's DOM hierarchy
- Positioned at click coordinates, adjusted to stay within viewport bounds
- Closed on click outside, scroll, or Escape key

### Cell Editing
- `CellEditorOverlay` is an HTML element positioned absolutely over the canvas cell
- It reads the active cell's position from the coordinate manager
- When editing completes (blur, Enter, Escape), the value is committed via `onCellChange`
- Different cell types get different editor components (text input, checkbox, dropdown, etc.)

---

## 15. File-by-File Guide

### Core Application
| File | Lines | Purpose |
|---|---|---|
| `src/App.tsx` | ~587 | Data owner, processes sort/filter/group/search, renders views + modals |
| `src/main.tsx` | ~10 | React entry point, renders App |
| `src/index.css` | ~100 | Tailwind v4 imports + shadcn/ui CSS custom properties theme |
| `src/lib/utils.ts` | ~6 | `cn()` utility (clsx + tailwind-merge) |
| `src/lib/mock-data.ts` | ~317 | Generates 100 mock records across 18 columns |

### Type System
| File | Purpose |
|---|---|
| `src/types/cell.ts` | CellType enum + 22 cell data interfaces |
| `src/types/grid.ts` | IGridConfig, IGridTheme, RowHeightLevel, RegionType, IRecord, IColumn, etc. |
| `src/types/column.ts` | IColumn re-export |
| `src/types/record.ts` | IRecord, IRowHeader, ITableData re-export |
| `src/types/selection.ts` | Selection range types |
| `src/types/view.ts` | ViewType, IView |
| `src/types/context-menu.ts` | Context menu item types |
| `src/types/grouping.ts` | Group config types |
| `src/types/keyboard.ts` | Keyboard navigation types |
| `src/types/index.ts` | Re-exports everything |

### Stores (Zustand)
| File | Purpose |
|---|---|
| `src/stores/ui-store.ts` | Sidebar, zoom, theme, row height (persisted) |
| `src/stores/view-store.ts` | View list, current view |
| `src/stores/fields-store.ts` | Column visibility management |
| `src/stores/grid-view-store.ts` | Scroll position, active cell, selected rows |
| `src/stores/modal-control-store.ts` | Modal open/close flags |
| `src/stores/statistics-store.ts` | Footer stats configuration (persisted) |
| `src/stores/index.ts` | Re-exports all stores |

### Canvas Grid Engine
| File | Lines | Purpose |
|---|---|---|
| `src/views/grid/grid-view.tsx` | ~1051 | React wrapper: canvas, scroll overlay, all event handlers, keyboard shortcuts |
| `src/views/grid/canvas/renderer.ts` | ~812 | Main canvas paint engine (GridRenderer class) |
| `src/views/grid/canvas/coordinate-manager.ts` | ~194 | Viewport math, hit testing, frozen column support |
| `src/views/grid/canvas/cell-painters.ts` | ~488 | Paint functions for all 22 cell types |
| `src/views/grid/canvas/theme.ts` | ~45 | Grid theme constants (colors, fonts, dimensions) |
| `src/views/grid/canvas/types.ts` | varies | Canvas-specific type definitions |

### Grid Features
| File | Purpose |
|---|---|
| `src/views/grid/footer-stats-bar.tsx` | Per-column statistics bar (Count/Sum/Avg/Min/Max) |
| `src/views/grid/cell-editor-overlay.tsx` | HTML editing overlay positioned over canvas cells |
| `src/views/grid/cell-renderer.tsx` | React cell renderer (used by editing overlay) |
| `src/views/grid/context-menu.tsx` | Right-click context menu (portal-based) |
| `src/views/grid/expanded-record-modal.tsx` | Full record view with editable fields |
| `src/views/grid/sort-modal.tsx` | Multi-field sort rules dialog |
| `src/views/grid/filter-modal.tsx` | Multi-condition filters with type-aware operators |
| `src/views/grid/group-modal.tsx` | Multi-level grouping dialog |
| `src/views/grid/hide-fields-modal.tsx` | Toggle column visibility |
| `src/views/grid/export-modal.tsx` | CSV/JSON export with column selection |
| `src/views/grid/import-modal.tsx` | CSV/JSON import with column mapping |

### Kanban View
| File | Purpose |
|---|---|
| `src/views/kanban/kanban-view.tsx` | Board layout with stack-by field selector |
| `src/views/kanban/kanban-card.tsx` | Draggable card component (@dnd-kit) |
| `src/views/kanban/kanban-stack.tsx` | Stack/column with drop target |

### Layout Components
| File | Purpose |
|---|---|
| `src/components/layout/main-layout.tsx` | Composes header + sidebar + toolbar + content |
| `src/components/layout/header.tsx` | Top bar (title, share, avatars, user menu) |
| `src/components/layout/sidebar.tsx` | Collapsible sidebar with view list |
| `src/components/layout/tab-bar.tsx` | Table tabs |
| `src/components/layout/sub-header.tsx` | Toolbar (sort, filter, group, hide, search, zoom, row height, import, export) |

### shadcn/ui Components
Located in `src/components/ui/`: button, badge, input, separator, tooltip, scroll-area, dropdown-menu, tabs, dialog, switch, checkbox, label, popover, select, toggle, toggle-group, slot

### Other
| File | Purpose |
|---|---|
| `src/services/collaboration.ts` | Socket.io collaboration service scaffolding (not yet functional) |
| `src/views/sharing/share-modal.tsx` | Share link, permissions, collaborator management UI |
| `src/views/auth/user-menu.tsx` | User dropdown with theme toggle |

---

## 16. Dependencies & Versions

### Runtime Dependencies
```json
"@dnd-kit/core": "^6.3.1",
"@dnd-kit/sortable": "^10.0.0",
"@dnd-kit/utilities": "^3.2.2",
"@radix-ui/react-checkbox": "^1.1.4",
"@radix-ui/react-context-menu": "^2.2.6",
"@radix-ui/react-dialog": "^1.1.6",
"@radix-ui/react-dropdown-menu": "^2.1.6",
"@radix-ui/react-label": "^2.1.2",
"@radix-ui/react-popover": "^1.1.6",
"@radix-ui/react-scroll-area": "^1.2.3",
"@radix-ui/react-select": "^2.1.6",
"@radix-ui/react-separator": "^1.1.2",
"@radix-ui/react-slot": "^1.1.2",
"@radix-ui/react-switch": "^1.1.3",
"@radix-ui/react-tabs": "^1.1.3",
"@radix-ui/react-toggle": "^1.1.2",
"@radix-ui/react-toggle-group": "^1.1.2",
"@radix-ui/react-tooltip": "^1.1.8",
"axios": "^1.12.2",
"axios-hooks": "^5.1.1",
"class-variance-authority": "^0.7.1",
"clsx": "^2.1.1",
"dayjs": "^1.11.19",
"lodash": "^4.17.21",
"lucide-react": "^0.562.0",
"papaparse": "^5.5.3",
"radix-ui": "^1.4.3",
"react": "^18.3.1",
"react-dom": "^18.3.1",
"react-dropzone": "^14.3.8",
"react-hook-form": "^7.65.0",
"react-router-dom": "^7.9.4",
"socket.io-client": "^4.8.1",
"tailwind-merge": "^2.6.0",
"uuid": "^13.0.0",
"zustand": "^5.0.8"
```

### Dev Dependencies
```json
"@tailwindcss/vite": "^4.1.0",
"@types/lodash": "^4.17.20",
"@types/node": "^24.9.1",
"@types/react": "^18.3.12",
"@types/react-dom": "^18.3.1",
"@types/uuid": "^10.0.0",
"@vitejs/plugin-react": "^4.3.3",
"autoprefixer": "^10.4.20",
"postcss": "^8.5.1",
"tailwindcss": "^4.1.0",
"typescript": "^5.6.3",
"vite": "^6.3.0"
```

---

## 17. Configuration & Environment

### Vite Config (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5000,        // Required by Replit
    host: "0.0.0.0",   // Required for Replit proxy
    open: false,
    strictPort: true,
    allowedHosts: true, // Required for Replit iframe proxy
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // @ -> src/
    },
  },
});
```

### Key Config Points
- **Port 5000** is mandatory for Replit's proxy to work
- **`allowedHosts: true`** is mandatory or the user can't see the app through Replit's iframe
- **Path alias `@`** maps to `src/` for clean imports
- Tailwind v4 uses `@tailwindcss/vite` plugin instead of PostCSS config

### TypeScript Config
- `compilerOptions.paths`: `"@/*": ["./src/*"]`
- Strict mode enabled
- JSX: react-jsx

---

## 18. User Preferences & Hard Rules

These are non-negotiable preferences established during our collaboration:

1. **Legacy folder is sacred** — Never modify, never copy code from it. Use it only as visual/feature reference.
2. **UX over code maintainability** — When there's a trade-off, always choose what looks/feels best for the user.
3. **Canvas-based grid, not HTML** — The grid must use Canvas 2D API for rendering, not HTML tables or divs. This is a performance-first decision.
4. **Tailwind v4 with CSS config** — Not Tailwind v3 with JS config. V4 uses CSS custom properties.
5. **shadcn/ui components** — Not MUI, not Ant Design, not Chakra. shadcn/ui with Radix UI primitives.
6. **Fresh code, not migration** — Don't try to adapt legacy code. Study the legacy for features, then build fresh.
7. **Zustand for state** — Not Redux, not Context API, not MobX. Zustand is the chosen state manager.
8. **Mock data for now** — Frontend-only with realistic mock data. Backend integration comes later.
9. **The project is called "TinyTable"** (or "Sheet" in the code / package.json).

---

## 19. What's Left to Build

### Immediate Priority — Remaining UX Gaps
- Interactive freeze column handle (visual drag handle)
- Row header checkboxes for multi-row selection
- Row header expand icons for quick record detail view
- Enhanced/custom scrollbar styling
- Undo/redo with command history (Ctrl+Z / Ctrl+Shift+Z)

### Medium-Term — Backend Integration
- API endpoints for CRUD operations (records, columns, views, tables)
- Database-backed persistence (PostgreSQL recommended)
- Replace mock data with real API calls
- User authentication (Replit Auth or external provider)
- Real-time collaboration via Socket.io (scaffolding already exists in `src/services/collaboration.ts`)

### Long-Term — Advanced Features
- Multiple tables with relationships
- Linked records between tables
- Automations / workflows
- Form view for data entry
- Calendar view
- Gallery view
- API access for external integrations
- Comments and activity log per record
- Field-level permissions
- Custom views with saved sort/filter/group configurations
- Formula field evaluation engine
- File upload storage (S3/Cloudflare R2)
- Search across tables
- Dark mode full implementation (theme toggle exists but canvas colors are light-only)

---

## 20. Lessons Learned & Design Principles

### Canvas Rendering Lessons
1. Always multiply canvas dimensions by `devicePixelRatio` and scale the context — otherwise it looks blurry on Retina
2. Use `requestAnimationFrame` for rendering, never paint synchronously in event handlers
3. Keep a transparent HTML overlay for scrollbars — fighting native scroll is a losing battle
4. Hit testing must inverse any transforms (zoom, DPR) to map mouse coordinates to grid coordinates
5. Frozen columns must be painted last (on top), and hit testing must check them first

### State Management Lessons
1. Don't put everything in one store — 6 focused stores are better than 1 god store
2. Persist only what matters (sidebar state, zoom, theme, stats config) — not transient state
3. Keep processed data (filtered/sorted/grouped) as a `useMemo` derivative, not in a store

### Architecture Lessons
1. Canvas + React hybrid works well: canvas for performance-critical rendering, React for interactivity
2. Marker records for grouping is pragmatic but requires discipline — every new feature must check for `__group__`
3. The data pipeline (filter → search → sort → group) should be a single derivation, not scattered across components
4. Modal state centralization (`useModalControlStore`) prevents modal management from becoming spaghetti

### UX Lessons
1. The sub-header toolbar is the user's primary interaction point — it needs to be dense but not cluttered
2. Context menus should match Airtable's behavior exactly — users have muscle memory
3. Footer statistics are a "discover on hover" feature — invisible when not configured, visible when set
4. Group headers need strong visual differentiation (colored bars) so users don't confuse them with data rows

---

## Project Statistics (as of Feb 2026)

- **Total TypeScript/TSX files**: 60
- **Total lines of code**: ~6,318
- **Largest files**: grid-view.tsx (~1,051 lines), renderer.ts (~812 lines)
- **Number of Zustand stores**: 6
- **Number of cell types**: 22
- **Number of shadcn/ui components**: ~15
- **Mock data records**: 100 records × 18 columns

---

*This knowledge base was created on February 20, 2026, to preserve the complete context of the TinyTable project for continuity across accounts.*
