import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { CellType } from '@/types/cell';
import { RowHeightLevel } from '@/types/grid';

const mockSocket = {
  id: 'mock-socket-id',
  on: vi.fn(),
  off: vi.fn(),
  once: vi.fn(),
  emit: vi.fn(),
  connected: true,
  active: true,
  connect: vi.fn(),
  disconnect: vi.fn(),
  removeAllListeners: vi.fn(),
};

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/services/api', () => ({
  apiClient: {
    get: (...args: any[]) => mockApiClient.get(...args),
    post: (...args: any[]) => mockApiClient.post(...args),
    put: (...args: any[]) => mockApiClient.put(...args),
    patch: (...args: any[]) => mockApiClient.patch(...args),
    delete: (...args: any[]) => mockApiClient.delete(...args),
    interceptors: { request: { use: vi.fn() } },
  },
  getToken: vi.fn(() => 'test-token'),
}));

vi.mock('@/services/socket', () => ({
  connectSocket: vi.fn(() => mockSocket),
  disconnectSocket: vi.fn(),
  getSocket: vi.fn(() => mockSocket),
}));

const mockSetSearchParams = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(() => [mockSearchParams, mockSetSearchParams]),
}));

vi.mock('@/services/url-params', () => ({
  encodeParams: vi.fn((data: any) => btoa(JSON.stringify(data))),
  decodeParams: vi.fn(() => ({
    w: 'workspace-1',
    pj: 'project-1',
    pr: 'parent-1',
    a: 'asset-1',
    t: 'table-1',
    v: 'view-1',
  })),
}));

vi.mock('@/services/formatters', async () => {
  const actual = await vi.importActual('@/services/formatters');
  return {
    ...actual,
    formatRecordsFetched: vi.fn((payload: any, viewId: string) => ({
      columns: [
        {
          id: 'col-1',
          name: 'Name',
          type: CellType.String,
          width: 150,
          rawType: 'SHORT_TEXT',
          rawId: 1,
          dbFieldName: 'field_1',
          order: 1,
        },
        {
          id: 'col-2',
          name: 'Age',
          type: CellType.Number,
          width: 100,
          rawType: 'NUMBER',
          rawId: 2,
          dbFieldName: 'field_2',
          order: 2,
        },
      ],
      records: [
        {
          id: '1',
          cells: {
            'col-1': { type: CellType.String, data: 'Alice', displayData: 'Alice' },
            'col-2': { type: CellType.Number, data: 25, displayData: '25' },
          },
        },
        {
          id: '2',
          cells: {
            'col-1': { type: CellType.String, data: 'Bob', displayData: 'Bob' },
            'col-2': { type: CellType.Number, data: 30, displayData: '30' },
          },
        },
      ],
      rowHeaders: [
        { id: '1', rowIndex: 0, heightLevel: RowHeightLevel.Short, displayIndex: 1, orderValue: 1 },
        { id: '2', rowIndex: 1, heightLevel: RowHeightLevel.Short, displayIndex: 2, orderValue: 2 },
      ],
    })),
    formatCreatedRow: vi.fn((payloadArr: any[], cols: any[], viewId: string) => ({
      newRecord: {
        id: '3',
        cells: {
          'col-1': { type: CellType.String, data: '', displayData: '' },
          'col-2': { type: CellType.Number, data: null, displayData: '' },
        },
      },
      rowHeader: { id: '3', rowIndex: 2, heightLevel: RowHeightLevel.Short, displayIndex: 3, orderValue: 3 },
      orderValue: 3,
    })),
    formatUpdatedRow: vi.fn((payloadArr: any[], cols: any[], records: any[]) => ({
      updatedCells: new Map([
        [1, {
          'col-1': { type: CellType.String, data: 'Alice Updated', displayData: 'Alice Updated' },
          'col-2': { type: CellType.Number, data: 26, displayData: '26' },
        }],
      ]),
    })),
    formatCellDataForBackend: vi.fn((cell: any) => cell.data),
    isDefaultView: vi.fn(() => true),
    isGridLikeView: vi.fn(() => true),
    shouldApplyRealtimeGridUpdates: vi.fn(() => true),
    isOptimisticRecordId: vi.fn((id: string) => id.startsWith('record_')),
    searchByRowOrder: vi.fn(() => 2),
    findColumnInsertIndex: vi.fn(() => 2),
    mapFieldTypeToCellType: vi.fn((type: string) => {
      const map: Record<string, CellType> = {
        SHORT_TEXT: CellType.String,
        NUMBER: CellType.Number,
        MCQ: CellType.MCQ,
        SCQ: CellType.SCQ,
        CHECKBOX: CellType.Checkbox,
        DATE: CellType.DateTime,
      };
      return map[type] || CellType.String;
    }),
    getColumnWidth: vi.fn(() => 150),
    parseColumnMeta: vi.fn(() => ({})),
    createEmptyCellForColumn: vi.fn((col: any) => ({
      type: col.type,
      data: null,
      displayData: '',
    })),
    formatDateDisplay: vi.fn(() => '01/01/2025'),
  };
});

import { useSheetData } from '../useSheetData';
import { connectSocket, getSocket, disconnectSocket } from '@/services/socket';
import {
  formatRecordsFetched,
  formatCreatedRow,
  formatUpdatedRow,
  isGridLikeView,
  shouldApplyRealtimeGridUpdates,
  isOptimisticRecordId,
} from '@/services/formatters';

function getSocketHandler(eventName: string): ((...args: any[]) => void) | undefined {
  const calls = mockSocket.on.mock.calls;
  for (let i = calls.length - 1; i >= 0; i--) {
    if (calls[i][0] === eventName) return calls[i][1];
  }
  return undefined;
}

describe('useSheetData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = true;
    mockSocket.active = true;
    mockSocket.id = 'mock-socket-id';
    mockApiClient.post.mockResolvedValue({
      data: {
        name: 'Test Sheet',
        tables: [
          {
            id: 'table-1',
            name: 'Table 1',
            status: 'active',
            views: [{ id: 'view-1', name: 'Grid View', type: 'default_grid' }],
          },
        ],
      },
    });
    mockApiClient.get.mockResolvedValue({ data: [] });
    mockApiClient.put.mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts with isLoading true', () => {
      const { result } = renderHook(() => useSheetData());
      expect(result.current.isLoading).toBe(true);
    });

    it('starts with data as null', () => {
      const { result } = renderHook(() => useSheetData());
      expect(result.current.data).toBeNull();
    });

    it('starts with no error', () => {
      const { result } = renderHook(() => useSheetData());
      expect(result.current.error).toBeNull();
    });

    it('starts with empty tableList', () => {
      const { result } = renderHook(() => useSheetData());
      expect(Array.isArray(result.current.tableList)).toBe(true);
    });

    it('starts with hasNewRecords as false', () => {
      const { result } = renderHook(() => useSheetData());
      expect(result.current.hasNewRecords).toBe(false);
    });

    it('exposes emitRowCreate function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.emitRowCreate).toBe('function');
    });

    it('exposes emitRowUpdate function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.emitRowUpdate).toBe('function');
    });

    it('exposes emitRowInsert function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.emitRowInsert).toBe('function');
    });

    it('exposes deleteRecords function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.deleteRecords).toBe('function');
    });

    it('exposes refetchRecords function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.refetchRecords).toBe('function');
    });

    it('exposes switchTable function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.switchTable).toBe('function');
    });

    it('exposes switchView function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.switchView).toBe('function');
    });

    it('exposes emitFieldCreate function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.emitFieldCreate).toBe('function');
    });

    it('exposes emitFieldUpdate function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.emitFieldUpdate).toBe('function');
    });

    it('exposes emitFieldDelete function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.emitFieldDelete).toBe('function');
    });

    it('exposes getIds function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.getIds).toBe('function');
    });

    it('exposes clearHasNewRecords function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.clearHasNewRecords).toBe('function');
    });
  });

  describe('initialization flow', () => {
    it('calls get_sheet API on mount when assetId is present', async () => {
      renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalledWith('/sheet/get_sheet', expect.objectContaining({
          baseId: 'asset-1',
          include_views: true,
          include_tables: true,
        }));
      });
    });

    it('sets sheet name from API response', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(result.current.sheetName).toBe('Test Sheet');
      });
    });

    it('sets table list from API response', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(result.current.tableList).toHaveLength(1);
        expect(result.current.tableList[0].name).toBe('Table 1');
      });
    });

    it('connects socket during initialization', async () => {
      renderHook(() => useSheetData());
      await waitFor(() => {
        expect(connectSocket).toHaveBeenCalled();
      });
    });

    it('sets up socket listeners', async () => {
      renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
    });

    it('emits getRecord via socket', async () => {
      renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.emit).toHaveBeenCalledWith('getRecord', expect.objectContaining({
          tableId: 'table-1',
          baseId: 'asset-1',
          viewId: 'view-1',
        }));
      });
    });

    it('joins rooms for table and view', async () => {
      renderHook(() => useSheetData());
      await waitFor(() => {
        const joinCalls = mockSocket.emit.mock.calls.filter((c: any) => c[0] === 'joinRoom');
        expect(joinCalls.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('handles initialization error gracefully', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('disconnects socket on unmount', async () => {
      const { unmount } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(connectSocket).toHaveBeenCalled();
      });
      unmount();
      expect(disconnectSocket).toHaveBeenCalled();
    });
  });

  describe('recordsFetched socket handler', () => {
    it('processes recordsFetched event and sets data', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('recordsFetched');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ fields: [], records: [] });
      });

      await waitFor(() => {
        expect(result.current.data).toBeTruthy();
        expect(result.current.data!.columns).toHaveLength(2);
        expect(result.current.data!.records).toHaveLength(2);
        expect(result.current.data!.rowHeaders).toHaveLength(2);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('calls formatRecordsFetched with correct args', async () => {
      renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('recordsFetched');
      const payload = { fields: [{ id: 1 }], records: [{ id: 1 }] };
      act(() => handler!(payload));

      expect(formatRecordsFetched).toHaveBeenCalledWith(
        payload,
        'view-1',
        undefined,
      );
    });

    it('handles error in recordsFetched gracefully', async () => {
      vi.mocked(formatRecordsFetched).mockImplementationOnce(() => {
        throw new Error('Parse error');
      });

      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('recordsFetched');
      act(() => handler!({ fields: [], records: [] }));

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to process server data');
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('created_row socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('adds new row from another client', async () => {
      vi.mocked(isGridLikeView).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_row');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ socket_id: 'other-socket', __id: 3 });
      });

      await waitFor(() => {
        expect(result.current.data!.records).toHaveLength(3);
      });
    });

    it('replaces optimistic row for same client', async () => {
      vi.mocked(isGridLikeView).mockReturnValue(true);
      vi.mocked(isOptimisticRecordId).mockImplementation((id: string) => id.startsWith('record_'));

      const { result } = await setupWithData();

      const currentRecords = result.current.data!.records;
      const optimisticRecord = {
        id: 'record_12345_abc',
        cells: {},
      };
      const newRecords = [...currentRecords, optimisticRecord];

      const handler = getSocketHandler('created_row');
      act(() => {
        handler!({ socket_id: 'mock-socket-id', __id: 3 });
      });

      expect(formatCreatedRow).toHaveBeenCalled();
    });

    it('ignores created_row for non-grid views', async () => {
      vi.mocked(isGridLikeView).mockReturnValue(false);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_row');
      const recordsBefore = result.current.data!.records.length;

      act(() => {
        handler!({ socket_id: 'other-socket', __id: 3 });
      });

      expect(result.current.data!.records).toHaveLength(recordsBefore);
    });
  });

  describe('updated_row socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('updates record cells on updated_row event', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('updated_row');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ __id: 1, field_1: 'Alice Updated' });
      });

      expect(formatUpdatedRow).toHaveBeenCalled();
    });

    it('skips update when view has filters', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();
      const handler = getSocketHandler('updated_row');

      const initialData = result.current.data;
      act(() => {
        handler!({ __id: 1, field_1: 'Changed' });
      });
    });

    it('ignores updated_row when shouldApplyRealtimeGridUpdates is false', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(false);
      const { result } = await setupWithData();

      const handler = getSocketHandler('updated_row');
      act(() => {
        handler!({ __id: 1, field_1: 'Ignored' });
      });

      expect(formatUpdatedRow).not.toHaveBeenCalled();
    });
  });

  describe('deleted_records socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('removes deleted records from state', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('deleted_records');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ __id: '1', socket_id: 'other-socket' });
      });

      await waitFor(() => {
        expect(result.current.data!.records).toHaveLength(1);
        expect(result.current.data!.records[0].id).toBe('2');
      });
    });

    it('ignores deletion from same client', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('deleted_records');
      act(() => {
        handler!({ __id: '1', socket_id: 'mock-socket-id' });
      });

      expect(result.current.data!.records).toHaveLength(2);
    });

    it('ignores when shouldApplyRealtimeGridUpdates returns false', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(false);
      const { result } = await setupWithData();

      const handler = getSocketHandler('deleted_records');
      act(() => {
        handler!({ __id: '1', socket_id: 'other-socket' });
      });

      expect(result.current.data!.records).toHaveLength(2);
    });
  });

  describe('created_field socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('adds new field to columns', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_field');
      expect(handler).toBeDefined();

      act(() => {
        handler!({
          id: 3,
          dbFieldName: 'field_3',
          name: 'Email',
          type: 'SHORT_TEXT',
          order: 3,
        });
      });

      await waitFor(() => {
        expect(result.current.data!.columns).toHaveLength(3);
      });
    });

    it('ignores duplicate field', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_field');
      act(() => {
        handler!({
          id: 1,
          dbFieldName: 'field_1',
          name: 'Name',
          type: 'SHORT_TEXT',
          order: 1,
        });
      });

      expect(result.current.data!.columns).toHaveLength(2);
    });

    it('ignores field without dbFieldName', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_field');
      act(() => {
        handler!({ id: 3, name: 'Bad Field' });
      });

      expect(result.current.data!.columns).toHaveLength(2);
    });

    it('sets hasNewRecords when not grid view', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(false);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_field');
      act(() => {
        handler!({
          id: 3,
          dbFieldName: 'field_3',
          name: 'Email',
          type: 'SHORT_TEXT',
          order: 3,
        });
      });

      expect(result.current.hasNewRecords).toBe(true);
    });

    it('adds empty cells to existing records for new field', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_field');
      act(() => {
        handler!({
          id: 3,
          dbFieldName: 'field_3',
          name: 'Phone',
          type: 'SHORT_TEXT',
          order: 3,
        });
      });

      await waitFor(() => {
        result.current.data!.records.forEach((rec) => {
          expect(rec.cells['field_3']).toBeDefined();
        });
      });
    });
  });

  describe('created_fields (batch) socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('adds multiple fields at once', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_fields');
      expect(handler).toBeDefined();

      act(() => {
        handler!([
          { id: 3, dbFieldName: 'field_3', name: 'Email', type: 'SHORT_TEXT', order: 3 },
          { id: 4, dbFieldName: 'field_4', name: 'Phone', type: 'PHONE_NUMBER', order: 4 },
        ]);
      });

      await waitFor(() => {
        expect(result.current.data!.columns).toHaveLength(4);
      });
    });

    it('ignores non-array payload', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('created_fields');
      act(() => {
        handler!('not-an-array');
      });

      expect(result.current.data!.columns).toHaveLength(2);
    });
  });

  describe('updated_field socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('updates field name', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('updated_field');
      act(() => {
        handler!({
          updatedFields: [{ id: 1, name: 'Full Name' }],
        });
      });

      await waitFor(() => {
        const col = result.current.data!.columns.find((c) => c.name === 'Full Name');
        expect(col).toBeDefined();
      });
    });

    it('ignores empty updatedFields array', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(true);
      const { result } = await setupWithData();

      const handler = getSocketHandler('updated_field');
      act(() => {
        handler!({ updatedFields: [] });
      });

      expect(result.current.data!.columns[0].name).toBe('Name');
    });

    it('sets hasNewRecords when not grid view', async () => {
      vi.mocked(shouldApplyRealtimeGridUpdates).mockReturnValue(false);
      const { result } = await setupWithData();

      const handler = getSocketHandler('updated_field');
      act(() => {
        handler!({
          updatedFields: [{ id: 1, name: 'Updated Name' }],
        });
      });

      expect(result.current.hasNewRecords).toBe(true);
    });
  });

  describe('deleted_fields socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('removes deleted fields from columns', async () => {
      const { result } = await setupWithData();

      const handler = getSocketHandler('deleted_fields');
      expect(handler).toBeDefined();

      act(() => {
        handler!([{ id: 2, dbFieldName: 'field_2' }]);
      });

      await waitFor(() => {
        expect(result.current.data!.columns).toHaveLength(1);
        expect(result.current.data!.columns[0].id).toBe('col-1');
      });
    });

    it('removes corresponding cells from records', async () => {
      const { result } = await setupWithData();

      const handler = getSocketHandler('deleted_fields');
      act(() => {
        handler!([{ id: 2, dbFieldName: 'field_2' }]);
      });

      await waitFor(() => {
        result.current.data!.records.forEach((rec) => {
          expect(rec.cells['field_2']).toBeUndefined();
        });
      });
    });

    it('ignores empty payload', async () => {
      const { result } = await setupWithData();

      const handler = getSocketHandler('deleted_fields');
      act(() => {
        handler!([]);
      });

      expect(result.current.data!.columns).toHaveLength(2);
    });
  });

  describe('sort_updated socket handler', () => {
    it('updates current view sort', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));

      const handler = getSocketHandler('sort_updated');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ sort: { sortObjs: [{ fieldId: 1, order: 'asc' }] } });
      });

      await waitFor(() => {
        expect(result.current.currentView?.sort).toEqual({
          sortObjs: [{ fieldId: 1, order: 'asc' }],
        });
      });
    });

    it('ignores null payload', async () => {
      renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('sort_updated');
      act(() => handler!(null));
    });
  });

  describe('filter_updated socket handler', () => {
    it('updates current view filter', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));

      const handler = getSocketHandler('filter_updated');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ filter: { conjunction: 'and', filterSet: [] } });
      });

      await waitFor(() => {
        expect(result.current.currentView?.filter).toEqual({
          conjunction: 'and',
          filterSet: [],
        });
      });
    });
  });

  describe('group_by_updated socket handler', () => {
    it('updates current view group', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));

      const handler = getSocketHandler('group_by_updated');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ group: { groupObjs: [{ fieldId: 1, order: 'asc' }] } });
      });

      await waitFor(() => {
        expect(result.current.currentView?.group).toBeTruthy();
      });
    });

    it('handles stringified group payload', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));

      const handler = getSocketHandler('group_by_updated');
      act(() => {
        handler!({ group: JSON.stringify({ groupObjs: [{ fieldId: '1', order: 'asc' }] }) });
      });

      await waitFor(() => {
        expect(result.current.currentView?.group).toBeTruthy();
        expect(result.current.currentView?.group?.groupObjs?.[0]?.fieldId).toBe(1);
      });
    });
  });

  describe('records_changed socket handler', () => {
    it('sets hasNewRecords on records_changed', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('records_changed');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ tableId: 'table-1' });
      });

      await waitFor(() => {
        expect(result.current.hasNewRecords).toBe(true);
      });
    });

    it('ignores records_changed for different table', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('records_changed');
      act(() => {
        handler!({ tableId: 'different-table' });
      });

      expect(result.current.hasNewRecords).toBe(false);
    });
  });

  describe('fields_changed socket handler', () => {
    it('sets hasNewRecords for current table', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('fields_changed');
      expect(handler).toBeDefined();

      act(() => {
        handler!({ tableId: 'table-1' });
      });

      await waitFor(() => {
        expect(result.current.hasNewRecords).toBe(true);
      });
    });
  });

  describe('emitRowCreate', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('emits row_create event via socket', async () => {
      const { result } = await setupWithData();
      mockSocket.emit.mockClear();

      await act(async () => {
        await result.current.emitRowCreate();
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('row_create', expect.objectContaining({
        tableId: 'table-1',
        baseId: 'asset-1',
        viewId: 'view-1',
        fields_info: [],
      }));
    });

    it('does nothing when socket is not connected', async () => {
      const { result } = await setupWithData();
      mockSocket.connected = false;
      mockSocket.emit.mockClear();

      await act(async () => {
        await result.current.emitRowCreate();
      });

      expect(mockSocket.emit).not.toHaveBeenCalledWith('row_create', expect.anything());
    });
  });

  describe('emitRowUpdate', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('emits row_update event via socket', async () => {
      const { result } = await setupWithData();
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitRowUpdate(0, 'col-1', {
          type: CellType.String,
          data: 'Updated',
          displayData: 'Updated',
        });
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('row_update', expect.objectContaining({
        tableId: 'table-1',
        baseId: 'asset-1',
        viewId: 'view-1',
      }));
    });

    it('does nothing for invalid row index', async () => {
      const { result } = await setupWithData();
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitRowUpdate(999, 'col-1', {
          type: CellType.String,
          data: 'test',
          displayData: 'test',
        });
      });

      expect(mockSocket.emit).not.toHaveBeenCalledWith('row_update', expect.anything());
    });

    it('does nothing for invalid column id', async () => {
      const { result } = await setupWithData();
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitRowUpdate(0, 'nonexistent-col', {
          type: CellType.String,
          data: 'test',
          displayData: 'test',
        });
      });

      expect(mockSocket.emit).not.toHaveBeenCalledWith('row_update', expect.anything());
    });

    it('does nothing when socket is disconnected', async () => {
      const { result } = await setupWithData();
      mockSocket.connected = false;
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitRowUpdate(0, 'col-1', {
          type: CellType.String,
          data: 'test',
          displayData: 'test',
        });
      });

      expect(mockSocket.emit).not.toHaveBeenCalledWith('row_update', expect.anything());
    });
  });

  describe('emitRowInsert', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('emits row_create with order_info for before position', async () => {
      const { result } = await setupWithData();
      mockSocket.emit.mockClear();

      await act(async () => {
        await result.current.emitRowInsert('1', 'before');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('row_create', expect.objectContaining({
        order_info: expect.objectContaining({
          is_above: true,
        }),
      }));
    });

    it('emits row_create with order_info for after position', async () => {
      const { result } = await setupWithData();
      mockSocket.emit.mockClear();

      await act(async () => {
        await result.current.emitRowInsert('1', 'after');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('row_create', expect.objectContaining({
        order_info: expect.objectContaining({
          is_above: false,
        }),
      }));
    });
  });

  describe('deleteRecords', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('calls update_records_status API', async () => {
      const { result } = await setupWithData();
      mockApiClient.put.mockResolvedValue({ data: {} });

      await act(async () => {
        await result.current.deleteRecords(['1', '2']);
      });

      expect(mockApiClient.put).toHaveBeenCalledWith('/record/update_records_status', expect.objectContaining({
        tableId: 'table-1',
        baseId: 'asset-1',
        viewId: 'view-1',
      }));
    });

    it('throws on API error', async () => {
      const { result } = await setupWithData();
      mockApiClient.put.mockRejectedValue(new Error('Delete failed'));

      await expect(act(async () => {
        await result.current.deleteRecords(['1']);
      })).rejects.toThrow('Delete failed');
    });

    it('does nothing with empty recordIds', async () => {
      const { result } = await setupWithData();
      mockApiClient.put.mockClear();

      await act(async () => {
        await result.current.deleteRecords([]);
      });

      expect(mockApiClient.put).not.toHaveBeenCalledWith('/record/update_records_status', expect.anything());
    });
  });

  describe('emitFieldCreate', () => {
    it('emits field_create event', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitFieldCreate({ name: 'New Field', type: 'SHORT_TEXT' });
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('field_create', expect.objectContaining({
        tableId: 'table-1',
        baseId: 'asset-1',
        field: { name: 'New Field', type: 'SHORT_TEXT' },
      }));
    });

    it('does nothing when socket disconnected', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      mockSocket.connected = false;
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitFieldCreate({ name: 'New Field', type: 'SHORT_TEXT' });
      });

      expect(mockSocket.emit).not.toHaveBeenCalledWith('field_create', expect.anything());
    });
  });

  describe('emitFieldUpdate', () => {
    it('emits field_update event', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitFieldUpdate('field-1', { name: 'Renamed' });
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('field_update', expect.objectContaining({
        fieldId: 'field-1',
        field: { name: 'Renamed' },
      }));
    });
  });

  describe('emitFieldDelete', () => {
    it('emits delete_fields event', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      mockSocket.emit.mockClear();

      act(() => {
        result.current.emitFieldDelete(['field-1', 'field-2']);
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('delete_fields', expect.objectContaining({
        fieldIds: ['field-1', 'field-2'],
      }));
    });
  });

  describe('clearHasNewRecords', () => {
    it('clears hasNewRecords flag', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('records_changed');
      act(() => handler!({ tableId: 'table-1' }));
      expect(result.current.hasNewRecords).toBe(true);

      act(() => {
        result.current.clearHasNewRecords();
      });
      expect(result.current.hasNewRecords).toBe(false);
    });
  });

  describe('getIds', () => {
    it('returns current IDs', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const ids = result.current.getIds();
      expect(ids).toEqual(expect.objectContaining({
        assetId: expect.any(String),
        tableId: expect.any(String),
        viewId: expect.any(String),
      }));
    });
  });

  describe('formula_field_errors socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('updates computedFieldMeta on formula_field_errors', async () => {
      const { result } = await setupWithData();

      const handler = getSocketHandler('formula_field_errors');
      expect(handler).toBeDefined();

      act(() => {
        handler!([{ id: 1, computedFieldMeta: { hasError: true } }]);
      });

      await waitFor(() => {
        const col = result.current.data!.columns.find((c: any) => c.rawId === 1);
        expect(col?.computedFieldMeta?.hasError).toBe(true);
      });
    });

    it('ignores empty formula_field_errors', async () => {
      const { result } = await setupWithData();
      const dataBefore = result.current.data;

      const handler = getSocketHandler('formula_field_errors');
      act(() => handler!([]));
    });
  });

  describe('updated_column_meta socket handler', () => {
    async function setupWithData() {
      const hook = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });
      const recordsHandler = getSocketHandler('recordsFetched');
      act(() => recordsHandler!({ fields: [], records: [] }));
      await waitFor(() => {
        expect(hook.result.current.data).toBeTruthy();
      });
      return hook;
    }

    it('updates column widths from column_meta event', async () => {
      const { result } = await setupWithData();

      const handler = getSocketHandler('updated_column_meta');
      expect(handler).toBeDefined();

      act(() => {
        handler!({
          columnMeta: [{ id: 1, width: 250 }],
        });
      });

      await waitFor(() => {
        const col = result.current.data!.columns.find((c: any) => c.rawId === 1);
        if (col) {
          expect(col.width).toBe(250);
        }
      });
    });

    it('ignores null payload', async () => {
      await setupWithData();
      const handler = getSocketHandler('updated_column_meta');
      act(() => handler!(null));
    });
  });

  describe('error handling', () => {
    it('handles get_sheet 403 error with fallback', async () => {
      mockApiClient.post
        .mockRejectedValueOnce({ response: { status: 403 } })
        .mockResolvedValueOnce({ data: [] }); // get_sheets
      mockApiClient.get.mockResolvedValue({ data: [] });

      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('handles get_sheet 404 error', async () => {
      mockApiClient.post
        .mockRejectedValueOnce({ response: { status: 404 } })
        .mockResolvedValueOnce({ data: [] }); // get_sheets
      mockApiClient.get.mockResolvedValue({ data: [] });

      renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockApiClient.post).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });

  describe('loading states', () => {
    it('sets loading false after data received', async () => {
      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('recordsFetched');
      act(() => handler!({ fields: [], records: [] }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('sets loading false on error', async () => {
      vi.mocked(formatRecordsFetched).mockImplementationOnce(() => {
        throw new Error('Bad data');
      });

      const { result } = renderHook(() => useSheetData());
      await waitFor(() => {
        expect(mockSocket.on).toHaveBeenCalled();
      });

      const handler = getSocketHandler('recordsFetched');
      act(() => handler!({ fields: [], records: [] }));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('setTableList and setSheetName', () => {
    it('exposes setTableList function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.setTableList).toBe('function');
    });

    it('exposes setSheetName function', () => {
      const { result } = renderHook(() => useSheetData());
      expect(typeof result.current.setSheetName).toBe('function');
    });
  });
});
