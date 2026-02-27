import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ViewService } from './view.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import {
  UpdateSortPayloadDTO,
  UpdateSortPayloadSchema,
} from './DTO/update_sort.dto';
import {
  UpdateFilterPayloadDTO,
  UpdateFilterPayloadSchema,
} from './DTO/update_filter.dto';
import {
  UpdateGroupByPayloadDTO,
  UpdateGroupByPayloadSchema,
} from './DTO/update_group_by.dto';
import { GetViewPayloadDTO, GetViewPayloadSchema } from './DTO/get-view.dto';
import {
  UpdateViewPayloadDTO,
  UpdateViewPayloadSchema,
} from './DTO/update_view.dto';
import {
  DeleteViewPayloadDTO,
  DeleteViewPayloadSchema,
} from './DTO/delete_view.dto';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { OperationType } from 'src/common/enums/operation-type.enum';
import {
  UpdateColumnMetaDTO,
  UpdateColumnMetaSchema,
} from './DTO/update-columnMeta.dto';

@Controller('view')
export class ViewController {
  constructor(
    private readonly viewService: ViewService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('/create_view')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createView(@Body() createViewPayload: any) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.createView(createViewPayload, prisma);
    });
  }

  @Put('/update_filter')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateFilters(
    @Body(new ZodValidationPipe(UpdateFilterPayloadSchema))
    updateFiltersPayload: UpdateFilterPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.updateFilters(updateFiltersPayload, prisma);
    });
  }

  @Put('/update_sort')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateSort(
    @Body(new ZodValidationPipe(UpdateSortPayloadSchema))
    updateSortsPayload: UpdateSortPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.updateSort(updateSortsPayload, prisma);
    });
  }

  @Put('/update_group_by')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateGroupBy(
    @Body(new ZodValidationPipe(UpdateGroupByPayloadSchema))
    updateGroupByPayload: UpdateGroupByPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.updateGroupBy(updateGroupByPayload, prisma);
    });
  }

  @Post('/get_views')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getViews(
    @Body(new ZodValidationPipe(GetViewPayloadSchema))
    getViewsPayload: GetViewPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.getViews(getViewsPayload, prisma);
    });
  }

  @Post('/create_duplicate_view')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  createDuplicateView(@Body() payload: any) {
    return this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.createDuplicateView(payload, prisma);
    });
  }

  @Post('/update_view')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateView(
    @Body(new ZodValidationPipe(UpdateViewPayloadSchema))
    updateViewPayload: UpdateViewPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.updateView(updateViewPayload, prisma);
    });
  }

  @Put('/delete_view')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.DELETE)
  async deleteView(
    @Body(new ZodValidationPipe(DeleteViewPayloadSchema))
    deleteViewPayload: DeleteViewPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.deleteView(deleteViewPayload, prisma);
    });
  }

  @Put('/update_column_meta')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateColumnMeta(
    @Body(new ZodValidationPipe(UpdateColumnMetaSchema))
    updateColumnMetaPayload: UpdateColumnMetaDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.viewService.updateColumnMeta(
        updateColumnMetaPayload,
        prisma,
        true,
      );
    });
  }
}
