import { Injectable, Inject, BadRequestException } from '@nestjs/common';

import { ShareAssetDTO } from './DTO/share-asset.dto';
import { InviteMembersDTO } from './DTO/invite-members.dto';
import { GetMembersDTO } from './DTO/get-members.dto';
import { FindOneAssetDTO } from './DTO/find-one-asset.dto';
import { RestoreAssetDTO } from './DTO/restore-asset.dto';
import { CheckRelationDTO } from './DTO/check-relation.dto';

@Injectable()
export class AssetService {
  constructor(@Inject('Asset') private Asset: any) {}

  getAssetInstance = (assetInstancePayload: Record<string, any>) => {
    const { access_token } = assetInstancePayload;

    return new this.Asset({
      url: process.env.OUTE_SERVER,
      token: access_token,
      source: 'sheet-backend',
    });
  };

  async shareAsset(body: ShareAssetDTO, token: string) {
    try {
      const assetInstance = this.getAssetInstance({ access_token: token });

      const response = await assetInstance.share(body);

      return response;
    } catch (e: any) {
      throw new BadRequestException(e.result.message || 'Asset share failed');
    }
  }

  async inviteMembers(payload: InviteMembersDTO, token: string) {
    const assetInstancePayload = { access_token: token };

    try {
      const assetInstance = this.getAssetInstance(assetInstancePayload);

      const response = await assetInstance.inviteMembers(payload);

      return response;
    } catch (e: any) {
      throw new BadRequestException(
        e.result.message || 'Could not invite members',
      );
    }
  }

  async getMembers(payload: GetMembersDTO, token: string) {
    const { asset_id } = payload;

    const assetInstancePayload = { access_token: token };

    try {
      const assetInstance = await this.getAssetInstance(assetInstancePayload);

      const response = await assetInstance.getMembers(asset_id);

      console.log('current members >>', response);

      return response?.result;
    } catch (e: any) {
      throw new BadRequestException(
        e.result.message || 'Could not fetch member details for the table',
      );
    }
  }

  async findOneAsset(payload: FindOneAssetDTO, token: string) {
    const assetInstancePayload = { access_token: token };

    try {
      const assetInstance = await this.getAssetInstance(assetInstancePayload);

      const response = await assetInstance.findOne(payload);

      console.log('response >>', response);

      return response;
    } catch (e: any) {
      throw new BadRequestException(
        e.result.message || 'Could not fetch asset details',
      );
    }
  }

  async restoreAsset(payload: RestoreAssetDTO, token: string) {
    const assetInstancePayload = { access_token: token };

    const { asset_ids } = payload;

    try {
      const assetInstance = await this.getAssetInstance(assetInstancePayload);

      const response = await assetInstance.restore(asset_ids);

      console.log('RESTORE API response >>', response);
      return response;
    } catch (e: any) {
      throw new BadRequestException(
        e.result.message || 'Could not restore asset',
      );
    }
  }

  async checkRelation(payload: CheckRelationDTO, token: string) {
    const assetInstancePayload = { access_token: token };

    const { workspace_id, id, sub_id } = payload;

    try {
      const assetInstance = this.getAssetInstance(assetInstancePayload);

      const query = {
        workspace_id,
        id,
        sub_id,
      };

      const response = await assetInstance.checkRelation(query);
      if (response.status === 'failed') {
        throw new BadRequestException(
          response.result.message || 'Could not check asset relation',
        );
      }

      return response.result;
    } catch (e: any) {
      throw new BadRequestException(
        e.result.message || 'Could not check asset relation',
      );
    }
  }
}
