import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { Logger } from 'winston';
import pLimit from 'p-limit';

interface ValidationResult {
  valid: boolean;
  reason?: string;
  currentTime?: Date;
}

@Injectable()
export class ScheduledTriggerProcessor
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL_MS = 30 * 1000; // 30 seconds
  private readonly BATCH_SIZE = 200;
  private readonly MAX_CONCURRENT_TRIGGERS = 20; // Process 20 triggers concurrently
  private readonly WEBHOOK_TIMEOUT_MS = 30 * 1000; // 30 seconds
  private readonly STUCK_TRIGGER_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly triggerLimit: ReturnType<typeof pLimit>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emitter: EventEmitterService,
    private readonly winstonLoggerService: WinstonLoggerService,
    @Inject('UtilitySdk') private readonly utility_sdk: any,
  ) {
    this.logger = this.winstonLoggerService.logger;
    // Initialize p-limit with concurrency limit
    this.triggerLimit = pLimit(this.MAX_CONCURRENT_TRIGGERS);
  }

  async onModuleInit(): Promise<void> {
    // Reset stuck triggers
    await this.resetStuckTriggers();

    // Start polling
    this.startPolling();

    this.logger.info('ScheduledTriggerProcessor initialized');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.logger.info('ScheduledTriggerProcessor shut down');
  }

  /**
   * Start the polling loop
   */
  private startPolling(): void {
    // Poll immediately, then every 30 seconds
    this.pollAndProcessTriggers().catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in initial poll: ${errorMessage}`, error);
    });

    this.pollingInterval = setInterval(() => {
      this.pollAndProcessTriggers().catch((error) => {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Error in polling loop: ${errorMessage}`, error);
      });
    }, this.POLL_INTERVAL_MS);
  }

  /**
   * Main polling loop - finds and processes ready triggers
   */
  async pollAndProcessTriggers(): Promise<void> {
    try {
      // Process ready triggers (PENDING and scheduled time <= NOW)
      await this.processReadyTriggers();

      // Process retry triggers (FAILED and next_retry_time <= NOW)
      await this.processRetryTriggers();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error in pollAndProcessTriggers: ${errorMessage}`,
        error,
      );
      // Don't throw - allow polling to continue
    }
  }

  /**
   * Process triggers that are ready to fire
   */
  private async processReadyTriggers(): Promise<void> {
    const triggers = await this.prisma.prismaClient.$queryRaw<
      Array<{
        id: string;
        data_stream_id: string;
        record_id: number;
        table_id: string;
        original_field_id: number;
        trigger_schedule_id: string;
        scheduled_time: Date;
        original_time: Date;
        retry_count: number;
        max_retries: number;
        state: string;
        status: string;
      }>
    >`
      SELECT * FROM scheduled_trigger
      WHERE status = 'active'
        AND state = 'PENDING'
        AND scheduled_time <= NOW()
      ORDER BY scheduled_time ASC
      LIMIT ${this.BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    `;

    if (triggers.length === 0) {
      return;
    }

    // Process triggers concurrently with p-limit
    const promises = triggers.map((trigger) =>
      this.triggerLimit(() =>
        this.processTrigger(trigger).catch((error) => {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error processing trigger ${trigger.id}: ${errorMessage}`,
            error,
          );
          // Error is already handled in processTrigger, just log here
          throw error; // Re-throw for Promise.allSettled to track
        }),
      ),
    );

    // Wait for all triggers to complete (success or failure)
    await Promise.allSettled(promises);
  }

  /**
   * Process triggers that need retry
   */
  private async processRetryTriggers(): Promise<void> {
    const triggers = await this.prisma.prismaClient.$queryRaw<
      Array<{
        id: string;
        data_stream_id: string;
        record_id: number;
        table_id: string;
        original_field_id: number;
        trigger_schedule_id: string;
        scheduled_time: Date;
        original_time: Date;
        retry_count: number;
        max_retries: number;
        state: string;
        status: string;
      }>
    >`
      SELECT * FROM scheduled_trigger
      WHERE status = 'active'
        AND state = 'FAILED'
        AND next_retry_time <= NOW()
        AND retry_count < max_retries
      ORDER BY next_retry_time ASC
      LIMIT ${this.BATCH_SIZE}
      FOR UPDATE SKIP LOCKED
    `;

    if (triggers.length === 0) {
      return;
    }

    // Process retry triggers concurrently with p-limit
    const promises = triggers.map((trigger) =>
      this.triggerLimit(() =>
        this.processTrigger(trigger).catch((error) => {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Error processing retry trigger ${trigger.id}: ${errorMessage}`,
            error,
          );
          // Error is already handled in processTrigger, just log here
          throw error; // Re-throw for Promise.allSettled to track
        }),
      ),
    );

    // Wait for all triggers to complete (success or failure)
    await Promise.allSettled(promises);
  }

  /**
   * Process a single trigger
   */
  private async processTrigger(trigger: any): Promise<void> {
    return await this.prisma.prismaClient.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        // Update state to PROCESSING
        await prisma.scheduledTrigger.update({
          where: { id: trigger.id },
          data: {
            state: 'PROCESSING',
            lastModifiedTime: new Date(),
          },
        });

        // Validate trigger
        const validation = await this.validateTrigger(trigger, prisma);

        if (!validation.valid) {
          await this.cancelTrigger(
            trigger.id,
            validation.reason || 'Validation failed',
            prisma,
          );
          return;
        }

        // Execute webhook
        await this.executeWebhook(trigger, prisma);
      },
      {
        isolationLevel: 'ReadCommitted',
      },
    );
  }

  /**
   * Validate that trigger should still fire
   */
  private async validateTrigger(
    trigger: any,
    prisma: Prisma.TransactionClient,
  ): Promise<ValidationResult> {
    try {
      // Get table and views info from DataStream in a single query
      const dataStream = await prisma.dataStream.findUnique({
        where: { id: trigger.data_stream_id },
        include: {
          table: {
            include: {
              views: {
                orderBy: {
                  order: 'asc', // Get first view by order
                },
                take: 1, // Only need the first view
              },
            },
          },
        },
      });

      if (!dataStream) {
        return {
          valid: false,
          reason: 'DATA_STREAM_DELETED',
        };
      }

      const baseId = dataStream.table.baseId;
      const tableId = trigger.table_id;

      // Get first available view from the included data
      if (!dataStream.table.views || dataStream.table.views.length === 0) {
        return {
          valid: false,
          reason: 'NO_VIEWS_FOUND',
        };
      }

      const viewId = dataStream.table.views[0].id;

      // Get record to check if it exists and is active
      const manual_filters = {
        id: Date.now(),
        condition: 'and',
        childs: [
          {
            id: Date.now(),
            key: '__id',
            field: '__id',
            type: 'NUMBER',
            operator: {
              key: '=',
              value: 'is...',
            },
            value: trigger.record_id,
            valueStr: String(trigger.record_id),
          },
        ],
      };

      const get_record_payload = {
        baseId: baseId,
        tableId: tableId,
        viewId: viewId,
        manual_filters: manual_filters,
        __status: 'active',
        version: 2,
      };

      const record_array = await this.emitter.emitAsync(
        'record.getRecordV2',
        get_record_payload,
        prisma,
        '',
        false,
      );

      const record = record_array?.[0]?.record;
      if (!record) {
        return {
          valid: false,
          reason: 'RECORD_DELETED_OR_INACTIVE',
        };
      }

      // Check field exists and is active
      const [fields] = await this.emitter.emitAsync(
        'field.getFieldsById',
        { ids: [trigger.original_field_id] },
        prisma,
      );

      if (!fields || fields.length === 0) {
        return {
          valid: false,
          reason: 'FIELD_DELETED',
        };
      }

      const field = fields[0];
      if (field.status !== 'active') {
        return {
          valid: false,
          reason: 'FIELD_INACTIVE',
        };
      }

      // Check timestamp field value matches originalTime (allow 1 second difference)
      const currentTimestamp = record[field.id];
      if (!currentTimestamp) {
        return {
          valid: false,
          reason: 'TIMESTAMP_NULL',
        };
      }

      const currentTime = new Date(currentTimestamp);
      const originalTime = new Date(trigger.original_time);

      const diff = Math.abs(currentTime.getTime() - originalTime.getTime());
      if (diff > 1000) {
        return {
          valid: false,
          reason: 'TIMESTAMP_CHANGED',
          currentTime,
        };
      }

      return { valid: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error validating trigger ${trigger.id}: ${errorMessage}`,
        error,
      );
      return {
        valid: false,
        reason: `VALIDATION_ERROR: ${errorMessage}`,
      };
    }
  }

  /**
   * Execute webhook for trigger
   */
  private async executeWebhook(
    trigger: any,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      // Get DataStream configuration with table and views in a single query
      const dataStream = await prisma.dataStream.findUnique({
        where: { id: trigger.data_stream_id },
        include: {
          table: {
            include: {
              views: {
                where: {
                  deletedTime: null, // Only active views
                },
                orderBy: {
                  order: 'asc', // Get first view by order
                },
                take: 1, // Only need the first view
              },
            },
          },
        },
      });

      if (!dataStream) {
        throw new Error('DataStream not found');
      }

      const baseId = dataStream.table.baseId;
      const tableId = trigger.table_id;

      // Get first available view from the included data
      if (!dataStream.table.views || dataStream.table.views.length === 0) {
        throw new Error(`No views found for table ${tableId}`);
      }

      const viewId = dataStream.table.views[0].id;

      // Get record data
      const manual_filters = {
        id: Date.now(),
        condition: 'and',
        childs: [
          {
            id: Date.now(),
            key: '__id',
            field: '__id',
            type: 'NUMBER',
            operator: {
              key: '=',
              value: 'is...',
            },
            value: trigger.record_id,
            valueStr: String(trigger.record_id),
          },
        ],
      };

      const get_record_payload = {
        baseId: baseId,
        tableId: tableId,
        viewId: viewId,
        manual_filters: manual_filters,
        __status: 'active',
        version: 2,
      };

      const [records] = await this.emitter.emitAsync(
        'record.getRecordV2',
        get_record_payload,
        prisma,
        '',
        false,
      );

      // Fetch TriggerSchedule information
      const triggerSchedule = await prisma.triggerSchedule.findUnique({
        where: { id: trigger.trigger_schedule_id },
        select: {
          id: true,
          fieldId: true,
          type: true,
          offsetMinutes: true,
          name: true,
        },
      });

      // Build webhook payload
      const payload = {
        s: tableId,
        p: 'time_based_trigger',
        o: {
          baseId: baseId,
          tableId: tableId,
          data: records,
          triggerInfo: {
            scheduledTime: trigger.scheduled_time,
            originalTime: trigger.original_time,
            retryCount: trigger.retry_count || 0,
            isRetry: (trigger.retry_count || 0) > 0,
            triggerSchedule: triggerSchedule
              ? {
                  id: triggerSchedule.id,
                  fieldId: triggerSchedule.fieldId,
                  type: triggerSchedule.type,
                  offsetMinutes: triggerSchedule.offsetMinutes,
                  name: triggerSchedule.name,
                }
              : null,
          },
        },
      };

      const options = {
        method: 'POST',
        url: dataStream.webhookUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        body_info: {
          type: 'raw',
          sub_type: 'json',
        },
        body: payload,
      };

      // Execute webhook with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Webhook timeout')),
          this.WEBHOOK_TIMEOUT_MS,
        ),
      );

      await Promise.race([
        this.utility_sdk.executeAPI(options),
        timeoutPromise,
      ]);

      // Success - mark as FIRED and soft-delete
      await prisma.scheduledTrigger.update({
        where: { id: trigger.id },
        data: {
          state: 'FIRED',
          status: 'inactive',
          deletedTime: new Date(),
          lastModifiedTime: new Date(),
        },
      });
    } catch (error) {
      // Handle failure
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      await this.handleTriggerFailure(trigger, errorObj, prisma);
    }
  }

  /**
   * Handle trigger failure and retry logic
   */
  private async handleTriggerFailure(
    trigger: any,
    error: Error,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    const newRetryCount = (trigger.retry_count || 0) + 1;
    const maxRetries = trigger.max_retries || 3;

    if (newRetryCount >= maxRetries) {
      // Max retries exceeded - mark as permanently FAILED
      await prisma.scheduledTrigger.update({
        where: { id: trigger.id },
        data: {
          state: 'FAILED',
          retryCount: newRetryCount,
          lastError: error.message,
          lastModifiedTime: new Date(),
        },
      });
    } else {
      // Calculate next retry time
      const nextRetryTime = this.calculateNextRetryTime(trigger);

      await prisma.scheduledTrigger.update({
        where: { id: trigger.id },
        data: {
          state: 'FAILED',
          retryCount: newRetryCount,
          nextRetryTime: nextRetryTime,
          lastError: error.message,
          lastModifiedTime: new Date(),
        },
      });
    }
  }

  /**
   * Calculate next retry time using exponential backoff
   */
  private calculateNextRetryTime(trigger: any): Date {
    const retryCount = trigger.retry_count || 0;
    const retryDelayMinutes = Math.pow(5, retryCount + 1); // 5, 25, 125...
    const now = new Date();

    // Retry as soon as possible (now + delay)
    return new Date(now.getTime() + retryDelayMinutes * 60 * 1000);
  }

  /**
   * Cancel a trigger
   */
  private async cancelTrigger(
    triggerId: string,
    reason: string,
    prisma: Prisma.TransactionClient,
  ): Promise<void> {
    await prisma.scheduledTrigger.update({
      where: { id: triggerId },
      data: {
        state: 'CANCELLED',
        status: 'inactive',
        deletedTime: new Date(),
        lastError: reason,
        lastModifiedTime: new Date(),
      },
    });
  }

  /**
   * Reset stuck triggers (PROCESSING for > 5 minutes)
   */
  private async resetStuckTriggers(): Promise<void> {
    try {
      const cutoffTime = new Date(Date.now() - this.STUCK_TRIGGER_TIMEOUT_MS);

      await this.prisma.prismaClient.scheduledTrigger.updateMany({
        where: {
          status: 'active',
          state: 'PROCESSING',
          lastModifiedTime: {
            lt: cutoffTime,
          },
        },
        data: {
          state: 'PENDING',
          lastModifiedTime: new Date(),
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error resetting stuck triggers: ${errorMessage}`,
        error,
      );
    }
  }
}
