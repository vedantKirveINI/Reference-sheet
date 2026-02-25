import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  verifyAndExtractToken,
  extractUserIdFromToken,
} from '../token.utils';

describe('token.utils', () => {
  const HS_SECRET = 'hockeystick';
  const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

  describe('verifyAndExtractToken', () => {
    it('should verify HS256 token and extract user_id from sub', () => {
      const token = jwt.sign({ sub: 'user-123' }, HS_SECRET, {
        algorithm: 'HS256',
      });

      const result = verifyAndExtractToken(token);
      expect(result.user_id).toBe('user-123');
      expect(result.decoded).toBeDefined();
      expect(result.decoded.sub).toBe('user-123');
    });

    it('should extract user_id from user_id field', () => {
      const token = jwt.sign({ user_id: 'uid-456' }, HS_SECRET, {
        algorithm: 'HS256',
      });

      const result = verifyAndExtractToken(token);
      expect(result.user_id).toBe('uid-456');
    });

    it('should extract user_id from id field', () => {
      const token = jwt.sign({ id: 'id-789' }, HS_SECRET, {
        algorithm: 'HS256',
      });

      const result = verifyAndExtractToken(token);
      expect(result.user_id).toBe('id-789');
    });

    it('should fallback to anonymous when no user fields', () => {
      const token = jwt.sign({ data: 'test' }, HS_SECRET, {
        algorithm: 'HS256',
      });

      const result = verifyAndExtractToken(token);
      expect(result.user_id).toBe('anonymous');
    });

    it('should verify HS384 token', () => {
      const token = jwt.sign({ sub: 'user-hs384' }, HS_SECRET, {
        algorithm: 'HS384',
      });

      const result = verifyAndExtractToken(token);
      expect(result.user_id).toBe('user-hs384');
    });

    it('should throw UnauthorizedException for invalid token', () => {
      expect(() => verifyAndExtractToken('invalid.token.string')).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', () => {
      const token = jwt.sign({ sub: 'u1' }, HS_SECRET, {
        algorithm: 'HS256',
        expiresIn: '-1s',
      });

      expect(() => verifyAndExtractToken(token)).toThrow(
        UnauthorizedException,
      );
    });

    it('should prioritize sub over user_id over id', () => {
      const token = jwt.sign(
        { sub: 'sub-user', user_id: 'uid-user', id: 'id-user' },
        HS_SECRET,
        { algorithm: 'HS256' },
      );

      const result = verifyAndExtractToken(token);
      expect(result.user_id).toBe('sub-user');
    });
  });

  describe('extractUserIdFromToken', () => {
    it('should return user_id from token', () => {
      const token = jwt.sign({ sub: 'user-abc' }, HS_SECRET, {
        algorithm: 'HS256',
      });

      const userId = extractUserIdFromToken(token);
      expect(userId).toBe('user-abc');
    });

    it('should throw for invalid token', () => {
      expect(() => extractUserIdFromToken('bad-token')).toThrow(
        UnauthorizedException,
      );
    });
  });
});
