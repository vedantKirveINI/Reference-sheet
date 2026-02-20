import { Processor, Process } from '@nestjs/bull';
import { OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Job } from 'bull';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Processor('formula_calculation')
export class FormulaCalculationProcessor implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private emitter: EventEmitterService,
  ) {}

  async onModuleInit() {
    console.log('Formula calculation processor initialized');
  }

  @Process('formula_calculation')
  async handleFormulaCalculationJob(job: Job<any>) {
    console.log('Formula calculation job started', job.data);

    await this.prisma.prismaClient.$transaction(
      async (prisma: Prisma.TransactionClient) => {
        const { baseId, tableId, viewId, field_id } = job.data;
        const payload = {
          baseId,
          tableId,
          viewId,
          field_id,
        };

        await this.emitter.emitAsync(
          'record.migrateFormulaFieldData',
          payload,
          prisma,
        );
      },
    );
  }
}
