import { describe, it, expect } from 'vitest';
import { validateAndParsePhoneNumber, ALLOWED_PHONE_KEYS } from '../phone';

describe('ALLOWED_PHONE_KEYS', () => {
  it('contains expected keys', () => {
    expect(ALLOWED_PHONE_KEYS).toEqual(['countryCode', 'phoneNumber', 'countryNumber']);
  });
});

describe('validateAndParsePhoneNumber', () => {
  it('returns valid with null for null input', () => {
    const result = validateAndParsePhoneNumber(null);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('returns valid with null for undefined input', () => {
    const result = validateAndParsePhoneNumber(undefined);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('returns valid with null for empty string', () => {
    const result = validateAndParsePhoneNumber('');
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('validates valid phone object', () => {
    const val = { countryCode: 'US', countryNumber: '1', phoneNumber: '5551234567' };
    const result = validateAndParsePhoneNumber(val);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toEqual(val);
  });

  it('validates partial phone object', () => {
    const result = validateAndParsePhoneNumber({ phoneNumber: '5551234567' });
    expect(result.isValid).toBe(true);
    expect(result.parsedValue!.phoneNumber).toBe('5551234567');
  });

  it('validates empty object', () => {
    const result = validateAndParsePhoneNumber({});
    expect(result.isValid).toBe(true);
  });

  it('rejects object with invalid keys', () => {
    const result = validateAndParsePhoneNumber({ phoneNumber: '555', badKey: 'x' });
    expect(result.isValid).toBe(false);
  });

  it('parses valid JSON string', () => {
    const json = JSON.stringify({ countryCode: 'GB', countryNumber: '44', phoneNumber: '7911123456' });
    const result = validateAndParsePhoneNumber(json);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue!.countryNumber).toBe('44');
  });

  it('parses JSON string that is null', () => {
    const result = validateAndParsePhoneNumber('null');
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('rejects invalid JSON string', () => {
    const result = validateAndParsePhoneNumber('{bad}');
    expect(result.isValid).toBe(false);
  });

  it('rejects array input', () => {
    const result = validateAndParsePhoneNumber([1, 2]);
    expect(result.isValid).toBe(false);
  });

  it('rejects number input', () => {
    const result = validateAndParsePhoneNumber(42);
    expect(result.isValid).toBe(false);
  });

  it('rejects boolean input', () => {
    const result = validateAndParsePhoneNumber(true);
    expect(result.isValid).toBe(false);
  });

  it('handles international format JSON', () => {
    const json = JSON.stringify({ countryCode: 'IN', countryNumber: '91', phoneNumber: '9876543210' });
    const result = validateAndParsePhoneNumber(json);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue!.phoneNumber).toBe('9876543210');
  });
});
