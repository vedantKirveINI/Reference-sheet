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
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
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
    private emitter: EventEmitterService,
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

  @Post('/update_link_cell')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateLinkCell(
    @Body() payload: {
      tableId: string;
      baseId: string;
      fieldId: number;
      recordId: number;
      linkedRecordIds: number[];
    },
  ) {
    const { fieldId } = payload;

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
      });

      if (!field || field.type !== 'LINK') {
        throw new BadRequestException('Field is not a link field');
      }

      const [result] = await this.emitter.emitAsync(
        'link.updateLinkCell',
        { ...payload, options: field.options },
        prisma,
      );

      return result;
    });
  }

  @Post('/button_click')
  @RolePermission(OperationType.UPDATE)
  @UseGuards(RolePermissionGuard)
  async buttonClick(@Body() body: any) {
    const { fieldId, recordId, tableId, baseId } = body;

    if (!fieldId || !recordId || !tableId || !baseId) {
      throw new BadRequestException('fieldId, recordId, tableId, and baseId are required');
    }

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      const field = await prisma.field.findUnique({
        where: { id: Number(fieldId) },
      });

      if (!field || field.type !== 'BUTTON') {
        throw new BadRequestException('Field is not a button field');
      }

      const result: any[] = await this.emitter.emitAsync(
        'table.getDbName',
        Number(tableId),
        Number(baseId),
        prisma,
      );

      const dbName: string = result[0];
      if (!dbName) {
        throw new BadRequestException(`No table with ID ${tableId}`);
      }

      const [schemaName, tableName] = dbName.split('.');
      const dbFieldName = field.dbFieldName;

      const currentRecord: any[] = await prisma.$queryRawUnsafe(
        `SELECT "${dbFieldName}" FROM "${schemaName}".${tableName} WHERE __id = $1`,
        Number(recordId),
      );

      let clickData: any = { clickCount: 0, lastClicked: null };
      if (currentRecord.length > 0 && currentRecord[0][dbFieldName]) {
        try {
          clickData = typeof currentRecord[0][dbFieldName] === 'string'
            ? JSON.parse(currentRecord[0][dbFieldName])
            : currentRecord[0][dbFieldName];
        } catch {
          clickData = { clickCount: 0, lastClicked: null };
        }
      }

      clickData.clickCount = (clickData.clickCount || 0) + 1;
      clickData.lastClicked = new Date().toISOString();

      await prisma.$queryRawUnsafe(
        `UPDATE "${schemaName}".${tableName} SET "${dbFieldName}" = $1::jsonb WHERE __id = $2`,
        JSON.stringify(clickData),
        Number(recordId),
      );

      const options: any = field.options || {};
      const actionType = options.actionType;
      let actionResult: any = null;

      if (actionType === 'openUrl' && options.url) {
        actionResult = { type: 'openUrl', url: options.url };
      } else if (actionType === 'runScript' && options.scriptId) {
        actionResult = { type: 'runScript', scriptId: options.scriptId, status: 'triggered' };
      }

      return {
        success: true,
        clickData,
        action: actionResult,
      };
    });
  }
}
