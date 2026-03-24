import { Processor, Process } from '@nestjs/bull';
import { Prisma } from '@prisma/client';
import { Job } from 'bull';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('ai-column')
export class AiColumnProcessor {
  constructor(
    private prisma: PrismaService,
    private emitter: EventEmitterService,
  ) {}

  @Process('ai-column')
  async handleAiColumnJob(job: Job<any>) {
    try {
      await this.prisma.prismaClient.$transaction(
        async (prisma: Prisma.TransactionClient) => {
          const { baseId, tableId, viewId, id, enrichmentFieldId } = job.data;

          const payload = {
            tableId,
            baseId,
            viewId,
            recordId: id,
            aiColumnFieldId: enrichmentFieldId,
          };
          await this.emitter.emitAsync(
            'record.processAiColumn',
            payload,
            prisma,
          );
        },
      );
    } catch (err) {
      throw err;
    }
  }
}
