# React Component & Hook Structure Rules
**CURSOR: TECH-REACT-STRUCT-001 through TECH-REACT-STRUCT-003**

## TECH-REACT-STRUCT-001: Component Structure & Ordering (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `frontend/apps/web/src/features/*/components/`

### Purpose
Enforce consistent React component structure and import ordering for readability, maintainability, and predictability.

### Strict Component Creation Order (MANDATORY)

```typescript
// CURSOR: TECH-REACT-STRUCT-001 - Component Structure

// ===================================
// 1️⃣ IMPORTS (Logical Groups)
// ===================================

// React & Framework imports
import React, { useState, useCallback, useMemo, CSSProperties } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

// Redux/State Management
import { useDispatch, useSelector } from 'react-redux';
import { useUIStore } from '@/store/ui.store';

// OUTE-DS Components
import { Button, Dialog, TextField } from '@oute/oute-ds.*';
import { Tooltip } from '@oute/oute-ds-tooltip';

// Internal Components (relative imports)
import { RecordForm } from './RecordForm';
import { RecordList } from './RecordList';

// Custom Hooks
import { useRecord } from '../hooks/useRecord';
import { useRecordForm } from '../hooks/useRecordForm';
import { useUndoRedo } from '../hooks/useUndoRedo';

// Utils
import { formatDate } from '@/utils/date';
import { validateEmail } from '@/utils/validation';

// Types
import { Record, Field } from '@/types';

// Styles (last import)
import styles from './RecordDetail.module.scss';

// ===================================
// 2️⃣ TYPE DEFINITIONS (Optional)
// ===================================

interface RecordDetailProps {
  recordId: string;
  onSave?: (record: Record) => void;
  isReadOnly?: boolean;
}

interface RecordDetailState {
  isEditing: boolean;
  hasChanges: boolean;
}

// ===================================
// 3️⃣ COMPONENT DECLARATION
// ===================================

export const RecordDetail = (props: RecordDetailProps) => {
  // ===================================
  // 4️⃣ PROPS DESTRUCTURING
  // ===================================
  
  const { recordId, onSave, isReadOnly = false } = props;
  
  // ===================================
  // 5️⃣ ROUTE PARAMS (if applicable)
  // ===================================
  
  const { baseId } = useParams<{ baseId: string }>();
  
  // ===================================
  // 6️⃣ REDUX/STORE SELECTORS
  // ===================================
  
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const selectedRecordId = useUIStore(state => state.selectedRecordId);
  const selectRecord = useUIStore(state => state.selectRecord);
  
  // ===================================
  // 7️⃣ CUSTOM HOOK (Main Logic)
  // ===================================
  
  const {
    record,
    isLoading,
    error,
    updateRecord,
    deleteRecord,
    isUpdating,
  } = useRecord(recordId);
  
  const {
    formData,
    formErrors,
    isDirty,
    setFormData,
    resetForm,
    validateForm,
  } = useRecordForm(record);
  
  const {
    canUndo,
    canRedo,
    undo,
    redo,
    push,
  } = useUndoRedo();
  
  // ===================================
  // 8️⃣ LOCAL STATE
  // ===================================
  
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // ===================================
  // 9️⃣ REACT QUERY (Data Fetching)
  // ===================================
  
  const { data: fields } = useQuery(['fields', baseId], () =>
    api.getFields(baseId),
    { staleTime: 5 * 60 * 1000 }
  );
  
  const saveMutation = useMutation(
    (data: Record) => api.updateRecord(recordId, data),
    {
      onSuccess: (savedRecord) => {
        selectRecord(savedRecord.id);
        onSave?.(savedRecord);
      },
    }
  );
  
  // ===================================
  // 🔟 EARLY RETURN GUARDS
  // ===================================
  
  // Guard 1: Invalid ID
  if (!recordId) {
    return <div className={styles.error}>Invalid record ID</div>;
  }
  
  // Guard 2: Loading state
  if (isLoading) {
    return <Skeleton variant="rectangular" height={400} />;
  }
  
  // Guard 3: Error state
  if (error) {
    return (
      <div className={styles.error}>
        <p>Failed to load record: {error.message}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  // Guard 4: Not found
  if (!record) {
    return <div className={styles.notFound}>Record not found</div>;
  }
  
  // ===================================
  // 1️⃣1️⃣ DERIVED/COMPUTED VALUES
  // ===================================
  
  const isOwnedByUser = record.createdBy === user?.id;
  const canEdit = !isReadOnly && isOwnedByUser;
  const hasPermission = user?.role === 'admin' || canEdit;
  
  // ===================================
  // 1️⃣2️⃣ MEMOIZED COMPUTATIONS
  // ===================================
  
  const fieldMap = useMemo(
    () => new Map(fields?.map(f => [f.id, f])),
    [fields]
  );
  
  const sortedFields = useMemo(
    () => Array.from(fieldMap.values()).sort((a, b) => a.order - b.order),
    [fieldMap]
  );
  
  // ===================================
  // 1️⃣3️⃣ EVENT HANDLERS
  // ===================================
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      resetForm();
    }
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    push(formData);  // Add to undo/redo stack
    await saveMutation.mutateAsync(formData);
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      await deleteRecord();
      selectRecord(null);
    }
  };
  
  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };
  
  // ===================================
  // 1️⃣4️⃣ MEMOIZED CALLBACKS
  // ===================================
  
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  }, [setFormData]);
  
  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  }, [handleSave]);
  
  // ===================================
  // 1️⃣5️⃣ EFFECTS (Side Effects)
  // ===================================
  
  // Effect 1: Sync record data to form when record changes
  React.useEffect(() => {
    if (record && !isEditing) {
      setFormData(record);
    }
  }, [record, isEditing, setFormData]);
  
  // Effect 2: Select current record when component mounts
  React.useEffect(() => {
    selectRecord(recordId);
  }, [recordId, selectRecord]);
  
  // Effect 3: Prevent unsaved changes
  React.useEffect(() => {
    if (isDirty && isEditing) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isDirty, isEditing]);
  
  // ===================================
  // 1️⃣6️⃣ FINAL JSX RETURN
  // ===================================
  
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{record.name}</h1>
        
        {canEdit && (
          <div className={styles.toolbar}>
            <Button
              variant={isEditing ? 'contained' : 'outlined'}
              onClick={handleEditToggle}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            
            {isEditing && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={isUpdating || !isDirty}
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </Button>
            )}
            
            <Tooltip title="Undo">
              <Button
                variant="outlined"
                disabled={!canUndo}
                onClick={undo}
              >
                ↶
              </Button>
            </Tooltip>
            
            <Tooltip title="Redo">
              <Button
                variant="outlined"
                disabled={!canRedo}
                onClick={redo}
              >
                ↷
              </Button>
            </Tooltip>
            
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        )}
      </header>
      
      <form onSubmit={handleFormSubmit} className={styles.form}>
        {sortedFields.map(field => (
          <div key={field.id} className={styles.field}>
            <label>{field.name}</label>
            <TextField
              value={formData[field.id] ?? ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              error={!!formErrors[field.id]}
              helperText={formErrors[field.id]}
              disabled={!isEditing || isUpdating}
              fullWidth
            />
          </div>
        ))}
      </form>
    </div>
  );
};

export default RecordDetail;
```

---

## TECH-REACT-STRUCT-002: Custom Hook Structure & Ordering (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `frontend/apps/web/src/features/*/hooks/`

### Strict Hook Creation Order (MANDATORY)

```typescript
// CURSOR: TECH-REACT-STRUCT-002 - Custom Hook Structure

// ===================================
// 1️⃣ IMPORTS
// ===================================

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

// Utils & API
import { api } from '@/api';
import { logger } from '@/utils/logger';

// Types
import { Record, Field, ValidationError } from '@/types';

// ===================================
// 2️⃣ TYPE DEFINITIONS (Optional)
// ===================================

interface UseRecordOptions {
  recordId: string;
  autoSave?: boolean;
  onSave?: (record: Record) => void;
}

interface UseRecordReturn {
  record: Record | null;
  isLoading: boolean;
  error: Error | null;
  updateRecord: (data: Partial<Record>) => Promise<Record>;
  deleteRecord: () => Promise<void>;
  isUpdating: boolean;
}

// ===================================
// 3️⃣ HOOK DECLARATION
// ===================================

export const useRecord = (options: UseRecordOptions): UseRecordReturn => {
  const { recordId, autoSave = false, onSave } = options;
  
  // ===================================
  // 4️⃣ ROUTER & i18n (if needed)
  // ===================================
  
  const router = useRouter();
  // const { t } = useTranslation(); // if using i18n
  
  // ===================================
  // 5️⃣ REDUX HOOKS
  // ===================================
  
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  // ===================================
  // 6️⃣ LOCAL STATE
  // ===================================
  
  const [error, setError] = useState<Error | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  
  // ===================================
  // 7️⃣ REACT QUERY (Data Fetching)
  // ===================================
  
  const queryClient = useQueryClient();
  
  const {
    data: record,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery(
    ['record', recordId],
    () => api.getRecord(recordId),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      enabled: !!recordId,
      onError: (err) => {
        logger.error('Failed to fetch record', err);
        setError(err as Error);
      },
    }
  );
  
  const updateMutation = useMutation(
    (data: Partial<Record>) => api.updateRecord(recordId, data),
    {
      onSuccess: (updatedRecord) => {
        queryClient.setQueryData(['record', recordId], updatedRecord);
        onSave?.(updatedRecord);
      },
      onError: (err) => {
        logger.error('Failed to update record', err);
        setError(err as Error);
      },
    }
  );
  
  const deleteMutation = useMutation(
    () => api.deleteRecord(recordId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['records']);
      },
      onError: (err) => {
        logger.error('Failed to delete record', err);
        setError(err as Error);
      },
    }
  );
  
  // ===================================
  // 8️⃣ DERIVED VALUES
  // ===================================
  
  const isUpdating = updateMutation.isLoading || deleteMutation.isLoading;
  const finalError = error || queryError;
  
  // ===================================
  // 9️⃣ MEMOIZATION (if needed)
  // ===================================
  
  const recordStats = useMemo(() => ({
    fieldsCount: Object.keys(record?.cellValues || {}).length,
    lastModified: record?.updatedAt,
  }), [record]);
  
  // ===================================
  // 🔟 INTERNAL FUNCTIONS
  // ===================================
  
  const handleAutoSave = async (data: Partial<Record>) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await updateMutation.mutateAsync(data);
      } catch (err) {
        logger.error('Auto-save failed', err);
      }
    }, 1000);
  };
  
  // ===================================
  // 1️⃣1️⃣ MEMOIZED CALLBACKS
  // ===================================
  
  const updateRecord = useCallback(
    async (data: Partial<Record>) => {
      if (autoSave) {
        handleAutoSave(data);
        return record || {};
      }
      
      return updateMutation.mutateAsync(data);
    },
    [record, autoSave, updateMutation]
  );
  
  const deleteRecord = useCallback(
    () => deleteMutation.mutateAsync(),
    [deleteMutation]
  );
  
  // ===================================
  // 1️⃣2️⃣ EFFECTS
  // ===================================
  
  // Effect 1: Refetch when recordId changes
  useEffect(() => {
    if (recordId) {
      refetch();
    }
  }, [recordId, refetch]);
  
  // Effect 2: Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);
  
  // ===================================
  // 1️⃣3️⃣ RETURN
  // ===================================
  
  return {
    record: record || null,
    isLoading,
    error: finalError,
    updateRecord,
    deleteRecord,
    isUpdating,
  };
};
```

---

## TECH-REACT-STRUCT-003: Best Practices & Conventions (HIGH)
**Priority:** HIGH | Status: Baseline

### Mandatory Best Practices

1. **Always Use Functional Components**
   ```typescript
   // ✅ GOOD
   export const MyComponent = (props: MyProps) => {
     // component logic
     return <div>Content</div>;
   };
   
   // ❌ BAD
   class MyComponent extends React.Component {
     // class component
   }
   ```

2. **Props Destructuring**
   ```typescript
   // ✅ GOOD - Destructure in function args
   export const MyComponent = ({ id, name, onSave }: Props) => {
     // use id, name, onSave directly
   };
   
   // ✅ ALSO GOOD - Destructure in body
   export const MyComponent = (props: Props) => {
     const { id, name, onSave } = props;
   };
   
   // ❌ BAD - Don't spread or use props.x repeatedly
   export const MyComponent = (props) => {
     return <div>{props.id}{props.name}</div>;
   };
   ```

3. **Use Early Returns for Guards**
   ```typescript
   // ✅ GOOD - Early returns
   export const MyComponent = ({ id }: Props) => {
     if (!id) return null;
     
     const { data, isLoading } = useQuery(...);
     if (isLoading) return <Loader />;
     if (!data) return <Empty />;
     
     return <div>{/* content */}</div>;
   };
   
   // ❌ BAD - Nested conditionals
   export const MyComponent = ({ id }: Props) => {
     if (id) {
       if (isLoading) {
         return <Loader />;
       }
       if (data) {
         return <div>{/* content */}</div>;
       }
     }
   };
   ```

4. **Encapsulate Logic in Custom Hooks**
   ```typescript
   // ✅ GOOD - Custom hook handles logic
   export const MyComponent = () => {
     const { data, isLoading, handleSave } = useMyData();
     return <div onClick={handleSave}>{data}</div>;
   };
   
   // ❌ BAD - Logic scattered in component
   export const MyComponent = () => {
     const [data, setData] = useState();
     useEffect(() => { /* fetch */ }, []);
     const handleSave = () => { /* save */ };
     return <div onClick={handleSave}>{data}</div>;
   };
   ```

5. **React Query for Data Fetching**
   ```typescript
   // ✅ GOOD - Use React Query
   const { data, isLoading, error } = useQuery(
     ['resource', id],
     () => api.getResource(id),
     { staleTime: 5 * 60 * 1000 }
   );
   
   // ❌ BAD - useState + useEffect
   const [data, setData] = useState();
   useEffect(() => {
     api.getResource(id).then(setData);
   }, [id]);
   ```

6. **Memoize Callbacks and Computations**
   ```typescript
   // ✅ GOOD - Memoize expensive computations
   const sorted = useMemo(
     () => items.sort((a, b) => a.name.localeCompare(b.name)),
     [items]
   );
   
   const handleClick = useCallback(() => {
     doSomething(data);
   }, [data]);
   
   // ❌ BAD - Re-create on every render
   const sorted = items.sort(...);
   const handleClick = () => { doSomething(data); };
   ```

7. **Proper Hook Dependency Arrays**
   ```typescript
   // ✅ GOOD - Include all dependencies
   useEffect(() => {
     doSomething(user, selectedId);
   }, [user, selectedId]);
   
   // ❌ BAD - Missing dependencies
   useEffect(() => {
     doSomething(user, selectedId);
   }, []);
   ```

8. **Separate Container & Presentation**
   ```typescript
   // ✅ GOOD - Container (smart) handles logic
   export const RecordDetailContainer = ({ recordId }: Props) => {
     const { record, isLoading, updateRecord } = useRecord(recordId);
     
     return (
       <RecordDetailView
         record={record}
         isLoading={isLoading}
         onSave={updateRecord}
       />
     );
   };
   
   // ✅ Presentation (dumb) just renders
   export const RecordDetailView = ({
     record,
     isLoading,
     onSave,
   }: Props) => {
     if (isLoading) return <Loader />;
     return <form>{/* JSX */}</form>;
   };
   
   // ❌ BAD - Mix logic and rendering
   export const RecordDetail = ({ recordId }) => {
     const { record, isLoading } = useRecord(recordId);
     if (isLoading) return <Loader />;
     const handleSave = () => { /* logic */ };
     return <form>{/* JSX */}</form>;
   };
   ```

9. **Type All Props and Returns**
   ```typescript
   // ✅ GOOD - Typed props and return
   interface MyComponentProps {
     id: string;
     name: string;
     onSave: (data: Record) => Promise<void>;
   }
   
   export const MyComponent = (props: MyComponentProps): JSX.Element => {
     return <div />;
   };
   
   // ❌ BAD - No types or using any
   export const MyComponent = (props: any) => {
     return <div />;
   };
   ```

10. **Error Handling in Hooks**
    ```typescript
    // ✅ GOOD - Explicit error states
    const {
      data,
      isLoading,
      error,
    } = useQuery(['resource'], api.getResource, {
      onError: (err) => logger.error('Failed', err),
    });
    
    if (error) return <ErrorMessage error={error} />;
    
    // ❌ BAD - Ignore errors
    const { data } = useQuery(['resource'], api.getResource);
    ```

---

## Component File Organization Checklist

- [ ] Component file: `ComponentName.tsx`
- [ ] Style file: `ComponentName.module.scss`
- [ ] Test file: `ComponentName.test.tsx`
- [ ] Hook file: `useComponentName.ts`
- [ ] Types file: `types.ts` (or inline in component file)
- [ ] Imports organized (React → hooks → components → utils → styles)
- [ ] Props destructured
- [ ] Early returns for guards
- [ ] Custom hooks for logic
- [ ] useMemo for expensive computations
- [ ] useCallback for event handlers
- [ ] useEffect ordered by importance
- [ ] JSX return at end
- [ ] All props typed
- [ ] Export default component

---

## Acceptance Criteria (Component & Hook Structure)

- [ ] All components follow 16-step structure order
- [ ] All hooks follow 13-step structure order
- [ ] No prop drilling (use context or store)
- [ ] All props typed
- [ ] Early returns for guards
- [ ] Custom hooks used for logic
- [ ] React Query for server data
- [ ] Zustand for UI state
- [ ] useMemo for computed values
- [ ] useCallback for handlers
- [ ] Error states handled
- [ ] Loading states shown
- [ ] No inline functions (use useCallback)
- [ ] Dependencies array complete
- [ ] 80%+ test coverage

