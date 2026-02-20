import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BaseService } from './base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import {
  UpdateBaseSheetNameDTO,
  UpdateBaseSheetNameSchema,
} from './DTO/update-base-sheet-name.dto';
import {
  UpdateBaseStatusDTO,
  UpdateBaseStatusSchema,
} from './DTO/update-base.dto';
import { Request } from 'express';
import { GetSummaryDTO, GetSummarySchema } from './DTO/get-summary.dto';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { OperationType } from 'src/common/enums/operation-type.enum';
import {
  CreateDuplicateBaseDTO,
  CreateDuplicateBaseSchema,
} from './DTO/create-duplicate-base.dto';

@Controller('/base')
export class BaseController {
  constructor(
    private baseService: BaseService,
    private prisma: PrismaService,
  ) {}

  @Post('/create_base')
  async createBase(@Body() createBasePayload: any, @Req() request: Request) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.baseService.createBase(
        createBasePayload,
        prisma,
        request,
      );
    });
  }

  @Put('/update_base_sheet_name')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateTable(
    @Body(new ZodValidationPipe(UpdateBaseSheetNameSchema))
    updateTablePayload: UpdateBaseSheetNameDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.baseService.updateBaseSheetName(
        updateTablePayload,
        prisma,
        token,
      );
    });
  }

  @Put('/update_bases')
  async updateBase(
    @Body(new ZodValidationPipe(UpdateBaseStatusSchema))
    updateBaseStatusPayload: UpdateBaseStatusDTO,
  ) {
    try {
      return await this.prisma.prismaClient.$transaction(async (prisma) => {
        return await this.baseService.updateMultipleBase(
          updateBaseStatusPayload,
          prisma,
        );
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message || 'An error occurred');
      }
      throw new BadRequestException('An error occurred');
    }
  }

  @Post('/create_duplicate_base')
  async createDuplicateTable(
    @Body(new ZodValidationPipe(CreateDuplicateBaseSchema))
    payload: CreateDuplicateBaseDTO,
    @Headers() headers: any,
    @Req() request: Request,
  ) {
    const { token } = headers;

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.baseService.createDuplicateBase(
        payload,
        request,
        prisma,
        token,
        true,
      );
    });
  }

  @Post('/v1/get_sheet_summary')
  async getSheetSummary(
    @Body(new ZodValidationPipe(GetSummarySchema)) payload: GetSummaryDTO,
    @Headers() headers: any,
  ) {
    const { token } = headers;

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.baseService.getSheetSummary(
        payload,
        prisma,
        token,
        false,
      );
    });
  }
}
