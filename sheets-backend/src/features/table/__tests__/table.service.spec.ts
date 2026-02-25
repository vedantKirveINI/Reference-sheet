import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TableService } from '../table.service';
import { ComputedConfigManager } from '../utils/computed-config-manager';

describe('TableService', () => {
  let service: TableService;
  let mockEmitter: any;
  let mockUtilitySdk: any;
  let mockLodash: any;
  let mockComputedConfigManager: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emitAsync: jest.fn(),
    };

    mockUtilitySdk = {
      executeAPI: jest.fn(),
    };

    mockLodash = {
      isEmpty: jest.fn((val) => {
        if (val === null || val === undefined) return true;
        if (typeof val === 'object') return Object.keys(val).length === 0;
        return false;
      }),
    };

    mockComputedConfigManager = {
      parseComputedConfig: jest.fn().mockReturnValue({ dependencyGraph: {}, executionOrder: [] }),
      performTopologicalSort: jest.fn().mockReturnValue([]),
      buildEnrichmentDependencyGraph: jest.fn().mockReturnValue({}),
      updateComputedConfig: jest.fn(),
      removeComputedField: jest.fn(),
      getComputedConfig: jest.fn(),
    };

    mockPrisma = {
      tableMeta: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      dataStream: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
      },
      triggerSchedule: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      scheduledTrigger: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };

    service = new TableService(
      mockEmitter,
      mockUtilitySdk,
      mockLodash,
      mockComputedConfigManager,
    );
  });

  describe('getDbName', () => {
    it('should return dbTableName when table is found', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue({ dbTableName: 'base-1.table-1' });

      const result = await service.getDbName('table-1', 'base-1', mockPrisma);

      expect(result).toBe('base-1.table-1');
      expect(mockPrisma.tableMeta.findFirst).toHaveBeenCalledWith({
        where: { id: 'table-1', baseId: 'base-1' },
        select: { dbTableName: true },
      });
    });

    it('should throw NotFoundException when table is not found', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);

      await expect(service.getDbName('table-1', 'base-1', mockPrisma)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTable', () => {
    it('should create a table with auto-calculated order when order not provided', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue({ order: 5 });
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'new-table',
        name: 'Test Table',
        baseId: 'base-1',
        order: 6,
        version: 1,
      });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.tableMeta.update.mockResolvedValue({
        id: 'new-table',
        dbTableName: 'base-1.new-table',
      });

      const result = await service.createTable(
        { name: 'Test Table', baseId: 'base-1', createdBy: 'user-1' },
        mockPrisma,
      );

      expect(result.dbTableName).toBe('base-1.new-table');
      expect(mockPrisma.tableMeta.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Table',
          baseId: 'base-1',
          order: 6,
          version: 1,
        }),
      });
    });

    it('should use provided order when given', async () => {
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'new-table',
        name: 'Table 1',
        baseId: 'base-1',
        order: 3,
      });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.tableMeta.update.mockResolvedValue({
        id: 'new-table',
        dbTableName: 'base-1.new-table',
      });

      await service.createTable(
        { name: 'Table 1', baseId: 'base-1', order: 3, createdBy: 'user-1' },
        mockPrisma,
      );

      expect(mockPrisma.tableMeta.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ order: 3 }),
      });
    });

    it('should default name to "Table 1" when not provided', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'new-table',
        name: 'Table 1',
        baseId: 'base-1',
        order: 1,
      });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.tableMeta.update.mockResolvedValue({
        id: 'new-table',
        dbTableName: 'base-1.new-table',
      });

      await service.createTable({ baseId: 'base-1', createdBy: 'user-1' }, mockPrisma);

      expect(mockPrisma.tableMeta.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'Table 1' }),
      });
    });

    it('should throw BadRequestException when prisma create fails', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);
      mockPrisma.tableMeta.create.mockRejectedValue(new Error('DB error'));

      await expect(
        service.createTable({ baseId: 'base-1', createdBy: 'user-1' }, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when SQL table creation fails', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'new-table',
        name: 'Table 1',
        baseId: 'base-1',
      });
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('SQL error'));

      await expect(
        service.createTable({ baseId: 'base-1', createdBy: 'user-1' }, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create history table and index', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'tbl-1',
        name: 'Table 1',
        baseId: 'base-1',
      });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.tableMeta.update.mockResolvedValue({
        id: 'tbl-1',
        dbTableName: 'base-1.tbl-1',
      });

      await service.createTable({ baseId: 'base-1', createdBy: 'user-1' }, mockPrisma);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(3);
      const calls = mockPrisma.$queryRawUnsafe.mock.calls;
      expect(calls[0][0]).toContain('CREATE TABLE IF NOT EXISTS');
      expect(calls[1][0]).toContain('_history');
      expect(calls[2][0]).toContain('CREATE INDEX');
    });
  });

  describe('getTables', () => {
    it('should return tables for a given baseId', async () => {
      const tables = [{ id: 'table-1', name: 'T1' }];
      mockPrisma.tableMeta.findMany.mockResolvedValue(tables);

      const result = await service.getTables({ baseId: 'base-1' }, mockPrisma);

      expect(result).toEqual(tables);
      expect(mockPrisma.tableMeta.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ baseId: 'base-1', status: 'active' }),
        }),
      );
    });

    it('should throw BadRequestException when baseId is missing', async () => {
      await expect(service.getTables({ baseId: '' } as any, mockPrisma)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should include fields when is_field_required is true', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([]);

      await service.getTables(
        { baseId: 'base-1', is_field_required: 'true' },
        mockPrisma,
      );

      expect(mockPrisma.tableMeta.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            fields: { where: { status: 'active' } },
          }),
        }),
      );
    });

    it('should include views when is_view_required is true', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([]);

      await service.getTables(
        { baseId: 'base-1', is_view_required: 'true' },
        mockPrisma,
      );

      expect(mockPrisma.tableMeta.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ views: true }),
        }),
      );
    });

    it('should filter by table_ids when provided', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([]);

      await service.getTables(
        { baseId: 'base-1', table_ids: ['t1', 't2'] },
        mockPrisma,
      );

      expect(mockPrisma.tableMeta.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { in: ['t1', 't2'] },
          }),
        }),
      );
    });

    it('should apply custom orderBy when provided', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([]);

      await service.getTables(
        { baseId: 'base-1', orderByField: 'createdTime', orderByDirection: 'desc' },
        mockPrisma,
      );

      expect(mockPrisma.tableMeta.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdTime: 'desc' },
        }),
      );
    });

    it('should throw BadRequestException when prisma query fails', async () => {
      mockPrisma.tableMeta.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.getTables({ baseId: 'base-1' }, mockPrisma)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateTable', () => {
    it('should update table name', async () => {
      const updated = { id: 'table-1', name: 'New Name' };
      mockPrisma.tableMeta.update.mockResolvedValue(updated);

      const result = await service.updateTable({ id: 'table-1', baseId: 'base-1', name: 'New Name' }, mockPrisma);

      expect(result).toEqual(updated);
      expect(mockPrisma.tableMeta.update).toHaveBeenCalledWith({
        where: { id: 'table-1' },
        data: { name: 'New Name' },
      });
    });

    it('should throw BadRequestException when update fails', async () => {
      mockPrisma.tableMeta.update.mockRejectedValue(new Error('DB error'));

      await expect(
        service.updateTable({ id: 'table-1', baseId: 'base-1', name: 'New Name' }, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTable', () => {
    it('should return single table metadata', async () => {
      const table = { id: 'table-1', name: 'Test' };
      mockPrisma.tableMeta.findUniqueOrThrow.mockResolvedValue(table);

      const result = await service.getTable({ tableId: 'table-1', baseId: 'base-1' }, mockPrisma);

      expect(result).toEqual(table);
    });

    it('should include fields and views when requested', async () => {
      mockPrisma.tableMeta.findUniqueOrThrow.mockResolvedValue({ id: 'table-1' });

      await service.getTable(
        { tableId: 'table-1', baseId: 'base-1', is_field_required: 'true', is_view_required: 'true' },
        mockPrisma,
      );

      const call = mockPrisma.tableMeta.findUniqueOrThrow.mock.calls[0][0];
      expect(call.include.fields).toBeTruthy();
      expect(call.include.views).toBeTruthy();
    });

    it('should filter views by viewId when provided', async () => {
      mockPrisma.tableMeta.findUniqueOrThrow.mockResolvedValue({ id: 'table-1' });

      await service.getTable(
        { tableId: 'table-1', baseId: 'base-1', is_view_required: 'true', viewId: 'view-1' },
        mockPrisma,
      );

      const call = mockPrisma.tableMeta.findUniqueOrThrow.mock.calls[0][0];
      expect(call.include.views.where).toEqual(expect.objectContaining({ id: 'view-1' }));
    });

    it('should throw BadRequestException when table not found', async () => {
      mockPrisma.tableMeta.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(service.getTable({ tableId: 'bad-id', baseId: 'base-1' }, mockPrisma)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getDataStream', () => {
    it('should return data streams matching the where clause', async () => {
      const streams = [{ id: 'ds-1', tableId: 'table-1' }];
      mockPrisma.dataStream.findMany.mockResolvedValue(streams);

      const result = await service.getDataStream({ tableId: 'table-1' }, mockPrisma);

      expect(result).toEqual(streams);
    });

    it('should throw BadRequestException on failure', async () => {
      mockPrisma.dataStream.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.getDataStream({ tableId: 'table-1' }, mockPrisma)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createMultipleDataStreams', () => {
    it('should create data streams and return them', async () => {
      const payload: any[] = [
        { tableId: 'table-1', isStreaming: true, webhookUrl: 'http://test.com', eventType: ['create_record'] },
      ];
      mockPrisma.tableMeta.findMany.mockResolvedValue([{ id: 'table-1' }]);
      mockPrisma.dataStream.create.mockResolvedValue({ id: 'ds-1', tableId: 'table-1' });
      mockPrisma.dataStream.findUnique.mockResolvedValue({ id: 'ds-1', tableId: 'table-1', triggerSchedules: [] });

      const result = await service.createMultipleDataStreams(payload, mockPrisma);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('ds-1');
    });

    it('should throw when table IDs do not exist', async () => {
      const payload: any[] = [{ tableId: 'table-1', isStreaming: true, webhookUrl: 'http://test.com', eventType: ['create_record'] }];
      mockPrisma.tableMeta.findMany.mockResolvedValue([]);

      await expect(service.createMultipleDataStreams(payload, mockPrisma)).rejects.toThrow(
        'One or more TableMetas do not exist',
      );
    });
  });

  describe('updateMultipleDataStreams', () => {
    it('should throw when where clause is empty', async () => {
      const payload: any[] = [{ where: {}, data: { isStreaming: false } }];

      await expect(service.updateMultipleDataStreams(payload, mockPrisma)).rejects.toThrow(
        'At least one of tableId or webhookUrl must be provided',
      );
    });

    it('should throw when no matching data stream found', async () => {
      const payload: any[] = [{ where: { tableId: 'table-1' }, data: { isStreaming: false } }];
      mockPrisma.dataStream.findMany.mockResolvedValue([]);

      await expect(service.updateMultipleDataStreams(payload, mockPrisma)).rejects.toThrow(
        'No matching data stream found',
      );
    });

    it('should update matching data streams', async () => {
      const payload: any[] = [{ where: { tableId: 'table-1' }, data: { isStreaming: false } }];
      const existing = { id: 'ds-1', tableId: 'table-1', triggerType: 'WEBHOOK', triggerSchedules: [] };
      mockPrisma.dataStream.findMany.mockResolvedValue([existing]);
      mockPrisma.dataStream.update.mockResolvedValue({ ...existing, isStreaming: false });
      mockPrisma.dataStream.findUnique.mockResolvedValue({ ...existing, isStreaming: false, triggerSchedules: [] });

      const result = await service.updateMultipleDataStreams(payload, mockPrisma);

      expect(result).toHaveLength(1);
    });
  });

  describe('exportDataToCSV', () => {
    it('should generate CSV stream from records', async () => {
      const payload = {
        records: [{ field_1: 'hello', field_2: 42 }],
        fields: [
          { name: 'Name', dbFieldName: 'field_1', type: 'SHORT_TEXT' },
          { name: 'Age', dbFieldName: 'field_2', type: 'NUMBER' },
        ],
      };

      const stream = await service.exportDataToCSV(payload);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const csv = Buffer.concat(chunks).toString();

      expect(csv).toContain('Name');
      expect(csv).toContain('Age');
      expect(csv).toContain('hello');
    });

    it('should throw when no data available', async () => {
      await expect(service.exportDataToCSV({ records: [], fields: [] })).rejects.toThrow(
        'Failed to generate CSV data.',
      );
    });

    it('should handle date fields by not double-quoting', async () => {
      const payload = {
        records: [{ field_1: '2025-01-01T00:00:00.000Z' }],
        fields: [{ name: 'Date', dbFieldName: 'field_1', type: 'DATE' }],
      };

      const stream = await service.exportDataToCSV(payload);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const csv = Buffer.concat(chunks).toString();
      expect(csv).toContain('2025-01-01');
    });

    it('should stringify object values', async () => {
      const payload = {
        records: [{ field_1: { key: 'value' } }],
        fields: [{ name: 'Data', dbFieldName: 'field_1', type: 'SHORT_TEXT' }],
      };

      const stream = await service.exportDataToCSV(payload);
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      const csv = Buffer.concat(chunks).toString();
      expect(csv).toContain('key');
    });
  });

  describe('updateMultipleTables', () => {
    it('should throw when data or whereObj is empty', async () => {
      await expect(
        service.updateMultipleTables({ whereObj: {} } as any, mockPrisma),
      ).rejects.toThrow();
    });

    it('should update multiple tables and deactivate fields', async () => {
      const tables = [
        { id: 't1', baseId: 'base-1' },
        { id: 't2', baseId: 'base-1' },
      ];
      mockPrisma.tableMeta.findMany
        .mockResolvedValueOnce(tables)
        .mockResolvedValueOnce(tables);
      mockPrisma.tableMeta.updateMany.mockResolvedValue({ count: 2 });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const result = await service.updateMultipleTables(
        { whereObj: { id: ['t1', 't2'] }, status: 'inactive' } as any,
        mockPrisma,
      );

      expect(result).toEqual(tables);
      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'field.updateFieldsStatus',
        expect.any(Object),
        mockPrisma,
      );
    });

    it('should throw when no tables found', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([]);

      await expect(
        service.updateMultipleTables(
          { whereObj: { id: ['nonexistent'] }, status: 'inactive' } as any,
          mockPrisma,
        ),
      ).rejects.toThrow('No Table Found');
    });
  });

  describe('createDuplicateTable', () => {
    it('should duplicate table with fields, views, and records', async () => {
      const originalTable = {
        id: 'orig-table',
        name: 'Original',
        baseId: 'base-1',
        createdBy: 'user-1',
      };
      mockPrisma.tableMeta.findUnique.mockResolvedValue(originalTable);

      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'new-table',
        name: 'Original (Copy)',
        baseId: 'base-1',
        source_id: 'orig-table',
      });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.tableMeta.update.mockResolvedValue({
        id: 'new-table',
        dbTableName: 'base-1.new-table',
        source_id: 'orig-table',
      });

      const newFields = [{ id: 'f1', name: 'Field 1' }];
      const oldViews = [{ id: 'v1', name: 'View 1' }];
      const newView = { id: 'v2', name: 'View 1' };

      mockEmitter.emitAsync
        .mockResolvedValueOnce([newFields])
        .mockResolvedValueOnce([oldViews])
        .mockResolvedValueOnce([newView])
        .mockResolvedValueOnce([]);

      const result = await service.createDuplicateTable(
        { baseId: 'base-1', tableId: 'orig-table' },
        mockPrisma,
      );

      expect(result.fields).toEqual(newFields);
      expect(result.views).toEqual([newView]);
    });

    it('should throw when original table not found', async () => {
      mockPrisma.tableMeta.findUnique.mockRejectedValue(new Error('Not found'));

      await expect(
        service.createDuplicateTable({ baseId: 'base-1', tableId: 'bad-id' }, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('setIsStreaming', () => {
    it('should throw when where clause is empty', async () => {
      await expect(
        service.setIsStreaming({ data: { isStreaming: true }, where: {} }, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update streaming status and return count', async () => {
      mockPrisma.dataStream.findMany.mockResolvedValue([
        { id: 'ds-1', tableId: 'table-1', triggerType: 'WEBHOOK', isStreaming: false },
      ]);
      mockPrisma.dataStream.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.setIsStreaming(
        { data: { isStreaming: true }, where: { tableId: 'table-1' } },
        mockPrisma,
      );

      expect(result.updated_count).toBe(1);
    });
  });

  describe('buildIcp', () => {
    it('should call enrichment service and return data', async () => {
      const originalEnv = process.env.ENRICHMENT_SERVICE_URL;
      process.env.ENRICHMENT_SERVICE_URL = 'http://enrichment-service';

      const axios = require('axios');
      jest.spyOn(axios, 'post').mockResolvedValue({ data: { icp: 'data' } });

      const result = await service.buildIcp({ domain: 'test.com' } as any);

      expect(result).toEqual({ icp: 'data' });

      process.env.ENRICHMENT_SERVICE_URL = originalEnv;
      jest.restoreAllMocks();
    });

    it('should throw BadRequestException on API error', async () => {
      const originalEnv = process.env.ENRICHMENT_SERVICE_URL;
      process.env.ENRICHMENT_SERVICE_URL = 'http://enrichment-service';

      const axios = require('axios');
      jest.spyOn(axios, 'post').mockRejectedValue({
        response: { data: { error: 'API failure' } },
      });

      await expect(service.buildIcp({ domain: 'test.com' } as any)).rejects.toThrow(
        BadRequestException,
      );

      process.env.ENRICHMENT_SERVICE_URL = originalEnv;
      jest.restoreAllMocks();
    });
  });

  describe('runProspect', () => {
    it('should call enrichment service for sync prospect run', async () => {
      const originalEnv = process.env.ENRICHMENT_SERVICE_URL;
      process.env.ENRICHMENT_SERVICE_URL = 'http://enrichment-service';

      const axios = require('axios');
      jest.spyOn(axios, 'post').mockResolvedValue({ data: { items: [] } });

      const result = await service.runProspect(
        { domain: 'test.com', prospecting_target: 'CEO' } as any,
        true,
      );

      expect(result).toEqual({ items: [] });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('sync=true'),
        expect.any(Object),
        expect.any(Object),
      );

      process.env.ENRICHMENT_SERVICE_URL = originalEnv;
      jest.restoreAllMocks();
    });

    it('should include schedule_interval for async mode', async () => {
      const originalEnv = process.env.ENRICHMENT_SERVICE_URL;
      process.env.ENRICHMENT_SERVICE_URL = 'http://enrichment-service';

      const axios = require('axios');
      jest.spyOn(axios, 'post').mockResolvedValue({ data: { items: [] } });

      await service.runProspect(
        { domain: 'test.com', prospecting_target: 'CEO' } as any,
        false,
      );

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('sync=false'),
        expect.objectContaining({ schedule_interval_minutes: 1440 }),
        expect.any(Object),
      );

      process.env.ENRICHMENT_SERVICE_URL = originalEnv;
      jest.restoreAllMocks();
    });
  });

  describe('addCsvDataToNewTable', () => {
    it('should create table, view, and add data', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'new-table',
        name: 'CSV Table',
        baseId: 'base-1',
      });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.tableMeta.update.mockResolvedValue({
        id: 'new-table',
        dbTableName: 'base-1.new-table',
      });

      const view = { id: 'view-1', name: 'Default' };
      mockEmitter.emitAsync
        .mockResolvedValueOnce([view])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ records: [], fields: [] }])
        .mockResolvedValueOnce([]);

      const addDataSpy = jest
        .spyOn(service, 'addDataToExistingTable')
        .mockResolvedValue([]);

      const result = await service.addCsvDataToNewTable(
        { table_name: 'CSV Table', baseId: 'base-1', user_id: 'user-1', columns_info: [], url: 'http://test.com/file.csv', is_first_row_header: true } as any,
        mockPrisma,
      );

      expect(result.table.id).toBe('new-table');
      expect(result.view).toEqual(view);
      addDataSpy.mockRestore();
    });
  });

  describe('createAiEnrichmentTable', () => {
    it('should create table, view, and fields for AI enrichment', async () => {
      mockPrisma.tableMeta.findFirst.mockResolvedValue(null);
      mockPrisma.tableMeta.create.mockResolvedValue({
        id: 'ai-table',
        name: 'AI Table',
        baseId: 'base-1',
      });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
      mockPrisma.tableMeta.update.mockResolvedValue({
        id: 'ai-table',
        dbTableName: 'base-1.ai-table',
      });

      const view = { id: 'view-1' };
      const fields = [{ id: 'f1', name: 'Field 1' }];
      const updatedView = { id: 'view-1', columnMeta: '{}' };

      mockEmitter.emitAsync
        .mockResolvedValueOnce([view])
        .mockResolvedValueOnce([fields])
        .mockResolvedValueOnce([updatedView]);

      const result = await service.createAiEnrichmentTable(
        { table_name: 'AI Table', baseId: 'base-1', user_id: 'user-1', fields_payload: [{ name: 'Field 1', type: 'SHORT_TEXT' }] },
        mockPrisma,
      );

      expect(result.table.id).toBe('ai-table');
      expect(result.fields).toEqual(fields);
      expect(result.view).toEqual(updatedView);
    });
  });

  describe('backfillHistoryTables', () => {
    it('should skip tables without dbTableName', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([
        { id: 't1', baseId: 'b1', dbTableName: null },
      ]);

      const result = await service.backfillHistoryTables(mockPrisma);

      expect(result.skipped).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should skip existing history tables', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([
        { id: 't1', baseId: 'b1', dbTableName: 'b1.t1' },
      ]);
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ table_oid: 'some_oid' }]);

      const result = await service.backfillHistoryTables(mockPrisma);

      expect(result.already_exists).toBe(1);
    });

    it('should create history tables when they do not exist', async () => {
      mockPrisma.tableMeta.findMany.mockResolvedValue([
        { id: 't1', baseId: 'b1', dbTableName: 'b1.t1' },
      ]);
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ table_oid: null }])
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const result = await service.backfillHistoryTables(mockPrisma);

      expect(result.created).toBe(1);
    });
  });

  describe('transformValueForField', () => {
    it('should transform number types', () => {
      const result = (service as any).transformValueForField('42', 'number');
      expect(result).toBe(42);
    });

    it('should transform boolean types', () => {
      const result = (service as any).transformValueForField(1, 'boolean');
      expect(result).toBe(true);
    });

    it('should transform date types', () => {
      const result = (service as any).transformValueForField('2025-01-01', 'date');
      expect(result).toBeInstanceOf(Date);
    });

    it('should return null for null input', () => {
      const result = (service as any).transformValueForField(null, 'number');
      expect(result).toBeNull();
    });

    it('should default to string conversion', () => {
      const result = (service as any).transformValueForField(42, 'short_text');
      expect(result).toBe('42');
    });
  });

  describe('getSchemaAndTableName', () => {
    it('should parse schema.table format', () => {
      const result = (service as any).getSchemaAndTableName('myschema.mytable');
      expect(result).toEqual({ schemaName: 'myschema', tableName: 'mytable' });
    });

    it('should handle table-only format', () => {
      const result = (service as any).getSchemaAndTableName('mytable');
      expect(result).toEqual({ schemaName: '', tableName: 'mytable' });
    });
  });

  describe('syncTriggerSchedules', () => {
    it('should identify schedules to create, update, and delete', () => {
      const existing = [
        { id: 's1', fieldId: 1, type: 'EXACT', offsetMinutes: 0, name: 'trigger1' },
        { id: 's2', fieldId: 2, type: 'BEFORE', offsetMinutes: 30, name: 'trigger2' },
      ];
      const newConfigs = [
        { id: 's1', fieldId: 1, type: 'AFTER', offsetMinutes: 15, name: 'trigger1-updated' },
        { fieldId: 3, type: 'EXACT', offsetMinutes: 0, name: 'trigger3' },
      ];

      const result = (service as any).syncTriggerSchedules(existing, newConfigs);

      expect(result.toUpdate).toHaveLength(1);
      expect(result.toUpdate[0].id).toBe('s1');
      expect(result.toCreate).toHaveLength(1);
      expect(result.toCreate[0].fieldId).toBe(3);
      expect(result.toDelete).toHaveLength(1);
      expect(result.toDelete[0].id).toBe('s2');
    });

    it('should not update unchanged schedules', () => {
      const existing = [
        { id: 's1', fieldId: 1, type: 'EXACT', offsetMinutes: 0, name: 'same' },
      ];
      const newConfigs = [
        { id: 's1', fieldId: 1, type: 'EXACT', offsetMinutes: 0, name: 'same' },
      ];

      const result = (service as any).syncTriggerSchedules(existing, newConfigs);

      expect(result.toUpdate).toHaveLength(0);
      expect(result.toCreate).toHaveLength(0);
      expect(result.toDelete).toHaveLength(0);
    });
  });

  describe('registerEvents', () => {
    it('should register all expected events', () => {
      const eventNames = mockEmitter.onEvent.mock.calls.map((c) => c[0]);
      expect(eventNames).toContain('table-createTable');
      expect(eventNames).toContain('table.getTable');
      expect(eventNames).toContain('table.getTables');
      expect(eventNames).toContain('table.getDbName');
      expect(eventNames).toContain('table.getDataStream');
      expect(eventNames).toContain('table.updateMultipleTables');
      expect(eventNames).toContain('table.createDuplicateTable');
      expect(eventNames).toContain('table.getTableSummary');
      expect(eventNames).toContain('table.updateFormulaFieldConfig');
      expect(eventNames).toContain('table.getFormulaFieldConfig');
      expect(eventNames).toContain('table.removeComputedField');
      expect(eventNames).toContain('table.runProspect');
      expect(eventNames).toContain('table.createAiEnrichmentTable');
      expect(eventNames).toContain('table.processWebhookProspectData');
    });
  });
});
