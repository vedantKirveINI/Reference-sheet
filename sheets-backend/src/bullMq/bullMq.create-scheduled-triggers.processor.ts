import { Processor, Process } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Job } from 'bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableService } from 'src/features/table/table.service';

@Processor('create_scheduled_triggers')
export class CreateScheduledTriggersProcessor {
  constructor(
    private prisma: PrismaService,
    private tableService: TableService,
    @Inject('UtilitySdk') private readonly utility_sdk: any,
  ) {}

  @Process('create_scheduled_triggers')
  async handleCreateScheduledTriggersJob(job: Job<any>) {
    const { dataStreamId, tableId } = job.data;

    return await this.prisma.prismaClient.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        try {
          const dataStream = await prisma.dataStream.findUnique({
            where: { id: dataStreamId },
            select: { isStreaming: true },
          });

          if (!dataStream) {
            return { skipped: true, reason: 'datastream_not_found' };
          }

          if (!dataStream.isStreaming) {
            return { skipped: true, reason: 'not_streaming' };
          }

          await this.tableService.cleanupScheduledTriggers(
            dataStreamId,
            prisma,
          );

          await this.tableService.backfillTimeBasedTriggers(
            dataStreamId,
            tableId,
            prisma,
          );

          return {
            completed: true,
            dataStreamId,
            tableId,
          };
        } catch (error) {
          throw error;
        }
      },
      {
        timeout: 300000, // 5 minutes timeout for large datasets
      },
    );
  }
}
