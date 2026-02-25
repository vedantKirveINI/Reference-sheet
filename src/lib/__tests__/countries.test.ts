import { describe, it, expect } from 'vitest';
import { COUNTRIES, getCountry, getAllCountryCodes, getFlagUrl } from '../countries';

describe('COUNTRIES', () => {
  it('contains US entry', () => {
    expect(COUNTRIES.US).toBeDefined();
    expect(COUNTRIES.US.countryName).toBe('United States');
    expect(COUNTRIES.US.countryNumber).toBe('1');
    expect(COUNTRIES.US.currencyCode).toBe('USD');
    expect(COUNTRIES.US.currencySymbol).toBe('$');
  });

  it('contains IN entry', () => {
    expect(COUNTRIES.IN).toBeDefined();
    expect(COUNTRIES.IN.countryName).toBe('India');
    expect(COUNTRIES.IN.currencySymbol).toBe('₹');
  });

  it('contains GB entry', () => {
    expect(COUNTRIES.GB.countryName).toBe('United Kingdom');
    expect(COUNTRIES.GB.currencyCode).toBe('GBP');
  });

  it('has pattern for US', () => {
    expect(COUNTRIES.US.pattern).toBe('(999) 999-9999');
  });

  it('countries without currency fields', () => {
    expect(COUNTRIES.KR.currencyCode).toBeUndefined();
    expect(COUNTRIES.KR.currencySymbol).toBeUndefined();
  });
});

describe('getCountry', () => {
  it('returns country for valid code', () => {
    const country = getCountry('US');
    expect(country).toBeDefined();
    expect(country!.countryName).toBe('United States');
  });

  it('returns country for lowercase code', () => {
    const country = getCountry('us');
    expect(country).toBeDefined();
    expect(country!.countryCode).toBe('US');
  });

  it('returns country for mixed case', () => {
    const country = getCountry('gB');
    expect(country).toBeDefined();
    expect(country!.countryName).toBe('United Kingdom');
  });

  it('returns undefined for invalid code', () => {
    expect(getCountry('XX')).toBeUndefined();
  });

  it('returns undefined for empty string', () => {
    expect(getCountry('')).toBeUndefined();
  });

  it('returns undefined for null-like input', () => {
    expect(getCountry(null as any)).toBeUndefined();
    expect(getCountry(undefined as any)).toBeUndefined();
  });
});

describe('getAllCountryCodes', () => {
  it('returns an array of strings', () => {
    const codes = getAllCountryCodes();
    expect(Array.isArray(codes)).toBe(true);
    expect(codes.length).toBeGreaterThan(0);
  });

  it('includes US, GB, IN', () => {
    const codes = getAllCountryCodes();
    expect(codes).toContain('US');
    expect(codes).toContain('GB');
    expect(codes).toContain('IN');
  });

  it('matches the keys of COUNTRIES', () => {
    const codes = getAllCountryCodes();
    expect(codes).toEqual(Object.keys(COUNTRIES));
  });
});

describe('getFlagUrl', () => {
  it('generates correct URL for US', () => {
    expect(getFlagUrl('US')).toBe('https://flagcdn.com/256x192/us.png');
  });

  it('generates correct URL for lowercase input', () => {
    expect(getFlagUrl('gb')).toBe('https://flagcdn.com/256x192/gb.png');
  });

  it('returns empty string for empty input', () => {
    expect(getFlagUrl('')).toBe('');
  });

  it('generates URL for any code', () => {
    expect(getFlagUrl('DE')).toBe('https://flagcdn.com/256x192/de.png');
  });
});
