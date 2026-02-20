import { Module } from '@nestjs/common';

import { CustomHealthService } from './health.custom-service';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [CustomHealthService],
})
export class HealthModule {}
