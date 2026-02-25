import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RecordService } from '../record.service';
import { RecordUtils } from '../utils/record.utils';
import { DateTimeUtils } from '../../../utils/DateTime';
import { FormulaRecalculatorService } from '../utils/formula-recalculator.service';

describe('RecordService', () => {
  let service: RecordService;
  let mockEmitter: any;
  let mockLodash: any;
  let mockFlowUtilitySdk: any;
  let mockShortUUID: any;
  let mockRecordUtils: any;
  let mockDateTimeUtils: any;
  let mockFormulaRecalculator: any;
  let mockWinstonLogger: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
      onEvent: jest.fn(),
    };

    mockLodash = {
      isEmpty: jest.fn((val) => {
        if (val === null || val === undefined) return true;
        if (Array.isArray(val)) return val.length === 0;
        if (typeof val === 'object') return Object.keys(val).length === 0;
        return false;
      }),
      isObject: jest.fn((val) => typeof val === 'object' && val !== null),
      isDate: jest.fn((val) => val instanceof Date),
      isString: jest.fn((val) => typeof val === 'string'),
    };

    mockFlowUtilitySdk = { resolveValue: jest.fn((val: any) => val) };
    mockShortUUID = { generate: jest.fn(() => 'short-uuid-1') };

    mockRecordUtils = {
      getFilterFieldIds: jest.fn(),
      getSortFieldIds: jest.fn(),
      createFieldIdToFieldMap: jest.fn(() => ({})),
      processAndUpdateFields: jest.fn(() => ({})),
      mapFieldsById: jest.fn((fields) => fields),
    };

    mockDateTimeUtils = {};

    mockFormulaRecalculator = {
      getFormulaExecutionOrder: jest.fn(() => []),
      calculateFormulaValues: jest.fn(() => []),
    };

    mockWinstonLogger = {
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
    };

    mockPrisma = {
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn(),
      $transaction: jest.fn((fn: any) => fn(mockPrisma)),
    };

    service = new RecordService(
      mockEmitter,
      mockLodash,
      mockFlowUtilitySdk,
      mockShortUUID,
      mockRecordUtils,
      mockDateTimeUtils,
      mockFormulaRecalculator,
      mockWinstonLogger,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerEvents', () => {
    it('should register all event handlers on construction', () => {
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'record.create_record_column',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'getRecords',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'updateRecord',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'createRecord',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'record.createMultipleRecordColumns',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'record.updateRecordColumns',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'record.getRecord',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'record.createMultipleRecords',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'record.getRecordV2',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'record.processEnrichment',
        expect.any(Function),
      );
    });
  });

  describe('getRecords', () => {
    const basePayload = {
      tableId: 'table-1',
      baseId: 'base-1',
      viewId: 'view-1',
    };

    const mockView = {
      id: 'view-1',
      type: 'grid',
      filter: null,
      sort: null,
      group: null,
      options: '{}',
    };

    const mockFields = [
      { id: 1, name: 'Name', type: 'SHORT_TEXT', dbFieldName: 'field_1' },
      { id: 2, name: 'Age', type: 'NUMBER', dbFieldName: 'field_2' },
    ];

    const mockRecords = [
      { __id: 1, __status: 'active', field_1: 'Alice', field_2: 25, _row_view_view1: 1 },
      { __id: 2, __status: 'active', field_1: 'Bob', field_2: 30, _row_view_view1: 2 },
    ];

    beforeEach(() => {
      mockEmitter.emitAsync
        .mockImplementation((event: string, ...args: any[]) => {
          if (event === 'view.getViewById') return Promise.resolve([mockView]);
          if (event === 'table.getDbName') return Promise.resolve(['base-1.table_1']);
          if (event === 'view.getFieldOrder') return Promise.resolve([JSON.stringify({ 1: { order: 1 }, 2: { order: 2 } })]);
          if (event === 'field.getFields') return Promise.resolve([mockFields]);
          if (event === 'field.sortFieldsByOrder') return Promise.resolve([mockFields]);
          if (event === 'link.resolveLinkFields') return Promise.resolve([null]);
          if (event === 'lookup.resolveLookupFields') return Promise.resolve([null]);
          if (event === 'rollup.resolveRollupFields') return Promise.resolve([null]);
          return Promise.resolve([]);
        });
      mockPrisma.$queryRawUnsafe.mockResolvedValue(mockRecords);
    });

    it('should return records with fields for version 1', async () => {
      const result = await service.getRecords(basePayload, mockPrisma);
      expect(result).toHaveProperty('fields');
      expect(result).toHaveProperty('records');
      expect(result.fields).toEqual(mockFields);
    });

    it('should throw if no view exists', async () => {
      mockEmitter.emitAsync.mockImplementation((event: string) => {
        if (event === 'view.getViewById') return Promise.resolve([null]);
        return Promise.resolve(['base-1.table_1']);
      });
      await expect(service.getRecords(basePayload, mockPrisma))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw if no table found', async () => {
      mockEmitter.emitAsync.mockImplementation((event: string) => {
        if (event === 'view.getViewById') return Promise.resolve([mockView]);
        if (event === 'table.getDbName') return Promise.resolve([null]);
        return Promise.resolve([]);
      });
      await expect(service.getRecords(basePayload, mockPrisma))
        .rejects.toThrow(BadRequestException);
    });

    it('should apply LIMIT and OFFSET when provided', async () => {
      await service.getRecords({ ...basePayload, limit: 10, offset: 5 }, mockPrisma);
      const query = mockPrisma.$queryRawUnsafe.mock.calls[0][0];
      expect(query).toContain('LIMIT 10');
      expect(query).toContain('OFFSET 5');
    });

    it('should handle version 2 response format', async () => {
      const result = await service.getRecords(
        { ...basePayload, version: 2, is_field_required: true },
        mockPrisma,
      );
      expect(result).toHaveProperty('records');
      expect(result).toHaveProperty('fields');
    });

    it('should handle version 3 response format', async () => {
      const result = await service.getRecords(
        { ...basePayload, version: 3 },
        mockPrisma,
      );
      expect(result).toHaveProperty('records');
    });

    it('should not include fields when is_field_required is false', async () => {
      const result = await service.getRecords(
        { ...basePayload, is_field_required: false },
        mockPrisma,
      );
      expect(result.fields).toBeUndefined();
    });

    it('should detect and rethrow CachedPlanError', async () => {
      const cachedPlanError: any = new Error('P2010');
      cachedPlanError.code = 'P2010';
      cachedPlanError.meta = { message: 'cached plan must not change result type' };
      mockPrisma.$queryRawUnsafe.mockRejectedValue(cachedPlanError);

      await expect(service.getRecords(basePayload, mockPrisma))
        .rejects.toMatchObject({ isCachedPlanError: true });
    });

    it('should throw BadRequestException for non-cached-plan SQL errors', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('SQL error'));
      await expect(service.getRecords(basePayload, mockPrisma))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle kanban view with stackFieldId', async () => {
      const kanbanView = {
        ...mockView,
        type: 'kanban',
        options: JSON.stringify({ stackFieldId: 1 }),
      };
      mockEmitter.emitAsync.mockImplementation((event: string, ...args: any[]) => {
        if (event === 'view.getViewById') return Promise.resolve([kanbanView]);
        if (event === 'table.getDbName') return Promise.resolve(['base-1.table_1']);
        if (event === 'view.getFieldOrder') return Promise.resolve([JSON.stringify({})]);
        if (event === 'field.getFields') return Promise.resolve([mockFields]);
        if (event === 'field.sortFieldsByOrder') return Promise.resolve([mockFields]);
        if (event === 'field.getFieldsById') return Promise.resolve([mockFields]);
        return Promise.resolve([null]);
      });

      const result = await service.getRecords(basePayload, mockPrisma);
      expect(result).toHaveProperty('records');
    });

    it('should apply manual_filters when provided', async () => {
      const manualFilters = {
        id: 1,
        condition: 'and',
        childs: [{ field: 1, operator: { key: '=' }, value: 'test', type: 'SHORT_TEXT' }],
      };
      mockEmitter.emitAsync.mockImplementation((event: string, ...args: any[]) => {
        if (event === 'view.getViewById') return Promise.resolve([mockView]);
        if (event === 'table.getDbName') return Promise.resolve(['base-1.table_1']);
        if (event === 'view.getFieldOrder') return Promise.resolve([JSON.stringify({})]);
        if (event === 'field.getFields') return Promise.resolve([mockFields]);
        if (event === 'field.sortFieldsByOrder') return Promise.resolve([mockFields]);
        if (event === 'field.getFieldsById') return Promise.resolve([mockFields]);
        return Promise.resolve([null]);
      });
      mockRecordUtils.createFieldIdToFieldMap.mockReturnValue({
        1: { ...mockFields[0], dbFieldName: 'field_1' },
      });
      mockRecordUtils.getStringWhereQuery = jest.fn(() => `"field_1" = 'test'`);

      await service.getRecords(
        { ...basePayload, manual_filters: manualFilters },
        mockPrisma,
      );
      expect(mockRecordUtils.getFilterFieldIds).toHaveBeenCalled();
    });

    it('should filter fields based on requiredFields', async () => {
      const result = await service.getRecords(
        { ...basePayload, requiredFields: [{ id: 1 }] } as any,
        mockPrisma,
      );
      expect(result.fields.length).toBe(1);
      expect(result.fields[0].id).toBe(1);
    });

    it('should skip filters when skip_filters is true', async () => {
      await service.getRecords(
        { ...basePayload, skip_filters: true } as any,
        mockPrisma,
      );
      expect(mockRecordUtils.getFilterFieldIds).not.toHaveBeenCalled();
    });
  });

  describe('orderedRecords', () => {
    const sortedFields = [
      { id: 1, dbFieldName: 'field_1' },
      { id: 2, dbFieldName: 'field_2' },
    ];

    it('should map records with system keys and field values', () => {
      const records = [
        { __id: 1, __status: 'active', field_1: 'hello', field_2: 42, _row_viewv1: 1 },
      ];
      const result: any[] = service.orderedRecords(records, sortedFields, 'v1', false);
      expect(result[0].__id).toBe(1);
      expect(result[0].field_1).toBe('hello');
      expect(result[0].field_2).toBe(42);
    });

    it('should stringify object values when should_stringify is true', () => {
      const records = [
        { __id: 1, __status: 'active', field_1: { key: 'value' }, field_2: 42, _row_viewv1: 1 },
      ];
      const result: any[] = service.orderedRecords(records, sortedFields, 'v1', true);
      expect(result[0].field_1).toBe('{"key":"value"}');
    });

    it('should not stringify Date values', () => {
      const dateVal = new Date('2025-01-01');
      const records = [
        { __id: 1, __status: 'active', field_1: dateVal, field_2: 42, _row_viewv1: 1 },
      ];
      const result: any[] = service.orderedRecords(records, sortedFields, 'v1', true);
      expect(result[0].field_1).toEqual(dateVal);
    });

    it('should skip hidden fields when view is provided', () => {
      const view = { columnMeta: JSON.stringify({ 2: { is_hidden: true } }) } as any;
      const records = [
        { __id: 1, __status: 'active', field_1: 'a', field_2: 'b', _row_viewv1: 1 },
      ];
      const result: any[] = service.orderedRecords(records, sortedFields, 'v1', false, view);
      expect(result[0].field_1).toBe('a');
      expect(result[0].field_2).toBeUndefined();
    });
  });

  describe('orderedRecordsV2', () => {
    it('should map records with field IDs as keys', () => {
      const fields = [
        { id: 1, dbFieldName: 'field_1' },
        { id: 2, dbFieldName: 'field_2' },
      ];
      const records = [
        { __id: 1, __status: 'active', field_1: 'test', field_2: 10, _row_viewv1: 1 },
      ];
      const result: any[] = service.orderedRecordsV2(records, fields, 'v1', false);
      expect(result[0][1]).toBe('test');
      expect(result[0][2]).toBe(10);
      expect(result[0].__id).toBe(1);
    });

    it('should stringify objects when should_stringify=true', () => {
      const fields = [{ id: 1, dbFieldName: 'field_1' }];
      const records = [{ __id: 1, __status: 'active', field_1: { a: 1 }, _row_viewv1: 1 }];
      const result: any[] = service.orderedRecordsV2(records, fields, 'v1', true);
      expect(result[0][1]).toBe('{"a":1}');
    });
  });

  describe('orderedRecordsV3', () => {
    it('should wrap values in value/normalizedValue objects', () => {
      const fields = [
        { id: 1, dbFieldName: 'field_1', type: 'SHORT_TEXT' },
      ];
      const records = [
        { __id: 1, __status: 'active', field_1: 'hello', _row_viewv1: 1 },
      ];
      const result: any[] = service.orderedRecordsV3(records, fields, 'v1');
      expect(result[0].__id).toHaveProperty('value', 1);
      expect(result[0].__id).toHaveProperty('normalizedValue', 1);
      expect(result[0][1]).toHaveProperty('value', 'hello');
    });
  });

  describe('createRecordColumn', () => {
    it('should execute ALTER TABLE query to add column', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);

      const result = await service.createRecordColumn(
        { column_name: 'new_col', data_type: 'TEXT', tableId: 'table-1', baseId: 'base-1' },
        mockPrisma,
      );
      expect(result).toBe('Created Column Successfully');
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ALTER TABLE'),
      );
    });

    it('should throw if table not found', async () => {
      mockEmitter.emitAsync.mockResolvedValue([null]);
      await expect(
        service.createRecordColumn(
          { column_name: 'new_col', data_type: 'TEXT', tableId: 'table-1', baseId: 'base-1' },
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if ALTER TABLE fails', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('SQL error'));

      await expect(
        service.createRecordColumn(
          { column_name: 'col', data_type: 'TEXT', tableId: 't1', baseId: 'b1' },
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createMultipleRecordColumns', () => {
    it('should execute single ALTER TABLE with all columns combined', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);

      const payload = {
        tableId: 'table-1',
        baseId: 'base-1',
        create_record_columns_payload: [
          { column_name: 'col_a', data_type: 'TEXT' },
          { column_name: 'col_b', data_type: 'INTEGER' },
        ],
      };

      const result = await service.createMultipleRecordColumns(payload, mockPrisma);
      expect(result).toBe('Created Successfully');
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      const query = mockPrisma.$queryRawUnsafe.mock.calls[0][0];
      expect(query).toContain('ADD COLUMN "col_a" TEXT');
      expect(query).toContain('ADD COLUMN "col_b" INTEGER');
    });
  });

  describe('getRecord', () => {
    it('should return first record matching filters', async () => {
      const record = { __id: 1, field_1: 'value' };
      mockPrisma.$queryRawUnsafe.mockResolvedValue([record]);

      const result = await service.getRecord(
        { baseId: 'base-1', tableId: 'table-1', __status: 'active' } as any,
        mockPrisma,
      );
      expect(result).toEqual(record);
    });

    it('should return empty object if no record found', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.getRecord(
        { baseId: 'base-1', tableId: 'table-1', __status: 'active' } as any,
        mockPrisma,
      );
      expect(result).toEqual({});
    });

    it('should throw BadRequestException on query error', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('SQL fail'));

      await expect(
        service.getRecord(
          { baseId: 'b1', tableId: 't1', __status: 'active' } as any,
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRecordV2', () => {
    it('should return single record with fields', async () => {
      const mockResponse = {
        fields: [{ id: 1 }],
        records: [{ __id: 1 }],
      };
      jest.spyOn(service, 'getRecords').mockResolvedValue(mockResponse);

      const result = await service.getRecordV2(
        { tableId: 't1', baseId: 'b1', viewId: 'v1' } as any,
        mockPrisma,
      );
      expect(result.record).toEqual({ __id: 1 });
      expect(result.fields).toEqual([{ id: 1 }]);
    });

    it('should return empty record if no records found', async () => {
      jest.spyOn(service, 'getRecords').mockResolvedValue({
        fields: [],
        records: [],
      });

      const result = await service.getRecordV2(
        { tableId: 't1', baseId: 'b1', viewId: 'v1' } as any,
        mockPrisma,
      );
      expect(result.record).toEqual({});
    });
  });

  describe('getRecordV3', () => {
    it('should return single record with fields in v3 format', async () => {
      const mockResponse = {
        fields: [{ id: 1 }],
        records: [{ __id: { value: 1 } }],
      };
      jest.spyOn(service, 'getRecords').mockResolvedValue(mockResponse);

      const result = await service.getRecordV3(
        { tableId: 't1', baseId: 'b1', viewId: 'v1' } as any,
        mockPrisma,
      );
      expect(result.record).toEqual({ __id: { value: 1 } });
    });
  });

  describe('updateRecordsStatus (delete records)', () => {
    const payload: any = {
      tableId: 'table-1',
      baseId: 'base-1',
      viewId: 'view-1',
      records: [{ __id: 1, __status: 'inactive' }, { __id: 2, __status: 'inactive' }],
    };

    beforeEach(() => {
      mockEmitter.emitAsync.mockImplementation((event: string) => {
        if (event === 'table.getDbName') return Promise.resolve(['base-1.table_1']);
        if (event === 'timeBasedTrigger.cancelScheduledTriggersForRecord') return Promise.resolve([]);
        return Promise.resolve([]);
      });
    });

    it('should set records to inactive and return updated records', async () => {
      const snapshots = [
        { __id: 1, field_1: 'a' },
        { __id: 2, field_1: 'b' },
      ];
      const updatedRecords = [
        { __id: 1, __status: 'inactive' },
        { __id: 2, __status: 'inactive' },
      ];
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(snapshots)
        .mockResolvedValueOnce(updatedRecords)
        .mockResolvedValueOnce(undefined);

      const result = await service.updateRecordsStatus(payload, mockPrisma);
      expect(result).toEqual(updatedRecords);
      expect(mockEmitter.emit).toHaveBeenCalledWith(
        'emit_deleted_records',
        updatedRecords,
        'table-1',
        'base-1',
      );
    });

    it('should throw if table not found', async () => {
      mockEmitter.emitAsync.mockImplementation((event: string) => {
        if (event === 'table.getDbName') return Promise.resolve([null]);
        return Promise.resolve([]);
      });
      await expect(service.updateRecordsStatus(payload, mockPrisma))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on query error', async () => {
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('SQL error'));
      await expect(service.updateRecordsStatus(payload, mockPrisma))
        .rejects.toThrow(BadRequestException);
    });

    it('should handle empty records array', async () => {
      const emptyPayload = { ...payload, records: [] };
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.updateRecordsStatus(emptyPayload, mockPrisma);
      expect(result).toEqual([]);
    });
  });

  describe('stringifyArrayValues', () => {
    it('should stringify object values in array', () => {
      const input = [{ key: { nested: true }, name: 'hello' }];
      const result = service.stringifyArrayValues(input);
      expect(result[0].key).toBe('{"nested":true}');
      expect(result[0].name).toBe('hello');
    });

    it('should not stringify Date values', () => {
      const date = new Date('2025-01-01');
      const input = [{ created: date }];
      const result = service.stringifyArrayValues(input);
      expect(result[0].created).toEqual(date);
    });

    it('should handle empty array', () => {
      expect(service.stringifyArrayValues([])).toEqual([]);
    });
  });

  describe('buildUpdateQuery', () => {
    const fields = [
      { id: 1, dbFieldName: 'field_1', type: 'SHORT_TEXT' },
      { id: 2, dbFieldName: 'field_2', type: 'NUMBER' },
    ];

    it('should build SET clauses for string data', () => {
      const payload = {
        fields_info: [{ field_id: 1, data: 'hello' }],
        fields,
      };
      const clauses = service.buildUpdateQuery(payload);
      expect(clauses).toContain('"field_1" = \'hello\'');
      expect(clauses[clauses.length - 1]).toContain('__last_modified_time');
    });

    it('should build SET clause for numeric data without quotes', () => {
      const payload = {
        fields_info: [{ field_id: 2, data: 42 }],
        fields,
      };
      const clauses = service.buildUpdateQuery(payload);
      expect(clauses).toContain('"field_2" = 42');
    });

    it('should set NULL for null/undefined/empty/NaN data', () => {
      const cases = [null, undefined, '', NaN];
      for (const data of cases) {
        const payload = { fields_info: [{ field_id: 1, data }], fields };
        const clauses = service.buildUpdateQuery(payload);
        expect(clauses[0]).toContain('NULL');
      }
    });

    it('should stringify object data', () => {
      const payload = {
        fields_info: [{ field_id: 1, data: { a: 1 } }],
        fields,
      };
      const clauses = service.buildUpdateQuery(payload);
      expect(clauses[0]).toContain('{"a":1}');
    });

    it('should throw if field not found', () => {
      const payload = {
        fields_info: [{ field_id: 999, data: 'x' }],
        fields,
      };
      expect(() => service.buildUpdateQuery(payload)).toThrow(BadRequestException);
    });

    it('should escape single quotes in string data', () => {
      const payload = {
        fields_info: [{ field_id: 1, data: "it's" }],
        fields,
      };
      const clauses = service.buildUpdateQuery(payload);
      expect(clauses[0]).toContain("it''s");
    });
  });

  describe('getRecordHistory', () => {
    it('should return paginated history records', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ total: 25 }])
        .mockResolvedValueOnce([
          { record_id: 1, field_id: '1', action: 'update', changed_at: new Date() },
        ]);

      const result = await service.getRecordHistory(
        { tableId: 't1', baseId: 'b1', recordId: 1, page: 1, pageSize: 10 },
        mockPrisma,
      );
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.records).toHaveLength(1);
    });

    it('should throw if table not found', async () => {
      mockEmitter.emitAsync.mockResolvedValue([null]);
      await expect(
        service.getRecordHistory(
          { tableId: 't1', baseId: 'b1', recordId: 1, page: 1, pageSize: 10 },
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw on query error', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('fail'));
      await expect(
        service.getRecordHistory(
          { tableId: 't1', baseId: 'b1', recordId: 1, page: 1, pageSize: 10 },
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should compute correct offset for page 2', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ total: 100 }])
        .mockResolvedValueOnce([]);

      await service.getRecordHistory(
        { tableId: 't1', baseId: 'b1', recordId: 1, page: 2, pageSize: 50 },
        mockPrisma,
      );
      const secondCall = mockPrisma.$queryRawUnsafe.mock.calls[1];
      expect(secondCall[3]).toBe(50);
    });
  });

  describe('updateRecordColors', () => {
    beforeEach(() => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe.mockResolvedValue(undefined);
    });

    it('should update row color', async () => {
      const result = await service.updateRecordColors(
        { tableId: 't1', baseId: 'b1', rowId: 1, rowColor: '#ff0000' } as any,
        mockPrisma,
      );
      expect(result.success).toBe(true);
      expect(result.rowColor).toBe('#ff0000');
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('__row_color'),
      );
    });

    it('should set row color to NULL', async () => {
      await service.updateRecordColors(
        { tableId: 't1', baseId: 'b1', rowId: 1, rowColor: null } as any,
        mockPrisma,
      );
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('NULL'),
      );
    });

    it('should update cell colors as JSONB', async () => {
      const cellColors = [{ fieldId: 1, color: '#00ff00' }];
      await service.updateRecordColors(
        { tableId: 't1', baseId: 'b1', rowId: 1, cellColors } as any,
        mockPrisma,
      );
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('__cell_colors'),
      );
    });

    it('should return success without query when no changes', async () => {
      const result = await service.updateRecordColors(
        { tableId: 't1', baseId: 'b1', rowId: 1 } as any,
        mockPrisma,
      );
      expect(result.success).toBe(true);
      expect(mockPrisma.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it('should throw if table not found', async () => {
      mockEmitter.emitAsync.mockResolvedValue([null]);
      await expect(
        service.updateRecordColors(
          { tableId: 't1', baseId: 'b1', rowId: 1, rowColor: '#000' } as any,
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateFormRecord', () => {
    it('should update record and return result', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      const updatedRecord = [{ __id: 1, field_1: 'updated' }];
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(updatedRecord);

      const result = await service.updateFormRecord(
        {
          tableId: 't1', baseId: 'b1', row_id: 1,
          fields_info: [{ db_field_name: 'field_1', value: 'updated' }],
        } as any,
        mockPrisma,
      );
      expect(result).toEqual(updatedRecord);
    });

    it('should throw if table not found', async () => {
      mockEmitter.emitAsync.mockResolvedValue([null]);
      await expect(
        service.updateFormRecord(
          { tableId: 't1', baseId: 'b1', row_id: 1, fields_info: [] } as any,
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle object values by JSON-stringifying them', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['base-1.table_1']);
      mockPrisma.$queryRawUnsafe
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce([{ __id: 1 }]);

      await service.updateFormRecord(
        {
          tableId: 't1', baseId: 'b1', row_id: 1,
          fields_info: [{ db_field_name: 'field_1', value: { country: 'US' } }],
        } as any,
        mockPrisma,
      );

      const updateQuery = mockPrisma.$queryRawUnsafe.mock.calls[0][0];
      expect(updateQuery).toContain('{"country":"US"}');
    });
  });

  describe('getDeletedFieldName', () => {
    it('should return formatted deleted field name', () => {
      const result = service.getDeletedFieldName('field_123');
      expect(typeof result).toBe('string');
      expect(result).toContain('field_123');
    });
  });

  describe('getValue', () => {
    it('should handle ilike operator with wildcards', () => {
      const result = service.getValue({
        operatorObj: { key: 'ilike' },
        value: 'test',
        data_type: 'text',
      });
      expect(result).toContain('%test%');
    });

    it('should return number without quotes for numeric data type', () => {
      const result = service.getValue({
        operatorObj: { key: '=' },
        value: 42,
        data_type: 'number',
      });
      expect(result).toBe(42);
    });
  });
});
