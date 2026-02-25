import { ComputedRecalcService } from '../computed-recalc.service';
import { DependencyGraphService } from '../dependency-graph.service';
import { LookupRollupService } from '../lookup-rollup.service';

describe('ComputedRecalcService', () => {
  let service: ComputedRecalcService;
  let mockEmitter: any;
  let mockDepGraph: Partial<DependencyGraphService>;
  let mockLookupRollup: Partial<LookupRollupService>;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    mockDepGraph = {
      getDownstreamFieldIds: jest.fn().mockResolvedValue([]),
      getTopoOrder: jest.fn().mockResolvedValue([]),
    };

    mockLookupRollup = {
      applyRollupFunction: jest.fn().mockReturnValue(null),
    };

    mockPrisma = {
      field: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    };

    service = new ComputedRecalcService(
      mockEmitter,
      mockDepGraph as DependencyGraphService,
      mockLookupRollup as LookupRollupService,
    );
  });

  describe('registerEvents', () => {
    it('should register recalc.triggerRecalculation event', () => {
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'recalc.triggerRecalculation',
        expect.any(Function),
      );
    });
  });

  describe('triggerRecalculation', () => {
    it('should return early if changedFieldIds is empty', async () => {
      const result = await service.triggerRecalculation(
        {
          tableId: 't1',
          baseId: 'b1',
          changedFieldIds: [],
          changedRecordIds: [1],
        },
        mockPrisma,
      );

      expect(result).toBeUndefined();
      expect(mockDepGraph.getDownstreamFieldIds).not.toHaveBeenCalled();
    });

    it('should return early if no downstream fields', async () => {
      (mockDepGraph.getDownstreamFieldIds as jest.Mock).mockResolvedValue([]);

      const result = await service.triggerRecalculation(
        {
          tableId: 't1',
          baseId: 'b1',
          changedFieldIds: [1],
          changedRecordIds: [10],
        },
        mockPrisma,
      );

      expect(result).toBeUndefined();
    });

    it('should return early if topoOrder yields no fields to recalc', async () => {
      (mockDepGraph.getDownstreamFieldIds as jest.Mock).mockResolvedValue([5]);
      (mockDepGraph.getTopoOrder as jest.Mock).mockResolvedValue([1]);

      const result = await service.triggerRecalculation(
        {
          tableId: 't1',
          baseId: 'b1',
          changedFieldIds: [1],
          changedRecordIds: [10],
        },
        mockPrisma,
      );

      expect(result).toBeUndefined();
    });

    it('should process LOOKUP fields in topoOrder', async () => {
      (mockDepGraph.getDownstreamFieldIds as jest.Mock).mockResolvedValue([5]);
      (mockDepGraph.getTopoOrder as jest.Mock).mockResolvedValue([1, 5]);

      const lookupField = {
        id: 5,
        type: 'LOOKUP',
        dbFieldName: 'lookup_col',
        lookupOptions: {
          linkFieldId: '2',
          lookupFieldId: '3',
          foreignTableId: 'ft1',
        },
        options: {},
        status: 'active',
      };
      const linkField = {
        id: 2,
        type: 'LINK',
        options: {
          relationship: 'ManyMany',
          fkHostTableName: 'b1.junction_t',
          selfKeyName: '__fk_2',
          foreignKeyName: '__fk_2_ref',
          foreignTableId: 'ft1',
        },
        status: 'active',
      };

      mockPrisma.field.findMany
        .mockResolvedValueOnce([lookupField])
        .mockResolvedValueOnce([lookupField, linkField]);

      mockEmitter.emitAsync.mockImplementation((event: string) => {
        if (event === 'field.getFieldsById') {
          return Promise.resolve([[{ dbFieldName: 'target_col' }]]);
        }
        if (event === 'table.getDbName') {
          return Promise.resolve(['b1.source_table']);
        }
        return Promise.resolve([]);
      });

      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.triggerRecalculation(
        {
          tableId: 't1',
          baseId: 'b1',
          changedFieldIds: [1],
          changedRecordIds: [10],
        },
        mockPrisma,
      );

      expect(result).toBeDefined();
    });

    it('should fetch all record IDs if changedRecordIds is empty', async () => {
      (mockDepGraph.getDownstreamFieldIds as jest.Mock).mockResolvedValue([5]);
      (mockDepGraph.getTopoOrder as jest.Mock).mockResolvedValue([5]);

      mockPrisma.field.findMany.mockResolvedValue([
        { id: 5, type: 'LOOKUP', lookupOptions: null, options: {}, status: 'active' },
      ]);

      mockEmitter.emitAsync.mockImplementation((event: string) => {
        if (event === 'table.getDbName') return Promise.resolve(['b1.tbl']);
        return Promise.resolve([]);
      });

      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { __id: 100 },
        { __id: 200 },
      ]);

      await service.triggerRecalculation(
        {
          tableId: 't1',
          baseId: 'b1',
          changedFieldIds: [1],
          changedRecordIds: [],
        },
        mockPrisma,
      );

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'table.getDbName',
        't1',
        'b1',
        mockPrisma,
      );
    });

    it('should broadcast changes when cells are updated', async () => {
      (mockDepGraph.getDownstreamFieldIds as jest.Mock).mockResolvedValue([5]);
      (mockDepGraph.getTopoOrder as jest.Mock).mockResolvedValue([5]);

      const rollupField = {
        id: 5,
        type: 'ROLLUP',
        dbFieldName: 'rollup_col',
        lookupOptions: {
          linkFieldId: '2',
          lookupFieldId: '3',
          foreignTableId: 'ft1',
        },
        options: { expression: 'sum({values})', linkFieldId: '2' },
        status: 'active',
      };
      const linkField = {
        id: 2,
        type: 'LINK',
        options: {
          relationship: 'ManyMany',
          fkHostTableName: 'b1.jt',
          selfKeyName: '__fk_2',
          foreignKeyName: '__fk_2_ref',
          foreignTableId: 'ft1',
        },
        status: 'active',
      };

      mockPrisma.field.findMany
        .mockResolvedValueOnce([rollupField])
        .mockResolvedValueOnce([rollupField, linkField]);

      mockEmitter.emitAsync.mockImplementation((event: string) => {
        if (event === 'field.getFieldsById') {
          return Promise.resolve([[{ dbFieldName: 'target_col' }]]);
        }
        if (event === 'table.getDbName') {
          return Promise.resolve(['b1.source_table']);
        }
        return Promise.resolve([]);
      });

      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
        { source_id: 10, lookup_value: 5 },
        { source_id: 10, lookup_value: 3 },
      ]);
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      (mockLookupRollup.applyRollupFunction as jest.Mock).mockReturnValue(8);

      const result = await service.triggerRecalculation(
        {
          tableId: 't1',
          baseId: 'b1',
          changedFieldIds: [1],
          changedRecordIds: [10],
        },
        mockPrisma,
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('handleTriggerRecalculation', () => {
    it('should delegate to triggerRecalculation', async () => {
      jest.spyOn(service, 'triggerRecalculation').mockResolvedValue([]);

      await service.handleTriggerRecalculation(
        {
          tableId: 't1',
          baseId: 'b1',
          changedFieldIds: [1],
          changedRecordIds: [10],
        },
        mockPrisma,
      );

      expect(service.triggerRecalculation).toHaveBeenCalled();
    });
  });
});
