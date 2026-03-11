import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { InputGridProps, FieldData, DataType, GridMode } from './types';
import { createEmptyField, convertJsonToFields, parseCSVToFields, normalizeInput, wrapOutput, NormalizeResult } from './utils';
import { FieldRow } from './FieldRow';
import { GridHeader } from './GridHeader';
import { EmptyState } from './EmptyState';
import { DropZone } from './DropZone';

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  return keysA.every(key => deepEqual(a[key], b[key]));
}

export interface InputGridHandle {
  getValue: () => FieldData[];
  getFields: () => FieldData[];
  setJsonData: (json: unknown) => void;
  updateGrid: (data: FieldData[]) => void;
}

function InputGridComponent(
  {
    mode = 'schema',
    devMode = false,
    initialValue = [],
    onChange,
    readOnly = false,
    className,
    valueCellMode = 'formula',
    variables,
  }: InputGridProps,
  ref: React.Ref<InputGridHandle>
) {
  const showTypeColumn = mode === 'schema';

  const [fields, setFields] = useState<FieldData[]>(() => {
    if (initialValue.length > 0) {
      const result = normalizeInput(initialValue);
      return result.fields;
    }
    return [];
  });
  const [rootIsValueMode, setRootIsValueMode] = useState<boolean>(() => {
    if (initialValue.length > 0) {
      const result = normalizeInput(initialValue);
      return result.rootIsValueMode;
    }
    return false;
  });
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [newlyAddedFieldId, setNewlyAddedFieldId] = useState<string | null>(null);
  const prevInitialValueRef = useRef<FieldData[]>(initialValue);
  const isInitializedRef = useRef(false);
  const hasUserEditedRef = useRef(false);
  const fieldsRef = useRef<FieldData[]>(fields);

  // Keep fieldsRef in sync with fields state
  useEffect(() => {
    fieldsRef.current = fields;
  }, [fields]);

  useEffect(() => {
    // Skip on first mount - already initialized in useState
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      return;
    }

    // Skip if user has made edits - don't overwrite their changes
    if (hasUserEditedRef.current) {
      if (devMode) console.log('[InputGrid] useEffect skipped - user has edited');
      return;
    }

    // Only update if initialValue actually changed (deep comparison)
    if (initialValue.length > 0 && !deepEqual(initialValue, prevInitialValueRef.current)) {
      if (devMode) console.log('[InputGrid] useEffect - initialValue changed, updating fields');
      const result = normalizeInput(initialValue);
      // Update ref immediately to keep in sync with state
      fieldsRef.current = result.fields;
      setFields(result.fields);
      setRootIsValueMode(result.rootIsValueMode);
      prevInitialValueRef.current = initialValue;
    }
  }, [initialValue, devMode]);

  const notifyChange = useCallback((newFields: FieldData[], isUserEdit = true) => {
    if (isUserEdit) {
      hasUserEditedRef.current = true;
    }
    // Update ref immediately so other callbacks have access to latest state
    fieldsRef.current = newFields;
    setFields(newFields);
    onChange?.(wrapOutput(newFields, rootIsValueMode));
  }, [onChange, rootIsValueMode]);

  const handleAddField = useCallback(() => {
    const newField = createEmptyField(false, 'String');
    setNewlyAddedFieldId(newField.id);
    // Use fieldsRef.current to avoid stale closure issues
    notifyChange([...fieldsRef.current, newField]);
  }, [notifyChange]);

  const handleAddFieldWithoutFocus = useCallback(() => {
    const newField = createEmptyField(false, 'String');
    // Don't set newlyAddedFieldId, so no auto-focus
    // Use fieldsRef.current to avoid stale closure issues
    notifyChange([...fieldsRef.current, newField]);
  }, [notifyChange]);

  const handleUpdateField = useCallback((id: string, updates: Partial<FieldData>) => {
    // Use fieldsRef.current to avoid stale closure issues
    const currentFields = fieldsRef.current;

    const updateRecursive = (fieldList: FieldData[]): FieldData[] => {
      return fieldList.map((field) => {
        if (field.id === id) {
          return { ...field, ...updates };
        }
        if (field.schema) {
          return { ...field, schema: updateRecursive(field.schema) };
        }
        return field;
      });
    };
    const newFields = updateRecursive(currentFields);
    notifyChange(newFields);
  }, [notifyChange]);

  const handleDeleteField = useCallback((id: string) => {
    // Use fieldsRef.current to avoid stale closure issues
    const currentFields = fieldsRef.current;
    const deleteRecursive = (fieldList: FieldData[]): FieldData[] => {
      return fieldList
        .filter((field) => field.id !== id)
        .map((field) => {
          if (field.schema) {
            return { ...field, schema: deleteRecursive(field.schema) };
          }
          return field;
        });
    };
    notifyChange(deleteRecursive(currentFields));
  }, [notifyChange]);

  const handleAddChild = useCallback((parentId: string) => {
    // Use fieldsRef.current to avoid stale closure issues
    const currentFields = fieldsRef.current;
    const newChild = createEmptyField(false, 'String');

    const addChildRecursive = (fieldList: FieldData[]): FieldData[] => {
      return fieldList.map((field) => {
        if (field.id === parentId) {
          const currentSchema = field.schema || [];
          return { ...field, schema: [...currentSchema, newChild] };
        }
        if (field.schema) {
          return { ...field, schema: addChildRecursive(field.schema) };
        }
        return field;
      });
    };

    notifyChange(addChildRecursive(currentFields));
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      next.delete(parentId);
      return next;
    });
  }, [notifyChange]);

  const handleToggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleJsonImport = useCallback((json: unknown) => {
    const importedFields = convertJsonToFields(json, false);
    notifyChange(importedFields);
  }, [notifyChange]);

  const handleCsvImport = useCallback((csvText: string) => {
    const importedFields = parseCSVToFields(csvText, false);
    notifyChange(importedFields);
  }, [notifyChange]);

  useImperativeHandle(ref, () => ({
    getValue: () => wrapOutput(fields, rootIsValueMode),
    getFields: () => fields,
    setJsonData: (json: unknown) => {
      // Programmatic update - don't mark as user edit
      const importedFields = convertJsonToFields(json, false);
      notifyChange(importedFields, false);
    },
    updateGrid: (data: FieldData[]) => {
      // Programmatic update - don't mark as user edit
      const result = normalizeInput(data);
      // Update ref immediately to keep in sync with state
      fieldsRef.current = result.fields;
      setFields(result.fields);
      setRootIsValueMode(result.rootIsValueMode);
      onChange?.(wrapOutput(result.fields, result.rootIsValueMode));
    },
  }), [fields, rootIsValueMode, notifyChange, onChange]);

  const renderField = (field: FieldData, index: number, depth: number, isLastInList: boolean, parentType?: DataType): React.ReactNode => {
    const isCollapsed = collapsedIds.has(field.id);
    const isNested = field.type === 'Object' || field.type === 'Array';

    return (
      <div>
        <FieldRow
          field={field}
          index={index}
          depth={depth}
          mode={mode}
          devMode={devMode}
          isLast={isLastInList}
          onUpdate={handleUpdateField}
          onDelete={handleDeleteField}
          onAddChild={isNested ? handleAddChild : undefined}
          onToggleCollapse={isNested ? handleToggleCollapse : undefined}
          collapsedIds={collapsedIds}
          readOnly={readOnly}
          showTypeColumn={showTypeColumn}
          onAddField={depth === 0 ? handleAddField : undefined}
          onAddFieldWithoutFocus={depth === 0 ? handleAddFieldWithoutFocus : undefined}
          shouldFocus={field.id === newlyAddedFieldId}
          onFocusComplete={depth === 0 ? () => setNewlyAddedFieldId(null) : undefined}
          parentType={parentType}
          valueCellMode={valueCellMode}
          variables={variables}
        />
        {isNested && !isCollapsed && field.schema && field.schema.length > 0 && (
          <div className="relative ml-6">
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-primary/30"
              style={{ marginLeft: '-12px' }}
            />
            {field.schema.map((child, childIndex) => (
              <div key={child.id} className="relative">
                <div
                  className="absolute left-0 top-1/2 h-px w-3 bg-primary/30"
                  style={{ marginLeft: '-12px' }}
                />
                {renderField(child, childIndex, depth + 1, childIndex === field.schema!.length - 1, field.type)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFields = (fieldList: FieldData[]): React.ReactNode => {
    return (
      <>
        {fieldList.map((field, index) => (
          <React.Fragment key={field.id}>
            {renderField(field, index, 0, index === fieldList.length - 1, undefined)}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <TooltipProvider>
      <DropZone
        onJsonImport={handleJsonImport}
        onCsvImport={handleCsvImport}
        className={cn('w-full', className)}
      >
        <Card className="overflow-hidden shadow-md border-border/60" data-testid="input-grid-container">
          <GridHeader
            mode={mode}
            devMode={devMode}
            onAddField={handleAddField}
            fieldCount={fields.length}
            readOnly={readOnly}
            showTypeColumn={showTypeColumn}
          />

          <div className="min-h-[100px]">
            {fields.length === 0 ? (
              <EmptyState mode={mode} onAddField={handleAddField} readOnly={readOnly} />
            ) : (
              renderFields(fields)
            )}
          </div>
        </Card>
      </DropZone>
    </TooltipProvider>
  );
}

export const InputGrid = forwardRef<InputGridHandle, InputGridProps>(InputGridComponent);

