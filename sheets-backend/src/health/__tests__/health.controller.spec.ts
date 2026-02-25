import { HealthController } from '../health.controller';
import { CustomHealthService } from '../health.custom-service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthCheckService: any;
  let mockCustomHealthService: any;
  let mockDisk: any;
  let mockPrismaHealthIndicator: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockHealthCheckService = {
      check: jest.fn(),
    };
    mockCustomHealthService = {
      checkAppHealth: jest.fn(),
    };
    mockDisk = {
      checkStorage: jest.fn(),
    };
    mockPrismaHealthIndicator = {
      pingCheck: jest.fn(),
    };
    mockPrisma = {
      prismaClient: {},
    };

    controller = new HealthController(
      mockHealthCheckService,
      mockCustomHealthService,
      mockDisk,
      mockPrismaHealthIndicator,
      mockPrisma,
    );
  });

  describe('check', () => {
    it('should call healthCheckService.check with all indicators', () => {
      mockHealthCheckService.check.mockReturnValue({ status: 'ok' });

      const result = controller.check();

      expect(mockHealthCheckService.check).toHaveBeenCalledWith([
        expect.any(Function),
        expect.any(Function),
        expect.any(Function),
      ]);
      expect(result).toEqual({ status: 'ok' });
    });

    it('should include app health check', () => {
      mockHealthCheckService.check.mockImplementation(
        (indicators: Function[]) => {
          indicators[0]();
          return { status: 'ok' };
        },
      );

      controller.check();
      expect(mockCustomHealthService.checkAppHealth).toHaveBeenCalled();
    });

    it('should include disk health check', () => {
      mockHealthCheckService.check.mockImplementation(
        (indicators: Function[]) => {
          indicators[1]();
          return { status: 'ok' };
        },
      );

      controller.check();
      expect(mockDisk.checkStorage).toHaveBeenCalledWith('storage', {
        path: '/',
        thresholdPercent: 1,
      });
    });

    it('should include prisma health check', () => {
      mockHealthCheckService.check.mockImplementation(
        (indicators: Function[]) => {
          indicators[2]();
          return { status: 'ok' };
        },
      );

      controller.check();
      expect(mockPrismaHealthIndicator.pingCheck).toHaveBeenCalledWith(
        'database',
        mockPrisma.prismaClient,
      );
    });
  });
});

describe('CustomHealthService', () => {
  let service: CustomHealthService;

  beforeEach(() => {
    service = new CustomHealthService();
  });

  describe('checkAppHealth', () => {
    it('should return status up', async () => {
      const result = await service.checkAppHealth();
      expect(result).toEqual({
        sheet_service: {
          status: 'up',
          message: 'Sheet service is operational',
        },
      });
    });
  });
});
