# Phase 6: Selection & Interaction
**HIGH | Duration: 2-3 days | Status: Not Started**

## 🎯 Phase Overview

Cell selection and interactions:
- ✅ Single cell selection
- ✅ Range selection (drag)
- ✅ Column/row header selection
- ✅ Ctrl+Click for multi-select
- ✅ Shift+Click for range
- ✅ Context menu
- ✅ Copy/Paste
- ✅ Delete key
- ✅ Double-click to edit

---

## 📚 Reference Analysis

### How Teable Does It
- Click to select single cell
- Drag to select range
- SelectionManager tracks selection state
- Visual overlay shows selected cells
- Context menu on right-click
- Keyboard shortcuts for operations

### How Old Frontend Does It
- Handsontable selection system
- Row/column headers clickable
- Context menu for operations
- Copy/paste via clipboard API

**What to Keep:**
- Click selects, drag extends
- Ctrl+Click for multi-select
- Shift+Click for range
- Ctrl+C/V for copy/paste
- Delete key clears content
- Right-click for context menu

---

## 🛠️ Technical Implementation

### Selection Architecture

```typescript
interface ISelectionState {
  startCell: { row: number; col: number } | null;
  endCell: { row: number; col: number } | null;
  selectedRows: Set<number>;
  selectedCols: Set<number>;
  selectedCells: Set<string>; // "row_col" format
}

interface ISelectionMode {
  type: 'single' | 'range' | 'multiSelect' | 'rowHeader' | 'colHeader';
  startCell: CellCoord;
  currentCell: CellCoord;
}
```

### File Structure

```
packages/sdk/src/grid/
├── managers/
│   ├── SelectionManager.ts       # Track & manage selections
│   └── ClipboardManager.ts       # Copy/paste operations
│
├── components/
│   ├── SelectionOverlay.tsx      # Visual selection indicator
│   ├── ContextMenu.tsx           # Right-click menu
│   ├── CellContextMenu.tsx       # Cell options
│   ├── RowHeaderMenu.tsx         # Row options
│   └── ColumnHeaderMenu.tsx      # Column options
│
├── hooks/
│   ├── useSelection.ts           # Selection state & actions
│   ├── useClipboard.ts           # Copy/paste
│   ├── useContextMenu.ts         # Context menu handling
│   └── useKeyboardShortcuts.ts   # Ctrl+C, Ctrl+V, Delete
│
└── types/
    └── selection.types.ts
```

---

## 📋 Rules Checklist

- [ ] **TECH-REACT-STRUCT-001** - Components follow 16-step order
- [ ] **TECH-REACT-STRUCT-002** - Hooks follow 13-step order
- [ ] Single cell selection works
- [ ] Range selection works (drag)
- [ ] Multi-select works (Ctrl+Click)
- [ ] Row/column selection works
- [ ] Context menu works
- [ ] Copy/paste functional
- [ ] Delete key clears content
- [ ] Selection visual indicator correct

---

## 🚀 Implementation Prompt

```
## Build Selection & Interaction (Phase 6)

Cell selection, multi-select, context menus, copy/paste, and keyboard shortcuts.

### Context:
After Phase 5 (cell editing), now add selection and interaction system.
- Click cells to select
- Drag to select ranges
- Context menus for operations
- Copy/paste functionality
- Keyboard shortcuts

### Key Requirements:
- Single cell selection (click)
- Range selection (drag or Shift+Click)
- Multi-select (Ctrl+Click)
- Column header selection (click header)
- Row header selection (click header)
- Context menu (right-click)
- Copy (Ctrl+C): Copy selected cells
- Paste (Ctrl+V): Paste to selected cell
- Delete (Del): Clear selected cells
- Visual selection indicator
- No TypeScript errors
- All components follow 16-step structure
- All hooks follow 13-step structure

### Reference Files:
FROM TEABLE:
- SelectionManager implementation
- Multi-select logic
- Context menu patterns

FROM OLD FRONTEND:
- Handsontable selection
- Copy/paste clipboard API
- Keyboard shortcuts

### Task: Build Complete Selection System

1. **SelectionManager (managers/SelectionManager.ts)**
   - Track selection state
   - getSingleSelection(): CellCoord | null
   - getRangeSelection(): CellRange | null
   - getSelectedCells(): CellCoord[]
   - getSelectedRows(): number[]
   - getSelectedColumns(): number[]
   - setSingleSelection(cell)
   - setRangeSelection(start, end)
   - addToMultiSelect(cell)
   - clearSelection()

2. **ClipboardManager (managers/ClipboardManager.ts)**
   - Copy selected cells
   - Paste to target cell
   - Format data for clipboard (TSV)
   - Parse clipboard data
   - Handle multi-cell paste

3. **SelectionOverlay (components/SelectionOverlay.tsx)**
   - Render selection visual
   - Blue background for selected cells
   - Border for range boundaries
   - Use canvas drawing (not DOM)
   - Update on selection change

4. **ContextMenu (components/ContextMenu.tsx)**
   - Right-click menu
   - Options: Copy, Paste, Delete, Insert, Format, etc.
   - Position near mouse
   - Close on click or escape
   - Use OUTE-DS Menu component

5. **CellContextMenu (components/CellContextMenu.tsx)**
   - Cell-specific options
   - Edit, Copy, Paste, Delete
   - Format cell
   - Insert row/column

6. **RowHeaderMenu (components/RowHeaderMenu.tsx)**
   - Row-specific options
   - Insert row above/below
   - Delete row
   - Format row
   - Select entire row

7. **ColumnHeaderMenu (components/ColumnHeaderMenu.tsx)**
   - Column-specific options
   - Insert column left/right
   - Delete column
   - Format column
   - Select entire column

8. **useSelection (hooks/useSelection.ts)**
   - Manage selection state
   - Handle selection updates
   - Dispatch selection actions
   - Use 13-step hook structure

9. **useClipboard (hooks/useClipboard.ts)**
   - Copy operation
   - Paste operation
   - Format for clipboard
   - Parse from clipboard

10. **useContextMenu (hooks/useContextMenu.ts)**
    - Track mouse position
    - Show/hide menu
    - Handle menu clicks
    - Close on outside click

11. **useKeyboardShortcuts (hooks/useKeyboardShortcuts.ts)**
    - Listen for Ctrl+C (copy)
    - Listen for Ctrl+V (paste)
    - Listen for Delete (clear)
    - Prevent default behavior

### Implementation Details:

**Selection Modes:**
```
Single:      Click cell → select that cell
Range:       Drag from start to end cell
             Or Shift+Click start, then Shift+Click end
MultiSelect: Ctrl+Click individual cells
             Or Ctrl+Click ranges
RowHeader:   Click row number → select entire row
ColHeader:   Click column letter → select entire column
```

**Keyboard Shortcuts:**
```
Ctrl+A:      Select all (if not in edit mode)
Ctrl+C:      Copy selected cells
Ctrl+V:      Paste to selected cell
Delete:      Clear content of selected cells
Escape:      Deselect
Tab:         Move to next cell (in selection)
Shift+Tab:   Move to prev cell (in selection)
```

**Copy/Paste Format:**
```
Internal: JSON array of objects
Clipboard: Tab-separated values (TSV)
Multi-row, multi-column supported
Example: "1\t2\t3\n4\t5\t6" (2 rows, 3 cols)
```

**Context Menu Items:**
```
Cut/Copy/Paste
Insert Row Above/Below
Insert Column Left/Right
Delete Row/Column
Delete Content Only
Format Cell/Row/Column
Hide Row/Column
Duplicate Row/Column
```

### Acceptance Criteria:
- [ ] Click selects single cell
- [ ] Drag selects range
- [ ] Shift+Click extends range
- [ ] Ctrl+Click adds to selection
- [ ] Column header selection works
- [ ] Row header selection works
- [ ] Right-click shows menu
- [ ] Menu items functional
- [ ] Copy works
- [ ] Paste works
- [ ] Delete key clears content
- [ ] Selection visual correct
- [ ] Keyboard shortcuts work
- [ ] Escape deselects
- [ ] No TypeScript errors
```

---

## ✅ Acceptance Criteria

- [ ] All selection modes work
- [ ] Context menu works
- [ ] Copy/paste works
- [ ] Delete key works
- [ ] Keyboard shortcuts work
- [ ] Selection visual correct
- [ ] Multi-user sync (no conflicts)
- [ ] No TypeScript errors

## 📌 Next Phase

→ **Move to Phase 7: Column & Row Operations**
