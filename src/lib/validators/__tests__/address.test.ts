import { describe, it, expect } from 'vitest';
import { validateAndParseAddress, getAddress, ADDRESS_KEY_MAPPING, IGNORE_FIELD } from '../address';

describe('ADDRESS_KEY_MAPPING', () => {
  it('contains all expected fields', () => {
    expect(ADDRESS_KEY_MAPPING).toContain('fullName');
    expect(ADDRESS_KEY_MAPPING).toContain('addressLineOne');
    expect(ADDRESS_KEY_MAPPING).toContain('addressLineTwo');
    expect(ADDRESS_KEY_MAPPING).toContain('zipCode');
    expect(ADDRESS_KEY_MAPPING).toContain('city');
    expect(ADDRESS_KEY_MAPPING).toContain('state');
    expect(ADDRESS_KEY_MAPPING).toContain('country');
    expect(ADDRESS_KEY_MAPPING.length).toBe(7);
  });
});

describe('IGNORE_FIELD', () => {
  it('contains questionAlignment and required', () => {
    expect(IGNORE_FIELD).toContain('questionAlignment');
    expect(IGNORE_FIELD).toContain('required');
  });
});

describe('validateAndParseAddress', () => {
  it('returns valid with null parsedValue for null input', () => {
    const result = validateAndParseAddress(null);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('returns valid with null parsedValue for undefined input', () => {
    const result = validateAndParseAddress(undefined);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('returns valid with null parsedValue for empty string', () => {
    const result = validateAndParseAddress('');
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('validates a full address object', () => {
    const addr = { fullName: 'John', addressLineOne: '123 Main', city: 'NYC', state: 'NY', zipCode: '10001', country: 'US' };
    const result = validateAndParseAddress(addr);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toEqual(addr);
  });

  it('validates partial address object', () => {
    const result = validateAndParseAddress({ city: 'Boston' });
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toEqual({ city: 'Boston' });
  });

  it('validates empty object', () => {
    const result = validateAndParseAddress({});
    expect(result.isValid).toBe(true);
  });

  it('validates address with ignored fields', () => {
    const result = validateAndParseAddress({ city: 'LA', questionAlignment: 'left', required: true });
    expect(result.isValid).toBe(true);
  });

  it('rejects object with invalid keys', () => {
    const result = validateAndParseAddress({ foo: 'bar', baz: 'qux' });
    expect(result.isValid).toBe(false);
    expect(result.parsedValue).toBeNull();
  });

  it('parses valid JSON string', () => {
    const json = JSON.stringify({ fullName: 'Jane', city: 'SF' });
    const result = validateAndParseAddress(json);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue!.fullName).toBe('Jane');
  });

  it('rejects invalid JSON string', () => {
    const result = validateAndParseAddress('{bad json}');
    expect(result.isValid).toBe(false);
    expect(result.parsedValue).toBeNull();
  });

  it('rejects array input', () => {
    const result = validateAndParseAddress([1, 2, 3]);
    expect(result.isValid).toBe(false);
    expect(result.parsedValue).toBeNull();
  });

  it('rejects number input', () => {
    const result = validateAndParseAddress(42);
    expect(result.isValid).toBe(false);
  });

  it('handles JSON string that parses to null', () => {
    const result = validateAndParseAddress('null');
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });
});

describe('getAddress', () => {
  it('formats full address', () => {
    const addr = {
      fullName: 'John Doe',
      addressLineOne: '123 Main St',
      addressLineTwo: 'Apt 4',
      zipCode: '62701',
      city: 'Springfield',
      state: 'IL',
      country: 'US',
    };
    expect(getAddress(addr)).toBe('John Doe, 123 Main St, Apt 4, 62701, Springfield, IL, US');
  });

  it('formats partial address', () => {
    expect(getAddress({ city: 'NYC', state: 'NY' })).toBe('NYC, NY');
  });

  it('returns empty string for null', () => {
    expect(getAddress(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(getAddress(undefined)).toBe('');
  });

  it('returns empty string for empty object', () => {
    expect(getAddress({})).toBe('');
  });

  it('skips falsy fields', () => {
    expect(getAddress({ fullName: '', city: 'Boston' })).toBe('Boston');
  });

  it('orders fields according to ADDRESS_KEY_MAPPING', () => {
    const addr = { country: 'US', fullName: 'John' };
    expect(getAddress(addr)).toBe('John, US');
  });
});
