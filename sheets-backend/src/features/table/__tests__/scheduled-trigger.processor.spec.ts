import { ScheduledTriggerProcessor } from '../scheduled-trigger.processor';

describe('ScheduledTriggerProcessor', () => {
  let processor: ScheduledTriggerProcessor;
  let mockPrisma: any;
  let mockEmitter: any;
  let mockWinstonLogger: any;
  let mockUtilitySdk: any;

  beforeEach(() => {
    mockPrisma = {
      prismaClient: {
        $queryRaw: jest.fn(),
        scheduledTrigger: {
          updateMany: jest.fn(),
          update: jest.fn(),
        },
        $transaction: jest.fn((fn: any) => fn(mockPrisma.txClient)),
      },
      txClient: {
        scheduledTrigger: {
          update: jest.fn(),
          updateMany: jest.fn(),
        },
        dataStream: {
          findUnique: jest.fn(),
        },
        triggerSchedule: {
          findUnique: jest.fn(),
        },
      },
    };

    mockEmitter = {
      onEvent: jest.fn(),
      emitAsync: jest.fn(),
    };

    mockWinstonLogger = {
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
      },
    };

    mockUtilitySdk = {
      executeAPI: jest.fn(),
    };

    processor = new ScheduledTriggerProcessor(
      mockPrisma,
      mockEmitter,
      mockWinstonLogger,
      mockUtilitySdk,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  describe('onModuleInit', () => {
    it('should reset stuck triggers and start polling', async () => {
      mockPrisma.prismaClient.scheduledTrigger.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.prismaClient.$queryRaw.mockResolvedValue([]);

      const startPollingSpy = jest.spyOn(processor as any, 'startPolling').mockImplementation(() => {});
      const resetSpy = jest.spyOn(processor as any, 'resetStuckTriggers').mockResolvedValue(undefined);

      await processor.onModuleInit();

      expect(resetSpy).toHaveBeenCalled();
      expect(startPollingSpy).toHaveBeenCalled();
      expect(mockWinstonLogger.logger.info).toHaveBeenCalledWith(
        'ScheduledTriggerProcessor initialized',
      );

      startPollingSpy.mockRestore();
      resetSpy.mockRestore();
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear polling interval', async () => {
      (processor as any).pollingInterval = setInterval(() => {}, 10000);

      await processor.onModuleDestroy();

      expect((processor as any).pollingInterval).toBeNull();
      expect(mockWinstonLogger.logger.info).toHaveBeenCalledWith(
        'ScheduledTriggerProcessor shut down',
      );
    });

    it('should handle null polling interval', async () => {
      (processor as any).pollingInterval = null;

      await processor.onModuleDestroy();

      expect(mockWinstonLogger.logger.info).toHaveBeenCalled();
    });
  });

  describe('pollAndProcessTriggers', () => {
    it('should process ready and retry triggers', async () => {
      const processReadySpy = jest.spyOn(processor as any, 'processReadyTriggers').mockResolvedValue(undefined);
      const processRetrySpy = jest.spyOn(processor as any, 'processRetryTriggers').mockResolvedValue(undefined);

      await processor.pollAndProcessTriggers();

      expect(processReadySpy).toHaveBeenCalled();
      expect(processRetrySpy).toHaveBeenCalled();

      processReadySpy.mockRestore();
      processRetrySpy.mockRestore();
    });

    it('should log error and continue on failure', async () => {
      jest.spyOn(processor as any, 'processReadyTriggers').mockRejectedValue(new Error('DB down'));
      jest.spyOn(processor as any, 'processRetryTriggers').mockResolvedValue(undefined);

      await processor.pollAndProcessTriggers();

      expect(mockWinstonLogger.logger.error).toHaveBeenCalled();
    });
  });

  describe('processReadyTriggers', () => {
    it('should return early when no triggers found', async () => {
      mockPrisma.prismaClient.$queryRaw.mockResolvedValue([]);

      await (processor as any).processReadyTriggers();

      expect(mockPrisma.prismaClient.$transaction).not.toHaveBeenCalled();
    });

    it('should process found triggers concurrently', async () => {
      const triggers = [
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', state: 'PENDING' },
        { id: 'st-2', data_stream_id: 'ds-1', record_id: 2, table_id: 't1', state: 'PENDING' },
      ];
      mockPrisma.prismaClient.$queryRaw.mockResolvedValue(triggers);

      const processTriggerSpy = jest.spyOn(processor as any, 'processTrigger').mockResolvedValue(undefined);

      await (processor as any).processReadyTriggers();

      expect(processTriggerSpy).toHaveBeenCalledTimes(2);

      processTriggerSpy.mockRestore();
    });
  });

  describe('processRetryTriggers', () => {
    it('should return early when no retry triggers found', async () => {
      mockPrisma.prismaClient.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await (processor as any).processRetryTriggers();
    });
  });

  describe('validateTrigger', () => {
    it('should return invalid when dataStream not found', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue(null);

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: new Date() },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('DATA_STREAM_DELETED');
    });

    it('should return invalid when no views found', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        table: { baseId: 'b1', views: [] },
      });

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: new Date() },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('NO_VIEWS_FOUND');
    });

    it('should return invalid when record not found', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      mockEmitter.emitAsync.mockResolvedValueOnce([{ record: null }]);

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: new Date() },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('RECORD_DELETED_OR_INACTIVE');
    });

    it('should return invalid when field is deleted', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ record: { __id: 1 } }])
        .mockResolvedValueOnce([[]]);

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: new Date() },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('FIELD_DELETED');
    });

    it('should return invalid when field is inactive', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ record: { __id: 1 } }])
        .mockResolvedValueOnce([[{ id: 1, status: 'inactive' }]]);

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: new Date() },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('FIELD_INACTIVE');
    });

    it('should return invalid when timestamp is null', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      const record = { __id: 1, 1: null };
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ record }])
        .mockResolvedValueOnce([[{ id: 1, status: 'active' }]]);

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: new Date() },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('TIMESTAMP_NULL');
    });

    it('should return invalid when timestamp changed beyond threshold', async () => {
      const originalTime = new Date('2025-01-01T12:00:00Z');
      const changedTime = new Date('2025-01-01T12:05:00Z');

      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      const record = { __id: 1, 1: changedTime.toISOString() };
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ record }])
        .mockResolvedValueOnce([[{ id: 1, status: 'active' }]]);

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: originalTime },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('TIMESTAMP_CHANGED');
    });

    it('should return valid when all checks pass', async () => {
      const originalTime = new Date('2025-01-01T12:00:00Z');

      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      const record = { __id: 1, 1: originalTime.toISOString() };
      mockEmitter.emitAsync
        .mockResolvedValueOnce([{ record }])
        .mockResolvedValueOnce([[{ id: 1, status: 'active' }]]);

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1', original_field_id: 1, original_time: originalTime },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(true);
    });

    it('should return invalid with VALIDATION_ERROR on exception', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await (processor as any).validateTrigger(
        { id: 'st-1', data_stream_id: 'ds-1' },
        mockPrisma.txClient,
      );

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('VALIDATION_ERROR');
    });
  });

  describe('executeWebhook', () => {
    it('should mark trigger as FIRED on success', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        webhookUrl: 'http://webhook.test/endpoint',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      mockEmitter.emitAsync.mockResolvedValue([{ record: { __id: 1 } }]);
      mockPrisma.txClient.triggerSchedule.findUnique.mockResolvedValue({
        id: 'ts-1',
        fieldId: 1,
        type: 'EXACT',
        offsetMinutes: 0,
        name: 'test',
      });
      mockUtilitySdk.executeAPI.mockResolvedValue({ status: 200 });
      mockPrisma.txClient.scheduledTrigger.update.mockResolvedValue({});

      await (processor as any).executeWebhook(
        {
          id: 'st-1',
          data_stream_id: 'ds-1',
          record_id: 1,
          table_id: 't1',
          trigger_schedule_id: 'ts-1',
          scheduled_time: new Date(),
          original_time: new Date(),
          retry_count: 0,
        },
        mockPrisma.txClient,
      );

      expect(mockPrisma.txClient.scheduledTrigger.update).toHaveBeenCalledWith({
        where: { id: 'st-1' },
        data: expect.objectContaining({
          state: 'FIRED',
          status: 'inactive',
        }),
      });
    });

    it('should handle failure and call handleTriggerFailure', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue({
        id: 'ds-1',
        webhookUrl: 'http://webhook.test/endpoint',
        table: { baseId: 'b1', views: [{ id: 'v1' }] },
      });
      mockEmitter.emitAsync.mockResolvedValue([{ record: { __id: 1 } }]);
      mockPrisma.txClient.triggerSchedule.findUnique.mockResolvedValue(null);
      mockUtilitySdk.executeAPI.mockRejectedValue(new Error('Network error'));

      const handleFailureSpy = jest.spyOn(processor as any, 'handleTriggerFailure').mockResolvedValue(undefined);

      await (processor as any).executeWebhook(
        {
          id: 'st-1',
          data_stream_id: 'ds-1',
          record_id: 1,
          table_id: 't1',
          trigger_schedule_id: 'ts-1',
          retry_count: 0,
          max_retries: 3,
        },
        mockPrisma.txClient,
      );

      expect(handleFailureSpy).toHaveBeenCalled();
      handleFailureSpy.mockRestore();
    });

    it('should throw when dataStream not found', async () => {
      mockPrisma.txClient.dataStream.findUnique.mockResolvedValue(null);

      const handleFailureSpy = jest.spyOn(processor as any, 'handleTriggerFailure').mockResolvedValue(undefined);

      await (processor as any).executeWebhook(
        { id: 'st-1', data_stream_id: 'ds-1', record_id: 1, table_id: 't1' },
        mockPrisma.txClient,
      );

      expect(handleFailureSpy).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ message: 'DataStream not found' }),
        mockPrisma.txClient,
      );

      handleFailureSpy.mockRestore();
    });
  });

  describe('handleTriggerFailure', () => {
    it('should permanently fail when max retries exceeded', async () => {
      mockPrisma.txClient.scheduledTrigger.update.mockResolvedValue({});

      await (processor as any).handleTriggerFailure(
        { id: 'st-1', retry_count: 2, max_retries: 3 },
        new Error('Failed'),
        mockPrisma.txClient,
      );

      expect(mockPrisma.txClient.scheduledTrigger.update).toHaveBeenCalledWith({
        where: { id: 'st-1' },
        data: expect.objectContaining({
          state: 'FAILED',
          retryCount: 3,
          lastError: 'Failed',
        }),
      });
    });

    it('should set nextRetryTime when retries remain', async () => {
      mockPrisma.txClient.scheduledTrigger.update.mockResolvedValue({});

      await (processor as any).handleTriggerFailure(
        { id: 'st-1', retry_count: 0, max_retries: 3 },
        new Error('Temporary failure'),
        mockPrisma.txClient,
      );

      expect(mockPrisma.txClient.scheduledTrigger.update).toHaveBeenCalledWith({
        where: { id: 'st-1' },
        data: expect.objectContaining({
          state: 'FAILED',
          retryCount: 1,
          nextRetryTime: expect.any(Date),
        }),
      });
    });
  });

  describe('calculateNextRetryTime', () => {
    it('should use exponential backoff', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result0 = (processor as any).calculateNextRetryTime({ retry_count: 0 });
      expect(result0.getTime()).toBe(now + 5 * 60 * 1000);

      const result1 = (processor as any).calculateNextRetryTime({ retry_count: 1 });
      expect(result1.getTime()).toBe(now + 25 * 60 * 1000);

      const result2 = (processor as any).calculateNextRetryTime({ retry_count: 2 });
      expect(result2.getTime()).toBe(now + 125 * 60 * 1000);

      jest.restoreAllMocks();
    });
  });

  describe('cancelTrigger', () => {
    it('should mark trigger as cancelled', async () => {
      mockPrisma.txClient.scheduledTrigger.update.mockResolvedValue({});

      await (processor as any).cancelTrigger('st-1', 'Test reason', mockPrisma.txClient);

      expect(mockPrisma.txClient.scheduledTrigger.update).toHaveBeenCalledWith({
        where: { id: 'st-1' },
        data: expect.objectContaining({
          state: 'CANCELLED',
          status: 'inactive',
          lastError: 'Test reason',
        }),
      });
    });
  });

  describe('resetStuckTriggers', () => {
    it('should reset PROCESSING triggers older than timeout', async () => {
      mockPrisma.prismaClient.scheduledTrigger.updateMany.mockResolvedValue({ count: 2 });

      await (processor as any).resetStuckTriggers();

      expect(mockPrisma.prismaClient.scheduledTrigger.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'active',
          state: 'PROCESSING',
          lastModifiedTime: { lt: expect.any(Date) },
        },
        data: {
          state: 'PENDING',
          lastModifiedTime: expect.any(Date),
        },
      });
    });

    it('should log error on failure', async () => {
      mockPrisma.prismaClient.scheduledTrigger.updateMany.mockRejectedValue(
        new Error('DB error'),
      );

      await (processor as any).resetStuckTriggers();

      expect(mockWinstonLogger.logger.error).toHaveBeenCalled();
    });
  });
});
