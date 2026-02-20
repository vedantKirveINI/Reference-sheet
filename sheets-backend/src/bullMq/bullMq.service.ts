import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';
import { WinstonLoggerService } from 'src/logger/winstonLogger.service';
import { Logger } from 'winston';
import { EnqueueJobDTO } from './DTO/enqueue-job.dto';

@Injectable()
export class BullMQService {
  private readonly logger: Logger;
  private queueMap: { [key: string]: Queue } = {};

  constructor(
    private emitter: EventEmitterService,
    private winstonLoggerService: WinstonLoggerService,
    @InjectQueue('watch_records') private readonly watchRecords: Queue,
    @InjectQueue('formula_calculation')
    private readonly formulaCalculationQueue: Queue,
    @InjectQueue('enrichment') private readonly enrichmentQueue: Queue,
    @InjectQueue('create_scheduled_triggers')
    private readonly createScheduledTriggersQueue: Queue,
  ) {
    this.logger = this.winstonLoggerService.logger;
    this.registerEvents();

    // Initialize queue mapping should be last
    this.initializeQueueMap();
  }

  registerEvents() {
    const events = [
      {
        name: 'bullMq.enqueueJob',
        handler: this.enqueueJob,
      },
    ];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  private initializeQueueMap() {
    this.queueMap = {
      watch_records: this.watchRecords,
      formula_calculation: this.formulaCalculationQueue,
      enrichment: this.enrichmentQueue,
      create_scheduled_triggers: this.createScheduledTriggersQueue,
      // Add more queues here as needed
    };
  }

  getQueue(name: string): Queue {
    return this.queueMap[name];
  }

  async enqueueJob({ jobName, data, options }: EnqueueJobDTO) {
    const queue = this.queueMap[jobName];

    if (!queue) {
      const errorMsg = `Job name ${jobName} not recognized`;
      this.logger.error(errorMsg);
      throw new BadRequestException(errorMsg);
    }

    try {
      const job = await queue.add(jobName, data, options);

      this.logger.info(`Job created with job id ${job.id}`);

      return job;
    } catch (e) {
      throw new BadRequestException(`Job was not enqueued`);
    }
  }
}
