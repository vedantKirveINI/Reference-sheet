import { Test, TestingModule } from '@nestjs/testing';
import { RecordController } from '../record.controller';
import { RecordService } from '../record.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventEmitterService } from '../../../eventemitter/eventemitter.service';

describe('RecordController', () => {
  let controller: RecordController;
  let mockRecordService: any;
  let mockPrismaService: any;

  const mockEventEmitter = {
    onEvent: jest.fn(),
    emit: jest.fn(),
    emitAsync: jest.fn().mockResolvedValue({ result: { can_access: true, can_edit: true, can_view: true, in_trash: false, general_role: 'owner' } }),
  };

  beforeEach(async () => {
    mockRecordService = {
      getRecords: jest.fn(),
      updateRecord: jest.fn(),
      createRecord: jest.fn(),
      createRecordColumn: jest.fn(),
      getRecord: jest.fn(),
      getRecordV2: jest.fn(),
      getRecordV3: jest.fn(),
      updateRecordsStatus: jest.fn(),
      updateRecordsByFilters: jest.fn(),
      updateRecordsByFiltersV2: jest.fn(),
      createDuplicateRecords: jest.fn(),
      createRecordV2: jest.fn(),
      updateFormRecord: jest.fn(),
      processEnrichment: jest.fn(),
      processEnrichmentForAllRecords: jest.fn(),
      getEnrichedData: jest.fn(),
      getRecordHistory: jest.fn(),
      getGroupPoints: jest.fn(),
      updateRecordColors: jest.fn(),
    };

    mockPrismaService = {
      prismaClient: {
        $transaction: jest.fn((fn: any) => fn(mockPrismaService.prismaClient)),
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        $queryRawUnsafe: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordController],
      providers: [
        { provide: RecordService, useValue: mockRecordService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<RecordController>(RecordController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecords (POST get_records)', () => {
    it('should call recordService.getRecords with payload', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      const expected = { fields: [], records: [] };
      mockRecordService.getRecords.mockResolvedValue(expected);

      const result = await controller.getRecords(payload as any);
      expect(result).toEqual(expected);
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        payload,
        mockPrismaService.prismaClient,
      );
    });
  });

  describe('publicGetRecords (POST public/get_records)', () => {
    it('should call getRecords within a transaction', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      const expected = { fields: [], records: [] };
      mockRecordService.getRecords.mockResolvedValue(expected);

      const result = await controller.publicGetRecords(payload as any);
      expect(result).toEqual(expected);
    });
  });

  describe('getRecordsV2 (POST v2/get_records)', () => {
    it('should pass version 2 and is_field_required true', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      mockRecordService.getRecords.mockResolvedValue({ fields: [], records: [] });

      await controller.getRecordsV2(payload as any);
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ version: 2, is_field_required: true }),
        expect.anything(),
      );
    });
  });

  describe('getRecordsV3 (POST v3/get_records)', () => {
    it('should pass version 3', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      mockRecordService.getRecords.mockResolvedValue({ fields: [], records: [] });

      await controller.getRecordsV3(payload as any);
      expect(mockRecordService.getRecords).toHaveBeenCalledWith(
        expect.objectContaining({ version: 3 }),
        expect.anything(),
      );
    });
  });

  describe('recordUpdate (POST /update_record)', () => {
    it('should call updateRecord with payload and user_id from token', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1', column_values: [] };
      const req = { headers: { token: null }, query: {}, body: {} };
      mockRecordService.updateRecord.mockResolvedValue([]);

      const result = await controller.recordUpdate(payload as any, req);
      expect(result).toEqual([]);
      expect(mockRecordService.updateRecord).toHaveBeenCalledWith(
        expect.objectContaining({ tableId: 't1' }),
        expect.anything(),
      );
    });

    it('should pass undefined user_id when no token', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1', column_values: [] };
      const req = { headers: {}, query: {}, body: {} };
      mockRecordService.updateRecord.mockResolvedValue([]);

      await controller.recordUpdate(payload as any, req);
      expect(mockRecordService.updateRecord).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: undefined }),
        expect.anything(),
      );
    });
  });

  describe('updateFormRecord (POST /update_form_record)', () => {
    it('should call updateFormRecord', async () => {
      const payload = { tableId: 't1', baseId: 'b1', row_id: 1, fields_info: [] };
      mockRecordService.updateFormRecord.mockResolvedValue([{ __id: 1 }]);

      const result = await controller.updateFormRecord(payload as any);
      expect(result).toEqual([{ __id: 1 }]);
    });
  });

  describe('createRecord (POST /create_record)', () => {
    it('should call createRecord with is_http=true', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1', fields_info: [] };
      const req = { headers: {}, query: {}, body: {} };
      mockRecordService.createRecord.mockResolvedValue([{ __id: 1 }]);

      const result = await controller.createRecord(payload as any, req);
      expect(result).toEqual([{ __id: 1 }]);
      expect(mockRecordService.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({ tableId: 't1' }),
        expect.anything(),
        true,
      );
    });
  });

  describe('createColumn (POST /create_column)', () => {
    it('should call createRecordColumn', async () => {
      const payload = { column_name: 'col', data_type: 'TEXT', tableId: 't1', baseId: 'b1' };
      mockRecordService.createRecordColumn.mockResolvedValue('Created Column Successfully');

      const result = await controller.createColumn(payload);
      expect(result).toBe('Created Column Successfully');
    });
  });

  describe('getRecord (POST /get_record)', () => {
    it('should call getRecord and return result', async () => {
      const payload = { baseId: 'b1', tableId: 't1' };
      mockRecordService.getRecord.mockResolvedValue({ __id: 1 });

      const result = await controller.getRecord(payload as any);
      expect(result).toEqual({ __id: 1 });
    });
  });

  describe('getRecordV2 (POST v2/get_record)', () => {
    it('should pass version 2 and limit 1', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      mockRecordService.getRecordV2.mockResolvedValue({ fields: [], record: {} });

      await controller.getRecordV2(payload as any);
      expect(mockRecordService.getRecordV2).toHaveBeenCalledWith(
        expect.objectContaining({ version: 2, limit: 1, is_field_required: true }),
        expect.anything(),
      );
    });
  });

  describe('getRecordV3 (POST v3/get_record)', () => {
    it('should pass version 3 and limit 1', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      mockRecordService.getRecordV3.mockResolvedValue({ fields: [], record: {} });

      await controller.getRecordV3(payload as any);
      expect(mockRecordService.getRecordV3).toHaveBeenCalledWith(
        expect.objectContaining({ version: 3, limit: 1 }),
        expect.anything(),
      );
    });
  });

  describe('updateRecordsStatus (PUT /update_records_status)', () => {
    it('should call updateRecordsStatus', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1', records: [{ __id: 1 }] };
      const req = { headers: {}, query: {}, body: {} };
      mockRecordService.updateRecordsStatus.mockResolvedValue([{ __id: 1, __status: 'inactive' }]);

      const result = await controller.updateRecordsStatus(payload as any, req);
      expect(result).toEqual([{ __id: 1, __status: 'inactive' }]);
    });
  });

  describe('updateRecordsByFilters (POST /update_records_by_filters)', () => {
    it('should call updateRecordsByFilters with is_http=true', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      mockRecordService.updateRecordsByFilters.mockResolvedValue({ success: true });

      const result = await controller.updateRecordsByFilters(payload as any);
      expect(result).toEqual({ success: true });
      expect(mockRecordService.updateRecordsByFilters).toHaveBeenCalledWith(
        payload,
        expect.anything(),
        true,
      );
    });
  });

  describe('updateRecordsByFiltersV2 (POST /v2/update_records_by_filters)', () => {
    it('should call updateRecordsByFiltersV2 with is_http=true', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      mockRecordService.updateRecordsByFiltersV2.mockResolvedValue({ success: true });

      const result = await controller.updateRecordsByFiltersV2(payload as any);
      expect(result).toEqual({ success: true });
    });
  });

  describe('createDuplicateRecords (POST /create_duplicate_records)', () => {
    it('should call createDuplicateRecords', async () => {
      const payload = { tableId: 't1', baseId: 'b1', recordIds: [1, 2] };
      mockRecordService.createDuplicateRecords.mockResolvedValue([{ __id: 3 }]);

      const result = await controller.createDuplicateRecords(payload);
      expect(result).toEqual([{ __id: 3 }]);
    });
  });

  describe('createRecordV2 (POST /v2/create_record)', () => {
    it('should call createRecordV2 with is_http=true', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1' };
      mockRecordService.createRecordV2.mockResolvedValue([{ __id: 1 }]);

      const result = await controller.createRecordV2(payload as any);
      expect(result).toEqual([{ __id: 1 }]);
      expect(mockRecordService.createRecordV2).toHaveBeenCalledWith(
        payload,
        expect.anything(),
        true,
      );
    });
  });

  describe('processEnrichment (POST v1/enrichment/process_enrichment)', () => {
    it('should call processEnrichment', async () => {
      const payload = { tableId: 't1', recordId: 1 };
      mockRecordService.processEnrichment.mockResolvedValue({ success: true });

      const result = await controller.processEnrichment(payload);
      expect(result).toEqual({ success: true });
    });
  });

  describe('processEnrichmentForAll (POST v1/enrichment/process_enrichment_for_all)', () => {
    it('should call processEnrichmentForAllRecords', async () => {
      const payload = { tableId: 't1', baseId: 'b1', viewId: 'v1', fieldId: 1 };
      mockRecordService.processEnrichmentForAllRecords.mockResolvedValue({ processed: 10 });

      const result = await controller.processEnrichmentForAll(payload as any);
      expect(result).toEqual({ processed: 10 });
    });
  });

  describe('getEnrichedData (POST v1/enrichment/get_enriched_data)', () => {
    it('should call getEnrichedData', async () => {
      const payload = { domain: 'example.com', entityType: 'COMPANY' };
      mockRecordService.getEnrichedData.mockResolvedValue({ data: {} });

      const result = await controller.getEnrichedData(payload as any);
      expect(result).toEqual({ data: {} });
    });
  });

  describe('getRecordHistory (GET history)', () => {
    it('should parse query params and call getRecordHistory', async () => {
      mockRecordService.getRecordHistory.mockResolvedValue({
        records: [],
        total: 0,
        page: 1,
        pageSize: 50,
        totalPages: 0,
      });

      const result = await controller.getRecordHistory('t1', 'b1', '42', '2', '25');
      expect(mockRecordService.getRecordHistory).toHaveBeenCalledWith(
        { tableId: 't1', baseId: 'b1', recordId: 42, page: 2, pageSize: 25 },
        expect.anything(),
      );
      expect(result.total).toBe(0);
    });

    it('should default page to 1 and pageSize to 50', async () => {
      mockRecordService.getRecordHistory.mockResolvedValue({
        records: [],
        total: 0,
        page: 1,
        pageSize: 50,
        totalPages: 0,
      });

      await controller.getRecordHistory('t1', 'b1', '1');
      expect(mockRecordService.getRecordHistory).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 50 }),
        expect.anything(),
      );
    });
  });

  describe('getGroupPoints (GET group-points)', () => {
    it('should call getGroupPoints with validated payload', async () => {
      mockRecordService.getGroupPoints.mockResolvedValue({ groupPoints: [] });

      const result = await controller.getGroupPoints('t1', 'b1', 'v1');
      expect(mockRecordService.getGroupPoints).toHaveBeenCalledWith(
        { tableId: 't1', baseId: 'b1', viewId: 'v1', __status: 'active' },
        expect.anything(),
      );
      expect(result).toEqual({ groupPoints: [] });
    });
  });

  describe('updateRecordColors (POST /update_record_colors)', () => {
    it('should call updateRecordColors', async () => {
      const payload = { tableId: 't1', baseId: 'b1', rowId: 1, rowColor: '#ff0000' };
      mockRecordService.updateRecordColors.mockResolvedValue({ success: true });

      const result = await controller.updateRecordColors(payload as any);
      expect(result).toEqual({ success: true });
    });
  });

  describe('withCachedPlanRetry', () => {
    it('should retry on CachedPlanError and reconnect prisma', async () => {
      const cachedErr: any = new Error('cached plan');
      cachedErr.isCachedPlanError = true;

      let callCount = 0;
      mockRecordService.getRecords.mockImplementation(() => {
        callCount++;
        if (callCount === 1) throw cachedErr;
        return Promise.resolve({ fields: [], records: [] });
      });

      const result = await controller.getRecords({ tableId: 't1', baseId: 'b1', viewId: 'v1' } as any);
      expect(mockPrismaService.prismaClient.$disconnect).toHaveBeenCalled();
      expect(mockPrismaService.prismaClient.$connect).toHaveBeenCalled();
      expect(result).toEqual({ fields: [], records: [] });
    });

    it('should rethrow non-CachedPlanError', async () => {
      mockRecordService.getRecords.mockRejectedValue(new Error('other error'));

      await expect(
        controller.getRecords({ tableId: 't1', baseId: 'b1', viewId: 'v1' } as any),
      ).rejects.toThrow('other error');
    });
  });
});
