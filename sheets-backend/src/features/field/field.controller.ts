import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FieldService } from './field.service';

import {
  createFieldPayloadSchema,
  createFieldPayloadDTO,
} from './DTO/create-field-payload-dto';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import {
  CreateMultiFieldDto,
  createMultiFieldSchema,
} from './DTO/create-multiple-fields.dto';
import {
  UpdateFieldsDTO,
  UpdateSingleFieldDTo,
  updateFieldsSchema,
  updateSingleFieldSchema,
} from './DTO/update-fields.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  UpdateFieldsStatusDTO,
  UpdateFieldsStatusSchema,
} from './DTO/update-fields-status.dto';
import {
  ClearFieldsDataSchema,
  ClearFieldsDatasDTO,
} from './DTO/clear-fields-data.dto';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { OperationType } from 'src/common/enums/operation-type.enum';
import {
  CreateEnrichmentFieldDto,
  createEnrichmentFieldSchema,
} from './DTO/create-enrichment-field.dto';
import {
  UpdateEnrichmentFieldDto,
  updateEnrichmentFieldSchema,
} from './DTO/update-enrichment-field.dto';

@Controller('/field')
export class FieldController {
  constructor(
    private fieldService: FieldService,
    private prisma: PrismaService,
  ) {}

  @Post('/create_field')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createField(
    @Body(new ZodValidationPipe(createFieldPayloadSchema))
    createFieldPayload: createFieldPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.createField(createFieldPayload, prisma);
    });
  }

  @Put('/update_field')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateField(
    @Body(new ZodValidationPipe(updateSingleFieldSchema))
    updateFieldPayload: UpdateSingleFieldDTo,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.updateField(updateFieldPayload, prisma);
    });
  }

  @Get('/getFields')
  async getFields(@Query('tableId') tableId: string) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.getFields(tableId, prisma);
    });
  }

  @Post('/create_multiple_fields')
  async createMultipleFields(
    @Body(new ZodValidationPipe(createMultiFieldSchema))
    createMultipleFieldsPyload: CreateMultiFieldDto,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.createMultipleFields(
        createMultipleFieldsPyload,
        prisma,
      );
    });
  }

  @Post('/update_fields')
  async updateFields(
    @Body(new ZodValidationPipe(updateFieldsSchema))
    updateFieldsPayload: UpdateFieldsDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.updateFields(updateFieldsPayload, prisma);
    });
  }

  @Post('/update_fields_status')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async deleteFields(
    @Body(new ZodValidationPipe(UpdateFieldsStatusSchema))
    updateFieldsStatusPayload: UpdateFieldsStatusDTO,
  ) {
    try {
      return await this.prisma.prismaClient.$transaction(async (prisma) => {
        return await this.fieldService.updateFieldsStatus(
          updateFieldsStatusPayload,
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

  @Post('/clear_fields_data')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async clearFieldsData(
    @Body(new ZodValidationPipe(ClearFieldsDataSchema))
    updateFieldsStatusPayload: ClearFieldsDatasDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.clearFieldsData(
        updateFieldsStatusPayload,
        prisma,
      );
    });
  }

  @Post('/create_duplicate_fields')
  async createDuplicateFields(@Body() poyload: any) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.createDuplicateFields(poyload, prisma);
    });
  }

  @Post('/create_enrichment_field')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createEnrichmentField(
    @Body(new ZodValidationPipe(createEnrichmentFieldSchema))
    createEnrichmentFieldPayload: CreateEnrichmentFieldDto,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.createEnrichmentField(
        createEnrichmentFieldPayload,
        prisma,
      );
    });
  }

  @Post('/update_enrichment_field')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateEnrichmentField(
    @Body(new ZodValidationPipe(updateEnrichmentFieldSchema))
    updateEnrichmentFieldPayload: UpdateEnrichmentFieldDto,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.fieldService.updateEnrichmentField(
        updateEnrichmentFieldPayload,
        prisma,
      );
    });
  }
}
