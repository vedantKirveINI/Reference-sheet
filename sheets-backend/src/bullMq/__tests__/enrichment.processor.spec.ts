import { EnrichmentProcessor } from '../bullMq.enrichment.processor';

describe('EnrichmentProcessor', () => {
  let processor: EnrichmentProcessor;
  let mockPrisma: any;
  let mockEmitter: any;

  beforeEach(() => {
    mockEmitter = {
      emitAsync: jest.fn().mockResolvedValue([]),
    };
    mockPrisma = {
      prismaClient: {
        $transaction: jest.fn((fn: any) => fn(mockPrisma.prismaClient)),
      },
    };

    processor = new EnrichmentProcessor(mockPrisma, mockEmitter);
  });

  describe('handleEnrichmentJob', () => {
    it('should emit record.processEnrichment with correct payload', async () => {
      const job = {
        data: {
          baseId: 'base-1',
          tableId: 'table-1',
          viewId: 'view-1',
          id: 'rec-1',
          enrichmentFieldId: 'field-1',
        },
      } as any;

      await processor.handleEnrichmentJob(job);

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'record.processEnrichment',
        {
          tableId: 'table-1',
          baseId: 'base-1',
          viewId: 'view-1',
          id: 'rec-1',
          enrichedFieldId: 'field-1',
        },
        expect.anything(),
      );
    });

    it('should run within a prisma transaction', async () => {
      const job = {
        data: {
          baseId: 'b',
          tableId: 't',
          viewId: 'v',
          id: 'r',
          enrichmentFieldId: 'f',
        },
      } as any;

      await processor.handleEnrichmentJob(job);
      expect(mockPrisma.prismaClient.$transaction).toHaveBeenCalled();
    });
  });
});
