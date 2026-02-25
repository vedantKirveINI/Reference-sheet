import { Test, TestingModule } from '@nestjs/testing';
import { BaseController } from '../base.controller';
import { BaseService } from '../base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

describe('BaseController', () => {
  let controller: BaseController;
  let baseService: any;

  const mockBaseService = {
    createBase: jest.fn(),
    updateBaseSheetName: jest.fn(),
    updateMultipleBase: jest.fn(),
    createDuplicateBase: jest.fn(),
    getSheetSummary: jest.fn(),
  };

  const mockTransaction = jest.fn((fn: any) => fn('prisma-tx'));

  const mockPrismaService = {
    prismaClient: {
      $transaction: mockTransaction,
    },
  };

  const mockEventEmitter = {
    onEvent: jest.fn(),
    emit: jest.fn(),
    emitAsync: jest.fn().mockResolvedValue({ result: { can_access: true, can_edit: true, can_view: true, in_trash: false, general_role: 'owner' } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaseController],
      providers: [
        { provide: BaseService, useValue: mockBaseService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<BaseController>(BaseController);
    jest.clearAllMocks();
  });

  describe('createBase', () => {
    it('should call baseService.createBase within transaction', async () => {
      const payload = { name: 'Test Base', spaceId: 'sp1', createdBy: 'u1' };
      const request = { headers: {} } as any;
      mockBaseService.createBase.mockResolvedValue({ id: 'b1' });

      const result = await controller.createBase(payload, request);
      expect(result).toEqual({ id: 'b1' });
      expect(mockBaseService.createBase).toHaveBeenCalledWith(
        payload,
        'prisma-tx',
        request,
      );
    });
  });

  describe('updateTable (updateBaseSheetName)', () => {
    it('should update base name within transaction', async () => {
      const payload = { id: 'b1', name: 'New Name' } as any;
      const headers = { token: 'tk1' };
      mockBaseService.updateBaseSheetName.mockResolvedValue({ id: 'b1', name: 'New Name' });

      const result = await controller.updateTable(payload, headers);
      expect(result).toEqual({ id: 'b1', name: 'New Name' });
    });
  });

  describe('updateBase', () => {
    it('should update multiple bases', async () => {
      const payload = { whereObj: { id: ['b1'] }, status: 'inactive' } as any;
      mockBaseService.updateMultipleBase.mockResolvedValue([{ id: 'b1' }]);

      const result = await controller.updateBase(payload);
      expect(result).toEqual([{ id: 'b1' }]);
    });

    it('should throw BadRequestException on error', async () => {
      const payload = { whereObj: { id: ['b1'] }, status: 'inactive' } as any;
      mockBaseService.updateMultipleBase.mockRejectedValue(new Error('fail'));

      await expect(controller.updateBase(payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createDuplicateTable (createDuplicateBase)', () => {
    it('should duplicate base', async () => {
      const payload = { asset_id: 'b1', workspace_id: 'ws1' } as any;
      const headers = { token: 'tk1' };
      const request = {} as any;
      mockBaseService.createDuplicateBase.mockResolvedValue({ id: 'b2' });

      const result = await controller.createDuplicateTable(payload, headers, request);
      expect(result).toEqual({ id: 'b2' });
    });
  });

  describe('getSheetSummary', () => {
    it('should return sheet summary', async () => {
      const payload = { baseId: 'b1' } as any;
      const headers = { token: 'tk1' };
      mockBaseService.getSheetSummary.mockResolvedValue({
        id: 'b1',
        tables: [],
      });

      const result = await controller.getSheetSummary(payload, headers);
      expect(result).toEqual({ id: 'b1', tables: [] });
      expect(mockBaseService.getSheetSummary).toHaveBeenCalledWith(
        payload,
        'prisma-tx',
        'tk1',
        false,
      );
    });
  });
});
