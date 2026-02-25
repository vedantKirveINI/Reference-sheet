import { describe, it, expect } from 'vitest';
import {
  ENRICHMENT_TYPES,
  getEnrichmentTypeByKey,
  ENRICHMENT_TYPE_OPTIONS,
} from '../enrichment-mapping';

describe('ENRICHMENT_TYPES', () => {
  it('has 3 enrichment types', () => {
    expect(ENRICHMENT_TYPES.length).toBe(3);
  });

  it('has company type', () => {
    const company = ENRICHMENT_TYPES.find(t => t.key === 'company');
    expect(company).toBeDefined();
    expect(company!.label).toBe('Find Company Details');
    expect(company!.inputFields.length).toBe(1);
    expect(company!.inputFields[0].key).toBe('domain');
    expect(company!.inputFields[0].required).toBe(true);
    expect(company!.outputFields.length).toBeGreaterThan(5);
  });

  it('has person type', () => {
    const person = ENRICHMENT_TYPES.find(t => t.key === 'person');
    expect(person).toBeDefined();
    expect(person!.label).toBe('Discover Contact Info');
    expect(person!.inputFields.length).toBe(3);
    expect(person!.inputFields[0].key).toBe('name');
    expect(person!.inputFields[1].key).toBe('domain');
    expect(person!.inputFields[2].key).toBe('linkedinUrl');
    expect(person!.inputFields[2].required).toBe(false);
  });

  it('has email type', () => {
    const email = ENRICHMENT_TYPES.find(t => t.key === 'email');
    expect(email).toBeDefined();
    expect(email!.label).toBe('Find Email Addresses');
    expect(email!.inputFields.length).toBe(2);
    expect(email!.outputFields.length).toBe(1);
    expect(email!.outputFields[0].key).toBe('validEmail');
  });

  it('all types have key, label, subtitle, description', () => {
    ENRICHMENT_TYPES.forEach(t => {
      expect(t.key).toBeTruthy();
      expect(t.label).toBeTruthy();
      expect(t.subtitle).toBeTruthy();
      expect(t.description).toBeTruthy();
    });
  });

  it('all input fields have required properties', () => {
    ENRICHMENT_TYPES.forEach(t => {
      t.inputFields.forEach(f => {
        expect(f.key).toBeTruthy();
        expect(f.name).toBeTruthy();
        expect(f.label).toBeTruthy();
        expect(f.type).toBeTruthy();
        expect(typeof f.required).toBe('boolean');
        expect(f.description).toBeTruthy();
      });
    });
  });

  it('all output fields have required properties', () => {
    ENRICHMENT_TYPES.forEach(t => {
      t.outputFields.forEach(f => {
        expect(f.key).toBeTruthy();
        expect(f.name).toBeTruthy();
        expect(f.type).toBeTruthy();
        expect(f.description).toBeTruthy();
      });
    });
  });

  it('company output fields include name, website, industry, location', () => {
    const company = ENRICHMENT_TYPES.find(t => t.key === 'company')!;
    const outputKeys = company.outputFields.map(f => f.key);
    expect(outputKeys).toContain('name');
    expect(outputKeys).toContain('website');
    expect(outputKeys).toContain('industry');
    expect(outputKeys).toContain('location');
  });
});

describe('getEnrichmentTypeByKey', () => {
  it('returns company type', () => {
    const result = getEnrichmentTypeByKey('company');
    expect(result).toBeDefined();
    expect(result!.key).toBe('company');
  });

  it('returns person type', () => {
    const result = getEnrichmentTypeByKey('person');
    expect(result).toBeDefined();
    expect(result!.key).toBe('person');
  });

  it('returns email type', () => {
    const result = getEnrichmentTypeByKey('email');
    expect(result).toBeDefined();
    expect(result!.key).toBe('email');
  });

  it('returns undefined for unknown key', () => {
    expect(getEnrichmentTypeByKey('unknown')).toBeUndefined();
  });

  it('returns undefined for empty key', () => {
    expect(getEnrichmentTypeByKey('')).toBeUndefined();
  });
});

describe('ENRICHMENT_TYPE_OPTIONS', () => {
  it('has same length as ENRICHMENT_TYPES', () => {
    expect(ENRICHMENT_TYPE_OPTIONS.length).toBe(ENRICHMENT_TYPES.length);
  });

  it('each option has key, label, description', () => {
    ENRICHMENT_TYPE_OPTIONS.forEach(opt => {
      expect(opt.key).toBeTruthy();
      expect(opt.label).toBeTruthy();
      expect(opt.description).toBeTruthy();
    });
  });

  it('keys match ENRICHMENT_TYPES keys', () => {
    const keys = ENRICHMENT_TYPE_OPTIONS.map(o => o.key);
    const typeKeys = ENRICHMENT_TYPES.map(t => t.key);
    expect(keys).toEqual(typeKeys);
  });
});
