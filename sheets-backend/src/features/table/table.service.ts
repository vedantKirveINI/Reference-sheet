import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, TableMeta, TriggerSchedule } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import {
  ComputedConfig,
  ComputedConfigManager,
} from './utils/computed-config-manager';

import { UpdateMultipleTableDTO, UpdateTableDTO } from './DTO/update-table.dto';
import { GetTablePayloadDTO } from './DTO/get-table.dto';
import { GetTableSchemaPayloadDTO } from './DTO/get-table-schema.dto';
import { UpdateDataStreamsDTO } from './DTO/update-data-stream.dto';
import { GetDataStreamDTO } from './DTO/get-data-stream.dto';
import { CreateDataStreamsDTO } from './DTO/create-data-stream.dto';
import { Readable } from 'stream';
import Papa from 'papaparse';
import { AddDataFromCsvDTO } from './DTO/add-data-from-csv.dto';
import { LoDashStatic } from 'lodash';
import { AddDataToNewTableFromCsvDTO } from './DTO/add-data-to-new-table-from-csv.dto';
import { UpsertDataStreamDTO } from './DTO/upsert-data-stream.dto';
import { SetIsStreamingDTO } from './DTO/set-is-streaming.dto';
import { DisableDataStreamWhereDTO } from './DTO/disable-data-stream.dto';
import { GetTableSummaryDTO } from './DTO/get-table-summary.dto';
import { IcpBuildDTO } from './DTO/icp-build.dto';
import { ProspectRunDTO } from './DTO/prospect-run.dto';
import { IcpProspectDataDTO } from './DTO/common-enrichment.dto';
import { transformProspectData } from './utils/prospect-data-transformer';
import axios from 'axios';
import { WebhookProspectDataDTO } from './DTO/prospect-data.dto';
import pLimit from 'p-limit';

@Injectable()
export class TableService {
  private readonly scheduleLimit: ReturnType<typeof pLimit>;
  private readonly batchLimit: ReturnType<typeof pLimit>;

  constructor(
    private readonly emitter: EventEmitterService,
    @Inject('UtilitySdk') private readonly utility_sdk: any,
    @Inject('Lodash') private readonly lodash: LoDashStatic,
    private readonly computedConfigManager: ComputedConfigManager,
  ) {
    this.scheduleLimit = pLimit(5);
    this.batchLimit = pLimit(10);
    this.registerEvents();
  }

  registerEvents() {
    const events = [
      { name: 'table.getDbName', handler: this.getDbName },
      {
        name: 'table-createTable',
        handler: this.createTable,
      },
      {
        name: 'table.getTable',
        handler: this.getTable,
      },
      {
        name: 'table.getDataStream',
        handler: this.getDataStream,
      },
      {
        name: 'table.updateMultipleTables',
        handler: this.updateMultipleTables,
      },
      {
        name: 'table.createDuplicateTable',
        handler: this.createDuplicateTable,
      },
      {
        name: 'table.getTables',
        handler: this.getTables,
      },
      {
        name: 'table.getTableSummary',
        handler: this.getTableSummary,
      },
      {
        name: 'table.updateFormulaFieldConfig',
        handler: this.updateFormulaFieldConfig,
      },
      {
        name: 'table.getFormulaFieldConfig',
        handler: this.getFormulaFieldConfig,
      },
      {
        name: 'table.removeComputedField',
        handler: this.removeComputedField,
      },
      {
        name: 'table.addEnrichmentDependenciesToConfig',
        handler: this.addEnrichmentDependenciesToConfig,
      },
      {
        name: 'table.runProspect',
        handler: this.runProspect,
      },
      {
        name: 'table.createAiEnrichmentTable',
        handler: this.createAiEnrichmentTable,
      },
      {
        name: 'table.processWebhookProspectData',
        handler: this.processWebhookProspectData,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  async getDbName(
    tableId: string,
    baseId: string,
    prisma: Prisma.TransactionClient,
  ) {
    const tableMeta = await prisma.tableMeta.findFirst({
      where: {
        id: tableId,
        baseId: baseId,
      },
      select: {
        dbTableName: true,
      },
    });

    if (!tableMeta) {
      throw new NotFoundException(
        `Table Not found with given table id ${tableId}`,
      );
    }

    return tableMeta?.dbTableName;
  }

  async createTable(
    createTable: any, // Temporary is set to any
    prisma: Prisma.TransactionClient,
  ) {
    const {
      name = 'Table 1',
      baseId,
      order,
      createdBy,
      source_id,
    } = createTable;

    let final_order = order;

    if (!order) {
      const table_meta = await prisma.tableMeta.findFirst({
        where: { baseId: baseId },
        orderBy: { order: 'desc' },
      });

      final_order = (table_meta?.order || 0) + 1;
    }

    const payload = {
      name,
      baseId,
      order: final_order,
      version: 1,
      createdBy: createdBy,
      source_id,
    };

    //   const new_table_meta = await prisma.tableMeta.findFirst({
    //     where: {
    //       id: '123asdqwe345',
    //     },
    //   });

    let table_meta: any;

    try {
      table_meta = await prisma.tableMeta.create({
        data: payload,
      });
    } catch (error) {
      throw new BadRequestException('Could not create table');
    }

    if (!table_meta) {
      throw new NotFoundException(`Could not create table with name ${name}`);
    }

    const table_name = `${table_meta.id}`; //tableName -> tableMetaId

    const db_table_name = `${baseId}.${table_name}`; //dbTableName -> scehma.tableName
    // have to find how are they createing db_table_name

    // Create table query
    const createTableQuery = `CREATE TABLE IF NOT EXISTS "${baseId}".${table_name} (
    __id SERIAL PRIMARY KEY,
    __status VARCHAR(255) DEFAULT 'active',
    __created_by JSONB,
    __last_updated_by JSONB,
    __created_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    __last_modified_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    __auto_number SERIAL,
    __version INT DEFAULT 0,
    __row_color VARCHAR(20) DEFAULT NULL,
    __cell_colors JSONB DEFAULT NULL
  )
`;

    try {
      await prisma.$queryRawUnsafe(createTableQuery);
    } catch (e) {
      console.log('e-->>', e);
      throw new BadRequestException('Could not create table');
    }

    const updated_table_meta = await prisma.tableMeta.update({
      where: {
        id: table_meta.id,
      },
      data: {
        dbTableName: db_table_name,
      },
    });

    return updated_table_meta;
  }

  async getTables(
    getTablePayload: GetTablePayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      baseId,
      is_field_required = 'false',
      is_view_required = 'false',
      table_ids = [],
      orderByField,
      orderByDirection,
    } = getTablePayload;

    if (!baseId) {
      throw new BadRequestException('Please provide a Base Id');
    }

    try {
      // Build orderBy clause - use custom order if provided, otherwise default
      const orderByClause: Prisma.TableMetaOrderByWithRelationInput =
        orderByField && orderByDirection
          ? { [orderByField]: orderByDirection }
          : { createdTime: 'asc' };

      const tableMeta = await prisma.tableMeta.findMany({
        where: {
          baseId: baseId,
          status: 'active',
          ...(table_ids?.length
            ? {
                id: {
                  in: table_ids,
                },
              }
            : {}),
        },
        include: {
          views: is_view_required === 'true' ? true : false,
          fields:
            is_field_required === 'true'
              ? {
                  where: {
                    status: 'active',
                  },
                }
              : false,
        },
        orderBy: orderByClause,
      });

      return tableMeta;
    } catch (e) {
      throw new BadRequestException(
        `Could not find table with given sheet id ${baseId}`,
      );
    }
  }

  async updateTable(
    updateTablePayload: UpdateTableDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { id, name } = updateTablePayload;

    try {
      const updated_table = await prisma.tableMeta.update({
        where: { id: id },
        data: { name: name },
      });

      return updated_table;
    } catch (error) {
      throw new BadRequestException(
        `Could not Update table with given id ${id}`,
      );
    }
  }

  async getTable(
    getTablePayload: GetTableSchemaPayloadDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      tableId,
      is_field_required = 'false',
      is_view_required = 'false',
      viewId,
    } = getTablePayload;

    try {
      const tableMeta = await prisma.tableMeta.findUniqueOrThrow({
        where: {
          id: tableId,
          status: 'active',
        },
        include: {
          views:
            is_view_required === 'true'
              ? {
                  where: {
                    ...(viewId && { id: viewId }),
                  },
                  orderBy: {
                    createdTime: 'asc',
                  },
                }
              : false,
          fields:
            is_field_required === 'true'
              ? {
                  where: {
                    status: 'active',
                  },
                  orderBy: {
                    createdTime: 'asc',
                  },
                }
              : false,
        },
      });

      return tableMeta;
    } catch (e) {
      throw new BadRequestException(
        `Could not find table with given table id ${tableId}`,
      );
    }
  }

  async createMultipleDataStreams(
    payload: CreateDataStreamsDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const tableIds = [...new Set(payload.map((record) => record.tableId))];
    const tableMetas = await prisma.tableMeta.findMany({
      where: { id: { in: tableIds } },
    });

    if (tableMetas.length !== tableIds.length) {
      throw new Error('One or more TableMetas do not exist');
    }

    const createdDataStreams: any[] = [];

    for (const record of payload) {
      try {
        if (record.triggerType === 'TIME_BASED' && record.triggerConfig) {
          await this.validateTimeBasedTriggerSchedules(
            record.triggerConfig,
            record.tableId,
            prisma,
          );
        }

        const createdDataStream = await prisma.dataStream.create({
          data: {
            tableId: record.tableId,
            isStreaming: record.isStreaming,
            webhookUrl: record.webhookUrl,
            eventType: record.eventType,
            triggerType: record.triggerType,
            linkedAssetId: record.linkedAssetId,
          },
        });

        if (record.triggerType === 'TIME_BASED' && record.triggerConfig) {
          await this.createTriggerSchedules(
            createdDataStream.id,
            record.triggerConfig,
            prisma,
          );

          try {
            await this.backfillTimeBasedTriggers(
              createdDataStream.id,
              record.tableId,
              prisma,
            );
          } catch (error) {
            console.error(
              `[TableService] Error backfilling triggers for DataStream ${createdDataStream.id}: ${error instanceof Error ? error.message : String(error)}`,
              error,
            );
          }
        }

        const dataStreamWithSchedules = await prisma.dataStream.findUnique({
          where: { id: createdDataStream.id },
          include: {
            triggerSchedules: {
              where: { status: 'active' },
            },
          },
        });

        createdDataStreams.push(dataStreamWithSchedules || createdDataStream);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new Error(
          `Could not create data stream with Table id ${record.tableId}`,
        );
      }
    }

    return createdDataStreams;
  }

  async updateMultipleDataStreams(
    payload: UpdateDataStreamsDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const updated_records: any[] = [];

    for (const record of payload) {
      const { where, data } = record;

      if (Object.keys(where).length === 0) {
        throw new Error(
          'At least one of tableId or webhookUrl must be provided in where clause.',
        );
      }

      const matching_records = await prisma.dataStream.findMany({
        where,
        include: {
          triggerSchedules: {
            where: { status: 'active' },
          },
        },
      });

      if (matching_records.length === 0) {
        throw new Error(
          'No matching data stream found for the provided criteria.',
        );
      }

      if (data.triggerType === 'TIME_BASED' && data.triggerConfig) {
        const tableId = matching_records[0].tableId;
        await this.validateTimeBasedTriggerSchedules(
          data.triggerConfig,
          tableId,
          prisma,
        );
      }

      for (const matchingRecord of matching_records) {
        try {
          const { triggerConfig, ...dataWithoutTriggerConfig } = data;

          const updated_record = await prisma.dataStream.update({
            where: { id: matchingRecord.id },
            data: dataWithoutTriggerConfig,
          });

          if (data.triggerType === 'TIME_BASED' && triggerConfig) {
            const existingSchedules = matchingRecord.triggerSchedules || [];
            const { toCreate, toUpdate, toDelete } = this.syncTriggerSchedules(
              existingSchedules,
              triggerConfig,
            );

            if (toDelete.length > 0) {
              await this.deleteTriggerSchedules(
                toDelete.map((d) => d.id),
                prisma,
              );
            }

            for (const update of toUpdate) {
              await prisma.triggerSchedule.update({
                where: { id: update.id },
                data: {
                  fieldId: update.fieldId,
                  type: update.type,
                  offsetMinutes: update.offsetMinutes,
                  name: update.name,
                },
              });
              await prisma.scheduledTrigger.updateMany({
                where: {
                  triggerScheduleId: update.id,
                  status: 'active',
                },
                data: {
                  status: 'inactive',
                  state: 'CANCELLED',
                  deletedTime: new Date(),
                },
              });
              try {
                await this.backfillTimeBasedTriggers(
                  updated_record.id,
                  updated_record.tableId,
                  prisma,
                );
              } catch (error) {
                console.error(
                  `[TableService] Error backfilling triggers for updated schedule ${update.id}: ${error instanceof Error ? error.message : String(error)}`,
                  error,
                );
              }
            }

            if (toCreate.length > 0) {
              await this.createTriggerSchedules(
                updated_record.id,
                toCreate,
                prisma,
              );
              try {
                await this.backfillTimeBasedTriggers(
                  updated_record.id,
                  updated_record.tableId,
                  prisma,
                );
              } catch (error) {
                console.error(
                  `[TableService] Error backfilling triggers for new schedules: ${error instanceof Error ? error.message : String(error)}`,
                  error,
                );
              }
            }
          } else if (
            matchingRecord.triggerType === 'TIME_BASED' &&
            data.triggerType !== 'TIME_BASED'
          ) {
            const existingSchedules = matchingRecord.triggerSchedules || [];
            if (existingSchedules.length > 0) {
              await this.deleteTriggerSchedules(
                existingSchedules.map((s) => s.id),
                prisma,
              );
            }
          }

          const dataStreamWithSchedules = await prisma.dataStream.findUnique({
            where: { id: updated_record.id },
            include: {
              triggerSchedules: {
                where: { status: 'active' },
              },
            },
          });

          updated_records.push(dataStreamWithSchedules || updated_record);
        } catch (e) {
          throw new Error(`Could not update data stream with criteria`);
        }
      }
    }

    return updated_records;
  }

  async getDataStream(
    payload: GetDataStreamDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const where: Record<string, any> = {};

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        where[key] = value;
      }
    });

    try {
      const data_stream = await prisma.dataStream.findMany({
        where,
        include: {
          triggerSchedules: {
            where: { status: 'active' },
          },
        },
      });

      return data_stream;
    } catch (error) {
      throw new BadRequestException(`Could not get data streams`);
    }
  }

  async upsertDataStream(
    payload: UpsertDataStreamDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { where, data } = payload;
    const tableId = where.tableId || data.tableId;

    if (data.triggerType === 'TIME_BASED' && data.triggerConfig) {
      await this.validateTimeBasedTriggerSchedules(
        data.triggerConfig,
        tableId,
        prisma,
      );
    }

    let where_condition: Prisma.DataStreamWhereUniqueInput;

    if ('id' in where) {
      where_condition = { id: where.id };
    } else {
      where_condition = {
        tableId_webhookUrl: {
          tableId: where.tableId,
          webhookUrl: where.webhookUrl,
        },
      };
    }

    try {
      const existingDataStream = await prisma.dataStream.findUnique({
        where: where_condition,
        include: {
          triggerSchedules: {
            where: { status: 'active' },
          },
        },
      });

      const { triggerConfig, ...dataWithoutTriggerConfig } = data;

      const isCreating = !existingDataStream;
      const isNewTimeBased =
        data.triggerType === 'TIME_BASED' &&
        (!existingDataStream ||
          existingDataStream.triggerType !== 'TIME_BASED');

      const upserted = await prisma.dataStream.upsert({
        where: where_condition,
        update: dataWithoutTriggerConfig,
        create: { ...where, ...dataWithoutTriggerConfig },
      });

      // Handle TriggerSchedule CRUD operations
      const wasStreaming = existingDataStream?.isStreaming ?? false;
      const isNowStreaming = upserted.isStreaming ?? false;

      if (data.triggerType === 'TIME_BASED' && triggerConfig) {
        if (isCreating || isNewTimeBased) {
          // Cancel ALL existing scheduled triggers for this dataStream
          await prisma.scheduledTrigger.updateMany({
            where: {
              dataStreamId: upserted.id,
              status: 'active',
            },
            data: {
              status: 'inactive',
              state: 'CANCELLED',
              deletedTime: new Date(),
            },
          });

          await this.createTriggerSchedules(upserted.id, triggerConfig, prisma);

          if (isNowStreaming) {
            await this.enqueueCreateScheduledTriggersJob(
              upserted.id,
              upserted.tableId,
            );
          }
        } else {
          const existingSchedules = existingDataStream.triggerSchedules || [];
          const { toCreate, toUpdate, toDelete } = this.syncTriggerSchedules(
            existingSchedules,
            triggerConfig,
          );

          if (toDelete.length > 0) {
            await this.deleteTriggerSchedules(
              toDelete.map((d) => d.id),
              prisma,
            );
          }

          for (const update of toUpdate) {
            await prisma.triggerSchedule.update({
              where: { id: update.id },
              data: {
                fieldId: update.fieldId,
                type: update.type,
                offsetMinutes: update.offsetMinutes,
              },
            });
            await prisma.scheduledTrigger.updateMany({
              where: {
                triggerScheduleId: update.id,
                status: 'active',
              },
              data: {
                status: 'inactive',
                state: 'CANCELLED',
                deletedTime: new Date(),
              },
            });
          }

          if (toCreate.length > 0) {
            await this.createTriggerSchedules(upserted.id, toCreate, prisma);
          }

          if (isNowStreaming && (toCreate.length > 0 || toUpdate.length > 0)) {
            await this.enqueueCreateScheduledTriggersJob(
              upserted.id,
              upserted.tableId,
            );
          }
        }

        if (!wasStreaming && isNowStreaming) {
          await this.enqueueCreateScheduledTriggersJob(
            upserted.id,
            upserted.tableId,
          );
        }
      } else if (
        existingDataStream &&
        existingDataStream.triggerType === 'TIME_BASED' &&
        data.triggerType !== 'TIME_BASED'
      ) {
        const existingSchedules = existingDataStream.triggerSchedules || [];
        if (existingSchedules.length > 0) {
          await this.deleteTriggerSchedules(
            existingSchedules.map((s) => s.id),
            prisma,
          );
        }
      }

      const dataStreamWithSchedules = await prisma.dataStream.findUnique({
        where: { id: upserted.id },
        include: {
          triggerSchedules: {
            where: { status: 'active' },
          },
        },
      });

      return dataStreamWithSchedules || upserted;
    } catch (e) {
      throw new BadRequestException(`Could not upsert data stream`);
    }
  }

  async enqueueCreateScheduledTriggersJob(
    dataStreamId: string,
    tableId: string,
  ): Promise<void> {
    try {
      //   const jobId = `create-scheduled-triggers-${dataStreamId}`;

      await this.emitter.emitAsync('bullMq.enqueueJob', {
        jobName: 'create_scheduled_triggers',
        data: {
          dataStreamId,
          tableId,
        },
        options: {
          // jobId,
          delay: 2000, // 2 second delay to ensure transaction commits
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 10000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      });
    } catch (error) {
      console.error(
        `[TableService] Error enqueueing create scheduled triggers job for DataStream ${dataStreamId}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
    }
  }

  async cleanupScheduledTriggers(
    dataStreamId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    await prisma.scheduledTrigger.updateMany({
      where: {
        dataStream: { id: dataStreamId },
        status: 'active',
      },
      data: {
        status: 'inactive',
        state: 'CANCELLED',
        deletedTime: new Date(),
      },
    });
  }

  async backfillTimeBasedTriggers(
    dataStreamId: string,
    tableId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    console.log('backfillTimeBasedTriggers-->>', dataStreamId, tableId);

    const triggerSchedules = await prisma.triggerSchedule.findMany({
      where: {
        dataStreamId: dataStreamId,
        status: 'active',
      },
    });

    if (!triggerSchedules || triggerSchedules.length === 0) {
      console.log(
        `[TableService] No active trigger schedules found for DataStream ${dataStreamId}`,
      );
      return;
    }

    const [table] = await this.emitter.emitAsync(
      'table.getTable',
      {
        tableId,
        baseId: '', // Will get from table
        is_view_required: 'false',
      },
      prisma,
    );

    if (!table || !table.dbTableName) {
      console.warn(
        `[TableService] Table ${tableId} not found, skipping trigger backfill`,
      );
      return;
    }

    const { schemaName, tableName } = this.getSchemaAndTableName(
      table.dbTableName,
    );
    const baseIdForTriggers = schemaName || table.baseId;

    const fieldIds = [...new Set(triggerSchedules.map((ts) => ts.fieldId))];
    const [allFields] = await this.emitter.emitAsync(
      'field.getFieldsById',
      { ids: fieldIds },
      prisma,
    );

    if (!allFields || allFields.length === 0) {
      console.warn(
        `[TableService] No fields found for field IDs: ${fieldIds.join(', ')}, skipping trigger backfill`,
      );
      return;
    }

    const fieldMap = new Map<number, any>(allFields.map((f: any) => [f.id, f]));

    await Promise.all(
      triggerSchedules.map((triggerSchedule) =>
        this.scheduleLimit(async () => {
          const field = fieldMap.get(triggerSchedule.fieldId);

          if (!field) {
            console.warn(
              `[TableService] Field ${triggerSchedule.fieldId} not found, skipping trigger backfill for schedule ${triggerSchedule.id}`,
            );
            return;
          }

          await this.processScheduleBackfill(
            triggerSchedule,
            field,
            schemaName,
            tableName,
            baseIdForTriggers,
            tableId,
            dataStreamId, // Pass dataStreamId to processScheduleBackfill
            prisma,
          );
        }),
      ),
    );
  }

  private async processScheduleBackfill(
    triggerSchedule: TriggerSchedule,
    field: any,
    schemaName: string,
    tableName: string,
    baseId: string,
    tableId: string,
    dataStreamId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const fieldId = triggerSchedule.fieldId;
    const batchSize = 500;

    try {
      const countQuery = `
        SELECT COUNT(*) as total
        FROM "${schemaName}".${tableName}
        WHERE __status = 'active'
          AND "${field.dbFieldName}" IS NOT NULL
      `;

      const countResult: Array<{ total: bigint }> =
        await prisma.$queryRawUnsafe(countQuery);
      const totalRecords = Number(countResult[0]?.total || 0);

      if (totalRecords === 0) {
        console.log(
          `[TableService] No records to backfill for schedule ${triggerSchedule.id}`,
        );
        return;
      }

      const totalPages = Math.ceil(totalRecords / batchSize);

      console.log(
        `[TableService] Backfilling triggers for ${totalRecords} records (${totalPages} pages) for schedule ${triggerSchedule.id}`,
      );

      await Promise.all(
        Array.from({ length: totalPages }, (_, pageIndex) =>
          this.batchLimit(async () => {
            const offset = pageIndex * batchSize;

            try {
              const query = `
                SELECT __id
                FROM "${schemaName}".${tableName}
                WHERE __status = 'active'
                  AND "${field.dbFieldName}" IS NOT NULL
                ORDER BY __id
                LIMIT ${batchSize}
                OFFSET ${offset}
              `;

              const records: Array<{ __id: number }> =
                await prisma.$queryRawUnsafe(query);

              if (records.length === 0) {
                return;
              }

              console.log(
                `[TableService] Backfilling triggers for ${records.length} records (page ${pageIndex + 1}/${totalPages}, offset ${offset}) for schedule ${triggerSchedule.id}`,
              );

              const recordIds = records.map((r) => r.__id);

              await this.emitter.emitAsync(
                'timeBasedTrigger.handleTimeBasedTriggers',
                {
                  tableId,
                  baseId: baseId,
                  recordIds,
                  eventType: 'create_record',
                  updatedFieldIds: [fieldId],
                  dataStreamId, // Pass dataStreamId for backfill to filter to specific dataStream
                  triggerScheduleId: triggerSchedule.id, // Pass triggerScheduleId for backfill to filter to specific schedule
                },
                prisma,
              );
            } catch (error) {
              console.error(
                `[TableService] Error processing batch (schedule ${triggerSchedule.id}, page ${pageIndex + 1}, offset ${offset}): ${error instanceof Error ? error.message : String(error)}`,
                error,
              );
            }
          }),
        ),
      );

      console.log(
        `[TableService] Completed backfilling triggers for schedule ${triggerSchedule.id}`,
      );
    } catch (error) {
      console.error(
        `[TableService] Error in processScheduleBackfill for schedule ${triggerSchedule.id}: ${error instanceof Error ? error.message : String(error)}`,
        error,
      );
      throw error;
    }
  }

  private getSchemaAndTableName(dbTableName: string): {
    schemaName: string;
    tableName: string;
  } {
    const parts = dbTableName.split('.');
    if (parts.length === 2) {
      return { schemaName: parts[0], tableName: parts[1] };
    }
    return { schemaName: '', tableName: dbTableName };
  }

  private async validateTimeBasedTriggerSchedules(
    triggerConfigs: Array<{
      fieldId: number;
      type: string;
      offsetMinutes: number;
    }>,
    tableId: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    if (!triggerConfigs || triggerConfigs.length === 0) {
      throw new BadRequestException(
        'triggerConfig array with at least one item is required when triggerType is TIME_BASED',
      );
    }

    const fieldIds = triggerConfigs.map((config) => config.fieldId);
    const uniqueFieldIds = [...new Set(fieldIds)];

    const [fields] = await this.emitter.emitAsync(
      'field.getFieldsById',
      { ids: uniqueFieldIds },
      prisma,
    );

    if (!fields || fields.length === 0) {
      throw new BadRequestException(
        `No fields found for IDs: ${uniqueFieldIds.join(', ')}`,
      );
    }

    const fieldMap = new Map<number, any>(fields.map((f: any) => [f.id, f]));
    const TIMESTAMP_FIELD_TYPES = ['DATE', 'CREATED_TIME'];

    // Validate each config - if any fails, reject all
    for (const config of triggerConfigs) {
      const { fieldId, type, offsetMinutes } = config;

      if (!fieldId) {
        throw new BadRequestException(
          'fieldId is required in all triggerConfig items',
        );
      }

      const field = fieldMap.get(fieldId);

      if (!field) {
        throw new BadRequestException(`Field with ID ${fieldId} not found`);
      }

      if (field.status !== 'active') {
        throw new BadRequestException(`Field ${fieldId} is not active`);
      }

      // Check if field belongs to the table
      if (field.tableMetaId !== tableId) {
        throw new BadRequestException(
          `Field ${fieldId} does not belong to table ${tableId}`,
        );
      }

      // Validate field type is timestamp/datetime
      if (!TIMESTAMP_FIELD_TYPES.includes(field.type)) {
        throw new BadRequestException(
          `Field ${fieldId} must be a timestamp type (DATE, CREATED_TIME, etc.), got ${field.type}`,
        );
      }

      // Validate offsetMinutes for BEFORE/AFTER
      if (type === 'BEFORE' || type === 'AFTER') {
        if (!offsetMinutes || offsetMinutes <= 0) {
          throw new BadRequestException(
            'offsetMinutes must be greater than 0 for BEFORE and AFTER trigger types',
          );
        }
      }
    }
  }

  /**
   * Compare existing TriggerSchedule entries with new config array
   * Returns objects to create, update, and delete
   */
  private syncTriggerSchedules(
    existingSchedules: Array<{
      id: string;
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string | null;
    }>,
    newConfigs: Array<{
      id?: string;
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string;
    }>,
  ): {
    toCreate: Array<{
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string;
    }>;
    toUpdate: Array<{
      id: string;
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string;
    }>;
    toDelete: Array<{ id: string }>;
  } {
    const existingMap = new Map(existingSchedules.map((s) => [s.id, s]));
    const newConfigIds = new Set(
      newConfigs.filter((c) => c.id).map((c) => c.id!),
    );

    const toCreate: Array<{
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string;
    }> = [];
    const toUpdate: Array<{
      id: string;
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string;
    }> = [];
    const toDelete: Array<{ id: string }> = [];

    // Find configs to create (no ID) and to update (has ID and changed)
    for (const config of newConfigs) {
      if (!config.id) {
        // New schedule to create
        toCreate.push({
          fieldId: config.fieldId,
          type: config.type,
          offsetMinutes: config.offsetMinutes,
          name: config.name,
        });
      } else {
        // Check if existing schedule needs update
        const existing = existingMap.get(config.id);
        if (existing) {
          if (
            existing.fieldId !== config.fieldId ||
            existing.type !== config.type ||
            existing.offsetMinutes !== config.offsetMinutes ||
            existing.name !== config.name
          ) {
            toUpdate.push({
              id: config.id,
              fieldId: config.fieldId,
              type: config.type,
              offsetMinutes: config.offsetMinutes,
              name: config.name,
            });
          }
        }
      }
    }

    // Find schedules to delete (existing but not in new array)
    for (const existing of existingSchedules) {
      if (!newConfigIds.has(existing.id)) {
        toDelete.push({ id: existing.id });
      }
    }

    return { toCreate, toUpdate, toDelete };
  }

  /**
   * Create multiple TriggerSchedule entries
   */
  private async createTriggerSchedules(
    dataStreamId: string,
    configs: Array<{
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string;
    }>,
    prisma: Prisma.TransactionClient,
  ): Promise<Array<TriggerSchedule>> {
    const triggerSchedules: TriggerSchedule[] = [];
    for (const config of configs) {
      const triggerSchedule = await prisma.triggerSchedule.create({
        data: {
          dataStreamId: dataStreamId,
          fieldId: config.fieldId,
          type: config.type,
          offsetMinutes: config.offsetMinutes,
          name: config.name,
          status: 'active',
        },
      });
      triggerSchedules.push(triggerSchedule);
    }
    return triggerSchedules;
  }

  /**
   * Soft-delete TriggerSchedule entries and cancel related ScheduledTriggers
   */
  private async deleteTriggerSchedules(
    scheduleIds: string[],
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    if (scheduleIds.length === 0) return;

    // Soft-delete TriggerSchedule entries
    await prisma.triggerSchedule.updateMany({
      where: {
        id: { in: scheduleIds },
        status: 'active',
      },
      data: {
        status: 'inactive',
        deletedTime: new Date(),
      },
    });

    // Cancel all related ScheduledTrigger entries
    await prisma.scheduledTrigger.updateMany({
      where: {
        triggerScheduleId: { in: scheduleIds },
        status: 'active',
      },
      data: {
        status: 'inactive',
        state: 'CANCELLED',
        deletedTime: new Date(),
      },
    });
  }

  async exportDataToCSV(payload: any): Promise<Readable> {
    try {
      const { records: sampleData, fields } = payload;

      if (!sampleData || sampleData.length === 0) {
        throw new Error('No data available to export');
      }

      // Prepare flat object structure for export
      const formattedData = sampleData.map((row) => {
        const formattedRow: Record<string, any> = {};

        fields.forEach(({ name, dbFieldName, type }) => {
          const value = row[dbFieldName];

          // For date fields, strip surrounding quotes to prevent triple quotes in CSV
          // Date values from getRecords() may already contain quotes: '"2025-12-09T06:19:00.000Z"'
          // PapaParse with quotes: true will wrap them again, creating triple quotes
          const isDateField =
            type === 'DATE' ||
            type === 'CREATED_TIME' ||
            type === 'UPDATED_TIME' ||
            type === 'LAST_MODIFIED_TIME';

          if (isDateField) {
            // Strip surrounding quotes from date values
            // const cleanedValue = value.replace(/^["']+|["']+$/g, '');
            formattedRow[name] = value || '';
          } else {
            formattedRow[name] =
              value == null
                ? ''
                : typeof value === 'object'
                  ? JSON.stringify(value)
                  : value;
          }
        });

        return formattedRow;
      });

      console.log('formattedData-->>', formattedData);

      const csv = Papa.unparse(formattedData, {
        quotes: true, // always wrap fields in quotes to handle special chars
      });

      return Readable.from([csv]);
    } catch (error) {
      console.error('Error generating CSV:', error);
      throw new Error('Failed to generate CSV data.');
    }
  }

  async addDataToExistingTable(
    payload: AddDataFromCsvDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const {
      columns_info = [],
      tableId,
      baseId,
      is_first_row_header,
      viewId,
    } = payload;

    const [view] = await this.emitter.emitAsync(
      'view.getViewById',
      viewId,
      prisma,
    );

    const fields_array = await this.emitter.emitAsync(
      'field.getFields',
      tableId,
      prisma,
    );

    const fields = fields_array[0];
    const fields_count: number = fields.length;
    let column_name_count = fields_count + 1;

    const create_new_fields_payload = columns_info
      .map((column, index) => {
        if (!column.dbFieldName && column.type) {
          const payload = {
            name: column.name || `Column ${column_name_count++}`,
            type: column.type,
            index,
            ...(column.meta
              ? { width: column.meta.width, text_wrap: column.meta.text_wrap }
              : {}),
          };
          return payload;
        }
        return null;
      })
      .filter(Boolean);

    if (create_new_fields_payload.length > 0) {
      const create_multiple_fields_payload = {
        tableId,
        baseId,
        viewId: view.id,
        fields_payload: create_new_fields_payload,
      };

      const created_fields_array = await this.emitter.emitAsync(
        'field.createMultipleFields',
        create_multiple_fields_payload,
        prisma,
      );

      created_fields_array[0].forEach((new_field, i: number) => {
        const fieldPayload = create_new_fields_payload[i];
        if (fieldPayload) {
          const index = fieldPayload.index;
          columns_info[index].dbFieldName = new_field.dbFieldName;
        }
      });
    }

    console.time('start');
    const csv_data = await this.getFileData(payload);
    console.timeEnd('start');

    const startIndex = is_first_row_header ? 1 : 0;

    const records = csv_data.slice(startIndex).map((row) => {
      const record_to_be_inserted: any = {};
      columns_info.forEach((column, j) => {
        if (column.dbFieldName) {
          const value =
            column.prev_index !== undefined ? row[column.prev_index] : row[j];
          record_to_be_inserted[column.dbFieldName] = value;
        }
      });
      return record_to_be_inserted;
    });

    if (records.length === 0) {
      console.log('No records to insert.');
      return [];
    }

    const columns_name = Object.keys(records[0]);

    const create_records_payload = {
      columns: columns_name,
      tableId,
      baseId,
      viewId: view.id,
      records,
    };

    const records_inserted = await this.emitter.emitAsync(
      'record.createMultipleRecords',
      create_records_payload,
      prisma,
    );

    const get_records_payload = {
      tableId,
      baseId,
      viewId: view.id,
      should_stringify: true,
    };

    const get_records_array = await this.emitter.emitAsync(
      'getRecords',
      get_records_payload,
      prisma,
    );

    await this.emitter.emitAsync(
      'emit_get_records',
      get_records_array[0],
      tableId,
    );

    return records_inserted[0];
  }

  async getFileData(payload: any) {
    const { url } = payload;

    const options = {
      method: 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
      response_type: 'stream',
    };

    try {
      const response = await this.utility_sdk.executeAPI(options);

      const results: any[] = [];

      // Collect the raw CSV data as a string
      const rawData = await new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        response.result.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.result.on('end', () =>
          resolve(Buffer.concat(chunks).toString()),
        );
        response.result.on('error', reject);
      });

      // Parse CSV data using PapaParse
      Papa.parse(rawData, {
        quoteChar: '"', // Character used to quote fields
        escapeChar: '"', // Escape character for quotes
        skipEmptyLines: true, // Skip empty lines
        header: false, // Treat all rows as data
        dynamicTyping: false, // Do not auto-typecast fields
        complete: (parsed) => {
          parsed.data.forEach((row: any) => {
            results.push(row);
          });
        },
        error: (error) => {
          console.error('Error parsing CSV data:', error);
          throw new BadRequestException('Error parsing CSV data');
        },
      });

      return results;
    } catch (e) {
      throw new BadRequestException(
        'Could not get data from the specified URL',
      );
    }
  }

  async updateMultipleTables(
    updateMultipleTablePayload: UpdateMultipleTableDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { whereObj, ...rest } = updateMultipleTablePayload;

    if (this.lodash.isEmpty(rest) || this.lodash.isEmpty(whereObj)) {
      throw new Error('Atleast provide one where clause');
    }
    const data = rest;

    const where_clause = {};

    Object.keys(whereObj).map((key) => {
      where_clause[key] = { in: whereObj[key] };
    });

    let tables: any;

    try {
      tables = await prisma.tableMeta.findMany({
        where: {
          ...where_clause,
        },
      });
    } catch (error) {
      throw new Error('Could not find Table');
    }

    if (tables.length === 0) {
      throw new Error('No Table Found');
    }

    const table_ids = tables.map((table) => table.id);

    try {
      await prisma.tableMeta.updateMany({
        where: {
          id: {
            in: table_ids,
          },
        },
        data: data,
      });
    } catch (error: any) {
      throw new Error('Could update Table');
    }

    let updated_tables: any;

    try {
      updated_tables = await prisma.tableMeta.findMany({
        where: {
          id: {
            in: table_ids,
          },
        },
      });
    } catch (error: any) {
      throw new Error('Could not find tables');
    }

    try {
      for (const table of updated_tables) {
        const payload = {
          tableId: table.id,
          baseId: table.baseId,
          status: 'inactive',
        };

        await this.emitter.emitAsync(
          'field.updateFieldsStatus',
          payload,
          prisma,
        );
      }
    } catch (error: any) {
      if (error instanceof Error) {
        throw new Error(error.message || 'An error occurred');
      }
      throw new Error('Could not update fields');
    }

    return updated_tables;
  }

  async addCsvDataToNewTable(
    payload: AddDataToNewTableFromCsvDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { table_name, baseId, user_id } = payload;

    // create a new table here
    const create_table_payload = {
      name: table_name,
      baseId,
      createdBy: user_id,
    };

    const created_table = await this.createTable(create_table_payload, prisma);
    // create a new view here

    const create_view_payload = {
      baseId: baseId,
      table_id: created_table.id,
      createdBy: user_id,
    };

    const view_array = await this.emitter.emitAsync(
      'view.createView',
      create_view_payload,
      prisma,
    );

    const view = view_array[0];

    // add data to the exisiting table then
    const add_csv_data_to_existing_table = {
      ...payload,
      tableId: created_table.id,
      viewId: view.id,
    };

    await this.addDataToExistingTable(add_csv_data_to_existing_table, prisma);

    return {
      table: created_table,
      view: view,
    };
  }

  async createDuplicateTable(payload: any, prisma: Prisma.TransactionClient) {
    const { baseId, tableId } = payload;

    let table;
    try {
      table = await prisma.tableMeta.findUnique({
        where: {
          id: tableId,
          status: 'active',
        },
      });
    } catch (e) {
      throw new BadRequestException('Could not find Table');
    }

    const new_table_payload = {
      name: `${table.name} (Copy)`,
      baseId: baseId,
      order: 1,
      createdBy: table.createdBy,
      source_id: table.id,
    };

    const new_table = await this.createTable(new_table_payload, prisma);

    // crreate duplicate fields
    const create_duplicate_fields_payload = {
      baseId,
      old_table_id: new_table.source_id,
      new_table_id: new_table.id,
    };

    const [new_fields] = await this.emitter.emitAsync(
      'field.createDuplicateFields',
      create_duplicate_fields_payload,
      prisma,
    );

    const [old_views] = await this.emitter.emitAsync(
      'view.getViews',
      {
        tableId: tableId,
      },
      prisma,
    );

    const new_views: any[] = [];

    //   create duplicate views
    for (const old_view of old_views) {
      const create_new_view_payload = {
        viewId: old_view.id,
        tableId: new_table.id,
        baseId: baseId,
      };

      const [new_view] = await this.emitter.emitAsync(
        'view.createDuplicateView',
        create_new_view_payload,
        prisma,
      );

      new_views.push(new_view);
    }

    //duplicate the records

    const duplicate_records_payload = {
      new_base_id: baseId,
      old_base_id: table.baseId,
      new_table_id: new_table.id,
      old_table_id: table.id,
    };

    await this.emitter.emitAsync(
      'record.createDuplicateRecords',
      duplicate_records_payload,
      prisma,
    );

    const response = {
      ...new_table,
      fields: new_fields,
      views: new_views,
    };

    return response;
  }

  async setIsStreaming(
    payload: SetIsStreamingDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { data, where } = payload;

    const where_clause: Record<string, any> = {};

    if (where?.linkedAssetId) {
      where_clause.linkedAssetId = where.linkedAssetId;
    }
    if (where?.tableId) {
      where_clause.tableId = where.tableId;
    }
    if (where?.webhookUrl) {
      where_clause.webhookUrl = where.webhookUrl;
    }
    if (where?.id) {
      where_clause.id = where.id;
    }

    if (this.lodash.isEmpty(where_clause)) {
      throw new BadRequestException('Where clause is required');
    }

    if (
      (data.isStreaming === true || data.isStreaming === false) &&
      where_clause.linkedAssetId
    ) {
      const disable_data_streams_payload: DisableDataStreamWhereDTO = {
        linkedAssetId: where_clause.linkedAssetId,
      };

      await this.disableDataStream(disable_data_streams_payload, prisma);
    }

    try {
      const dataStreamsBeforeUpdate = await prisma.dataStream.findMany({
        where: where_clause,
        select: {
          id: true,
          tableId: true,
          triggerType: true,
          isStreaming: true,
        },
      });

      const updated = await prisma.dataStream.updateMany({
        where: where_clause,
        data: {
          isStreaming: data.isStreaming,
        },
      });

      // Collect dataStreams that need job enqueueing (instead of enqueueing inside transaction)
      const dataStreamsToEnqueue: Array<{
        dataStreamId: string;
        tableId: string;
      }> = [];

      if (data.isStreaming === true) {
        for (const dataStream of dataStreamsBeforeUpdate) {
          if (
            dataStream.triggerType === 'TIME_BASED' &&
            !dataStream.isStreaming
          ) {
            dataStreamsToEnqueue.push({
              dataStreamId: dataStream.id,
              tableId: dataStream.tableId,
            });
          }
        }
      }

      return {
        updated_count: updated.count,
        dataStreamsToEnqueue, // Return for controller to enqueue after transaction
      };
    } catch (e) {
      throw new BadRequestException('Could not update data stream');
    }
  }

  async disableDataStream(
    payload: DisableDataStreamWhereDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { linkedAssetId } = payload || {};

    if (!linkedAssetId) {
      throw new BadRequestException('linkedAssetId is required');
    }

    const where_clause: Record<string, any> = {};

    if (linkedAssetId) {
      where_clause.linkedAssetId = linkedAssetId;
    }

    try {
      const result = await prisma.dataStream.updateMany({
        where: where_clause,
        data: { isStreaming: false },
      });

      return {
        updated_count: result.count,
      };
    } catch (e) {
      throw new BadRequestException('Could not update data stream');
    }
  }

  async getTableSummary(
    payload: GetTableSummaryDTO,
    prisma: Prisma.TransactionClient,
    _token?: string,
    _skipAuth?: boolean,
  ) {
    void _token;
    void _skipAuth;
    const {
      table_ids,
      baseId,
      is_fields_count_required = true,
      is_records_count_required = true,
    } = payload;

    const tables = await this.getTables(
      {
        baseId,
        table_ids,
        is_field_required: `${is_fields_count_required}`,
        is_view_required: `false`,
      },
      prisma,
    );

    const table_summary: any[] = [];

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const tableId = table.id;

      let final_records_count;

      if (is_records_count_required) {
        const [response] = await this.emitter.emitAsync(
          'record.getRecordSummary',
          { tableId, baseId },
          prisma,
        );

        const { recordsCount } = response;

        final_records_count =
          typeof recordsCount === 'bigint'
            ? Number(recordsCount)
            : Number.parseInt(recordsCount); // fallback in case it's a string
      }

      table_summary.push({
        id: table.id,
        name: table.name,
        recordsCount: final_records_count,
        fieldsCount: is_fields_count_required ? table.fields.length : undefined,
      });
    }

    return table_summary;
  }

  /**
   * Example method showing how to update computed field configuration
   * This demonstrates the usage of ComputedConfigManager
   */
  async updateFormulaFieldConfig(
    payload: any,
    prisma: Prisma.TransactionClient,
  ) {
    const { tableId, columnName, dependencies } = payload;
    try {
      const updatedConfig =
        await this.computedConfigManager.updateComputedConfig({
          tableId,
          columnName,
          dependencies,
          prisma,
        });

      console.log('updatedConfig', updatedConfig);

      return {
        success: true,
        message: 'Formula field configuration updated successfully',
        config: updatedConfig,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to update formula field configuration: ${error.message}`,
      );
    }
  }

  /**
   * Example method showing how to get computed field configuration
   */
  async getFormulaFieldConfig(
    tableId: string,
    prisma: Prisma.TransactionClient,
  ) {
    try {
      const config = await this.computedConfigManager.getComputedConfig(
        tableId,
        prisma,
      );

      return config;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to get formula field configuration: ${error.message}`,
      );
    }
  }

  /**
   * Method to remove a computed field from the configuration
   */
  async removeComputedField(payload: any, prisma: Prisma.TransactionClient) {
    const { tableId, columnName } = payload;
    try {
      const updatedConfig =
        await this.computedConfigManager.removeComputedField(
          tableId,
          columnName,
          prisma,
        );

      return updatedConfig;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to remove formula field from configuration: ${error.message}`,
      );
    }
  }

  async addEnrichmentDependenciesToConfig(
    tableId: string,
    identifierFields: { dbFieldName: string }[],
    selectedFields: { dbFieldName: string }[],
    enrichedField: { dbFieldName: string },
    prisma: Prisma.TransactionClient,
  ): Promise<TableMeta> {
    console.log('identifierFields-->>', identifierFields);
    console.log('selectedFields-->>', selectedFields);
    console.log('enrichedField-->>', enrichedField);

    // 1. Build the enrichment dependency graph
    const enrichmentGraph =
      this.computedConfigManager.buildEnrichmentDependencyGraph(
        identifierFields,
        selectedFields,
        enrichedField,
      );

    console.log('enrichmentGraph-->>', enrichmentGraph);

    // 2. Get current computedConfig
    const tableMeta = await prisma.tableMeta.findUnique({
      where: { id: tableId },
      select: { computedConfig: true },
    });

    if (!tableMeta) {
      throw new BadRequestException(`Table with id ${tableId} not found`);
    }

    // 3. Parse current config or initialize empty
    const currentConfig = this.computedConfigManager.parseComputedConfig(
      tableMeta.computedConfig,
    );

    // 4. Merge the new enrichment graph into the existing dependency graph
    const mergedDependencyGraph = {
      ...(currentConfig.dependencyGraph as any),
      ...enrichmentGraph,
    };

    console.log('mergedDependencyGraph-->>', mergedDependencyGraph);

    // 5. Perform topological sort to get execution order
    const executionOrder = this.computedConfigManager.performTopologicalSort(
      mergedDependencyGraph,
    );

    // 6. Check for circular dependencies
    if (executionOrder.length !== Object.keys(mergedDependencyGraph).length) {
      throw new BadRequestException(
        'Circular dependency detected in formula/enrichment fields',
      );
    }

    // 7. Create updated config
    const updatedConfig: ComputedConfig = {
      dependencyGraph: mergedDependencyGraph,
      executionOrder,
    };

    try {
      // 8. Update the database
      const updatedTableMeta = await prisma.tableMeta.update({
        where: { id: tableId },
        data: { computedConfig: updatedConfig as any },
      });

      return updatedTableMeta;
    } catch (e) {
      throw new BadRequestException(
        `Failed to update formula field configuration`,
      );
    }
  }

  /**
   * Build ICP (Ideal Customer Profile) using external service
   */
  async buildIcp(payload: IcpBuildDTO) {
    const { domain, force_refresh = false, ...rest } = payload;

    const icpBuildPayload = {
      domain,
      force_refresh,
      ...rest,
    };

    try {
      const response = await axios.post(
        `${process.env.ENRICHMENT_SERVICE_URL}/api/icp/build`,
        icpBuildPayload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes
        },
      );

      return response.data;
    } catch (error: any) {
      console.error('ICP build error:', error);

      // Extract the API error message
      const apiErrorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to build ICP';

      throw new BadRequestException(apiErrorMessage);
    }
  }

  /**
   * Run prospect using external service
   */
  async runProspect(payload: ProspectRunDTO, isSync: boolean = false) {
    const {
      domain,
      prospecting_target,
      meta,
      webhook_url,
      output,
      override_icp,
      initial_sent_results,
    } = payload;

    // Hardcoded values as requested
    const hardcodedPayload = {
      prospecting_target: prospecting_target,
      mode: 'from_product',
      domain: domain,
      channels: ['linkedin', 'company'],
      output: output || { target_count: 10 },
      search_options: {
        max_runtime_sec: 60,
        concurrency: 3,
      },
      meta,
      ...(webhook_url && { webhook_url }),
      ...(override_icp && {
        override_icp,
      }),
      ...(!isSync && {
        schedule_interval_minutes: 1440,
        initial_sent_results,
      }),
    };

    try {
      const endPoint = `${process.env.ENRICHMENT_SERVICE_URL}/api/prospect/run?sync=${isSync}`;

      const response = await axios.post(endPoint, hardcodedPayload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 2 minutes
      });

      return response.data;
    } catch (error: any) {
      // Extract the API error message
      const apiErrorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to run prospect';

      throw new BadRequestException(apiErrorMessage);
    }
  }

  /**
   * Process ICP and Prospect data using separate input objects
   */
  async processIcpProspectData(payload: IcpProspectDataDTO) {
    const { icp_inputs, prospect_inputs } = payload;

    try {
      // Step 1: Build ICP
      const icpPayload: IcpBuildDTO = {
        ...icp_inputs,
        domain: icp_inputs.domain,
        force_refresh: icp_inputs.force_refresh,
      };

      const icpResult = await this.buildIcp(icpPayload);

      // Step 2: Run Prospect (only if prospect_inputs is provided and has prospecting_target)
      let prospectResult: any = null;
      if (prospect_inputs && prospect_inputs.prospecting_target) {
        const prospectPayload: ProspectRunDTO = {
          domain: prospect_inputs.domain,
          prospecting_target: prospect_inputs.prospecting_target,
        };

        prospectResult = await this.runProspect(
          prospectPayload,
          prospect_inputs.sync,
        );

        // Transform prospect data to extract raw object data
        if (prospectResult && prospectResult?.items) {
          prospectResult.items = transformProspectData(prospectResult.items);
        }
      }

      return {
        data: {
          icp: icpResult,
          prospect: prospectResult,
        },
      };
    } catch (error: any) {
      console.error('ICP and Prospect processing error:', error);

      // Extract the API error message
      const apiErrorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Failed to process ICP and Prospect data';

      throw new BadRequestException(apiErrorMessage);
    }
  }

  // Add this import to the existing imports in table.service.ts (around line 32)

  // Add these methods to the TableService class (before the closing brace at line 1350)

  /**
   * Process webhook prospect data and transform it for database insertion
   */
  async processWebhookProspectData(
    payload: WebhookProspectDataDTO,
    prisma: Prisma.TransactionClient,
  ) {
    const { items, meta } = payload;
    const { tableId, baseId, viewId } = meta;

    try {
      // Get existing fields to understand the mapping
      const [fields] = await this.emitter.emitAsync(
        'field.getFields',
        tableId,
        prisma,
      );

      // Create field mapping based on fieldIds or auto-detect
      const fieldMapping = this.createFieldMapping(fields);

      console.log('fieldMapping-->>', fieldMapping);

      // Transform prospect items to database records
      const transformedRecords = items.map((item) => {
        const record: any = {};

        Object.entries(fieldMapping).forEach(([fieldName, mapping]) => {
          const { sourceField, fieldType } = mapping;

          if (item[sourceField] !== undefined) {
            // Transform the value based on field type
            record[fieldName] = this.transformValueForField(
              item[sourceField],
              fieldType,
            );
          }
        });

        return record;
      });

      // Prepare payload for createMultipleRecords
      const createRecordsPayload = {
        columns: Object.keys(transformedRecords[0] || {}),
        tableId,
        baseId,
        viewId,
        records: transformedRecords,
      };

      // Insert records
      const recordsInserted = await this.emitter.emitAsync(
        'record.createMultipleRecords',
        createRecordsPayload,
        prisma,
      );

      // Emit updated records
      const getRecordsPayload = {
        tableId,
        baseId,
        viewId,
        should_stringify: true,
      };

      const getRecordsArray = await this.emitter.emitAsync(
        'getRecords',
        getRecordsPayload,
        prisma,
      );

      await this.emitter.emitAsync(
        'emit_get_records',
        getRecordsArray[0],
        tableId,
      );

      return {
        recordsProcessed: transformedRecords.length,
        data: recordsInserted[0],
      };
    } catch (error) {
      console.error('Webhook prospect data processing error:', error);
      throw new BadRequestException(
        `Failed to process prospect data: ${error}`,
      );
    }
  }

  /**
   * Create field mapping between prospect data and database fields
   */
  private createFieldMapping(fields: any[]) {
    const mapping: Record<string, any> = {};

    fields.forEach((field) => {
      const options = field.options as any;

      if (options?.reference) {
        // Map based on reference field in options
        const sourceField = options.reference;
        mapping[field.dbFieldName] = {
          sourceField,
          fieldId: field.id,
          fieldType: field.type,
        };
      }
    });

    return mapping;
  }

  /**
   * Transform value based on field type
   */
  private transformValueForField(value: any, fieldType: string): any {
    if (value === null || value === undefined) {
      return null;
    }

    switch (fieldType.toLowerCase()) {
      case 'number':
      case 'integer':
        return Number(value);
      case 'boolean':
        return Boolean(value);
      case 'date':
      case 'datetime':
        return new Date(value);
      case 'json':
        return typeof value === 'string' ? JSON.parse(value) : value;
      default:
        return String(value);
    }
  }

  /**
   * Create AI enrichment table with associated view and fields
   */
  async createAiEnrichmentTable(
    payload: {
      table_name: string;
      baseId: string;
      user_id: string;
      fields_payload: any[];
    },
    prisma: Prisma.TransactionClient,
  ) {
    const { table_name, baseId, user_id, fields_payload } = payload;

    // Create table for AI enrichment
    const create_table_payload = {
      name: table_name,
      baseId: baseId,
      version: 1,
      createdBy: user_id,
    };

    const tableMeta = await this.createTable(create_table_payload, prisma);

    if (!tableMeta) {
      throw new BadRequestException('Could not create Table');
    }

    // Create view for AI enrichment
    const create_view_payload = {
      baseId: baseId,
      table_id: tableMeta.id,
      version: 1,
      columnMeta: '{}',
      order: 1,
      createdBy: user_id,
    };

    const [view] = await this.emitter.emitAsync(
      'view.createView',
      create_view_payload,
      prisma,
    );

    // Create multiple fields from frontend payload
    const create_multiple_fields_payload = {
      viewId: view.id,
      tableId: tableMeta.id,
      baseId: baseId,
      fields_payload: fields_payload,
    };

    const [fields] = await this.emitter.emitAsync(
      'field.createMultipleFields',
      create_multiple_fields_payload,
      prisma,
    );

    // Get updated view
    const [updated_view] = await this.emitter.emitAsync(
      'view.getViewById',
      view.id,
      prisma,
    );

    return {
      table: tableMeta,
      view: updated_view,
      fields: fields,
    };
  }
}
