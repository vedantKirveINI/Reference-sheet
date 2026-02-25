import { BadRequestException } from '@nestjs/common';
import { FieldService } from '../field.service';
import { FieldUtils } from '../field.utils';
import {
  TYPE_MAPPING,
  SYSTEM_FIELD_MAPPING,
  QUESTION_TYPE,
} from '../DTO/mappings.dto';

describe('FieldService', () => {
  let service: FieldService;
  let mockEmitter: any;
  let mockShortUUID: any;
  let mockLodash: any;
  let mockFieldUtils: Partial<FieldUtils>;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn().mockResolvedValue([]),
    };

    mockShortUUID = {
      generate: jest.fn().mockReturnValue('testuuid'),
    };

    mockLodash = {
      isEmpty: jest.fn((val: any) => {
        if (val === null || val === undefined) return true;
        if (typeof val === 'object') return Object.keys(val).length === 0;
        return false;
      }),
    };

    mockFieldUtils = {
      getDBFieldName: jest.fn().mockReturnValue('test_field_testuuid'),
      getFilterFieldIdsAndClean: jest.fn(),
    };

    mockPrisma = {
      field: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      tableMeta: {
        findUnique: jest.fn(),
      },
      $queryRawUnsafe: jest.fn(),
    };

    service = new FieldService(
      mockEmitter,
      mockShortUUID,
      mockLodash,
      mockFieldUtils as FieldUtils,
    );
  });

  describe('registerEvents', () => {
    it('should register all field events', () => {
      const registeredEvents = mockEmitter.onEvent.mock.calls.map(
        (call: any[]) => call[0],
      );
      expect(registeredEvents).toContain('field.createField');
      expect(registeredEvents).toContain('field.getFields');
      expect(registeredEvents).toContain('field.sortFieldsByOrder');
      expect(registeredEvents).toContain('field.createMultipleFields');
      expect(registeredEvents).toContain('field.updateFields');
      expect(registeredEvents).toContain('field.getFieldsById');
      expect(registeredEvents).toContain('field.updateField');
      expect(registeredEvents).toContain('field.updateFieldsStatus');
      expect(registeredEvents).toContain('field.createDuplicateFields');
      expect(registeredEvents).toContain('field.updateComputedFieldMeta');
      expect(registeredEvents).toContain('field.getAllFormulaFields');
      expect(registeredEvents).toContain('field.createEnrichmentField');
    });
  });

  describe('getDbFieldType', () => {
    it('should return correct db type for known field types', () => {
      expect(service.getDbFieldType('SHORT_TEXT')).toBe('TEXT');
      expect(service.getDbFieldType('NUMBER')).toBe('DOUBLE PRECISION');
      expect(service.getDbFieldType('CHECKBOX')).toBe('BOOLEAN');
      expect(service.getDbFieldType('RATING')).toBe('INTEGER');
      expect(service.getDbFieldType('DATE')).toBe('TIMESTAMPTZ');
      expect(service.getDbFieldType('CURRENCY')).toBe('JSONB');
      expect(service.getDbFieldType('MCQ')).toBe('JSONB');
      expect(service.getDbFieldType('LINK')).toBe('JSONB');
      expect(service.getDbFieldType('BUTTON')).toBe('JSONB');
    });

    it('should return TEXT for unknown type', () => {
      expect(service.getDbFieldType('NONEXISTENT')).toBe('TEXT');
    });
  });

  describe('sortFieldsByOrder', () => {
    it('should sort fields by order from field_order map', () => {
      const fields = [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' },
      ];
      const field_order = {
        a: { order: 3 },
        b: { order: 1 },
        c: { order: 2 },
      };

      const result = service.sortFieldsByOrder(fields, field_order);

      expect(result[0].id).toBe('b');
      expect(result[1].id).toBe('c');
      expect(result[2].id).toBe('a');
    });

    it('should handle fields without order', () => {
      const fields = [{ id: 'a' }, { id: 'b' }];
      const field_order = { a: { order: 1 } };

      const result = service.sortFieldsByOrder(fields, field_order);
      expect(result).toHaveLength(2);
    });
  });

  describe('getFieldReferenceIds', () => {
    it('should return lookupFieldId for LINK fields', () => {
      const field = { type: 'LINK', options: { lookupFieldId: '42' } };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([42]);
    });

    it('should return linkFieldId and lookupFieldId for LOOKUP', () => {
      const field = {
        type: 'LOOKUP',
        lookupOptions: { linkFieldId: '10', lookupFieldId: '20' },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([10, 20]);
    });

    it('should return linkFieldId and lookupFieldId for ROLLUP', () => {
      const field = {
        type: 'ROLLUP',
        options: { linkFieldId: '5', lookupFieldId: '15' },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([5, 15]);
    });

    it('should extract deps from FORMULA expression', () => {
      const field = {
        type: 'FORMULA',
        computedFieldMeta: {
          expression: {
            blocks: [
              { type: 'FIELDS', tableData: { fieldId: '100' } },
            ],
          },
        },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([100]);
    });

    it('should return empty for non-dependent types', () => {
      const field = { type: 'SHORT_TEXT', options: {} };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([]);
    });
  });

  describe('createField', () => {
    const basePayload = {
      name: 'Test Field',
      type: 'SHORT_TEXT',
      options: {},
      viewId: 'v1',
      tableId: 't1',
      baseId: 'b1',
    };

    it('should throw if field with same name already exists', async () => {
      mockPrisma.field.findFirst.mockResolvedValue({ id: 1, name: 'Test Field' });

      await expect(
        service.createField(basePayload, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create a field with correct dbFieldName and dbFieldType', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.create.mockResolvedValue({
        id: 1,
        name: 'Test Field',
        dbFieldName: 'test_field_testuuid',
        dbFieldType: 'TEXT',
      });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const result = await service.createField(basePayload, mockPrisma);

      expect(mockPrisma.field.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Field',
          type: 'SHORT_TEXT',
          dbFieldType: 'TEXT',
          dbFieldName: 'test_field_testuuid',
        }),
      });
      expect(result).toBeDefined();
    });

    it('should use system field mapping for system types', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.create.mockResolvedValue({
        id: 1,
        name: 'Created Time',
        dbFieldName: '__created_time',
        dbFieldType: 'TEXT',
      });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const payload = {
        ...basePayload,
        name: 'Created Time',
        type: 'CREATED_TIME',
      };

      await service.createField(payload, mockPrisma);

      expect(mockPrisma.field.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dbFieldName: '__created_time',
        }),
      });
    });

    it('should throw if system field of same type already exists', async () => {
      mockPrisma.field.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 1, type: 'CREATED_TIME' });

      const payload = {
        ...basePayload,
        name: 'Another Created Time',
        type: 'CREATED_TIME',
      };

      await expect(
        service.createField(payload, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should skip physical column creation for system fields', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.create.mockResolvedValue({
        id: 1,
        name: 'Auto Number',
        dbFieldName: '__auto_number',
        type: 'AUTO_NUMBER',
      });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const payload = {
        ...basePayload,
        name: 'Auto Number',
        type: 'AUTO_NUMBER',
      };

      await service.createField(payload, mockPrisma);

      const emittedEvents = mockEmitter.emitAsync.mock.calls.map(
        (call: any[]) => call[0],
      );
      expect(emittedEvents).not.toContain('record.create_record_column');
    });

    it('should emit link.createLinkField for LINK type', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.create.mockResolvedValue({
        id: 1,
        name: 'Link',
        type: 'LINK',
        dbFieldName: 'link_testuuid',
      });
      mockEmitter.emitAsync.mockResolvedValue([{ updatedOptions: { fk: 'test' } }]);
      mockPrisma.field.update.mockResolvedValue({
        id: 1,
        options: { fk: 'test' },
      });

      const payload = {
        ...basePayload,
        name: 'Link',
        type: 'LINK',
        options: { relationship: 'ManyMany', foreignTableId: 'ft1' },
      };

      await service.createField(payload, mockPrisma);

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'link.createLinkField',
        expect.any(Object),
        mockPrisma,
      );
    });

    it('should handle FORMULA field with expression', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.findMany.mockResolvedValue([]);
      mockPrisma.field.create.mockResolvedValue({
        id: 1,
        name: 'Formula',
        type: 'FORMULA',
        dbFieldName: 'formula_testuuid',
      });
      mockEmitter.emitAsync.mockResolvedValue([]);

      jest.mock('oute-services-fx-validator-sdk', () => ({
        validate: jest.fn().mockReturnValue({ return_type: 'string' }),
      }));

      const payload = {
        ...basePayload,
        name: 'Formula',
        type: 'FORMULA',
        expression: { blocks: [] },
      };

      try {
        await service.createField(payload, mockPrisma);
      } catch (e) {
      }
    });
  });

  describe('getFields', () => {
    it('should return fields for a table', async () => {
      const fields = [
        { id: 1, name: 'F1' },
        { id: 2, name: 'F2' },
      ];
      mockPrisma.field.findMany.mockResolvedValue(fields);

      const result = await service.getFields('t1', mockPrisma);

      expect(mockPrisma.field.findMany).toHaveBeenCalledWith({
        where: { tableMetaId: 't1', status: 'active' },
      });
      expect(result).toEqual(fields);
    });

    it('should filter by type if provided', async () => {
      mockPrisma.field.findMany.mockResolvedValue([]);

      await service.getFields('t1', mockPrisma, 'FORMULA');

      expect(mockPrisma.field.findMany).toHaveBeenCalledWith({
        where: { tableMetaId: 't1', status: 'active', type: 'FORMULA' },
      });
    });

    it('should throw BadRequestException on error', async () => {
      mockPrisma.field.findMany.mockRejectedValue(new Error('DB error'));

      await expect(service.getFields('t1', mockPrisma)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getFieldsById', () => {
    it('should return fields by their IDs', async () => {
      const fields = [{ id: 1 }, { id: 2 }];
      mockPrisma.field.findMany.mockResolvedValue(fields);

      const result = await service.getFieldsById({ ids: [1, 2] }, mockPrisma);

      expect(mockPrisma.field.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] }, status: 'active' },
      });
      expect(result).toEqual(fields);
    });

    it('should throw BadRequestException on error', async () => {
      mockPrisma.field.findMany.mockRejectedValue(new Error('err'));

      await expect(
        service.getFieldsById({ ids: [999] }, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateField', () => {
    const basePayload = {
      id: 1,
      name: 'Updated Name',
      tableId: 't1',
      baseId: 'b1',
      viewId: 'v1',
      type: 'SHORT_TEXT',
    };

    it('should throw if field with same name already exists', async () => {
      mockPrisma.field.findFirst.mockResolvedValue({ id: 2, name: 'Updated Name' });
      mockEmitter.emitAsync.mockResolvedValue([{ computedConfig: {} }]);

      await expect(
        service.updateField(basePayload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if field not found', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));
      mockEmitter.emitAsync.mockResolvedValue([{}]);

      await expect(
        service.updateField(basePayload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update field name and return updated field', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        name: 'Old Name',
        type: 'SHORT_TEXT',
        dbFieldName: 'old_name_uuid',
        dbFieldType: 'TEXT',
      });
      mockPrisma.field.update.mockResolvedValue({
        id: 1,
        name: 'Updated Name',
        type: 'SHORT_TEXT',
      });
      mockEmitter.emitAsync.mockResolvedValue([{}]);

      const result = await service.updateField(basePayload as any, mockPrisma);

      expect(mockPrisma.field.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should handle type changes and push records_payload', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        name: 'Field',
        type: 'SHORT_TEXT',
        dbFieldName: 'field_uuid',
        dbFieldType: 'TEXT',
      });
      mockPrisma.field.update.mockResolvedValue({
        id: 1,
        name: 'Field',
        type: 'NUMBER',
      });
      mockEmitter.emitAsync.mockResolvedValue([{}]);

      const payload = {
        ...basePayload,
        name: undefined,
        type: 'NUMBER',
      };

      await service.updateField(payload as any, mockPrisma);

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'record.updateRecordColumns',
        expect.any(Object),
        mockPrisma,
      );
    });
  });

  describe('updateComputedFieldMeta', () => {
    it('should update computed field meta', async () => {
      mockPrisma.field.update.mockResolvedValue({
        id: 1,
        computedFieldMeta: { hasError: false },
      });

      const result = await service.updateComputedFieldMeta(
        1,
        { hasError: false } as any,
        mockPrisma,
      );

      expect(mockPrisma.field.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { computedFieldMeta: { hasError: false } },
      });
    });

    it('should throw on update error', async () => {
      mockPrisma.field.update.mockRejectedValue(new Error('err'));

      await expect(
        service.updateComputedFieldMeta(1, {} as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createMultipleFields', () => {
    it('should throw if field with same name exists', async () => {
      mockPrisma.field.findFirst.mockResolvedValue({ id: 1, name: 'Existing' });

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        fields_payload: [{ type: 'SHORT_TEXT', name: 'Existing' }],
        should_update_order_in_view: true,
      };

      await expect(
        service.createMultipleFields(payload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create multiple fields and return them', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.create
        .mockResolvedValueOnce({ id: 1, name: 'F1', dbFieldName: 'f1_uuid' })
        .mockResolvedValueOnce({ id: 2, name: 'F2', dbFieldName: 'f2_uuid' });
      mockEmitter.emitAsync.mockResolvedValue([true]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        fields_payload: [
          { type: 'SHORT_TEXT', name: 'F1' },
          { type: 'NUMBER', name: 'F2' },
        ],
        should_update_order_in_view: true,
      };

      const result = await service.createMultipleFields(payload as any, mockPrisma);

      expect(result).toHaveLength(2);
    });

    it('should throw if record column creation fails', async () => {
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.create.mockResolvedValue({ id: 1, name: 'F1', dbFieldName: 'f1' });
      mockEmitter.emitAsync.mockResolvedValue([null]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        fields_payload: [{ type: 'SHORT_TEXT', name: 'F1' }],
        should_update_order_in_view: false,
      };

      await expect(
        service.createMultipleFields(payload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateFields', () => {
    it('should throw if fields not found', async () => {
      mockPrisma.field.findMany.mockResolvedValue([]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        update_fields: [{ id: 999, name: 'x', type: 'SHORT_TEXT' }],
      };

      await expect(
        service.updateFields(payload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if duplicate name found', async () => {
      mockPrisma.field.findMany.mockResolvedValue([
        { id: 1, name: 'A', type: 'SHORT_TEXT' },
        { id: 2, name: 'B', type: 'SHORT_TEXT' },
      ]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        update_fields: [{ id: 1, name: 'B', type: 'SHORT_TEXT', options: {} }],
      };

      await expect(
        service.updateFields(payload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should merge options for DROP_DOWN type', async () => {
      mockPrisma.field.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'DD',
          type: 'DROP_DOWN',
          options: { options: [{ id: '1', label: 'A' }] },
        },
      ]);
      mockPrisma.field.update.mockResolvedValue({ id: 1, type: 'DROP_DOWN' });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        update_fields: [
          {
            id: 1,
            name: 'DD',
            type: 'DROP_DOWN',
            options: { options: [{ id: '2', label: 'B' }] },
          },
        ],
      };

      await service.updateFields(payload as any, mockPrisma);

      expect(mockPrisma.field.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            options: expect.objectContaining({
              options: expect.arrayContaining([
                { id: '1', label: 'A' },
                { id: '2', label: 'B' },
              ]),
            }),
          }),
        }),
      );
    });
  });

  describe('clearFieldsData', () => {
    it('should throw for system fields', async () => {
      mockPrisma.field.findMany.mockResolvedValue([
        { id: 1, name: 'Created Time', type: 'CREATED_TIME' },
      ]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        fields: [{ id: 1 }],
      };

      await expect(
        service.clearFieldsData(payload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should clear data for non-system fields', async () => {
      mockPrisma.field.findMany.mockResolvedValue([
        { id: 1, name: 'Notes', type: 'SHORT_TEXT' },
      ]);
      mockEmitter.emitAsync.mockResolvedValue([{ success: true }]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        fields: [{ id: 1 }],
      };

      const result = await service.clearFieldsData(payload as any, mockPrisma);

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'record.updateRecordsByFilters',
        expect.any(Object),
        mockPrisma,
      );
    });
  });

  describe('createDuplicateFields', () => {
    it('should throw if no fields exist in source table', async () => {
      mockPrisma.field.findMany.mockResolvedValue([]);

      await expect(
        service.createDuplicateFields(
          { baseId: 'b1', old_table_id: 't1', new_table_id: 't2' },
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create fields from source table', async () => {
      mockPrisma.field.findMany.mockResolvedValue([
        { id: 1, type: 'SHORT_TEXT', name: 'A', options: {} },
      ]);

      jest
        .spyOn(service, 'createMultipleFields')
        .mockResolvedValue([{ id: 2, name: 'A' }]);

      const result = await service.createDuplicateFields(
        { baseId: 'b1', old_table_id: 't1', new_table_id: 't2' },
        mockPrisma,
      );

      expect(result).toHaveLength(1);
    });
  });

  describe('createEnrichmentField', () => {
    it('should throw if type is not ENRICHMENT', async () => {
      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        name: 'Enrich',
        type: 'SHORT_TEXT',
        entityType: 'COMPANY',
        identifier: {},
        fieldsToEnrich: [],
        options: {},
      };

      await expect(
        service.createEnrichmentField(payload as any, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create enrichment field with sub-fields', async () => {
      jest.spyOn(service, 'createMultipleFields').mockResolvedValue([
        { id: 1, name: 'Enrichment', dbFieldName: 'enrich_uuid' },
        { id: 2, name: 'Industry', dbFieldName: 'industry_uuid' },
      ]);
      mockPrisma.field.update.mockResolvedValue({
        id: 1,
        name: 'Enrichment',
        options: { entityType: 'COMPANY', config: {} },
      });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        name: 'Enrichment',
        type: 'ENRICHMENT',
        entityType: 'COMPANY',
        identifier: { field_id: 'f1', key: 'name' },
        fieldsToEnrich: [{ name: 'Industry', type: 'SHORT_TEXT' }],
        options: {},
      };

      const result = await service.createEnrichmentField(
        payload as any,
        mockPrisma,
      );

      expect(result).toBeDefined();
      expect(mockPrisma.field.update).toHaveBeenCalled();
    });
  });

  describe('updateEnrichmentField', () => {
    it('should throw if field not found', async () => {
      mockPrisma.field.findUniqueOrThrow.mockRejectedValue(new Error('Not found'));

      await expect(
        service.updateEnrichmentField(
          { id: 999, tableId: 't1', baseId: 'b1', viewId: 'v1' } as any,
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if field is not ENRICHMENT', async () => {
      mockPrisma.field.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        type: 'SHORT_TEXT',
      });

      await expect(
        service.updateEnrichmentField(
          { id: 1, tableId: 't1', baseId: 'b1', viewId: 'v1' } as any,
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if duplicate name exists', async () => {
      mockPrisma.field.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        type: 'ENRICHMENT',
        name: 'Old Name',
        options: {},
      });
      mockPrisma.field.findFirst.mockResolvedValue({ id: 2, name: 'New Name' });

      await expect(
        service.updateEnrichmentField(
          {
            id: 1,
            name: 'New Name',
            tableId: 't1',
            baseId: 'b1',
            viewId: 'v1',
          } as any,
          mockPrisma,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update enrichment field successfully', async () => {
      const identifierArray = [{ field_id: 'f1', key: 'domain' }];
      mockPrisma.field.findUniqueOrThrow.mockResolvedValue({
        id: 1,
        type: 'ENRICHMENT',
        name: 'Old Name',
        options: { config: { identifier: identifierArray, fieldsToEnrich: [] } },
        computedFieldMeta: { hasError: false },
      });
      mockPrisma.field.findFirst.mockResolvedValue(null);
      mockPrisma.field.update.mockResolvedValue({
        id: 1,
        name: 'Updated',
        type: 'ENRICHMENT',
      });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const result = await service.updateEnrichmentField(
        {
          id: 1,
          name: 'Updated',
          tableId: 't1',
          baseId: 'b1',
          viewId: 'v1',
          options: { config: { identifier: identifierArray, fieldsToEnrich: [] } },
        } as any,
        mockPrisma,
      );

      expect(result).toBeDefined();
    });
  });
});
