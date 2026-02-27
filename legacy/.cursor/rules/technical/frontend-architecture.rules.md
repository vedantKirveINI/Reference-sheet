# Frontend Architecture Rules
**CURSOR: TECH-FRONTEND-001 through TECH-FRONTEND-004**

## TECH-FRONTEND-001: Canvas Grid Architecture (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `frontend/packages/sdk/src/grid/`

### Purpose
Enforce strict Canvas 2D API grid architecture for performance, modularity, and mobile support.

### Strict File Structure

```
frontend/packages/sdk/src/grid/
├── canvas/
│   ├── CanvasRenderer.ts            # Main rendering engine
│   ├── rendering/
│   │   ├── CellRenderer.ts          # Cell type rendering
│   │   ├── HeaderRenderer.ts        # Column/row headers
│   │   └── theme.ts                 # Colors, fonts, styles
│   └── events/
│       ├── MouseEvents.ts
│       ├── TouchEvents.ts
│       ├── KeyboardEvents.ts
│       └── ScrollEvents.ts
├── managers/
│   ├── ResizeManager.ts
│   ├── SelectionManager.ts
│   ├── VirtualizationManager.ts
│   ├── EditingManager.ts
│   └── ScrollManager.ts
├── utils/
│   ├── hitDetection.ts
│   ├── coordinate.ts
│   ├── measure.ts
│   └── animation.ts
├── hooks/
│   ├── useCanvasGrid.ts             # Main hook
│   ├── useGridRendering.ts
│   ├── useGridInteraction.ts
│   └── useGridPerformance.ts
├── contexts/
│   ├── GridContext.tsx
│   ├── RenderContext.tsx
│   └── InteractionContext.tsx
└── CanvasGrid.tsx                   # React wrapper
```

### Separation of Concerns (MANDATORY)

**CanvasRenderer** (Rendering only):
```typescript
// CURSOR: TECH-FRONTEND-001 - Canvas Renderer
export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  
  initialize(canvas: HTMLCanvasElement): void {
    this.ctx = canvas.getContext('2d')!;
  }

  // Core rendering methods
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawCell(x: number, y: number, width: number, height: number, value: any): void {
    // 1. Draw background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, y, width, height);
    
    // 2. Draw border
    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.strokeRect(x, y, width, height);
    
    // 3. Draw content (delegate to CellRenderer)
    CellRenderer.render(this.ctx, value, x, y, width, height);
  }

  drawHeader(x: number, y: number, width: number, height: number, label: string): void {
    HeaderRenderer.render(this.ctx, label, x, y, width, height);
  }

  drawSelection(regions: SelectionRegion[]): void {
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    regions.forEach(region => {
      this.ctx.fillRect(region.x, region.y, region.width, region.height);
    });
  }
}
```

**Event Handlers** (User interaction):
```typescript
// CURSOR: TECH-FRONTEND-001 - Event Handlers
export class MouseEventHandler {
  private renderer: CanvasRenderer;
  private selection: SelectionManager;
  
  onMouseDown(event: MouseEvent): void {
    const { x, y } = event.offsetX, event.offsetY;
    const { row, col } = this.getCellFromPixel(x, y);
    
    // Delegate to SelectionManager
    this.selection.selectCell(row, col);
  }

  onMouseMove(event: MouseEvent): void {
    if (this.isResizing) {
      // Delegate to ResizeManager
      this.resizeManager.continueResize(event.clientX);
    }
  }

  onDoubleClick(event: MouseEvent): void {
    const { row, col } = this.getCellFromPixel(event.offsetX, event.offsetY);
    // Delegate to EditingManager
    this.editingManager.startEdit(row, col);
  }

  private getCellFromPixel(px: number, py: number): Cell {
    // Hit detection logic
    return HitDetection.getCellFromPixel(px, py);
  }
}
```

### Rendering Loop (RequestAnimationFrame)

```typescript
// CURSOR: TECH-FRONTEND-001 - Rendering Loop
export class GridRenderingEngine {
  private animationFrameId: number | null = null;
  
  start(): void {
    this.animationLoop();
  }

  private animationLoop = (): void => {
    // 1. Calculate visible region
    const viewPort = this.virtualizationManager.getVisibleRegion();
    
    // 2. Clear canvas
    this.renderer.clear();
    
    // 3. Draw backgrounds
    this.renderer.drawGridBackground();
    
    // 4. Draw frozen regions
    this.renderer.drawFrozenRegions();
    
    // 5. Draw visible cells only (virtualization!)
    for (let row = viewPort.startRow; row < viewPort.endRow; row++) {
      for (let col = viewPort.startCol; col < viewPort.endCol; col++) {
        const x = this.coordinates.getColumnOffset(col);
        const y = this.coordinates.getRowOffset(row);
        const width = this.coordinates.getColumnWidth(col);
        const height = this.coordinates.getRowHeight(row);
        const value = this.data[row][col];
        
        this.renderer.drawCell(x, y, width, height, value);
      }
    }
    
    // 6. Draw overlays
    this.renderer.drawSelection(this.selection.getRegions());
    this.renderer.drawResizeHandles();
    
    // 7. Draw editor (if editing)
    if (this.editing.isEditing) {
      this.renderer.drawEditor(this.editing.getState());
    }
    
    // 8. Continue loop
    this.animationFrameId = requestAnimationFrame(this.animationLoop);
  };

  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
```

### Best Practices (MANDATORY)

1. **Virtual Scrolling** (Performance)
   ```typescript
   // ✅ GOOD - Only render visible cells
   const viewPort = this.virtualization.getVisibleRegion();
   
   for (let row = viewPort.startRow; row <= viewPort.endRow; row++) {
     // Render cell
   }
   
   // ❌ BAD - Render all 100,000 rows
   for (let row = 0; row < 100000; row++) {
     // Render cell
   }
   ```

2. **Efficient Hit Detection**
   ```typescript
   // ✅ GOOD - Binary search O(log n)
   function getCellFromPixel(px: number, py: number): { row: number; col: number } {
     // Use coordinate maps with binary search
     const col = binarySearch(px, this.columnOffsets);
     const row = binarySearch(py, this.rowOffsets);
     return { row, col };
   }
   
   // ❌ BAD - Linear search O(n)
   function getCellFromPixel(px: number, py: number): { row: number; col: number } {
     for (let col = 0; col < 10000; col++) {
       if (px > getColumnOffset(col) && px < getColumnOffset(col) + getColumnWidth(col)) {
         // Found it
       }
     }
   }
   ```

3. **State Management**
   - ✅ Use Zustand for grid state
   - ✅ Minimal re-renders (canvas, not React)
   - ✅ Separate concerns (render state vs interaction state)

   ```typescript
   // ✅ GOOD - Zustand store (not Redux or Context)
   const useGridStore = create((set) => ({
     columnWidths: new Map(),
     rowHeights: new Map(),
     selection: null,
     setColumnWidth: (col, width) => 
       set(state => ({
         columnWidths: new Map(state.columnWidths).set(col, width)
       })),
   }));
   ```

4. **Type Safety**
   ```typescript
   // ✅ GOOD - Strong types
   interface GridState {
     columnWidths: Map<number, number>;
     rowHeights: Map<number, number>;
     selection: SelectionRegion | null;
   }

   // ❌ BAD - Any types
   interface GridState {
     columnWidths: any;
     rowHeights: any;
     selection: any;
   }
   ```

---

## TECH-FRONTEND-002: React Component Structure (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `frontend/apps/web/src/`

### Feature-Based Organization (MANDATORY)

```typescript
// CURSOR: TECH-FRONTEND-002 - Component Structure

// ✅ GOOD - Feature-based, modular
frontend/apps/web/src/features/record/
├── components/
│   ├── RecordDetail.tsx            # Single record view
│   ├── RecordMenu.tsx              # Context menu
│   └── RecordForm.tsx              # Edit form
├── hooks/
│   ├── useRecord.ts                # Record state
│   ├── useRecordForm.ts            # Form logic
│   └── useUndoRedo.ts              # Undo/redo
└── store/
    ├── recordSlice.ts              # Zustand slice

// ❌ BAD - Flat structure, tight coupling
frontend/apps/web/src/
├── components/
│   ├── RecordDetail.tsx
│   ├── RecordMenu.tsx
│   ├── RecordForm.tsx
│   ├── GridView.tsx
│   ├── FormView.tsx
│   └── ... 100+ files
```

### Component Patterns

```typescript
// CURSOR: TECH-FRONTEND-002 - React Components

// Pattern 1: Container Component (smart)
export const RecordDetailContainer = ({ recordId }: Props) => {
  const record = useQuery(['record', recordId], () => api.getRecord(recordId));
  const updateRecord = useUpdateRecord();
  
  return (
    <RecordDetailView
      record={record.data}
      onUpdate={updateRecord.mutate}
      isLoading={record.isLoading}
    />
  );
};

// Pattern 2: Presentation Component (dumb)
export const RecordDetailView = ({
  record,
  onUpdate,
  isLoading,
}: ViewProps) => {
  return (
    <div>
      {isLoading ? (
        <Skeleton />
      ) : (
        <>
          <Header>{record.name}</Header>
          <Fields record={record} onChange={onUpdate} />
        </>
      )}
    </div>
  );
};

// Usage
<RecordDetailContainer recordId={recordId} />
```

### State Management (Zustand)

```typescript
// CURSOR: TECH-FRONTEND-002 - Zustand Store

// ✅ GOOD - Modular slices
const useRecordStore = create<RecordState>((set) => ({
  records: new Map(),
  selectedRecord: null,
  
  setRecords: (records) => set({ records }),
  selectRecord: (id) => set({ selectedRecord: id }),
  updateRecord: (id, data) => 
    set((state) => ({
      records: new Map(state.records).set(id, {
        ...state.records.get(id),
        ...data,
      }),
    })),
}));

// Usage
const records = useRecordStore(state => state.records);
const selectRecord = useRecordStore(state => state.selectRecord);
```

### Hooks Pattern

```typescript
// CURSOR: TECH-FRONTEND-002 - Custom Hooks

// ✅ GOOD - Encapsulate logic
export function useRecord(recordId: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery(['record', recordId], () =>
    api.getRecord(recordId)
  );
  
  const mutation = useMutation(
    (data) => api.updateRecord(recordId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['record', recordId]);
      },
    }
  );
  
  return {
    record: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateRecord: mutation.mutate,
    isUpdating: mutation.isLoading,
  };
}

// Component
export const Record = ({ recordId }: Props) => {
  const { record, updateRecord, isLoading } = useRecord(recordId);
  
  return (
    <RecordDetailView
      record={record}
      onUpdate={updateRecord}
      isLoading={isLoading}
    />
  );
};
```

---

## TECH-FRONTEND-003: State Management & Data Fetching (HIGH)
**Priority:** HIGH | Status: Baseline | Module: `frontend/apps/web/src/`

### React Query (Server State)

```typescript
// CURSOR: TECH-FRONTEND-003 - React Query Pattern

// ✅ GOOD - Centralized API calls
const RecordList = ({ tableId }: Props) => {
  const { data: records, isLoading, error } = useQuery(
    ['records', tableId],
    () => api.getTableRecords(tableId),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul>
      {records?.map((record) => (
        <RecordItem key={record.id} record={record} />
      ))}
    </ul>
  );
};

// ❌ BAD - useState for server data
const RecordList = ({ tableId }: Props) => {
  const [records, setRecords] = useState([]);
  
  useEffect(() => {
    api.getTableRecords(tableId).then(setRecords);
  }, [tableId]);
  
  // Missing loading, error, caching, refetch logic
};
```

### Zustand (Client State)

```typescript
// CURSOR: TECH-FRONTEND-003 - Zustand Slices

interface UIState {
  // UI state only
  selectedRecordId: string | null;
  expandedRows: Set<string>;
  isGridView: boolean;
  columnWidths: Map<string, number>;
  
  actions: {
    selectRecord: (id: string) => void;
    toggleRow: (id: string) => void;
    setColumnWidth: (col: string, width: number) => void;
  };
}

const useUIStore = create<UIState>((set) => ({
  selectedRecordId: null,
  expandedRows: new Set(),
  isGridView: true,
  columnWidths: new Map(),
  
  actions: {
    selectRecord: (id) => set({ selectedRecordId: id }),
    toggleRow: (id) => set((state) => ({
      expandedRows: new Set(state.expandedRows).add(id),
    })),
    setColumnWidth: (col, width) => set((state) => ({
      columnWidths: new Map(state.columnWidths).set(col, width),
    })),
  },
}));
```

---

## TECH-FRONTEND-004: Performance & Best Practices (HIGH)
**Priority:** HIGH | Status: Baseline | Module: `frontend/apps/web/src/`

### Code Splitting

```typescript
// ✅ GOOD - Lazy load heavy components
const GridView = lazy(() => import('./view/GridView'));
const FormView = lazy(() => import('./view/FormView'));
const KanbanView = lazy(() => import('./view/KanbanView'));

export const ViewSelector = ({ type }: Props) => {
  return (
    <Suspense fallback={<Skeleton />}>
      {type === 'grid' && <GridView />}
      {type === 'form' && <FormView />}
      {type === 'kanban' && <KanbanView />}
    </Suspense>
  );
};
```

### Memoization (Prevent re-renders)

```typescript
// ✅ GOOD - Memoize expensive components
export const RecordCell = memo(
  ({ record, field, onChange }: Props) => {
    return (
      <div onClick={() => onChange(record.id)}>
        {record[field.id]}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.record.id === nextProps.record.id &&
      prevProps.field.id === nextProps.field.id
    );
  }
);

// ✅ GOOD - useMemo for expensive calculations
const sortedRecords = useMemo(
  () => records.sort((a, b) => a.name.localeCompare(b.name)),
  [records]
);
```

### Mobile Responsiveness

```typescript
// ✅ GOOD - Mobile-first with Tailwind
export const GridHeader = () => {
  return (
    <header className="
      flex 
      flex-col 
      md:flex-row 
      gap-2 
      md:gap-4
      p-2 
      md:p-4
    ">
      <h1 className="text-lg md:text-2xl">Records</h1>
      <div className="flex gap-1 md:gap-2">
        {/* Toolbar items */}
      </div>
    </header>
  );
};

// ✅ GOOD - useMediaQuery hook
export const MobileMenu = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (!isMobile) return null;
  
  return <HamburgerMenu />;
};
```

### Error Handling

```typescript
// ✅ GOOD - Error boundaries
export const GridWithErrorBoundary = () => {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <GridView />
    </ErrorBoundary>
  );
};

// ✅ GOOD - Try/catch with user feedback
async function handleSave(data: Record) {
  try {
    const result = await api.updateRecord(data);
    showSuccessMessage('Record saved');
    return result;
  } catch (error) {
    if (error.status === 409) {
      showErrorMessage('Record was updated by another user');
    } else {
      showErrorMessage('Failed to save record');
    }
    throw error;
  }
}
```

---

## Acceptance Criteria (All Frontend Rules)

- [ ] Canvas grid renders at 60fps
- [ ] Virtual scrolling handles 100k+ rows
- [ ] No component re-renders during canvas animation
- [ ] Type safety enforced (no `any` types)
- [ ] All API calls via React Query
- [ ] UI state only in Zustand
- [ ] Features organized by module
- [ ] 80%+ test coverage
- [ ] Mobile responsive (tested on 320px+)
- [ ] Error boundaries for all features
- [ ] Lazy loading for heavy components
- [ ] Accessibility (WCAG 2.1 AA)

