import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { BaseService } from '../base.service';

describe('BaseService', () => {
  let service: BaseService;
  let mockAssetService: any;
  let mockEmitter: any;
  let mockLodash: any;
  let mockPrismaTransaction: any;

  beforeEach(() => {
    mockAssetService = {
      getAssetInstance: jest.fn().mockReturnValue({
        save: jest.fn().mockResolvedValue({ result: { _id: 'asset-123' } }),
        rename: jest.fn().mockResolvedValue({}),
      }),
    };

    mockEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn().mockResolvedValue([]),
      onEvent: jest.fn(),
    };

    mockLodash = {
      isEmpty: jest.fn((val) => {
        if (val === null || val === undefined) return true;
        if (typeof val === 'object') return Object.keys(val).length === 0;
        return false;
      }),
    };

    mockPrismaTransaction = {
      base: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };

    service = new BaseService(mockAssetService, mockEmitter, mockLodash);
  });

  describe('registerEvents', () => {
    it('should register base events', () => {
      const eventNames = mockEmitter.onEvent.mock.calls.map((c: any) => c[0]);
      expect(eventNames).toContain('base.createBase');
      expect(eventNames).toContain('base.getBases');
      expect(eventNames).toContain('base.getBase');
    });
  });

  describe('createBase', () => {
    const mockRequest = {
      headers: { metadata: {} },
    } as any;

    beforeEach(() => {
      process.env.ENV = 'development';
    });

    afterEach(() => {
      delete process.env.ENV;
    });

    it('should create base in development mode with nanoid', async () => {
      mockPrismaTransaction.base.create.mockResolvedValue({
        id: 'some-id',
        name: 'Test Base',
      });
      mockPrismaTransaction.$queryRawUnsafe
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.createBase(
        {
          name: 'Test Base',
          spaceId: 'sp1',
          createdBy: 'user1',
          access_token: 'test-token',
          source: 'test',
        },
        mockPrismaTransaction,
        mockRequest,
      );

      expect(mockPrismaTransaction.base.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException when base creation fails', async () => {
      mockPrismaTransaction.base.create.mockRejectedValue(new Error('DB error'));

      await expect(
        service.createBase(
          { name: 'Test', spaceId: 'sp1', createdBy: 'u1', access_token: 'tk', source: 'test' },
          mockPrismaTransaction,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when schema already exists', async () => {
      mockPrismaTransaction.base.create.mockResolvedValue({ id: 'base-1' });
      mockPrismaTransaction.$queryRawUnsafe.mockResolvedValue([{ schema_name: 'base-1' }]);

      await expect(
        service.createBase(
          { name: 'Test', spaceId: 'sp1', createdBy: 'u1', access_token: 'tk', source: 'test' },
          mockPrismaTransaction,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBases', () => {
    it('should return bases for valid spaceId', async () => {
      const bases = [{ id: 'b1' }, { id: 'b2' }];
      mockPrismaTransaction.base.findMany.mockResolvedValue(bases);

      const result = await service.getBases('sp1', mockPrismaTransaction);
      expect(result).toEqual(bases);
    });

    it('should throw when no bases found', async () => {
      mockPrismaTransaction.base.findMany.mockResolvedValue([]);

      await expect(
        service.getBases('sp1', mockPrismaTransaction),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getBase', () => {
    it('should return base when found and authorized', async () => {
      mockEmitter.emitAsync.mockResolvedValue([
        { result: { can_access: true } },
      ]);
      const baseData = { id: 'b1', name: 'Test Base' };
      mockPrismaTransaction.base.findUnique.mockResolvedValue(baseData);

      const result = await service.getBase(
        { baseId: 'b1', include_tables: false, include_views: false },
        mockPrismaTransaction,
        'valid-token',
        true,
      );
      expect(result).toEqual(baseData);
    });

    it('should throw UnauthorizedException when no access', async () => {
      mockEmitter.emitAsync.mockResolvedValue([
        { result: { can_access: false } },
      ]);

      await expect(
        service.getBase(
          { baseId: 'b1' },
          mockPrismaTransaction,
          'bad-token',
          true,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should skip auth when should_authenticate is false', async () => {
      const baseData = { id: 'b1', name: 'Test' };
      mockPrismaTransaction.base.findUnique.mockResolvedValue(baseData);

      const result = await service.getBase(
        { baseId: 'b1' },
        mockPrismaTransaction,
        'any-token',
        false,
      );
      expect(result).toEqual(baseData);
      expect(mockEmitter.emitAsync).not.toHaveBeenCalledWith(
        'permission.getPermissions',
        expect.anything(),
      );
    });

    it('should throw when base not found', async () => {
      mockPrismaTransaction.base.findUnique.mockResolvedValue(null);

      await expect(
        service.getBase(
          { baseId: 'b999' },
          mockPrismaTransaction,
          'token',
          false,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include tables and views when requested', async () => {
      mockPrismaTransaction.base.findUnique.mockResolvedValue({
        id: 'b1',
        tables: [{ id: 't1', views: [{ id: 'v1' }] }],
      });

      await service.getBase(
        { baseId: 'b1', include_tables: true, include_views: true },
        mockPrismaTransaction,
        'token',
        false,
      );

      const findCall = mockPrismaTransaction.base.findUnique.mock.calls[0][0];
      expect(findCall.include.tables).toBeTruthy();
    });
  });

  describe('updateBaseSheetName', () => {
    it('should update base name', async () => {
      const updated = { id: 'b1', name: 'New Name' };
      mockPrismaTransaction.base.update.mockResolvedValue(updated);

      const result = await service.updateBaseSheetName(
        { id: 'b1', name: 'New Name', should_update_asset: false },
        mockPrismaTransaction,
        'token',
      );
      expect(result.name).toBe('New Name');
    });

    it('should update asset when should_update_asset is true', async () => {
      mockPrismaTransaction.base.update.mockResolvedValue({
        id: 'b1',
        name: 'New',
      });

      await service.updateBaseSheetName(
        { id: 'b1', name: 'New', should_update_asset: true },
        mockPrismaTransaction,
        'token',
      );

      expect(mockAssetService.getAssetInstance).toHaveBeenCalled();
    });

    it('should throw on update failure', async () => {
      mockPrismaTransaction.base.update.mockRejectedValue(new Error('fail'));

      await expect(
        service.updateBaseSheetName(
          { id: 'b1', name: 'New', should_update_asset: false },
          mockPrismaTransaction,
          'token',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateMultipleBase', () => {
    it('should throw when whereObj is empty', async () => {
      mockLodash.isEmpty.mockReturnValueOnce(true);
      await expect(
        service.updateMultipleBase(
          { whereObj: {} } as any,
          mockPrismaTransaction,
        ),
      ).rejects.toThrow();
    });

    it('should update multiple bases and cascade to tables', async () => {
      mockLodash.isEmpty.mockReturnValue(false);
      mockPrismaTransaction.base.findMany
        .mockResolvedValueOnce([{ id: 'b1' }, { id: 'b2' }])
        .mockResolvedValueOnce([
          { id: 'b1', status: 'inactive' },
          { id: 'b2', status: 'inactive' },
        ]);
      mockPrismaTransaction.base.updateMany.mockResolvedValue({ count: 2 });
      mockEmitter.emitAsync.mockResolvedValue([]);

      const result = await service.updateMultipleBase(
        { whereObj: { id: ['b1', 'b2'] }, status: 'inactive' } as any,
        mockPrismaTransaction,
      );
      expect(result).toHaveLength(2);
    });

    it('should throw when no bases found', async () => {
      mockLodash.isEmpty.mockReturnValue(false);
      mockPrismaTransaction.base.findMany.mockResolvedValue([]);

      await expect(
        service.updateMultipleBase(
          { whereObj: { id: ['b999'] }, status: 'inactive' } as any,
          mockPrismaTransaction,
        ),
      ).rejects.toThrow();
    });
  });

  describe('createDuplicateBase', () => {
    it('should create a duplicate base with tables', async () => {
      mockPrismaTransaction.base.findFirstOrThrow.mockResolvedValue({
        id: 'b1',
        name: 'Original',
        createdBy: 'u1',
      });

      const mockRequest = { headers: { metadata: {} } } as any;

      jest.spyOn(service, 'createBase').mockResolvedValue({
        id: 'b2',
        name: 'Original (Copy)',
      } as any);

      const oldTables = [{ id: 't1' }];
      mockEmitter.emitAsync
        .mockImplementation(async (event: string) => {
          if (event === 'table.getTables') return [oldTables];
          if (event === 'table.createDuplicateTable') return [{ id: 't2' }];
          return [];
        });

      const result = await service.createDuplicateBase(
        {
          asset_id: 'b1',
          workspace_id: 'ws1',
          user_id: 'u1',
          name: '',
          parent_id: '',
        },
        mockRequest,
        mockPrismaTransaction,
        'token',
        true,
      );

      expect(result).toBeDefined();
      expect(result.tables).toHaveLength(1);
    });

    it('should throw when source base not found', async () => {
      mockEmitter.emitAsync.mockResolvedValue([{ id: 'sp1' }]);
      mockPrismaTransaction.base.findFirstOrThrow.mockRejectedValue(
        new Error('not found'),
      );

      await expect(
        service.createDuplicateBase(
          {
            asset_id: 'b999',
            workspace_id: 'ws1',
            user_id: 'u1',
            name: '',
            parent_id: '',
          },
          {} as any,
          mockPrismaTransaction,
          'token',
          true,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSheetSummary', () => {
    it('should return sheet summary', async () => {
      mockPrismaTransaction.base.findUniqueOrThrow.mockResolvedValue({
        id: 'b1',
        name: 'Test',
      });
      mockEmitter.emitAsync.mockResolvedValue([
        [{ id: 't1', name: 'Table 1' }],
      ]);

      const result = await service.getSheetSummary(
        { baseId: 'b1', table_ids: [], is_fields_count_required: false, is_records_count_required: false },
        mockPrismaTransaction,
        'token',
        false,
      );
      expect(result.id).toBe('b1');
      expect(result.tables).toBeDefined();
    });

    it('should throw when sheet not found', async () => {
      mockPrismaTransaction.base.findUniqueOrThrow.mockRejectedValue(
        new Error('not found'),
      );

      await expect(
        service.getSheetSummary(
          { baseId: 'b999', table_ids: [], is_fields_count_required: false, is_records_count_required: false },
          mockPrismaTransaction,
          'token',
          false,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should check permissions when should_authenticate is true', async () => {
      mockEmitter.emitAsync.mockResolvedValueOnce([
        { result: { can_access: false } },
      ]);

      await expect(
        service.getSheetSummary(
          { baseId: 'b1', table_ids: [], is_fields_count_required: false, is_records_count_required: false },
          mockPrismaTransaction,
          'token',
          true,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
