import { BadRequestException } from '@nestjs/common';
import { CommentService } from '../comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let mockPrismaService: any;
  let mockEmitter: any;
  let mockPrismaClient: any;

  beforeEach(() => {
    mockPrismaClient = {
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn(),
    };

    mockPrismaService = {
      prismaClient: mockPrismaClient,
    };

    mockEmitter = {
      emit: jest.fn(),
      emitAsync: jest.fn(),
      onEvent: jest.fn(),
    };

    service = new CommentService(mockPrismaService, mockEmitter);
    (service as any).commentTableReady = true;
  });

  describe('ensureCommentTable', () => {
    it('should skip if table already ready', async () => {
      await service.ensureCommentTable(mockPrismaClient);
      expect(mockPrismaClient.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it('should create table if not exists', async () => {
      (service as any).commentTableReady = false;
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([]);
      mockPrismaClient.$executeRawUnsafe.mockResolvedValue(undefined);

      await service.ensureCommentTable(mockPrismaClient);
      expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalled();
      expect((service as any).commentTableReady).toBe(true);
    });

    it('should drop and recreate table if table_id column has integer type', async () => {
      (service as any).commentTableReady = false;
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([{ table_name: '__comments' }])
        .mockResolvedValueOnce([{ column_name: 'table_id', data_type: 'integer' }]);
      mockPrismaClient.$executeRawUnsafe.mockResolvedValue(undefined);

      await service.ensureCommentTable(mockPrismaClient);
      expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('DROP TABLE'),
      );
    });
  });

  describe('createComment', () => {
    it('should create a comment and emit event', async () => {
      const comment = {
        id: 'c1',
        table_id: 't1',
        record_id: 'r1',
        content: 'Hello',
        user_id: 'u1',
      };
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([comment]);

      const result = await service.createComment({
        tableId: 't1',
        recordId: 'r1',
        content: 'Hello',
        userId: 'u1',
      });

      expect(result).toEqual(comment);
      expect(mockEmitter.emit).toHaveBeenCalledWith('comment.created', {
        tableId: 't1',
        recordId: 'r1',
        comment,
      });
    });

    it('should throw when content is empty', async () => {
      await expect(
        service.createComment({
          tableId: 't1',
          recordId: 'r1',
          content: '',
          userId: 'u1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when content is whitespace only', async () => {
      await expect(
        service.createComment({
          tableId: 't1',
          recordId: 'r1',
          content: '   ',
          userId: 'u1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should include parentId when provided', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([{ id: 'c1' }]);

      await service.createComment({
        tableId: 't1',
        recordId: 'r1',
        content: 'Reply',
        userId: 'u1',
        parentId: 'c0',
      });

      const query = mockPrismaClient.$queryRawUnsafe.mock.calls[0][0];
      expect(query).toContain('$5');
    });

    it('should include userName and userAvatar when provided', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([{ id: 'c1' }]);

      await service.createComment({
        tableId: 't1',
        recordId: 'r1',
        content: 'Hello',
        userId: 'u1',
        userName: 'John',
        userAvatar: 'avatar.png',
      });

      const params = mockPrismaClient.$queryRawUnsafe.mock.calls[0];
      expect(params).toContain('John');
      expect(params).toContain('avatar.png');
    });
  });

  describe('getComments', () => {
    it('should return comments with pagination', async () => {
      const comments = [{ id: 'c1' }, { id: 'c2' }];
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue(comments);

      const result = await service.getComments('t1', 'r1');
      expect(result.comments).toEqual(comments);
      expect(result.nextCursor).toBeNull();
    });

    it('should return nextCursor when more results exist', async () => {
      const comments = Array.from({ length: 51 }, (_, i) => ({
        id: `c${i}`,
      }));
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue(comments);

      const result = await service.getComments('t1', 'r1', undefined, 50);
      expect(result.comments).toHaveLength(50);
      expect(result.nextCursor).toBe('c50');
    });

    it('should support cursor-based pagination', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([]);

      await service.getComments('t1', 'r1', 'cursor-id');
      const query = mockPrismaClient.$queryRawUnsafe.mock.calls[0][0];
      expect(query).toContain('$4');
    });
  });

  describe('getCommentCount', () => {
    it('should return count for record', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([{ count: 5 }]);

      const result = await service.getCommentCount('t1', 'r1');
      expect(result).toBe(5);
    });

    it('should return 0 when no comments', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([{ count: 0 }]);

      const result = await service.getCommentCount('t1', 'r1');
      expect(result).toBe(0);
    });
  });

  describe('getCommentCountsByTable', () => {
    it('should return counts grouped by record', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([
        { record_id: 'r1', count: 3 },
        { record_id: 'r2', count: 1 },
      ]);

      const result = await service.getCommentCountsByTable('t1');
      expect(result).toEqual({ r1: 3, r2: 1 });
    });

    it('should return empty object when no comments', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.getCommentCountsByTable('t1');
      expect(result).toEqual({});
    });
  });

  describe('updateComment', () => {
    it('should update comment content', async () => {
      const existing = [{ id: 'c1', user_id: 'u1', content: 'old' }];
      const updated = [{ id: 'c1', user_id: 'u1', content: 'new', table_id: 't1', record_id: 'r1' }];
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);

      const result = await service.updateComment({
        commentId: 'c1',
        content: 'new',
        userId: 'u1',
      });
      expect(result.content).toBe('new');
      expect(mockEmitter.emit).toHaveBeenCalledWith('comment.updated', expect.anything());
    });

    it('should throw when comment not found', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([]);

      await expect(
        service.updateComment({
          commentId: 'c999',
          content: 'new',
          userId: 'u1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when user is not the author', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([
        { id: 'c1', user_id: 'u1' },
      ]);

      await expect(
        service.updateComment({
          commentId: 'c1',
          content: 'new',
          userId: 'u2',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteComment', () => {
    it('should soft delete comment', async () => {
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([
          { id: 'c1', user_id: 'u1', table_id: 't1', record_id: 'r1' },
        ])
        .mockResolvedValueOnce(undefined);

      await service.deleteComment('c1', 'u1');
      expect(mockEmitter.emit).toHaveBeenCalledWith('comment.deleted', {
        tableId: 't1',
        recordId: 'r1',
        commentId: 'c1',
      });
    });

    it('should throw when comment not found', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([]);

      await expect(service.deleteComment('c999', 'u1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw when user is not the author', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([
        { id: 'c1', user_id: 'u1' },
      ]);

      await expect(service.deleteComment('c1', 'u2')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addReaction', () => {
    it('should add reaction to comment', async () => {
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([{ id: 'c1', reactions: {} }])
        .mockResolvedValueOnce([{ id: 'c1', reactions: { '👍': ['u1'] } }]);

      const result = await service.addReaction('c1', 'u1', '👍');
      expect(result.reactions).toEqual({ '👍': ['u1'] });
    });

    it('should not duplicate user in reaction', async () => {
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([{ id: 'c1', reactions: { '👍': ['u1'] } }])
        .mockResolvedValueOnce([{ id: 'c1', reactions: { '👍': ['u1'] } }]);

      await service.addReaction('c1', 'u1', '👍');
      const updateCall = mockPrismaClient.$queryRawUnsafe.mock.calls[1];
      const reactionsArg = JSON.parse(updateCall[1]);
      expect(reactionsArg['👍']).toEqual(['u1']);
    });

    it('should throw when comment not found', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([]);

      await expect(service.addReaction('c999', 'u1', '👍')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeReaction', () => {
    it('should remove user from reaction', async () => {
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([{ id: 'c1', reactions: { '👍': ['u1', 'u2'] } }])
        .mockResolvedValueOnce([{ id: 'c1', reactions: { '👍': ['u2'] } }]);

      const result = await service.removeReaction('c1', 'u1', '👍');
      expect(result).toBeDefined();
    });

    it('should remove emoji key when last user removed', async () => {
      mockPrismaClient.$queryRawUnsafe
        .mockResolvedValueOnce([{ id: 'c1', reactions: { '👍': ['u1'] } }])
        .mockResolvedValueOnce([{ id: 'c1', reactions: {} }]);

      await service.removeReaction('c1', 'u1', '👍');
      const updateCall = mockPrismaClient.$queryRawUnsafe.mock.calls[1];
      const reactionsArg = JSON.parse(updateCall[1]);
      expect(reactionsArg).toEqual({});
    });

    it('should throw when comment not found', async () => {
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([]);

      await expect(
        service.removeReaction('c999', 'u1', '👍'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
