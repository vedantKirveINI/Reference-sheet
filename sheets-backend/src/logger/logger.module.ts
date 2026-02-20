import { Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from './winstonLogger.service';

@Global()
@Module({
  providers: [WinstonLoggerService],
  exports: [WinstonLoggerService],
})
export class WinstonLoggerModule {}
