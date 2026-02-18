# Teable Hide Columns Feature - End-to-End Flow

## Overview
This document explains how Teable manages the "Hide Columns" feature from frontend user interaction through backend processing, database storage, and real-time synchronization back to all connected clients.

## Architecture Summary

The hide columns feature uses a **view-specific column metadata** system where each view maintains its own `columnMeta` object that stores visibility settings per field. The system supports two visibility models:
- **`hidden` property**: Used by Grid and Plugin views (opt-out model - fields are visible by default)
- **`visible` property**: Used by Kanban, Gallery, Calendar, and Form views (opt-in model - fields must be explicitly marked visible)

---

## 1. Frontend: User Interaction

### 1.1 UI Components

**Grid View** (`HideFields.tsx`):
- Component: `packages/sdk/src/components/hide-fields/HideFields.tsx`
- Provides UI for managing hidden columns in Grid views
- Uses `view.columnMeta[fieldId].hidden` to track hidden state

**Other Views** (`VisibleFields.tsx`):
- Component: `packages/sdk/src/components/hide-fields/VisibleFields.tsx`
- Used for Kanban, Gallery, Calendar views
- Uses `view.columnMeta[fieldId].visible` to track visibility

### 1.2 User Action Flow

When a user hides/shows a column:

1. **User clicks hide/show in UI** → `HideFields` or `VisibleFields` component
2. **Component calculates changes**:
   ```typescript
   // HideFields.tsx lines 29-46
   const hiddenIds = difference(hidden, hiddenFieldIds); // Newly hidden
   const showIds = difference(hiddenFieldIds, hidden);     // Newly shown
   ```
3. **Calls `view.updateColumnMeta()`**:
   ```typescript
   view.updateColumnMeta(
     hiddenIds.map((id) => ({ fieldId: id, columnMeta: { hidden: true } }))
   );
   view.updateColumnMeta(
     showIds.map((id) => ({ fieldId: id, columnMeta: { hidden: false } }))
   );
   ```

---

## 2. Frontend: API Call

### 2.1 View Model Method

**Location**: `packages/sdk/src/model/view/view.ts`

```typescript
async updateColumnMeta(columnMetaRo: IColumnMetaRo) {
  return await requestWrap(updateViewColumnMeta)(this.tableId, this.id, columnMetaRo);
}
```

### 2.2 API Client

**Location**: `packages/openapi/src/view/update-fields-column-meta.ts`

- **Endpoint**: `PUT /api/table/{tableId}/view/{viewId}/column-meta`
- **Request Body**: Array of `{ fieldId: string, columnMeta: { hidden?: boolean, visible?: boolean, ... } }`
- Uses axios to make HTTP PUT request

---

## 3. Backend: API Endpoint

### 3.1 Controller

**Location**: `apps/nestjs-backend/src/features/view/open-api/view-open-api.controller.ts`

```typescript
@Put('/:viewId/column-meta')
async updateColumnMeta(
  @Param('tableId') tableId: string,
  @Param('viewId') viewId: string,
  @Body(columnMetaRoSchema) updateViewColumnMetaRo: IColumnMetaRo,
  @Headers('x-window-id') windowId?: string
): Promise<void>
```

- Validates request body using Zod schema (`columnMetaRoSchema`)
- Requires `view|update` permission
- Passes to service layer

### 3.2 Service Layer

**Location**: `apps/nestjs-backend/src/features/view/open-api/view-open-api.service.ts`

**Method**: `updateViewColumnMeta()` (lines 182-281)

#### Validation Steps:

1. **Fetch View**:
   - Retrieves view from database with `columnMeta`, `version`, `type`
   - Throws 404 if view not found

2. **Validate Fields**:
   - Fetches all fields for the table
   - Verifies all `fieldId`s in request exist in table
   - Throws 404 if any field not found

3. **Primary Field Validation**:
   ```typescript
   const isHiddenPrimaryField = columnMetaRo.some(
     (f) => primaryFields.includes(f.fieldId) && (f.columnMeta as IGridColumnMeta).hidden
   );
   ```
   - **Rule**: Primary fields can only be hidden in Calendar and Form views
   - Throws validation error if trying to hide primary field in Grid/Kanban/Gallery views

4. **Build Operational Transform (OT) Operations**:
   ```typescript
   const curColumnMeta = JSON.parse(view.columnMeta);
   columnMetaRo.forEach(({ fieldId, columnMeta }) => {
     const obj = {
       fieldId,
       newColumnMeta: { ...curColumnMeta[fieldId], ...columnMeta },
       oldColumnMeta: curColumnMeta[fieldId] ? curColumnMeta[fieldId] : undefined,
     };
     ops.push(ViewOpBuilder.editor.updateViewColumnMeta.build(obj));
   });
   ```

5. **Apply Updates via OT**:
   - Calls `updateViewByOps()` which:
     - Merges new columnMeta with existing
     - Updates database
     - Saves OT operations for real-time sync
     - Increments view version

6. **Emit Real-time Event** (if `windowId` provided):
   ```typescript
   this.eventEmitterService.emitAsync(Events.OPERATION_VIEW_UPDATE, {
     tableId,
     windowId,
     viewId,
     userId: this.cls.get('user.id'),
     byOps: ops,
   });
   ```

---

## 4. Backend: Database Storage

### 4.1 Schema

**Location**: `packages/db-main-prisma/prisma/postgres/schema.prisma`

```prisma
model View {
  id               String    @id
  columnMeta       String    @map("column_meta")  // JSON string
  version          Int
  // ... other fields
}
```

### 4.2 Storage Format

`columnMeta` is stored as a **JSON string** in the database:

```json
{
  "fld123456789012345": {
    "order": 1.0,
    "hidden": true,        // Grid/Plugin views
    "width": 200
  },
  "fld987654321098765": {
    "order": 2.0,
    "visible": false,      // Kanban/Gallery/Calendar/Form views
    "width": 150
  }
}
```

### 4.3 Update Process

**Location**: `apps/nestjs-backend/src/features/view/view.service.ts`

The `updateViewByOps()` method:
1. Parses existing `columnMeta` JSON
2. Merges new values with existing per field
3. Stringifies and saves back to database
4. Increments `version` field
5. Saves OT operations to `Ops` table for real-time sync

---

## 5. Backend: Real-time Synchronization

### 5.1 Operational Transform (OT) System

Teable uses **ShareDB** (Operational Transform) for real-time collaboration:

1. **OT Operations Saved**: Each update creates OT operations stored in `Ops` table
2. **Pub/Sub Broadcasting**: Operations are published via Redis pub/sub (if Redis enabled) or in-memory
3. **Channel**: `view_{tableId}` and `view_{tableId}.{viewId}`

### 5.2 Event Emission

**Location**: `apps/nestjs-backend/src/share-db/share-db.service.ts`

After database transaction commits:
- Operations are published to ShareDB channels
- Connected clients receive updates via WebSocket
- Frontend ShareDB client applies operations to local view document

### 5.3 Frontend Real-time Updates

**Location**: `packages/sdk/src/context/view/ViewProvider.tsx`

- Uses ShareDB `useInstances` hook to subscribe to view collection
- Automatically receives and applies OT operations
- React re-renders when view data changes

---

## 6. Frontend: Data Filtering & Display

### 6.1 Field Filtering Hook

**Location**: `packages/sdk/src/hooks/use-fields.ts`

The `useFields()` hook filters fields based on view type and `columnMeta`:

```typescript
// Grid View: uses 'hidden' property (opt-out)
if (viewType === ViewType.Grid) {
  return !columnMeta?.[id]?.hidden;  // Show if NOT hidden
}

// Kanban/Gallery/Calendar: uses 'visible' property (opt-in)
if (viewType === ViewType.Kanban || viewType === ViewType.Gallery || viewType === ViewType.Calendar) {
  return columnMeta?.[id]?.visible === undefined ? true : columnMeta?.[id]?.visible;
  // Default visible if undefined, otherwise use explicit value
}

// Form: uses 'visible' property (strict opt-in)
if (viewType === ViewType.Form) {
  return columnMeta?.[id]?.visible;  // Must be explicitly true
}
```

### 6.2 Grid Column Generation

**Location**: `packages/sdk/src/components/grid-enhancements/hooks/use-grid-columns.tsx`

```typescript
export function useGridColumns(hasMenu?: boolean, hiddenFieldIds?: string[]) {
  const originFields = useFields();  // Already filtered by useFields()
  const fields = useMemo(() => {
    const hiddenSet = new Set(hiddenFieldIds ?? []);
    return originFields.filter((field) => !hiddenSet.has(field.id));
  }, [originFields, hiddenFieldIds]);
  // ... generates grid columns
}
```

### 6.3 Backend Record Filtering

**Location**: `apps/nestjs-backend/src/features/record/record.service.ts`

When fetching records, the backend applies column visibility to **field projection**:

```typescript
private async getViewProjection(tableId: string, query: IGetRecordsRo) {
  const columnMeta = JSON.parse(view.columnMeta);
  
  // Detects which model is used (visible vs hidden)
  const useVisible = Object.values(columnMeta).some((column) => 'visible' in column);
  const useHidden = Object.values(columnMeta).some((column) => 'hidden' in column);
  
  // Builds projection map: { fieldName: true } for visible fields only
  // This ensures hidden fields are not returned in API responses
}
```

**Location**: `apps/nestjs-backend/src/utils/is-not-hidden-field.ts`

Utility function used throughout backend to check field visibility:

```typescript
export const isNotHiddenField = (fieldId: string, view: IViewVo) => {
  // View-specific logic:
  // - Kanban: checks stackFieldId, coverFieldId + visible property
  // - Gallery: checks coverFieldId + visible property
  // - Calendar: checks date/title fields + visible property
  // - Form: checks visible property only
  // - Grid: checks hidden property (inverted)
}
```

---

## 7. View Type Specifics

### 7.1 Grid View
- **Model**: Opt-out (`hidden` property)
- **Default**: All fields visible unless `hidden: true`
- **Primary Field**: Cannot be hidden
- **Storage**: `columnMeta[fieldId].hidden: boolean`

### 7.2 Kanban View
- **Model**: Opt-in (`visible` property)
- **Default**: Fields visible if `visible` is undefined or true
- **Special Fields**: `stackFieldId` and `coverFieldId` always visible
- **Storage**: `columnMeta[fieldId].visible: boolean`

### 7.3 Gallery View
- **Model**: Opt-in (`visible` property)
- **Default**: Fields visible if `visible` is undefined or true
- **Special Fields**: `coverFieldId` always visible
- **Storage**: `columnMeta[fieldId].visible: boolean`

### 7.4 Calendar View
- **Model**: Opt-in (`visible` property)
- **Default**: Fields visible if `visible` is undefined or true
- **Special Fields**: `startDateFieldId`, `endDateFieldId`, `titleFieldId`, and color field always visible
- **Primary Field**: Can be hidden (exception)
- **Storage**: `columnMeta[fieldId].visible: boolean`

### 7.5 Form View
- **Model**: Opt-in (`visible` property)
- **Default**: Fields hidden unless `visible: true` (strict)
- **Primary Field**: Can be hidden (exception)
- **Storage**: `columnMeta[fieldId].visible: boolean`

### 7.6 Plugin View
- **Model**: Opt-out (`hidden` property)
- **Default**: All fields visible unless `hidden: true`
- **Storage**: `columnMeta[fieldId].hidden: boolean`

---

## 8. Edge Cases & Scenarios

### 8.1 Personal Views
**Location**: `packages/sdk/src/context/view/PersonalViewProxy.tsx`

- Personal views store columnMeta in **local state** (not immediately synced)
- `updateColumnMeta()` updates local state only
- `syncViewProperties()` syncs to server when needed
- Allows offline editing with eventual consistency

### 8.2 Share Views
**Location**: `packages/sdk/src/context/table/ShareViewProxy.tsx`

- Share views have read-only columnMeta
- Updates are blocked or handled differently based on permissions

### 8.3 Field Deletion
- When a field is deleted, its entry in `columnMeta` remains but is ignored
- `useFields()` filters out deleted fields before checking visibility

### 8.4 Permission Checks
- `useFields({ withDenied: false })` also filters by `canReadFieldRecord`
- Hidden fields with read permission are still filtered out
- Backend `getFieldsByQuery({ filterHidden: true })` respects columnMeta

### 8.5 Concurrent Updates
- OT system handles concurrent updates
- Last write wins for same field's columnMeta
- Version field prevents conflicts

### 8.6 Initial Load
- Views loaded via ShareDB query on frontend initialization
- SSR loads views via REST API (`GET /api/table/{tableId}/view`)
- `columnMeta` included in view payload as JSON object

---

## 9. Data Flow Summary

```
User Action (Hide Column)
    ↓
Frontend Component (HideFields.tsx)
    ↓
view.updateColumnMeta([{ fieldId, columnMeta: { hidden: true } }])
    ↓
API Client (updateViewColumnMeta)
    ↓
PUT /api/table/{tableId}/view/{viewId}/column-meta
    ↓
Backend Controller (ViewOpenApiController)
    ↓
Backend Service (ViewOpenApiService.updateViewColumnMeta)
    ├─ Validates fields exist
    ├─ Validates primary field rules
    ├─ Builds OT operations
    └─ Calls updateViewByOps()
        ↓
    ViewService.updateViewByOps()
        ├─ Merges columnMeta
        ├─ Updates database (View.columnMeta JSON)
        ├─ Saves OT operations (Ops table)
        └─ Increments version
            ↓
    ShareDB Pub/Sub
        ↓
    Real-time Broadcast to All Clients
        ↓
    Frontend ShareDB Client Receives Update
        ↓
    View Document Updated
        ↓
    React Re-renders
        ↓
    useFields() Hook Filters Fields
        ↓
    Grid/View Components Re-render with Hidden Columns Removed
```

---

## 10. Key Files Reference

### Frontend
- `packages/sdk/src/components/hide-fields/HideFields.tsx` - Grid view hide UI
- `packages/sdk/src/components/hide-fields/VisibleFields.tsx` - Other views visibility UI
- `packages/sdk/src/hooks/use-fields.ts` - Field filtering logic
- `packages/sdk/src/model/view/view.ts` - View model with updateColumnMeta()
- `packages/sdk/src/components/grid-enhancements/hooks/use-grid-columns.tsx` - Grid column generation
- `packages/openapi/src/view/update-fields-column-meta.ts` - API client

### Backend
- `apps/nestjs-backend/src/features/view/open-api/view-open-api.controller.ts` - REST endpoint
- `apps/nestjs-backend/src/features/view/open-api/view-open-api.service.ts` - Business logic
- `apps/nestjs-backend/src/features/view/view.service.ts` - View persistence
- `apps/nestjs-backend/src/utils/is-not-hidden-field.ts` - Visibility utility
- `apps/nestjs-backend/src/features/record/record.service.ts` - Record filtering with projection
- `apps/nestjs-backend/src/share-db/share-db.service.ts` - Real-time sync

### Schema
- `packages/core/src/models/view/column-meta.schema.ts` - TypeScript types & Zod schemas
- `packages/db-main-prisma/prisma/postgres/schema.prisma` - Database schema

---

## 11. Testing Scenarios Covered

1. ✅ Hide/show single column in Grid view
2. ✅ Hide/show multiple columns at once
3. ✅ Hide/show columns in Kanban/Gallery/Calendar/Form views
4. ✅ Attempt to hide primary field (validation error for Grid/Kanban/Gallery)
5. ✅ Hide primary field in Calendar/Form (allowed)
6. ✅ Real-time sync to other clients
7. ✅ Field filtering in record queries
8. ✅ Personal view local state management
9. ✅ Concurrent updates handling
10. ✅ Field deletion edge case
11. ✅ Permission-based filtering

---

## Conclusion

The Hide Columns feature is a **view-scoped, field-level visibility system** that:
- Stores visibility state in view's `columnMeta` JSON field
- Uses different models (hidden vs visible) for different view types
- Validates business rules (primary field restrictions)
- Persists via Operational Transform for real-time collaboration
- Filters fields at multiple layers (frontend hooks, backend queries)
- Supports personal views with local state management

The system is designed for **real-time collaboration** where multiple users can hide/show columns simultaneously with conflict resolution handled by the OT system.
