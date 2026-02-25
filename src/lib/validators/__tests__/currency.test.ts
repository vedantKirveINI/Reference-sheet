import { describe, it, expect } from 'vitest';
import { validateAndParseCurrency, ALLOWED_CURRENCY_KEYS } from '../currency';

describe('ALLOWED_CURRENCY_KEYS', () => {
  it('contains expected keys', () => {
    expect(ALLOWED_CURRENCY_KEYS).toEqual([
      'countryCode', 'currencyCode', 'currencySymbol', 'currencyValue', 'currencyDisplay',
    ]);
  });
});

describe('validateAndParseCurrency', () => {
  it('returns valid with null for null input', () => {
    const result = validateAndParseCurrency(null);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('returns valid with null for undefined input', () => {
    const result = validateAndParseCurrency(undefined);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('returns valid with null for empty string', () => {
    const result = validateAndParseCurrency('');
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('validates a valid currency object', () => {
    const val = { countryCode: 'US', currencyCode: 'USD', currencySymbol: '$', currencyValue: '100' };
    const result = validateAndParseCurrency(val);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toEqual(val);
  });

  it('validates object with subset of allowed keys', () => {
    const result = validateAndParseCurrency({ currencyCode: 'EUR' });
    expect(result.isValid).toBe(true);
    expect(result.parsedValue!.currencyCode).toBe('EUR');
  });

  it('validates empty object', () => {
    const result = validateAndParseCurrency({});
    expect(result.isValid).toBe(true);
  });

  it('rejects object with unknown keys', () => {
    const result = validateAndParseCurrency({ currencyCode: 'USD', badKey: 'x' });
    expect(result.isValid).toBe(false);
    expect(result.parsedValue).toBeNull();
  });

  it('parses valid JSON string', () => {
    const json = JSON.stringify({ currencySymbol: '£', currencyValue: '50' });
    const result = validateAndParseCurrency(json);
    expect(result.isValid).toBe(true);
    expect(result.parsedValue!.currencySymbol).toBe('£');
  });

  it('parses JSON string that is null', () => {
    const result = validateAndParseCurrency('null');
    expect(result.isValid).toBe(true);
    expect(result.parsedValue).toBeNull();
  });

  it('rejects invalid JSON string', () => {
    const result = validateAndParseCurrency('{bad}');
    expect(result.isValid).toBe(false);
    expect(result.parsedValue).toBeNull();
  });

  it('rejects JSON string with invalid keys', () => {
    const result = validateAndParseCurrency(JSON.stringify({ foo: 'bar' }));
    expect(result.isValid).toBe(false);
  });

  it('rejects array input', () => {
    const result = validateAndParseCurrency([1, 2]);
    expect(result.isValid).toBe(false);
  });

  it('rejects number input', () => {
    const result = validateAndParseCurrency(42);
    expect(result.isValid).toBe(false);
  });

  it('rejects boolean input', () => {
    const result = validateAndParseCurrency(true);
    expect(result.isValid).toBe(false);
  });

  it('validates object with currencyDisplay key', () => {
    const result = validateAndParseCurrency({ currencyDisplay: 'USD 100' });
    expect(result.isValid).toBe(true);
  });
});
