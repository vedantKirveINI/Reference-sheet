import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableController } from './table.controller';
import { DateTimeUtils } from 'src/utils/DateTime';
import { TableUtils } from './table.utils';
import { ComputedConfigManager } from './utils/computed-config-manager';
import { TimeBasedTriggerService } from './time-based-trigger.service';
import { ScheduledTriggerProcessor } from './scheduled-trigger.processor';

@Module({
  imports: [],
  controllers: [TableController],
  providers: [
    TableService,
    DateTimeUtils,
    TableUtils,
    ComputedConfigManager,
    TimeBasedTriggerService,
    ScheduledTriggerProcessor,
  ],
  exports: [TableService, ComputedConfigManager, TimeBasedTriggerService],
})
export class TableModule {}
