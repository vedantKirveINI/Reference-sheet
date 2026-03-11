# Grouping Playground Documentation

## Overview

Phase 1 of the grouping feature implements a **local playground** that allows you to see and interact with grouped UI using mock data. This approach lets you iterate on UX quickly without waiting for backend integration.

## Feature Flag

The grouping playground is controlled by a feature flag in `src/config/grouping.ts`:

```typescript
export const ENABLE_GROUPING_PLAYGROUND = true;
```

When `true`, the grid uses mock data and grouping transformations. When `false`, the grid renders normally.

## Architecture

### Data Flow

1. **Mock Data** (`src/mock/`)
   - `groupPoints.ts`: Flat array describing group structure (headers + row counts)
   - `groupedRecords.ts`: Sorted records array (already grouped by backend logic)
   - `groupConfig.ts`: GroupBy configuration (field IDs, order, etc.)

2. **Transformation** (`src/utils/grouping/`)
   - `groupPointsToLinearRows.ts`: Converts flat `groupPoints` → `linearRows` for rendering
   - `buildGroupCollection.ts`: Builds `groupColumns` and `getGroupCell` function
   - `groupHelpers.ts`: Utility functions (generateGroupId, toggle collapse, etc.)

3. **State Management** (`src/stores/groupByPlaygroundStore.ts`)
   - Zustand store managing:
     - `groupConfig`: Current groupBy configuration
     - `collapsedGroupIds`: Set of collapsed group IDs
     - Actions: `setGroupConfig`, `toggleGroupCollapse`, etc.

4. **Rendering** (`src/views/grid/`)
   - `drawGroupRow.ts`: Canvas rendering for group headers
   - `GridView.tsx`: Integrates grouping into main grid rendering

## Mock Data Structure

### groupPoints Example

```typescript
[
  { type: 0, depth: 0, value: "Category A", id: "hash1", isCollapsed: false },
  { type: 0, depth: 1, value: 25, id: "hash2", isCollapsed: false },
  { type: 1, count: 1 }, // 1 record in this group
  { type: 0, depth: 1, value: 20, id: "hash3", isCollapsed: false },
  { type: 1, count: 2 }, // 2 records in this group
  // ...
]
```

### groupConfig Example

```typescript
{
  groupObjs: [
    { fieldId: 88301, order: "asc", dbFieldName: "label_field", type: "SHORT_TEXT" },
    { fieldId: 88303, order: "desc", dbFieldName: "age_field", type: "NUMBER" },
  ]
}
```

## How It Works

1. **Initialization**: When `ENABLE_GROUPING_PLAYGROUND` is `true`, `mockGroupConfig` is automatically loaded into the Zustand store.

2. **Transformation**: `groupPointsToLinearRows` transforms the flat `groupPoints` array into `linearRows` that include:
   - Group headers (with depth, value, collapse state)
   - Regular rows (with realIndex mapping)

3. **Rendering**: 
   - Group headers are drawn using `drawGroupRow` before cells
   - Cells use `realIndex` from `linearRows` to access the correct record
   - Virtual scrolling accounts for group header heights

4. **Interactions**:
   - Click on group header → toggles collapse state
   - Collapsed groups hide nested rows
   - State persists in localStorage via Zustand persist middleware

## Testing the Playground

1. **Enable Feature Flag**: Set `ENABLE_GROUPING_PLAYGROUND = true` in `src/config/grouping.ts`

2. **View Grouped Grid**: The grid should automatically show grouped rows with headers

3. **Interact with Groups**:
   - Click group headers to collapse/expand
   - Verify nested groups work correctly
   - Check that records are grouped properly

4. **Use GroupBy Panel**: 
   - Import `GroupByPanel` component
   - Add/remove groupBy fields
   - Change order (ASC/DESC)
   - See changes reflected in grid

## Migration to Phase 2

When moving to Phase 2 (real backend integration), you'll need to:

1. **Replace Mock Data**:
   - Remove `mockGroupPoints`, `mockGroupedRecords`, `mockGroupConfig` imports
   - Use React Query to fetch real `groupPoints` and `records` from backend

2. **Update Data Sources**:
   - Replace `groupTransformationResult` calculation to use real API data
   - Update `groupCollection` to use real field metadata

3. **Keep Everything Else**:
   - Transformation utilities (`groupPointsToLinearRows`, `buildGroupCollection`) stay the same
   - Rendering logic (`drawGroupRow`) stays the same
   - State management pattern (Zustand store) can be enhanced but structure stays

## Files Created

- `src/types/grouping.ts` - Type definitions
- `src/mock/` - Mock data generators
- `src/utils/grouping/` - Transformation utilities
- `src/theme/grouping.ts` - Design tokens
- `src/stores/groupByPlaygroundStore.ts` - Zustand store
- `src/components/group-by/` - GroupBy panel UI components
- `src/views/grid/renderers/drawGroupRow.ts` - Group header rendering
- `src/config/grouping.ts` - Feature flag configuration

## Key Concepts

### Linear Rows

The grid uses "linear rows" (inspired by Teable) where:
- `linearRows` array contains both group headers and data rows
- Each entry has a `realIndex` that maps to the actual record in `records` array
- Group headers have `type: LinearRowType.Group` and don't have a `realIndex`

### Group Points

`groupPoints` is a flat array that describes the group structure:
- `type: 0` (Header) = Group header with depth, value, id
- `type: 1` (Row) = Count of records in this group
- Frontend transforms this into hierarchical `linearRows` for rendering

### Collapse State

- Collapsed groups are tracked in `collapsedGroupIds` Set
- When a group is collapsed, nested groups and rows are skipped during transformation
- State persists in localStorage




