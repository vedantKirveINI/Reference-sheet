import { FormulaCalculationProcessor } from '../bulMq.formulaCalculation.processor';

describe('FormulaCalculationProcessor', () => {
  let processor: FormulaCalculationProcessor;
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

    processor = new FormulaCalculationProcessor(mockPrisma, mockEmitter);
  });

  describe('onModuleInit', () => {
    it('should log initialization message', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await processor.onModuleInit();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Formula calculation processor initialized',
      );
      consoleSpy.mockRestore();
    });
  });

  describe('handleFormulaCalculationJob', () => {
    it('should emit record.migrateFormulaFieldData with correct payload', async () => {
      const job = {
        data: {
          baseId: 'base-1',
          tableId: 'table-1',
          viewId: 'view-1',
          field_id: 'field-1',
        },
      } as any;

      await processor.handleFormulaCalculationJob(job);

      expect(mockEmitter.emitAsync).toHaveBeenCalledWith(
        'record.migrateFormulaFieldData',
        {
          baseId: 'base-1',
          tableId: 'table-1',
          viewId: 'view-1',
          field_id: 'field-1',
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
          field_id: 'f',
        },
      } as any;

      await processor.handleFormulaCalculationJob(job);
      expect(mockPrisma.prismaClient.$transaction).toHaveBeenCalled();
    });
  });
});
