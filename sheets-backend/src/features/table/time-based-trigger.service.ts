import { Injectable } from '@nestjs/common';
import { Prisma, ScheduledTrigger } from '@prisma/client';

import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { TriggerConfig } from './DTO/trigger-config.dto';
import { CreateScheduledTriggerDTO } from './DTO/scheduled-trigger.dto';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { Logger } from 'winston';
import { QUESTION_TYPE } from '../field/DTO/mappings.dto';

// Timestamp field types that support time-based triggers
const TIMESTAMP_FIELD_TYPES = [
  QUESTION_TYPE.DATE,
  QUESTION_TYPE.CREATED_TIME,
  // Add other timestamp types as needed
];

@Injectable()
export class TimeBasedTriggerService {
  private readonly logger: Logger;

  constructor(
    private readonly emitter: EventEmitterService,
    private readonly winstonLoggerService: WinstonLoggerService,
  ) {
    this.logger = this.winstonLoggerService.logger;
    this.registerEvents();
  }

  /**
   * Register event handlers for time-based triggers
   */
  private registerEvents(): void {
    const events = [
      {
        name: 'timeBasedTrigger.handleTimeBasedTriggers',
        handler: this.handleTimeBasedTriggers,
      },
      {
        name: 'timeBasedTrigger.cancelScheduledTriggersForRecord',
        handler: this.cancelScheduledTriggersForRecord,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  /**
   * Calculate when trigger should fire based on type and offset
   * All times are stored in UTC
   */
  calculateScheduledTime(
    timestampValue: Date,
    triggerConfig: TriggerConfig,
  ): Date {
    if (!timestampValue) {
      throw new Error('Timestamp value is required');
    }

    // Ensure we're working with a Date object
    const baseTime = new Date(timestampValue);

    // For EXACT type, return the timestamp as-is
    if (triggerConfig.type === 'EXACT') {
      return baseTime;
    }

    // Calculate offset in milliseconds
    const offsetMs = triggerConfig.offsetMinutes * 60 * 1000;

    // For BEFORE, subtract offset
    if (triggerConfig.type === 'BEFORE') {
      return new Date(baseTime.getTime() - offsetMs);
    }

    // For AFTER, add offset
    if (triggerConfig.type === 'AFTER') {
      return new Date(baseTime.getTime() + offsetMs);
    }

    return baseTime;
  }

  /**
   * Handle time-based triggers for records
   * Called via event emitter from handleDataStreamAndQueueJob
   */
  async handleTimeBasedTriggers(
    payload: {
      tableId: string;
      baseId: string;
      recordIds: number[];
      eventType: string;
      updatedFieldIds: number[];
      dataStreamId?: string; // Optional: when provided (backfill), only process this dataStream
      triggerScheduleId?: string; // Optional: when provided (backfill), only process this schedule
    },
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const {
      tableId,
      baseId,
      recordIds,
      eventType,
      updatedFieldIds,
      dataStreamId,
      triggerScheduleId,
    } = payload;
    try {
      // Handle delete_record: Cancel all PENDING triggers for deleted records
      if (eventType === 'delete_record') {
        for (const recordId of recordIds) {
          if (!recordId) continue;

          // Cancel all PENDING triggers for this deleted record
          await prisma.scheduledTrigger.updateMany({
            where: {
              dataStream: { tableId },
              recordId: recordId,
              status: 'active',
              state: 'PENDING',
            },
            data: {
              status: 'inactive',
              state: 'CANCELLED',
              deletedTime: new Date(),
            },
          });
        }
        return; // Exit early for delete operations
      }

      // Get TIME_BASED DataStreams for this table
      // If dataStreamId is provided (backfill case), only get that specific dataStream
      // If not provided (real-time case), get all dataStreams for the table
      const dataStreams = await prisma.dataStream.findMany({
        where: {
          tableId,
          triggerType: 'TIME_BASED',
          ...(dataStreamId && { id: dataStreamId }), // Filter by dataStreamId if provided
        },
      });

      if (!dataStreams || dataStreams.length === 0) {
        return;
      }

      const dataStreamIds = dataStreams.map((ds) => ds.id);
      const allTriggerSchedules = await prisma.triggerSchedule.findMany({
        where: {
          dataStreamId: { in: dataStreamIds },
          status: 'active',
          ...(triggerScheduleId && { id: triggerScheduleId }),
        },
      });

      const schedulesByDataStream = new Map<
        string,
        typeof allTriggerSchedules
      >();
      allTriggerSchedules.forEach((schedule) => {
        const existing = schedulesByDataStream.get(schedule.dataStreamId) || [];
        existing.push(schedule);
        schedulesByDataStream.set(schedule.dataStreamId, existing);
      });

      const result = await this.emitter.emitAsync(
        'table.getDbName',
        tableId,
        baseId,
        prisma,
      );
      const dbTableName = result?.[0];

      if (!dbTableName) {
        return;
      }

      for (const recordId of recordIds) {
        if (!recordId) {
          continue;
        }

        for (const dataStream of dataStreams) {
          const triggerSchedules = schedulesByDataStream.get(dataStream.id);

          if (!triggerSchedules || triggerSchedules.length === 0) {
            continue;
          }

          for (const triggerSchedule of triggerSchedules) {
            const fieldId = triggerSchedule.fieldId;

            const shouldProcess =
              eventType === 'create_record'
                ? updatedFieldIds.length === 0 ||
                  updatedFieldIds.includes(fieldId)
                : updatedFieldIds.includes(fieldId);

            if (!shouldProcess) {
              continue;
            }

            await this.processTriggerForRecord(
              dataStream.id,
              triggerSchedule.id,
              triggerSchedule,
              tableId,
              baseId,
              recordId,
              dbTableName,
              prisma,
            );
          }
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error handling time-based triggers: ${errorMessage}`,
        error,
      );
    }
  }

  private async fetchTimestampFieldValue(
    dbTableName: string,
    recordId: number,
    dbFieldName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<any> {
    try {
      const parts = dbTableName.split('.');
      const schemaName = parts.length > 1 ? parts[0] : '';
      const tableName = parts.length > 1 ? parts[1] : parts[0];

      const query = schemaName
        ? `SELECT "${dbFieldName}" FROM "${schemaName}"."${tableName}" WHERE __id = ${recordId} AND __status = 'active' LIMIT 1`
        : `SELECT "${dbFieldName}" FROM "${tableName}" WHERE __id = ${recordId} AND __status = 'active' LIMIT 1`;

      const result = await prisma.$queryRawUnsafe(query);
      const row = Array.isArray(result) && result.length > 0 ? result[0] : null;

      return row ? row[dbFieldName] : null;
    } catch (error) {
      return null;
    }
  }

  private async processTriggerForRecord(
    dataStreamId: string,
    triggerScheduleId: string,
    triggerSchedule: {
      fieldId: number;
      type: string;
      offsetMinutes: number;
      name: string | null;
    },
    tableId: string,
    baseId: string,
    recordId: number,
    dbTableName: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const [fields] = await this.emitter.emitAsync(
        'field.getFieldsById',
        { ids: [triggerSchedule.fieldId] },
        prisma,
      );

      if (!fields || fields.length === 0) {
        return;
      }

      const field = fields[0];

      if (!TIMESTAMP_FIELD_TYPES.includes(field.type as QUESTION_TYPE)) {
        return;
      }

      const timestampValue = await this.fetchTimestampFieldValue(
        dbTableName,
        recordId,
        field.dbFieldName,
        prisma,
      );

      if (!timestampValue) {
        return;
      }

      const timestampDate =
        timestampValue instanceof Date
          ? timestampValue
          : new Date(timestampValue);

      if (isNaN(timestampDate.getTime())) {
        return;
      }

      const triggerConfig: TriggerConfig = {
        type: triggerSchedule.type as 'BEFORE' | 'EXACT' | 'AFTER',
        offsetMinutes: triggerSchedule.offsetMinutes,
        fieldId: triggerSchedule.fieldId,
        name: triggerSchedule.name ?? '',
      };
      const scheduledTime = this.calculateScheduledTime(
        timestampDate,
        triggerConfig,
      );

      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      if (scheduledTime < oneMinuteAgo) {
        return;
      }

      await prisma.scheduledTrigger.updateMany({
        where: {
          triggerScheduleId: triggerScheduleId,
          recordId: recordId,
          status: 'active',
        },
        data: {
          status: 'inactive',
          state: 'CANCELLED',
          deletedTime: new Date(),
        },
      });

      const createTriggerDTO: CreateScheduledTriggerDTO = {
        dataStreamId,
        triggerScheduleId,
        recordId,
        tableId,
        originalFieldId: field.id,
        scheduledTime,
        originalTime: timestampDate,
        maxRetries: 3,
      };

      await this.createScheduledTrigger(createTriggerDTO, prisma);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error processing trigger for record ${recordId}: ${errorMessage}`,
        error,
      );
    }
  }

  private async createScheduledTrigger(
    dto: CreateScheduledTriggerDTO,
    prisma: Prisma.TransactionClient,
  ): Promise<ScheduledTrigger> {
    return await prisma.scheduledTrigger.create({
      data: {
        dataStreamId: dto.dataStreamId,
        triggerScheduleId: dto.triggerScheduleId,
        recordId: dto.recordId,
        tableId: dto.tableId,
        originalFieldId: dto.originalFieldId,
        trigger_time: dto.scheduledTime,
        scheduledTime: dto.scheduledTime,
        originalTime: dto.originalTime,
        maxRetries: dto.maxRetries,
        state: 'PENDING',
        status: 'active',
      },
    });
  }

  /**
   * Cancel all scheduled triggers for a record (soft delete)
   * Only cancels PENDING triggers - PROCESSING triggers are handled by the processor
   * Called via event emitter
   */
  async cancelScheduledTriggersForRecord(
    payload: { tableId: string; recordId: number },
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const { tableId, recordId } = payload;
    try {
      // Only cancel PENDING triggers - if a trigger is PROCESSING, it's already being handled
      await prisma.scheduledTrigger.updateMany({
        where: {
          dataStream: { tableId },
          recordId: recordId,
          status: 'active',
          state: 'PENDING',
        },
        data: {
          status: 'inactive',
          state: 'CANCELLED',
          deletedTime: new Date(),
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error cancelling triggers for record ${recordId}: ${errorMessage}`,
        error,
      );
    }
  }
}
