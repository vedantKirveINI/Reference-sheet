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
    console.log('[AI_COLUMN][processor] Job received. jobId:', job.id, 'data:', JSON.stringify(job.data));

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

          console.log('[AI_COLUMN][processor] Emitting record.processAiColumn with:', JSON.stringify(payload));
          await this.emitter.emitAsync(
            'record.processAiColumn',
            payload,
            prisma,
          );
          console.log('[AI_COLUMN][processor] record.processAiColumn completed for recordId:', id);
        },
      );
    } catch (err) {
      console.error('[AI_COLUMN][processor] Job FAILED. jobId:', job.id, 'error:', err);
      throw err;
    }
  }
}
