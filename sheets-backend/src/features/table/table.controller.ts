import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTable, CreateTableSchema } from './DTO/create-table.dto';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetTablePayloadDTO, GetTablePayloadSchema } from './DTO/get-table.dto';
import {
  UpdateMultipleTableDTO,
  UpdateMultipleTableSchema,
  UpdateTableScehma,
} from './DTO/update-table.dto';
import {
  GetTableSchema,
  GetTableSchemaPayloadDTO,
} from './DTO/get-table-schema.dto';
import {
  UpdateDataStreamsDTO,
  UpdateDataStreamsSchema,
} from './DTO/update-data-stream.dto';
import {
  GetDataStreamDTO,
  GetDataStreamSchema,
} from './DTO/get-data-stream.dto';
import {
  CreateDataStreamsDTO,
  CreateDataStreamsSchema,
} from './DTO/create-data-stream.dto';
import {
  SetIsStreamingDTO,
  SetIsStreamingSchema,
} from './DTO/set-is-streaming.dto';
import {
  ExportDataCSVPayload,
  ExportDataCSVSchema,
} from './DTO/export-csv-data.dto';
import { Response } from 'express';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import {
  AddDataFromCsvDTO,
  AddDataFromCsvSchema,
} from './DTO/add-data-from-csv.dto';
import {
  AddDataToNewTableFromCsvDTO,
  AddDataToNewTableFromCsvSchema,
} from './DTO/add-data-to-new-table-from-csv.dto';
import {
  UpsertDataStreamDTO,
  UpsertDataStreamSchema,
} from './DTO/upsert-data-stream.dto';
import { IcpBuildDTO, IcpBuildSchema } from './DTO/icp-build.dto';
import { ProspectRunDTO, ProspectRunSchema } from './DTO/prospect-run.dto';
import {
  IcpProspectDataDTO,
  IcpProspectDataSchema,
} from './DTO/common-enrichment.dto';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { RolePermission } from 'src/decorators/role-permission.decorator';
import { OperationType } from 'src/common/enums/operation-type.enum';
import {
  WebhookProspectDataDTO,
  WebhookProspectDataSchema,
} from './DTO/prospect-data.dto';

@Controller('/table')
export class TableController {
  constructor(
    private tableService: TableService,
    private prisma: PrismaService,
    private readonly emitter: EventEmitterService,
  ) {}

  @Post('/create_table')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createTable(
    @Body(new ZodValidationPipe(CreateTableSchema)) createTable: CreateTable,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      const { user_id, baseId } = createTable;
      const table = await this.tableService.createTable(
        { ...createTable, createdBy: user_id },
        prisma,
      );

      const create_view_payload = {
        baseId: baseId,
        table_id: table.id,
        name: 'Default View',
        type: 'users view',
        version: 1,
        columnMeta: '',
        order: 1,
        createdBy: user_id,
      };

      const [view] = await this.emitter.emitAsync(
        'view.createView',
        create_view_payload,
        prisma,
      );

      const create_field_payload = {
        type: 'SHORT_TEXT',
        name: 'Name',
        order: 1,
        tableId: table.id,
        baseId: baseId,
        viewId: view.id,
      };

      const field_array = await this.emitter.emitAsync(
        'field.createField',
        create_field_payload,
        prisma,
      );

      const field = field_array[0];

      const payload = {
        tableId: table.id,
        baseId: baseId,
        viewId: view.id,
        fields_info: [
          {
            data: '',
            field_id: field.id,
          },
        ],
      };

      for (let i = 0; i < 3; i++) {
        const record_payload = { ...payload, order: i + 1 };

        await this.emitter.emitAsync('createRecord', record_payload, prisma);
      }

      return {
        table: table,
        field: field,
        view: view,
      };
    });
  }

  @Get()
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getTables(
    @Query(new ZodValidationPipe(GetTablePayloadSchema))
    getTablePayload: GetTablePayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.getTables(getTablePayload, prisma);
    });
  }

  @Put('/update_table')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateTable(
    @Body(new ZodValidationPipe(UpdateTableScehma)) updateTablePayload: any,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.updateTable(updateTablePayload, prisma);
    });
  }

  @Get('/get_table')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getTable(
    @Query(new ZodValidationPipe(GetTableSchema))
    getTablePayload: GetTableSchemaPayloadDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.getTable(getTablePayload, prisma);
    });
  }

  @Post('/get_data_stream')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async getDataStream(
    @Body(new ZodValidationPipe(GetDataStreamSchema))
    payload: GetDataStreamDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.getDataStream(payload, prisma);
    });
  }

  @Post('create_data_streams')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createMultipleDataStreams(
    @Body(new ZodValidationPipe(CreateDataStreamsSchema))
    payload: CreateDataStreamsDTO,
  ) {
    try {
      return await this.prisma.prismaClient.$transaction(async (prisma) => {
        return await this.tableService.createMultipleDataStreams(
          payload,
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

  @Post('update_data_streams')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateMultipleDataStreams(
    @Body(new ZodValidationPipe(UpdateDataStreamsSchema))
    payload: UpdateDataStreamsDTO,
  ) {
    try {
      return await this.prisma.prismaClient.$transaction(async (prisma) => {
        return await this.tableService.updateMultipleDataStreams(
          payload,
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

  @Post('upsert_data_stream')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async upsertDataStream(
    @Body(new ZodValidationPipe(UpsertDataStreamSchema))
    payload: UpsertDataStreamDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.upsertDataStream(payload, prisma);
    });
  }

  @Post('export_data_to_csv')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.GET)
  async exportTableDataToCSV(
    @Body(new ZodValidationPipe(ExportDataCSVSchema))
    exportDataPayload: ExportDataCSVPayload,
    @Res() res: Response,
  ) {
    try {
      const get_records_response = await this.prisma.prismaClient.$transaction(
        async (prisma) => {
          return await this.emitter.emitAsync(
            'getRecords',
            exportDataPayload,
            prisma,
          );
        },
      );

      const { records, fields } = get_records_response[0];

      const payload = {
        records,
        fields,
      };

      // Handle CSV generation inside the service and return the data
      const csvStream = await this.tableService.exportDataToCSV(payload);

      res.setHeader(
        'Content-Disposition',
        'attatchment; filename="export.csv"',
      );
      res.setHeader('Content-Type', 'text/csv');

      // Pipe the CSV stream to the response
      csvStream.pipe(res);

      // Handle stream errors
      csvStream.on('error', (err) => {
        console.error('Stream error:', err);
        res.status(500).send('Internal Server Error');
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message || 'An error occurred');
      }
      throw new BadRequestException('An error occurred');
    }
  }

  @Post('/add_csv_data_to_existing_table')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async addDataToExistingTable(
    @Body(new ZodValidationPipe(AddDataFromCsvSchema))
    payload: AddDataFromCsvDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.addDataToExistingTable(payload, prisma);
    });
  }

  @Put('/update_tables')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.UPDATE)
  async updateMultipleTable(
    @Body(new ZodValidationPipe(UpdateMultipleTableSchema))
    updateMultipleTablePayload: UpdateMultipleTableDTO,
  ) {
    try {
      return await this.prisma.prismaClient.$transaction(async (prisma) => {
        return await this.tableService.updateMultipleTables(
          updateMultipleTablePayload,
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

  @Post('add_csv_data_to_new_table')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async addCsvDataToNewTable(
    @Body(new ZodValidationPipe(AddDataToNewTableFromCsvSchema))
    payload: AddDataToNewTableFromCsvDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.addCsvDataToNewTable(payload, prisma);
    });
  }

  @Post('/create_duplicate_table')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createDuplicateTable(payload: any) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.createDuplicateTable(payload, prisma);
    });
  }

  @Post('v1/set_is_streaming')
  async setDataStream(
    @Body(new ZodValidationPipe(SetIsStreamingSchema))
    payload: SetIsStreamingDTO,
  ) {
    // Transaction runs first
    const result = await this.prisma.prismaClient.$transaction(
      async (prisma) => {
        return await this.tableService.setIsStreaming(payload, prisma);
      },
    );

    // Only enqueue jobs AFTER transaction successfully commits
    // If transaction fails, this code won't execute (correct behavior)
    if (result.dataStreamsToEnqueue && result.dataStreamsToEnqueue.length > 0) {
      for (const { dataStreamId, tableId } of result.dataStreamsToEnqueue) {
        await this.tableService.enqueueCreateScheduledTriggersJob(
          dataStreamId,
          tableId,
        );
      }
    }

    // Return only the updated_count (don't expose dataStreamsToEnqueue in response)
    return {
      updated_count: result.updated_count,
    };
  }

  @Post('icp/build')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async buildIcp(
    @Body(new ZodValidationPipe(IcpBuildSchema))
    payload: IcpBuildDTO,
  ) {
    try {
      return await this.tableService.buildIcp(payload);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message || 'An error occurred');
      }
      throw new BadRequestException('An error occurred');
    }
  }

  @Post('prospect/run')
  async runProspect(
    @Query('sync') sync: string,
    @Body(new ZodValidationPipe(ProspectRunSchema))
    payload: ProspectRunDTO,
  ) {
    try {
      const isSync = sync === 'true';
      return await this.tableService.runProspect(payload, isSync);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message || 'An error occurred');
      }
      throw new BadRequestException('An error occurred');
    }
  }

  @Post('icp-prospect/process')
  async processIcpProspectData(
    @Body(new ZodValidationPipe(IcpProspectDataSchema))
    payload: IcpProspectDataDTO,
  ) {
    try {
      return await this.tableService.processIcpProspectData(payload);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message || 'An error occurred');
      }
      throw new BadRequestException('An error occurred');
    }
  }

  // Add this method to the TableController class
  @Post('v1/webhook/prospect-data')
  async receiveProspectData(
    @Body(new ZodValidationPipe(WebhookProspectDataSchema))
    payload: WebhookProspectDataDTO,
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.processWebhookProspectData(
        payload,
        prisma,
      );
    });
  }

  @Post('create-ai-enrichment-table')
  @UseGuards(RolePermissionGuard)
  @RolePermission(OperationType.CREATE)
  async createAiEnrichmentTable(
    @Body()
    payload: {
      table_name: string;
      baseId: string;
      user_id: string;
      fields_payload: any[];
    },
  ) {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.createAiEnrichmentTable(payload, prisma);
    });
  }

  @Post('backfill_history_tables')
  async backfillHistoryTables() {
    return await this.prisma.prismaClient.$transaction(async (prisma) => {
      return await this.tableService.backfillHistoryTables(prisma);
    });
  }
}
