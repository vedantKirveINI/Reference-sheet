import { BadRequestException } from '@nestjs/common';
import { BullMQService } from '../bullMq.service';

describe('BullMQService', () => {
  let service: BullMQService;
  let mockEmitter: any;
  let mockWinstonLogger: any;
  let mockWatchRecordsQueue: any;
  let mockFormulaCalculationQueue: any;
  let mockEnrichmentQueue: any;
  let mockCreateScheduledTriggersQueue: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };
    mockWinstonLogger = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    };
    mockWatchRecordsQueue = { add: jest.fn() };
    mockFormulaCalculationQueue = { add: jest.fn() };
    mockEnrichmentQueue = { add: jest.fn() };
    mockCreateScheduledTriggersQueue = { add: jest.fn() };

    service = new BullMQService(
      mockEmitter,
      mockWinstonLogger,
      mockWatchRecordsQueue,
      mockFormulaCalculationQueue,
      mockEnrichmentQueue,
      mockCreateScheduledTriggersQueue,
    );
  });

  describe('constructor', () => {
    it('should register events on construction', () => {
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'bullMq.enqueueJob',
        expect.any(Function),
      );
    });
  });

  describe('getQueue', () => {
    it('should return the watch_records queue', () => {
      expect(service.getQueue('watch_records')).toBe(mockWatchRecordsQueue);
    });

    it('should return the formula_calculation queue', () => {
      expect(service.getQueue('formula_calculation')).toBe(
        mockFormulaCalculationQueue,
      );
    });

    it('should return the enrichment queue', () => {
      expect(service.getQueue('enrichment')).toBe(mockEnrichmentQueue);
    });

    it('should return the create_scheduled_triggers queue', () => {
      expect(service.getQueue('create_scheduled_triggers')).toBe(
        mockCreateScheduledTriggersQueue,
      );
    });

    it('should return undefined for unknown queue name', () => {
      expect(service.getQueue('unknown_queue')).toBeUndefined();
    });
  });

  describe('enqueueJob', () => {
    it('should add a job to the correct queue', async () => {
      const mockJob = { id: 'job-1' };
      mockWatchRecordsQueue.add.mockResolvedValue(mockJob);

      const result = await service.enqueueJob({
        jobName: 'watch_records',
        data: { tableId: 'table-1' },
      });

      expect(mockWatchRecordsQueue.add).toHaveBeenCalledWith(
        'watch_records',
        { tableId: 'table-1' },
        undefined,
      );
      expect(result).toBe(mockJob);
      expect(mockWinstonLogger.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('job-1'),
      );
    });

    it('should pass options to queue.add', async () => {
      const mockJob = { id: 'job-2' };
      mockEnrichmentQueue.add.mockResolvedValue(mockJob);

      await service.enqueueJob({
        jobName: 'enrichment',
        data: { fieldId: 'f1' },
        options: { delay: 5000 },
      });

      expect(mockEnrichmentQueue.add).toHaveBeenCalledWith(
        'enrichment',
        { fieldId: 'f1' },
        { delay: 5000 },
      );
    });

    it('should throw BadRequestException for unrecognized job name', async () => {
      await expect(
        service.enqueueJob({
          jobName: 'nonexistent',
          data: {},
        }),
      ).rejects.toThrow(BadRequestException);

      expect(mockWinstonLogger.logger.error).toHaveBeenCalledWith(
        expect.stringContaining('nonexistent'),
      );
    });

    it('should throw BadRequestException when queue.add fails', async () => {
      mockWatchRecordsQueue.add.mockRejectedValue(new Error('Redis down'));

      await expect(
        service.enqueueJob({
          jobName: 'watch_records',
          data: {},
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
