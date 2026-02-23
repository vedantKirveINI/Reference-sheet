import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Job } from 'bull';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from 'winston';

@Processor('watch_records')
export class WatchRecordsProcessor {
  private readonly logger: Logger;

  constructor(
    private emitter: EventEmitterService,
    private prisma: PrismaService,
    private winstonLoggerService: WinstonLoggerService,
    @Inject('UtilitySdk') private readonly utility_sdk: any,
  ) {
    this.logger = this.winstonLoggerService.logger;
  }

  @Process('watch_records')
  async handleWatchRecordsJob(job: Job<any>) {
    return await this.prisma.prismaClient.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const { data } = job;
        const { baseId, tableId, viewId, __id, event_type, data_stream_id } =
          data;

        const [data_streams] = await this.emitter.emitAsync(
          'table.getDataStream',
          {
            id: data_stream_id,
          },
          prisma,
        );

        if (data_streams.length === 0) {
          this.logger.info(`Job with id ${job.id} has no data streams`);
          return;
        }

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
              value: __id,
              valueStr: __id,
            },
          ],
        };

        const get_record_payload = {
          baseId: baseId,
          tableId: tableId,
          viewId: viewId,
          manual_filters: manual_filters,
          __status: event_type === 'delete_record' ? 'inactive' : 'active',
          version: 2,
        };

        const record_array = await this.emitter.emitAsync(
          'record.getRecordV2',
          get_record_payload,
          prisma,
          '',
          false,
        );

        const record = record_array[0];

        if (!record) {
          return;
        }

        const payload = {
          s: tableId,
          p: event_type,
          o: {
            baseId: baseId,
            tableId: tableId,
            data: record,
          },
        };

        const responses: any[] = [];

        for (let i = 0; i < data_streams.length; i++) {
          const { webhookUrl, eventType } = data_streams[i];

          if (!Array.isArray(eventType) || !(eventType as string[]).includes(event_type)) {
            continue;
          }

          const body = {
            ...payload,
            o: {
              ...payload.o,
              webhookUrl, // added at the same level as baseId, tableId, data
            },
          };

          const options = {
            method: 'POST',
            url: webhookUrl,
            headers: {
              'Content-Type': 'application/json',
            },
            body_info: {
              type: 'raw',
              sub_type: 'json',
            },
            body,
          };

          try {
            const response = await this.utility_sdk.executeAPI(options);

            this.logger.info(
              `Job with id ${job.id} executed for webhook url ${webhookUrl}`,
            );

            responses.push(response);
          } catch (e) {
            const error_message = `Job error ${JSON.stringify(e)} during API call for job id ${job.id} `;

            this.logger.error(error_message);
            throw new Error(error_message);
          }
        }

        return responses;
      },
    );
  }
}
