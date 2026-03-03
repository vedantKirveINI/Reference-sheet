export const ALLOWED_PHONE_KEYS = ["countryCode", "phoneNumber", "countryNumber"];

export function validateAndParsePhoneNumber(value: any): {
  isValid: boolean;
  parsedValue: {
    countryCode?: string;
    countryNumber?: string;
    phoneNumber?: string;
  } | null;
} {
  if (!value || value === null || value === undefined) {
    return { isValid: true, parsedValue: null };
  }

  let jsonString: string;
  if (typeof value === "object" && !Array.isArray(value)) {
    jsonString = JSON.stringify(value);
  } else if (typeof value === "string") {
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
      typeof parsedValue === "object" &&
      !Array.isArray(parsedValue) &&
      Object.keys(parsedValue).every((key) => ALLOWED_PHONE_KEYS.includes(key))
    ) {
      return {
        isValid: true,
        parsedValue: parsedValue as {
          countryCode?: string;
          countryNumber?: string;
          phoneNumber?: string;
        },
      };
    }

    return { isValid: false, parsedValue: null };
  } catch (err) {
    return { isValid: false, parsedValue: null };
  }
}
