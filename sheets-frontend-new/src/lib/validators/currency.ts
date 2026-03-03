export const ALLOWED_CURRENCY_KEYS = [
  "countryCode",
  "currencyCode",
  "currencySymbol",
  "currencyValue",
  "currencyDisplay",
];

export interface ParsedCurrencyValue {
  countryCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  currencyValue?: string;
  currencyDisplay?: string;
}

export function validateAndParseCurrency(value: any): {
  isValid: boolean;
  parsedValue: ParsedCurrencyValue | null;
} {
  if (!value) {
    return { isValid: true, parsedValue: null };
  }

  if (typeof value === "object" && !Array.isArray(value) && value !== null) {
    const keys = Object.keys(value);
    if (keys.every((key) => ALLOWED_CURRENCY_KEYS.includes(key))) {
      return {
        isValid: true,
        parsedValue: value as ParsedCurrencyValue,
      };
    }
    return { isValid: false, parsedValue: null };
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (
        parsed === null ||
        (typeof parsed === "object" &&
          !Array.isArray(parsed) &&
          Object.keys(parsed).every((key) =>
            ALLOWED_CURRENCY_KEYS.includes(key),
          ))
      ) {
        return {
          isValid: true,
          parsedValue: parsed as ParsedCurrencyValue | null,
        };
      }
      return { isValid: false, parsedValue: null };
    } catch (error) {
      return { isValid: false, parsedValue: null };
    }
  }

  return { isValid: false, parsedValue: null };
}
