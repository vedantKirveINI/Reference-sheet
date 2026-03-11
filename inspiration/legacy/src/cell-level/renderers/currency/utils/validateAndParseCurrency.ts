/**
 * Validate and parse currency data
 * Inspired by sheets repo's validateAndParseCurrency
 */

const ALLOWED_KEYS = [
	"countryCode",
	"currencyCode",
	"currencySymbol",
	"currencyValue",
	"currencyDisplay",
];

export interface ParsedCurrencyValue {
	countryCode?: string;
	currencyCode: string;
	currencySymbol: string;
	currencyValue: string;
	currencyDisplay?: string;
}

export function validateAndParseCurrency(value: any): {
	isValid: boolean;
	parsedValue: ParsedCurrencyValue | null;
} {
	if (!value) {
		return { isValid: true, parsedValue: null };
	}

	// If already an object with correct structure
	if (typeof value === "object" && !Array.isArray(value) && value !== null) {
		// Check if all keys are allowed
		const keys = Object.keys(value);
		if (keys.every((key) => ALLOWED_KEYS.includes(key))) {
			return {
				isValid: true,
				parsedValue: value as ParsedCurrencyValue,
			};
		}
		return { isValid: false, parsedValue: null };
	}

	// If it's a string, try to parse as JSON
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			if (
				parsed === null ||
				(typeof parsed === "object" &&
					!Array.isArray(parsed) &&
					Object.keys(parsed).every((key) =>
						ALLOWED_KEYS.includes(key),
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
