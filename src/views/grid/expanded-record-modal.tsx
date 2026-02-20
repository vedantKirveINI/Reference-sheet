import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { IRecord, IColumn, ICell, CellType } from '@/types';
import { Star } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = {
  [CellType.String]: 'T',
  [CellType.Number]: '#',
  [CellType.SCQ]: '◉',
  [CellType.MCQ]: '☑',
  [CellType.DropDown]: '▾',
  [CellType.YesNo]: '☐',
  [CellType.DateTime]: '📅',
  [CellType.CreatedTime]: '🔒',
  [CellType.Currency]: '$',
  [CellType.PhoneNumber]: '☎',
  [CellType.Address]: '📍',
  [CellType.Signature]: '✍',
  [CellType.Slider]: '◐',
  [CellType.FileUpload]: '📎',
  [CellType.Time]: '⏰',
  [CellType.Ranking]: '⇅',
  [CellType.Rating]: '★',
  [CellType.OpinionScale]: '⊝',
  [CellType.Formula]: 'ƒ',
  [CellType.List]: '≡',
  [CellType.Enrichment]: '✨',
};

interface ExpandedRecordModalProps {
  open: boolean;
  record: IRecord | null;
  columns: IColumn[];
  onClose: () => void;
  onSave: (recordId: string, updatedCells: Record<string, any>) => void;
}

export function ExpandedRecordModal({ open, record, columns, onClose, onSave }: ExpandedRecordModalProps) {
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  const resetEdits = useCallback(() => {
    setEditedValues({});
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      resetEdits();
      onClose();
    }
  }, [onClose, resetEdits]);

  const handleSave = useCallback(() => {
    if (!record) return;
    if (Object.keys(editedValues).length > 0) {
      onSave(record.id, editedValues);
    }
    resetEdits();
    onClose();
  }, [record, editedValues, onSave, onClose, resetEdits]);

  const handleFieldChange = useCallback((columnId: string, value: any) => {
    setEditedValues(prev => ({ ...prev, [columnId]: value }));
  }, []);

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Record Details</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-1 py-2">
          {columns.map(column => {
            const cell = record.cells[column.id];
            if (!cell) return null;
            const currentValue = editedValues[column.id] !== undefined
              ? editedValues[column.id]
              : cell.data;

            return (
              <FieldRow
                key={column.id}
                column={column}
                cell={cell}
                currentValue={currentValue}
                onChange={(value) => handleFieldChange(column.id, value)}
              />
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface FieldRowProps {
  column: IColumn;
  cell: ICell;
  currentValue: any;
  onChange: (value: any) => void;
}

function FieldRow({ column, cell, currentValue, onChange }: FieldRowProps) {
  const icon = TYPE_ICONS[column.type] || 'T';

  return (
    <div className="flex items-start gap-4 py-3 px-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 w-40 shrink-0 pt-1.5">
        <span className="text-muted-foreground text-sm">{icon}</span>
        <span className="text-sm font-medium text-muted-foreground truncate">
          {column.name}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <FieldEditor
          column={column}
          cell={cell}
          currentValue={currentValue}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

interface FieldEditorProps {
  column: IColumn;
  cell: ICell;
  currentValue: any;
  onChange: (value: any) => void;
}

function FieldEditor({ column, cell, currentValue, onChange }: FieldEditorProps) {
  switch (column.type) {
    case CellType.String:
      return (
        <input
          type="text"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.Number:
      return (
        <input
          type="number"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.SCQ:
      return <SCQEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.DropDown:
      return <DropDownEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.MCQ:
      return <MCQEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.YesNo:
      return <YesNoEditor currentValue={currentValue} onChange={onChange} />;

    case CellType.Rating:
      return <RatingEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.DateTime:
    case CellType.CreatedTime:
    case CellType.Currency:
    case CellType.PhoneNumber:
    case CellType.Address:
    case CellType.Signature:
    case CellType.Slider:
    case CellType.FileUpload:
    case CellType.Time:
    case CellType.Ranking:
    case CellType.OpinionScale:
    case CellType.Enrichment:
    case CellType.Formula:
    case CellType.List:
    case CellType.ZipCode:
    default:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-gray-50 rounded-md min-h-[36px] flex items-center">
          {cell.displayData || '—'}
        </div>
      );
  }
}

function SCQEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const options = 'options' in cell && cell.options && 'options' in cell.options
    ? (cell.options.options as string[])
    : [];

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(currentValue === opt ? null : opt)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            currentValue === opt
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function DropDownEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const options = 'options' in cell && cell.options && 'options' in cell.options
    ? (cell.options.options as (string | { id: string | number; label: string })[])
    : [];

  const getLabel = (opt: string | { id: string | number; label: string }) =>
    typeof opt === 'string' ? opt : opt.label;
  const getValue = (opt: string | { id: string | number; label: string }) =>
    typeof opt === 'string' ? opt : opt.label;

  const selectedValues = Array.isArray(currentValue) ? currentValue.map((v: any) => typeof v === 'string' ? v : v.label) : [];

  const toggleOption = (optValue: string) => {
    if (selectedValues.includes(optValue)) {
      onChange(selectedValues.filter((v: string) => v !== optValue));
    } else {
      onChange([...selectedValues, optValue]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt, i) => {
        const label = getLabel(opt);
        const value = getValue(opt);
        const isSelected = selectedValues.includes(value);
        return (
          <button
            key={i}
            onClick={() => toggleOption(value)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function MCQEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const options = 'options' in cell && cell.options && 'options' in cell.options
    ? (cell.options.options as string[])
    : [];

  const selected: string[] = Array.isArray(currentValue) ? currentValue : [];

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(v => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggleOption(opt)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function YesNoEditor({ currentValue, onChange }: { currentValue: any; onChange: (v: any) => void }) {
  const isYes = currentValue === 'Yes';

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isYes}
        onCheckedChange={(checked) => onChange(checked ? 'Yes' : 'No')}
      />
      <span className="text-sm">{isYes ? 'Yes' : 'No'}</span>
    </div>
  );
}

function RatingEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const maxRating = ('options' in cell && cell.options && 'maxRating' in cell.options)
    ? (cell.options as any).maxRating ?? 5
    : 5;
  const current = typeof currentValue === 'number' ? currentValue : 0;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(current === i + 1 ? 0 : i + 1)}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star
            className={`h-5 w-5 ${
              i < current
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
