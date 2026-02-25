import { UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PermissionService } from '../permission.service';

describe('PermissionService', () => {
  let service: PermissionService;
  let mockAssetService: any;
  let mockRedisService: any;
  let mockEmitter: any;
  const originalEnv = process.env;

  beforeEach(() => {
    mockAssetService = {
      getAssetInstance: jest.fn(),
    };
    mockRedisService = {
      getObject: jest.fn(),
      set: jest.fn(),
    };
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    process.env = { ...originalEnv };

    service = new PermissionService(
      mockAssetService,
      mockRedisService,
      mockEmitter,
    );
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('registerEvents', () => {
    it('should register permission events', () => {
      const eventNames = mockEmitter.onEvent.mock.calls.map(
        (c: any) => c[0],
      );
      expect(eventNames).toContain('permission.getPermissions');
      expect(eventNames).toContain('permission.getCachedPermission');
    });
  });

  describe('getCachedPermission', () => {
    it('should return full access in development', async () => {
      process.env.ENV = 'development';
      service = new PermissionService(
        mockAssetService,
        mockRedisService,
        mockEmitter,
      );

      const result = await service.getCachedPermission({
        token: 'any',
        asset_id: 'any',
        is_http: true,
      });

      expect(result.result.can_access).toBe(true);
      expect(result.result.can_edit).toBe(true);
      expect(result.result.general_role).toBe('owner');
    });

    it('should return cached permissions when available', async () => {
      process.env.ENV = 'production';
      service = new PermissionService(
        mockAssetService,
        mockRedisService,
        mockEmitter,
      );

      const cachedPerm = { can_access: true, can_edit: false };
      mockRedisService.getObject.mockResolvedValue(cachedPerm);

      jest
        .spyOn(
          require('../../utils/token.utils'),
          'extractUserIdFromToken',
        )
        .mockReturnValue('user-1');

      const result = await service.getCachedPermission({
        token: 'valid-token',
        asset_id: 'asset-1',
        is_http: true,
      });

      expect(result).toEqual({ result: cachedPerm });
    });

    it('should call getPermissions on cache miss and cache the result', async () => {
      process.env.ENV = 'production';
      service = new PermissionService(
        mockAssetService,
        mockRedisService,
        mockEmitter,
      );

      mockRedisService.getObject.mockResolvedValue(null);

      const apiResult = {
        result: { can_access: true, can_edit: true },
      };
      const mockInstance = { getAccessInfo: jest.fn().mockResolvedValue(apiResult) };
      mockAssetService.getAssetInstance.mockResolvedValue(mockInstance);

      jest
        .spyOn(
          require('../../utils/token.utils'),
          'extractUserIdFromToken',
        )
        .mockReturnValue('user-1');

      const result = await service.getCachedPermission({
        token: 'valid-token',
        asset_id: 'asset-1',
        is_http: true,
      });

      expect(result).toEqual(apiResult);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'permissions:user-1:asset-1',
        apiResult.result,
        30,
      );
    });
  });

  describe('getPermissions', () => {
    it('should get permissions from asset service', async () => {
      const accessInfo = {
        result: { can_access: true, can_edit: true },
      };
      const mockInstance = {
        getAccessInfo: jest.fn().mockResolvedValue(accessInfo),
      };
      mockAssetService.getAssetInstance.mockResolvedValue(mockInstance);

      const result = await service.getPermissions({
        token: 'token',
        asset_id: 'asset-1',
        is_http: true,
      });

      expect(result).toEqual(accessInfo);
      expect(mockAssetService.getAssetInstance).toHaveBeenCalledWith({
        access_token: 'token',
      });
      expect(mockInstance.getAccessInfo).toHaveBeenCalledWith('asset-1');
    });

    it('should throw UnauthorizedException for HTTP errors', async () => {
      mockAssetService.getAssetInstance.mockRejectedValue({
        result: { message: 'Forbidden' },
      });

      await expect(
        service.getPermissions({
          token: 'token',
          asset_id: 'asset-1',
          is_http: true,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw WsException for WebSocket errors', async () => {
      mockAssetService.getAssetInstance.mockRejectedValue({
        result: { message: 'Forbidden' },
      });

      await expect(
        service.getPermissions({
          token: 'token',
          asset_id: 'asset-1',
          is_http: false,
        }),
      ).rejects.toThrow(WsException);
    });
  });
});
