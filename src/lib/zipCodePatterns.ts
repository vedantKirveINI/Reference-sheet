/**
 * Zip code pattern metadata (ported from legacy zipCodePatterns)
 */

export interface ZipCodePattern {
  pattern: string;
  formatChars: Record<string, string>;
}

export const ZIP_CODE_PATTERNS: Record<string, ZipCodePattern> = {
  US: { pattern: '99999', formatChars: { '9': '[0-9]' } },
  CA: { pattern: 'A9A 9A9', formatChars: { A: '[A-Za-z]', '9': '[0-9]' } },
  GB: { pattern: 'A9 9AA', formatChars: { A: '[A-Za-z]', '9': '[0-9]' } },
  DE: { pattern: '99999', formatChars: { '9': '[0-9]' } },
  FR: { pattern: '99999', formatChars: { '9': '[0-9]' } },
  IN: { pattern: '999999', formatChars: { '9': '[0-9]' } },
  AU: { pattern: '9999', formatChars: { '9': '[0-9]' } },
  JP: { pattern: '999-9999', formatChars: { '9': '[0-9]' } },
  BR: { pattern: '99999999', formatChars: { '9': '[0-9]' } },
  RU: { pattern: '999999', formatChars: { '9': '[0-9]' } },
  IR: { pattern: '9999999999', formatChars: { '9': '[0-9]' } },
};

export const DEFAULT_ZIP_CODE_PATTERN: ZipCodePattern = {
  pattern: '9999999999',
  formatChars: { '9': '[A-Za-z0-9]' },
};

export function getZipCodePattern(countryCode?: string): ZipCodePattern {
  if (!countryCode) {
    return DEFAULT_ZIP_CODE_PATTERN;
  }
  const normalizedCode = countryCode.toUpperCase();
  return ZIP_CODE_PATTERNS[normalizedCode] ?? DEFAULT_ZIP_CODE_PATTERN;
}

/** Placeholder string for input (e.g. "99999" -> "00000", "A9 9AA" -> "A0 0AA") */
export function getZipCodePlaceholder(countryCode?: string): string {
  const { pattern } = getZipCodePattern(countryCode);
  return pattern
    .replace(/9/g, '0')
    .replace(/A/g, 'A')
    .replace(/-/g, '-')
    .replace(/\s+/g, ' ');
}
