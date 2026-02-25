import { BadRequestException } from '@nestjs/common';
import { TableController } from '../table.controller';

describe('TableController', () => {
  let controller: TableController;
  let mockTableService: any;
  let mockPrisma: any;
  let mockEmitter: any;

  beforeEach(() => {
    mockTableService = {
      createTable: jest.fn(),
      getTables: jest.fn(),
      getTable: jest.fn(),
      updateTable: jest.fn(),
      getDataStream: jest.fn(),
      createMultipleDataStreams: jest.fn(),
      updateMultipleDataStreams: jest.fn(),
      upsertDataStream: jest.fn(),
      exportDataToCSV: jest.fn(),
      addDataToExistingTable: jest.fn(),
      updateMultipleTables: jest.fn(),
      addCsvDataToNewTable: jest.fn(),
      createDuplicateTable: jest.fn(),
      setIsStreaming: jest.fn(),
      buildIcp: jest.fn(),
      runProspect: jest.fn(),
      processIcpProspectData: jest.fn(),
      processWebhookProspectData: jest.fn(),
      createAiEnrichmentTable: jest.fn(),
      backfillHistoryTables: jest.fn(),
      enqueueCreateScheduledTriggersJob: jest.fn(),
    };

    mockPrisma = {
      prismaClient: {
        $transaction: jest.fn((fn: any) => fn(mockPrisma.prismaClient)),
      },
    };

    mockEmitter = {
      emitAsync: jest.fn(),
    };

    controller = new TableController(mockTableService, mockPrisma, mockEmitter);
  });

  describe('createTable', () => {
    it('should create table with default view and field', async () => {
      const createPayload = { name: 'My Table', baseId: 'base-1', user_id: 'user-1' };
      const table = { id: 'table-1', name: 'My Table' };
      const view = { id: 'view-1', name: 'Default View' };
      const field = { id: 'field-1', name: 'Name' };

      mockTableService.createTable.mockResolvedValue(table);
      mockEmitter.emitAsync
        .mockResolvedValueOnce([view])
        .mockResolvedValueOnce([field])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([{}]);

      const result = await controller.createTable(createPayload);

      expect(result.table).toEqual(table);
      expect(result.field).toEqual(field);
      expect(result.view).toEqual(view);
    });

    it('should create 3 empty records for new table', async () => {
      const createPayload = { name: 'My Table', baseId: 'base-1', user_id: 'user-1' };
      mockTableService.createTable.mockResolvedValue({ id: 'table-1' });
      mockEmitter.emitAsync.mockResolvedValue([{ id: 'result' }]);

      await controller.createTable(createPayload);

      const createRecordCalls = mockEmitter.emitAsync.mock.calls.filter(
        (c) => c[0] === 'createRecord',
      );
      expect(createRecordCalls).toHaveLength(3);
    });
  });

  describe('getTables', () => {
    it('should return tables within a transaction', async () => {
      const tables = [{ id: 't1' }];
      mockTableService.getTables.mockResolvedValue(tables);

      const result = await controller.getTables({ baseId: 'base-1' });

      expect(result).toEqual(tables);
      expect(mockTableService.getTables).toHaveBeenCalled();
    });
  });

  describe('updateTable', () => {
    it('should update table name', async () => {
      const updated = { id: 't1', name: 'Updated' };
      mockTableService.updateTable.mockResolvedValue(updated);

      const result = await controller.updateTable({ id: 't1', name: 'Updated' });

      expect(result).toEqual(updated);
    });
  });

  describe('getTable', () => {
    it('should return single table', async () => {
      const table = { id: 't1', name: 'Table 1' };
      mockTableService.getTable.mockResolvedValue(table);

      const result = await controller.getTable({ tableId: 't1', baseId: 'b1' });

      expect(result).toEqual(table);
    });
  });

  describe('getDataStream', () => {
    it('should return data streams', async () => {
      const streams = [{ id: 'ds-1' }];
      mockTableService.getDataStream.mockResolvedValue(streams);

      const result = await controller.getDataStream({ tableId: 't1' });

      expect(result).toEqual(streams);
    });
  });

  describe('createMultipleDataStreams', () => {
    it('should create data streams', async () => {
      const streams = [{ id: 'ds-1' }];
      mockTableService.createMultipleDataStreams.mockResolvedValue(streams);

      const result = await controller.createMultipleDataStreams([
        { tableId: 't1', isStreaming: true, webhookUrl: 'http://test.com', eventType: ['create_record'], triggerType: 'TIME_BASED' } as any,
      ]);

      expect(result).toEqual(streams);
    });

    it('should throw BadRequestException on error', async () => {
      mockTableService.createMultipleDataStreams.mockRejectedValue(new Error('fail'));

      await expect(
        controller.createMultipleDataStreams([
          { tableId: 't1', isStreaming: true, webhookUrl: 'http://test.com', eventType: ['create_record'], triggerType: 'TIME_BASED' } as any,
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateMultipleDataStreams', () => {
    it('should update data streams', async () => {
      const updated = [{ id: 'ds-1' }];
      mockTableService.updateMultipleDataStreams.mockResolvedValue(updated);

      const result = await controller.updateMultipleDataStreams([
        { where: { tableId: 't1' }, data: { isStreaming: false } },
      ]);

      expect(result).toEqual(updated);
    });

    it('should throw BadRequestException on error', async () => {
      mockTableService.updateMultipleDataStreams.mockRejectedValue(new Error('fail'));

      await expect(
        controller.updateMultipleDataStreams([
          { where: { tableId: 't1' }, data: { isStreaming: false } },
        ]),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('upsertDataStream', () => {
    it('should upsert data stream', async () => {
      const upserted = { id: 'ds-1' };
      mockTableService.upsertDataStream.mockResolvedValue(upserted);

      const result = await controller.upsertDataStream({
        where: { tableId: 't1', webhookUrl: 'http://test.com' },
        data: { isStreaming: true, tableId: 't1' },
      } as any);

      expect(result).toEqual(upserted);
    });
  });

  describe('exportTableDataToCSV', () => {
    it('should set correct headers and pipe stream', async () => {
      const mockStream = {
        pipe: jest.fn(),
        on: jest.fn(),
      };
      mockEmitter.emitAsync.mockResolvedValue([{ records: [], fields: [] }]);
      mockTableService.exportDataToCSV.mockResolvedValue(mockStream);

      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.exportTableDataToCSV(
        { tableId: 't1', baseId: 'b1', viewId: 'v1' } as any,
        mockRes as any,
      );

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('export.csv'),
      );
      expect(mockStream.pipe).toHaveBeenCalledWith(mockRes);
    });
  });

  describe('addDataToExistingTable', () => {
    it('should call service method', async () => {
      mockTableService.addDataToExistingTable.mockResolvedValue([]);

      const result = await controller.addDataToExistingTable({
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        url: 'http://test.com/file.csv',
        is_first_row_header: true,
        columns_info: [],
      } as any);

      expect(mockTableService.addDataToExistingTable).toHaveBeenCalled();
    });
  });

  describe('updateMultipleTable', () => {
    it('should update multiple tables', async () => {
      const updated = [{ id: 't1' }];
      mockTableService.updateMultipleTables.mockResolvedValue(updated);

      const result = await controller.updateMultipleTable({
        whereObj: { id: ['t1'] },
        status: 'inactive',
      } as any);

      expect(result).toEqual(updated);
    });

    it('should throw BadRequestException on error', async () => {
      mockTableService.updateMultipleTables.mockRejectedValue(new Error('fail'));

      await expect(
        controller.updateMultipleTable({ whereObj: { id: ['t1'] }, status: 'inactive' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addCsvDataToNewTable', () => {
    it('should call service method', async () => {
      const result = { table: { id: 't1' }, view: { id: 'v1' } };
      mockTableService.addCsvDataToNewTable.mockResolvedValue(result);

      const response = await controller.addCsvDataToNewTable({
        table_name: 'New Table',
        baseId: 'b1',
        user_id: 'u1',
        url: 'http://test.com/file.csv',
      } as any);

      expect(response).toEqual(result);
    });
  });

  describe('createDuplicateTable', () => {
    it('should call service method', async () => {
      const result = { id: 't2', fields: [], views: [] };
      mockTableService.createDuplicateTable.mockResolvedValue(result);

      const response = await controller.createDuplicateTable({ baseId: 'b1', tableId: 't1' });

      expect(response).toEqual(result);
    });
  });

  describe('setDataStream', () => {
    it('should update streaming status and enqueue jobs', async () => {
      mockTableService.setIsStreaming.mockResolvedValue({
        updated_count: 1,
        dataStreamsToEnqueue: [{ dataStreamId: 'ds-1', tableId: 't1' }],
      });
      mockTableService.enqueueCreateScheduledTriggersJob.mockResolvedValue(undefined);

      const result = await controller.setDataStream({
        data: { isStreaming: true },
        where: { tableId: 't1' },
      } as any);

      expect(result).toEqual({ updated_count: 1 });
      expect(mockTableService.enqueueCreateScheduledTriggersJob).toHaveBeenCalledWith('ds-1', 't1');
    });

    it('should not enqueue jobs when no dataStreamsToEnqueue', async () => {
      mockTableService.setIsStreaming.mockResolvedValue({
        updated_count: 0,
        dataStreamsToEnqueue: [],
      });

      const result = await controller.setDataStream({
        data: { isStreaming: false },
        where: { tableId: 't1' },
      } as any);

      expect(result).toEqual({ updated_count: 0 });
      expect(mockTableService.enqueueCreateScheduledTriggersJob).not.toHaveBeenCalled();
    });
  });

  describe('buildIcp', () => {
    it('should call service and return result', async () => {
      mockTableService.buildIcp.mockResolvedValue({ icp: 'data' });

      const result = await controller.buildIcp({ domain: 'test.com' } as any);

      expect(result).toEqual({ icp: 'data' });
    });

    it('should throw BadRequestException on error', async () => {
      mockTableService.buildIcp.mockRejectedValue(new Error('fail'));

      await expect(controller.buildIcp({ domain: 'test.com' } as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('runProspect', () => {
    it('should run prospect in sync mode', async () => {
      mockTableService.runProspect.mockResolvedValue({ items: [] });

      const result = await controller.runProspect('true', {
        domain: 'test.com',
        prospecting_target: 'CEO',
      } as any);

      expect(result).toEqual({ items: [] });
      expect(mockTableService.runProspect).toHaveBeenCalledWith(expect.any(Object), true);
    });

    it('should run prospect in async mode', async () => {
      mockTableService.runProspect.mockResolvedValue({ items: [] });

      await controller.runProspect('false', {
        domain: 'test.com',
        prospecting_target: 'CEO',
      } as any);

      expect(mockTableService.runProspect).toHaveBeenCalledWith(expect.any(Object), false);
    });
  });

  describe('processIcpProspectData', () => {
    it('should call service method', async () => {
      mockTableService.processIcpProspectData.mockResolvedValue({ data: {} });

      const result = await controller.processIcpProspectData({
        icp_inputs: { domain: 'test.com' },
      } as any);

      expect(result).toEqual({ data: {} });
    });
  });

  describe('receiveProspectData', () => {
    it('should process webhook prospect data', async () => {
      mockTableService.processWebhookProspectData.mockResolvedValue({ recordsProcessed: 5 });

      const result = await controller.receiveProspectData({
        items: [],
        meta: { tableId: 't1', baseId: 'b1', viewId: 'v1' },
      } as any);

      expect(result).toEqual({ recordsProcessed: 5 });
    });
  });

  describe('createAiEnrichmentTable', () => {
    it('should call service method', async () => {
      const resp = { table: {}, view: {}, fields: [] };
      mockTableService.createAiEnrichmentTable.mockResolvedValue(resp);

      const result = await controller.createAiEnrichmentTable({
        table_name: 'AI Table',
        baseId: 'b1',
        user_id: 'u1',
        fields_payload: [],
      });

      expect(result).toEqual(resp);
    });
  });

  describe('backfillHistoryTables', () => {
    it('should call service method', async () => {
      const resp = { total: 0, created: 0, already_exists: 0, skipped: 0, errors: 0, details: [] };
      mockTableService.backfillHistoryTables.mockResolvedValue(resp);

      const result = await controller.backfillHistoryTables();

      expect(result).toEqual(resp);
    });
  });
});
