import { UnauthorizedException } from '@nestjs/common';
import { ApiTokenCheckMiddleware } from '../api-token-check.middleware';
import * as tokenUtils from '../../utils/token.utils';

jest.mock('../../utils/token.utils');

describe('ApiTokenCheckMiddleware', () => {
  let middleware: ApiTokenCheckMiddleware;
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new ApiTokenCheckMiddleware();
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if no token provided', () => {
    mockReq = { headers: {} };

    expect(() => middleware.use(mockReq, mockRes, mockNext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    mockReq = { headers: { token: 'invalid-token' } };
    (tokenUtils.verifyAndExtractToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => middleware.use(mockReq, mockRes, mockNext)).toThrow(
      UnauthorizedException,
    );
  });

  it('should call next on valid token', () => {
    mockReq = {
      headers: { token: 'valid-token' },
      method: 'GET',
      query: {},
    };
    (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
      decoded: { sub: 'user-1' },
      user_id: 'user-1',
    });

    middleware.use(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle array token header', () => {
    mockReq = {
      headers: { token: ['token-1', 'token-2'] },
      method: 'GET',
      query: {},
    };
    (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
      decoded: { sub: 'user-1' },
      user_id: 'user-1',
    });

    middleware.use(mockReq, mockRes, mockNext);
    expect(tokenUtils.verifyAndExtractToken).toHaveBeenCalledWith('token-1');
  });

  describe('mergeValueInBody', () => {
    it('should merge user_id into POST body', () => {
      mockReq = {
        headers: { token: 'valid' },
        method: 'POST',
        body: { data: 'test' },
      };
      (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
        decoded: { sub: 'u1' },
        user_id: 'u1',
      });

      middleware.use(mockReq, mockRes, mockNext);
      expect(mockReq.body.user_id).toBe('u1');
    });

    it('should create body if none exists for POST', () => {
      mockReq = {
        headers: { token: 'valid' },
        method: 'POST',
        body: null,
      };
      (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
        decoded: {},
        user_id: 'u1',
      });

      middleware.use(mockReq, mockRes, mockNext);
      expect(mockReq.body).toEqual({ user_id: 'u1' });
    });

    it('should merge user_id into GET query', () => {
      mockReq = {
        headers: { token: 'valid' },
        method: 'GET',
        query: { page: '1' },
      };
      (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
        decoded: {},
        user_id: 'u1',
      });

      middleware.use(mockReq, mockRes, mockNext);
      expect(mockReq.query.user_id).toBe('u1');
    });

    it('should create query if none exists for GET', () => {
      mockReq = {
        headers: { token: 'valid' },
        method: 'GET',
        query: null,
      };
      (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
        decoded: {},
        user_id: 'u1',
      });

      middleware.use(mockReq, mockRes, mockNext);
      expect(mockReq.query).toEqual({ user_id: 'u1' });
    });

    it('should merge user_id into DELETE query', () => {
      mockReq = {
        headers: { token: 'valid' },
        method: 'DELETE',
        query: {},
      };
      (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
        decoded: {},
        user_id: 'u1',
      });

      middleware.use(mockReq, mockRes, mockNext);
      expect(mockReq.query.user_id).toBe('u1');
    });

    it('should merge user_id into PUT body', () => {
      mockReq = {
        headers: { token: 'valid' },
        method: 'PUT',
        body: {},
      };
      (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
        decoded: {},
        user_id: 'u1',
      });

      middleware.use(mockReq, mockRes, mockNext);
      expect(mockReq.body.user_id).toBe('u1');
    });
  });

  describe('mergeValueInHeaders', () => {
    it('should set decoded-token header', () => {
      const decoded = { sub: 'u1', role: 'admin' };
      mockReq = {
        headers: { token: 'valid' },
        method: 'GET',
        query: {},
      };
      (tokenUtils.verifyAndExtractToken as jest.Mock).mockReturnValue({
        decoded,
        user_id: 'u1',
      });

      middleware.use(mockReq, mockRes, mockNext);
      expect(mockReq.headers['decoded-token']).toBe(decoded);
    });
  });
});
