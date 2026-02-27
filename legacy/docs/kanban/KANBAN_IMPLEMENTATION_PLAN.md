# Kanban View Implementation Plan

## Overview

This document outlines a phased approach to implement Kanban view on the frontend using mock data, following the same pattern as the grouping playground. Each phase builds upon the previous one, ensuring a solid foundation before adding complexity.

---

## Phase 1: Types and Mock Data Foundation

**Goal**: Create type definitions and mock data for Kanban view

**Files to Create/Modify**:
- `src/types/kanban.ts` (NEW)
- `src/mock/kanbanGroupPoints.ts` (NEW)
- `src/mock/kanbanRecords.ts` (NEW)
- `src/mock/kanbanConfig.ts` (NEW)
- `src/config/kanban.ts` (NEW)

**Tasks**:

1. **Create Kanban Types** (`src/types/kanban.ts`)
   ```typescript
   // Stack data structure
   export interface IStackData {
     id: string;
     data: unknown;  // The grouping value (e.g., "Hello", "Hi")
     count: number; // Number of records in this stack
   }

   // Kanban view options
   export interface IKanbanViewOptions {
     stackFieldId?: string;        // Field ID to group by
     coverFieldId?: string | null; // Attachment field for card covers
     isCoverFit?: boolean;
     isFieldNameHidden?: boolean;
     isEmptyStackHidden?: boolean;
   }

   // Kanban permissions (for future use)
   export interface IKanbanPermission {
     stackCreatable: boolean;
     stackEditable: boolean;
     stackDeletable: boolean;
     stackDraggable: boolean;
     cardCreatable: boolean;
     cardEditable: boolean;
     cardDeletable: boolean;
     cardDraggable: boolean;
   }

   // Constants
   export const UNCATEGORIZED_STACK_ID = 'uncategorized';
   ```

2. **Create Mock Kanban GroupPoints** (`src/mock/kanbanGroupPoints.ts`)
   - Create groupPoints array for SingleSelect field grouping
   - Example: Group by "status_field" with values: "Hello", "Hi", "Namaste", and uncategorized
   - Follow same structure as `mockGroupPoints.ts` but with depth 0 only (single level grouping)

3. **Create Mock Kanban Records** (`src/mock/kanbanRecords.ts`)
   - Create records that match the groupPoints structure
   - Include records for each stack value
   - Include some uncategorized records (null/empty status_field)
   - Use same IMockRecord interface from `groupedRecords.ts`

4. **Create Mock Kanban Config** (`src/mock/kanbanConfig.ts`)
   - Define mock view options (stackFieldId, etc.)
   - Define which field to use for stacking

5. **Create Kanban Config** (`src/config/kanban.ts`)
   - Feature flag: `ENABLE_KANBAN_PLAYGROUND`
   - Similar to `grouping.ts`

**Acceptance Criteria**:
- ✅ All type definitions exist and compile
- ✅ Mock data files created with realistic data
- ✅ Feature flag config created
- ✅ Types exported and importable

---

## Phase 2: Transformation Utilities

**Goal**: Create utilities to transform groupPoints → stackCollection and filter records

**Files to Create**:
- `src/utils/kanban/groupPointsToStacks.ts` (NEW)
- `src/utils/kanban/filterRecordsByStack.ts` (NEW)
- `src/utils/kanban/getStackFilter.ts` (NEW)
- `src/utils/kanban/index.ts` (NEW)

**Tasks**:

1. **Transform GroupPoints to Stacks** (`groupPointsToStacks.ts`)
   ```typescript
   /**
    * Transforms groupPoints array into stackCollection
    * Handles:
    * - SingleSelect fields (ensures all choices are represented)
    * - Uncategorized records
    * - Empty stack hiding
    */
   export function groupPointsToStacks(
     groupPoints: IGroupPoint[] | null | undefined,
     stackField: IColumn | null,
     isEmptyStackHidden: boolean = false
   ): IStackData[] | null
   ```

2. **Filter Records by Stack** (`filterRecordsByStack.ts`)
   ```typescript
   /**
    * Filters records array to only include records matching a stack
    * Handles:
    * - Uncategorized (null/empty values)
    * - SingleSelect matching
    * - Other field types
    */
   export function filterRecordsByStack(
     records: IRecord[],
     stack: IStackData,
     stackField: IColumn
   ): IRecord[]
   ```

3. **Get Stack Filter** (`getStackFilter.ts`)
   ```typescript
   /**
    * Creates a filter object for a stack (for future backend integration)
    */
   export function getStackFilter(
     stack: IStackData,
     stackField: IColumn
   ): IFilter | null
   ```

4. **Export Utilities** (`index.ts`)
   - Export all utilities for easy importing

**Acceptance Criteria**:
- ✅ `groupPointsToStacks` correctly transforms groupPoints
- ✅ Handles SingleSelect fields with all choices
- ✅ Handles uncategorized records
- ✅ `filterRecordsByStack` correctly filters records
- ✅ All edge cases handled (null, empty, etc.)
- ✅ Unit tests or manual verification possible

---

## Phase 3: Basic Kanban View Components (Static)

**Goal**: Create basic Kanban view components that render statically (no drag-drop yet)

**Files to Create**:
- `src/views/kanban/KanbanView.tsx` (NEW)
- `src/views/kanban/KanbanViewBase.tsx` (NEW)
- `src/views/kanban/context/KanbanContext.ts` (NEW)
- `src/views/kanban/context/KanbanProvider.tsx` (NEW)
- `src/views/kanban/components/KanbanContainer.tsx` (NEW)
- `src/views/kanban/components/KanbanStackContainer.tsx` (NEW)
- `src/views/kanban/components/KanbanStack.tsx` (NEW)
- `src/views/kanban/components/KanbanCard.tsx` (NEW)
- `src/views/kanban/components/KanbanStackHeader.tsx` (NEW)
- `src/views/kanban/components/KanbanStackTitle.tsx` (NEW)
- `src/views/kanban/hooks/useKanban.ts` (NEW)
- `src/views/kanban/index.ts` (NEW)

**Tasks**:

1. **Create Kanban Context** (`context/KanbanContext.ts`)
   - Define context interface with:
     - `stackCollection`
     - `stackField`
     - `records`
     - `columns`
     - `options`
     - `permission` (mock for now)

2. **Create Kanban Provider** (`context/KanbanProvider.tsx`)
   - Read mock data (groupPoints, records, config)
   - Transform groupPoints → stackCollection using utility
   - Provide context to children
   - Handle feature flag check

3. **Create Root Component** (`KanbanView.tsx`)
   - Simple wrapper that provides KanbanProvider
   - Returns KanbanViewBase

4. **Create Base Component** (`KanbanViewBase.tsx`)
   - Reads stackCollection from context
   - Renders KanbanContainer

5. **Create Container** (`components/KanbanContainer.tsx`)
   - Maps over stackCollection
   - Renders KanbanStackContainer for each stack
   - Horizontal flex layout

6. **Create Stack Container** (`components/KanbanStackContainer.tsx`)
   - Individual column wrapper
   - Fixed width (e.g., 264px)
   - Contains: StackHeader, Stack (cards), Add button

7. **Create Stack Header** (`components/KanbanStackHeader.tsx`)
   - Shows stack title and count
   - Basic styling

8. **Create Stack Title** (`components/KanbanStackTitle.tsx`)
   - Displays stack name/value
   - Handles uncategorized label

9. **Create Stack** (`components/KanbanStack.tsx`)
   - Maps over filtered records for this stack
   - Renders KanbanCard for each record
   - Basic scrollable container

10. **Create Card** (`components/KanbanCard.tsx`)
    - Displays primary field value as title
    - Displays selected display fields
    - Basic card styling
    - Click to expand (placeholder for now)

11. **Create Hook** (`hooks/useKanban.ts`)
    - Simple hook to access KanbanContext

**Acceptance Criteria**:
- ✅ Kanban view renders with columns
- ✅ Each column shows correct records
- ✅ Cards display field values
- ✅ Uncategorized stack appears
- ✅ Basic styling applied
- ✅ No TypeScript errors
- ✅ Feature flag controls visibility

---

## Phase 4: View Switching Integration

**Goal**: Integrate Kanban view into main page with view switching

**Files to Modify**:
- `src/pages/MainPage/index.tsx`
- `src/stores/uiStore.ts` (or create viewStore)
- `src/components/ViewSwitcher/` (NEW - if doesn't exist)

**Tasks**:

1. **Add View Type to State**
   - Add `viewType: 'grid' | 'kanban'` to UI store or view state
   - Default to 'grid'

2. **Create View Switcher Component** (if needed)
   - Toggle between Grid and Kanban views
   - Button/selector in header or sidebar

3. **Modify MainPage**
   - Conditionally render GridView or KanbanView based on viewType
   - Pass same data props to both views
   - Handle view switching

4. **Update Data Flow**
   - Ensure KanbanView receives: columns, records, groupPoints
   - Use mock data when feature flag is enabled

**Acceptance Criteria**:
- ✅ Can switch between Grid and Kanban views
- ✅ Both views receive same data
- ✅ View state persists (or can be toggled)
- ✅ No data loss when switching

---

## Phase 5: Drag & Drop Implementation

**Goal**: Add drag and drop functionality for cards and stacks

**Files to Modify**:
- `src/views/kanban/components/KanbanContainer.tsx`
- `src/views/kanban/components/KanbanStack.tsx`
- `src/views/kanban/components/KanbanCard.tsx`
- `package.json` (add dependency)

**Tasks**:

1. **Install Dependencies**
   ```bash
   npm install @hello-pangea/dnd
   ```

2. **Update KanbanContainer**
   - Wrap in DragDropContext
   - Handle onDragEnd
   - Update cardMap state when cards move
   - Handle stack reordering (for SingleSelect)

3. **Update KanbanStack**
   - Wrap in Droppable
   - Make droppableId = stackId

4. **Update KanbanCard**
   - Wrap in Draggable
   - Make draggableId = record.id
   - Add drag handle styling

5. **Implement Move Logic**
   - When card moves between stacks:
     - Update record's field value (mock for now)
     - Update cardMap state
   - When card moves within stack:
     - Update order (mock for now)

**Acceptance Criteria**:
- ✅ Cards can be dragged between stacks
- ✅ Cards can be reordered within stack
- ✅ Visual feedback during drag
- ✅ State updates correctly
- ✅ No crashes or errors

---

## Phase 6: Virtual Scrolling for Cards

**Goal**: Add virtual scrolling to handle large numbers of cards efficiently

**Files to Modify**:
- `src/views/kanban/components/KanbanStack.tsx`
- `package.json` (add dependency)

**Tasks**:

1. **Install Dependencies**
   ```bash
   npm install react-virtuoso
   ```

2. **Update KanbanStack**
   - Replace simple map with Virtuoso component
   - Configure itemContent
   - Handle rangeChanged for pagination
   - Integrate with Droppable (virtual mode)

3. **Optimize Rendering**
   - Only render cards in viewport
   - Handle scroll position
   - Maintain card heights

**Acceptance Criteria**:
- ✅ Large lists (100+ cards) scroll smoothly
- ✅ Only visible cards are rendered
- ✅ Drag & drop still works
- ✅ Performance is acceptable

---

## Phase 7: Advanced Features

**Goal**: Add advanced Kanban features

**Files to Create/Modify**:
- `src/views/kanban/components/KanbanStackCreator.tsx` (NEW)
- `src/views/kanban/components/KanbanStackHeader.tsx` (modify)
- `src/views/kanban/store/useKanbanStackCollapsed.ts` (NEW)

**Tasks**:

1. **Stack Collapse/Expand**
   - Add collapse button to stack header
   - Store collapsed state
   - Render collapsed view (narrow column)

2. **Create New Stack** (for SingleSelect)
   - Add "Create new stack" button
   - Modal/form to create new choice
   - Add to field options

3. **Stack Actions Menu**
   - Rename stack
   - Delete stack
   - Collapse/expand

4. **Card Actions**
   - Context menu on card
   - Duplicate card
   - Delete card
   - Insert above/below

5. **Empty Stack Handling**
   - Show "No records" message
   - Add record button in empty stack

**Acceptance Criteria**:
- ✅ Can collapse/expand stacks
- ✅ Can create new stacks (SingleSelect)
- ✅ Can rename/delete stacks
- ✅ Card context menu works
- ✅ Empty stacks handled gracefully

---

## Phase 8: Styling and Polish

**Goal**: Improve visual design and UX

**Files to Create/Modify**:
- `src/views/kanban/KanbanView.module.scss` (NEW)
- `src/views/kanban/components/*.module.scss` (NEW for each component)

**Tasks**:

1. **Add Styling**
   - Card styling (shadows, borders, hover)
   - Stack column styling
   - Header styling
   - Responsive design

2. **Add Animations**
   - Smooth transitions
   - Drag preview
   - Hover effects

3. **Improve UX**
   - Loading states
   - Empty states
   - Error states
   - Tooltips

4. **Accessibility**
   - Keyboard navigation
   - ARIA labels
   - Focus management

**Acceptance Criteria**:
- ✅ Visual design matches design system
- ✅ Smooth animations
- ✅ Responsive on mobile
- ✅ Accessible
- ✅ Polished feel

---

## Phase 9: Integration with Real Backend (Future)

**Goal**: Replace mock data with real backend data

**Tasks**:

1. **Update KanbanProvider**
   - Replace mock data with API calls
   - Use React Query for data fetching
   - Handle loading/error states

2. **Update Record Operations**
   - Connect drag & drop to real API
   - Update record field values
   - Update record orders

3. **Remove Feature Flag**
   - Remove ENABLE_KANBAN_PLAYGROUND
   - Use real data always

**Acceptance Criteria**:
- ✅ Real data from backend
- ✅ All operations work with backend
- ✅ No mock data dependencies

---

## Implementation Order Summary

```
Phase 1: Types & Mock Data
    ↓
Phase 2: Transformation Utilities
    ↓
Phase 3: Basic Components (Static)
    ↓
Phase 4: View Switching
    ↓
Phase 5: Drag & Drop
    ↓
Phase 6: Virtual Scrolling
    ↓
Phase 7: Advanced Features
    ↓
Phase 8: Styling & Polish
    ↓
Phase 9: Backend Integration (Future)
```

---

## File Structure

```
src/
├── types/
│   └── kanban.ts
├── mock/
│   ├── kanbanGroupPoints.ts
│   ├── kanbanRecords.ts
│   └── kanbanConfig.ts
├── config/
│   └── kanban.ts
├── utils/
│   └── kanban/
│       ├── groupPointsToStacks.ts
│       ├── filterRecordsByStack.ts
│       ├── getStackFilter.ts
│       └── index.ts
└── views/
    └── kanban/
        ├── KanbanView.tsx
        ├── KanbanViewBase.tsx
        ├── index.ts
        ├── context/
        │   ├── KanbanContext.ts
        │   └── KanbanProvider.tsx
        ├── components/
        │   ├── KanbanContainer.tsx
        │   ├── KanbanStackContainer.tsx
        │   ├── KanbanStack.tsx
        │   ├── KanbanCard.tsx
        │   ├── KanbanStackHeader.tsx
        │   ├── KanbanStackTitle.tsx
        │   └── KanbanStackCreator.tsx
        ├── hooks/
        │   └── useKanban.ts
        └── store/
            └── useKanbanStackCollapsed.ts
```

---

## Dependencies to Add

```json
{
  "dependencies": {
    "@hello-pangea/dnd": "^16.0.0",
    "react-virtuoso": "^4.0.0"
  }
}
```

---

## Notes

- Each phase should be fully functional before moving to the next
- Use feature flags to control visibility
- Follow existing code patterns (grouping playground)
- Keep components small and focused
- Add TypeScript types from the start
- Test each phase manually before proceeding

