import { BadRequestException } from '@nestjs/common';
import { ViewService } from '../view.service';
import { DEFAULT_VIEW_TYPE } from '../view.constants';

describe('ViewService', () => {
  let service: ViewService;
  let mockEmitter: any;
  let mockLodash: any;
  let mockWinstonLogger: any;
  let mockPrisma: any;
  let mockPrismaTransaction: any;

  beforeEach(() => {
    mockEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn().mockResolvedValue([]),
      onEvent: jest.fn(),
    };

    mockLodash = {
      isEmpty: jest.fn((val) => {
        if (val === null || val === undefined) return true;
        if (typeof val === 'string') return val.length === 0;
        if (typeof val === 'object') return Object.keys(val).length === 0;
        return false;
      }),
    };

    mockWinstonLogger = {
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    };

    mockPrisma = {
      prismaClient: {
        tableMeta: {
          findFirst: jest.fn(),
        },
      },
    };

    mockPrismaTransaction = {
      view: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };

    service = new ViewService(
      mockEmitter,
      mockLodash,
      mockWinstonLogger,
      mockPrisma,
    );
  });

  describe('registerEvents', () => {
    it('should register all expected events', () => {
      const eventNames = mockEmitter.onEvent.mock.calls.map((c: any) => c[0]);
      expect(eventNames).toContain('view.getFieldOrder');
      expect(eventNames).toContain('view.getView');
      expect(eventNames).toContain('view.createView');
      expect(eventNames).toContain('view.updateFilters');
      expect(eventNames).toContain('view.getViewById');
      expect(eventNames).toContain('view.getHighestOrderOfColumn');
      expect(eventNames).toContain('view.setFieldOrder');
      expect(eventNames).toContain('view.updateColumnOrdering');
      expect(eventNames).toContain('view.getViews');
      expect(eventNames).toContain('view.updateSort');
      expect(eventNames).toContain('view.updateGroupBy');
      expect(eventNames).toContain('view.createDuplicateView');
      expect(eventNames).toContain('view.updateColumnMeta');
      expect(eventNames).toContain('view.updateView');
      expect(eventNames).toContain('view.deleteView');
      expect(eventNames).toContain('view.getDefaultViewId');
      expect(eventNames).toContain('view.getViewIdsByTableId');
    });
  });

  describe('getFieldOrder', () => {
    it('should return columnMeta for valid viewId', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        columnMeta: '{"f1":{"order":1}}',
      });
      const result = await service.getFieldOrder('v1', mockPrismaTransaction);
      expect(result).toBe('{"f1":{"order":1}}');
    });

    it('should return undefined if view not found', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue(null);
      const result = await service.getFieldOrder('v999', mockPrismaTransaction);
      expect(result).toBeUndefined();
    });

    it('should throw BadRequestException on error', async () => {
      mockPrismaTransaction.view.findFirst.mockRejectedValue(new Error('DB error'));
      await expect(
        service.getFieldOrder('v1', mockPrismaTransaction),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getViewIdsByTableId', () => {
    it('should return array of view IDs', async () => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([
        { id: 'v1' },
        { id: 'v2' },
      ]);
      const result = await service.getViewIdsByTableId('t1', mockPrismaTransaction);
      expect(result).toEqual(['v1', 'v2']);
      expect(mockPrismaTransaction.view.findMany).toHaveBeenCalledWith({
        where: { tableId: 't1', status: 'active' },
        select: { id: true },
      });
    });

    it('should return empty array when no views', async () => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([]);
      const result = await service.getViewIdsByTableId('t1', mockPrismaTransaction);
      expect(result).toEqual([]);
    });
  });

  describe('getView', () => {
    it('should return a view for valid tableId', async () => {
      const mockView = { id: 'v1', tableId: 't1' };
      mockPrismaTransaction.view.findFirst.mockResolvedValue(mockView);
      const result = await service.getView('t1', mockPrismaTransaction);
      expect(result).toEqual(mockView);
    });

    it('should throw BadRequestException on error', async () => {
      mockPrismaTransaction.view.findFirst.mockRejectedValue(new Error('DB'));
      await expect(
        service.getView('t1', mockPrismaTransaction),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDefaultViewId', () => {
    it('should return default view id when default_grid view exists', async () => {
      mockPrisma.prismaClient.tableMeta.findFirst.mockResolvedValue({
        views: [
          { id: 'v1', type: 'grid' },
          { id: 'v2', type: DEFAULT_VIEW_TYPE },
        ],
      });
      const result = await service.getDefaultViewId('t1', 'b1');
      expect(result).toBe('v2');
    });

    it('should return first view id when no default_grid view', async () => {
      mockPrisma.prismaClient.tableMeta.findFirst.mockResolvedValue({
        views: [
          { id: 'v1', type: 'grid' },
          { id: 'v2', type: 'kanban' },
        ],
      });
      const result = await service.getDefaultViewId('t1', 'b1');
      expect(result).toBe('v1');
    });

    it('should return null when no views', async () => {
      mockPrisma.prismaClient.tableMeta.findFirst.mockResolvedValue({
        views: [],
      });
      const result = await service.getDefaultViewId('t1', 'b1');
      expect(result).toBeNull();
    });

    it('should return null when table not found', async () => {
      mockPrisma.prismaClient.tableMeta.findFirst.mockResolvedValue(null);
      const result = await service.getDefaultViewId('t1', 'b1');
      expect(result).toBeNull();
    });
  });

  describe('createView', () => {
    const basePayload = {
      table_id: 't1',
      baseId: 'b1',
      name: 'My View',
      type: 'grid',
      version: 1,
      order: 1,
      createdBy: 'user1',
    };

    beforeEach(() => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([]);
      mockPrismaTransaction.view.create.mockResolvedValue({
        id: 'new-view-1',
        ...basePayload,
      });
      mockEmitter.emitAsync.mockResolvedValue([]);
      mockPrismaTransaction.$executeRawUnsafe.mockResolvedValue(undefined);
      mockPrismaTransaction.$queryRawUnsafe.mockResolvedValue([]);
    });

    it('should set type to DEFAULT_VIEW_TYPE for first view', async () => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([]);
      await service.createView(basePayload, mockPrismaTransaction);
      const createCall = mockPrismaTransaction.view.create.mock.calls[0][0];
      expect(createCall.data.type).toBe(DEFAULT_VIEW_TYPE);
    });

    it('should use provided type when not first view and no default conflict', async () => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([
        { id: 'v0', type: DEFAULT_VIEW_TYPE },
      ]);
      mockPrismaTransaction.$queryRawUnsafe.mockResolvedValue([{ column_name: '_row_viewv0' }]);
      await service.createView(
        { ...basePayload, type: 'kanban' },
        mockPrismaTransaction,
      );
      const createCall = mockPrismaTransaction.view.create.mock.calls[0][0];
      expect(createCall.data.type).toBe('kanban');
    });

    it('should fall back to grid when type is default_grid but already exists', async () => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([
        { id: 'v0', type: DEFAULT_VIEW_TYPE },
      ]);
      mockPrismaTransaction.$queryRawUnsafe.mockResolvedValue([{ column_name: '_row_viewv0' }]);
      await service.createView(
        { ...basePayload, type: DEFAULT_VIEW_TYPE },
        mockPrismaTransaction,
      );
      const createCall = mockPrismaTransaction.view.create.mock.calls[0][0];
      expect(createCall.data.type).toBe('grid');
    });

    it('should throw BadRequestException when view creation fails', async () => {
      mockPrismaTransaction.view.create.mockRejectedValue(new Error('DB'));
      await expect(
        service.createView(basePayload, mockPrismaTransaction),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when sequence creation fails', async () => {
      mockPrismaTransaction.$executeRawUnsafe.mockRejectedValue(
        new Error('seq error'),
      );
      await expect(
        service.createView(basePayload, mockPrismaTransaction),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateFilters', () => {
    it('should update filter and emit events', async () => {
      const updatedView = { id: 'v1', filter: '{"field":"f1"}' };
      mockPrismaTransaction.view.update.mockResolvedValue(updatedView);
      mockEmitter.emitAsync.mockResolvedValue([{ records: [] }]);

      const payload = {
        id: 'v1',
        filter: '{"field":"f1"}',
        tableId: 't1',
        baseId: 'b1',
        should_stringify: false,
      };

      const result = await service.updateFilters(payload, mockPrismaTransaction);
      expect(result).toEqual(updatedView);
      expect(mockPrismaTransaction.view.update).toHaveBeenCalledWith({
        where: { id: 'v1' },
        data: { filter: '{"field":"f1"}' },
      });
    });

    it('should throw BadRequestException on failure', async () => {
      mockPrismaTransaction.view.update.mockRejectedValue(new Error('fail'));
      await expect(
        service.updateFilters(
          { id: 'v1', filter: '{}', tableId: 't1', baseId: 'b1' },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateSort', () => {
    it('should update sort and emit events', async () => {
      const updatedView = { id: 'v1', sort: '{"sortObjs":[]}' };
      mockPrismaTransaction.view.update.mockResolvedValue(updatedView);
      mockEmitter.emitAsync.mockResolvedValue([{ records: [] }]);

      const result = await service.updateSort(
        { id: 'v1', sort: { sortObjs: [], manualSort: false }, tableId: 't1', baseId: 'b1' },
        mockPrismaTransaction,
      );
      expect(result).toEqual(updatedView);
    });

    it('should throw BadRequestException on failure', async () => {
      mockPrismaTransaction.view.update.mockRejectedValue(new Error('fail'));
      await expect(
        service.updateSort(
          { id: 'v1', sort: { sortObjs: [], manualSort: false }, tableId: 't1', baseId: 'b1' },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateGroupBy', () => {
    it('should update group by and emit events', async () => {
      const existingView = { id: 'v1', tableId: 't1' };
      const updatedView = { id: 'v1', group: { groupObjs: [{ fieldId: 1, order: 'asc' as const, type: 'SHORT_TEXT' }] } };
      mockPrismaTransaction.view.findFirst.mockResolvedValue(existingView);
      mockPrismaTransaction.view.update.mockResolvedValue(updatedView);
      mockEmitter.emitAsync.mockResolvedValue([{ records: [] }]);

      const result = await service.updateGroupBy(
        {
          id: 'v1',
          groupBy: { groupObjs: [{ fieldId: 1, order: 'asc' as const, type: 'SHORT_TEXT' }] },
          tableId: 't1',
          baseId: 'b1',
        },
        mockPrismaTransaction,
      );
      expect(result).toEqual(updatedView);
    });

    it('should throw if view not found', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue(null);
      await expect(
        service.updateGroupBy(
          {
            id: 'v1',
            groupBy: { groupObjs: [] },
            tableId: 't1',
            baseId: 'b1',
          },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set group to null for empty groupObjs', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        tableId: 't1',
      });
      mockPrismaTransaction.view.update.mockResolvedValue({ id: 'v1', group: null });
      mockEmitter.emitAsync.mockResolvedValue([{ records: [] }]);

      await service.updateGroupBy(
        {
          id: 'v1',
          groupBy: { groupObjs: [] },
          tableId: 't1',
          baseId: 'b1',
        },
        mockPrismaTransaction,
      );

      const updateCall = mockPrismaTransaction.view.update.mock.calls[0][0];
      expect(updateCall.data.group).not.toEqual({ groupObjs: [] });
    });
  });

  describe('getViewById', () => {
    it('should return view when found', async () => {
      const view = { id: 'v1', name: 'Test' };
      mockPrismaTransaction.view.findFirst.mockResolvedValue(view);
      const result = await service.getViewById('v1', mockPrismaTransaction);
      expect(result).toEqual(view);
    });

    it('should throw when view not found', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue(null);
      await expect(
        service.getViewById('v999', mockPrismaTransaction),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getHighestOrderOfColumn', () => {
    it('should return 0 for empty columnMeta', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        columnMeta: '{}',
      });
      mockLodash.isEmpty.mockReturnValue(true);
      const result = await service.getHighestOrderOfColumn(
        { viewId: 'v1' },
        mockPrismaTransaction,
      );
      expect(result).toBe(0);
    });

    it('should return highest order value', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        columnMeta: '{"f1":{"order":3},"f2":{"order":7},"f3":{"order":1}}',
      });
      mockLodash.isEmpty.mockReturnValue(false);
      const result = await service.getHighestOrderOfColumn(
        { viewId: 'v1' },
        mockPrismaTransaction,
      );
      expect(result).toBe(7);
    });
  });

  describe('setFieldOrder', () => {
    it('should update columnMeta with field order', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        columnMeta: '{"f1":{"order":1}}',
      });
      mockPrismaTransaction.view.update.mockResolvedValue({ id: 'v1' });

      await service.setFieldOrder(
        'v1',
        [{ field_id: 2, order: 2 }],
        mockPrismaTransaction,
      );

      const updateCall = mockPrismaTransaction.view.update.mock.calls[0][0];
      const newMeta = JSON.parse(updateCall.data.columnMeta);
      expect(newMeta.f1.order).toBe(1);
      expect(newMeta['2'].order).toBe(2);
    });

    it('should preserve width and text_wrap', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        columnMeta: '{}',
      });
      mockPrismaTransaction.view.update.mockResolvedValue({ id: 'v1' });

      await service.setFieldOrder(
        'v1',
        [{ field_id: 1, order: 1, width: 200, text_wrap: 'wrap' }],
        mockPrismaTransaction,
      );

      const updateCall = mockPrismaTransaction.view.update.mock.calls[0][0];
      const newMeta = JSON.parse(updateCall.data.columnMeta);
      expect(newMeta['1'].width).toBe(200);
      expect(newMeta['1'].text_wrap).toBe('wrap');
    });

    it('should throw on update failure', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        columnMeta: '{}',
      });
      mockPrismaTransaction.view.update.mockRejectedValue(new Error('fail'));
      await expect(
        service.setFieldOrder('v1', [{ field_id: 1, order: 1 }], mockPrismaTransaction),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getViews', () => {
    it('should return views without fields when is_field_required is false', async () => {
      const views = [{ id: 'v1' }, { id: 'v2' }];
      mockPrismaTransaction.view.findMany.mockResolvedValue(views);
      mockEmitter.emitAsync.mockResolvedValue([[]]);

      const result = await service.getViews(
        { baseId: 'b1', is_field_required: false },
        mockPrismaTransaction,
      );
      expect(result).toEqual(views);
    });

    it('should build where clause from payload keys', async () => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([]);
      mockEmitter.emitAsync.mockResolvedValue([[]]);

      await service.getViews(
        { baseId: 'b1', tableId: 't1' },
        mockPrismaTransaction,
      );

      expect(mockPrismaTransaction.view.findMany).toHaveBeenCalledWith({
        where: { tableId: 't1' },
        orderBy: { createdTime: 'desc' },
      });
    });

    it('should handle array id values with in operator', async () => {
      mockPrismaTransaction.view.findMany.mockResolvedValue([]);
      mockEmitter.emitAsync.mockResolvedValue([[]]);

      await service.getViews(
        { baseId: 'b1', id: ['v1', 'v2'] as any },
        mockPrismaTransaction,
      );

      expect(mockPrismaTransaction.view.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['v1', 'v2'] } },
        orderBy: { createdTime: 'desc' },
      });
    });
  });

  describe('updateColumnMeta', () => {
    it('should update column width and visibility', async () => {
      mockPrismaTransaction.view.findUniqueOrThrow.mockResolvedValue({
        columnMeta: '{"1":{"order":1}}',
      });
      mockPrismaTransaction.view.update.mockResolvedValue({});

      const payload = {
        viewId: 'v1',
        baseId: 'b1',
        tableId: 't1',
        columnMeta: [{ id: 1, width: 200, is_hidden: true }],
      } as any;

      const result = await service.updateColumnMeta(payload, mockPrismaTransaction);
      expect(result).toEqual(payload);

      const updateCall = mockPrismaTransaction.view.update.mock.calls[0][0];
      const meta = JSON.parse(updateCall.data.columnMeta);
      expect(meta['1'].width).toBe(200);
      expect(meta['1'].is_hidden).toBe(true);
      expect(meta['1'].order).toBe(1);
    });

    it('should update column color', async () => {
      mockPrismaTransaction.view.findUniqueOrThrow.mockResolvedValue({
        columnMeta: '{"1":{"order":1}}',
      });
      mockPrismaTransaction.view.update.mockResolvedValue({});

      await service.updateColumnMeta(
        {
          viewId: 'v1',
          baseId: 'b1',
          tableId: 't1',
          columnMeta: [{ id: 1, color: '#ff0000' }],
        },
        mockPrismaTransaction,
      );

      const updateCall = mockPrismaTransaction.view.update.mock.calls[0][0];
      const meta = JSON.parse(updateCall.data.columnMeta);
      expect(meta['1'].color).toBe('#ff0000');
    });

    it('should throw when view not found', async () => {
      mockPrismaTransaction.view.findUniqueOrThrow.mockRejectedValue(
        new Error('not found'),
      );
      await expect(
        service.updateColumnMeta(
          { viewId: 'v999', baseId: 'b1', tableId: 't1', columnMeta: [] },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when column meta entry missing id', async () => {
      mockPrismaTransaction.view.findUniqueOrThrow.mockResolvedValue({
        columnMeta: '{}',
      });
      await expect(
        service.updateColumnMeta(
          {
            viewId: 'v1',
            baseId: 'b1',
            tableId: 't1',
            columnMeta: [{ width: 200 }] as any,
          },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should emit socket event when is_http is true', async () => {
      mockPrismaTransaction.view.findUniqueOrThrow.mockResolvedValue({
        columnMeta: '{}',
      });
      mockPrismaTransaction.view.update.mockResolvedValue({});

      const payload = {
        viewId: 'v1',
        baseId: 'b1',
        tableId: 't1',
        columnMeta: [{ id: 1, width: 100 }],
      };

      await service.updateColumnMeta(payload, mockPrismaTransaction, true);
      expect(mockEmitter.emit).toHaveBeenCalledWith(
        'emit_updated_column_meta',
        payload,
        't1',
      );
    });
  });

  describe('updateView', () => {
    it('should update view name', async () => {
      const existingView = { id: 'v1', tableId: 't1', name: 'Old' };
      const updatedView = { ...existingView, name: 'New' };
      mockPrismaTransaction.view.findFirst.mockResolvedValue(existingView);
      mockPrismaTransaction.view.update.mockResolvedValue(updatedView);

      const result = await service.updateView(
        { id: 'v1', name: 'New', tableId: 't1', baseId: 'b1' },
        mockPrismaTransaction,
      );
      expect(result.name).toBe('New');
      expect(mockEmitter.emit).toHaveBeenCalledWith(
        'emit_view_updated',
        updatedView,
        't1',
      );
    });

    it('should throw when view not found', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue(null);
      await expect(
        service.updateView(
          { id: 'v999', tableId: 't1', baseId: 'b1' },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should only update provided fields', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({ id: 'v1', tableId: 't1' });
      mockPrismaTransaction.view.update.mockResolvedValue({ id: 'v1' });

      await service.updateView(
        { id: 'v1', tableId: 't1', baseId: 'b1', order: 5 },
        mockPrismaTransaction,
      );

      const updateCall = mockPrismaTransaction.view.update.mock.calls[0][0];
      expect(updateCall.data).toEqual({ order: 5 });
    });
  });

  describe('deleteView', () => {
    it('should soft delete view by setting status to inactive', async () => {
      const existingView = { id: 'v1', tableId: 't1', status: 'active' };
      const deletedView = { ...existingView, status: 'inactive' };
      mockPrismaTransaction.view.findFirst.mockResolvedValue(existingView);
      mockPrismaTransaction.view.update.mockResolvedValue(deletedView);

      const result = await service.deleteView(
        { id: 'v1', tableId: 't1', baseId: 'b1' },
        mockPrismaTransaction,
      );
      expect(result.status).toBe('inactive');
      expect(mockEmitter.emit).toHaveBeenCalledWith(
        'emit_view_deleted',
        deletedView,
        't1',
      );
    });

    it('should throw when view not found', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue(null);
      await expect(
        service.deleteView(
          { id: 'v999', tableId: 't1', baseId: 'b1' },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when view already deleted', async () => {
      mockPrismaTransaction.view.findFirst.mockResolvedValue({
        id: 'v1',
        tableId: 't1',
        status: 'inactive',
      });
      await expect(
        service.deleteView(
          { id: 'v1', tableId: 't1', baseId: 'b1' },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createNewColumnMeta', () => {
    it('should map old field IDs to new field IDs', () => {
      const mapping = { old1: 'new1', old2: 'new2' } as any;
      const columnMeta = { old1: { order: 1 }, old2: { order: 2 }, old3: { order: 3 } };
      const result = service.createNewColumnMeta(mapping, columnMeta);
      expect(result).toEqual({ new1: { order: 1 }, new2: { order: 2 } });
    });
  });

  describe('createNewSort', () => {
    it('should map field IDs in sort objects', () => {
      const mapping = { '10': 20 } as any;
      const sort = {
        sortObjs: [{ fieldId: 10, direction: 'asc' }],
        manualSort: false,
      };
      const result = service.createNewSort(mapping, sort as any);
      expect(result.sortObjs[0].fieldId).toBe(20);
    });

    it('should keep unmapped sort fields unchanged', () => {
      const mapping = {} as any;
      const sort = {
        sortObjs: [{ fieldId: 10, direction: 'asc' }],
        manualSort: true,
      };
      const result = service.createNewSort(mapping, sort as any);
      expect(result.sortObjs[0].fieldId).toBe(10);
      expect(result.manualSort).toBe(true);
    });
  });

  describe('createNewFilter', () => {
    it('should map field in leaf nodes', () => {
      const mapping = { f1: 'f2' } as any;
      const filter = { field: 'f1', operator: 'eq', value: 'test' };
      const result: any = service.createNewFilter(mapping, filter as any);
      expect(result.field).toBe('f2');
    });

    it('should recursively map nested group filters', () => {
      const mapping = { f1: 'f2', f3: 'f4' } as any;
      const filter = {
        conjunction: 'AND',
        childs: [
          { field: 'f1', operator: 'eq', value: 'a' },
          { field: 'f3', operator: 'gt', value: 5 },
        ],
      };
      const result: any = service.createNewFilter(mapping, filter as any);
      expect(result.childs[0].field).toBe('f2');
      expect(result.childs[1].field).toBe('f4');
    });
  });

  describe('view.constants', () => {
    it('should export DEFAULT_VIEW_TYPE as default_grid', () => {
      expect(DEFAULT_VIEW_TYPE).toBe('default_grid');
    });
  });
});
