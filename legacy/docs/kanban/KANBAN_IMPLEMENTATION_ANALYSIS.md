# Kanban View Implementation Analysis

## Overview

This document analyzes how Teable implements Kanban view on the frontend and outlines what changes need to be made to your data structure to support a similar implementation.

## How Teable Implements Kanban View

### 1. Core Architecture

Teable's Kanban view follows this component hierarchy:

```
KanbanView (Root)
├── SearchProvider
├── RecordProvider
├── GroupPointProvider (Critical for grouping)
├── KanbanToolBar
└── KanbanProvider
    └── KanbanViewBase
        └── KanbanContainer
            ├── KanbanStackContainer (for each stack/column)
            │   ├── KanbanStackHeader
            │   ├── KanbanStack (virtualized list)
            │   │   └── KanbanCard (for each record)
            │   └── CreateRecordModal
            └── KanbanStackCreator
```

### 2. Key Data Structures

#### A. GroupPoints (Backend Response)

The backend returns a `groupPoints` array that describes the grouping structure:

```typescript
// From teable/packages/openapi/src/aggregation/type.ts
enum GroupPointType {
  Header = 0,  // Group header point
  Row = 1,     // Row count point
}

// Header point structure
interface IGroupHeaderPoint {
  type: 0;
  id: string;           // Unique ID for the group/stack
  depth: number;        // Grouping depth (0-2)
  value: unknown;       // The actual value used for grouping (e.g., "Hello", "Hi")
  isCollapsed: boolean; // Whether group is collapsed
}

// Row count point structure
interface IGroupRowPoint {
  type: 1;
  count: number;        // Number of records in the preceding group
}

// Combined type
type IGroupPoint = IGroupHeaderPoint | IGroupRowPoint;
type IGroupPointsVo = IGroupPoint[] | null;
```

**Example groupPoints array:**
```typescript
[
  { type: 0, id: "group_1", depth: 0, value: "Hello", isCollapsed: false },
  { type: 1, count: 2 },  // 2 records in "Hello" group
  { type: 0, id: "group_2", depth: 0, value: "Hi", isCollapsed: false },
  { type: 1, count: 0 },   // 0 records in "Hi" group
  { type: 0, id: "group_3", depth: 0, value: "Namaste", isCollapsed: false },
  { type: 1, count: 1 },   // 1 record in "Namaste" group
  { type: 0, id: "uncategorized", depth: 0, value: null, isCollapsed: false },
  { type: 1, count: 38 },  // 38 uncategorized records
]
```

#### B. StackData (Transformed from GroupPoints)

The `KanbanProvider` transforms `groupPoints` into `stackCollection`:

```typescript
// From teable/apps/nextjs-app/src/features/app/blocks/view/kanban/type.ts
interface IStackData {
  id: string;        // Stack/column ID (from groupPoint.id)
  data: unknown;     // The grouping value (from groupPoint.value)
  count: number;     // Number of records (from groupPoint.count)
}
```

**Transformation Logic** (from `KanbanProvider.tsx` lines 135-222):

```typescript
const stackCollection = useMemo(() => {
  if (groupPoints == null || stackField == null) return;

  const stackList: IStackData[] = [];
  const stackMap: Record<string, IStackData> = {};

  // Process groupPoints: Header points followed by Row points
  groupPoints.forEach((cur, index) => {
    if (cur.type !== GroupPointType.Header) return;

    const { id: groupId, value } = cur;
    const rowData = groupPoints[index + 1];

    if (rowData?.type !== GroupPointType.Row) return;
    if (value == null) return;

    const { count } = rowData;
    const obj = {
      id: groupId,
      count,
      data: value,
    };
    stackList.push(obj);
    stackMap[value as string] = obj;
  });

  // For SingleSelect fields, ensure all choices are represented
  if (type === FieldType.SingleSelect) {
    const choices = options?.choices;
    const stackList = choices.map(
      ({ id, name }) =>
        stackMap[name] ?? {
          id,
          count: 0,
          data: name,
        }
    );
    stackList.unshift(UNCATEGORIZED_STACK_DATA);
    if (isEmptyStackHidden) {
      return stackList.filter(({ count }) => count > 0);
    }
    return stackList;
  }

  // Add uncategorized stack
  stackList.unshift(UNCATEGORIZED_STACK_DATA);
  return stackList;
}, [groupPoints, stackField, isEmptyStackHidden]);
```

#### C. View Configuration

```typescript
// From teable/packages/core/src/models/view/derivate/kanban-view-option.schema.ts
interface IKanbanViewOptions {
  stackFieldId?: string;        // Field ID to group by (must be SingleSelect, User, etc.)
  coverFieldId?: string | null;  // Attachment field for card cover images
  isCoverFit?: boolean;          // Whether to fit cover images
  isFieldNameHidden?: boolean;   // Hide field names on cards
  isEmptyStackHidden?: boolean;  // Hide empty stacks/columns
}
```

### 3. Data Flow

#### Step 1: Backend Provides GroupPoints
- Backend groups records by the `stackFieldId` (e.g., a SingleSelect field)
- Returns `groupPoints` array describing the grouping structure
- Records are already sorted/grouped by the backend

#### Step 2: GroupPointProvider Fetches Data
```typescript
// From GroupPointProvider.tsx
const groupPointQuery = {
  viewId,
  groupBy: [{ order: SortFunc.Asc, fieldId: stackFieldId }],
  search: searchQuery,
  filter: query?.filter,
};

const { data: resGroupPoints } = useQuery({
  queryKey: ReactQueryKeys.groupPoints(tableId, groupPointQuery),
  queryFn: () => getGroupPoints(tableId, groupPointQuery),
});
```

#### Step 3: KanbanProvider Transforms to Stacks
- Reads `groupPoints` from context
- Transforms to `stackCollection` (IStackData[])
- Handles special cases (SingleSelect choices, User fields, uncategorized)

#### Step 4: KanbanContainer Renders Columns
- Maps over `stackCollection` to create `KanbanStackContainer` for each stack
- Each stack is a droppable column

#### Step 5: KanbanStack Fetches Records
- Each `KanbanStack` component filters records for its stack
- Uses `getFilterSet()` to create filter based on stack value
- Fetches records using `useRecords()` hook with the filter

```typescript
// From KanbanStack.tsx
const mergedFilter = useMemo(() => {
  const outerFilter = recordQuery?.filter;
  const filterSet = getFilterSet(stackField, stack);
  return mergeFilter(outerFilter, {
    conjunction: and.value,
    filterSet,
  });
}, [recordQuery?.filter, stack, stackField]);

const query = {
  ...recordQuery,
  skip: skipIndex,
  take: TAKE_COUNT,
  filter: mergedFilter,
};

const { records } = useRecords(query);
```

### 4. Key Features

#### Drag & Drop
- Uses `@hello-pangea/dnd` library
- Cards can be dragged between stacks
- Stacks (columns) can be reordered (for SingleSelect fields)
- On drop, updates record's field value to match target stack

#### Virtualization
- Uses `react-virtuoso` for virtual scrolling within each stack
- Only renders cards that are in view
- Handles large numbers of records efficiently

#### Filtering
- Each stack filters records based on its value
- Uses `getFilterSet()` utility to create appropriate filter
- Handles uncategorized records (null/empty values)

## Required Changes to Your Frontend

### 1. Backend Requirements

Your backend needs to support:

#### A. GroupPoints Endpoint
```typescript
// GET /api/v1/tables/:tableId/group-points
interface GroupPointsQuery {
  viewId: string;
  groupBy: Array<{
    fieldId: string;
    order: 'asc' | 'desc';
  }>;
  filter?: IFilter;
  search?: string;
}

// Response
interface GroupPointsResponse {
  groupPoints: IGroupPoint[];
}
```

#### B. View Options Storage
```typescript
// View model needs to store kanban options
interface View {
  id: string;
  type: 'grid' | 'kanban' | 'calendar' | 'form';
  options?: {
    // For kanban view
    stackFieldId?: string;
    coverFieldId?: string | null;
    isCoverFit?: boolean;
    isFieldNameHidden?: boolean;
    isEmptyStackHidden?: boolean;
  };
}
```

### 2. Frontend Data Structure Changes

#### A. Update RecordsFetchedPayload

Your current structure already includes `groupPoints`:

```typescript
// Current (from useSheetLifecycle.ts)
interface RecordsFetchedPayload {
  fields?: Array<{...}>;
  records?: Array<Record<string, any>>;
  groupPoints?: Array<{
    type: 0 | 1;
    id?: string;
    depth?: number;
    value?: unknown;
    isCollapsed?: boolean;
    count?: number;
  }>;
}
```

**✅ This is already correct!** Your backend is already sending `groupPoints` in the correct format.

#### B. Add View Type and Options

```typescript
// Add to your view/table state
interface ViewConfig {
  id: string;
  name: string;
  type: 'grid' | 'kanban' | 'calendar' | 'form';
  options?: {
    // Kanban-specific options
    stackFieldId?: string;
    coverFieldId?: string | null;
    isCoverFit?: boolean;
    isFieldNameHidden?: boolean;
    isEmptyStackHidden?: boolean;
  };
  filter?: IFilter;
  sort?: ISort[];
}
```

#### C. Add StackData Type

```typescript
// Add to your types
interface IStackData {
  id: string;
  data: unknown;  // The grouping value (e.g., "Hello", "Hi")
  count: number;  // Number of records in this stack
}

const UNCATEGORIZED_STACK_ID = 'uncategorized';
```

### 3. Component Structure Needed

```
src/views/kanban/
├── KanbanView.tsx              # Root component
├── KanbanViewBase.tsx          # Base rendering
├── context/
│   ├── KanbanContext.ts        # Context definition
│   └── KanbanProvider.tsx      # Provider with transformation logic
├── components/
│   ├── KanbanContainer.tsx     # Main container with drag-drop
│   ├── KanbanStackContainer.tsx # Individual column container
│   ├── KanbanStack.tsx         # Virtualized list of cards
│   ├── KanbanCard.tsx          # Individual card component
│   ├── KanbanStackHeader.tsx   # Column header
│   ├── KanbanStackTitle.tsx    # Column title
│   └── KanbanStackCreator.tsx  # Create new column button
├── hooks/
│   └── useKanban.ts            # Hook to access context
├── utils/
│   ├── filter.ts               # getFilterSet utility
│   └── card.ts                 # Card-related utilities
└── type.ts                     # Type definitions
```

### 4. Key Implementation Details

#### A. Stack Collection Transformation

You'll need to transform `groupPoints` → `stackCollection` similar to Teable:

```typescript
// In KanbanProvider
const stackCollection = useMemo(() => {
  if (!groupPoints || !stackFieldId) return null;

  const stackList: IStackData[] = [];
  const stackMap: Record<string, IStackData> = {};

  // Process groupPoints
  groupPoints.forEach((cur, index) => {
    if (cur.type !== 0) return; // Skip non-header points

    const { id: groupId, value } = cur;
    const rowData = groupPoints[index + 1];

    if (rowData?.type !== 1) return; // Next should be row count
    if (value == null) return;

    const obj = {
      id: groupId,
      count: rowData.count,
      data: value,
    };
    stackList.push(obj);
    
    // For SingleSelect, map by name
    if (stackField.type === 'SingleSelect') {
      stackMap[value as string] = obj;
    }
  });

  // For SingleSelect: ensure all choices are represented
  if (stackField.type === 'SingleSelect') {
    const choices = stackField.options?.choices || [];
    const completeStackList = choices.map((choice) => {
      const existing = stackMap[choice.name];
      return existing || {
        id: choice.id,
        count: 0,
        data: choice.name,
      };
    });
    
    // Add uncategorized at the beginning
    completeStackList.unshift({
      id: UNCATEGORIZED_STACK_ID,
      count: 0, // Will be calculated
      data: null,
    });
    
    return completeStackList;
  }

  // For other field types, add uncategorized
  stackList.unshift({
    id: UNCATEGORIZED_STACK_ID,
    count: 0,
    data: null,
  });

  return stackList;
}, [groupPoints, stackField]);
```

#### B. Record Filtering per Stack

Each stack needs to filter records:

```typescript
// In KanbanStack component
const getFilterForStack = (stack: IStackData, stackField: IField) => {
  const { id: stackId, data: stackData } = stack;
  const isUncategorized = stackId === UNCATEGORIZED_STACK_ID;

  if (isUncategorized) {
    return {
      fieldId: stackField.id,
      operator: 'isEmpty',
      value: null,
    };
  }

  return {
    fieldId: stackField.id,
    operator: 'is',
    value: stackData, // e.g., "Hello" for SingleSelect
  };
};

// Then filter your records
const filteredRecords = useMemo(() => {
  const filter = getFilterForStack(stack, stackField);
  return records.filter(record => {
    const cellValue = record.cells[stackField.id]?.value;
    if (isUncategorized) {
      return cellValue == null || cellValue === '';
    }
    return cellValue === stackData;
  });
}, [records, stack, stackField]);
```

#### C. Drag & Drop Implementation

```typescript
// In KanbanContainer
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const onDragEnd = (result: DropResult) => {
  const { source, destination } = result;
  if (!destination) return;

  const { droppableId: sourceStackId, index: sourceIndex } = source;
  const { droppableId: targetStackId, index: targetIndex } = destination;

  // Moving card between stacks
  if (sourceStackId !== targetStackId) {
    const sourceCard = cardMap[sourceStackId]?.[sourceIndex];
    const targetStack = stackCollection.find(s => s.id === targetStackId);
    
    if (sourceCard && targetStack) {
      // Update record's field value
      updateRecord(sourceCard.id, {
        [stackFieldId]: getCellValueByStack(targetStack),
      });
    }
  }
  
  // Reordering within same stack
  else {
    // Update record order
    updateRecordOrders({
      recordIds: [cardMap[sourceStackId][sourceIndex].id],
      anchorId: cardMap[targetStackId][targetIndex].id,
      position: targetIndex > sourceIndex ? 'after' : 'before',
    });
  }
};
```

### 5. Dependencies Needed

```json
{
  "dependencies": {
    "@hello-pangea/dnd": "^16.x",  // Drag and drop
    "react-virtuoso": "^4.x"        // Virtual scrolling
  }
}
```

## Summary

### What You Already Have ✅
- `groupPoints` in your `RecordsFetchedPayload` interface
- Backend sending groupPoints structure
- Records data structure
- Fields data structure

### What You Need to Add 🔨

1. **View Configuration**
   - Add `type` field to views (grid, kanban, etc.)
   - Add `options` field for kanban-specific settings

2. **Component Structure**
   - Create Kanban view components
   - Implement stack collection transformation
   - Add drag & drop functionality
   - Add virtual scrolling for cards

3. **Data Transformation**
   - Transform `groupPoints` → `stackCollection`
   - Filter records per stack
   - Handle uncategorized records

4. **Backend Support**
   - Ensure groupPoints endpoint works for kanban grouping
   - Support view options storage
   - Handle record updates when cards are moved

### Key Insight

The main difference between grid and kanban views is:
- **Grid**: Renders all records in a table format
- **Kanban**: Groups records by a field value and renders them in columns (stacks)

The `groupPoints` data structure is the key - it tells you:
- What groups/stacks exist (Header points)
- How many records are in each group (Row points)
- The values used for grouping

Your backend already provides this structure, so you just need to:
1. Transform it into stack collection
2. Filter records per stack
3. Render cards in columns
4. Handle drag & drop to move records between stacks

