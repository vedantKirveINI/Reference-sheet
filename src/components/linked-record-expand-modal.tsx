import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, ExternalLink, X } from 'lucide-react';
import { getForeignTableFields, getForeignTableRecord } from '@/services/api';
import { IColumn, IRecord, ICell, CellType } from '@/types';
import { ILinkRecord } from '@/types/cell';

interface LinkedRecordStackItem {
  foreignTableId: string;
  recordId: number;
  title?: string;
}

interface LinkedRecordExpandModalProps {
  open: boolean;
  baseId: string;
  stack: LinkedRecordStackItem[];
  onClose: () => void;
  onPushRecord: (item: LinkedRecordStackItem) => void;
  onPopRecord: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  [CellType.String]: 'T',
  [CellType.Number]: '#',
  [CellType.SCQ]: '◉',
  [CellType.MCQ]: '☑',
  [CellType.DropDown]: '▾',
  [CellType.DateTime]: '📅',
  [CellType.CreatedTime]: '🔒',
  [CellType.Currency]: '$',
  [CellType.PhoneNumber]: '☎',
  [CellType.Address]: '📍',
  [CellType.FileUpload]: '📎',
  [CellType.Rating]: '★',
  [CellType.Formula]: 'ƒ',
  [CellType.Link]: '🔗',
  [CellType.User]: '👤',
  [CellType.CreatedBy]: '👤',
  [CellType.LastModifiedBy]: '👤',
  [CellType.LastModifiedTime]: '🕐',
  [CellType.AutoNumber]: '#⃣',
  [CellType.Button]: '🔘',
  [CellType.Checkbox]: '☑',
  [CellType.Rollup]: 'Σ',
  [CellType.Lookup]: '👁',
  [CellType.YesNo]: '☐',
  [CellType.Slider]: '◐',
};

const TYPE_MAP: Record<string, CellType> = {
  'TEXT': CellType.String,
  'NUMBER': CellType.Number,
  'SINGLE_SELECT': CellType.SCQ,
  'MULTI_SELECT': CellType.MCQ,
  'DATE': CellType.DateTime,
  'CHECKBOX': CellType.Checkbox,
  'LINK': CellType.Link,
  'LOOKUP': CellType.Lookup,
  'ROLLUP': CellType.Rollup,
  'FORMULA': CellType.Formula,
  'ATTACHMENT': CellType.FileUpload,
  'RATING': CellType.Rating,
  'CURRENCY': CellType.Currency,
  'PHONE': CellType.PhoneNumber,
  'AUTO_NUMBER': CellType.AutoNumber,
  'CREATED_TIME': CellType.CreatedTime,
  'LAST_MODIFIED_TIME': CellType.LastModifiedTime,
  'CREATED_BY': CellType.CreatedBy,
  'LAST_MODIFIED_BY': CellType.LastModifiedBy,
  'USER': CellType.User,
  'BUTTON': CellType.Button,
  'YES_NO': CellType.YesNo,
  'SLIDER': CellType.Slider,
  'DROPDOWN': CellType.DropDown,
};

function mapFieldToColumn(field: any): IColumn {
  return {
    id: String(field.id),
    name: field.name || field.dbFieldName || `Field ${field.id}`,
    type: TYPE_MAP[field.type] || CellType.String,
    width: 200,
    options: field.options || {},
  };
}

function mapRecordData(rawRecord: any, columns: IColumn[]): IRecord | null {
  if (!rawRecord || Object.keys(rawRecord).length === 0) return null;

  const recordId = rawRecord.__id || rawRecord.id;
  const cells: Record<string, ICell> = {};

  for (const col of columns) {
    const dbFieldName = `field_${col.id}`;
    const rawVal = rawRecord[dbFieldName] ?? rawRecord[col.id];

    let data: any = null;
    let displayData = '';

    if (rawVal !== undefined && rawVal !== null) {
      if (typeof rawVal === 'object' && 'value' in rawVal) {
        data = rawVal.value;
        displayData = rawVal.displayValue || String(rawVal.value ?? '');
      } else {
        data = rawVal;
        if (typeof rawVal === 'object') {
          try {
            const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
            if (Array.isArray(parsed)) {
              displayData = parsed.map((v: any) => typeof v === 'object' ? (v.title || v.name || JSON.stringify(v)) : String(v)).join(', ');
            } else {
              displayData = String(rawVal);
            }
          } catch {
            displayData = String(rawVal);
          }
        } else {
          displayData = String(rawVal);
        }
      }
    }

    cells[col.id] = {
      type: col.type,
      data,
      displayData,
    } as ICell;
  }

  return {
    id: String(recordId),
    cells,
  };
}

function formatCellValue(cell: ICell, column: IColumn): string {
  if (cell.data === null || cell.data === undefined) return '';

  switch (column.type) {
    case CellType.DateTime:
    case CellType.CreatedTime:
    case CellType.LastModifiedTime: {
      try {
        const d = new Date(cell.data);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch { /* fall through */ }
      return cell.displayData || String(cell.data);
    }
    case CellType.Currency: {
      const val = typeof cell.data === 'object' ? cell.data?.value : cell.data;
      const num = Number(val);
      if (!isNaN(num)) {
        const symbol = (column.options as any)?.symbol || '$';
        return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      return cell.displayData || String(cell.data);
    }
    case CellType.Number: {
      const num = Number(cell.data);
      if (!isNaN(num)) return num.toLocaleString();
      return cell.displayData || String(cell.data);
    }
    case CellType.Checkbox:
    case CellType.YesNo:
      return cell.data ? '✓ Yes' : '✗ No';
    default:
      return cell.displayData || String(cell.data ?? '');
  }
}

export function LinkedRecordExpandModal({
  open,
  baseId,
  stack,
  onClose,
  onPushRecord,
  onPopRecord,
}: LinkedRecordExpandModalProps) {
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [record, setRecord] = useState<IRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableName, setTableName] = useState<string>('');

  const currentItem = stack.length > 0 ? stack[stack.length - 1] : null;

  const fetchRecordData = useCallback(async () => {
    if (!currentItem || !baseId) return;

    setLoading(true);
    setError(null);

    try {
      const [fieldsRes, recordRes] = await Promise.all([
        getForeignTableFields({ tableId: currentItem.foreignTableId }),
        getForeignTableRecord({
          baseId,
          tableId: currentItem.foreignTableId,
          recordId: currentItem.recordId,
        }),
      ]);

      const fields = fieldsRes?.data || [];
      const mappedColumns = fields.map(mapFieldToColumn);
      setColumns(mappedColumns);

      if (fieldsRes?.data?.[0]?.tableMeta?.name) {
        setTableName(fieldsRes.data[0].tableMeta.name);
      }

      const rawRecord = recordRes?.data;

      if (rawRecord && Object.keys(rawRecord).length > 0) {
        const mapped = mapRecordData(rawRecord, mappedColumns);
        setRecord(mapped);
        if (!mapped) {
          setError('Could not parse record data');
        }
      } else {
        setError('Record not found');
        setRecord(null);
      }
    } catch (err) {
      console.error('Failed to fetch linked record:', err);
      setError('Failed to load record');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  }, [currentItem, baseId]);

  useEffect(() => {
    if (open && currentItem) {
      fetchRecordData();
    }
  }, [open, currentItem, fetchRecordData]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onClose();
    }
  }, [onClose]);

  const handleLinkedRecordClick = useCallback((foreignTableId: string, recordId: number, title?: string) => {
    onPushRecord({ foreignTableId, recordId, title });
  }, [onPushRecord]);

  if (!open || !currentItem) return null;

  const primaryField = columns.length > 0 ? columns[0] : null;
  const primaryValue = primaryField && record ? (record.cells[primaryField.id]?.displayData || record.cells[primaryField.id]?.data || currentItem.title || 'Linked Record') : (currentItem.title || 'Linked Record');

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2 min-w-0">
            {stack.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={onPopRecord}
                title="Go back"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2 min-w-0">
              <DialogTitle className="text-base truncate">
                {String(primaryValue)}
              </DialogTitle>
              {tableName && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground shrink-0">
                  {tableName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {stack.length > 1 && (
              <span className="text-xs text-muted-foreground mr-2">
                {stack.length} levels deep
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-2">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading record...</span>
            </div>
          )}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="rounded-full bg-destructive/10 p-3">
                <X className="h-5 w-5 text-destructive" />
              </div>
              <p className="text-sm text-destructive font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchRecordData}>
                Try again
              </Button>
            </div>
          )}
          {!loading && !error && record && columns.map(column => {
            const cell = record.cells[column.id];
            if (!cell || (cell.data === null && !cell.displayData)) return null;

            const icon = TYPE_ICONS[column.type] || 'T';

            return (
              <div key={column.id} className="flex items-start gap-4 py-3 px-2 border-b border-border last:border-b-0">
                <div className="flex items-center gap-2 w-40 shrink-0 pt-1.5">
                  <span className="text-muted-foreground text-sm w-5 text-center">{icon}</span>
                  <span className="text-sm font-medium text-muted-foreground truncate">
                    {column.name}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <LinkedFieldValue
                    column={column}
                    cell={cell}
                    onExpandLinkedRecord={handleLinkedRecordClick}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-muted-foreground italic">
              Read-only — viewing record from linked table
            </span>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkedFieldValue({
  column,
  cell,
  onExpandLinkedRecord,
}: {
  column: IColumn;
  cell: ICell;
  onExpandLinkedRecord: (foreignTableId: string, recordId: number, title?: string) => void;
}) {
  if (column.type === CellType.Link) {
    let linkRecords: ILinkRecord[] = [];
    if (Array.isArray(cell.data)) {
      linkRecords = cell.data;
    } else if (typeof cell.data === 'string') {
      try {
        const parsed = JSON.parse(cell.data);
        if (Array.isArray(parsed)) linkRecords = parsed;
      } catch { /* ignore */ }
    }

    const foreignTableId = (column.options as any)?.foreignTableId;

    if (linkRecords.length === 0) {
      return <span className="text-sm text-muted-foreground italic">No linked records</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {linkRecords.map(lr => (
          <button
            key={lr.id}
            onClick={() => foreignTableId && onExpandLinkedRecord(String(foreignTableId), lr.id, lr.title)}
            className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-1 text-sm hover:bg-blue-100 dark:hover:bg-blue-900/60 cursor-pointer transition-colors"
          >
            <span className="max-w-[200px] truncate">{lr.title || `Record ${lr.id}`}</span>
            <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
          </button>
        ))}
      </div>
    );
  }

  if (column.type === CellType.SCQ || column.type === CellType.DropDown) {
    if (!cell.data && !cell.displayData) return <span className="text-sm text-muted-foreground italic">—</span>;
    const val = cell.displayData || String(cell.data ?? '');
    return (
      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-sm font-medium">
        {val}
      </span>
    );
  }

  if (column.type === CellType.MCQ) {
    const values = Array.isArray(cell.data) ? cell.data : (cell.displayData || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    if (values.length === 0) return <span className="text-sm text-muted-foreground italic">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {values.map((val: any, i: number) => (
          <span key={i} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-sm font-medium">
            {String(val)}
          </span>
        ))}
      </div>
    );
  }

  if (column.type === CellType.Lookup) {
    const data = cell.data;
    if (Array.isArray(data) && data.length > 0) {
      return (
        <div className="flex flex-wrap gap-1">
          {data.map((val: any, i: number) => (
            <span key={i} className="inline-block bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-md px-2 py-0.5 text-sm">
              {String(val)}
            </span>
          ))}
        </div>
      );
    }
    return (
      <span className="text-sm text-muted-foreground">
        {cell.displayData || '—'}
      </span>
    );
  }

  if (column.type === CellType.Rollup) {
    return (
      <span className="text-sm font-semibold bg-muted rounded-md px-2.5 py-1 inline-block">
        {cell.displayData || String(cell.data ?? '—')}
      </span>
    );
  }

  if (column.type === CellType.Checkbox || column.type === CellType.YesNo) {
    return (
      <span className="text-sm">
        {cell.data ? '✓ Yes' : '✗ No'}
      </span>
    );
  }

  if (column.type === CellType.Rating) {
    const val = Number(cell.data) || 0;
    const max = (column.options as any)?.max || 5;
    return (
      <span className="text-sm">
        {'★'.repeat(val)}{'☆'.repeat(Math.max(0, max - val))}
      </span>
    );
  }

  const formatted = formatCellValue(cell, column);
  if (!formatted) return <span className="text-sm text-muted-foreground italic">—</span>;

  return (
    <div className="text-sm py-1 px-2.5 bg-muted/50 rounded-md min-h-[32px] flex items-center">
      {formatted}
    </div>
  );
}

export type { LinkedRecordStackItem };
