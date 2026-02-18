# Phase 4: Cell Rendering
**CRITICAL | Duration: 3-4 days | Status: Not Started**

## 🎯 Phase Overview

Render all cell types on the canvas:
- ✅ Text cells
- ✅ Number cells
- ✅ Date/DateTime cells
- ✅ Checkbox cells
- ✅ Select/MultiSelect cells
- ✅ Rating cells
- ✅ Link cells
- ✅ File/Image cells
- ✅ Formula cells
- ✅ Lookup/Rollup cells
- ✅ Bold/Italic/Strikethrough formatting
- ✅ Text alignment and wrapping
- ✅ **Cell Styling (NEW): Background colors, text colors, font weight, etc.**

**Why:** Essential for displaying data from the backend + custom styling per cell/row/column.

---

## 📚 Reference Analysis

### How Teable Does It
- Separate renderer for each field type
- Formatting applied on render (not data mutation)
- Icons for cell type indicators
- Text clipping and overflow handling
- **Cell styling layer**: Separate from content rendering

### How Old Frontend Does It
- Handsontable handles rendering
- Custom renderers for complex types
- OUTE-DS components for dropdowns
- **Custom CSS classes for styling**

---

## 🛠️ Implementation

### File Structure
```
packages/sdk/src/grid/
├── rendering/
│   ├── CellRenderer.ts         # Main renderer dispatcher
│   ├── CellStyler.ts           # NEW: Apply styles to cells
│   ├── renderers/
│   │   ├── TextCellRenderer.ts
│   │   ├── NumberCellRenderer.ts
│   │   ├── DateCellRenderer.ts
│   │   ├── CheckboxCellRenderer.ts
│   │   ├── SelectCellRenderer.ts
│   │   ├── RatingCellRenderer.ts
│   │   ├── LinkCellRenderer.ts
│   │   ├── FileCellRenderer.ts
│   │   ├── FormulaCellRenderer.ts
│   │   ├── LookupCellRenderer.ts
│   │   ├── RollupCellRenderer.ts
│   │   └── index.ts
│   │
│   ├── formatters/
│   │   ├── TextFormatter.ts
│   │   ├── NumberFormatter.ts
│   │   ├── CurrencyFormatter.ts
│   │   ├── DateFormatter.ts
│   │   ├── PhoneFormatter.ts
│   │   ├── EmailFormatter.ts
│   │   ├── URLFormatter.ts
│   │   ├── PercentFormatter.ts
│   │   └── index.ts
│   │
│   └── styles/
│       ├── CellStyle.ts         # NEW: Cell style types & defaults
│       ├── ColorPalette.ts      # NEW: Predefined colors
│       └── index.ts
│
├── types/
│   └── styles.ts                # NEW: ICellStyle interface
│
└── managers/
    └── StyleManager.ts          # NEW: Manage cell/row/column styles
```

### Cell Styling Types

```typescript
interface ICellStyle {
  // Background
  backgroundColor?: string;        // #RRGGBB or color name
  
  // Text color
  textColor?: string;
  
  // Font properties
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'strikethrough';
  
  // Text alignment
  textAlign?: 'left' | 'center' | 'right';
  
  // Padding/borders (for visual spacing)
  borderColor?: string;
  borderWidth?: number;
}

// Styles can be applied at different levels
interface IStyleMap {
  cellStyles: Map<string, ICellStyle>;           // cell -> {row, col}
  rowStyles: Map<number, ICellStyle>;            // row index
  columnStyles: Map<number, ICellStyle>;         // column index
  headerStyles: Map<string, ICellStyle>;         // row/column headers
}
```

---

## 📋 Rules Checklist

- [ ] All cell types render correctly
- [ ] Formatting applied properly (bold, italic, etc.)
- [ ] Cell styling applied (colors, backgrounds)
- [ ] Row styling applied to all cells in row
- [ ] Column styling applied to all cells in column
- [ ] Text clipping works
- [ ] No rendering artifacts
- [ ] 60fps maintained
- [ ] Styling persisted to backend

---

## 🚀 Implementation Prompt

```
## Build Cell Rendering + Styling (Phase 4)

Render all 12+ cell types on canvas with proper formatting AND custom cell styling.

### Requirements:
- Text, Number, Date/DateTime, Checkbox, Select, Rating, Link, File, Formula, Lookup, Rollup cells
- Text formatting (bold, italic, strikethrough)
- Text alignment and wrapping
- All formatters (Number, Currency, Date, Phone, Email, URL, Percent)
- **NEW: Cell styling system**
  - Background colors per cell
  - Text colors per cell
  - Font weight (normal, bold)
  - Font style (normal, italic)
  - Text decoration (none, underline, strikethrough)
  - Text alignment (left, center, right)
  - Border colors
- Row-level styling (apply to all cells in row)
- Column-level styling (apply to all cells in column)
- Header styling (row/column headers)
- Icons from OUTE-DS
- Canvas text rendering optimized
- No TypeScript errors

### Task:
1. CellRenderer: Main dispatcher by field type
2. 11 specific renderers: One per field type
3. 8 formatters: Format values for display
4. CellStyler: Apply styles to cells on canvas
5. StyleManager: Manage cell/row/column styles
6. ICellStyle interface: Define all style properties
7. Proper text measurement for clipping
8. Icon positioning
9. Color coding by type
10. Style merging (cell + row + column priority)

### Implementation Details:

**Style Application Priority:**
1. Cell-level styles (highest priority)
2. Row-level styles (if no cell style)
3. Column-level styles (if no cell/row style)
4. Default cell style (lowest priority)

**Canvas Rendering with Styles:**
```
For each visible cell:
1. Get cell value
2. Get applicable styles (cell > row > column > default)
3. Apply background color
4. Render text with:
   - Applied color
   - Font weight/style
   - Text decoration
   - Alignment
5. Apply border if specified
```

**Backend Integration:**
- Store styles in cell metadata (JSONB)
- Store row styles in view config
- Store column styles in view config
- On cell update, include styles
- On cell delete, preserve row/column styles

### Styling Examples:
- Highlight cells > 1000 with green background
- Make header row bold
- Color entire column based on type
- Strikethrough deleted records
- Color code by status (red=urgent, yellow=warning)

### Acceptance Criteria:
- [ ] All cell types render
- [ ] Text formatting works (bold, italic, strikethrough)
- [ ] Cell-level styling works
- [ ] Row-level styling works
- [ ] Column-level styling works
- [ ] Style priority correct (cell > row > column)
- [ ] Formatters apply correctly
- [ ] Text clipping correct
- [ ] Styles persist to backend
- [ ] 60fps maintained
```

---

## ✅ Acceptance Criteria

- [ ] All 12+ cell types render
- [ ] Text formatting works (bold, italic, etc.)
- [ ] **Cell styling works (colors, backgrounds)**
- [ ] **Row styling works**
- [ ] **Column styling works**
- [ ] **Style priority correct**
- [ ] Formatters apply correctly
- [ ] Text clipping smooth
- [ ] Styles saved to backend
- [ ] No rendering artifacts
- [ ] 60fps maintained

## 📌 Next Phase

→ **Move to Phase 5: Cell Editing**
