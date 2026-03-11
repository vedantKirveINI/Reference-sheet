# Kanban Transformation Utilities

This directory contains utilities for transforming data for Kanban view.

## Files

- `groupPointsToStacks.ts` - Transforms groupPoints array to stackCollection
- `filterRecordsByStack.ts` - Filters records by stack value
- `getStackFilter.ts` - Creates filter objects for backend queries
- `index.ts` - Central export point

## Usage Examples

### Transform GroupPoints to Stacks

```typescript
import { groupPointsToStacks } from '@/utils/kanban';
import { mockKanbanGroupPoints } from '@/mock/kanbanGroupPoints';
import { mockStackField } from '@/mock/kanbanConfig';

const stackCollection = groupPointsToStacks(
  mockKanbanGroupPoints,
  mockStackField,
  false // isEmptyStackHidden
);

// Result: Array of IStackData
// [
//   { id: 'uncategorized', data: null, count: 38 },
//   { id: 'stack_hello', data: 'Hello', count: 2 },
//   { id: 'stack_hi', data: 'Hi', count: 0 },
//   { id: 'stack_namaste', data: 'Namaste', count: 1 },
// ]
```

### Filter Records by Stack

```typescript
import { filterRecordsByStack } from '@/utils/kanban';
import { mockKanbanRecords } from '@/mock/kanbanRecords';

// First, format records to IRecord[] format
const formattedRecords = formatRecords(mockKanbanRecords);

// Get a specific stack
const helloStack = stackCollection.find(s => s.data === 'Hello');

// Filter records for that stack
const helloRecords = filterRecordsByStack(
  formattedRecords,
  helloStack,
  mockStackField
);

// Result: Only records with status_field === 'Hello'
```

### Get Stack Filter (for Backend)

```typescript
import { getStackFilter } from '@/utils/kanban';

const filter = getStackFilter(helloStack, mockStackField);

// Result:
// {
//   fieldId: 'status_field',
//   operator: 'is',
//   value: 'Hello'
// }
```

## Notes

- These utilities work with the existing data structures (IRecord, IColumn, IGroupPoint)
- They handle SingleSelect, MultipleSelect, and uncategorized records
- Empty stack hiding is supported
- All utilities are type-safe with TypeScript

