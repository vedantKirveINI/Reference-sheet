export const ADDRESS_KEY_MAPPING = [
  "fullName",
  "addressLineOne",
  "addressLineTwo",
  "zipCode",
  "city",
  "state",
  "country",
] as const;

export const IGNORE_FIELD = ["questionAlignment", "required"] as const;

export interface AddressData {
  fullName?: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
}

export function validateAndParseAddress(value: any): {
  isValid: boolean;
  parsedValue: AddressData | null;
} {
  if (!value) {
    return { isValid: true, parsedValue: null };
  }

  try {
    let parsedValue: AddressData;

    if (typeof value === "object" && !Array.isArray(value)) {
      parsedValue = value as AddressData;
    } else if (typeof value === "string") {
      parsedValue = JSON.parse(value);
    } else {
      return { isValid: false, parsedValue: null };
    }

    if (
      parsedValue === null ||
      (typeof parsedValue === "object" &&
        !Array.isArray(parsedValue) &&
        Object.keys(parsedValue).every((key) =>
          ADDRESS_KEY_MAPPING.includes(key as any) || IGNORE_FIELD.includes(key as any),
        ))
    ) {
      return { isValid: true, parsedValue };
    }

    return { isValid: false, parsedValue: null };
  } catch (error) {
    return { isValid: false, parsedValue: null };
  }
}

export function getAddress(
  value: AddressData | null | undefined,
): string {
  if (!value) return "";

  try {
    const addressArray = ADDRESS_KEY_MAPPING.reduce(
      (acc: string[], curr: (typeof ADDRESS_KEY_MAPPING)[number]) => {
        const currentAddress = value[curr];

        if (Boolean(currentAddress)) {
          return [...acc, currentAddress as string];
        }
        return acc;
      },
      [],
    );

    return addressArray.join(", ");
  } catch (error) {
    return "";
  }
}
