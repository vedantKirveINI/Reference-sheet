import { DependencyGraphService } from '../dependency-graph.service';

describe('DependencyGraphService', () => {
  let service: DependencyGraphService;
  let mockEmitter: any;
  let mockPrisma: any;

  beforeEach(() => {
    mockEmitter = {
      onEvent: jest.fn(),
      emit: jest.fn(),
      emitAsync: jest.fn(),
    };

    mockPrisma = {
      reference: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    };

    service = new DependencyGraphService(mockEmitter);
  });

  describe('registerEvents', () => {
    it('should register dependency.getTopoOrder event', () => {
      expect(mockEmitter.onEvent).toHaveBeenCalledWith(
        'dependency.getTopoOrder',
        expect.any(Function),
      );
    });
  });

  describe('getDownstreamFieldIds', () => {
    it('should return empty array for empty input', async () => {
      const result = await service.getDownstreamFieldIds([], mockPrisma);
      expect(result).toEqual([]);
    });

    it('should query downstream fields recursively', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { field_id: 10 },
        { field_id: 20 },
      ]);

      const result = await service.getDownstreamFieldIds([1], mockPrisma);
      expect(result).toEqual([10, 20]);
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('WITH RECURSIVE downstream'),
        [1],
      );
    });

    it('should return empty on query error', async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(new Error('DB error'));

      const result = await service.getDownstreamFieldIds([1], mockPrisma);
      expect(result).toEqual([]);
    });
  });

  describe('getTopoOrder', () => {
    it('should return empty array for empty input', async () => {
      const result = await service.getTopoOrder([], mockPrisma);
      expect(result).toEqual([]);
    });

    it('should return topologically sorted field IDs', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ field_id: 3 }]);
      mockPrisma.reference.findMany.mockResolvedValue([
        { fromFieldId: 1, toFieldId: 2 },
        { fromFieldId: 2, toFieldId: 3 },
      ]);

      const result = await service.getTopoOrder([1], mockPrisma);

      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result.indexOf(1)).toBeLessThan(result.indexOf(2));
      expect(result.indexOf(2)).toBeLessThan(result.indexOf(3));
    });

    it('should handle cycles gracefully', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ field_id: 2 }]);
      mockPrisma.reference.findMany.mockResolvedValue([
        { fromFieldId: 1, toFieldId: 2 },
        { fromFieldId: 2, toFieldId: 1 },
      ]);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await service.getTopoOrder([1], mockPrisma);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should include all field IDs including downstream', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { field_id: 5 },
        { field_id: 6 },
      ]);
      mockPrisma.reference.findMany.mockResolvedValue([
        { fromFieldId: 1, toFieldId: 5 },
        { fromFieldId: 5, toFieldId: 6 },
      ]);

      const result = await service.getTopoOrder([1], mockPrisma);

      expect(result).toContain(1);
      expect(result).toContain(5);
      expect(result).toContain(6);
    });

    it('should handle nodes with no edges', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);
      mockPrisma.reference.findMany.mockResolvedValue([]);

      const result = await service.getTopoOrder([1, 2, 3], mockPrisma);

      expect(result).toHaveLength(3);
      expect(result).toContain(1);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });
  });

  describe('handleGetTopoOrder', () => {
    it('should delegate to getTopoOrder', async () => {
      jest.spyOn(service, 'getTopoOrder').mockResolvedValue([1, 2]);

      const result = await service.handleGetTopoOrder(
        { fieldIds: [1] },
        mockPrisma,
      );

      expect(service.getTopoOrder).toHaveBeenCalledWith([1], mockPrisma);
      expect(result).toEqual([1, 2]);
    });
  });
});
