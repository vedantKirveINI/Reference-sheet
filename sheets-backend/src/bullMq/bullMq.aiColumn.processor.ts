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

  @Process({ name: 'ai-column', concurrency: 3 })
  async handleAiColumnJob(job: Job<any>) {
    try {
      await this.prisma.prismaClient.$transaction(
        async (prisma: Prisma.TransactionClient) => {
          const { baseId, tableId, viewId, id, enrichmentFieldId } = job.data;
          const token = job.data.token || process.env.TRACK_TOKEN;

          const payload = {
            tableId,
            baseId,
            viewId,
            recordId: id,
            aiColumnFieldId: enrichmentFieldId,
            token,
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
