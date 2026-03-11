# CoordinateManager Implementation - Summary

## Problem Statement

The `useVirtualScrolling.ts` hook was incorrectly calculating visible ranges when rows/columns had different heights/widths. It assumed fixed sizes and used simple division, causing misalignment and incorrect rendering with variable sizes.

Additionally, there were performance issues:

1. Editor `onChange` was calling the parent on every keystroke, causing full page re-renders
2. Column resize was updating the parent on every mouse move, causing UI flickering and width reset issues

## Solution Overview

### 1. Created CoordinateManager Class

**Location**: `src/managers/coordinate-manager/CoordinateManager.ts`

A centralized coordinate management system that:

- Uses binary search (O(log n)) instead of simple division
- Lazily computes and caches metadata (offset and size) for each row/column
- Supports variable row/column sizes efficiently
- Updates metadata only when dimensions change

#### Key Features:

- **Binary Search**: Finds the row/column at a pixel offset efficiently
- **Lazy Caching**: Builds metadata incrementally as needed
- **Metadata Invalidation**: Clears cache when sizes change
- **Performance**: O(log n) lookup vs O(n) division approach

#### Methods:

- `getRowStartIndex(scrollTop)` - Find first visible row
- `getRowStopIndex(startIndex, scrollTop)` - Find last visible row
- `getColumnStartIndex(scrollLeft)` - Find first visible column
- `getColumnStopIndex(startIndex, scrollLeft)` - Find last visible column
- `getRowOffset(rowIndex)` - Get Y offset for a row
- `getColumnOffset(columnIndex)` - Get X offset for a column
- `refreshRowDimensions()` - Update when rows change
- `refreshColumnDimensions()` - Update when columns change

### 2. Updated useVirtualScrolling Hook

**Location**: `src/hooks/useVirtualScrolling.ts`

#### Changes:

- Added `rowHeightMap` and `columnWidthMap` to config
- Uses CoordinateManager for binary search instead of simple division
- Initializes CoordinateManager with useRef to persist across renders
- Updates CoordinateManager when dimensions change via useEffect

#### Before (WRONG):

```typescript
startRow = Math.floor(scrollTop / rowHeight); // Only works for constant sizes
```

#### After (CORRECT):

```typescript
startRow = coordinateManager.getRowStartIndex(scrollTop); // Works for variable sizes
```

### 3. Fixed Full Page Re-renders on Editor Changes

**Location**: `src/cell-level/editors/*/`

#### Changes to StringEditor, NumberEditor, McqEditor:

- Removed `onChange` calls on every keystroke
- Now only calls `onChange` when saving (Enter key or blur)
- Prevents full page re-renders during editing

#### Before:

```typescript
const handleChange = (e) => {
	setValue(e.target.value);
	onChange(newValue); // Called on every keystroke!
};
```

#### After:

```typescript
const handleChange = (e) => {
	setValue(e.target.value);
	// Don't call onChange - only update local state
};

const handleKeyDown = (e) => {
	if (e.key === "Enter") {
		onChange(value); // Only call onChange on save
		onSave?.();
	}
};
```

### 4. Fixed Column Resize Width Reset Issue

**Location**: `src/hooks/useColumnResize.ts`

#### Changes:

- Removed `onColumnResize` callback from `onColumnResizeChange`
- Now only calls parent callback on `onColumnResizeEnd`
- Prevents duplicate updates and UI flickering
- Width is properly persisted after resize

#### Before:

```typescript
// Called on every mouse move during resize
onColumnResize?.(resizeColumnIndex, newWidth);
```

#### After:

```typescript
// Only called when mouse is released
if (columnResizeState.isResizing && columnResizeState.columnIndex >= 0) {
	onColumnResize?.(columnResizeState.columnIndex, columnResizeState.width);
}
```

### 5. Updated GridView to Pass Size Maps

**Location**: `src/views/grid/GridView.tsx`

#### Changes:

- Creates `rowHeightMap` and `columnWidthMap` via useMemo
- Passes them to `useVirtualScrolling` config
- Updated `totalWidth` calculation to include resize state in dependencies

#### Implementation:

```typescript
const rowHeightMap = useMemo(() => {
	const map: Record<number, number> = {};
	rowHeaders.forEach((header, index) => {
		if (header.height !== rowHeight) {
			map[index] = header.height;
		}
	});
	return map;
}, [rowHeaders, rowHeight]);

const columnWidthMap = useMemo(() => {
	const map: Record<number, number> = {};
	columns.forEach((column, index) => {
		if (column.width !== 120) {
			map[index] = column.width;
		}
	});
	return map;
}, [columns]);
```

## Benefits

1. **Performance**:
    - Binary search is O(log n) vs O(n) for division
    - No full page re-renders during editing
    - Smooth column resizing without UI flickering

2. **Correctness**:
    - Accurate visible range calculation with variable sizes
    - Proper cell positioning and alignment
    - No width reset issues on column resize

3. **Centralized Management**:
    - Single source of truth for coordinate calculations
    - Easy to extend and maintain
    - Consistent behavior across the grid

## Testing

To test the implementation:

1. **Variable Row Heights**: Create rows with different heights and scroll - cells should align correctly
2. **Variable Column Widths**: Create columns with different widths and scroll - cells should align correctly
3. **Editor Changes**: Edit a cell and type - should NOT cause full page re-renders
4. **Column Resize**: Resize a column - width should persist properly

## Architecture

```
CoordinateManager (managers/coordinate-manager/)
├── CoordinateManager.ts       # Core implementation
├── interface.ts               # Type definitions
└── index.ts                   # Exports

useVirtualScrolling (hooks/)
└── useVirtualScrolling.ts     # Uses CoordinateManager

Editors (cell-level/editors/)
├── StringEditor.tsx           # Fixed onChange behavior
├── NumberEditor.tsx           # Fixed onChange behavior
└── McqEditor.tsx              # Fixed onChange behavior

GridView (views/grid/)
└── GridView.tsx               # Passes size maps to virtual scrolling
```

## References

- Inspired by Teable's CoordinateManager implementation
- Uses binary search algorithm for efficient lookups
- Implements lazy metadata caching for performance
- Follows Teable's patterns for variable size support
