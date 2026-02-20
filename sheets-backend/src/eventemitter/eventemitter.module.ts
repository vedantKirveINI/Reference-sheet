// event-emitter.module.ts

import { Global, Module } from '@nestjs/common';
import { EventEmitterService } from './eventemitter.service';

@Global()
@Module({
  providers: [EventEmitterService],
  exports: [EventEmitterService],
})
export class EventEmitte2rModule {}
