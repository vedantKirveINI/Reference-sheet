import { BadRequestException } from '@nestjs/common';
import { SheetService } from '../sheet.service';

describe('SheetService', () => {
  let service: SheetService;
  let mockEmitter: any;
  let mockAssetService: any;
  let mockPrismaTransaction: any;

  beforeEach(() => {
    mockEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
      onEvent: jest.fn(),
    };

    mockAssetService = {
      getAssetInstance: jest.fn().mockReturnValue({
        save: jest.fn().mockResolvedValue({}),
      }),
    };

    mockPrismaTransaction = {};

    service = new SheetService(mockEmitter, mockAssetService);
  });

  describe('createSheet', () => {
    const mockRequest = { headers: { metadata: {} } } as any;

    it('should create a complete sheet with space, base, table, view, and field', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce([{ id: 'v1' }])
        .mockResolvedValueOnce([{ id: 'f1' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.createSheet(
        { workspace_id: 'ws1', user_id: 'u1', parent_id: 'p1' },
        mockPrismaTransaction,
        mockRequest,
        'token',
      );

      expect(result.base).toBeDefined();
      expect(result.table).toBeDefined();
      expect(result.view).toBeDefined();
    });

    it('should throw when space creation fails', async () => {
      mockEmitter.emitAsync.mockResolvedValueOnce([null]);

      await expect(
        service.createSheet(
          { workspace_id: 'ws1', user_id: 'u1' },
          mockPrismaTransaction,
          mockRequest,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when base creation fails', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([null]);

      await expect(
        service.createSheet(
          { workspace_id: 'ws1', user_id: 'u1' },
          mockPrismaTransaction,
          mockRequest,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when table creation fails', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([null]);

      await expect(
        service.createSheet(
          { workspace_id: 'ws1', user_id: 'u1' },
          mockPrismaTransaction,
          mockRequest,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when field creation fails', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce([{ id: 'v1' }])
        .mockResolvedValueOnce([null]);

      await expect(
        service.createSheet(
          { workspace_id: 'ws1', user_id: 'u1' },
          mockPrismaTransaction,
          mockRequest,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create 5 default records', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce([{ id: 'v1' }])
        .mockResolvedValueOnce([{ id: 'f1' }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await service.createSheet(
        { workspace_id: 'ws1', user_id: 'u1' },
        mockPrismaTransaction,
        mockRequest,
        'token',
      );

      const createRecordCalls = mockEmitter.emitAsync.mock.calls.filter(
        (c: any) => c[0] === 'createRecord',
      );
      expect(createRecordCalls).toHaveLength(5);
    });

    it('should create enrichment fields when enrichment config provided', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce([{ id: 'v1' }])
        .mockResolvedValueOnce([
          [{ id: 'f1', dbFieldName: 'field_1' }],
        ])
        .mockResolvedValueOnce([{ enrichmentField: true }]);

      const result = await service.createSheet(
        {
          workspace_id: 'ws1',
          user_id: 'u1',
          enrichment: {
            label: 'Company',
            key: 'COMPANY',
            description: 'Enrich company',
            inputFields: [
              { name: 'Domain', key: 'domain', required: true },
            ],
            outputFields: [
              { key: 'industry', name: 'Industry', type: 'SHORT_TEXT' },
            ],
          },
        },
        mockPrismaTransaction,
        mockRequest,
        'token',
      );

      expect(result.enrichmentField).toBeDefined();
    });
  });

  describe('createFormSheet', () => {
    const mockRequest = { headers: {} } as any;

    it('should create a form sheet with fields', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce([{ id: 'v1' }])
        .mockResolvedValueOnce([[{ id: 'f1' }]])
        .mockResolvedValueOnce([{ id: 'v1', columnMeta: '{}' }]);

      const result = await service.createFormSheet(
        {
          workspace_id: 'ws1',
          user_id: 'u1',
          access_token: 'tk',
          parent_id: 'p1',
          form_name: 'My Form',
          fields_payload: [{ name: 'Name', type: 'SHORT_TEXT' }],
        },
        mockPrismaTransaction,
        mockRequest,
      );

      expect(result.table).toBeDefined();
      expect(result.view).toBeDefined();
      expect(result.fields).toBeDefined();
    });

    it('should throw when space creation fails', async () => {
      mockEmitter.emitAsync.mockResolvedValueOnce([]);

      await expect(
        service.createFormSheet(
          {
            workspace_id: 'ws1',
            user_id: 'u1',
            access_token: 'tk',
            form_name: 'Form',
            fields_payload: [],
          },
          mockPrismaTransaction,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when field creation returns undefined', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce([{ id: 'v1' }])
        .mockResolvedValueOnce([undefined]);

      await expect(
        service.createFormSheet(
          {
            workspace_id: 'ws1',
            user_id: 'u1',
            access_token: 'tk',
            form_name: 'Form',
            fields_payload: [{ name: 'F1', type: 'SHORT_TEXT' }],
          },
          mockPrismaTransaction,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSheets', () => {
    it('should return sheets for a space', async () => {
      mockEmitter.emitAsync.mockResolvedValue([[{ id: 'b1' }, { id: 'b2' }]]);

      const result = await service.getSheets('sp1', mockPrismaTransaction);
      expect(result).toEqual([{ id: 'b1' }, { id: 'b2' }]);
    });

    it('should return empty array when no sheets', async () => {
      mockEmitter.emitAsync.mockResolvedValue([undefined]);

      const result = await service.getSheets('sp1', mockPrismaTransaction);
      expect(result).toEqual([]);
    });
  });

  describe('getSheet', () => {
    it('should return a single sheet', async () => {
      mockEmitter.emitAsync.mockResolvedValue([{ id: 'b1', name: 'Test' }]);

      const result = await service.getSheet(
        { baseId: 'b1' },
        mockPrismaTransaction,
        'token',
        { can_access: true, can_edit: false } as any,
      );
      expect(result).toEqual({ id: 'b1', name: 'Test' });
    });

    it('should return empty array when sheet not found', async () => {
      mockEmitter.emitAsync.mockResolvedValue([undefined]);

      const result = await service.getSheet(
        { baseId: 'b999' },
        mockPrismaTransaction,
        'token',
        { can_access: true, can_edit: false } as any,
      );
      expect(result).toEqual([]);
    });
  });

  describe('updateFormSheetFields', () => {
    it('should detect duplicate field names', async () => {
      await expect(
        service.updateFormSheetFields(
          {
            baseId: 'b1',
            tableId: 't1',
            viewId: 'v1',
            fields_payload: [
              { name: 'Email', type: 'EMAIL', node_id: [] },
              { name: 'Email', type: 'EMAIL', node_id: [] },
            ],
          },
          mockPrismaTransaction,
          'token',
          false,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createAiEnrichmentSheet', () => {
    const mockRequest = { headers: { metadata: {} } } as any;

    it('should create AI enrichment sheet', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([
          {
            table: { id: 't1' },
            view: { id: 'v1' },
            fields: [{ id: 'f1' }],
          },
        ]);

      const result = await service.createAiEnrichmentSheet(
        {
          workspace_id: 'ws1',
          user_id: 'u1',
          parent_id: 'p1',
          fields_payload: [{ name: 'Domain', type: 'SHORT_TEXT' }],
          icp_inputs: {},
          prospect_inputs: { domain: 'test.com', prospecting_target: 'engineers' },
        },
        mockPrismaTransaction,
        mockRequest,
        'token',
      );

      expect(result.table).toBeDefined();
      expect(result.fields).toBeDefined();
    });

    it('should process records when provided', async () => {
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ id: 'sp1' }])
        .mockResolvedValueOnce([{ id: 'b1' }])
        .mockResolvedValueOnce([
          {
            table: { id: 't1' },
            view: { id: 'v1' },
            fields: [{ id: 'f1' }],
          },
        ])
        .mockResolvedValueOnce([]);

      await service.createAiEnrichmentSheet(
        {
          workspace_id: 'ws1',
          user_id: 'u1',
          parent_id: 'p1',
          fields_payload: [],
          records: [{ url: 'https://example.com' }],
          icp_inputs: {},
          prospect_inputs: { domain: 'test.com', prospecting_target: 'engineers' },
        },
        mockPrismaTransaction,
        mockRequest,
        'token',
      );

      const webhookCall = mockEmitter.emitAsync.mock.calls.find(
        (c: any) => c[0] === 'table.processWebhookProspectData',
      );
      expect(webhookCall).toBeDefined();
    });
  });
});
