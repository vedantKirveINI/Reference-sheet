import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { IPhoneNumberData, ICurrencyData, IAddressData, IZipCodeData } from '@/types';
import { Star, ChevronLeft, ChevronRight, MoreHorizontal, Copy, Link, Trash2, MessageSquare, Sparkles, Lock, ChevronDown } from 'lucide-react';
import { useAIChatStore } from '@/stores/ai-chat-store';
import { CommentPanel } from '@/components/comments/comment-panel';
import { AddressEditor } from '@/components/editors/address-editor';
import { PhoneNumberEditor } from '@/components/editors/phone-number-editor';
import { CurrencyEditor } from '@/components/editors/currency-editor';
import { ZipCodeEditor } from '@/components/editors/zip-code-editor';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { getFileUploadUrl, uploadFileToPresignedUrl, confirmFileUpload, updateLinkCell, searchForeignRecords, triggerButtonClick } from '@/services/api';
import { LinkEditor } from '@/components/editors/link-editor';
import { ButtonEditor } from '@/components/editors/button-editor';
import { ListFieldEditor } from '@/components/editors/list-field-editor';
import { ILinkRecord } from '@/types/cell';
import type { IButtonOptions, IDateTimeOptions, ITimeData, IRankingItem } from '@/types/cell';
import { toast } from 'sonner';
import { getFieldIcon } from '@/components/icons/field-type-icons';

/** Chip colors for renderer view – exactly match grid `CellRenderer` CHIP_COLORS. */
const RENDERER_CHIP_COLORS = [
  'bg-emerald-100 text-emerald-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
];

function getRendererChipColor(index: number): string {
  return RENDERER_CHIP_COLORS[index % RENDERER_CHIP_COLORS.length];
}

/** Renderer-only view for MCQ (read-only chips). Click opens editor in popover. */
function MCQRenderer({ values, options }: { values: string[]; options: string[] }) {
  const isValid = (v: string) => !v || options.includes(v);
  const allValid = values.every(isValid);
  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border min-h-[36px] ${
        !allValid ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-muted/50'
      }`}
      data-testid="expanded-mcq-renderer"
    >
      {values.length === 0 ? (
        <span className="text-sm text-muted-foreground italic">No options selected</span>
      ) : (
        values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRendererChipColor(i)}`}
          >
            {v}
          </span>
        ))
      )}
      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" aria-hidden />
    </div>
  );
}

/** Renderer-only view for DropDown (read-only chip). Click opens editor in popover. */
function DropDownRenderer({ selectedLabels }: { selectedLabels: string[] }) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-muted/50 min-h-[36px]"
      data-testid="expanded-dropdown-renderer"
    >
      {selectedLabels.length === 0 ? (
        <span className="text-sm text-muted-foreground italic">No option selected</span>
      ) : (
        selectedLabels.map((label, i) => (
          <span
            key={label}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRendererChipColor(i)}`}
          >
            {label}
          </span>
        ))
      )}
      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" aria-hidden />
    </div>
  );
}

/** Renderer-only view for Ranking (read-only numbered items). Click opens editor in popover. */
function RankingRenderer({ items }: { items: Array<{ label: string } | string> }) {
  const labels = items.map((item) => (typeof item === 'string' ? item : (item as { label: string }).label));
  return (
    <div
      className="flex flex-wrap items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-muted/50 min-h-[36px]"
      data-testid="expanded-ranking-renderer"
    >
      {labels.length === 0 ? (
        <span className="text-sm text-muted-foreground italic">No ranking set</span>
      ) : (
        labels.map((label, idx) => (
          <span
            key={`${idx}-${label}`}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 whitespace-nowrap"
          >
            {idx + 1}. {label}
          </span>
        ))
      )}
      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" aria-hidden />
    </div>
  );
}

function EmailFieldEditor({ currentValue, onChange }: { currentValue: any; onChange: (value: any) => void }) {
  const [value, setValue] = useState<string>(() => String(currentValue ?? ''));

  useEffect(() => {
    const next = String(currentValue ?? '');
    setValue(next);
  }, [currentValue]);

  const handleChange = useCallback((next: string) => {
    setValue(next);
    onChange(next);
  }, [onChange]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      inputMode="email"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
    />
  );
}

const dtPad = (n: number) => String(n).padStart(2, '0');

function isoToLocalDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${dtPad(d.getMonth() + 1)}-${dtPad(d.getDate())}`;
}

function isoToLocalTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${dtPad(d.getHours())}:${dtPad(d.getMinutes())}`;
}

function buildISOFromLocalParts(datePart: string, timePart: string): string | null {
  if (!datePart) return null;
  const combined = timePart ? `${datePart}T${timePart}` : `${datePart}T00:00`;
  const d = new Date(combined);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function ExpandedDateTimeEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (value: any) => void }) {
  const options = (cell as any).options as IDateTimeOptions | undefined;
  const includeTime = options?.includeTime ?? false;
  const storedISO = typeof currentValue === 'string' ? currentValue : null;

  const [datePart, setDatePart] = useState<string>(() =>
    storedISO ? isoToLocalDate(storedISO) : ''
  );
  const [timePart, setTimePart] = useState<string>(() =>
    storedISO ? isoToLocalTime(storedISO) : ''
  );

  // Track the last value we committed so the useEffect below doesn't
  // clobber the native date input while the user is still typing (e.g. a year).
  const lastCommittedRef = useRef<any>(currentValue);

  useEffect(() => {
    // Only sync from parent when the value changed externally
    // (e.g. navigating to a different record), not from our own commit.
    if (currentValue === lastCommittedRef.current) return;
    lastCommittedRef.current = currentValue;
    const iso = typeof currentValue === 'string' ? currentValue : null;
    setDatePart(iso ? isoToLocalDate(iso) : '');
    setTimePart(iso ? isoToLocalTime(iso) : '');
  }, [currentValue]);

  const commitValue = useCallback((nextDate: string, nextTime: string) => {
    if (!nextDate) {
      const val = null;
      lastCommittedRef.current = val;
      onChange(val);
      return;
    }
    let val: string | null;
    if (includeTime) {
      val = buildISOFromLocalParts(nextDate, nextTime);
    } else {
      const existingTime = storedISO ? isoToLocalTime(storedISO) : '00:00';
      val = buildISOFromLocalParts(nextDate, existingTime);
    }
    lastCommittedRef.current = val;
    onChange(val);
  }, [includeTime, storedISO, onChange]);

  const inputClass = "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="flex gap-2">
      <input
        type="date"
        value={datePart}
        onChange={(e) => {
          const next = e.target.value;
          setDatePart(next);
          commitValue(next, timePart);
        }}
        className={includeTime ? `${inputClass} flex-1` : inputClass}
      />
      {includeTime && (
        <input
          type="time"
          value={timePart}
          onChange={(e) => {
            const next = e.target.value;
            setTimePart(next);
            commitValue(datePart, next);
          }}
          className={`${inputClass} flex-1`}
        />
      )}
    </div>
  );
}

function ExpandedSignatureEditor({ currentValue, onChange }: { currentValue: any; onChange: (value: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const hasSig = currentValue && typeof currentValue === 'string' && currentValue.startsWith('data:');
  const [isEditing, setIsEditing] = useState(false);

  const initCanvas = useCallback((loadExisting?: string | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setupStroke = () => {
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    if (loadExisting) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setupStroke();
      };
      img.src = loadExisting;
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setupStroke();
    }
  }, []);

  useEffect(() => {
    if (isEditing) initCanvas(hasSig ? (currentValue as string) : null);
  }, [isEditing, initCanvas, hasSig, currentValue]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent) => { isDrawingRef.current = true; lastPointRef.current = getPos(e); };
  const draw = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !lastPointRef.current) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPointRef.current = pos;
  };
  const endDraw = () => { isDrawingRef.current = false; lastPointRef.current = null; };

  const handleClear = () => initCanvas();

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onChange(dataUrl);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Draw your signature</div>
        <canvas
          ref={canvasRef}
          width={320}
          height={120}
          className="border border-border rounded cursor-crosshair bg-white w-full"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
        />
        <div className="flex justify-between">
          <button type="button" onClick={handleClear} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsEditing(false)} className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-muted">Cancel</button>
            <button type="button" onClick={handleSave} className="px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-medium rounded">{hasSig ? 'Save' : 'Add'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {hasSig ? (
        <div className="flex items-center gap-3">
          <img src={currentValue as string} alt="Signature" className="border rounded h-16" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsEditing(true)} className="text-xs text-primary hover:text-primary/80">Redraw</button>
            <button type="button" onClick={() => onChange(null)} className="text-xs text-red-500 hover:text-red-600">Clear</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="h-9 w-full rounded-md border border-dashed border-border bg-muted/50 px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          Click to add signature
        </button>
      )}
    </div>
  );
}

function getTimeZoneShort(): string {
  const options: Intl.DateTimeFormatOptions = { timeZoneName: 'short' };
  const parts = new Date().toLocaleString('en-US', options).split(' ');
  return parts[parts.length - 1] || '';
}

function ExpandedTimeEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (value: any) => void }) {
  const options = (cell as any).options ?? {};
  const isTwentyFourHour = options.isTwentyFourHour ?? false;

  // Extract existing 24h time from ITimeData
  const existingData = currentValue as ITimeData | null;
  const initial24hr = (() => {
    if (!existingData) return '';
    if (existingData.ISOValue) {
      const d = new Date(existingData.ISOValue);
      if (!isNaN(d.getTime())) return `${dtPad(d.getHours())}:${dtPad(d.getMinutes())}`;
    }
    if (existingData.time) {
      if (existingData.meridiem) {
        const parts = existingData.time.split(':');
        if (parts.length === 2) {
          const h = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          if (!isNaN(h) && !isNaN(m)) {
            let h24 = h;
            if (existingData.meridiem === 'AM' && h === 12) h24 = 0;
            else if (existingData.meridiem === 'PM' && h !== 12) h24 = h + 12;
            return `${dtPad(h24)}:${dtPad(m)}`;
          }
        }
      }
      return existingData.time;
    }
    return '';
  })();

  const [time24, setTime24] = useState(initial24hr);
  const lastCommittedRef = useRef<any>(currentValue);

  useEffect(() => {
    if (currentValue === lastCommittedRef.current) return;
    lastCommittedRef.current = currentValue;
    const td = currentValue as ITimeData | null;
    if (!td) { setTime24(''); return; }
    if (td.ISOValue) {
      const d = new Date(td.ISOValue);
      if (!isNaN(d.getTime())) { setTime24(`${dtPad(d.getHours())}:${dtPad(d.getMinutes())}`); return; }
    }
    setTime24(td.time || '');
  }, [currentValue]);

  const buildTimeData = useCallback((t24: string): ITimeData | null => {
    if (!t24) return null;
    const parts = t24.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;

    const isoDate = new Date();
    isoDate.setHours(h, m, 0, 0);

    let displayTime: string;
    let displayMeridiem: string;
    if (isTwentyFourHour) {
      displayTime = `${dtPad(h)}:${dtPad(m)}`;
      displayMeridiem = '';
    } else {
      const meridiem = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      displayTime = `${h12}:${dtPad(m)}`;
      displayMeridiem = meridiem;
    }

    return {
      time: displayTime,
      meridiem: displayMeridiem,
      ISOValue: isoDate.toISOString(),
      timeZone: getTimeZoneShort(),
    };
  }, [isTwentyFourHour]);

  const handleChange = useCallback((newTime24: string) => {
    setTime24(newTime24);
    const val = newTime24 ? buildTimeData(newTime24) : null;
    lastCommittedRef.current = val;
    onChange(val);
  }, [buildTimeData, onChange]);

  const inputClass = "h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <input
      type="time"
      value={time24}
      onChange={(e) => handleChange(e.target.value)}
      className={inputClass}
    />
  );
}

function ExpandedRankingEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (value: any) => void }) {
  const rawOptions: any[] = (cell as any).options?.options ?? [];
  const existingData: IRankingItem[] | null = Array.isArray(currentValue) ? currentValue as IRankingItem[] : null;

  const buildItemsFromOptions = (): IRankingItem[] => {
    return rawOptions.map((opt: any, i: number) => ({
      id: typeof opt === 'object' ? (opt.id || opt.label || String(i)) : String(i),
      rank: i + 1,
      label: typeof opt === 'object' ? (opt.label || '') : String(opt),
    }));
  };

  const [items, setItems] = useState<IRankingItem[]>(() => {
    if (existingData && existingData.length > 0) {
      return existingData.map((item, i) => ({
        id: item.id ?? String(i),
        rank: item.rank ?? i + 1,
        label: item.label ?? '',
      }));
    }
    return buildItemsFromOptions();
  });

  const [isEditing, setIsEditing] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const moveItem = (from: number, to: number) => {
    const newItems = [...items];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    setItems(newItems.map((item, i) => ({ ...item, rank: i + 1 })));
  };

  const handleSave = () => {
    if (items.length === 0) {
      onChange(null);
    } else {
      onChange(items.map((item, i) => ({ id: item.id, rank: i + 1, label: item.label })));
    }
    setIsEditing(false);
  };

  // Display items for the renderer
  const displayItems = items.map(item => ({ label: item.label }));

  if (rawOptions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center">
        No ranking options configured. Edit the field to add options.
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="border border-border rounded-md p-2 space-y-1.5">
        <div className="text-xs font-medium text-muted-foreground">Drag to reorder ranking</div>
        <div className="space-y-0.5 max-h-56 overflow-y-auto">
          {items.map((item, i) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
              onDrop={() => { if (dragIndex !== null && dragIndex !== i) moveItem(dragIndex, i); setDragIndex(null); setDragOverIndex(null); }}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-grab active:cursor-grabbing transition-colors ${
                dragIndex === i ? 'opacity-50 bg-emerald-50 border border-emerald-200' : dragOverIndex === i && dragIndex !== i ? 'border-t-2 border-emerald-400' : 'hover:bg-accent'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <span className="flex-1 truncate">{item.label}</span>
              <span className="text-muted-foreground/40 text-xs shrink-0 select-none">⋮⋮</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-1.5 pt-1.5 border-t">
          <button type="button" onClick={() => setIsEditing(false)} className="px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground rounded hover:bg-muted">Cancel</button>
          <button type="button" onClick={handleSave} className="px-2.5 py-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-medium rounded">{existingData && existingData.length > 0 ? 'Save' : 'Add'}</button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="w-full text-left rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
    >
      <RankingRenderer items={displayItems} />
    </button>
  );
}

export interface ExpandedRecordModalProps {
  open: boolean;
  record: IRecord | null;
  columns: IColumn[];
  tableId?: string;
  baseId?: string;
  onClose: () => void;
  onSave: (recordId: string, updatedCells: Record<string, any>) => Promise<void>;
  onDelete?: (recordId: string) => void;
  onDuplicate?: (recordId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalRecords?: number;
  onExpandLinkedRecord?: (foreignTableId: string, recordId: number, title?: string) => void;
  readOnly?: boolean;
  isCreateMode?: boolean;
  initialFocusComment?: boolean;
  /** Called when a comment is created, updated, or deleted so the grid can refresh comment counts. */
  onCommentsChange?: () => void;
}

export function ExpandedRecordModal({ open, record, columns, tableId, baseId, onClose, onSave, onDelete, onDuplicate, onPrev, onNext, hasPrev, hasNext, currentIndex, totalRecords, onExpandLinkedRecord, readOnly = false, isCreateMode = false, initialFocusComment = false, onCommentsChange }: ExpandedRecordModalProps) {
  const { t } = useTranslation();
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [showComments, setShowComments] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const resetEdits = useCallback(() => {
    setEditedValues({});
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isSaving) return;
    if (!isOpen) {
      resetEdits();
      onClose();
    }
  }, [onClose, resetEdits, isSaving]);

  const handleSave = useCallback(async () => {
    if (!record) return;
    if (Object.keys(editedValues).length === 0) {
      resetEdits();
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      await onSave(record.id, editedValues);
      resetEdits();
      onClose();
    } catch (err: any) {
      const msg = err?.message || t('common:error', 'Something went wrong');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }, [record, editedValues, onSave, onClose, resetEdits, t]);

  const handleFieldChange = useCallback((columnId: string, value: any) => {
    setEditedValues(prev => ({ ...prev, [columnId]: value }));
  }, []);

  useEffect(() => {
    if (open && initialFocusComment) {
      setShowComments(true);
    }
  }, [open, initialFocusComment]);

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`max-h-[85vh] overflow-hidden flex flex-col ${showComments ? 'sm:max-w-4xl' : 'sm:max-w-2xl'} transition-all`} data-testid="expanded-record-modal">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base">{t('records.recordDetails')}</DialogTitle>
            {totalRecords != null && currentIndex != null && (
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} {t('records.of')} {totalRecords}
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
            <Button
              variant={showComments ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowComments(!showComments)}
              title={t('comments.comments')}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => record && onDuplicate?.(record.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('records.duplicateRecord')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(window.location.href + '&recordId=' + record?.id);
                }}>
                  <Link className="h-4 w-4 mr-2" />
                  {t('records.copyRecordUrl')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  const primaryCol = columns[0];
                  const primaryValue = primaryCol ? (record.cells[primaryCol.id]?.displayData || record.cells[primaryCol.id]?.data || '') : '';
                  const context = primaryValue ? `Tell me about this record: "${primaryValue}"` : 'Tell me about this record';
                  useAIChatStore.getState().setContextPrefill(context);
                  useAIChatStore.getState().setIsOpen(true);
                }}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('records.askAi')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => record && onDelete?.(record.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('records.deleteRecord')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogHeader>
        <div className={`flex-1 overflow-hidden flex ${showComments ? 'gap-0' : ''}`}>
          <div className={`${showComments ? 'flex-1 border-r border-border' : 'w-full'} overflow-y-auto space-y-1 py-2`}>
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
                  baseId={baseId}
                  tableId={tableId}
                  recordId={record.id}
                  onExpandLinkedRecord={onExpandLinkedRecord}
                  record={record}
                  columns={columns}
                />
              );
            })}
          </div>
          {showComments && (
            <div className="w-[320px] flex-shrink-0 overflow-hidden flex flex-col">
              <CommentPanel
                tableId={tableId || ''}
                recordId={record.id}
                initialFocusComment={initialFocusComment}
                onCommentsChange={onCommentsChange}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            {t('close')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('common:saving', 'Saving…') : t('save')}
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
  baseId?: string;
  tableId?: string;
  recordId?: string;
  onExpandLinkedRecord?: (foreignTableId: string, recordId: number, title?: string) => void;
  record?: IRecord;
  columns?: IColumn[];
}

function FieldRow({ column, cell, currentValue, onChange, baseId, tableId, recordId, onExpandLinkedRecord, record, columns }: FieldRowProps) {
  const Icon = getFieldIcon(column.type as CellType | undefined);

  return (
    <div className="flex items-start gap-4 py-3 px-2 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 w-40 shrink-0 pt-1.5">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
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
          baseId={baseId}
          tableId={tableId}
          recordId={recordId}
          onExpandLinkedRecord={onExpandLinkedRecord}
          record={record}
          columns={columns}
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
  baseId?: string;
  tableId?: string;
  recordId?: string;
  onExpandLinkedRecord?: (foreignTableId: string, recordId: number, title?: string) => void;
  record?: IRecord;
  columns?: IColumn[];
}

function getSourceLinkRecords(
  linkFieldId: number,
  record?: IRecord,
  columns?: IColumn[]
): Array<{ id: number; title: string; foreignTableId: number }> {
  if (!record || !columns) return [];
  const linkCol = columns.find(c => {
    const rawId = Number((c as any).rawId || c.id);
    return rawId === linkFieldId;
  });
  if (!linkCol) return [];
  const linkCell = record.cells[linkCol.id];
  if (!linkCell || !Array.isArray(linkCell.data)) return [];
  const foreignTableId = (linkCol.options as any)?.foreignTableId;
  if (!foreignTableId) return [];
  return (linkCell.data as any[]).map((lr: any) => ({
    id: lr.id,
    title: lr.title || `Record ${lr.id}`,
    foreignTableId: Number(foreignTableId),
  }));
}

function FieldEditor({ column, cell, currentValue, onChange, baseId, tableId, recordId, onExpandLinkedRecord, record, columns }: FieldEditorProps) {
  const { t } = useTranslation();
  switch (column.type) {
    case CellType.String:
    case CellType.LongText:
      return (
        <input
          type="text"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.Email:
      return <EmailFieldEditor currentValue={currentValue} onChange={onChange} />;

    case CellType.Number:
      return (
        <input
          type="number"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.SCQ: {
      const scqLabel = currentValue != null ? String(currentValue) : '';
      const scqSelectedLabels = scqLabel ? [scqLabel] : [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-full text-left rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
            >
              <DropDownRenderer selectedLabels={scqSelectedLabels} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[400px] p-0"
            align="start"
            sideOffset={4}
            data-testid="expanded-scq-editor-popover"
          >
            <SCQEditor cell={cell} currentValue={currentValue} onChange={onChange} />
          </PopoverContent>
        </Popover>
      );
    }

    case CellType.DropDown: {
      const ddOptions = 'options' in cell && cell.options && 'options' in cell.options
        ? (cell.options.options as (string | { id: string | number; label: string })[])
        : [];
      const ddOptionLabels = ddOptions.map((o) => (typeof o === 'string' ? o : o.label));
      const ddSelectedLabels: string[] = Array.isArray(currentValue)
        ? (currentValue as any[]).map((v: any) => (typeof v === 'string' ? v : v?.label ?? ''))
        : [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full text-left rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1">
              <DropDownRenderer selectedLabels={ddSelectedLabels} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[400px] p-0" align="start" sideOffset={4} data-testid="expanded-dropdown-editor-popover">
            <DropDownEditor cell={cell} currentValue={currentValue} onChange={onChange} />
          </PopoverContent>
        </Popover>
      );
    }

    case CellType.MCQ: {
      const mcqOptions = 'options' in cell && cell.options && 'options' in cell.options ? (cell.options.options as string[]) : [];
      const mcqValues: string[] = Array.isArray(currentValue) ? currentValue : [];
      return (
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="w-full text-left rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1">
              <MCQRenderer values={mcqValues} options={mcqOptions} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[400px] p-0" align="start" sideOffset={4} data-testid="expanded-mcq-editor-popover">
            <MCQEditor cell={cell} currentValue={currentValue} onChange={onChange} />
          </PopoverContent>
        </Popover>
      );
    }

    case CellType.YesNo:
      return <YesNoEditor currentValue={currentValue} onChange={onChange} />;

    case CellType.Rating:
      return <RatingEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.DateTime:
      return <ExpandedDateTimeEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.CreatedTime:
      return (
        <div className="system-field-cell text-sm text-slate-500 py-1.5 px-3 rounded-md border border-slate-200/60 min-h-[36px] flex items-center gap-2">
          <span className="truncate">{cell.displayData || '—'}</span>
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            <Lock className="h-2.5 w-2.5" />
            system
          </span>
        </div>
      );

    case CellType.Currency: {
      const currVal = currentValue as ICurrencyData | null;
      return (
        <CurrencyEditor
          value={currVal}
          onChange={onChange}
        />
      );
    }

    case CellType.PhoneNumber: {
      const phoneVal = currentValue as IPhoneNumberData | null;
      return (
        <PhoneNumberEditor
          value={phoneVal}
          onChange={onChange}
        />
      );
    }

    case CellType.Address: {
      const addrVal = currentValue as IAddressData | null;
      return (
        <AddressEditor
          value={addrVal}
          onChange={onChange}
        />
      );
    }

    case CellType.Slider: {
      const sliderOpts = (cell as any).options ?? {};
      const sliderMinVal = sliderOpts.minValue ?? 0;
      const sliderMaxVal = sliderOpts.maxValue ?? 10;
      const sliderVal = typeof currentValue === 'number' ? currentValue : sliderMinVal;
      return (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={sliderMinVal}
            max={sliderMaxVal}
            value={sliderVal}
            onChange={(e) => onChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-medium w-10 text-right">{sliderVal}</span>
        </div>
      );
    }

    case CellType.Time:
      return <ExpandedTimeEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

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
                scaleVal === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-accent text-foreground/80'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      );
    }

    case CellType.ZipCode: {
      const rawZip = currentValue;
      const zipData: IZipCodeData | null =
        rawZip == null
          ? null
          : typeof rawZip === 'object'
            ? { countryCode: (rawZip as any).countryCode ?? '', zipCode: (rawZip as any).zipCode ?? '' }
            : { countryCode: '', zipCode: String(rawZip) };
      return (
        <ZipCodeEditor
          value={zipData}
          onChange={onChange}
        />
      );
    }

    case CellType.Formula:
    case CellType.Enrichment: {
      const meta = (cell as any).options?.computedFieldMeta;
      const hasData =
        cell.displayData != null &&
        (typeof cell.displayData === 'number' || String(cell.displayData).trim() !== '');
      if (meta?.shouldShowLoading && !hasData) {
        return (
          <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center italic">
            Calculating…
            <span className="ml-2 text-xs text-muted-foreground/70">
              {t('fields.computed')}
            </span>
          </div>
        );
      }
      if (meta?.hasError) {
        return (
          <div className="text-sm py-1.5 px-3 bg-red-50 border border-red-200 rounded-md min-h-[36px] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-700 text-[10px] font-bold shrink-0">
              !
            </span>
            <span className="truncate text-sm text-red-700">
              {cell.displayData || t('fields.computed')}
            </span>
          </div>
        );
      }
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center italic">
          {cell.displayData || '—'}
          <span className="ml-2 text-xs text-muted-foreground/70">
            {t('fields.computed')}
          </span>
        </div>
      );
    }

    case CellType.List: {
      const listValue = Array.isArray(currentValue) ? currentValue.map(String) : [];
      return (
        <div className="border border-border rounded-md overflow-hidden">
          <ListFieldEditor
            value={listValue}
            onChange={(v) => onChange(v)}
            placeholder={t('fieldModal.searchOrCreateTag')}
            popoverStyle={false}
          />
        </div>
      );
    }

    case CellType.Ranking:
      return <ExpandedRankingEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.Signature:
      return <ExpandedSignatureEditor currentValue={currentValue} onChange={onChange} />;

    case CellType.FileUpload:
      return <FileUploadEditor cell={cell} currentValue={currentValue} onChange={onChange} />;

    case CellType.Checkbox:
      return (
        <button
          onClick={() => onChange(!(currentValue === true))}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            currentValue === true
              ? 'bg-primary border-primary text-primary-foreground'
              : 'border-border hover:border-primary/50'
          }`}
        >
          {currentValue === true && <span className="text-xs">✓</span>}
        </button>
      );

    case CellType.Link: {
      const linkOptions = cell && 'options' in cell ? (cell as any).options : undefined;
      const foreignTblId = linkOptions?.foreignTableId || (column.options as any)?.foreignTableId;
      const fieldId = Number((column as any).rawId || column.id);
      const linkRecords: ILinkRecord[] = Array.isArray(currentValue) ? currentValue : [];

      const handleLinkChange = async (records: ILinkRecord[]) => {
        onChange(records);
        if (baseId && tableId && recordId) {
          try {
            await updateLinkCell({
              tableId,
              baseId,
              fieldId,
              recordId: Number(recordId),
              linkedRecordIds: records.map(r => r.id),
            });
          } catch {
            // link cell update failed
          }
        }
      };

      const handleSearch = async (query: string): Promise<ILinkRecord[]> => {
        if (!baseId || !foreignTblId) return [];
        try {
          const res = await searchForeignRecords({ baseId, tableId: String(foreignTblId), query });
          const records = res?.data?.records || res?.data || [];
          return records.map((r: any) => ({
            id: Number(r.__id?.value || r.__id || r.id),
            title: r.__title?.value || r.__title || r.title || String(r.__id?.value || r.__id || r.id),
          })).filter((r: ILinkRecord) => r.id > 0);
        } catch {
          return [];
        }
      };

      const handleExpandLinkRecord = (record: ILinkRecord) => {
        if (foreignTblId && onExpandLinkedRecord) {
          onExpandLinkedRecord(String(foreignTblId), record.id, record.title);
        }
      };

      return (
        <LinkEditor
          value={linkRecords}
          onChange={handleLinkChange}
          foreignTableId={foreignTblId}
          onSearch={handleSearch}
          onExpandRecord={handleExpandLinkRecord}
        />
      );
    }

    case CellType.User:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center">
          {Array.isArray(currentValue) ? currentValue.map((u: any) => u.name || u.email).join(', ') : '—'}
          <span className="ml-2 text-xs text-muted-foreground/70">(user)</span>
        </div>
      );

    case CellType.CreatedBy:
    case CellType.LastModifiedBy:
      return (
        <div className="system-field-cell text-sm text-slate-500 py-1.5 px-3 rounded-md border border-slate-200/60 min-h-[36px] flex items-center gap-2">
          <span className="truncate">{typeof currentValue === 'object' && currentValue ? (currentValue.name || currentValue.email || '—') : (cell.displayData || '—')}</span>
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            <Lock className="h-2.5 w-2.5" />
            system
          </span>
        </div>
      );

    case CellType.LastModifiedTime:
    case CellType.AutoNumber:
    case CellType.ID:
      return (
        <div className="system-field-cell text-sm text-slate-500 py-1.5 px-3 rounded-md border border-slate-200/60 min-h-[36px] flex items-center gap-2">
          <span className="truncate">{cell.displayData || '—'}</span>
          <span className="ml-auto shrink-0 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            <Lock className="h-2.5 w-2.5" />
            system
          </span>
        </div>
      );

    case CellType.Button: {
      const btnOpts: IButtonOptions = ('options' in cell && cell.options) ? cell.options as IButtonOptions : { label: 'Click' };
      const btnClickCount = typeof currentValue === 'number' ? currentValue : 0;

      const handleBtnClick = async () => {
        if (baseId && tableId && recordId) {
          try {
            await triggerButtonClick({
              tableId,
              fieldId: column.id,
              recordId,
            });
            onChange(btnClickCount + 1);
          } catch {
            // button click failed
          }
        }
      };

      return (
        <ButtonEditor
          options={btnOpts}
          onClick={handleBtnClick}
          clickCount={btnClickCount}
        />
      );
    }

    case CellType.Lookup: {
      const lookupData = cell.data;
      const lookupOpts = (column.options as any) || {};
      const lookupLinkFieldId = lookupOpts.linkFieldId;

      const sourceLinkRecords = lookupLinkFieldId ? getSourceLinkRecords(lookupLinkFieldId, record, columns) : [];

      return (
        <div className="space-y-2">
          {Array.isArray(lookupData) && lookupData.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {lookupData.map((val: any, i: number) => (
                <span key={i} className="inline-block bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded px-2 py-0.5 text-sm">
                  {String(val)}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">{cell.displayData || '—'}</div>
          )}
          {sourceLinkRecords.length > 0 && onExpandLinkedRecord && (
            <div className="pt-1 border-t border-border/50">
              <div className="text-xs text-muted-foreground mb-1">Source records:</div>
              <div className="flex flex-wrap gap-1">
                {sourceLinkRecords.map(lr => (
                  <button
                    key={lr.id}
                    onClick={() => onExpandLinkedRecord(String(lr.foreignTableId), lr.id, lr.title)}
                    className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded px-2 py-0.5 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer transition-colors"
                  >
                    <span className="max-w-[150px] truncate">{lr.title || `Record ${lr.id}`}</span>
                    <Link className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    case CellType.Rollup: {
      const rollupOpts = (column.options as any) || {};
      const rollupLinkFieldId = rollupOpts.linkFieldId;
      const sourceLinkRecords = rollupLinkFieldId ? getSourceLinkRecords(rollupLinkFieldId, record, columns) : [];

      return (
        <div className="space-y-2">
          <div className="text-sm py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center">
            <span className="font-semibold text-base">{cell.displayData || '—'}</span>
            <span className="ml-2 text-xs text-muted-foreground/70">(rollup)</span>
          </div>
          {sourceLinkRecords.length > 0 && onExpandLinkedRecord && (
            <div className="pt-1">
              <div className="text-xs text-muted-foreground mb-1">Source records:</div>
              <div className="flex flex-wrap gap-1">
                {sourceLinkRecords.map(lr => (
                  <button
                    key={lr.id}
                    onClick={() => onExpandLinkedRecord(String(lr.foreignTableId), lr.id, lr.title)}
                    className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded px-2 py-0.5 text-xs hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer transition-colors"
                  >
                    <span className="max-w-[150px] truncate">{lr.title || `Record ${lr.id}`}</span>
                    <Link className="w-3 h-3 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    default:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center">
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
    <div className="border border-border rounded-md overflow-hidden">
      {options.length > 5 && (
        <div className="p-1.5 border-b border-border">
          <input ref={searchRef} type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400" />
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => onChange(currentValue === option ? null : option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              currentValue === option ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-accent'
            }`}>
            <span className="inline-flex items-center gap-2">
              {currentValue === option && <span className="text-emerald-500">✓</span>}
              {option}
            </span>
          </button>
        ))}
      </div>
      {currentValue && (
        <div className="p-1.5 border-t border-border">
          <button onClick={() => onChange(null)} className="w-full text-left px-2 py-1 text-xs text-muted-foreground hover:text-foreground">Clear selection</button>
        </div>
      )}
    </div>
  );
}

const DD_MODAL_CHIP_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300',
];

function DropDownEditor({ cell, currentValue, onChange }: { cell: ICell; currentValue: any; onChange: (v: any) => void }) {
  const [search, setSearch] = useState('');
  const options = 'options' in cell && cell.options && 'options' in cell.options
    ? (cell.options.options as (string | { id: string | number; label: string })[])
    : [];

  const optionObjects = options.map((opt, i) => {
    if (typeof opt === 'string') return { id: opt, label: opt };
    if (typeof opt === 'object' && opt !== null) return { id: opt.id ?? opt.label ?? String(i), label: opt.label || '' };
    return { id: String(opt), label: String(opt) };
  });

  const allLabels = optionObjects.map(o => o.label);
  const filtered = allLabels.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const selectedLabels: string[] = Array.isArray(currentValue) ? currentValue.map((v: any) => typeof v === 'string' ? v : v.label) : [];

  const toggleOption = (optLabel: string) => {
    let newLabels: string[];
    if (selectedLabels.includes(optLabel)) {
      newLabels = selectedLabels.filter((v: string) => v !== optLabel);
    } else {
      newLabels = [...selectedLabels, optLabel];
    }
    const result = optionObjects
      .filter(o => newLabels.includes(o.label))
      .map(o => ({ id: String(o.id), label: o.label }));
    onChange(result);
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="p-1.5 border-b border-border">
        <div className="flex items-center gap-1.5 px-2 py-1 border border-border rounded bg-background">
          <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Find your option" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground" />
          {search && (
            <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => setSearch('')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      </div>
      {selectedLabels.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b border-border">
          {selectedLabels.map((label: string, idx: number) => {
            const colorClass = DD_MODAL_CHIP_COLORS[idx % DD_MODAL_CHIP_COLORS.length];
            return (
              <span key={label} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${colorClass}`}>
                {label}
                <button onClick={() => toggleOption(label)} className="ml-0.5 hover:opacity-70 leading-none">×</button>
              </span>
            );
          })}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-2 text-xs text-muted-foreground text-center">No options found</div>}
        {filtered.map(label => {
          const isSelected = selectedLabels.includes(label);
          return (
            <div key={label} onClick={() => toggleOption(label)}
              className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                isSelected ? 'bg-accent/60' : 'hover:bg-accent/40'
              }`}>
              <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs shrink-0 ${
                isSelected ? 'bg-[#39A380] border-[#39A380] text-white' : 'border-muted-foreground/40'
              }`}>{isSelected ? '✓' : ''}</span>
              <span className="truncate">{label}</span>
            </div>
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

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      const exactMatch = options.find(o => o.toLowerCase() === search.trim().toLowerCase());
      if (exactMatch) {
        toggleOption(exactMatch);
      }
      setSearch('');
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="p-1.5 border-b border-border">
        <input type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400" />
      </div>
      {selected.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b border-border">
          {selected.map(v => (
            <span key={v} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">
              {v}
              <button onClick={() => toggleOption(v)} className="hover:text-emerald-900">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options found</div>}
        {filtered.map(option => (
          <button key={option} onClick={() => toggleOption(option)}
            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
              selected.includes(option) ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-accent'
            }`}>
            <span className="inline-flex items-center gap-2">
              <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                selected.includes(option) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground/30'
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
                : 'text-muted-foreground/50'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

function FileUploadEditor({ cell, currentValue, onChange }: { cell?: ICell; currentValue: any; onChange: (v: any) => void }) {
  const files: Array<{name: string, size?: number, type?: string, url?: string}> = Array.isArray(currentValue) ? currentValue : [];
  const actualFilesRef = useRef<Map<number, File>>(new Map());
  const nextIndexRef = useRef(files.length);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localFiles, setLocalFiles] = useState<any[]>(files);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const options = (cell as any)?.options ?? {};
  const maxFiles = typeof options.noOfFilesAllowed === 'number' ? options.noOfFilesAllowed : 10;
  const maxFileSizeBytes = typeof options.maxFileSizeBytes === 'number' ? Math.min(options.maxFileSizeBytes, MAX_FILE_SIZE_BYTES) : MAX_FILE_SIZE_BYTES;

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const addedFiles = Array.from(e.target.files || []);
    const sizeErrors = addedFiles.filter((f: File) => f.size > maxFileSizeBytes);
    if (sizeErrors.length > 0) {
      setErrorMessage(`File size must not exceed ${maxFileSizeBytes / (1024 * 1024)} MB. "${sizeErrors[0].name}" is too large.`);
      e.target.value = '';
      return;
    }
    if (localFiles.length + addedFiles.length > maxFiles) {
      setErrorMessage(`Maximum ${maxFiles} file(s) allowed. You have ${localFiles.length} and tried to add ${addedFiles.length}.`);
      e.target.value = '';
      return;
    }
    const newEntries = addedFiles.map((f: File) => {
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
    e.target.value = '';
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
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded text-sm">
              <span>📎</span>
              <span className="flex-1 truncate">{f.name || String(f)}</span>
              <button onClick={() => {
                if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
                if (f._idx !== undefined) actualFilesRef.current.delete(f._idx);
                const newFiles = localFiles.filter((_: any, fi: number) => fi !== i);
                setLocalFiles(newFiles);
                onChange(newFiles.map(({ name, size, type, url }: any) => ({ name, size, type, url })));
              }} className="text-muted-foreground hover:text-red-500 text-xs">×</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md">No files attached</div>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Add files'}
          </button>
          {isUploading && <span className="text-xs text-emerald-500">Uploading...</span>}
        </div>
        <div className="text-xs text-muted-foreground/60">Max {maxFiles} file(s), {maxFileSizeBytes / (1024 * 1024)} MB per file</div>
        {errorMessage && (
          <div className="text-xs text-red-600" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileAdd} />
    </div>
  );
}

interface DropdownMenuAskAIProps {
  record: IRecord;
  columns: IColumn[];
}

function DropdownMenuAskAI({ record, columns }: DropdownMenuAskAIProps) {
  const { setIsOpen, setContextPrefill } = useAIChatStore();

  // Find the primary display field (first string column or first column)
  const primaryField = columns.find(col => col.type === CellType.String) || columns[0];
  const primaryValue = primaryField ? record.cells[primaryField.id]?.displayData || record.cells[primaryField.id]?.data || 'this record' : 'this record';

  const handleAskAI = () => {
    const context = `Tell me about this record: ${primaryValue}`;
    setContextPrefill(context);
    setIsOpen(true);
  };

  return (
    <DropdownMenuItem onClick={handleAskAI}>
      <Sparkles className="h-4 w-4 mr-2" />
      Ask AI
    </DropdownMenuItem>
  );
}
