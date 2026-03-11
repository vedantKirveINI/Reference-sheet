export const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateAndParseEmail(
  value: any,
): { isValid: boolean; parsedValue: string | null } {
  if (value === null || value === undefined) {
    return { isValid: true, parsedValue: null };
  }

  const str = String(value).trim();

  if (!str) {
    return { isValid: true, parsedValue: null };
  }

  if (EMAIL_REGEX.test(str)) {
    return { isValid: true, parsedValue: str };
  }

  return { isValid: false, parsedValue: null };
}

