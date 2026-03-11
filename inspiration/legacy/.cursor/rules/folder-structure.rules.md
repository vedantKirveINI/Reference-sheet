# Folder Structure Rules
**CURSOR: FOLDER-STRUCTURE-001**

## Purpose
Enforce strict folder organization to ensure code modularity, scalability, and consistency across the reference-sheet project.

## Core Principle
> **"Everything has its place, and every place has its purpose"**

This folder structure organizes code by:
1. **Feature** - Pages, Views, Features
2. **Responsibility** - Rendering, Editing, Validation
3. **Reusability** - Common utilities, shared components
4. **Mobile** - Responsive design considerations

## MANDATORY Folder Structure

```
reference-sheet/
├── src/
│   ├── pages/                      # PAGE-LEVEL: 3 Main Pages (Entry → AI → Sheets)
│   │   ├── welcome/                # Page 1: Welcome/Entry Screen
│   │   │   ├── components/
│   │   │   │   ├── GetStarted/
│   │   │   │   └── Dashboard/
│   │   │   ├── hooks/
│   │   │   │   └── useWelcome.ts
│   │   │   ├── index.tsx
│   │   │   └── styles.module.scss
│   │   │
│   │   ├── ai-enrichment/          # Page 2: AI Enrichment Flow
│   │   │   ├── components/
│   │   │   │   ├── Configuration/
│   │   │   │   └── PreviewTable/
│   │   │   ├── hooks/
│   │   │   │   ├── useAiEnrichment.ts
│   │   │   │   └── useConfiguration.ts
│   │   │   ├── index.tsx
│   │   │   └── styles.module.scss
│   │   │
│   │   └── sheets/                 # Page 3: Main Sheets UI
│   │       ├── components/
│   │       │   ├── Header/         # Sheet header (name, share)
│   │       │   ├── TabBar/         # Multi-tab management
│   │       │   ├── TableSubHeader/ # Filters, Sort, Group
│   │       │   ├── Views/          # View components (Grid, Kanban, etc.)
│   │       │   ├── FieldManagement/ # Field CRUD operations
│   │       │   └── TableSwitcher/ # Table switching
│   │       ├── hooks/
│   │       │   ├── useSheet.ts
│   │       │   ├── useTabs.ts
│   │       │   └── useViews.ts
│   │       ├── index.tsx
│   │       └── styles.module.scss
│   │
│   ├── views/                      # VIEW SYSTEM: Grid, Kanban, Gallery, etc.
│   │   ├── grid/                   # Grid view components
│   │   │   ├── GridView.tsx
│   │   │   ├── GridCanvas.tsx
│   │   │   ├── ColumnHeaders.tsx
│   │   │   ├── RowHeaders.tsx
│   │   │   ├── VirtualScroller.tsx
│   │   │   ├── ResizeHandlers.tsx
│   │   │   └── hooks/
│   │   ├── kanban/                 # Kanban view components
│   │   │   ├── KanbanView.tsx
│   │   │   ├── KanbanContainer.tsx
│   │   │   ├── KanbanStack.tsx
│   │   │   └── KanbanCard.tsx
│   │   ├── gallery/                # Gallery view components
│   │   │   └── GalleryView.tsx
│   │   ├── chart/                  # Chart view components
│   │   │   ├── ChartView.tsx
│   │   │   └── charts/
│   │   ├── form/                   # Form view components
│   │   │   └── FormView.tsx
│   │   ├── calendar/               # Calendar view components
│   │   │   └── CalendarView.tsx
│   │   ├── ViewFactory.tsx         # Factory for creating views
│   │   └── ViewContainer.tsx       # Common view container
│   │
│   ├── cell-level/                  # CELL SYSTEM: Render, Edit, Validate
│   │   ├── renderers/              # Canvas cell renderers
│   │   │   ├── string/             # String renderer
│   │   │   │   └── StringRenderer.tsx
│   │   │   ├── number/             # Number renderer
│   │   │   │   └── NumberRenderer.tsx
│   │   │   ├── mcq/                # MCQ renderer
│   │   │   │   └── McqRenderer.tsx
│   │   │   ├── date/               # Date renderer
│   │   │   │   └── DateRenderer.tsx
│   │   │   ├── boolean/            # Boolean renderer
│   │   │   │   └── BooleanRenderer.tsx
│   │   │   ├── rating/             # Rating renderer
│   │   │   │   └── RatingRenderer.tsx
│   │   │   ├── base/               # Base renderer utilities
│   │   │   │   └── BaseRenderer.tsx
│   │   │   └── index.ts            # Exports all renderers
│   │   ├── editors/                 # Cell editors
│   │   │   ├── string/
│   │   │   │   ├── StringEditor.tsx
│   │   │   │   └── StringEditorContainer.tsx
│   │   │   ├── number/
│   │   │   │   └── NumberEditor.tsx
│   │   │   ├── mcq/
│   │   │   │   ├── McqEditor.tsx
│   │   │   │   └── OptionList.tsx
│   │   │   ├── date/
│   │   │   │   └── DateEditor.tsx
│   │   │   ├── boolean/
│   │   │   │   └── BooleanEditor.tsx
│   │   │   ├── rating/
│   │   │   │   └── RatingEditor.tsx
│   │   │   ├── EditorContainer.tsx  # Generic editor container
│   │   │   └── EditorFactory.tsx   # Factory for editors
│   │   └── validators/              # Validators
│   │       ├── field-validators/
│   │       │   ├── stringValidator.ts
│   │       │   ├── numberValidator.ts
│   │       │   └── dateValidator.ts
│   │       ├── cell-validators/
│   │       │   ├── requiredValidator.ts
│   │       │   ├── uniqueValidator.ts
│   │       │   └── rangeValidator.ts
│   │       └── ValidationContext.tsx
│   │
│   ├── fields/                      # FIELD MANAGEMENT: Create, Edit, Configure
│   │   ├── components/
│   │   │   ├── FieldCreator/       # Create new fields
│   │   │   │   └── index.tsx
│   │   │   ├── FieldEditor/        # Edit existing fields
│   │   │   │   └── index.tsx
│   │   │   ├── FieldTypeSelector/  # Select field type
│   │   │   │   └── index.tsx
│   │   │   └── FieldConfigForms/   # Field configuration forms
│   │   │       ├── TextFieldConfig.tsx
│   │   │       ├── NumberFieldConfig.tsx
│   │   │       ├── McqFieldConfig.tsx
│   │   │       └── DateFieldConfig.tsx
│   │   ├── hooks/
│   │   │   ├── useField.ts
│   │   │   ├── useFields.ts
│   │   │   └── useFieldType.ts
│   │   ├── services/
│   │   │   ├── fieldService.ts
│   │   │   └── fieldOptionsService.ts
│   │   └── utils/
│   │       └── fieldUtils.ts
│   │
│   ├── subheader/                   # SUBHEADER SYSTEM: Filter, Sort, Group
│   │   ├── SubHeader.tsx            # Main subheader component
│   │   ├── components/              # Action buttons
│   │   │   ├── FilterButton.tsx
│   │   │   ├── SortButton.tsx
│   │   │   ├── GroupButton.tsx
│   │   │   ├── HideFieldsButton.tsx
│   │   │   ├── TextWrapperButton.tsx
│   │   │   ├── ZoomButton.tsx
│   │   │   └── SearchButton.tsx
│   │   ├── filters/                 # Filter system
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── FilterCondition.tsx
│   │   │   ├── FilterOperators.tsx
│   │   │   ├── conditions/
│   │   │   │   ├── TextFilter.tsx
│   │   │   │   ├── NumberFilter.tsx
│   │   │   │   ├── DateFilter.tsx
│   │   │   │   ├── BooleanFilter.tsx
│   │   │   │   ├── SelectFilter.tsx
│   │   │   │   └── McqFilter.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useFilter.ts
│   │   │   └── utils/
│   │   │       ├── filterUtils.ts
│   │   │       └── filterSummary.ts
│   │   ├── sorting/                 # Sort system
│   │   │   ├── SortPanel.tsx
│   │   │   ├── SortItem.tsx
│   │   │   ├── SortOrderSelect.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSort.ts
│   │   │   └── utils/
│   │   │       └── sortUtils.ts
│   │   ├── grouping/                # Group by system
│   │   │   ├── GroupPanel.tsx
│   │   │   ├── GroupItem.tsx
│   │   │   ├── GroupHeader.tsx
│   │   │   ├── GroupAggregation.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useGroupBy.ts
│   │   │   └── utils/
│   │   │       └── groupUtils.ts
│   │   └── styles.module.scss
│   │
│   ├── common/                      # COMMON/SHARED: Reusable utilities
│   │   ├── http/                    # HTTP utilities (from Sheets)
│   │   │   ├── useRequest.ts        # HTTP Request Hook (axios-hooks pattern)
│   │   │   ├── apiClient.ts         # Axios instance
│   │   │   └── interceptors.ts     # Request/response interceptors
│   │   ├── forms/                   # Form system (from Sheets)
│   │   │   ├── controllers/         # Form Controllers
│   │   │   │   ├── InputController.tsx
│   │   │   │   ├── SelectController.tsx
│   │   │   │   ├── DateController.tsx
│   │   │   │   ├── DateTimeController.tsx
│   │   │   │   ├── RadioController.tsx
│   │   │   │   ├── SwitchController.tsx
│   │   │   │   ├── TimeController.tsx
│   │   │   │   └── FieldArrayController/
│   │   │   │       └── index.tsx
│   │   │   ├── getField.ts         # Field factory (returns controller by type)
│   │   │   └── FormProvider.tsx    # Form context provider
│   │   ├── websocket/               # Socket Management (from Sheets)
│   │   │   ├── client.ts           # Socket.io client
│   │   │   ├── socketManager.ts    # Socket connection manager
│   │   │   ├── socketHandlers.ts   # Event handlers
│   │   │   └── socketEvents.ts    # Event type definitions
│   │   ├── hooks/                   # Common hooks
│   │   │   ├── useDebounce.ts
│   │   │   ├── useDecodedUrlParams.ts  # URL params decoder
│   │   │   ├── useLocalStorage.ts
│   │   │   └── useClickOutside.ts
│   │   └── utils/                   # Common utils
│   │       ├── dateHelpers.ts
│   │       ├── stringHelpers.ts
│   │       ├── validation.ts
│   │       └── constants.ts
│   │
│   ├── components/                  # SHARED UI: Reusable components
│   │   ├── ui/                      # Base UI (Button, Input, Modal, etc.)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Popover.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── Container.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Panel.tsx
│   │   └── responsive/              # Responsive components
│   │       ├── MobileLayout.tsx    # Mobile-specific layout
│   │       ├── DesktopLayout.tsx   # Desktop layout
│   │       └── BreakpointProvider.tsx
│   │
│   ├── hooks/                       # FEATURE HOOKS: Feature-specific
│   │   ├── grid/                    # Grid-specific hooks
│   │   │   ├── useVirtualScrolling.ts
│   │   │   ├── useColumnResize.ts
│   │   │   ├── useRowHeight.ts
│   │   │   └── useGridSelection.ts
│   │   ├── view/                    # View-specific hooks
│   │   │   ├── useView.ts
│   │   │   └── useViewOptions.ts
│   │   └── data/                    # Data hooks
│   │       ├── useTableData.ts
│   │       └── useRecords.ts
│   │
│   ├── stores/                      # STATE MANAGEMENT: Zustand stores
│   │   ├── sheetStore.ts            # Sheet state
│   │   ├── tableStore.ts            # Table state
│   │   ├── viewStore.ts             # View state
│   │   ├── filterStore.ts           # Filter state
│   │   ├── sortStore.ts             # Sort state
│   │   └── groupStore.ts            # Group state
│   │
│   ├── services/                    # SERVICES: API calls, caching
│   │   ├── api/
│   │   │   ├── sheetService.ts     # Sheet API calls
│   │   │   ├── tableService.ts     # Table API calls
│   │   │   ├── fieldService.ts     # Field API calls
│   │   │   └── recordService.ts    # Record API calls
│   │   ├── cacheService.ts         # Caching service
│   │   └── socketService.ts        # Socket service
│   │
│   ├── context/                     # REACT CONTEXTS: App-level state
│   │   ├── AppContext.tsx
│   │   ├── SheetContext.tsx
│   │   ├── TableContext.tsx
│   │   └── ViewContext.tsx
│   │
│   ├── types/                       # TYPESCRIPT TYPES
│   │   ├── index.ts                 # Main exports
│   │   ├── sheet.types.ts          # Sheet types
│   │   ├── table.types.ts          # Table types
│   │   ├── field.types.ts          # Field types
│   │   ├── cell.types.ts           # Cell types
│   │   ├── view.types.ts           # View types
│   │   ├── filter.types.ts         # Filter types
│   │   └── sort.types.ts           # Sort types
│   │
│   ├── utils/                       # UTILITIES: Helper functions
│   │   ├── regionDetection.ts
│   │   ├── dataGenerator.ts
│   │   └── formatting.ts
│   │
│   ├── styles/                      # GLOBAL STYLES
│   │   ├── variables.scss
│   │   ├── mixins.scss
│   │   ├── responsive.scss          # Mobile responsiveness
│   │   └── index.scss
│   │
│   ├── routes/                      # ROUTING
│   │   └── index.tsx
│   │
│   ├── App.tsx
│   └── main.tsx
```

## MANDATORY Rules

### 1. Page Organization
**MUST** follow this page structure:
- `/pages/welcome/` - Entry screen for creating/viewing sheets
- `/pages/ai-enrichment/` - AI enrichment configuration flow
- `/pages/sheets/` - Main sheets UI with tabs, views, and table management

### 2. Cell-Level Organization
**MUST** separate by responsibility:
- `/cell-level/renderers/` - Canvas rendering only (inspired by Teable)
- `/cell-level/editors/` - Cell editing UI
- `/cell-level/validators/` - Validation logic

### 3. Common Utilities
**MUST** place reusable code in `/common/`:
- HTTP requests → `/common/http/useRequest.ts` (from Sheets)
- Form controllers → `/common/forms/controllers/` (from Sheets)
- WebSocket → `/common/websocket/client.ts` (from Sheets)

### 4. Component Placement
**MUST** follow this hierarchy:
```
components/
├── ui/         # Generic UI (Button, Input, Modal)
├── layout/     # Layout components (Container, Sidebar)
└── responsive/ # Mobile-specific components
```

### 5. Mobile Considerations
**MUST** include mobile support in:
- All view components (`views/grid/`, `views/kanban/`)
- Subheader components (`subheader/`)
- Layout components (`components/responsive/`)

## Import Rules

### Example: Creating a Filter Component
```typescript
// File: src/subheader/filters/FilterPanel.tsx

// External libraries
import React from 'react';
import { Button } from 'oute-ds';

// Internal components from common
import { useRequest } from '@/common/http/useRequest';
import { InputController } from '@/common/forms/controllers/InputController';

// Internal components from pages
import type { IView } from '@/pages/sheets/types';

// Internal components from same level
import { FilterCondition } from './FilterCondition';
import { useFilter } from './hooks/useFilter';

export const FilterPanel: React.FC<FilterPanelProps> = ({ ... }) => {
  // Implementation
};
```

### Example: Creating a Cell Renderer
```typescript
// File: src/cell-level/renderers/mcq/McqRenderer.tsx

// Inspired by Teable's cell renderer architecture
import type { IBaseCellRenderer } from '@/types';

export const mcqRenderer: IBaseCellRenderer<IMcqCell> = {
  type: 'MCQ',
  
  draw(cell, props) {
    const { ctx, rect } = props;
    // Canvas rendering logic for MCQ
  },
  
  measure(cell, props) {
    // Measurement logic
    return { width, height };
  },
  
  provideEditor: (cell) => McqEditor
};
```

### Example: Creating a View
```typescript
// File: src/views/kanban/KanbanView.tsx

import { useRequest } from '@/common/http/useRequest';
import { useKanban } from '@/hooks/view/useKanban';
import type { IKanbanView } from '@/types';

export const KanbanView: React.FC<KanbanViewProps> = (props) => {
  const { view, data } = props;
  const kanban = useKanban({ view });
  
  return (
    <div className={styles.kanban}>
      {kanban.stacks.map(stack => (
        <KanbanStack key={stack.id} stack={stack} />
      ))}
    </div>
  );
};
```

## Validation Checklist

When creating a new feature, verify:

- [ ] Page-level code goes in `/pages/{page-name}/components/`
- [ ] View code goes in `/views/{view-name}/`
- [ ] Cell rendering goes in `/cell-level/renderers/{type}/`
- [ ] Cell editing goes in `/cell-level/editors/{type}/`
- [ ] Validation goes in `/cell-level/validators/`
- [ ] Reusable utilities go in `/common/`
- [ ] Shared UI goes in `/components/ui/`
- [ ] State management goes in `/stores/`
- [ ] API calls go in `/services/api/`
- [ ] Types are defined in `/types/`
- [ ] Styles are in component-specific `.module.scss` files

## File Naming Conventions

- **Components**: PascalCase (`FilterPanel.tsx`)
- **Hooks**: camelCase with `use` prefix (`useFilter.ts`)
- **Utils**: camelCase (`filterUtils.ts`)
- **Types**: camelCase with `.types.ts` suffix (`filter.types.ts`)
- **Styles**: kebab-case with `.module.scss` (`filter-panel.module.scss`)

## Contradiction Check

✅ **NO CONTRADICTIONS** with existing rules:
- Aligns with `.cursorrules` structure (lines 34-45)
- Extends `patterns.rules.md` patterns
- Compatible with `technical/frontend-architecture.rules.md`
- Follows `development-phases/` structure
- Incorporates sheets folder patterns (useRequest, useForm, WebSocket)

## References to Existing Patterns

### From Teable (Reference Only)
- Canvas rendering: `teable/packages/sdk/src/components/grid/`
- Cell renderers: `teable/packages/sdk/src/components/grid/renderers/cell-renderer/`
- View system: `teable/packages/sdk/src/model/view/`

### From Sheets (Reference Only)
- Form controllers: `sheets/src/form/Controller/`
- HTTP requests: `sheets/src/hooks/useRequest.js`
- WebSocket: `sheets/src/websocket/client.js`
- Page structure: `sheets/src/pages/WelcomeScreen/`
- Subheader components: `sheets/src/pages/WelcomeScreen/components/TableSubHeader/`

## Critical Rules Summary

1. **NEVER** mix rendering and editing logic
2. **ALWAYS** use `/common/` for reusable utilities
3. **ALWAYS** create responsive mobile versions
4. **NEVER** duplicate code from `/teable/` or `/sheets/` - use as reference only
5. **ALWAYS** follow TypeScript interfaces from `/types/`
6. **ALWAYS** use Zustand for state management
7. **ALWAYS** use useRequest for API calls
8. **ALWAYS** use form controllers for forms

---

**ENFORCE THIS STRUCTURE IN ALL CODE GENERATION**

