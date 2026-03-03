/**
 * Zip code validation and parsing (ported from legacy zipCodeUtils)
 */

const ALLOWED_KEYS = ['countryCode', 'zipCode'];

export interface ParsedZipCodeValue {
  countryCode: string;
  zipCode: string;
}

export function validateAndParseZipCode(value: unknown): {
  isValid: boolean;
  parsedValue: ParsedZipCodeValue | null;
} {
  if (value === null || value === undefined) {
    return { isValid: true, parsedValue: null };
  }

  let jsonString: string;
  if (typeof value === 'object' && !Array.isArray(value)) {
    jsonString = JSON.stringify(value);
  } else if (typeof value === 'string') {
    jsonString = value;
  } else {
    return { isValid: false, parsedValue: null };
  }

  try {
    const parsedValue = JSON.parse(jsonString);

    if (parsedValue === null) {
      return { isValid: true, parsedValue: null };
    }

    if (
      typeof parsedValue === 'object' &&
      !Array.isArray(parsedValue) &&
      Object.keys(parsedValue).every((key) => ALLOWED_KEYS.includes(key))
    ) {
      const hasValidTypes =
        (parsedValue.countryCode === undefined ||
          typeof parsedValue.countryCode === 'string') &&
        (parsedValue.zipCode === undefined ||
          typeof parsedValue.zipCode === 'string');

      if (hasValidTypes) {
        return {
          isValid: true,
          parsedValue: parsedValue as ParsedZipCodeValue,
        };
      }
    }

    return { isValid: false, parsedValue: null };
  } catch {
    return { isValid: false, parsedValue: null };
  }
}
