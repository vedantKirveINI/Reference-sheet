import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import {
  GetRecordPayloadDTO,
  GetRecordPayloadSchema,
} from './DTO/get-record.dto';
import {
  UpdateFormRecordPayloadDTO,
  UpdateFormRecordPayloadSchema,
} from './DTO/update-form-record.dto';
import {
  GetRecordsPayloadDTO,
  GetRecordsPayloadSchema,
} from './DTO/get-records.dto';
import {
  UpdateRecordsDTO,
  UpdateRecordsSchema,
} from './DTO/update-records.dto';
import {
  UpdateRecordsStatusDTO,
  UpdateRecordsStatusSchema,
} from './DTO/update-reocrds-status.dto';
import { CreateRecordDTO, CreateRecordSchema } from './DTO/create-record.dto';
import {
  UpdateRecordByFiltersDTO,
  UpdateRecordByFiltersSchema,
} from './DTO/update-records-by-filters.dto';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { OperationType } from 'src/common/enums/operation-type.enum';
import { extractUserIdFromToken } from 'src/utils/token.utils';
import {
  GetEnrichedDataDTO,
  GetEnrichedDataSchema,
} from './DTO/get-enriched-data.dto';
import {
  ProcessBulkEnrichmentDTO,
  ProcessBulkEnrichmentSchema,
} from './DTO/process-bulk-enrichment.dto';
import {
  GetGroupPointsPayloadDTO,
  GetGroupPointsPayloadSchema,
} from './DTO/get-group-points.dto';

@Controller('record')
export class RecordController {
  constructor(
    private recordService: RecordService,
    private prisma: PrismaService,
  ) {}

  @Post('get_records')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getRecords(
    @Body(new ZodValidationPipe(GetRecordsPayloadSchema))
    getRecordPayloads: GetRecordsPayloadDTO,
  ) {
    return await this.recordService.getRecords(
      getRecordPayloads,
      this.prisma.prismaClient,
    );
  }

  @Post('public/get_records') // asked by ankit and harsh for temporary case
  async publicGetRecords(
    @Body(new ZodValidationPipe(GetRecordsPayloadSchema))
    getRecordPayloads: GetRecordsPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getRecords(getRecordPayloads, prisma);
    });
  }

  @Post('v2/get_records')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getRecordsV2(
    @Body(new ZodValidationPipe(GetRecordsPayloadSchema))
    getRecordPayloads: GetRecordsPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getRecords(
        { ...getRecordPayloads, version: 2, is_field_required: true },
        prisma,
      );
    });
  }

  @Post('/update_record')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async recordUpdate(
    @Body(new ZodValidationPipe(UpdateRecordsSchema))
    updateRecordPayload: UpdateRecordsDTO,
    @Req() req: any,
  ) {
    const token = req.headers?.token || req.query?.token || req.body?.token;
    let user_id: string | undefined;
    try {
      if (token) user_id = extractUserIdFromToken(token);
    } catch {}

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.updateRecord(
        { ...updateRecordPayload, user_id },
        prisma,
      );
    });
  }

  @Post('/update_form_record')
  async updateFormRecord(
    @Body(new ZodValidationPipe(UpdateFormRecordPayloadSchema))
    updateFormRecordPayload: UpdateFormRecordPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.updateFormRecord(
        updateFormRecordPayload,
        prisma,
      );
    });
  }

  @Post('/create_record')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createRecord(
    @Body(new ZodValidationPipe(CreateRecordSchema))
    createRecordPayload: CreateRecordDTO,
    @Req() req: any,
  ) {
    const token = req.headers?.token || req.query?.token || req.body?.token;
    let user_id: string | undefined;
    try {
      if (token) user_id = extractUserIdFromToken(token);
    } catch {}

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.createRecord(
        { ...createRecordPayload, user_id },
        prisma,
        true,
      );
    });
  }

  @Post('/create_column')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createColumn(@Body() payload: any) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.createRecordColumn(payload, prisma);
    });
  }

  @Post('/get_record')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getRecord(
    @Body(new ZodValidationPipe(GetRecordPayloadSchema))
    getRecordPayload: GetRecordPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getRecord(getRecordPayload, prisma);
    });
  }

  @Post('v2/get_record')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getRecordV2(
    @Body(new ZodValidationPipe(GetRecordsPayloadSchema))
    getRecordPayload: GetRecordsPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getRecordV2(
        {
          ...getRecordPayload,
          version: 2,
          limit: 1,
          is_field_required: true,
        }, // temp fix of is_field_required as per discussion with alston until satu comes back
        prisma,
      );
    });
  }

  @Put('/update_records_status')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateRecordsStatus(
    @Body(new ZodValidationPipe(UpdateRecordsStatusSchema))
    updateRecodStatusPayload: UpdateRecordsStatusDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.updateRecordsStatus(
        updateRecodStatusPayload,
        prisma,
      );
    });
  }

  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  @Post('/update_records_by_filters')
  async updateRecordsByFilters(
    @Body(new ZodValidationPipe(UpdateRecordByFiltersSchema))
    updateRecordPayload: UpdateRecordByFiltersDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.updateRecordsByFilters(
        updateRecordPayload,
        prisma,
        true,
      );
    });
  }

  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  @Post('/v2/update_records_by_filters')
  async updateRecordsByFiltersV2(
    @Body(new ZodValidationPipe(UpdateRecordByFiltersSchema))
    updateRecordPayload: UpdateRecordByFiltersDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.updateRecordsByFiltersV2(
        updateRecordPayload,
        prisma,
        true,
      );
    });
  }

  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  @Post('/create_duplicate_records')
  async createDuplicateRecords(@Body() payload: any) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.createDuplicateRecords(payload, prisma);
    });
  }

  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  @Post('/v2/create_record')
  async createRecordV2(
    @Body(new ZodValidationPipe(CreateRecordSchema))
    payload: CreateRecordDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.createRecordV2(payload, prisma, true);
    });
  }

  @Post('v3/get_records')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getRecordsV3(
    @Body(new ZodValidationPipe(GetRecordsPayloadSchema))
    getRecordPayloads: GetRecordsPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getRecords(
        { ...getRecordPayloads, version: 3 },
        prisma,
      );
    });
  }

  @Post('v3/get_record')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getRecordV3(
    @Body(new ZodValidationPipe(GetRecordsPayloadSchema))
    getRecordPayload: GetRecordsPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getRecordV3(
        { ...getRecordPayload, version: 3, limit: 1 },
        prisma,
      );
    });
  }

  @Post('v1/enrichment/process_enrichment')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async processEnrichment(@Body() payload: any) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.processEnrichment(payload, prisma);
    });
  }

  @Post('v1/enrichment/process_enrichment_for_all')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async processEnrichmentForAll(
    @Body(new ZodValidationPipe(ProcessBulkEnrichmentSchema))
    payload: ProcessBulkEnrichmentDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.processEnrichmentForAllRecords(
        payload,
        prisma,
      );
    });
  }

  // we can eventually add a interally guard for this endpoint
  @Post('v1/enrichment/get_enriched_data')
  async getEnrichedData(
    @Body(new ZodValidationPipe(GetEnrichedDataSchema))
    payload: GetEnrichedDataDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getEnrichedData(payload, prisma);
    });
  }

  @Get('group-points')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getGroupPoints(
    @Query('tableId') tableId: string,
    @Query('baseId') baseId: string,
    @Query('viewId') viewId: string,
  ) {
    // Validate payload
    const validatedPayload: GetGroupPointsPayloadDTO = {
      tableId,
      baseId,
      viewId,
      __status: 'active',
    };

    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.recordService.getGroupPoints(validatedPayload, prisma);
    });
  }
}
