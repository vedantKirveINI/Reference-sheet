import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ITableData, IRecord, IRowHeader, RowHeightLevel } from '@/types/grid';
import { ICell } from '@/types/cell';
import { apiClient } from '@/services/api';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';
import { decodeParams, encodeParams } from '@/services/url-params';
import {
  formatRecordsFetched,
  formatCreatedRow,
  formatUpdatedRow,
  formatCellDataForBackend,
  ExtendedColumn,
} from '@/services/formatters';
import { generateMockTableData } from '@/lib/mock-data';

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
  const [usingMockData, setUsingMockData] = useState(false);

  const columnsRef = useRef<ExtendedColumn[]>([]);
  const recordsRef = useRef<IRecord[]>([]);
  const rowHeadersRef = useRef<IRowHeader[]>([]);
  const idsRef = useRef<{ assetId: string; tableId: string; viewId: string }>({
    assetId: '',
    tableId: '',
    viewId: '',
  });
  const dataReceivedRef = useRef(false);

  const qParam = searchParams.get('q') || import.meta.env.VITE_DEFAULT_SHEET_PARAMS || '';
  const decoded = decodeParams<DecodedParams>(qParam);
  const assetId = decoded.a || '';
  const tableId = decoded.t || '';
  const viewId = decoded.v || '';

  useEffect(() => {
    idsRef.current = { assetId, tableId, viewId };
  }, [assetId, tableId, viewId]);

  const fallbackToMock = useCallback(() => {
    console.warn('[useSheetData] Falling back to mock data');
    const mockData = generateMockTableData();
    setData(mockData);
    setIsLoading(false);
    setUsingMockData(true);
  }, []);

  const setupSocketListeners = useCallback((
    sock: ReturnType<typeof getSocket>,
    cols: ExtendedColumn[],
    currentViewId: string,
  ) => {
    if (!sock) return;

    sock.off('records_fetched');
    sock.off('created_row');
    sock.off('updated_row');
    sock.off('deleted_records');

    sock.on('records_fetched', (payload: any) => {
      try {
        const result = formatRecordsFetched(payload, currentViewId);
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
        console.error('[useSheetData] Error formatting records_fetched:', err);
        fallbackToMock();
      }
    });

    sock.on('created_row', (payload: any) => {
      try {
        const currentCols = columnsRef.current;
        if (!currentCols.length) return;
        const { newRecord, rowHeader } = formatCreatedRow(
          Array.isArray(payload) ? payload : [payload],
          currentCols,
          currentViewId,
        );
        recordsRef.current = [...recordsRef.current, newRecord];
        const newRowHeaders = [...rowHeadersRef.current];
        rowHeader.rowIndex = newRowHeaders.length;
        rowHeader.displayIndex = newRowHeaders.length + 1;
        newRowHeaders.push(rowHeader);
        rowHeadersRef.current = newRowHeaders;
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
        const payloadArr = Array.isArray(payload) ? payload : [payload];
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
  }, [fallbackToMock]);

  const fetchRecords = useCallback((
    sock: ReturnType<typeof getSocket>,
    tId: string,
    bId: string,
    vId: string,
  ) => {
    if (!sock?.connected) return;
    sock.emit('joinRoom', `table_${tId}`);
    sock.emit('joinRoom', `view_${vId}`);
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
          const getRes = await apiClient.post('/sheet/get_sheet', {
            baseId: finalAssetId,
            include_views: true,
            include_tables: true,
          });
          if (cancelled) return;
          const sheetData = getRes.data || {};
          const tables = sheetData.tables || [];
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
        }

        if (cancelled) return;

        idsRef.current = { assetId: finalAssetId, tableId: finalTableId, viewId: finalViewId };

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
          sock.once('records_fetched', () => {
            if (socketTimeout) clearTimeout(socketTimeout);
          });
          fetchRecords(sock, finalTableId, finalAssetId, finalViewId);
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
        fallbackToMock();
      }
    };

    initialize();

    return () => {
      cancelled = true;
      if (socketTimeout) clearTimeout(socketTimeout);
      const sock = getSocket();
      if (sock) {
        const ids = idsRef.current;
        if (ids.tableId) sock.emit('leaveRoom', `table_${ids.tableId}`);
        if (ids.viewId) sock.emit('leaveRoom', `view_${ids.viewId}`);
      }
      disconnectSocket();
      dataReceivedRef.current = false;
    };
  }, []);

  const emitRowCreate = useCallback(async () => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!sock?.connected || !ids.tableId || !ids.assetId || !ids.viewId) return;
    const payload = {
      tableId: ids.tableId,
      baseId: ids.assetId,
      viewId: ids.viewId,
      fields_info: [],
    };
    sock.emit('row_create', payload);
  }, []);

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
    }
  }, []);

  const refetchRecords = useCallback(() => {
    const sock = getSocket();
    const ids = idsRef.current;
    if (!sock?.connected || !ids.tableId || !ids.assetId || !ids.viewId) return;
    setIsLoading(true);
    fetchRecords(sock, ids.tableId, ids.assetId, ids.viewId);
  }, [fetchRecords]);

  return {
    data,
    isLoading,
    error,
    sheetName,
    tableList,
    currentView,
    usingMockData,
    emitRowCreate,
    emitRowUpdate,
    deleteRecords,
    refetchRecords,
  };
}
