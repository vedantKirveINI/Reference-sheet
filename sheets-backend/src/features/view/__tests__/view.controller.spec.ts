import { Test, TestingModule } from '@nestjs/testing';
import { ViewController } from '../view.controller';
import { ViewService } from '../view.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

describe('ViewController', () => {
  let controller: ViewController;
  let viewService: ViewService;
  let prismaService: any;

  const mockViewService = {
    createView: jest.fn(),
    updateFilters: jest.fn(),
    updateSort: jest.fn(),
    updateGroupBy: jest.fn(),
    getViews: jest.fn(),
    createDuplicateView: jest.fn(),
    updateView: jest.fn(),
    deleteView: jest.fn(),
    updateColumnMeta: jest.fn(),
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
      controllers: [ViewController],
      providers: [
        { provide: ViewService, useValue: mockViewService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EventEmitterService, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<ViewController>(ViewController);
    jest.clearAllMocks();
  });

  describe('createView', () => {
    it('should call viewService.createView within transaction', async () => {
      const payload = { table_id: 't1', baseId: 'b1', name: 'Test View' };
      const expected = { id: 'v1', ...payload };
      mockViewService.createView.mockResolvedValue(expected);

      const result = await controller.createView(payload);
      expect(result).toEqual(expected);
      expect(mockViewService.createView).toHaveBeenCalledWith(payload, 'prisma-tx');
    });
  });

  describe('updateFilters', () => {
    it('should call viewService.updateFilters within transaction', async () => {
      const payload = { id: 'v1', filter: '{}', tableId: 't1', baseId: 'b1' };
      mockViewService.updateFilters.mockResolvedValue({ id: 'v1' });

      const result = await controller.updateFilters(payload as any);
      expect(mockViewService.updateFilters).toHaveBeenCalledWith(payload, 'prisma-tx');
    });
  });

  describe('updateSort', () => {
    it('should call viewService.updateSort within transaction', async () => {
      const payload = { id: 'v1', sort: '{}', tableId: 't1', baseId: 'b1' };
      mockViewService.updateSort.mockResolvedValue({ id: 'v1' });

      await controller.updateSort(payload as any);
      expect(mockViewService.updateSort).toHaveBeenCalledWith(payload, 'prisma-tx');
    });
  });

  describe('updateGroupBy', () => {
    it('should call viewService.updateGroupBy within transaction', async () => {
      const payload = {
        id: 'v1',
        groupBy: { groupObjs: [] },
        tableId: 't1',
        baseId: 'b1',
      };
      mockViewService.updateGroupBy.mockResolvedValue({ id: 'v1' });

      await controller.updateGroupBy(payload as any);
      expect(mockViewService.updateGroupBy).toHaveBeenCalledWith(payload, 'prisma-tx');
    });
  });

  describe('getViews', () => {
    it('should call viewService.getViews within transaction', async () => {
      const payload = { baseId: 'b1', tableId: 't1' };
      mockViewService.getViews.mockResolvedValue([{ id: 'v1' }]);

      const result = await controller.getViews(payload as any);
      expect(result).toEqual([{ id: 'v1' }]);
    });
  });

  describe('createDuplicateView', () => {
    it('should call viewService.createDuplicateView within transaction', async () => {
      const payload = { viewId: 'v1', tableId: 't1', baseId: 'b1' };
      mockViewService.createDuplicateView.mockResolvedValue({ id: 'v2' });

      const result = await controller.createDuplicateView(payload);
      expect(result).toEqual({ id: 'v2' });
    });
  });

  describe('updateView', () => {
    it('should call viewService.updateView within transaction', async () => {
      const payload = { id: 'v1', name: 'Updated', tableId: 't1', baseId: 'b1' };
      mockViewService.updateView.mockResolvedValue({ id: 'v1', name: 'Updated' });

      const result = await controller.updateView(payload as any);
      expect(result).toEqual({ id: 'v1', name: 'Updated' });
    });
  });

  describe('deleteView', () => {
    it('should call viewService.deleteView within transaction', async () => {
      const payload = { id: 'v1', tableId: 't1', baseId: 'b1' };
      mockViewService.deleteView.mockResolvedValue({ id: 'v1', status: 'inactive' });

      const result = await controller.deleteView(payload as any);
      expect(result).toEqual({ id: 'v1', status: 'inactive' });
    });
  });

  describe('updateColumnMeta', () => {
    it('should call viewService.updateColumnMeta with is_http=true', async () => {
      const payload = {
        viewId: 'v1',
        baseId: 'b1',
        columnMeta: [{ id: 'f1', width: 200 }],
      };
      mockViewService.updateColumnMeta.mockResolvedValue(payload);

      await controller.updateColumnMeta(payload as any);
      expect(mockViewService.updateColumnMeta).toHaveBeenCalledWith(
        payload,
        'prisma-tx',
        true,
      );
    });
  });
});
