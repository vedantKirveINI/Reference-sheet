import { Controller, Post, Body, Headers, Query, Get } from '@nestjs/common';
import { AssetService } from './asset.service';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import { ShareAssetDTO, ShareAssetSchema } from './DTO/share-asset.dto';
import { GetMembersDTO, GetMembersSchema } from './DTO/get-members.dto';
import {
  InviteMembersDTO,
  InviteMembersSchema,
} from './DTO/invite-members.dto';
import { FindOneAssetDTO, FindOneAssetSchema } from './DTO/find-one-asset.dto';
import { RestoreAssetDTO, RestoreAssetSchema } from './DTO/restore-asset.dto';
import {
  CheckRelationDTO,
  CheckRelationSchema,
} from './DTO/check-relation.dto';

@Controller('asset')
export class AssetController {
  constructor(private readonly assetService: AssetService) {}

  @Post('/share')
  async shareAsset(
    @Body(new ZodValidationPipe(ShareAssetSchema)) body: ShareAssetDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;
    return this.assetService.shareAsset(body, token);
  }

  @Get('/get_members')
  async getMembers(
    @Query(new ZodValidationPipe(GetMembersSchema))
    getMembersPayload: GetMembersDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;

    return await this.assetService.getMembers(getMembersPayload, token);
  }

  @Post('/invite_members')
  async updatePermissions(
    @Body(new ZodValidationPipe(InviteMembersSchema))
    inviteMembersPayload: InviteMembersDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;

    return await this.assetService.inviteMembers(inviteMembersPayload, token);
  }

  @Get('/find_one')
  async findOneAsset(
    @Query(new ZodValidationPipe(FindOneAssetSchema))
    findOneAssetPayload: FindOneAssetDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;

    return await this.assetService.findOneAsset(findOneAssetPayload, token);
  }

  @Post('/restore_asset')
  async restoreAsset(
    @Body(new ZodValidationPipe(RestoreAssetSchema))
    restoreAssetPayload: RestoreAssetDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;

    return await this.assetService.restoreAsset(restoreAssetPayload, token);
  }

  @Post('/check_relation')
  async checkRelation(
    @Body(new ZodValidationPipe(CheckRelationSchema))
    checkRelationPayload: CheckRelationDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;

    return await this.assetService.checkRelation(checkRelationPayload, token);
  }
}
