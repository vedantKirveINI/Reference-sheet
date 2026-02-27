import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomHealthService extends HealthIndicator {
  async checkAppHealth(): Promise<HealthIndicatorResult> {
    const isServiceUp = this.performBasicCheck();

    return {
      sheet_service: {
        status: isServiceUp ? 'up' : 'down',
        message: isServiceUp
          ? 'Sheet service is operational'
          : 'Sheet service is down',
      },
    };
  }

  private performBasicCheck(): boolean {
    // Replace with real logic
    return true; // false if service is down
  }
}
