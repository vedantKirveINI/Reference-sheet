import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AssetService } from '../npmAssets/asset/asset.service';
import { WsException } from '@nestjs/websockets';
import { GetPermissionsDTO } from './DTO/get-permission.dto';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { RedisService } from '../redis/redis.service';
import { extractUserIdFromToken } from '../utils/token.utils';

@Injectable()
export class PermissionService {
  constructor(
    private readonly assetService: AssetService,
    private readonly redisService: RedisService,
    private emitter: EventEmitterService,
  ) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'permission.getPermissions', handler: this.getPermissions },
      {
        name: 'permission.getCachedPermission',
        handler: this.getCachedPermission,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  async getCachedPermission(payload: GetPermissionsDTO) {
    const { token, asset_id, is_http = true } = payload;
    const userId = extractUserIdFromToken(token);
    const cacheKey = `permissions:${userId}:${asset_id}`;

    try {
      // Try to get from Redis cache first
      const cachedPermissions = await this.redisService.getObject(cacheKey);

      if (cachedPermissions) {
        return { result: cachedPermissions };
      }

      // Cache miss - call external API
      console.log('❌ Permission cache miss - calling external API');
      const apiResult = await this.getPermissions(payload);

      // Cache the API response if successful
      if (apiResult?.result) {
        await this.redisService.set(cacheKey, apiResult.result, 30); // 30 seconds TTL
      }

      return apiResult;
    } catch (error) {
      console.error('❌ Error in getCachedPermission:', error);
      throw error;
    }
  }

  async getPermissions(payload: GetPermissionsDTO) {
    const { token, asset_id, is_http = true } = payload;
    const assetInstancePayload = {
      access_token: token,
    };

    try {
      const assetInstance =
        await this.assetService.getAssetInstance(assetInstancePayload);

      const access_info = await assetInstance.getAccessInfo(asset_id);

      return access_info;
    } catch (e: any) {
      const message = e?.result?.message;

      if (!is_http) {
        throw new WsException(message);
      } else {
        throw new UnauthorizedException(message);
      }
    }
  }
}
