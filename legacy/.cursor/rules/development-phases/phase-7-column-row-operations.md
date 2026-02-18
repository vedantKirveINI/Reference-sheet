# Phase 7: Column & Row Operations
**HIGH | Duration: 2-3 days | Status: Not Started**

## 🎯 Phase Overview

Column and row manipulations + styling:
- ✅ Resize columns (drag header border)
- ✅ Resize rows
- ✅ Auto-fit column width
- ✅ Hide/show columns
- ✅ Reorder columns (drag header)
- ✅ Duplicate column
- ✅ Delete column
- ✅ Insert column before/after
- ✅ **NEW: Style cells/rows/columns (colors, formatting)**
  - Background colors
  - Text colors
  - Bold/Italic/Strikethrough
  - Text alignment

---

## 🛠️ Implementation

### Components
```
Grid/
├── ResizeManager         # Resize logic
├── ResizeHandle          # Drag handle
├── ColumnHeaderMenu      # Context menu
├── RowHeaderMenu         # Context menu
├── StyleMenu             # NEW: Style options
├── ColorPicker           # NEW: Color selector
└── StyleToolbar          # NEW: Formatting toolbar
```

### File Structure
```
packages/sdk/src/grid/
├── managers/
│   ├── ResizeManager.ts
│   └── StyleManager.ts           # NEW: Manage styles
│
├── components/
│   ├── Menus/
│   │   ├── ColumnHeaderMenu.tsx
│   │   ├── RowHeaderMenu.tsx
│   │   └── StyleMenu.tsx         # NEW: Style options
│   │
│   └── UI/
│       ├── ColorPicker.tsx       # NEW: Color selector
│       └── StyleToolbar.tsx      # NEW: Formatting buttons
│
└── hooks/
    ├── useColumnResize.ts
    └── useStyleManager.ts        # NEW: Style state & actions
```

---

## 📋 Rules Checklist
- [ ] Resizing works
- [ ] Hide/show works
- [ ] Reorder works
- [ ] **NEW: Cell styling UI works**
- [ ] **NEW: Row styling UI works**
- [ ] **NEW: Column styling UI works**
- [ ] Persistence to backend
- [ ] Real-time sync

## 🚀 Implementation Prompt

```
## Build Column & Row Operations + Styling (Phase 7)

Column and row operations with styling UI.

### Requirements:
- Resize columns/rows
- Auto-fit width
- Hide/show
- Reorder (drag)
- Duplicate
- Delete
- Insert
- **NEW: Style UI for cells/rows/columns**
  - Background color picker
  - Text color picker
  - Font weight toggle (bold)
  - Font style toggle (italic)
  - Text decoration toggle (strikethrough)
  - Text alignment buttons (left, center, right)
- Batch styling (apply to multiple cells/rows/columns)
- Backend sync
- Real-time sync

### File Structure:

1. **StyleManager (managers/StyleManager.ts)**
   - getCellStyle(row, col)
   - getRowStyle(row)
   - getColumnStyle(col)
   - setCellStyle(row, col, style)
   - setRowStyle(row, style)
   - setColumnStyle(col, style)
   - clearStyle(row, col)
   - Batch operations

2. **StyleMenu (components/Menus/StyleMenu.tsx)**
   - Right-click context menu
   - Color options
   - Formatting buttons
   - Uses 16-step component structure

3. **ColorPicker (components/UI/ColorPicker.tsx)**
   - Predefined colors
   - Custom color input
   - Recent colors
   - OUTE-DS Dialog

4. **StyleToolbar (components/UI/StyleToolbar.tsx)**
   - Bold/Italic/Strikethrough buttons
   - Text alignment buttons
   - Clear formatting button
   - Use OUTE-DS ButtonGroup

5. **useStyleManager (hooks/useStyleManager.ts)**
   - Get selected cells/rows/columns
   - Apply style
   - Clear style
   - Batch operations
   - Undo/redo support (13-step hook structure)

### UI Interactions:

**Cell Styling:**
1. Select cell(s)
2. Right-click → "Format cell"
3. Choose: Color, Background, Bold, Italic, Align, etc.
4. Apply
5. Style saved to backend

**Row Styling:**
1. Click row header
2. Right-click → "Format row"
3. Choose styling options
4. Apply to entire row
5. Style saved

**Column Styling:**
1. Click column header
2. Right-click → "Format column"
3. Choose styling options
4. Apply to entire column
5. Style saved

### Styling Features:

**Color Options:**
- Predefined palette (10-15 colors)
- Custom hex color input
- None/Clear option
- Recent colors (last 5 used)

**Format Options:**
- Bold (B button)
- Italic (I button)
- Strikethrough (S button)
- Text alignment: Left | Center | Right

**Batch Styling:**
- Select multiple cells (Ctrl+Click, drag)
- Apply formatting to all
- Select row/column
- Apply formatting to all

### Backend Integration:
- Send style with cell data
- Store in cell metadata (JSONB)
- Store row styles in view config
- Store column styles in view config
- On cell update, include current style
- Merge styles correctly (cell > row > column)

### Acceptance Criteria:
- [ ] Right-click shows style menu
- [ ] Color picker works
- [ ] Bold/Italic/Strikethrough buttons work
- [ ] Text alignment buttons work
- [ ] Cell styling applied
- [ ] Row styling applied
- [ ] Column styling applied
- [ ] Batch styling works
- [ ] Styles persist to backend
- [ ] Real-time sync
- [ ] Undo/redo works
```

---

## ✅ Acceptance Criteria

- [ ] All operations work
- [ ] **Cell styling UI works**
- [ ] **Row styling UI works**
- [ ] **Column styling UI works**
- [ ] Color picker functional
- [ ] Format buttons functional
- [ ] Changes persist
- [ ] Real-time sync
- [ ] No TypeScript errors
- [ ] Responsive on mobile

## 📌 Next Phase

→ **Move to Phase 8: Views Switching**
