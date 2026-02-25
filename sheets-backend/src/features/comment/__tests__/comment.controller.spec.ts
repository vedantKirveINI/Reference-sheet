import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../comment.controller';
import { CommentService } from '../comment.service';
import { BadRequestException } from '@nestjs/common';

jest.mock('src/utils/token.utils', () => ({
  verifyAndExtractToken: jest.fn().mockReturnValue({
    decoded: { name: 'Test User', avatar: 'avatar.png' },
    user_id: 'u1',
  }),
}));

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: any;

  const mockCommentService = {
    createComment: jest.fn(),
    getComments: jest.fn(),
    getCommentCount: jest.fn(),
    getCommentCountsByTable: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
    addReaction: jest.fn(),
    removeReaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        { provide: CommentService, useValue: mockCommentService },
      ],
    }).compile();

    controller = module.get<CommentController>(CommentController);
    jest.clearAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment', async () => {
      const body = { tableId: 't1', recordId: 'r1', content: 'Hello' };
      const req = { headers: { token: 'valid-token' } };
      mockCommentService.createComment.mockResolvedValue({ id: 'c1' });

      const result = await controller.createComment(body, req);
      expect(result).toEqual({ id: 'c1' });
      expect(mockCommentService.createComment).toHaveBeenCalledWith({
        tableId: 't1',
        recordId: 'r1',
        content: 'Hello',
        userId: 'u1',
        userName: 'Test User',
        userAvatar: 'avatar.png',
        parentId: undefined,
      });
    });

    it('should throw when required fields missing', async () => {
      await expect(
        controller.createComment({ tableId: 't1' }, { headers: {} }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when recordId missing', async () => {
      await expect(
        controller.createComment(
          { tableId: 't1', content: 'hello' },
          { headers: {} },
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getComments', () => {
    it('should return comments list', async () => {
      mockCommentService.getComments.mockResolvedValue({
        comments: [{ id: 'c1' }],
        nextCursor: null,
      });

      const result = await controller.getComments('t1', 'r1');
      expect(result.comments).toHaveLength(1);
    });

    it('should throw when tableId missing', async () => {
      await expect(
        controller.getComments('', 'r1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when recordId missing', async () => {
      await expect(
        controller.getComments('t1', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pass limit as number', async () => {
      mockCommentService.getComments.mockResolvedValue({
        comments: [],
        nextCursor: null,
      });

      await controller.getComments('t1', 'r1', undefined, '25');
      expect(mockCommentService.getComments).toHaveBeenCalledWith(
        't1',
        'r1',
        undefined,
        25,
      );
    });
  });

  describe('getCommentCount', () => {
    it('should return count', async () => {
      mockCommentService.getCommentCount.mockResolvedValue(5);

      const result = await controller.getCommentCount('t1', 'r1');
      expect(result).toEqual({ count: 5 });
    });

    it('should throw when tableId missing', async () => {
      await expect(
        controller.getCommentCount('', 'r1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCommentCountsByTable', () => {
    it('should return counts by table', async () => {
      mockCommentService.getCommentCountsByTable.mockResolvedValue({
        r1: 3,
        r2: 1,
      });

      const result = await controller.getCommentCountsByTable('t1');
      expect(result.counts).toEqual({ r1: 3, r2: 1 });
    });

    it('should throw when tableId missing', async () => {
      await expect(
        controller.getCommentCountsByTable(''),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateComment', () => {
    it('should update a comment', async () => {
      const body = { commentId: 'c1', content: 'Updated' };
      const req = { headers: { token: 'valid-token' } };
      mockCommentService.updateComment.mockResolvedValue({
        id: 'c1',
        content: 'Updated',
      });

      const result = await controller.updateComment(body, req);
      expect(result.content).toBe('Updated');
    });

    it('should throw when commentId missing', async () => {
      await expect(
        controller.updateComment({ content: 'test' }, { headers: {} }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const req = { headers: { token: 'valid-token' } };
      mockCommentService.deleteComment.mockResolvedValue(undefined);

      const result = await controller.deleteComment('c1', req);
      expect(result).toEqual({ success: true });
    });
  });

  describe('addReaction', () => {
    it('should add reaction', async () => {
      const body = { commentId: 'c1', emoji: '👍' };
      const req = { headers: { token: 'valid-token' } };
      mockCommentService.addReaction.mockResolvedValue({ id: 'c1' });

      const result = await controller.addReaction(body, req);
      expect(result).toEqual({ id: 'c1' });
    });

    it('should throw when commentId missing', async () => {
      await expect(
        controller.addReaction({ emoji: '👍' }, { headers: {} }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when emoji missing', async () => {
      await expect(
        controller.addReaction({ commentId: 'c1' }, { headers: {} }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeReaction', () => {
    it('should remove reaction', async () => {
      const body = { commentId: 'c1', emoji: '👍' };
      const req = { headers: { token: 'valid-token' } };
      mockCommentService.removeReaction.mockResolvedValue({ id: 'c1' });

      const result = await controller.removeReaction(body, req);
      expect(result).toEqual({ id: 'c1' });
    });

    it('should throw when required fields missing', async () => {
      await expect(
        controller.removeReaction({ commentId: 'c1' }, { headers: {} }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
