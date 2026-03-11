/**
 * Utility functions for Phone Number rendering
 * Inspired by sheets project's validateAndParsePhoneNumber
 */

const ALLOWED_KEYS = ["countryCode", "phoneNumber", "countryNumber"];

/**
 * Validate and parse phone number data
 * Matches sheets repo validation logic:
 * - null is valid (empty cell)
 * - Object with only allowed keys is valid (doesn't require all keys to be present)
 * - Any other structure is invalid
 */
export function validateAndParsePhoneNumber(value: any): {
	isValid: boolean;
	parsedValue: {
		countryCode?: string;
		countryNumber?: string;
		phoneNumber?: string;
	} | null;
} {
	// Handle empty/null/undefined - these are valid (empty cell)
	if (!value || value === null || value === undefined) {
		return { isValid: true, parsedValue: null };
	}

	// If it's already an object, convert to JSON string for consistent parsing
	let jsonString: string;
	if (typeof value === "object" && !Array.isArray(value)) {
		jsonString = JSON.stringify(value);
	} else if (typeof value === "string") {
		jsonString = value;
	} else {
		// Invalid type
		return { isValid: false, parsedValue: null };
	}

	// Match sheets repo: always try to parse as JSON
	try {
		const parsedValue = JSON.parse(jsonString);

		// Null is valid (empty cell)
		if (parsedValue === null) {
			return { isValid: true, parsedValue: null };
		}

		// Check if it's a valid object with only allowed keys
		// This is the key validation: object must not be array, and all keys must be in ALLOWED_KEYS
		// Note: It does NOT require all keys to be present - just that if keys exist, they must be allowed
		if (
			typeof parsedValue === "object" &&
			!Array.isArray(parsedValue) &&
			Object.keys(parsedValue).every((key) => ALLOWED_KEYS.includes(key))
		) {
			// Valid structure - return it (even if some keys are missing, that's fine)
			return {
				isValid: true,
				parsedValue: parsedValue as {
					countryCode?: string;
					countryNumber?: string;
					phoneNumber?: string;
				},
			};
		}

		// Invalid structure (array, or has keys not in ALLOWED_KEYS)
		return { isValid: false, parsedValue: null };
	} catch (err) {
		// JSON parse failed - invalid
		return { isValid: false, parsedValue: null };
	}
}
