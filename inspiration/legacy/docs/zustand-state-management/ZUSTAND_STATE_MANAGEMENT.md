# Zustand State Management

## Overview

This document outlines what UI state needs to be managed in Zustand for the reference-sheet application.

## State Items to Manage

### 1. Sidebar State

```typescript
sidebarExpanded: boolean;
```

- **Purpose**: Track if sidebar is expanded or collapsed
- **Default**: `true` on desktop (>768px), `false` on mobile
- **Actions**: `toggleSidebar()`, `expandSidebar()`, `collapseSidebar()`
- **Persistence**: ✅ Saved to localStorage
- **Why**: User preference should persist across sessions

### 2. Current View

```typescript
currentView: "grid" | "kanban" | "calendar" | "gallery";
```

- **Purpose**: Track which view is currently active
- **Default**: `"grid"`
- **Actions**: `setCurrentView(view)`
- **Persistence**: ✅ Saved to localStorage
- **Why**: User expects to return to their last view

### 3. Zoom Level

```typescript
zoomLevel: number;
```

- **Purpose**: Track current zoom level percentage
- **Default**: `100`
- **Range**: 50 - 200
- **Actions**: `setZoomLevel(level)`
- **Persistence**: ✅ Saved to localStorage
- **Why**: Zoom preference should persist

### 4. Cell Selection State

```typescript
selectedCells: Array<{ rowIndex: number; columnIndex: number }>;
```

- **Purpose**: Track which cells are currently selected
- **Default**: `[]`
- **Actions**: `setSelectedCells(cells)`, `clearSelection()`
- **Persistence**: ❌ Not persisted (transient state)
- **Why**: Selection is temporary, shouldn't persist

### 5. Active Cell

```typescript
activeCell: { rowIndex: number; columnIndex: number } | null
```

- **Purpose**: Track which cell is currently being edited
- **Default**: `null`
- **Actions**: `setActiveCell(cell)`
- **Persistence**: ❌ Not persisted (transient state)
- **Why**: Editing state is temporary

### 6. Backend Headers Toggle

```typescript
useBackendHeaders: boolean;
```

- **Purpose**: Track whether to use backend or generated headers
- **Default**: `false` (use generated)
- **Actions**: `setUseBackendHeaders(use)`
- **Persistence**: ✅ Saved to localStorage
- **Why**: User preference

### 7. Filter State

```typescript
filterState: any;
```

- **Purpose**: Store current filter conditions
- **Default**: `{}`
- **Actions**: `setFilterState(filter)`
- **Persistence**: ❌ Not persisted (relates to data, not UI)
- **Why**: Filter is data-specific, not a UI preference

### 8. Sort State

```typescript
sortState: any;
```

- **Purpose**: Store current sort configuration
- **Default**: `{}`
- **Actions**: `setSortState(sort)`
- **Persistence**: ❌ Not persisted (relates to data, not UI)
- **Why**: Sort is data-specific, not a UI preference

### 9. Theme Preference

```typescript
theme: "light" | "dark";
```

- **Purpose**: User's theme preference
- **Default**: `"light"`
- **Actions**: `setTheme(theme)`
- **Persistence**: ✅ Saved to localStorage
- **Why**: User preference should persist

## Implementation Details

### Store File

**Location**: `src/stores/uiStore.ts`

### Usage Example

```typescript
import { useUIStore } from "@/stores/uiStore";

function MyComponent() {
  // Access state and actions
  const { sidebarExpanded, toggleSidebar } = useUIStore();
  const { currentView, setCurrentView } = useUIStore();
  const { zoomLevel, setZoomLevel } = useUIStore();

  return (
    <button onClick={toggleSidebar}>
      {sidebarExpanded ? "Collapse" : "Expand"} Sidebar
    </button>
  );
}
```

### Persistence Strategy

- **Persisted**: `sidebarExpanded`, `currentView`, `zoomLevel`, `useBackendHeaders`, `theme`
- **Not Persisted**: `selectedCells`, `activeCell`, `filterState`, `sortState`

### Why Some States Are Not Persisted?

1. **selectedCells** & **activeCell**: These are transient UI states that shouldn't survive page reload
2. **filterState** & **sortState**: These are data-specific and should be managed at the data layer, not UI layer

## Migration from Local State

### Before (Bad)

```typescript
const [sidebarExpanded, setSidebarExpanded] = useState(true);
const [currentView, setCurrentView] = useState("grid");
// ... in every component
```

### After (Good)

```typescript
import { useUIStore } from "@/stores/uiStore";

const { sidebarExpanded, toggleSidebar, currentView, setCurrentView } =
	useUIStore();
// Single source of truth, accessible from anywhere
```

## Benefits

1. **Single Source of Truth**: All UI state in one place
2. **Persistent**: User preferences saved across sessions
3. **Accessible**: Any component can access UI state
4. **Type-Safe**: Full TypeScript support
5. **Performant**: Only re-renders components that use changed state

## Future Additions

Additional states that might be needed:

```typescript
// Text wrapping preference
textWrapEnabled: boolean;

// Column visibility
hiddenColumns: string[];

// Row grouping state
rowGroups: any[];

// View-specific settings
viewSettings: {
  grid: { freezeColumns: number },
  kanban: { columnLayout: string }
};
```
