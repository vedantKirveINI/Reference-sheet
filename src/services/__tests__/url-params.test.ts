import { describe, it, expect } from 'vitest';
import { encodeParams, decodeParams } from '../url-params';

describe('encodeParams', () => {
  it('encodes object to base64 string', () => {
    const data = { sheetId: '123', tableId: '456' };
    const result = encodeParams(data);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('encodes string data', () => {
    const result = encodeParams('hello');
    expect(typeof result).toBe('string');
  });

  it('encodes number data', () => {
    const result = encodeParams(42);
    expect(typeof result).toBe('string');
  });

  it('encodes null data', () => {
    const result = encodeParams(null);
    expect(typeof result).toBe('string');
  });

  it('encodes array data', () => {
    const result = encodeParams([1, 2, 3]);
    expect(typeof result).toBe('string');
  });
});

describe('decodeParams', () => {
  it('decodes base64 string back to object', () => {
    const data = { sheetId: '123', tableId: '456' };
    const encoded = encodeParams(data);
    const decoded = decodeParams(encoded);
    expect(decoded).toEqual(data);
  });

  it('returns empty object for invalid base64', () => {
    const result = decodeParams('not-valid-base64!!!');
    expect(result).toEqual({});
  });

  it('returns empty object for empty string', () => {
    const result = decodeParams('');
    expect(result).toEqual({});
  });

  it('returns empty object for undefined', () => {
    const result = decodeParams(undefined as any);
    expect(result).toEqual({});
  });

  it('round-trips complex data', () => {
    const data = { nested: { a: 1, b: [2, 3] }, str: 'hello' };
    const encoded = encodeParams(data);
    const decoded = decodeParams(encoded);
    expect(decoded).toEqual(data);
  });

  it('round-trips number', () => {
    const encoded = encodeParams(42);
    const decoded = decodeParams<number>(encoded);
    expect(decoded).toBe(42);
  });
});
