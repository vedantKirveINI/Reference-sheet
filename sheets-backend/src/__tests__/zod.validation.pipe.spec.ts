import { BadRequestException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { z } from 'zod';
import { ZodValidationPipe } from '../zod.validation.pipe';

describe('ZodValidationPipe', () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number().min(0),
  });

  const metadata = { type: 'body' as const };

  describe('HTTP mode (isSocket=false)', () => {
    let pipe: ZodValidationPipe;

    beforeEach(() => {
      pipe = new ZodValidationPipe(testSchema, false);
    });

    it('should return parsed value on valid input', () => {
      const result = pipe.transform({ name: 'John', age: 30 }, metadata);
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should strip unknown fields', () => {
      const result = pipe.transform(
        { name: 'John', age: 30, extra: 'field' },
        metadata,
      );
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should throw BadRequestException on validation error', () => {
      expect(() => pipe.transform({ name: 123 }, metadata)).toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException with field path in message', () => {
      try {
        pipe.transform({ name: 'John', age: -1 }, metadata);
        fail('Expected error');
      } catch (e: any) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toContain('age');
      }
    });

    it('should throw BadRequestException for missing required fields', () => {
      expect(() => pipe.transform({}, metadata)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('WebSocket mode (isSocket=true)', () => {
    let pipe: ZodValidationPipe;

    beforeEach(() => {
      pipe = new ZodValidationPipe(testSchema, true);
    });

    it('should return parsed value on valid input', () => {
      const result = pipe.transform({ name: 'Jane', age: 25 }, metadata);
      expect(result).toEqual({ name: 'Jane', age: 25 });
    });

    it('should throw WsException on validation error', () => {
      expect(() => pipe.transform({ name: 123 }, metadata)).toThrow(
        WsException,
      );
    });

    it('should throw WsException for missing fields', () => {
      expect(() => pipe.transform({}, metadata)).toThrow(WsException);
    });
  });

  describe('default mode (isSocket defaults to false)', () => {
    it('should default to HTTP mode', () => {
      const pipe = new ZodValidationPipe(testSchema);
      expect(() => pipe.transform({}, metadata)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('schema without path', () => {
    it('should format error without path', () => {
      const stringSchema = z.string();
      const pipe = new ZodValidationPipe(stringSchema);

      expect(() => pipe.transform(123, metadata)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('non-Zod errors', () => {
    it('should throw BadRequestException for non-Zod errors in HTTP mode', () => {
      const badSchema = {
        parse: () => {
          throw new Error('random error');
        },
      };
      const pipe = new ZodValidationPipe(badSchema as any, false);

      expect(() => pipe.transform({}, metadata)).toThrow(
        BadRequestException,
      );
    });

    it('should throw WsException for non-Zod errors in WS mode', () => {
      const badSchema = {
        parse: () => {
          throw new Error('random error');
        },
      };
      const pipe = new ZodValidationPipe(badSchema as any, true);

      expect(() => pipe.transform({}, metadata)).toThrow(WsException);
    });
  });
});
