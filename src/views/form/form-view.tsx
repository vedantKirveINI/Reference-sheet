import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ITableData, IRecord, IColumn, CellType, ICell } from '@/types';
import { ChevronLeft, ChevronRight, Plus, Star } from 'lucide-react';

interface FormViewProps {
  data: ITableData;
  onCellChange?: (recordId: string, columnId: string, value: any) => void;
  onAddRow?: () => void;
  onRecordUpdate?: (recordId: string, updatedCells: Record<string, any>) => void;
}

export function FormView({ data, onCellChange, onAddRow, onRecordUpdate: _onRecordUpdate }: FormViewProps) {
  const { t } = useTranslation(['common', 'views']);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const records = useMemo(
    () => data.records.filter(r => !r.id?.startsWith('__group__')),
    [data.records]
  );

  const selectedRecord = records[selectedIndex] ?? null;
  const primaryColumn = data.columns[0];

  const getPrimaryDisplay = useCallback((record: IRecord) => {
    if (!primaryColumn) return record.id;
    const cell = record.cells[primaryColumn.id];
    if (!cell) return record.id;
    return cell.displayData || String(cell.data ?? '') || record.id;
  }, [primaryColumn]);

  const handlePrev = useCallback(() => {
    setSelectedIndex(i => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex(i => Math.min(records.length - 1, i + 1));
  }, [records.length]);

  const handleFieldChange = useCallback((columnId: string, value: any) => {
    if (!selectedRecord) return;
    onCellChange?.(selectedRecord.id, columnId, value);
  }, [selectedRecord, onCellChange]);

  const handleAddRecord = useCallback(() => {
    onAddRow?.();
    setTimeout(() => {
      setSelectedIndex(records.length);
    }, 100);
  }, [onAddRow, records.length]);

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-border bg-background flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{t('common:records.recordDetails')}</span>
          <Button variant="ghost" size="xs" onClick={handleAddRecord}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t('common:add')}
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {records.map((record, index) => (
            <button
              key={record.id}
              onClick={() => setSelectedIndex(index)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-border/50 truncate transition-colors ${
                index === selectedIndex
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent text-foreground'
              }`}
            >
              <span className="text-xs text-muted-foreground/70 mr-2">{index + 1}</span>
              {getPrimaryDisplay(record)}
            </button>
          ))}
          {records.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground/70 text-center">{t('common:noResults')}</div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {selectedRecord ? `${t('common:records.recordDetails')} ${selectedIndex + 1} ${t('common:records.of')} ${records.length}` : t('common:noResults')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={selectedIndex <= 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('common:previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={selectedIndex >= records.length - 1}
            >
              {t('common:next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button variant="default" size="sm" onClick={handleAddRecord}>
              <Plus className="h-4 w-4 mr-1" />
              {t('common:records.newRecord')}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedRecord ? (
            <div className="max-w-2xl mx-auto space-y-4">
              {data.columns.map(column => {
                const cell = selectedRecord.cells[column.id];
                if (!cell) return null;
                return (
                  <FormField
                    key={column.id}
                    column={column}
                    cell={cell}
                    onChange={(value) => handleFieldChange(column.id, value)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg mb-2">{t('common:noResults')}</p>
                <Button onClick={handleAddRecord}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('common:records.newRecord')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  column: IColumn;
  cell: ICell;
  onChange: (value: any) => void;
}

function FormField({ column, cell, onChange }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{column.name}</label>
      <FormFieldEditor column={column} cell={cell} onChange={onChange} />
    </div>
  );
}

function FormFieldEditor({ column, cell, onChange }: FormFieldProps) {
  switch (column.type) {
    case CellType.String:
      return (
        <Input
          type="text"
          value={(cell.data as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case CellType.Number:
      return (
        <Input
          type="number"
          value={(cell.data as number) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );

    case CellType.SCQ:
    case CellType.DropDown: {
      const options: string[] = ('options' in cell && cell.options && 'options' in cell.options)
        ? (cell.options.options as any[]).map((o: any) => typeof o === 'string' ? o : o.label)
        : [];
      return (
        <select
          value={(cell.data as string) ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">{t('common:search')}...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    case CellType.MCQ: {
      const mcqOptions: string[] = ('options' in cell && cell.options && 'options' in cell.options)
        ? (cell.options.options as string[])
        : [];
      const selected: string[] = Array.isArray(cell.data) ? (cell.data as string[]) : [];
      const toggle = (opt: string) => {
        if (selected.includes(opt)) {
          onChange(selected.filter(v => v !== opt));
        } else {
          onChange([...selected, opt]);
        }
      };
      return (
        <div className="space-y-1">
          {mcqOptions.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    case CellType.YesNo: {
      const isYes = cell.data === 'Yes';
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={isYes}
            onCheckedChange={(checked) => onChange(checked ? 'Yes' : 'No')}
          />
          <span className="text-sm text-muted-foreground">{isYes ? 'Yes' : 'No'}</span>
        </div>
      );
    }

    case CellType.DateTime:
      return (
        <Input
          type="datetime-local"
          value={cell.data ? new Date(cell.data as string).toISOString().slice(0, 16) : ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );

    case CellType.Rating: {
      const maxRating = ('options' in cell && cell.options && 'maxRating' in (cell.options as any))
        ? ((cell.options as any).maxRating ?? 5) : 5;
      const current = typeof cell.data === 'number' ? cell.data : 0;
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: maxRating }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(current === i + 1 ? 0 : i + 1)}
              className="text-xl hover:scale-110 transition-transform"
            >
              <Star
                className={`h-5 w-5 ${i < current ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/50'}`}
              />
            </button>
          ))}
        </div>
      );
    }

    case CellType.Slider: {
      const sliderVal = typeof cell.data === 'number' ? cell.data : 0;
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVal}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium w-10 text-right text-foreground">{sliderVal}%</span>
        </div>
      );
    }

    default:
      return (
        <Input
          type="text"
          value={cell.displayData ?? String(cell.data ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
