/**
 * Utility helpers for Zip Code renderer/editor
 */

const ALLOWED_KEYS = ["countryCode", "zipCode"];

export interface ParsedZipCodeValue {
	countryCode: string;
	zipCode: string;
}

export const validateAndParseZipCode = (
	value: unknown,
): {
	isValid: boolean;
	parsedValue: ParsedZipCodeValue | null;
} => {
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
		if (
			typeof parsedValue === "object" &&
			!Array.isArray(parsedValue) &&
			Object.keys(parsedValue).every((key) => ALLOWED_KEYS.includes(key))
		) {
			// Valid structure - but also check that if keys exist, they are the right type
			// This matches sheets repo behavior: structure must be valid
			const hasValidTypes =
				(parsedValue.countryCode === undefined ||
					typeof parsedValue.countryCode === "string") &&
				(parsedValue.zipCode === undefined ||
					typeof parsedValue.zipCode === "string");

			if (hasValidTypes) {
				return {
					isValid: true,
					parsedValue: parsedValue as ParsedZipCodeValue,
				};
			}
		}

		// Invalid structure or invalid types
		return { isValid: false, parsedValue: null };
	} catch (err) {
		// JSON parse failed - invalid
		return { isValid: false, parsedValue: null };
	}
};
