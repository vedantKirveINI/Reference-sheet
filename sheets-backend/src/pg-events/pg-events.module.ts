import { Module } from '@nestjs/common';
import { PgEventsService } from './pg-events.service';

@Module({
  providers: [PgEventsService],
  exports: [PgEventsService],
})
export class PgEventsModule {}
