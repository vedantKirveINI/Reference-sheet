import { useState, useCallback, useRef } from 'react';
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
import { Star, ChevronLeft, ChevronRight, MoreHorizontal, Copy, Link, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getFileUploadUrl, uploadFileToPresignedUrl, confirmFileUpload } from '@/services/api';

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
  onDelete?: (recordId: string) => void;
  onDuplicate?: (recordId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalRecords?: number;
}

export function ExpandedRecordModal({ open, record, columns, onClose, onSave, onDelete, onDuplicate, onPrev, onNext, hasPrev, hasNext, currentIndex, totalRecords }: ExpandedRecordModalProps) {
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
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base">Record Details</DialogTitle>
            {totalRecords != null && currentIndex != null && (
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} of {totalRecords}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onPrev}
              disabled={!hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onNext}
              disabled={!hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => record && onDuplicate?.(record.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate record
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(window.location.href + '&recordId=' + record?.id);
                }}>
                  <Link className="h-4 w-4 mr-2" />
                  Copy record URL
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => record && onDelete?.(record.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete record
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
      return (
        <input
          type="datetime-local"
          value={currentValue ? new Date(currentValue).toISOString().slice(0, 16) : ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.CreatedTime:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-gray-50 rounded-md min-h-[36px] flex items-center">
          {cell.displayData || '—'}
          <span className="ml-2 text-xs text-gray-400">(auto-generated)</span>
        </div>
      );

    case CellType.Currency:
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">$</span>
          <input
            type="number"
            step="0.01"
            value={currentValue ?? ''}
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      );

    case CellType.PhoneNumber: {
      const phoneStr = (currentValue as string) ?? '';
      const codes = [
        { code: '+1', flag: '\u{1F1FA}\u{1F1F8}' }, { code: '+44', flag: '\u{1F1EC}\u{1F1E7}' }, { code: '+91', flag: '\u{1F1EE}\u{1F1F3}' },
        { code: '+86', flag: '\u{1F1E8}\u{1F1F3}' }, { code: '+81', flag: '\u{1F1EF}\u{1F1F5}' }, { code: '+49', flag: '\u{1F1E9}\u{1F1EA}' },
        { code: '+33', flag: '\u{1F1EB}\u{1F1F7}' }, { code: '+61', flag: '\u{1F1E6}\u{1F1FA}' }, { code: '+55', flag: '\u{1F1E7}\u{1F1F7}' },
      ];
      const matchedCode = codes.find(c => phoneStr.startsWith(c.code));
      return (
        <div className="flex items-center gap-1">
          <select
            value={matchedCode?.code || '+1'}
            onChange={(e) => {
              const newCode = e.target.value;
              const numPart = matchedCode ? phoneStr.slice(matchedCode.code.length).trim() : phoneStr;
              onChange(`${newCode} ${numPart}`);
            }}
            className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm"
          >
            {codes.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
          </select>
          <input type="tel" value={matchedCode ? phoneStr.slice(matchedCode.code.length).trim() : phoneStr}
            onChange={(e) => {
              const code = matchedCode?.code || '+1';
              onChange(`${code} ${e.target.value}`);
            }}
            placeholder="Phone number"
            className="h-9 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      );
    }

    case CellType.Address: {
      const addrStr = typeof currentValue === 'string' ? currentValue : '';
      const parts = addrStr.split(',').map((s: string) => s.trim());
      return (
        <div className="space-y-2">
          <input type="text" placeholder="Street address" value={parts[0] || ''} 
            onChange={(e) => { const p = [...parts]; p[0] = e.target.value; onChange(p.filter(Boolean).join(', ')); }}
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          <div className="flex gap-2">
            <input type="text" placeholder="City" value={parts[1] || ''}
              onChange={(e) => { const p = [...parts]; p[1] = e.target.value; onChange(p.filter(Boolean).join(', ')); }}
              className="h-9 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            <input type="text" placeholder="State" value={parts[2] || ''}
              onChange={(e) => { const p = [...parts]; p[2] = e.target.value; onChange(p.filter(Boolean).join(', ')); }}
              className="h-9 w-20 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Zip Code" value={parts[3] || ''}
              onChange={(e) => { const p = [...parts]; p[3] = e.target.value; onChange(p.filter(Boolean).join(', ')); }}
              className="h-9 w-28 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
            <input type="text" placeholder="Country" value={parts[4] || ''}
              onChange={(e) => { const p = [...parts]; p[4] = e.target.value; onChange(p.filter(Boolean).join(', ')); }}
              className="h-9 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
          </div>
        </div>
      );
    }

    case CellType.Slider: {
      const sliderVal = typeof currentValue === 'number' ? currentValue : 0;
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
          <span className="text-sm font-medium w-10 text-right">{sliderVal}%</span>
        </div>
      );
    }

    case CellType.Time:
      return (
        <input
          type="time"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.OpinionScale: {
      const maxScale = ('options' in cell && cell.options && 'max' in (cell.options as any)) ? ((cell.options as any).max ?? 10) : 10;
      const scaleVal = typeof currentValue === 'number' ? currentValue : 0;
      return (
        <div className="flex items-center gap-1">
          {Array.from({ length: maxScale }, (_, i) => (
            <button
              key={i}
              onClick={() => onChange(scaleVal === i + 1 ? 0 : i + 1)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                scaleVal === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      );
    }

    case CellType.ZipCode:
      return (
        <input
          type="text"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter zip code"
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.Formula:
    case CellType.Enrichment:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-gray-50 rounded-md min-h-[36px] flex items-center italic">
          {cell.displayData || '—'}
          <span className="ml-2 text-xs text-gray-400">(computed)</span>
        </div>
      );

    case CellType.List: {
      const listVal = Array.isArray(currentValue) ? currentValue.join(', ') : (currentValue ?? '');
      return (
        <input
          type="text"
          value={listVal}
          onChange={(e) => onChange(e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
          placeholder="Enter comma-separated values"
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );
    }

    case CellType.Ranking: {
      const items: string[] = Array.isArray(currentValue) ? currentValue.map(String) : [];
      if (items.length === 0) {
        return (
          <input type="number" min="1" value={currentValue ?? ''} 
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            placeholder="Enter rank" 
            className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        );
      }
      return (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded text-sm">
              <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">{i + 1}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      );
    }

    case CellType.Signature: {
      const hasSig = currentValue && typeof currentValue === 'string' && currentValue.startsWith('data:');
      return (
        <div className="space-y-2">
          {hasSig ? (
            <div className="flex items-center gap-3">
              <img src={currentValue as string} alt="Signature" className="border rounded h-16" />
              <button onClick={() => onChange(null)} className="text-xs text-red-500 hover:text-red-600">Clear</button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-1.5 px-3 bg-gray-50 rounded-md">
              No signature — use the inline editor to draw
            </div>
          )}
        </div>
      );
    }

    case CellType.FileUpload:
      return <FileUploadEditor currentValue={currentValue} onChange={onChange} />;

    default:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-gray-50 rounded-md min-h-[36px] flex items-center">
          {cell.displayData || '—'}
        </div>
      );
  }
}

function SCQEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const [search, setSearch] = useState('');
  const options = 'options' in cell && cell.options && 'options' in cell.options
    ? (cell.options.options as string[])
    : [];
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {options.length > 5 && (
        <div className="p-1.5 border-b">
          <input ref={searchRef} type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => onChange(currentValue === option ? null : option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              currentValue === option ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'
            }`}>
            <span className="inline-flex items-center gap-2">
              {currentValue === option && <span className="text-blue-500">✓</span>}
              {option}
            </span>
          </button>
        ))}
      </div>
      {currentValue && (
        <div className="p-1.5 border-t">
          <button onClick={() => onChange(null)} className="w-full text-left px-2 py-1 text-xs text-gray-400 hover:text-gray-600">Clear selection</button>
        </div>
      )}
    </div>
  );
}

function DropDownEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const [search, setSearch] = useState('');
  const options = 'options' in cell && cell.options && 'options' in cell.options
    ? (cell.options.options as (string | { id: string | number; label: string })[])
    : [];

  const getLabel = (opt: string | { id: string | number; label: string }) =>
    typeof opt === 'string' ? opt : opt.label;

  const allLabels = options.map(getLabel);
  const filtered = allLabels.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const selectedValues = Array.isArray(currentValue) ? currentValue.map((v: any) => typeof v === 'string' ? v : v.label) : [];

  const toggleOption = (optValue: string) => {
    if (selectedValues.includes(optValue)) {
      onChange(selectedValues.filter((v: string) => v !== optValue));
    } else {
      onChange([...selectedValues, optValue]);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {allLabels.length > 5 && (
        <div className="p-1.5 border-b">
          <input type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      {selectedValues.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b">
          {selectedValues.map((v: string) => (
            <span key={v} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
              {v}
              <button onClick={() => toggleOption(v)} className="hover:text-blue-900">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">No options found</div>}
        {filtered.map(label => {
          const isSelected = selectedValues.includes(label);
          return (
            <button key={label} onClick={() => toggleOption(label)}
              className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
              }`}>
              <span className="inline-flex items-center gap-2">
                <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                  isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
                }`}>{isSelected ? '✓' : ''}</span>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MCQEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const [search, setSearch] = useState('');
  const options = 'options' in cell && cell.options && 'options' in cell.options
    ? (cell.options.options as string[])
    : [];
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const selected: string[] = Array.isArray(currentValue) ? currentValue : [];

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(v => v !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      {options.length > 5 && (
        <div className="p-1.5 border-b">
          <input type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
        </div>
      )}
      {selected.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b">
          {selected.map(v => (
            <span key={v} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
              {v}
              <button onClick={() => toggleOption(v)} className="hover:text-blue-900">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => toggleOption(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              selected.includes(option) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
            }`}>
            <span className="inline-flex items-center gap-2">
              <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                selected.includes(option) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'
              }`}>{selected.includes(option) ? '✓' : ''}</span>
              {option}
            </span>
          </button>
        ))}
      </div>
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

function FileUploadEditor({ currentValue, onChange }: { currentValue: any; onChange: (v: any) => void }) {
  const files: Array<{name: string, size?: number, type?: string, url?: string}> = Array.isArray(currentValue) ? currentValue : [];
  const actualFilesRef = useRef<Map<number, File>>(new Map());
  const nextIndexRef = useRef(files.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState<any[]>(files);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addedFiles = Array.from(e.target.files || []);
    const newEntries = addedFiles.map(f => {
      const idx = nextIndexRef.current++;
      actualFilesRef.current.set(idx, f);
      return {
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl: URL.createObjectURL(f),
        _idx: idx,
      };
    });
    const updated = [...localFiles, ...newEntries];
    setLocalFiles(updated);
    handleUploadAndSave(updated);
  };

  const handleUploadAndSave = async (fileList: any[]) => {
    const pendingFiles = fileList.filter((f: any) => f._idx !== undefined && actualFilesRef.current.has(f._idx));
    if (pendingFiles.length === 0) {
      onChange(fileList.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFiles: Array<{ url: string; size: number; mimeType: string; name: string }> = [];
      for (const entry of pendingFiles) {
        const file = actualFilesRef.current.get(entry._idx);
        if (!file) continue;
        try {
          const res = await getFileUploadUrl({
            baseId: '',
            tableId: '',
            fieldId: '',
            recordId: '',
            fileName: file.name,
            mimeType: file.type,
          });
          const presignedUrl = res.data?.url || res.data?.uploadUrl;
          if (presignedUrl) {
            await uploadFileToPresignedUrl(presignedUrl, file);
            const fileUrl = presignedUrl.split('?')[0];
            uploadedFiles.push({ url: fileUrl, size: file.size, mimeType: file.type, name: file.name });
            entry.url = fileUrl;
          }
        } catch (err: any) {
          if (err?.response?.status === 404) {
            break;
          }
          console.error('Upload error:', err);
        }
      }

      if (uploadedFiles.length > 0) {
        try {
          await confirmFileUpload({
            baseId: '',
            tableId: '',
            fieldId: '',
            recordId: '',
            files: uploadedFiles,
          });
        } catch (_err) {
        }
      }

      onChange(fileList.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
    } catch (_err) {
      onChange(fileList.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {localFiles.length > 0 ? (
        <div className="space-y-1">
          {localFiles.map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded text-sm">
              <span>📎</span>
              <span className="flex-1 truncate">{f.name || String(f)}</span>
              <button onClick={() => {
                if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                if (f._idx !== undefined) actualFilesRef.current.delete(f._idx);
                const newFiles = localFiles.filter((_: any, fi: number) => fi !== i);
                setLocalFiles(newFiles);
                onChange(newFiles.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
              }} className="text-gray-400 hover:text-red-500 text-xs">×</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-gray-50 rounded-md">No files attached</div>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Add files'}
        </button>
        {isUploading && <span className="text-xs text-blue-500">Uploading...</span>}
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
    </div>
  );
}
