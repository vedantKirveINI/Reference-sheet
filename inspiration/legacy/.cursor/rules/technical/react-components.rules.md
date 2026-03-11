# React Components & Feature Architecture Rules
**CURSOR: TECH-REACT-001 through TECH-REACT-005**

## TECH-REACT-001: Feature Module Structure (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `frontend/apps/web/src/features/`

### Purpose
Enforce feature-based modular architecture for frontend scalability.

### Strict File Structure

```
frontend/apps/web/src/features/{feature}/
├── components/
│   ├── {Feature}Container.tsx        # Smart/Container component
│   ├── {Feature}View.tsx             # Presentation component
│   ├── {Feature}Header.tsx           # Sub-components
│   ├── {Feature}Footer.tsx
│   └── __tests__/
│       └── {Feature}.test.tsx
├── hooks/
│   ├── use{Feature}.ts              # Main logic hook
│   ├── use{Feature}Form.ts          # Form-specific
│   └── __tests__/
│       └── use{Feature}.test.ts
├── store/
│   ├── {feature}Slice.ts            # Zustand store
│   └── __tests__/
│       └── {feature}Slice.test.ts
├── types/
│   └── {feature}.types.ts           # TypeScript interfaces
├── utils/
│   ├── {feature}.helpers.ts         # Helper functions
│   └── validators.ts                # Validation logic
└── index.ts                         # Public API
```

### Container/Presentation Pattern

```typescript
// CURSOR: TECH-REACT-001 - Feature Module Pattern

// 1. Container Component (Smart) - Handles logic
export const RecordDetailContainer = ({ recordId }: Props) => {
  // ✅ Fetch data
  const { data: record, isLoading } = useQuery(
    ['record', recordId],
    () => api.getRecord(recordId)
  );

  // ✅ Handle mutations
  const updateRecord = useMutation(
    (data) => api.updateRecord(recordId, data)
  );

  // ✅ Local state
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Delegate rendering to view
  return (
    <RecordDetailView
      record={record}
      isLoading={isLoading}
      isEditing={isEditing}
      onEdit={setIsEditing}
      onSave={(data) => updateRecord.mutate(data)}
    />
  );
};

// 2. Presentation Component (Dumb) - Just renders
interface RecordDetailViewProps {
  record?: Record;
  isLoading: boolean;
  isEditing: boolean;
  onEdit: (value: boolean) => void;
  onSave: (data: Record) => void;
}

export const RecordDetailView = ({
  record,
  isLoading,
  isEditing,
  onEdit,
  onSave,
}: RecordDetailViewProps) => {
  if (isLoading) return <Skeleton />;
  if (!record) return <NotFound />;

  return (
    <div className="record-detail">
      <Header>
        {record.name}
        <Button onClick={() => onEdit(true)}>Edit</Button>
      </Header>
      
      {isEditing ? (
        <RecordForm
          initial={record}
          onSave={onSave}
          onCancel={() => onEdit(false)}
        />
      ) : (
        <RecordInfo record={record} />
      )}
    </div>
  );
};

// 3. Export container as default
export default RecordDetailContainer;
export { RecordDetailView };  // Also export view for testing
```

---

## TECH-REACT-002: Custom Hooks (HIGH)
**Priority:** HIGH | Status: Baseline

### Hook Pattern

```typescript
// CURSOR: TECH-REACT-002 - Custom Hooks

// ✅ GOOD - Encapsulated, testable
export function useRecord(recordId: string) {
  const queryClient = useQueryClient();

  // Fetch
  const query = useQuery(['record', recordId], () =>
    api.getRecord(recordId)
  );

  // Mutations
  const updateMutation = useMutation(
    (data) => api.updateRecord(recordId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['record', recordId]);
      },
    }
  );

  const deleteMutation = useMutation(
    () => api.deleteRecord(recordId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['records']);
      },
    }
  );

  return {
    // State
    record: query.data,
    isLoading: query.isLoading,
    error: query.error,
    
    // Actions
    updateRecord: updateMutation.mutate,
    deleteRecord: deleteMutation.mutate,
    
    // Status
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
  };
}

// ✅ Usage in component
export const RecordDetail = ({ recordId }: Props) => {
  const {
    record,
    isLoading,
    updateRecord,
    isUpdating,
  } = useRecord(recordId);

  return (
    <div>
      {isLoading ? <Skeleton /> : <RecordInfo record={record} />}
      <button
        onClick={() => updateRecord({ name: 'New Name' })}
        disabled={isUpdating}
      >
        {isUpdating ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

// ❌ BAD - Inline logic (untestable)
export const RecordDetail = ({ recordId }: Props) => {
  const [record, setRecord] = useState();
  
  useEffect(() => {
    api.getRecord(recordId).then(setRecord);  // No error handling
  }, [recordId]);
  
  // Logic scattered, hard to test
};
```

---

## TECH-REACT-003: State Management (HIGH)
**Priority:** HIGH | Status: Baseline

### Zustand Store Pattern

```typescript
// CURSOR: TECH-REACT-003 - Zustand Store

// ✅ GOOD - Modular store with clear actions
interface UIState {
  // State
  selectedRecordId: string | null;
  expandedRows: Set<string>;
  columnOrder: string[];
  isGridView: boolean;

  // Actions
  selectRecord: (id: string) => void;
  expandRow: (id: string) => void;
  collapseRow: (id: string) => void;
  setColumnOrder: (order: string[]) => void;
  setViewMode: (mode: 'grid' | 'form') => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  selectedRecordId: null,
  expandedRows: new Set(),
  columnOrder: [],
  isGridView: true,

  // Actions
  selectRecord: (id) => set({ selectedRecordId: id }),
  
  expandRow: (id) => set((state) => ({
    expandedRows: new Set(state.expandedRows).add(id),
  })),
  
  collapseRow: (id) => set((state) => ({
    expandedRows: new Set(
      Array.from(state.expandedRows).filter(r => r !== id)
    ),
  })),
  
  setColumnOrder: (order) => set({ columnOrder: order }),
  setViewMode: (mode) => set({ isGridView: mode === 'grid' }),
}));

// Usage
export const RecordGrid = () => {
  // Select only needed state (avoid re-renders)
  const selectedRecordId = useUIStore(s => s.selectedRecordId);
  const selectRecord = useUIStore(s => s.selectRecord);

  return (
    <div>
      {records.map(record => (
        <Row
          key={record.id}
          selected={record.id === selectedRecordId}
          onClick={() => selectRecord(record.id)}
        />
      ))}
    </div>
  );
};

// ❌ BAD - Multiple re-renders
export const RecordGrid = () => {
  // This subscribes to ENTIRE store
  const state = useUIStore();
  
  // If ANY state changes, component re-renders
  // Even if selectedRecordId didn't change!
};
```

---

## TECH-REACT-004: Performance Optimization (HIGH)
**Priority:** HIGH | Status: Baseline

### Memoization

```typescript
// CURSOR: TECH-REACT-004 - Memoization

// ✅ GOOD - Memoized cell component
export const RecordCell = memo(
  ({ record, field, onChange }: Props) => {
    return (
      <td
        onClick={() => onChange(record.id, field.id)}
        className={styles.cell}
      >
        {record[field.id]}
      </td>
    );
  },
  // Custom comparison
  (prevProps, nextProps) => {
    return (
      prevProps.record.id === nextProps.record.id &&
      prevProps.field.id === nextProps.field.id &&
      prevProps.record[nextProps.field.id] ===
        nextProps.record[nextProps.field.id]
    );
  }
);

// ✅ GOOD - useMemo for expensive calculations
export const SortedRecords = ({ records }: Props) => {
  const sorted = useMemo(
    () => {
      console.time('sort'); // Debug
      const result = records.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      console.timeEnd('sort');
      return result;
    },
    [records]
  );

  return (
    <div>
      {sorted.map(record => (
        <RecordItem key={record.id} record={record} />
      ))}
    </div>
  );
};

// ❌ BAD - No memoization (re-renders on every parent render)
export const RecordCell = ({ record, field, onChange }: Props) => {
  // Function created every render
  const handleClick = () => onChange(record.id, field.id);
  
  return <td onClick={handleClick}>{record[field.id]}</td>;
};
```

### Code Splitting

```typescript
// CURSOR: TECH-REACT-004 - Lazy Loading

import { lazy, Suspense } from 'react';

// Lazy load heavy views
const GridView = lazy(() => import('./views/GridView'));
const FormView = lazy(() => import('./views/FormView'));
const KanbanView = lazy(() => import('./views/KanbanView'));

export const ViewSelector = ({ viewType }: Props) => {
  return (
    <Suspense fallback={<Skeleton />}>
      {viewType === 'grid' && <GridView />}
      {viewType === 'form' && <FormView />}
      {viewType === 'kanban' && <KanbanView />}
    </Suspense>
  );
};
```

---

## TECH-REACT-005: Mobile Responsiveness (HIGH)
**Priority:** HIGH | Status: Baseline

### Mobile-First Pattern

```typescript
// CURSOR: TECH-REACT-005 - Mobile Responsive

// ✅ GOOD - Mobile-first Tailwind
export const RecordHeader = () => {
  return (
    <header className="
      flex 
      flex-col 
      md:flex-row      /* ← Stack on mobile, row on tablet+ */
      gap-2 
      md:gap-4
      p-2 
      md:p-4
    ">
      <h1 className="text-lg md:text-2xl">Records</h1>
      
      <div className="
        flex 
        gap-1 
        md:gap-2
        flex-wrap        /* ← Wrap on small screens */
      ">
        <button className="text-sm md:text-base">Filter</button>
        <button className="text-sm md:text-base">Sort</button>
      </div>
    </header>
  );
};

// ✅ GOOD - useMediaQuery hook
export const ResponsiveMenu = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <nav>
      {isMobile ? (
        <HamburgerMenu />
      ) : (
        <DesktopMenu />
      )}
    </nav>
  );
};

// Hook implementation
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}
```

---

## Acceptance Criteria (All React Rules)

- [ ] Feature modules self-contained
- [ ] Container/Presentation pattern
- [ ] Business logic in hooks
- [ ] UI state in Zustand
- [ ] Server state in React Query
- [ ] No prop drilling (use context)
- [ ] Components memoized (where needed)
- [ ] Code splitting for heavy views
- [ ] Mobile responsive (320px+)
- [ ] Error boundaries present
- [ ] Loading states handled
- [ ] 80%+ test coverage

