export type YesNoValue = 'Yes' | 'No';

export type ParsedYesNo = {
  /** True when the input was non-empty (not null/undefined/''). */
  isPresent: boolean;
  /** True when the input is exactly 'Yes' or 'No'. */
  isValid: boolean;
  /** Normalized value when valid, else null. */
  normalized: YesNoValue | null;
  /** Raw string value (best-effort) for error display. */
  raw: string;
};

export function validateAndParseYesNo(value: unknown): ParsedYesNo {
  if (value === null || value === undefined || value === '') {
    return { isPresent: false, isValid: true, normalized: null, raw: '' };
  }

  const raw = typeof value === 'string' ? value : String(value);
  if (raw === 'Yes') return { isPresent: true, isValid: true, normalized: 'Yes', raw };
  if (raw === 'No') return { isPresent: true, isValid: true, normalized: 'No', raw };
  return { isPresent: true, isValid: false, normalized: null, raw };
}

