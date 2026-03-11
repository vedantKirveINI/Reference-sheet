import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GridMode } from './types';

interface GridHeaderProps {
  mode: GridMode;
  devMode: boolean;
  onAddField: () => void;
  fieldCount: number;
  readOnly: boolean;
  showTypeColumn: boolean;
}

export function GridHeader({
  mode,
  devMode,
  onAddField,
  fieldCount,
  readOnly,
  showTypeColumn,
}: GridHeaderProps) {
  const typeLabel = devMode ? 'Type' : 'Format';
  const keyLabel = 'Name';
  const valueLabel = devMode ? 'Value' : 'Example';

  return (
    <div
      className="grid gap-2 items-center py-2 px-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide"
      style={{
        gridTemplateColumns: showTypeColumn
          ? '4rem 1fr 1fr 2rem'
          : '1fr 1fr 2rem',
      }}
    >
      {showTypeColumn && <div>{typeLabel}</div>}
      <div>{keyLabel}</div>
      <div className="flex items-center justify-between">
        <span>{valueLabel}</span>
        <span className="text-xs font-normal normal-case">
          {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
        </span>
      </div>
      <div className="flex justify-end">
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onAddField();
            }}
            data-testid="header-add-button"
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

