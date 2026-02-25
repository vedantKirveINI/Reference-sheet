import { BadRequestException } from '@nestjs/common';
import { LinkFieldService, Relationship } from '../link-field.service';

describe('LinkFieldService', () => {
  let service: LinkFieldService;
  let mockEmitter: any;
  let mockShortUUID: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    mockShortUUID = {
      generate: jest.fn().mockReturnValue('shortuuid1'),
    };

    mockPrisma = {
      field: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      tableMeta: {
        findUnique: jest.fn(),
      },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    };

    service = new LinkFieldService(mockEmitter, mockShortUUID);
  });

  describe('registerEvents', () => {
    it('should register all link events', () => {
      expect(mockEmitter.onEvent).toHaveBeenCalledTimes(4);
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'link.createLinkField',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'link.deleteLinkField',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'link.updateLinkCell',
        expect.any(Function),
      );
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'link.resolveLinkFields',
        expect.any(Function),
      );
    });
  });

  describe('handleLinkFieldCreation', () => {
    const basePayload = {
      fieldId: 1,
      tableId: 't1',
      baseId: 'b1',
      viewId: 'v1',
      options: {
        relationship: Relationship.ManyMany,
        foreignTableId: 'ft1',
        isOneWay: true,
      },
    };

    it('should create junction table for ManyMany relationship', async () => {
      const result = await service.handleLinkFieldCreation(
        basePayload,
        mockPrisma,
      );

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS'),
      );
      expect(result.updatedOptions.fkHostTableName).toBeDefined();
      expect(result.updatedOptions.selfKeyName).toBe('__fk_1');
      expect(result.updatedOptions.foreignKeyName).toBe('__fk_1_ref');
      expect(result.updatedOptions.symmetricFieldId).toBeUndefined();
    });

    it('should add FK column for OneMany relationship', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['b1.foreign_table']);

      const payload = {
        ...basePayload,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: 'ft1',
          isOneWay: true,
        },
      };

      const result = await service.handleLinkFieldCreation(payload, mockPrisma);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ADD COLUMN IF NOT EXISTS'),
      );
      expect(result.updatedOptions).toBeDefined();
    });

    it('should create symmetric field for non-one-way link', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['b1.foreign_table']);
      mockPrisma.field.findUnique.mockResolvedValue({
        id: 1,
        name: 'Link Field',
      });
      mockPrisma.tableMeta.findUnique.mockResolvedValue({
        name: 'Source Table',
      });
      mockPrisma.field.create.mockResolvedValue({ id: 99 });

      const payload = {
        ...basePayload,
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: 'ft1',
          isOneWay: false,
        },
      };

      const result = await service.handleLinkFieldCreation(payload, mockPrisma);

      expect(result.updatedOptions.symmetricFieldId).toBeDefined();
    });
  });

  describe('handleLinkFieldDeletion', () => {
    it('should drop junction table for ManyMany', async () => {
      const payload = {
        fieldId: 1,
        tableId: 't1',
        baseId: 'b1',
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: 'ft1',
          fkHostTableName: 'schema1.junction_table',
          selfKeyName: '__fk_1',
          foreignKeyName: '__fk_1_ref',
        },
      };

      await service.handleLinkFieldDeletion(payload, mockPrisma);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        'DROP TABLE IF EXISTS "schema1"."junction_table"',
      );
    });

    it('should deactivate symmetric field if exists', async () => {
      const payload = {
        fieldId: 1,
        tableId: 't1',
        baseId: 'b1',
        options: {
          relationship: Relationship.OneMany,
          foreignTableId: 'ft1',
          symmetricFieldId: '99',
          fkHostTableName: 'schema1.table1',
          selfKeyName: '__fk_1',
          foreignKeyName: '__fk_1_ref',
        },
      };

      await service.handleLinkFieldDeletion(payload, mockPrisma);

      expect(mockPrisma.field.update).toHaveBeenCalledWith({
        where: { id: 99 },
        data: { status: 'inactive' },
      });
    });

    it('should handle missing junction table gracefully', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('Not found'));

      const payload = {
        fieldId: 1,
        tableId: 't1',
        baseId: 'b1',
        options: {
          relationship: Relationship.ManyMany,
          foreignTableId: 'ft1',
          fkHostTableName: 'schema1.missing_table',
          selfKeyName: '__fk_1',
          foreignKeyName: '__fk_1_ref',
        },
      };

      await expect(
        service.handleLinkFieldDeletion(payload, mockPrisma),
      ).resolves.not.toThrow();
    });
  });

  describe('updateLinkCell', () => {
    const basePayload = {
      tableId: 't1',
      baseId: 'b1',
      fieldId: 1,
      recordId: 10,
      linkedRecordIds: [20, 30],
      options: {
        relationship: Relationship.ManyMany,
        foreignTableId: 'ft1',
        fkHostTableName: 'schema1.junction_table',
        selfKeyName: '__fk_1',
        foreignKeyName: '__fk_1_ref',
        isOneWay: true,
      },
    };

    it('should throw if link options incomplete', async () => {
      const payload = {
        ...basePayload,
        options: {
          ...basePayload.options,
          fkHostTableName: undefined as any,
        },
      };

      await expect(
        service.updateLinkCell(payload, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if record IDs are invalid', async () => {
      const payload = {
        ...basePayload,
        linkedRecordIds: [NaN],
      };

      await expect(
        service.updateLinkCell(payload, mockPrisma),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle ManyMany link cell update', async () => {
      const result = await service.updateLinkCell(basePayload, mockPrisma);

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM'),
        10,
      );
      expect(result).toEqual({ success: true });
    });

    it('should handle OneMany link cell update', async () => {
      const payload = {
        ...basePayload,
        options: {
          ...basePayload.options,
          relationship: Relationship.OneMany,
        },
      };

      const result = await service.updateLinkCell(payload, mockPrisma);
      expect(result).toEqual({ success: true });
    });

    it('should handle ManyOne link cell update', async () => {
      mockEmitter.emitAsync.mockResolvedValue(['schema1.source_table']);

      const payload = {
        ...basePayload,
        options: {
          ...basePayload.options,
          relationship: Relationship.ManyOne,
        },
      };

      const result = await service.updateLinkCell(payload, mockPrisma);
      expect(result).toEqual({ success: true });
    });

    it('should handle OneOne link cell update', async () => {
      const payload = {
        ...basePayload,
        options: {
          ...basePayload.options,
          relationship: Relationship.OneOne,
        },
      };

      const result = await service.updateLinkCell(payload, mockPrisma);
      expect(result).toEqual({ success: true });
    });
  });

  describe('resolveLinkFields', () => {
    it('should return records unchanged if no link fields', async () => {
      const records = [{ __id: 1 }];
      const fields = [{ type: 'SHORT_TEXT', id: 1 }];

      const result = await service.resolveLinkFields(
        { records, fields, baseId: 'b1', tableId: 't1' },
        mockPrisma,
      );

      expect(result).toEqual(records);
    });

    it('should skip link fields with missing options', async () => {
      const records = [{ __id: 1 }];
      const fields = [
        {
          type: 'LINK',
          id: 1,
          options: { foreignTableId: 'ft1' },
        },
      ];

      mockEmitter.emitAsync.mockResolvedValue([null]);

      const result = await service.resolveLinkFields(
        { records, fields, baseId: 'b1', tableId: 't1' },
        mockPrisma,
      );

      expect(result).toBeDefined();
    });
  });
});
