import { MiddlewareConsumer, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BullMQService } from './bullMq.service';
import { WatchRecordsProcessor } from './bullMq.processor';
import { ExpressAdapter } from '@bull-board/express';
import { BasicAuthMiddleware } from 'src/middleware/basic-auth-middleware.middleware';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { RedisService } from 'src/redis/redis.service';
import { FormulaCalculationProcessor } from './bulMq.formulaCalculation.processor';
import { EnrichmentProcessor } from './bullMq.enrichment.processor';
import { CreateScheduledTriggersProcessor } from './bullMq.create-scheduled-triggers.processor';
import { TableModule } from 'src/features/table/table.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (redisService: RedisService) => ({
        redis: redisService.getRedisConfig().url,
      }),
      inject: [RedisService],
    }),
    TableModule,
    BullModule.registerQueue({
      name: 'watch_records',
    }),
    BullModule.registerQueue({
      name: 'formula_calculation',
    }),
    BullModule.registerQueue({
      name: 'enrichment',
    }),
    BullModule.registerQueue({
      name: 'create_scheduled_triggers',
    }),
  ],
  providers: [
    BullMQService,
    WatchRecordsProcessor,
    FormulaCalculationProcessor,
    EnrichmentProcessor,
    CreateScheduledTriggersProcessor,
  ],
  exports: [BullMQService],
})
export class BullMQModule {
  constructor(private readonly bullMQService: BullMQService) {}

  configure(consumer: MiddlewareConsumer) {
    // Create and configure Bull Board
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
      queues: [
        new BullAdapter(this.bullMQService.getQueue('watch_records')),
        new BullAdapter(this.bullMQService.getQueue('formula_calculation')),
        new BullAdapter(this.bullMQService.getQueue('enrichment')),
        new BullAdapter(
          this.bullMQService.getQueue('create_scheduled_triggers'),
        ),
      ],
      serverAdapter,
      options: {
        uiConfig: {
          miscLinks: [{ text: 'Logout', url: 'admin/logout' }],
        },
      },
    });

    // Apply middleware and Bull Board routes
    consumer
      .apply(BasicAuthMiddleware, serverAdapter.getRouter())
      .forRoutes('/admin/queues'); // Adjust path as needed
  }
}
