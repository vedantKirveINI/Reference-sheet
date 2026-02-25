import { SpaceService } from '../space.service';

describe('SpaceService', () => {
  let service: SpaceService;
  let mockEmitter: any;
  let mockPrismaTransaction: any;

  beforeEach(() => {
    mockEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
      onEvent: jest.fn(),
    };

    mockPrismaTransaction = {
      space: {
        upsert: jest.fn(),
      },
    };

    service = new SpaceService(mockEmitter);
  });

  describe('registerEvents', () => {
    it('should register space.createSpace event', () => {
      const eventNames = mockEmitter.onEvent.mock.calls.map((c: any) => c[0]);
      expect(eventNames).toContain('space.createSpace');
    });
  });

  describe('createSpace', () => {
    it('should create a new space with provided name', async () => {
      const space = { id: 'sp1', name: 'My Space', createdBy: 'user1' };
      mockPrismaTransaction.space.upsert.mockResolvedValue(space);

      const result = await service.createSpace(
        { id: 'sp1', name: 'My Space', createdBy: 'user1' },
        mockPrismaTransaction,
      );

      expect(result).toEqual(space);
      expect(mockPrismaTransaction.space.upsert).toHaveBeenCalledWith({
        where: { id: 'sp1' },
        update: {},
        create: {
          id: 'sp1',
          name: 'My Space',
          createdBy: 'user1',
        },
      });
    });

    it('should use default name when not provided', async () => {
      mockPrismaTransaction.space.upsert.mockResolvedValue({
        id: 'sp1',
        name: 'Untitled Space',
      });

      await service.createSpace(
        { id: 'sp1', createdBy: 'user1' },
        mockPrismaTransaction,
      );

      const call = mockPrismaTransaction.space.upsert.mock.calls[0][0];
      expect(call.create.name).toBe('Untitled Space');
    });

    it('should upsert (not error) when space already exists', async () => {
      const existingSpace = { id: 'sp1', name: 'Existing' };
      mockPrismaTransaction.space.upsert.mockResolvedValue(existingSpace);

      const result = await service.createSpace(
        { id: 'sp1', name: 'New Name', createdBy: 'user1' },
        mockPrismaTransaction,
      );

      expect(result).toEqual(existingSpace);
    });

    it('should propagate database errors', async () => {
      mockPrismaTransaction.space.upsert.mockRejectedValue(new Error('DB error'));

      await expect(
        service.createSpace(
          { id: 'sp1', createdBy: 'user1' },
          mockPrismaTransaction,
        ),
      ).rejects.toThrow('DB error');
    });
  });
});
