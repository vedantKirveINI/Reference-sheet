/**
 * Validate and parse List cell value
 * Matches sheets repo's validateAndParseList logic
 *
 * List must be:
 * - An array of primitives (strings, numbers, etc.)
 * - NOT an array of objects
 * - Empty/null values are valid (returns empty array)
 */
export function validateAndParseList(value: unknown): {
	isValid: boolean;
	parsedValue: Array<string | number>;
} {
	// Empty/null/undefined values are valid (return empty array)
	if (!value) {
		return { isValid: true, parsedValue: [] };
	}

	try {
		let parsed: unknown;

		// Handle different input types
		if (Array.isArray(value)) {
			parsed = value;
		} else if (typeof value === "string") {
			parsed = JSON.parse(value);
		} else {
			parsed = value;
		}

		// Must be an array
		if (!Array.isArray(parsed)) {
			return { isValid: false, parsedValue: [] };
		}

		// Check if any item is an object {} (plain object, not array)
		// List must only contain primitives (strings, numbers, booleans, null)
		const hasObject = parsed.some((item) => {
			return (
				item !== null &&
				typeof item === "object" &&
				!Array.isArray(item)
			);
		});

		// If array contains objects, it's invalid
		if (hasObject) {
			return { isValid: false, parsedValue: [] };
		}

		// Valid: array of primitives
		// Convert to array of strings/numbers (filter out booleans/null for display)
		const validValues = parsed
			.filter((item) => item !== null && typeof item !== "boolean")
			.map((item) => {
				if (typeof item === "number") {
					return item;
				}
				return String(item);
			});

		return { isValid: true, parsedValue: validValues };
	} catch (error) {
		// JSON parse failed or other error - invalid
		return { isValid: false, parsedValue: [] };
	}
}
