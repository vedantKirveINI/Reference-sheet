import { Processor, Process } from '@nestjs/bull';

import { Prisma } from '@prisma/client';
import { Job } from 'bull';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('enrichment')
export class EnrichmentProcessor {
  constructor(
    private prisma: PrismaService,
    private emitter: EventEmitterService,
  ) {}

  @Process('enrichment')
  async handleEnrichmentJob(job: Job<any>) {
    console.log('Enrichment job started', job.data);

    await this.prisma.prismaClient.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const { baseId, tableId, viewId, id, enrichmentFieldId } = job.data;

        const payload = {
          tableId,
          baseId,
          viewId,
          id: id,
          enrichedFieldId: enrichmentFieldId,
        };

        await this.emitter.emitAsync(
          'record.processEnrichment',
          payload,
          prisma,
        );
      },
    );
  }
}
