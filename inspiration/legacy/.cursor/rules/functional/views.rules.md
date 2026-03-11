# Views Rules
**CURSOR: RULES-VIEW-001 through RULES-VIEW-007**

## RULES-VIEW-001: Grid View (COMPLETE)
**Module:** `backend/src/features/view/` | `frontend/src/components/Handsontable/`

### Purpose
Display data in spreadsheet format with columns (fields) and rows (records).

### Features
- [x] Display records in grid layout
- [x] Sort by column
- [x] Filter records
- [x] Edit cells inline
- [x] Add/remove rows
- [x] Reorder columns
- [x] Hide/show columns
- [x] Freeze panes

### API Endpoints
```
POST   /api/v1/views (type: 'grid')
GET    /api/v1/views/:viewId
PATCH  /api/v1/views/:viewId
GET    /api/v1/views/:viewId/records
POST   /api/v1/views/:viewId/sort
POST   /api/v1/views/:viewId/filter
```

### Implementation Pattern
```typescript
// CURSOR: RULES-VIEW-001 - Grid View

export class ViewService {
  async createGridView(dto: CreateViewDTO): Promise<View> {
    const view = await this.prisma.view.create({
      data: {
        tableId: dto.tableId,
        name: dto.name,
        type: 'grid',
        config: {
          columns: dto.fields.map(f => ({
            fieldId: f.id,
            visible: true,
            width: 150
          })),
          sort: [],
          filter: [],
          frozenColumns: 0
        }
      }
    });
    this.gateway.emit('view:created', { view });
    return view;
  }
}
```

### Database Schema
```prisma
model View {
  id        String   @id @default(cuid())
  tableId   String
  table     TableMeta @relation(fields: [tableId], references: [id])
  
  name      String
  type      String   // 'grid', 'form', 'kanban', 'calendar'
  
  config    Json     // View-specific configuration
  filters   Json[]   // Filter definitions
  sorts     Json[]   // Sort definitions
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([tableId])
}
```

### View Configuration (Grid)
```typescript
interface GridViewConfig {
  columns: {
    fieldId: string;
    visible: boolean;
    width: number;           // pixels
    order: number;
  }[];
  
  sort?: {
    fieldId: string;
    direction: 'asc' | 'desc';
  }[];
  
  filter?: FilterCondition[];
  
  frozenColumns?: number;
  rowHeight?: number;
  groupBy?: string;         // Field ID
}
```

---

## RULES-VIEW-002: Form View (COMPLETE)
**Module:** `backend/src/features/view/`

### Purpose
Display and edit records one at a time in a form layout for better data entry UX.

### Features
- [x] Display fields in form layout
- [x] Reorder fields
- [x] Hide fields
- [x] Add section breaks
- [x] Field descriptions
- [x] Conditional visibility
- [x] Multi-page forms

### API Endpoints
```
POST   /api/v1/views (type: 'form')
PATCH  /api/v1/views/:viewId/layout
```

### Form Configuration
```typescript
interface FormViewConfig {
  layout: {
    sections?: {
      name: string;
      fields: string[];  // Field IDs
      collapsed?: boolean;
    }[];
  };
  
  fields: {
    fieldId: string;
    label?: string;
    description?: string;
    required?: boolean;
    visible?: boolean;
    order: number;
  }[];
  
  settings: {
    submitButtonText?: string;
    showProgressBar?: boolean;
    requireAllFields?: boolean;
  };
}
```

---

## RULES-VIEW-003: Kanban View (NOT STARTED)
**Module:** `backend/src/features/view/` | `frontend/src/components/KanbanView/`

### Purpose
Display records grouped into swimlanes (cards) based on select field value.

### Requirements
- [ ] Group records by SingleSelect field
- [ ] Drag/drop cards between columns
- [ ] Create new status on card drag
- [ ] Limit records per column
- [ ] Card templates
- [ ] Column actions (collapse, archive)

### Implementation Pattern
```typescript
// CURSOR: RULES-VIEW-003 - Kanban View

export class ViewService {
  async createKanbanView(dto: CreateViewDTO): Promise<View> {
    return this.prisma.view.create({
      data: {
        type: 'kanban',
        config: {
          groupByFieldId: dto.config.groupByFieldId, // Must be SingleSelect
          cardFields: dto.config.cardFields,          // Which fields to show
          sort: dto.config.sort
        }
      }
    });
  }

  async moveCard(
    viewId: string,
    recordId: string,
    toStatus: string
  ): Promise<void> {
    // Update record's select field value
    // Emit 'kanban:cardMoved' event
  }
}
```

### Kanban Configuration
```typescript
interface KanbanViewConfig {
  groupByFieldId: string;           // Must be SingleSelect or equivalent
  
  cards: {
    size: 'small' | 'medium' | 'large';
    displayFields: string[];         // Field IDs to show
    template?: string;               // Custom card template
  };
  
  columns: {
    collapsible: boolean;
    minCards?: number;
    maxCards?: number;
  };
  
  settings: {
    allowCreateColumn: boolean;
    allowDeleteColumn: boolean;
  };
}
```

### WebSocket Events
```typescript
socket.emit('kanban:cardMoved', {
  viewId, recordId, toStatus, fromStatus
});

socket.emit('kanban:columnCreated', {
  viewId, columnId, label
});
```

---

## RULES-VIEW-004: Calendar View (NOT STARTED)
**Module:** `backend/src/features/view/` | `frontend/src/components/CalendarView/`

### Purpose
Display records as events on calendar timeline based on date field.

### Requirements
- [ ] Display events on calendar
- [ ] Support multiple date fields
- [ ] Drag events to reschedule
- [ ] Create event from date click
- [ ] Week/month/day views
- [ ] Color coding by field

### Calendar Configuration
```typescript
interface CalendarViewConfig {
  dateFieldId: string;            // Primary date field
  endDateFieldId?: string;        // For multi-day events
  
  eventFields: {
    title: string;                // Field to use as title
    description?: string;
    color?: string;               // Field for color coding
  };
  
  view: 'month' | 'week' | 'day';
  firstDayOfWeek: 0 | 1;
}
```

---

## RULES-VIEW-005: Gallery View (NOT STARTED)
**Module:** `backend/src/features/view/` | `frontend/src/components/GalleryView/`

### Purpose
Display records as visual cards/thumbnails with image or preview.

### Requirements
- [ ] Display records as cards
- [ ] Image field support
- [ ] Custom card layout
- [ ] Filter/sort cards
- [ ] Lightbox preview

### Gallery Configuration
```typescript
interface GalleryViewConfig {
  imageFieldId?: string;          // Field with image/attachment
  
  card: {
    titleField: string;
    descriptionField?: string;
    imageField?: string;
    columns: 1 | 2 | 3 | 4 | 5;  // Responsive columns
  };
  
  aspectRatio: 'square' | '4:3' | '16:9' | 'auto';
}
```

---

## RULES-VIEW-006: Filters & Sorting (COMPLETE)
**Module:** `backend/src/features/view/`

### Purpose
Enable dynamic data filtering and sorting with complex conditions.

### Filter Operators
```typescript
type FilterOperator = 
  // Text
  | 'is' | 'is_not' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty'
  
  // Number
  | 'equals' | 'not_equals' | 'greater_than' | 'less_than'
  | 'greater_than_equal' | 'less_than_equal'
  
  // Date
  | 'is_exact_date' | 'is_within_days' | 'is_past' | 'is_future'
  
  // Select
  | 'select_is' | 'select_any_of' | 'select_none_of'
  
  // Checkbox
  | 'is_checked' | 'is_unchecked'
  
  // Lookup/Link
  | 'has_any_records' | 'has_no_records';
```

### Filter Configuration
```typescript
interface FilterCondition {
  id: string;
  fieldId: string;
  operator: FilterOperator;
  value: any;
  logicalOp: 'AND' | 'OR';
}

interface FilterGroup {
  conditions: FilterCondition[];
  conjunction: 'AND' | 'OR';
  nestedGroups?: FilterGroup[];
}
```

### API Endpoints
```
POST   /api/v1/views/:viewId/filters
PATCH  /api/v1/views/:viewId/filters/:filterId
DELETE /api/v1/views/:viewId/filters/:filterId
```

### Sort Configuration
```typescript
interface SortCondition {
  fieldId: string;
  direction: 'asc' | 'desc';
  order: number;               // Priority order
}
```

---

## RULES-VIEW-007: View Management (COMPLETE)
**Module:** `backend/src/features/view/`

### Purpose
CRUD operations for views and view configurations.

### Requirements
- [x] Create view of any type
- [x] List views for table
- [x] Duplicate view
- [x] Delete view
- [x] Update view configuration
- [x] Set default view

### API Endpoints
```
POST   /api/v1/views
GET    /api/v1/tables/:tableId/views
GET    /api/v1/views/:viewId
PATCH  /api/v1/views/:viewId
DELETE /api/v1/views/:viewId
POST   /api/v1/views/:viewId/duplicate
PATCH  /api/v1/tables/:tableId/defaultView
```

### Implementation Pattern
```typescript
// CURSOR: RULES-VIEW-007 - View Management

@Controller('views')
export class ViewController {
  @Post()
  async create(@Body() dto: CreateViewDTO) {
    // 1. Validate table exists
    // 2. Validate view type
    // 3. Initialize view with default config
    // 4. Create in DB
    // 5. Emit 'view:created'
  }

  @Patch(':viewId')
  async update(@Param('viewId') id: string, @Body() dto: UpdateViewDTO) {
    // 1. Validate changes
    // 2. Update config
    // 3. Broadcast update
  }

  @Post(':viewId/duplicate')
  async duplicate(@Param('viewId') id: string) {
    // Clone view with new name
    // Keep same config
    // Emit 'view:duplicated'
  }
}
```

### WebSocket Events
```typescript
socket.emit('view:created', { view });
socket.emit('view:updated', { viewId, changes });
socket.emit('view:deleted', { viewId });
socket.emit('view:duplicated', { originalViewId, newViewId });
```

---

## View Status Matrix

| Feature | Grid | Form | Kanban | Calendar | Gallery |
|---------|------|------|--------|----------|---------|
| Records Display | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit Records | ✓ | ✓ | ✓ | ✓ | ✓ |
| Grouping | ✓ | - | ✓ | By Date | - |
| Sorting | ✓ | - | ✓ | ✓ | ✓ |
| Filtering | ✓ | ✓ | ✓ | ✓ | ✓ |
| Multiple Select | ✓ | - | - | - | - |
| Export | ✓ | - | - | - | - |
| Status | Complete | Complete | Planned | Planned | Planned |

---

## Common Patterns

### Creating New View Type
1. Add view type constant: `export const VIEW_TYPES = [..., 'timeline']`
2. Create service: `TimelineViewService extends BaseViewService`
3. Implement `getRecords()` with type-specific logic
4. Add API endpoint
5. Create frontend component
6. Add WebSocket events

### Default View Configuration
```typescript
const DEFAULT_GRID_CONFIG = {
  columns: fields.map(f => ({
    fieldId: f.id,
    visible: true,
    width: 150,
    order: f.position
  })),
  sort: [],
  filter: [],
  frozenColumns: 0,
  rowHeight: 35
};
```
