import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ITableData, IRecord, IRowHeader, RowHeightLevel } from '@/types/grid';
import { CellType, ICell } from '@/types/cell';
import { apiClient } from '@/services/api';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import { decodeParams, encodeParams } from '@/services/url-params';
import {
  formatRecordsFetched,
  formatCreatedRow,
  formatUpdatedRow,
  formatCellDataForBackend,
  formatDateDisplay,
  ExtendedColumn,
  isDefaultView,
  isGridLikeView,
  isOptimisticRecordId,
  shouldApplyRealtimeGridUpdates,
  searchByRowOrder,
  findColumnInsertIndex,
  mapFieldTypeToCellType,
  getColumnWidth,
  parseColumnMeta,
  createEmptyCellForColumn,
} from '@/services/formatters';

interface DecodedParams {
  w?: string;
  pj?: string;
  pr?: string;
  a?: string;
  t?: string;
  v?: string;
}

export function useSheetData() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<ITableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState('');
  const [tableList, setTableList] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<any>(null);

  const [hasNewRecords, setHasNewRecords] = useState(false);
  const [currentTableIdState, setCurrentTableIdState] = useState('');

  const columnsRef = useRef<ExtendedColumn[]>([]);
  const recordsRef = useRef<IRecord[]>([]);
  const rowHeadersRef = useRef<IRowHeader[]>([]);
  const idsRef = useRef<{ assetId: string; tableId: string; viewId: string }>({
    assetId: '',
    tableId: '',
    viewId: '',
  });
  const dataReceivedRef = useRef(false);
  const viewRef = useRef<any>(null);
  const tableListRef = useRef<any[]>([]);
  const currentTableRoomRef = useRef<string | null>(null);
  const currentViewRoomRef = useRef<string | null>(null);
  const pendingOptimisticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingOptimisticIdRef = useRef<string | null>(null);
  const refetchRecordsRef = useRef<() => void>(() => {});

  function generateOptimisticRecordId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  const clearPendingOptimisticTimeout = useCallback(() => {
    if (pendingOptimisticTimeoutRef.current) {
      clearTimeout(pendingOptimisticTimeoutRef.current);
      pendingOptimisticTimeoutRef.current = null;
    }
    pendingOptimisticIdRef.current = null;
  }, []);

  const removeOptimisticRow = useCallback(() => {
    const records = recordsRef.current;
    const idx = records.findIndex((r) => isOptimisticRecordId(String(r.id)));
    if (idx === -1) return;
    const newRecords = records.filter((_, i) => i !== idx);
    const newRowHeaders = rowHeadersRef.current.filter((_, i) => i !== idx).map((h, i) => ({
      ...h,
      rowIndex: i,
      displayIndex: i + 1,
    }));
    recordsRef.current = newRecords;
    rowHeadersRef.current = newRowHeaders;
    setData({
      columns: columnsRef.current,
      records: newRecords,
      rowHeaders: newRowHeaders,
    });
    clearPendingOptimisticTimeout();
  }, [clearPendingOptimisticTimeout]);

  const addOptimisticRow = useCallback((insertIndex: number): string => {
    const cols = columnsRef.current;
    const records = recordsRef.current;
    const rowHeaders = rowHeadersRef.current;
    if (!cols.length) return '';

    const optimisticId = generateOptimisticRecordId();
    const cells: Record<string, ICell> = {};
    cols.forEach((col) => {
      cells[col.id] = createEmptyCellForColumn(col);
    });
    const newRecord: IRecord = { id: optimisticId, cells };
    const newRowHeader: IRowHeader = {
      id: optimisticId,
      rowIndex: insertIndex,
      heightLevel: RowHeightLevel.Short,
      displayIndex: insertIndex + 1,
    };

    const newRecords = [...records];
    newRecords.splice(insertIndex, 0, newRecord);
    const newRowHeaders = [...rowHeaders];
    newRowHeaders.splice(insertIndex, 0, newRowHeader);
    const normalizedRowHeaders = newRowHeaders.map((h, i) => ({
      ...h,
      rowIndex: i,
      displayIndex: i + 1,
    }));

    recordsRef.current = newRecords;
    rowHeadersRef.current = normalizedRowHeaders;
    setData({
      columns: cols,
      records: newRecords,
      rowHeaders: normalizedRowHeaders,
    });

    pendingOptimisticIdRef.current = optimisticId;
    if (pendingOptimisticTimeoutRef.current) clearTimeout(pendingOptimisticTimeoutRef.current);
    pendingOptimisticTimeoutRef.current = setTimeout(() => {
      removeOptimisticRow();
    }, 10000);

    return optimisticId;
  }, [removeOptimisticRow]);

  const qParam = searchParams.get('q') || import.meta.env.VITE_DEFAULT_SHEET_PARAMS || '';
  const decoded = decodeParams<DecodedParams>(qParam);
  const assetId = decoded.a || '';
  const tableId = decoded.t || '';
  const viewId = decoded.v || '';

  useEffect(() => {
    idsRef.current = { assetId, tableId, viewId };
  }, [assetId, tableId, viewId]);

  useEffect(() => {
    viewRef.current = currentView;
  }, [currentView]);

  useEffect(() => {
    tableListRef.current = tableList;
  }, [tableList]);

  const setupSocketListeners = useCallback((
    sock: ReturnType<typeof getSocket>,
    _cols: ExtendedColumn[],
    currentViewId: string,
  ) => {
    if (!sock) return;

    sock.off('recordsFetched');
    sock.off('created_row');
    sock.off('updated_row');
    sock.off('deleted_records');
    sock.off('created_field');
    sock.off('created_fields');
    sock.off('updated_field');
    sock.off('deleted_fields');
    sock.off('sort_updated');
    sock.off('filter_updated');
    sock.off('group_by_updated');
    sock.off('updated_column_meta');
    sock.off('formula_field_errors');
    sock.off('records_changed');
    sock.off('fields_changed');

    sock.on('recordsFetched', (payload: any) => {
      try {
        const result = formatRecordsFetched(payload, currentViewId, viewRef.current?.columnMeta);
        columnsRef.current = result.columns;
        recordsRef.current = result.records;
        rowHeadersRef.current = result.rowHeaders;
        dataReceivedRef.current = true;
        setData({
          columns: result.columns,
          records: result.records,
          rowHeaders: result.rowHeaders,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('[useSheetData] Error formatting recordsFetched:', err);
        setError('Failed to process server data');
        setData({ columns: [], records: [], rowHeaders: [] });
        setIsLoading(false);
      }
    });

    sock.on('created_row', (payload: any) => {
      try {
        if (!isGridLikeView(viewRef.current)) return;
        const currentCols = columnsRef.current;
        if (!currentCols.length) return;
        const payloadArr = Array.isArray(payload) ? payload : [payload];
        const isSameClient = payloadArr[0]?.socket_id === sock.id;

        if (isSameClient) {
          const { newRecord, rowHeader, orderValue } = formatCreatedRow(
            payloadArr,
            currentCols,
            currentViewId,
          );
          const records = recordsRef.current;
          const replaceIndex = records.findIndex((r) =>
            isOptimisticRecordId(String(r.id)),
          );
          if (replaceIndex !== -1) {
            clearPendingOptimisticTimeout();
            const newRecords = [...records];
            newRecords[replaceIndex] = newRecord;
            recordsRef.current = newRecords;
            const newRowHeaders = [...rowHeadersRef.current];
            newRowHeaders[replaceIndex] = {
              ...rowHeader,
              rowIndex: replaceIndex,
            };
            rowHeadersRef.current = newRowHeaders.map((h, i) => ({
              ...h,
              rowIndex: i,
              displayIndex: i + 1,
            }));
            setData({
              columns: currentCols,
              records: recordsRef.current,
              rowHeaders: rowHeadersRef.current,
            });
            return;
          }
          const insertIndex =
            orderValue !== undefined
              ? searchByRowOrder(
                  orderValue,
                  recordsRef.current,
                  rowHeadersRef.current,
                )
              : recordsRef.current.length;
          const newRecords = [...recordsRef.current];
          newRecords.splice(insertIndex, 0, newRecord);
          recordsRef.current = newRecords;
          const newRowHeaders = [...rowHeadersRef.current];
          newRowHeaders.splice(insertIndex, 0, {
            ...rowHeader,
            rowIndex: insertIndex,
          });
          rowHeadersRef.current = newRowHeaders.map((h, i) => ({
            ...h,
            rowIndex: i,
            displayIndex: i + 1,
          }));
          setData({
            columns: currentCols,
            records: recordsRef.current,
            rowHeaders: rowHeadersRef.current,
          });
          return;
        }

        const { newRecord, rowHeader, orderValue } = formatCreatedRow(
          payloadArr,
          currentCols,
          currentViewId,
        );
        let insertIndex: number;
        if (orderValue !== undefined) {
          insertIndex = searchByRowOrder(
            orderValue,
            recordsRef.current,
            rowHeadersRef.current,
          );
        } else {
          insertIndex = recordsRef.current.length;
        }
        const newRecords = [...recordsRef.current];
        newRecords.splice(insertIndex, 0, newRecord);
        recordsRef.current = newRecords;
        const newRowHeaders = [...rowHeadersRef.current];
        newRowHeaders.splice(insertIndex, 0, {
          ...rowHeader,
          rowIndex: insertIndex,
        });
        rowHeadersRef.current = newRowHeaders.map((h, i) => ({
          ...h,
          rowIndex: i,
          displayIndex: i + 1,
        }));
        setData({
          columns: currentCols,
          records: recordsRef.current,
          rowHeaders: rowHeadersRef.current,
        });
      } catch (err) {
        console.error('[useSheetData] Error handling created_row:', err);
      }
    });

    sock.on('updated_row', (payload: any) => {
      try {
        if (!shouldApplyRealtimeGridUpdates(viewRef.current)) return;
        const cv = viewRef.current;
        const hasFilters = cv?.filter && Object.keys(cv.filter).length > 0;
        const hasSorts = cv?.sort?.sortObjs && cv.sort.sortObjs.length > 0;
        if (hasFilters || hasSorts) return;
        const currentCols = columnsRef.current;
        const currentRecords = recordsRef.current;
        if (!currentCols.length || !currentRecords.length) return;
        const payloadArr = Array.isArray(payload) ? payload : [payload];
        const { updatedCells } = formatUpdatedRow(payloadArr, currentCols, currentRecords);
        if (updatedCells.size === 0) return;
        const newRecords = currentRecords.map((record) => {
          const rowId = Number(record.id);
          const updatedCellsForRecord = updatedCells.get(rowId);
          if (!updatedCellsForRecord) return record;
          return { ...record, cells: updatedCellsForRecord };
        });
        recordsRef.current = newRecords;
        setData({
          columns: currentCols,
          records: newRecords,
          rowHeaders: rowHeadersRef.current,
        });
      } catch (err) {
        console.error('[useSheetData] Error handling updated_row:', err);
      }
    });

    sock.on('deleted_records', (payload: any) => {
      try {
        if (!shouldApplyRealtimeGridUpdates(viewRef.current)) return;
        const payloadArr = Array.isArray(payload) ? payload : [payload];
        if (payloadArr[0]?.socket_id === sock.id) return;
        const deletedIds = new Set(payloadArr.map((item: any) => String(item.__id)));
        const newRecords = recordsRef.current.filter((r) => !deletedIds.has(r.id));
        const newRowHeaders = newRecords.map((r, i) => ({
          id: r.id,
          rowIndex: i,
          heightLevel: RowHeightLevel.Short,
          displayIndex: i + 1,
          orderValue: rowHeadersRef.current[i]?.orderValue ?? i + 1,
        }));
        recordsRef.current = newRecords;
        rowHeadersRef.current = newRowHeaders;
        setData({
          columns: columnsRef.current,
          records: newRecords,
          rowHeaders: newRowHeaders,
        });
      } catch (err) {
        console.error('[useSheetData] Error handling deleted_records:', err);
      }
    });

    sock.on('created_field', (newFieldData: any) => {
      try {
        if (!shouldApplyRealtimeGridUpdates(viewRef.current)) {
          setHasNewRecords(true);
          return;
        }
        const field = newFieldData;
        if (!field || !field.dbFieldName) {
          return;
        }
        const currentCols = columnsRef.current;
        const duplicate = currentCols.some(
          (c) =>
            c.dbFieldName === field.dbFieldName ||
            c.id === field.dbFieldName ||
            String(c.rawId) === String(field.id)
        );
        if (duplicate) {
          return;
        }
        const cellType = mapFieldTypeToCellType(field.type ?? 'SHORT_TEXT');
        const cm = parseColumnMeta(viewRef.current?.columnMeta);
        const colWidth = getColumnWidth(field.id, field.type ?? 'SHORT_TEXT', cm);
        const order = typeof field.order === 'number' && Number.isFinite(field.order) ? field.order : currentCols.length + 1;
        const newCol: ExtendedColumn = {
          id: field.dbFieldName,
          name: field.name ?? 'Untitled',
          type: cellType,
          width: typeof colWidth === 'number' && colWidth > 0 ? colWidth : 150,
          isFrozen: false,
          order,
          rawType: field.type ?? 'SHORT_TEXT',
          rawOptions: field.options,
          rawId: field.id,
          dbFieldName: field.dbFieldName,
          description: field.description ?? '',
          computedFieldMeta: field.computedFieldMeta,
          fieldFormat: field.fieldFormat,
          entityType: field.entityType ?? field.options?.entityType,
          identifier: field.identifier ?? field.options?.config?.identifier,
          fieldsToEnrich: field.fieldsToEnrich ?? field.options?.config?.fieldsToEnrich,
          options: cellType === CellType.MCQ || cellType === CellType.SCQ || cellType === CellType.YesNo || cellType === CellType.DropDown ? field.options?.options || [] : undefined,
          status: field.status,
        };
        const insertIdx = findColumnInsertIndex(columnsRef.current, newCol.order);
        const newCols = [...columnsRef.current];
        newCols.splice(insertIdx, 0, newCol);
        columnsRef.current = newCols;
        const newRecords = recordsRef.current.map((rec) => {
          const emptyCell = createEmptyCellForColumn(newCol);
          return {
            ...rec,
            cells: { ...rec.cells, [newCol.id]: emptyCell },
          };
        });
        recordsRef.current = newRecords;
        setData({ columns: newCols, records: newRecords, rowHeaders: rowHeadersRef.current });
      } catch (err) {
        console.error('[useSheetData] created_field handler error:', err);
      }
    });

    sock.on('created_fields', (newFields: any[]) => {
      try {
        if (!Array.isArray(newFields)) return;
        if (!shouldApplyRealtimeGridUpdates(viewRef.current)) {
          setHasNewRecords(true);
          return;
        }
        const existingCols = columnsRef.current;
        const cm = parseColumnMeta(viewRef.current?.columnMeta);
        const newColumns: ExtendedColumn[] = [];
        const fieldsToAdd = newFields
          .filter((field: any) => {
            if (!field || !field.dbFieldName) return false;
            const duplicate = existingCols.some(
              (c) =>
                c.dbFieldName === field.dbFieldName ||
                c.id === field.dbFieldName ||
                String(c.rawId) === String(field.id)
            );
            return !duplicate;
          })
          .map((field: any) => {
            const cellType = mapFieldTypeToCellType(field.type ?? 'SHORT_TEXT');
            const colWidth = getColumnWidth(field.id, field.type ?? 'SHORT_TEXT', cm);
            const newCol: ExtendedColumn = {
              id: field.dbFieldName,
              name: field.name ?? 'Untitled',
              type: cellType,
              width: typeof colWidth === 'number' && colWidth > 0 ? colWidth : 150,
              isFrozen: false,
              order: typeof field.order === 'number' && Number.isFinite(field.order) ? field.order : existingCols.length + newColumns.length + 1,
              rawType: field.type ?? 'SHORT_TEXT',
              rawOptions: field.options,
              rawId: field.id,
              dbFieldName: field.dbFieldName,
              description: field.description ?? '',
              computedFieldMeta: field.computedFieldMeta,
              fieldFormat: field.fieldFormat,
              entityType: field.entityType ?? field.options?.entityType,
              identifier: field.identifier ?? field.options?.config?.identifier,
              fieldsToEnrich: field.fieldsToEnrich ?? field.options?.config?.fieldsToEnrich,
              options: cellType === CellType.MCQ || cellType === CellType.SCQ || cellType === CellType.YesNo || cellType === CellType.DropDown ? field.options?.options || [] : undefined,
              status: field.status,
            };
            newColumns.push(newCol);
            return newCol;
          });
        if (fieldsToAdd.length === 0) return;
        fieldsToAdd.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        let currentCols = [...columnsRef.current];
        fieldsToAdd.forEach((newCol) => {
          const insertIdx = findColumnInsertIndex(currentCols, newCol.order);
          currentCols.splice(insertIdx, 0, newCol);
        });
        columnsRef.current = currentCols;
        const newRecords = recordsRef.current.map((rec) => {
          const newCells = { ...rec.cells };
          fieldsToAdd.forEach((newCol) => {
            newCells[newCol.id] = createEmptyCellForColumn(newCol);
          });
          return { ...rec, cells: newCells };
        });
        recordsRef.current = newRecords;
        setData({ columns: columnsRef.current, records: recordsRef.current, rowHeaders: rowHeadersRef.current });
      } catch (err) {
        console.error('[useSheetData] created_fields handler error:', err);
      }
    });

    sock.on('updated_field', (payload: any) => {
      try {
        const { updatedFields } = payload || {};
        if (!Array.isArray(updatedFields) || !updatedFields.length) return;
        if (!shouldApplyRealtimeGridUpdates(viewRef.current)) {
          setHasNewRecords(true);
          return;
        }
        updatedFields.forEach((f: any) => {
          let idx = columnsRef.current.findIndex((c) => String(c.rawId) === String(f.id));
          if (idx === -1 && f.dbFieldName) {
            idx = columnsRef.current.findIndex((c) => (c as ExtendedColumn).dbFieldName === f.dbFieldName);
          }
          if (idx === -1) {
            return;
          }
          const updated = { ...columnsRef.current[idx] };
          if (f.name !== undefined) updated.name = f.name;
          if (f.type !== undefined) {
            updated.rawType = f.type;
            updated.type = mapFieldTypeToCellType(f.type);
          }
          if (f.options !== undefined) updated.rawOptions = f.options;
          if (f.description !== undefined) updated.description = f.description;
          if (f.options !== undefined) {
            const newCellType = updated.type;
            if (newCellType === CellType.MCQ || newCellType === CellType.SCQ || newCellType === CellType.YesNo || newCellType === CellType.DropDown) {
              updated.options = f.options?.options || f.options?.choices?.map((c: any) => typeof c === 'string' ? c : c.name || c.label || '') || [];
            }
          }
          columnsRef.current[idx] = updated;

          if (f.options !== undefined && (
            updated.type === CellType.DateTime ||
            updated.type === CellType.CreatedTime ||
            updated.type === CellType.LastModifiedTime
          )) {
            let opts: any = {};
            if (f.options) {
              if (f.options.includeTime !== undefined || f.options.dateFormat !== undefined) {
                opts = f.options;
              } else if (f.options.options) {
                opts = f.options.options;
              }
            }
            const df = opts.dateFormat || 'DDMMYYYY';
            const sep = opts.separator || '/';
            const it = opts.includeTime !== undefined ? Boolean(opts.includeTime) : (updated.type !== CellType.DateTime);
            const is24 = Boolean(opts.isTwentyFourHourFormat);
            recordsRef.current = recordsRef.current.map(rec => {
              const cellVal = rec.cells[updated.id];
              if (!cellVal) return rec;
              const raw = (cellVal as any).data;
              return {
                ...rec,
                cells: {
                  ...rec.cells,
                  [updated.id]: {
                    ...cellVal,
                    displayData: formatDateDisplay(raw, df, sep, it, is24),
                    options: { dateFormat: df, separator: sep, includeTime: it, isTwentyFourHourFormat: is24 },
                  },
                },
              };
            });
          }
        });
        columnsRef.current = [...columnsRef.current];
        const nextColumns = columnsRef.current;
        const nextRecords = recordsRef.current;
        const nextRowHeaders = rowHeadersRef.current;
        setData({ columns: nextColumns, records: nextRecords, rowHeaders: nextRowHeaders });
      } catch (err) {
        console.error('[useSheetData] updated_field handler error:', err);
      }
    });

    sock.on('deleted_fields', (payload: any[]) => {
      if (!payload?.length) return;
      const deletedIds = new Set<string>();
      const byDbName: Record<string, string> = {};
      payload.forEach((field: any) => {
        if (field.id != null) deletedIds.add(String(field.id));
        if (field.dbFieldName) byDbName[field.dbFieldName] = field.dbFieldName;
      });
      const newCols = columnsRef.current.filter((col) => {
        const fid = col.rawId != null ? String(col.rawId) : String(col.id);
        return !deletedIds.has(fid) && !(col.dbFieldName && byDbName[col.dbFieldName]);
      });
      columnsRef.current = newCols;
      const newRecords = recordsRef.current.map((rec) => {
        const cells: Record<string, ICell> = {};
        Object.keys(rec.cells).forEach((k) => {
          if (!byDbName[k]) cells[k] = rec.cells[k];
        });
        return { ...rec, cells };
      });
      recordsRef.current = newRecords;
      setData({ columns: newCols, records: newRecords, rowHeaders: rowHeadersRef.current });
    });

    sock.on('sort_updated', (payload: any) => {
      if (!payload) return;
      setCurrentView((prev: any) => ({
        ...(prev || {}),
        sort: payload.sort ?? prev?.sort,
      }));
    });

    sock.on('filter_updated', (payload: any) => {
      if (!payload) return;
      setCurrentView((prev: any) => ({
        ...(prev || {}),
        filter: payload.filter ?? prev?.filter,
      }));
    });

    sock.on('group_by_updated', (payload: any) => {
      if (!payload) return;
      let g = payload.group;
      if (typeof g === 'string') {
        try { g = JSON.parse(g); } catch (_e) { /* keep as-is */ }
      }
      const newGroup = g
        ? {
            ...g,
            groupObjs: (g.groupObjs || []).map((obj: any) => ({
              ...obj,
              fieldId: typeof obj.fieldId === 'string' ? Number(obj.fieldId) : obj.fieldId,
            })),
          }
        : null;
      setCurrentView((prev: any) => ({
        ...(prev || {}),
        group: newGroup ? { ...newGroup } : null,
      }));
    });

    sock.on('updated_column_meta', (payload: any) => {
      if (!payload) return;
      if (payload.socket_id === sock.id) return;
      if (payload.columnMeta?.length) {
        setCurrentView((prev: any) => {
          if (!prev) return prev;
          const meta = parseColumnMeta(prev.columnMeta);
          const next = { ...meta };
          payload.columnMeta.forEach((m: any) => {
            if (!m.id) return;
            next[m.id] = {
              ...(next[m.id] || {}),
              ...(m.width != null && { width: m.width }),
              ...(m.text_wrap && { text_wrap: m.text_wrap }),
              ...(m.is_hidden !== undefined && { is_hidden: m.is_hidden }),
              ...(m.color !== undefined && { color: m.color }),
            };
          });
          return { ...prev, columnMeta: JSON.stringify(next) };
        });
        const all = columnsRef.current;
        const widthUpdates = payload.columnMeta
          .filter((m: any) => m.width != null)
          .map((m: any) => {
            const col = all.find((c) => String(c.rawId) === String(m.id));
            return col ? { colId: col.id, width: m.width } : null;
          })
          .filter(Boolean);
        if (widthUpdates.length) {
          const newCols = all.map((col) => {
            const update = widthUpdates.find((u: any) => u.colId === col.id);
            return update ? { ...col, width: update.width } : col;
          });
          columnsRef.current = newCols;
          setData({ columns: newCols, records: recordsRef.current, rowHeaders: rowHeadersRef.current });
        }
      }
      if (payload.freezeColumns !== undefined) {
        setCurrentView((prev: any) => ({
          ...(prev || {}),
          options: {
            ...(prev?.options || {}),
            freezeColumns: payload.freezeColumns,
          },
        }));
      }
    });

    sock.on('formula_field_errors', (data: any[]) => {
      if (!data?.length) return;
      const all = columnsRef.current;
      let changed = false;
      const newCols = all.map((c) => {
        const match = data.find((f) => String(f.id) === String(c.rawId ?? c.id));
        if (!match || !match.computedFieldMeta) return c;
        changed = true;
        return {
          ...c,
          computedFieldMeta: {
            ...(c.computedFieldMeta || {}),
            hasError: match.computedFieldMeta.hasError,
          },
        };
      });
      if (changed) {
        columnsRef.current = newCols;
        setData({ columns: newCols, records: recordsRef.current, rowHeaders: rowHeadersRef.current });
      }
    });

    sock.on('records_changed', (payload: any) => {
      if (payload?.tableId && payload.tableId !== idsRef.current.tableId) return;
      setHasNewRecords(true);
      if (!isGridLikeView(viewRef.current)) {
        refetchRecordsRef.current?.();
      }
    });

    sock.on('fields_changed', (payload: any) => {
      if (payload?.tableId && payload.tableId === idsRef.current.tableId) {
        setHasNewRecords(true);
      }
    });

    sock.on('computed_field_update', (payload: any) => {
      if (!payload || payload.tableId !== idsRef.current.tableId) return;
      const { values } = payload;
      if (!values || typeof values !== 'object') return;
      setRows((prev: any[]) => {
        const updated = [...prev];
        for (let i = 0; i < updated.length; i++) {
          const row = updated[i];
          const rowId = row?.__id || row?.id;
          if (rowId && values[rowId]) {
            const patchedRow = { ...row };
            const fieldUpdates = values[rowId];
            for (const fieldDbName of Object.keys(fieldUpdates)) {
              patchedRow[fieldDbName] = fieldUpdates[fieldDbName];
            }
            updated[i] = patchedRow;
          }
        }
        return updated;
      });
    });
  }, []);

  const fetchRecords = useCallback(async (
    sock: ReturnType<typeof getSocket>,
    tId: string,
    bId: string,
    vId: string,
  ) => {
    if (!sock?.connected) return;
    if (currentTableRoomRef.current) {
      sock.emit('leaveRoom', currentTableRoomRef.current);
    }
    if (currentViewRoomRef.current) {
      sock.emit('leaveRoom', currentViewRoomRef.current);
    }
    sock.emit('joinRoom', tId);
    sock.emit('joinRoom', vId);
    currentTableRoomRef.current = tId;
    currentViewRoomRef.current = vId;
    sock.emit('getRecord', {
      tableId: tId,
      baseId: bId,
      viewId: vId,
      should_stringify: true,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    let socketTimeout: ReturnType<typeof setTimeout> | null = null;

    const initialize = async () => {
      setIsLoading(true);
      setError(null);

      let finalAssetId = assetId;
      let finalTableId = tableId;
      let finalViewId = viewId;

      try {
        if (!assetId) {
          const createRes = await apiClient.post('/sheet/create_sheet', {
            workspace_id: decoded.w || '',
            parent_id: decoded.pr || '',
          });
          if (cancelled) return;
          const { base, table, view } = createRes.data || {};
          finalAssetId = base?.id || '';
          finalTableId = table?.id || '';
          finalViewId = view?.id || '';

          if (base?.name) {
            setSheetName(base.name);
            document.title = base.name;
          }
          setTableList(table ? [table] : []);
          if (view) setCurrentView(view);

          const newParams = new URLSearchParams();
          newParams.set('q', encodeParams({
            w: decoded.w || '',
            pj: decoded.pj || '',
            pr: decoded.pr || '',
            a: finalAssetId,
            t: finalTableId,
            v: finalViewId,
          }));
          setSearchParams(newParams, { replace: true });
        } else {
          let getSheetSuccess = false;
          try {
            const getRes = await apiClient.post('/sheet/get_sheet', {
              baseId: finalAssetId,
              include_views: true,
              include_tables: true,
            });
            if (cancelled) return;
            const sheetData = getRes.data || {};
            const rawTables = sheetData.tables || [];
            const seen = new Set<string>();
            const tables = rawTables.filter((t: any) => {
              if (!t?.id || seen.has(t.id)) return false;
              seen.add(t.id);
              return t.status !== 'inactive';
            });
            setSheetName(sheetData.name || '');
            if (sheetData.name) document.title = sheetData.name;
            setTableList(tables);

            const currentTable = finalTableId && tables.length
              ? tables.find((t: any) => t.id === finalTableId) || tables[0]
              : tables[0];
            const views = currentTable?.views || [];
            const matchedView = finalViewId && views.length
              ? views.find((v: any) => v?.id === finalViewId) || views[0]
              : views[0];
            if (matchedView) setCurrentView(matchedView);

            if (!finalTableId && currentTable) {
              finalTableId = currentTable.id || '';
              finalViewId = matchedView?.id || '';
              const newParams = new URLSearchParams();
              newParams.set('q', encodeParams({
                ...decoded,
                t: finalTableId,
                v: finalViewId,
              }));
              setSearchParams(newParams, { replace: true });
            }
            getSheetSuccess = true;
          } catch (getSheetErr: any) {
            const status = getSheetErr?.response?.status;
            if (status === 403 || status === 400 || status === 404) {
              console.warn('[useSheetData] get_sheet failed with', status, '- looking for existing sheet');
              if (cancelled) return;

              let foundExisting = false;
              try {
                const sheetsRes = await apiClient.get('/sheet/get_sheets');
                const sheets = sheetsRes.data || [];
                const candidates = [...sheets].reverse();
                for (const candidate of candidates) {
                  if (cancelled) return;
                  try {
                    const existingRes = await apiClient.post('/sheet/get_sheet', {
                      baseId: candidate.id,
                      include_views: true,
                      include_tables: true,
                      user_id: decoded.w || 'dev-user-001',
                    });
                    const existingData = existingRes.data?.data || existingRes.data;
                    const activeTables = (existingData?.tables || []).filter((t: any) => t.status === 'active');
                    if (activeTables.length > 0) {
                      finalAssetId = candidate.id;
                      const firstTable = activeTables[0];
                      finalTableId = firstTable?.id || '';
                      const firstView = firstTable?.views?.[0];
                      finalViewId = firstView?.id || '';
                      if (existingData.name) {
                        setSheetName(existingData.name);
                        document.title = existingData.name;
                      }
                      setTableList(activeTables);
                      if (firstView) setCurrentView(firstView);
                      foundExisting = true;
                      console.log('[useSheetData] Loaded existing sheet:', finalAssetId, 'with', activeTables.length, 'tables');
                      break;
                    }
                  } catch (_) {}
                }
              } catch (listErr) {
                console.warn('[useSheetData] Failed to list existing sheets:', listErr);
              }

              if (!foundExisting) {
                console.log('[useSheetData] No existing sheet found, creating new one');
                const createRes = await apiClient.post('/sheet/create_sheet', {
                  workspace_id: decoded.w || '',
                  parent_id: decoded.pr || '',
                });
                if (cancelled) return;
                const { base, table, view } = createRes.data || {};
                finalAssetId = base?.id || '';
                finalTableId = table?.id || '';
                finalViewId = view?.id || '';

                if (base?.name) {
                  setSheetName(base.name);
                  document.title = base.name;
                }
                setTableList(table ? [table] : []);
                if (view) setCurrentView(view);
              }

              const newParams = new URLSearchParams();
              newParams.set('q', encodeParams({
                w: decoded.w || '',
                pj: decoded.pj || '',
                pr: decoded.pr || '',
                a: finalAssetId,
                t: finalTableId,
                v: finalViewId,
              }));
              setSearchParams(newParams, { replace: true });
              getSheetSuccess = true;
            } else {
              throw getSheetErr;
            }
          }
        }

        if (cancelled) return;

        idsRef.current = { assetId: finalAssetId, tableId: finalTableId, viewId: finalViewId };
        setCurrentTableIdState(finalTableId);

        const sock = connectSocket();

        socketTimeout = setTimeout(() => {
          if (!cancelled && !dataReceivedRef.current) {
            setData({ columns: [], records: [], rowHeaders: [] });
            setIsLoading(false);
          }
        }, 8000);

        const startFetch = () => {
          if (cancelled) return;
          setupSocketListeners(sock, columnsRef.current, finalViewId);
          sock.once('recordsFetched', () => {
            if (socketTimeout) clearTimeout(socketTimeout);
          });
          fetchRecords(sock, finalTableId, finalAssetId, finalViewId);

          sock.off('connect');
          sock.on('connect', () => {
            if (currentTableRoomRef.current) sock.emit('joinRoom', currentTableRoomRef.current);
            if (currentViewRoomRef.current) sock.emit('joinRoom', currentViewRoomRef.current);
            fetchRecords(sock, finalTableId, finalAssetId, finalViewId);
          });
        };

        if (sock.connected) {
          startFetch();
        } else {
          sock.once('connect', startFetch);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('[useSheetData] Initialization error:', err);
        setError(err?.message || 'Failed to connect to backend');
        setData({ columns: [], records: [], rowHeaders: [] });
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      cancelled = true;
      if (socketTimeout) clearTimeout(socketTimeout);
      const sock = getSocket();
      if (sock) {
        if (currentTableRoomRef.current) sock.emit('leaveRoom', currentTableRoomRef.current);
        if (currentViewRoomRef.current) sock.emit('leaveRoom', currentViewRoomRef.current);
      }
      disconnectSocket();
      dataReceivedRef.current = false;
    };
  }, []);

  const emitRowCreate = useCallback(async () => {
    const sock = getSocket();
    const ids = idsRef.current;
    const view = viewRef.current;

    if (!sock) return;
    if (!sock.connected) return;
    if (!ids.tableId || !ids.assetId || !ids.viewId) return;

    if (isDefaultView(view)) {
      try {
        addOptimisticRow(recordsRef.current.length);
      } catch (_e) {
        // optimistic row failed; will still emit
      }
    }

    const payload = {
      tableId: ids.tableId,
      baseId: ids.assetId,
      viewId: ids.viewId,
      fields_info: [],
    };
    sock.emit('row_create', payload);
  }, [addOptimisticRow]);

  const emitRowUpdate = useCallback((rowIndex: number, columnId: string, cell: ICell) => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!sock?.connected || !ids.tableId || !ids.assetId || !ids.viewId) return;

    const records = recordsRef.current;
    const cols = columnsRef.current;
    const record = records[rowIndex];
    if (!record) return;

    const column = cols.find((c) => c.id === columnId);
    if (!column) return;

    const row_id = Number(record.id);
    if (Number.isNaN(row_id)) return;

    const field_id = Number(column.rawId) || Number(column.id);
    if (!field_id || Number.isNaN(field_id)) return;

    const backendData = formatCellDataForBackend(cell);
    const rowHeader = rowHeadersRef.current[rowIndex];

    const payload = {
      tableId: ids.tableId,
      baseId: ids.assetId,
      viewId: ids.viewId,
      column_values: [{
        row_id,
        ...(rowHeader?.displayIndex !== undefined && { order: rowHeader.displayIndex }),
        fields_info: [{ field_id, data: backendData }],
      }],
    };
    sock.emit('row_update', payload);
  }, []);

  const emitRowInsert = useCallback(
    async (targetRowId: string, position: 'before' | 'after') => {
      const sock = getSocket();
      const ids = idsRef.current;
      const view = viewRef.current;

      if (!sock || !sock.connected) return;
      if (!ids.tableId || !ids.assetId || !ids.viewId) return;

      const records = recordsRef.current;
      const rowHeaders = rowHeadersRef.current;
      const targetIndex = records.findIndex(
        (r) => String(r.id) === String(targetRowId),
      );
      const __id =
        typeof targetRowId === 'number'
          ? targetRowId
          : parseInt(String(targetRowId), 10);

      if (!Number.isFinite(__id)) return;

      const order =
        targetIndex >= 0
          ? Number(
              rowHeaders[targetIndex]?.orderValue ??
                rowHeaders[targetIndex]?.displayIndex ??
                targetIndex,
            )
          : 0;
      const order_info = {
        is_above: position === 'before',
        __id,
        order: Number.isFinite(order) ? order : 0,
      };

      const insertIndex =
        targetIndex >= 0
          ? position === 'before'
            ? targetIndex
            : targetIndex + 1
          : records.length;

      if (isDefaultView(view)) {
        try {
          addOptimisticRow(insertIndex);
        } catch (_e) {
          // optimistic row failed; will still emit
        }
      }

      sock.emit('row_create', {
        tableId: ids.tableId,
        baseId: ids.assetId,
        viewId: ids.viewId,
        fields_info: [],
        order_info,
      });
    },
    [addOptimisticRow],
  );

  const deleteRecords = useCallback(async (recordIds: string[]) => {
    const ids = idsRef.current;
    if (!ids.tableId || !ids.assetId || !ids.viewId) return;

    const recordsPayload = recordIds
      .map((id) => Number(id) || parseInt(id, 10))
      .filter((id) => !Number.isNaN(id))
      .map((id) => ({ __id: id, __status: 'inactive' }));

    if (!recordsPayload.length) return;

    try {
      await apiClient.put('/record/update_records_status', {
        tableId: ids.tableId,
        baseId: ids.assetId,
        viewId: ids.viewId,
        records: recordsPayload,
      });
    } catch (err) {
      console.error('[useSheetData] Delete records error:', err);
      throw err;
    }
  }, []);

  const refetchRecords = useCallback(() => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!sock?.connected || !ids.tableId || !ids.assetId || !ids.viewId) return;
    setIsLoading(true);
    fetchRecords(sock, ids.tableId, ids.assetId, ids.viewId);
  }, [fetchRecords]);

  useEffect(() => {
    refetchRecordsRef.current = refetchRecords;
  }, [refetchRecords]);

  const switchTable = useCallback((newTableId: string) => {
    const sock = getSocket();
    const tables = tableListRef.current;
    const table = tables.find((t: any) => t.id === newTableId);
    if (!table) return;
    const defaultView = table.views?.[0];
    const newViewId = defaultView?.id || '';
    const ids = idsRef.current;

    const newParams = new URLSearchParams();
    newParams.set('q', encodeParams({
      w: decoded.w || '',
      pj: decoded.pj || '',
      pr: decoded.pr || '',
      a: ids.assetId,
      t: newTableId,
      v: newViewId,
    }));
    setSearchParams(newParams, { replace: true });

    idsRef.current = { assetId: ids.assetId, tableId: newTableId, viewId: newViewId };
    setCurrentTableIdState(newTableId);
    if (defaultView) setCurrentView(defaultView);

    setIsLoading(true);
    setHasNewRecords(false);
    if (sock?.connected) {
      setupSocketListeners(sock, columnsRef.current, newViewId);
      fetchRecords(sock, newTableId, ids.assetId, newViewId);
      sock.off('connect');
      sock.on('connect', () => {
        if (currentTableRoomRef.current) sock.emit('joinRoom', currentTableRoomRef.current);
        if (currentViewRoomRef.current) sock.emit('joinRoom', currentViewRoomRef.current);
        fetchRecords(sock, newTableId, idsRef.current.assetId, newViewId);
      });
    } else if (sock) {
      setupSocketListeners(sock, columnsRef.current, newViewId);
      sock.off('connect');
      sock.once('connect', () => {
        fetchRecords(sock, newTableId, idsRef.current.assetId, newViewId);
      });
    }
  }, [decoded.w, decoded.pj, decoded.pr, setSearchParams, setupSocketListeners, fetchRecords]);

  const switchView = useCallback((newViewId: string, viewObj?: any) => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!newViewId || newViewId === ids.viewId) return;

    if (viewObj) setCurrentView(viewObj);

    const newParams = new URLSearchParams();
    newParams.set('q', encodeParams({
      w: decoded.w || '',
      pj: decoded.pj || '',
      pr: decoded.pr || '',
      a: ids.assetId,
      t: ids.tableId,
      v: newViewId,
    }));
    setSearchParams(newParams, { replace: true });

    idsRef.current = { ...ids, viewId: newViewId };

    setIsLoading(true);
    setHasNewRecords(false);
    if (sock?.connected) {
      setupSocketListeners(sock, columnsRef.current, newViewId);
      fetchRecords(sock, ids.tableId, ids.assetId, newViewId);
      sock.off('connect');
      sock.on('connect', () => {
        if (currentTableRoomRef.current) sock.emit('joinRoom', currentTableRoomRef.current);
        if (currentViewRoomRef.current) sock.emit('joinRoom', currentViewRoomRef.current);
        fetchRecords(sock, ids.tableId, idsRef.current.assetId, newViewId);
      });
    } else if (sock) {
      setupSocketListeners(sock, columnsRef.current, newViewId);
      sock.off('connect');
      sock.once('connect', () => {
        fetchRecords(sock, ids.tableId, idsRef.current.assetId, newViewId);
      });
    }
  }, [decoded.w, decoded.pj, decoded.pr, setSearchParams, setupSocketListeners, fetchRecords]);

  const emitFieldCreate = useCallback((fieldData: { name: string; type: string; options?: any }) => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!sock?.connected || !ids.tableId) return;
    sock.emit('field_create', {
      tableId: ids.tableId,
      baseId: ids.assetId,
      field: fieldData,
    });
  }, []);

  const emitFieldUpdate = useCallback((fieldId: string, fieldData: { name?: string; type?: string; options?: any }) => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!sock?.connected || !ids.tableId) return;
    sock.emit('field_update', {
      tableId: ids.tableId,
      baseId: ids.assetId,
      fieldId,
      field: fieldData,
    });
  }, []);

  const emitFieldDelete = useCallback((fieldIds: string[]) => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!sock?.connected || !ids.tableId) return;
    sock.emit('delete_fields', {
      tableId: ids.tableId,
      baseId: ids.assetId,
      fieldIds,
    });
  }, []);

  const currentTableId = currentTableIdState || tableId;

  const prevDataColsRef = useRef<number | null>(null);
  useEffect(() => {
    const cols = data?.columns?.length ?? 0;
    if (prevDataColsRef.current !== cols) {
      prevDataColsRef.current = cols;
    }
  }, [data]);

  const getIds = useCallback(() => idsRef.current, []);

  return {
    data,
    isLoading,
    error,
    sheetName,
    tableList,
    currentView,
    currentTableId,

    hasNewRecords,
    emitRowCreate,
    emitRowUpdate,
    emitRowInsert,
    deleteRecords,
    refetchRecords,
    switchTable,
    switchView,
    emitFieldCreate,
    emitFieldUpdate,
    emitFieldDelete,
    clearHasNewRecords: useCallback(() => setHasNewRecords(false), []),
    getIds,
    setTableList,
    setSheetName,
  };
}
