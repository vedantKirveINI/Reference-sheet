import { CreateScheduledTriggersProcessor } from '../bullMq.create-scheduled-triggers.processor';

describe('CreateScheduledTriggersProcessor', () => {
  let processor: CreateScheduledTriggersProcessor;
  let mockPrisma: any;
  let mockTableService: any;
  let mockUtilitySdk: any;
  let mockTransactionClient: any;

  beforeEach(() => {
    mockTransactionClient = {
      dataStream: {
        findUnique: jest.fn(),
      },
    };
    mockPrisma = {
      prismaClient: {
        $transaction: jest.fn((fn: any) =>
          fn(mockTransactionClient),
        ),
      },
    };
    mockTableService = {
      cleanupScheduledTriggers: jest.fn().mockResolvedValue(undefined),
      backfillTimeBasedTriggers: jest.fn().mockResolvedValue(undefined),
    };
    mockUtilitySdk = {};

    processor = new CreateScheduledTriggersProcessor(
      mockPrisma,
      mockTableService,
      mockUtilitySdk,
    );
  });

  describe('handleCreateScheduledTriggersJob', () => {
    it('should skip if datastream not found', async () => {
      mockTransactionClient.dataStream.findUnique.mockResolvedValue(null);

      const job = {
        data: { dataStreamId: 'ds-1', tableId: 'table-1' },
      } as any;

      const result = await processor.handleCreateScheduledTriggersJob(job);
      expect(result).toEqual({
        skipped: true,
        reason: 'datastream_not_found',
      });
    });

    it('should skip if not streaming', async () => {
      mockTransactionClient.dataStream.findUnique.mockResolvedValue({
        isStreaming: false,
      });

      const job = {
        data: { dataStreamId: 'ds-1', tableId: 'table-1' },
      } as any;

      const result = await processor.handleCreateScheduledTriggersJob(job);
      expect(result).toEqual({ skipped: true, reason: 'not_streaming' });
    });

    it('should cleanup and backfill when streaming', async () => {
      mockTransactionClient.dataStream.findUnique.mockResolvedValue({
        isStreaming: true,
      });

      const job = {
        data: { dataStreamId: 'ds-1', tableId: 'table-1' },
      } as any;

      const result = await processor.handleCreateScheduledTriggersJob(job);

      expect(mockTableService.cleanupScheduledTriggers).toHaveBeenCalledWith(
        'ds-1',
        mockTransactionClient,
      );
      expect(mockTableService.backfillTimeBasedTriggers).toHaveBeenCalledWith(
        'ds-1',
        'table-1',
        mockTransactionClient,
      );
      expect(result).toEqual({
        completed: true,
        dataStreamId: 'ds-1',
        tableId: 'table-1',
      });
    });

    it('should rethrow errors from cleanup/backfill', async () => {
      mockTransactionClient.dataStream.findUnique.mockResolvedValue({
        isStreaming: true,
      });
      mockTableService.cleanupScheduledTriggers.mockRejectedValue(
        new Error('cleanup failed'),
      );

      const job = {
        data: { dataStreamId: 'ds-1', tableId: 'table-1' },
      } as any;

      await expect(
        processor.handleCreateScheduledTriggersJob(job),
      ).rejects.toThrow('cleanup failed');
    });
  });
});
