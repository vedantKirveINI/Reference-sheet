import { FieldDependencyService } from '../field-dependency.service';

describe('FieldDependencyService', () => {
  let service: FieldDependencyService;
  let mockEmitter: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    mockPrisma = {
      reference: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    service = new FieldDependencyService(mockEmitter);
  });

  describe('registerEvents', () => {
    it('should register three events', () => {
      expect(mockEmitter.onEvent).toHaveBeenCalledTimes(3);
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'dependency.createReferences',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'dependency.deleteReferences',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'dependency.getDownstreamFields',
        expect.any(Function),
      );
    });
  });

  describe('createReferences', () => {
    it('should delete existing refs and create new ones', async () => {
      await service.createReferences(10, [1, 2, 3], mockPrisma);

      expect(mockPrisma.reference.deleteMany).toHaveBeenCalledWith({
        where: { toFieldId: 10 },
      });
      expect(mockPrisma.reference.createMany).toHaveBeenCalledWith({
        data: [
          { fromFieldId: 1, toFieldId: 10 },
          { fromFieldId: 2, toFieldId: 10 },
          { fromFieldId: 3, toFieldId: 10 },
        ],
        skipDuplicates: true,
      });
    });

    it('should only delete if dependsOnFieldIds is empty', async () => {
      await service.createReferences(10, [], mockPrisma);

      expect(mockPrisma.reference.deleteMany).toHaveBeenCalled();
      expect(mockPrisma.reference.createMany).not.toHaveBeenCalled();
    });
  });

  describe('deleteReferences', () => {
    it('should find downstream refs and delete all related refs', async () => {
      mockPrisma.reference.findMany.mockResolvedValue([
        { toFieldId: 20 },
        { toFieldId: 30 },
      ]);

      const result = await service.deleteReferences(10, mockPrisma);

      expect(mockPrisma.reference.findMany).toHaveBeenCalledWith({
        where: { fromFieldId: 10 },
        select: { toFieldId: true },
      });
      expect(mockPrisma.reference.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [{ fromFieldId: 10 }, { toFieldId: 10 }],
        },
      });
      expect(result).toEqual([20, 30]);
    });

    it('should return empty array when no downstream refs', async () => {
      mockPrisma.reference.findMany.mockResolvedValue([]);

      const result = await service.deleteReferences(10, mockPrisma);

      expect(result).toEqual([]);
    });
  });

  describe('handleCreateReferences', () => {
    it('should delegate to createReferences', async () => {
      jest.spyOn(service, 'createReferences').mockResolvedValue(undefined);

      await service.handleCreateReferences(
        { fieldId: 5, dependsOnFieldIds: [1, 2] },
        mockPrisma,
      );

      expect(service.createReferences).toHaveBeenCalledWith(5, [1, 2], mockPrisma);
    });
  });

  describe('handleDeleteReferences', () => {
    it('should delegate to deleteReferences', async () => {
      jest.spyOn(service, 'deleteReferences').mockResolvedValue([]);

      await service.handleDeleteReferences({ fieldId: 5 }, mockPrisma);

      expect(service.deleteReferences).toHaveBeenCalledWith(5, mockPrisma);
    });
  });

  describe('handleGetDownstreamFields', () => {
    it('should return downstream field ids', async () => {
      mockPrisma.reference.findMany.mockResolvedValue([
        { toFieldId: 10 },
        { toFieldId: 20 },
      ]);

      const result = await service.handleGetDownstreamFields(
        { fieldId: 5 },
        mockPrisma,
      );

      expect(result).toEqual([10, 20]);
    });
  });

  describe('getFieldReferenceIds', () => {
    it('should return lookupFieldId for LINK fields', () => {
      const field = {
        type: 'LINK',
        options: { lookupFieldId: '42' },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([42]);
    });

    it('should return empty for LINK with no lookupFieldId', () => {
      const field = { type: 'LINK', options: {} };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([]);
    });

    it('should return linkFieldId and lookupFieldId for LOOKUP fields', () => {
      const field = {
        type: 'LOOKUP',
        lookupOptions: { linkFieldId: '10', lookupFieldId: '20' },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([10, 20]);
    });

    it('should fall back to options for LOOKUP fields', () => {
      const field = {
        type: 'LOOKUP',
        options: { linkFieldId: '10', lookupFieldId: '20' },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([10, 20]);
    });

    it('should return linkFieldId and lookupFieldId for ROLLUP fields', () => {
      const field = {
        type: 'ROLLUP',
        lookupOptions: { linkFieldId: '5', lookupFieldId: '15' },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([5, 15]);
    });

    it('should extract fieldIds from FORMULA expression blocks', () => {
      const field = {
        type: 'FORMULA',
        computedFieldMeta: {
          expression: {
            blocks: [
              { type: 'FIELDS', tableData: { fieldId: '100' } },
              { type: 'OPERATOR', value: '+' },
              { type: 'FIELDS', tableData: { fieldId: '200' } },
            ],
          },
        },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([100, 200]);
    });

    it('should match dbFieldName in FORMULA blocks against fields list', () => {
      const field = {
        type: 'FORMULA',
        computedFieldMeta: {
          expression: {
            blocks: [
              { type: 'FIELDS', tableData: { dbFieldName: 'col_abc' } },
            ],
          },
        },
      };
      const allFields = [{ id: 55, dbFieldName: 'col_abc' }];
      const result = service.getFieldReferenceIds(field, allFields);
      expect(result).toEqual([55]);
    });

    it('should deduplicate ids', () => {
      const field = {
        type: 'FORMULA',
        computedFieldMeta: {
          expression: {
            blocks: [
              { type: 'FIELDS', tableData: { fieldId: '10' } },
              { type: 'FIELDS', tableData: { fieldId: '10' } },
            ],
          },
        },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([10]);
    });

    it('should return empty for unknown types', () => {
      const field = { type: 'SHORT_TEXT', options: {} };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([]);
    });

    it('should handle missing computedFieldMeta for FORMULA', () => {
      const field = { type: 'FORMULA' };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([]);
    });

    it('should handle NaN ids gracefully', () => {
      const field = {
        type: 'LINK',
        options: { lookupFieldId: 'not-a-number' },
      };
      const result = service.getFieldReferenceIds(field, []);
      expect(result).toEqual([]);
    });
  });
});
