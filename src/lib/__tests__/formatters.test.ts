import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPhoneNumber, formatAddress, formatCellValue } from '../formatters';

describe('formatCurrency', () => {
  it('formats valid currency with symbol and value', () => {
    expect(formatCurrency({ currencySymbol: '$', currencyValue: '100.00' })).toBe('$ 100.00');
  });

  it('formats currency with only currencyCode when no symbol/value', () => {
    expect(formatCurrency({ currencyCode: 'USD' })).toBe('USD');
  });

  it('formats currency with symbol only', () => {
    expect(formatCurrency({ currencySymbol: '€' })).toBe('€');
  });

  it('formats currency with value only', () => {
    expect(formatCurrency({ currencyValue: '50' })).toBe('50');
  });

  it('returns empty string for null', () => {
    expect(formatCurrency(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatCurrency(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatCurrency('')).toBe('');
  });

  it('returns empty string for invalid object with bad keys', () => {
    expect(formatCurrency({ foo: 'bar' })).toBe('');
  });

  it('handles string JSON input', () => {
    expect(formatCurrency('{"currencySymbol":"£","currencyValue":"200"}')).toBe('£ 200');
  });

  it('returns empty string for malformed JSON string', () => {
    expect(formatCurrency('{bad json}')).toBe('');
  });

  it('returns empty string for array input', () => {
    expect(formatCurrency([1, 2, 3])).toBe('');
  });

  it('returns empty string for number input', () => {
    expect(formatCurrency(42)).toBe('');
  });
});

describe('formatPhoneNumber', () => {
  it('formats phone with country number and phone number', () => {
    expect(formatPhoneNumber({ countryNumber: '1', phoneNumber: '5551234567' })).toBe('+1 5551234567');
  });

  it('formats phone with only phone number', () => {
    expect(formatPhoneNumber({ phoneNumber: '5551234567' })).toBe('5551234567');
  });

  it('formats phone with only country number', () => {
    expect(formatPhoneNumber({ countryNumber: '44' })).toBe('+44');
  });

  it('returns empty string for null', () => {
    expect(formatPhoneNumber(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatPhoneNumber(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatPhoneNumber('')).toBe('');
  });

  it('handles string JSON input', () => {
    expect(formatPhoneNumber('{"countryNumber":"91","phoneNumber":"9876543210"}')).toBe('+91 9876543210');
  });

  it('returns empty string for invalid keys', () => {
    expect(formatPhoneNumber({ foo: 'bar' })).toBe('');
  });

  it('returns empty string for malformed JSON', () => {
    expect(formatPhoneNumber('{bad}')).toBe('');
  });
});

describe('formatAddress', () => {
  it('formats full address object', () => {
    const addr = {
      fullName: 'John Doe',
      addressLineOne: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'US',
    };
    expect(formatAddress(addr)).toBe('John Doe, 123 Main St, 62701, Springfield, IL, US');
  });

  it('formats partial address', () => {
    expect(formatAddress({ city: 'NYC', state: 'NY' })).toBe('NYC, NY');
  });

  it('returns empty string for null', () => {
    expect(formatAddress(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatAddress(undefined)).toBe('');
  });

  it('returns plain string for non-JSON string', () => {
    expect(formatAddress('Just a street name')).toBe('Just a street name');
  });

  it('handles JSON string input', () => {
    const json = JSON.stringify({ fullName: 'Jane', city: 'Boston' });
    expect(formatAddress(json)).toBe('Jane, Boston');
  });

  it('returns empty for invalid JSON string starting with {', () => {
    expect(formatAddress('{bad json}')).toBe('');
  });

  it('returns empty for object with invalid keys', () => {
    expect(formatAddress({ foo: 'bar' })).toBe('');
  });

  it('returns empty string for empty object', () => {
    expect(formatAddress({})).toBe('');
  });
});

describe('formatCellValue', () => {
  it('delegates Currency type to formatCurrency', () => {
    expect(formatCellValue('Currency', { currencySymbol: '$', currencyValue: '50' })).toBe('$ 50');
  });

  it('delegates PhoneNumber type to formatPhoneNumber', () => {
    expect(formatCellValue('PhoneNumber', { countryNumber: '1', phoneNumber: '555' })).toBe('+1 555');
  });

  it('delegates Address type to formatAddress', () => {
    expect(formatCellValue('Address', { city: 'LA' })).toBe('LA');
  });

  it('returns string data as-is for unknown type', () => {
    expect(formatCellValue('SHORT_TEXT', 'hello')).toBe('hello');
  });

  it('JSON.stringifies non-string data for unknown type', () => {
    expect(formatCellValue('UNKNOWN', 42)).toBe('42');
  });

  it('handles null data for unknown type', () => {
    expect(formatCellValue('OTHER', null)).toBe('""');
  });

  it('handles undefined data for unknown type', () => {
    expect(formatCellValue('OTHER', undefined)).toBe('""');
  });

  it('handles object data for unknown type', () => {
    expect(formatCellValue('OTHER', { a: 1 })).toBe('{"a":1}');
  });

  it('handles array data for unknown type', () => {
    expect(formatCellValue('OTHER', [1, 2])).toBe('[1,2]');
  });
});
