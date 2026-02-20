// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  DiskHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { CustomHealthService } from './health.custom-service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly customHealthService: CustomHealthService,
    private readonly disk: DiskHealthIndicator,
    private readonly prismaHealthIndicator: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    // Here we return a simple "OK" status for the app liveness
    return this.healthCheckService.check([
      () => this.customHealthService.checkAppHealth(),
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 1 }),
      () =>
        this.prismaHealthIndicator.pingCheck(
          'database',
          this.prisma.prismaClient,
        ),
    ]);
  }
}
