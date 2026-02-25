import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FieldController } from '../field.controller';
import { FieldService } from '../field.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { Reflector } from '@nestjs/core';

describe('FieldController', () => {
  let controller: FieldController;
  let fieldService: Partial<FieldService>;
  let prismaService: any;
  let emitterService: any;

  beforeEach(async () => {
    fieldService = {
      createField: jest.fn().mockResolvedValue({ id: 1, name: 'Test' }),
      updateField: jest.fn().mockResolvedValue({ id: 1, name: 'Updated' }),
      getFields: jest.fn().mockResolvedValue([{ id: 1 }]),
      createMultipleFields: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      updateFields: jest.fn().mockResolvedValue([{ id: 1 }]),
      updateFieldsStatus: jest.fn().mockResolvedValue([{ id: 1 }]),
      clearFieldsData: jest.fn().mockResolvedValue({ success: true }),
      createDuplicateFields: jest.fn().mockResolvedValue([{ id: 3 }]),
      createEnrichmentField: jest.fn().mockResolvedValue({ id: 4 }),
      updateEnrichmentField: jest.fn().mockResolvedValue({ id: 4 }),
    };

    prismaService = {
      prismaClient: {
        $transaction: jest.fn((fn: any) => fn(prismaService.prismaClient)),
      },
    };

    emitterService = {
      emit: jest.fn(),
      emitAsync: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FieldController],
      providers: [
        { provide: FieldService, useValue: fieldService },
        { provide: PrismaService, useValue: prismaService },
        { provide: EventEmitterService, useValue: emitterService },
        Reflector,
      ],
    }).compile();

    controller = module.get<FieldController>(FieldController);
  });

  describe('createField', () => {
    it('should call fieldService.createField within a transaction', async () => {
      const payload = {
        tableId: 't1',
        viewId: 'v1',
        baseId: 'b1',
        type: 'SHORT_TEXT',
        name: 'Field',
      };

      const result = await controller.createField(payload);

      expect(fieldService.createField).toHaveBeenCalledWith(
        payload,
        prismaService.prismaClient,
      );
      expect(result).toEqual({ id: 1, name: 'Test' });
    });
  });

  describe('updateField', () => {
    it('should call fieldService.updateField within a transaction', async () => {
      const payload = {
        id: 1,
        tableId: 't1',
        viewId: 'v1',
        baseId: 'b1',
        name: 'Updated',
      };

      const result = await controller.updateField(payload as any);

      expect(fieldService.updateField).toHaveBeenCalledWith(
        payload,
        prismaService.prismaClient,
      );
      expect(result).toEqual({ id: 1, name: 'Updated' });
    });
  });

  describe('getFields', () => {
    it('should call fieldService.getFields with tableId', async () => {
      const result = await controller.getFields('t1');

      expect(fieldService.getFields).toHaveBeenCalledWith(
        't1',
        prismaService.prismaClient,
      );
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('createMultipleFields', () => {
    it('should call fieldService.createMultipleFields', async () => {
      const payload = {
        tableId: 't1',
        viewId: 'v1',
        baseId: 'b1',
        fields_payload: [
          { type: 'SHORT_TEXT', name: 'Field1' },
          { type: 'NUMBER', name: 'Field2' },
        ],
      };

      const result = await controller.createMultipleFields(payload as any);

      expect(fieldService.createMultipleFields).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe('updateFields', () => {
    it('should call fieldService.updateFields', async () => {
      const payload = {
        tableId: 't1',
        baseId: 'b1',
        update_fields: [{ id: 1, name: 'X', type: 'SHORT_TEXT' }],
      };

      const result = await controller.updateFields(payload as any);

      expect(fieldService.updateFields).toHaveBeenCalled();
    });
  });

  describe('deleteFields', () => {
    it('should call fieldService.updateFieldsStatus', async () => {
      const payload = {
        tableId: 't1',
        baseId: 'b1',
        status: 'inactive',
        fields: [{ id: 1 }],
      };

      const result = await controller.deleteFields(payload as any);

      expect(fieldService.updateFieldsStatus).toHaveBeenCalled();
    });

    it('should throw BadRequestException on service error', async () => {
      (fieldService.updateFieldsStatus as jest.Mock).mockRejectedValue(
        new Error('Cannot delete all fields'),
      );

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        status: 'inactive',
        fields: [{ id: 1 }],
      };

      await expect(controller.deleteFields(payload as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('clearFieldsData', () => {
    it('should call fieldService.clearFieldsData', async () => {
      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        fields: [{ id: 1 }],
      };

      const result = await controller.clearFieldsData(payload as any);

      expect(fieldService.clearFieldsData).toHaveBeenCalled();
    });
  });

  describe('createDuplicateFields', () => {
    it('should call fieldService.createDuplicateFields', async () => {
      const payload = { baseId: 'b1', old_table_id: 't1', new_table_id: 't2' };

      const result = await controller.createDuplicateFields(payload);

      expect(fieldService.createDuplicateFields).toHaveBeenCalled();
    });
  });

  describe('createEnrichmentField', () => {
    it('should call fieldService.createEnrichmentField', async () => {
      const payload = {
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        name: 'Enrich',
        type: 'ENRICHMENT',
        entityType: 'COMPANY',
        identifier: {},
        fieldsToEnrich: [],
      };

      const result = await controller.createEnrichmentField(payload as any);

      expect(fieldService.createEnrichmentField).toHaveBeenCalled();
    });
  });

  describe('updateEnrichmentField', () => {
    it('should call fieldService.updateEnrichmentField', async () => {
      const payload = {
        id: 1,
        tableId: 't1',
        baseId: 'b1',
        viewId: 'v1',
        name: 'Updated Enrich',
      };

      const result = await controller.updateEnrichmentField(payload as any);

      expect(fieldService.updateEnrichmentField).toHaveBeenCalled();
    });
  });

  describe('updateLinkCell', () => {
    it('should throw if field is not a link field', async () => {
      prismaService.prismaClient.field = {
        findUnique: jest.fn().mockResolvedValue({ id: 1, type: 'SHORT_TEXT' }),
      };

      const payload = {
        tableId: 't1',
        baseId: 'b1',
        fieldId: 1,
        recordId: 10,
        linkedRecordIds: [20],
      };

      prismaService.prismaClient.$transaction = jest.fn(async (fn: any) => {
        const txPrisma = {
          field: {
            findUnique: jest.fn().mockResolvedValue({ id: 1, type: 'SHORT_TEXT' }),
          },
        };
        return fn(txPrisma);
      });

      await expect(controller.updateLinkCell(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('buttonClick', () => {
    it('should throw if required fields missing', async () => {
      await expect(
        controller.buttonClick({ fieldId: 1, recordId: null, tableId: 't1', baseId: 'b1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if field is not a button field', async () => {
      prismaService.prismaClient.$transaction = jest.fn(async (fn: any) => {
        const txPrisma = {
          field: {
            findUnique: jest.fn().mockResolvedValue({ id: 1, type: 'SHORT_TEXT' }),
          },
        };
        return fn(txPrisma);
      });

      await expect(
        controller.buttonClick({
          fieldId: 1,
          recordId: 10,
          tableId: '1',
          baseId: '1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle button click with max count exceeded', async () => {
      prismaService.prismaClient.$transaction = jest.fn(async (fn: any) => {
        const txPrisma = {
          field: {
            findUnique: jest.fn().mockResolvedValue({
              id: 1,
              type: 'BUTTON',
              dbFieldName: 'btn_col',
              options: { maxCount: 1 },
            }),
          },
          $queryRawUnsafe: jest.fn().mockResolvedValue([
            { btn_col: JSON.stringify({ clickCount: 1, lastClicked: null }) },
          ]),
        };
        return fn(txPrisma);
      });

      emitterService.emitAsync.mockResolvedValue(['schema.table']);

      await expect(
        controller.buttonClick({
          fieldId: 1,
          recordId: 10,
          tableId: '1',
          baseId: '1',
        }),
      ).rejects.toThrow('Button click limit reached');
    });

    it('should handle successful button click with URL action', async () => {
      prismaService.prismaClient.$transaction = jest.fn(async (fn: any) => {
        const txPrisma = {
          field: {
            findUnique: jest.fn().mockResolvedValue({
              id: 1,
              type: 'BUTTON',
              dbFieldName: 'btn_col',
              options: { actionType: 'openUrl', url: 'https://example.com' },
            }),
          },
          $queryRawUnsafe: jest.fn().mockResolvedValue([
            { btn_col: JSON.stringify({ clickCount: 0, lastClicked: null }) },
          ]),
        };
        return fn(txPrisma);
      });

      emitterService.emitAsync.mockResolvedValue(['schema.table']);

      const result = await controller.buttonClick({
        fieldId: 1,
        recordId: 10,
        tableId: '1',
        baseId: '1',
      });

      expect(result.success).toBe(true);
      expect(result.action).toEqual({ type: 'openUrl', url: 'https://example.com' });
    });

    it('should handle reset count', async () => {
      prismaService.prismaClient.$transaction = jest.fn(async (fn: any) => {
        const txPrisma = {
          field: {
            findUnique: jest.fn().mockResolvedValue({
              id: 1,
              type: 'BUTTON',
              dbFieldName: 'btn_col',
              options: { resetCount: true },
            }),
          },
          $queryRawUnsafe: jest.fn().mockResolvedValue([
            { btn_col: JSON.stringify({ clickCount: 5, lastClicked: null }) },
          ]),
        };
        return fn(txPrisma);
      });

      emitterService.emitAsync.mockResolvedValue(['schema.table']);

      const result = await controller.buttonClick({
        fieldId: 1,
        recordId: 10,
        tableId: '1',
        baseId: '1',
        resetCount: true,
      });

      expect(result.success).toBe(true);
      expect(result.clickData.clickCount).toBe(0);
    });
  });
});
