import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, ExternalLink } from 'lucide-react';
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

function mapFieldToColumn(field: any): IColumn {
  const typeMap: Record<string, CellType> = {
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

  return {
    id: String(field.id),
    name: field.name || field.dbFieldName || `Field ${field.id}`,
    type: typeMap[field.type] || CellType.String,
    width: 200,
    options: field.options || {},
  };
}

function mapRecordData(rawRecord: any, columns: IColumn[]): IRecord | null {
  if (!rawRecord) return null;

  const recordId = rawRecord.__id?.value || rawRecord.__id || rawRecord.id;
  const cells: Record<string, ICell> = {};

  for (const col of columns) {
    const rawKey = Object.keys(rawRecord).find(k => {
      const rawVal = rawRecord[k];
      if (typeof rawVal === 'object' && rawVal !== null && 'fieldId' in rawVal) {
        return String(rawVal.fieldId) === col.id;
      }
      return k === col.id || k === `field_${col.id}`;
    });

    let data: any = null;
    let displayData = '';

    if (rawKey) {
      const rawVal = rawRecord[rawKey];
      if (typeof rawVal === 'object' && rawVal !== null && 'value' in rawVal) {
        data = rawVal.value;
        displayData = rawVal.displayValue || String(rawVal.value ?? '');
      } else {
        data = rawVal;
        displayData = String(rawVal ?? '');
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

      const records = recordRes?.data?.records || recordRes?.data?.data?.records || [];
      const rawRecord = Array.isArray(records) ? records[0] : records;

      if (rawRecord) {
        const mapped = mapRecordData(rawRecord, mappedColumns);
        setRecord(mapped);
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2">
            {stack.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onPopRecord}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-base">
              {currentItem.title || 'Linked Record'}
              {tableName && (
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  in {tableName}
                </span>
              )}
            </DialogTitle>
          </div>
          {stack.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {stack.length} levels deep
            </span>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-1 py-2">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading record...</span>
            </div>
          )}
          {error && (
            <div className="text-sm text-destructive text-center py-8">{error}</div>
          )}
          {!loading && !error && record && columns.map(column => {
            const cell = record.cells[column.id];
            if (!cell) return null;

            return (
              <LinkedFieldRow
                key={column.id}
                column={column}
                cell={cell}
                baseId={baseId}
                onExpandLinkedRecord={handleLinkedRecordClick}
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const TYPE_ICONS: Record<string, string> = {
  [CellType.String]: 'T',
  [CellType.Number]: '#',
  [CellType.SCQ]: '◉',
  [CellType.MCQ]: '☑',
  [CellType.DateTime]: '📅',
  [CellType.Link]: '🔗',
  [CellType.Lookup]: '👁',
  [CellType.Rollup]: 'Σ',
  [CellType.Formula]: 'ƒ',
  [CellType.Checkbox]: '☑',
  [CellType.Rating]: '★',
  [CellType.Currency]: '$',
};

function LinkedFieldRow({
  column,
  cell,
  baseId,
  onExpandLinkedRecord,
}: {
  column: IColumn;
  cell: ICell;
  baseId: string;
  onExpandLinkedRecord: (foreignTableId: string, recordId: number, title?: string) => void;
}) {
  const icon = TYPE_ICONS[column.type] || 'T';

  return (
    <div className="flex items-start gap-4 py-3 px-2 border-b border-border last:border-b-0">
      <div className="flex items-center gap-2 w-40 shrink-0 pt-1.5">
        <span className="text-muted-foreground text-sm">{icon}</span>
        <span className="text-sm font-medium text-muted-foreground truncate">
          {column.name}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <LinkedFieldValue
          column={column}
          cell={cell}
          baseId={baseId}
          onExpandLinkedRecord={onExpandLinkedRecord}
        />
      </div>
    </div>
  );
}

function LinkedFieldValue({
  column,
  cell,
  baseId: _baseId,
  onExpandLinkedRecord,
}: {
  column: IColumn;
  cell: ICell;
  baseId: string;
  onExpandLinkedRecord: (foreignTableId: string, recordId: number, title?: string) => void;
}) {
  if (column.type === CellType.Link) {
    const linkRecords: ILinkRecord[] = Array.isArray(cell.data) ? cell.data : [];
    const foreignTableId = (column.options as any)?.foreignTableId;

    if (linkRecords.length === 0) {
      return <span className="text-sm text-muted-foreground">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {linkRecords.map(lr => (
          <button
            key={lr.id}
            onClick={() => foreignTableId && onExpandLinkedRecord(String(foreignTableId), lr.id, lr.title)}
            className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded px-2 py-0.5 text-sm hover:bg-blue-100 dark:hover:bg-blue-800 cursor-pointer transition-colors"
          >
            <span className="max-w-[200px] truncate">{lr.title || `Record ${lr.id}`}</span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </button>
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
            <span key={i} className="inline-block bg-muted rounded px-2 py-0.5 text-sm">
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
      <span className="text-sm">
        {cell.displayData || '—'}
      </span>
    );
  }

  return (
    <div className="text-sm py-1.5">
      {cell.displayData || String(cell.data ?? '—')}
    </div>
  );
}

export type { LinkedRecordStackItem };
