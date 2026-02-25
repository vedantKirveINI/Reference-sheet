import { useState, useCallback, useRef } from 'react';
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
import type { IPhoneNumberData, ICurrencyData, IAddressData } from '@/types';
import { Star, ChevronLeft, ChevronRight, MoreHorizontal, Copy, Link, Trash2, MessageSquare, Sparkles, History } from 'lucide-react';
import { useAIChatStore } from '@/stores/ai-chat-store';
import { CommentPanel } from '@/components/comments/comment-panel';
import { RecordHistoryPanel } from '@/components/record-history-panel';
import { AddressEditor } from '@/components/editors/address-editor';
import { PhoneNumberEditor } from '@/components/editors/phone-number-editor';
import { CurrencyEditor } from '@/components/editors/currency-editor';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { getFileUploadUrl, uploadFileToPresignedUrl, confirmFileUpload, updateLinkCell, searchForeignRecords, triggerButtonClick } from '@/services/api';
import { LinkEditor } from '@/components/editors/link-editor';
import { ButtonEditor } from '@/components/editors/button-editor';
import { ILinkRecord } from '@/types/cell';
import type { IButtonOptions } from '@/types/cell';

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
};

interface ExpandedRecordModalProps {
  open: boolean;
  record: IRecord | null;
  columns: IColumn[];
  tableId?: string;
  baseId?: string;
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
  onExpandLinkedRecord?: (foreignTableId: string, recordId: number, title?: string) => void;
}

export function ExpandedRecordModal({ open, record, columns, tableId, baseId, onClose, onSave, onDelete, onDuplicate, onPrev, onNext, hasPrev, hasNext, currentIndex, totalRecords, onExpandLinkedRecord }: ExpandedRecordModalProps) {
  const { t } = useTranslation();
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [showComments, setShowComments] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

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
      <DialogContent className={`max-h-[85vh] overflow-hidden flex flex-col ${(showComments || showHistory) ? 'sm:max-w-4xl' : 'sm:max-w-2xl'} transition-all`}>
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
              variant={showHistory ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => { setShowHistory(!showHistory); if (!showHistory) setShowComments(false); }}
              title={t('history.history')}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant={showComments ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={() => { setShowComments(!showComments); if (!showComments) setShowHistory(false); }}
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
        <div className={`flex-1 overflow-hidden flex ${(showComments || showHistory) ? 'gap-0' : ''}`}>
          <div className={`${(showComments || showHistory) ? 'flex-1 border-r border-border' : 'w-full'} overflow-y-auto space-y-1 py-2`}>
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
          {showHistory && baseId && tableId && (
            <div className="w-[320px] flex-shrink-0 overflow-hidden flex flex-col">
              <RecordHistoryPanel
                baseId={baseId}
                tableId={tableId}
                recordId={record.id}
              />
            </div>
          )}
          {showComments && (
            <div className="w-[320px] flex-shrink-0 overflow-hidden flex flex-col">
              <CommentPanel
                tableId={tableId || ''}
                recordId={record.id}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {t('close')}
          </Button>
          <Button onClick={handleSave}>
            {t('save')}
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
      return (
        <input
          type="text"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.Number:
      return (
        <input
          type="number"
          value={currentValue ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );

    case CellType.CreatedTime:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center">
          {cell.displayData || '—'}
          <span className="ml-2 text-xs text-muted-foreground/70">{t('fields.autoGenerated')}</span>
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
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
      const zipData = rawZip && typeof rawZip === 'object' ? rawZip as { countryCode?: string; zipCode?: string } : typeof rawZip === 'string' ? { countryCode: '', zipCode: rawZip } : null;
      const zipVal = zipData?.zipCode ?? '';
      const zipCountry = zipData?.countryCode ?? '';
      return (
        <input
          type="text"
          value={zipVal}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v.trim() ? { countryCode: zipCountry, zipCode: v } : null);
          }}
          placeholder={t('records.enterZipCode')}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );
    }

    case CellType.Formula:
    case CellType.Enrichment:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center italic">
          {cell.displayData || '—'}
          <span className="ml-2 text-xs text-muted-foreground/70">{t('fields.computed')}</span>
        </div>
      );

    case CellType.List: {
      const listVal = Array.isArray(currentValue) ? currentValue.join(', ') : (currentValue ?? '');
      return (
        <input
          type="text"
          value={listVal}
          onChange={(e) => onChange(e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
          placeholder={t('records.enterCommaValues')}
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      );
    }

    case CellType.Ranking: {
      const items: string[] = Array.isArray(currentValue) ? currentValue.map(String) : [];
      if (items.length === 0) {
        return (
          <input type="number" min="1" value={currentValue ?? ''} 
            onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
            placeholder={t('records.enterRank')} 
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
        );
      }
      return (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded text-sm">
              <span className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium">{i + 1}</span>
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
            <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md">
              {t('records.noSignature')}
            </div>
          )}
        </div>
      );
    }

    case CellType.FileUpload:
      return <FileUploadEditor currentValue={currentValue} onChange={onChange} />;

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
          } catch (err) {
            console.error('Failed to update link cell:', err);
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
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center italic">
          {typeof currentValue === 'object' && currentValue ? (currentValue.name || currentValue.email || '—') : (cell.displayData || '—')}
          <span className="ml-2 text-xs text-muted-foreground/70">{t('fields.systemField')}</span>
        </div>
      );

    case CellType.LastModifiedTime:
    case CellType.AutoNumber:
      return (
        <div className="text-sm text-muted-foreground py-1.5 px-3 bg-muted rounded-md min-h-[36px] flex items-center italic">
          {cell.displayData || '—'}
          <span className="ml-2 text-xs text-muted-foreground/70">(auto)</span>
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
          } catch (err) {
            console.error('Button click failed:', err);
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

  const selectedLabels = Array.isArray(currentValue) ? currentValue.map((v: any) => typeof v === 'string' ? v : v.label) : [];

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
  const selectedValues = selectedLabels;

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {allLabels.length > 5 && (
        <div className="p-1.5 border-b border-border">
          <input type="text" placeholder="Search options..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-2 py-1 text-sm border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-400" />
        </div>
      )}
      {selectedValues.length > 0 && (
        <div className="px-2 py-1.5 flex flex-wrap gap-1 border-b border-border">
          {selectedValues.map((v: string) => (
            <span key={v} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs">
              {v}
              <button onClick={() => toggleOption(v)} className="hover:text-emerald-900">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options found</div>}
        {filtered.map(label => {
          const isSelected = selectedValues.includes(label);
          return (
            <button key={label} onClick={() => toggleOption(label)}
              className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                isSelected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-accent'
              }`}>
              <span className="inline-flex items-center gap-2">
                <span className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${
                  isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-muted-foreground/30'
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

  const addNewTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    onChange([...selected, trimmed]);
    setSearch('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && search.trim()) {
      e.preventDefault();
      const exactMatch = options.find(o => o.toLowerCase() === search.trim().toLowerCase());
      if (exactMatch) {
        toggleOption(exactMatch);
      } else {
        addNewTag(search);
      }
      setSearch('');
    }
  };

  const showCreateOption = search.trim() && !options.some(o => o.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="p-1.5 border-b border-border">
        <input type="text" placeholder="Search or create tag..." value={search} onChange={e => setSearch(e.target.value)}
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
        {showCreateOption && (
          <button onClick={() => addNewTag(search)} className="w-full text-left px-2 py-1.5 text-sm rounded transition-colors hover:bg-accent text-emerald-600 font-medium">
            + Create "{search.trim()}"
          </button>
        )}
        {filtered.length === 0 && !showCreateOption && <div className="px-2 py-1.5 text-xs text-muted-foreground">No options found</div>}
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
