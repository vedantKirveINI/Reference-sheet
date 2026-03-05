import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { ChevronRight, ChevronDown, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TypeBadge } from './TypeBadge';
import { RowProps, DataType, GridMode, TYPE_COLORS } from './types';
import { extractValue, createFxValue, countChildren, generateId } from './utils';
import { ODSFormulaBar as FormulaBar } from '@src/module/ods';

interface FieldRowProps extends RowProps {
  showTypeColumn: boolean;
}

export function FieldRow({
  field,
  index,
  depth,
  mode,
  devMode,
  isLast,
  onUpdate,
  onDelete,
  onAddChild,
  onToggleCollapse,
  collapsedIds,
  readOnly,
  showTypeColumn,
  onAddField,
  onAddFieldWithoutFocus,
  shouldFocus = false,
  onFocusComplete,
  parentType,
  valueCellMode = "formula",
  variables,
}: FieldRowProps) {
  const [localKey, setLocalKey] = useState(field.key);
  const [localValue, setLocalValue] = useState(extractValue(field));
  const [userHasTypedKey, setUserHasTypedKey] = useState(false);
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const isNested = field.type === 'Object' || field.type === 'Array';
  const isCollapsed = collapsedIds.has(field.id);
  const childCount = countChildren(field);
  const colors = TYPE_COLORS[field.type];
  const hideKeyColumn = parentType === 'Array';

  const isTypingKeyRef = useRef(false);
  const isTypingValueRef = useRef(false);
  const focusCleanupRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isTypingKeyRef.current) {
      setLocalKey(field.key);
    }
    if (!isTypingValueRef.current) {
      setLocalValue(extractValue(field));
    }
  }, [field]);

  useEffect(() => {
    if (shouldFocus && keyInputRef.current && !readOnly) {
      const rafId = requestAnimationFrame(() => {
        focusCleanupRef.current = window.setTimeout(() => {
          if (keyInputRef.current) {
            keyInputRef.current.focus();
          }
          onFocusComplete?.();
          focusCleanupRef.current = null;
        }, 10);
      });

      return () => {
        cancelAnimationFrame(rafId);
        if (focusCleanupRef.current !== null) {
          clearTimeout(focusCleanupRef.current);
          focusCleanupRef.current = null;
        }
      };
    }
  }, [shouldFocus, readOnly, onFocusComplete]);

  const handleKeyChange = useCallback((value: string) => {
    isTypingKeyRef.current = true;
    setLocalKey(value);
    setUserHasTypedKey(true);
  }, []);

  const handleKeyBlur = useCallback(() => {
    isTypingKeyRef.current = false;
    if (localKey !== field.key) {
      onUpdate(field.id, { key: localKey });
    }

    if (userHasTypedKey && isLast && !readOnly && localKey.trim() !== '') {
      if (onAddFieldWithoutFocus) {
        setTimeout(() => {
          onAddFieldWithoutFocus();
        }, 0);
      } else if (onAddField) {
        setTimeout(() => {
          onAddField();
        }, 0);
      }
    }
  }, [localKey, field.key, field.id, userHasTypedKey, isLast, readOnly, onUpdate, onAddFieldWithoutFocus, onAddField]);

  const handleValueChange = useCallback((value: string) => {
    isTypingValueRef.current = true;

    let processedValue = value;
    if (field.type === 'Number' || field.type === 'Int') {
      const numericValue = value.replace(/[^0-9.-]/g, '');
      if (field.type === 'Int') {
        processedValue = numericValue.replace(/\./g, '');
      } else {
        processedValue = numericValue;
      }
    }
    setLocalValue(processedValue);
  }, [field.type]);

  const handleValueBlur = useCallback(() => {
    isTypingValueRef.current = false;

    const currentValue = extractValue(field);
    if (localValue !== currentValue) {
      const valueKey = field.isValueMode ? 'value' : 'default';
      onUpdate(field.id, { [valueKey]: createFxValue(localValue) });
    }
  }, [field, localValue, onUpdate]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, nextRef?: React.RefObject<HTMLInputElement | null>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef?.current) {
        nextRef.current.focus();
      } else {
        (e.target as HTMLInputElement).blur();
      }
    }
    if (e.key === 'Tab') {
      // Save key immediately when Tab is pressed, before moving focus
      // This prevents the key from being lost when a new row is added
      if (localKey !== field.key) {
        onUpdate(field.id, { key: localKey });
      }
    }
    if (e.key === 'Escape') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleTypeChange = useCallback((newType: DataType) => {
    const updates: Partial<typeof field> = { type: newType };
    if (newType === 'Object' || newType === 'Array') {
      const existingSchema = field.schema || [];
      if (existingSchema.length === 0) {
        const emptyChild = {
          id: generateId(),
          key: '',
          type: 'String' as DataType,
          isValueMode: field.isValueMode,
          isMap: false,
        };
        updates.schema = [emptyChild];
      }
    }
    onUpdate(field.id, updates);
  }, [field.id, field.schema, field.isValueMode, onUpdate]);

  const getValuePlaceholder = (): string => {
    switch (field.type) {
      case 'String': return 'Enter text...';
      case 'Number': return '0.00';
      case 'Int': return '0';
      case 'Boolean': return 'true or false';
      default: return 'Enter value...';
    }
  };

  const renderBooleanInput = () => (
    <div className="flex gap-1">
      <Button
        variant={localValue === 'true' ? 'default' : 'outline'}
        size="sm"
        className="h-8 px-3"
        onClick={(e) => {
          e.stopPropagation();
          setLocalValue('true');
          const valueKey = field.isValueMode ? 'value' : 'default';
          onUpdate(field.id, { [valueKey]: createFxValue('true') });
        }}
        disabled={readOnly}
        data-testid={`input-value-${index}-true`}
      >
        Yes
      </Button>
      <Button
        variant={localValue === 'false' ? 'default' : 'outline'}
        size="sm"
        className="h-8 px-3"
        onClick={(e) => {
          e.stopPropagation();
          setLocalValue('false');
          const valueKey = field.isValueMode ? 'value' : 'default';
          onUpdate(field.id, { [valueKey]: createFxValue('false') });
        }}
        disabled={readOnly}
        data-testid={`input-value-${index}-false`}
      >
        No
      </Button>
    </div>
  );

  return (
    <div
      className={cn(
        'grid gap-2 items-center py-2 px-3 group',
        'border-b border-border/50 last:border-b-0',
        'hover:bg-muted/30 transition-colors'
      )}
      style={{
        gridTemplateColumns: showTypeColumn
          ? '4rem 1fr 1fr 2rem'
          : '1fr 1fr 2rem',
      }}
      data-testid={`field-row-${index}`}
    >
      {showTypeColumn && (
        <div className="flex items-center gap-1 min-w-0">
          {isNested && onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(field.id);
              }}
              data-testid={`toggle-collapse-${index}`}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          )}
          <TypeBadge
            type={field.type}
            devMode={devMode}
            onChange={mode === 'schema' ? handleTypeChange : undefined}
            readOnly={readOnly || mode !== 'schema'}
            showDropdown={mode === 'schema'}
          />
        </div>
      )}

      {/* Key input with tree indentation inside the cell */}
      {hideKeyColumn ? null : (
        <div
          className="flex items-center min-w-0"
          style={{ paddingLeft: depth > 0 ? `${depth * 16}px` : undefined }}
        >
          <Input
            ref={keyInputRef}
            value={localKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            onBlur={handleKeyBlur}
            onKeyDown={(e) => handleKeyDown(e, valueInputRef)}
            placeholder="Field name"
            disabled={readOnly}
            className="h-8 w-full"
            data-testid={`input-key-${index}`}
          />
        </div>
      )}

      {isNested ? (
        <div
          className="flex items-center gap-2"
          style={hideKeyColumn ? { gridColumn: 'span 2' } : undefined}
        >
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
              colors.bg,
              colors.text,
              colors.border
            )}
          >
            {`{${childCount}}`}
          </span>
          {!readOnly && onAddChild && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild(field.id);
              }}
              data-testid={`add-child-${index}`}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
          )}
        </div>
      ) : field.type === 'Boolean' ? (
        <div style={hideKeyColumn ? { gridColumn: 'span 2' } : undefined}>
          {renderBooleanInput()}
        </div>
      ) : valueCellMode === "formula" && variables ? (
        <div className="h-8 min-w-0" style={hideKeyColumn ? { gridColumn: 'span 2' } : undefined}>
          <FormulaBar
            variables={variables}
            wrapContent={false}
            placeholder={getValuePlaceholder()}
            defaultInputContent={field.value?.blocks || field.default?.blocks || []}
            onInputContentChanged={(blocks) => {
              const valueKey = field.isValueMode ? 'value' : 'default';
              const blockStr = (blocks || []).map((b: { text?: string; value?: string }) => b.text ?? b.value ?? '').join('');
              onUpdate(field.id, { [valueKey]: { type: 'fx', blocks: blocks || [], blockStr } });
            }}
            inputMode="formula"
            allowFormulaExpansion={false}
            singleSelect
            showAIFixInput={false}
            slotProps={{
              container: {
                className: "h-8 rounded-md border border-border/40 bg-background text-sm",
              },
            }}
          />
        </div>
      ) : (
        <Input
          ref={valueInputRef}
          value={localValue}
          onChange={(e) => handleValueChange(e.target.value)}
          onBlur={handleValueBlur}
          onKeyDown={(e) => handleKeyDown(e)}
          placeholder={getValuePlaceholder()}
          disabled={readOnly}
          className="h-8"
          style={hideKeyColumn ? { gridColumn: 'span 2' } : undefined}
          type={field.type === 'Number' || field.type === 'Int' ? 'text' : 'text'}
          inputMode={field.type === 'Number' || field.type === 'Int' ? 'numeric' : 'text'}
          data-testid={`input-value-${index}`}
        />
      )}

      <div className="w-8 flex items-center justify-end flex-shrink-0">
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(field.id);
            }}
            data-testid={`delete-row-${index}`}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

