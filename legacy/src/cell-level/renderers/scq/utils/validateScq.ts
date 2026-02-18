/**
 * SCQ Validation Utility
 * Validates if a value exists in the options array
 * Inspired by sheets project's validateSCQ function
 */

/**
 * Validate SCQ value
 * Returns isValid and newValue (empty string if invalid)
 * If options are not provided, still allow rendering if value exists (for backward compatibility)
 */
export function validateSCQ(
	value: string | null,
	options: string[] = [],
): { isValid: boolean; newValue: string } {
	if (!value) {
		return { isValid: false, newValue: "" };
	}

	// If no options provided, still allow rendering (value might be valid)
	if (!options || options.length === 0) {
		return { isValid: true, newValue: value };
	}

	// Check if value exists in options array
	if (options.includes(value)) {
		return { isValid: true, newValue: value };
	}

	return { isValid: false, newValue: "" };
}

