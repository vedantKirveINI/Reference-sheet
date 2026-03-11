/**
 * Validates if a rating value is within the allowed range
 * @param {number|string} value - The rating value to validate
 * @param {number} maxRating - The maximum allowed rating value
 * @returns {object} - Object containing validation result and processed value
 */
function validateRating({ value, maxRating }) {
	// Convert value to number if it's a string
	const numericValue = typeof value === "string" ? parseInt(value) : value;

	// Check if value is empty, null, or undefined
	if (value === null || value === undefined || value === "") {
		return {
			isValid: true,
			processedValue: null,
		};
	}

	// Check if value is a valid number
	if (isNaN(numericValue)) {
		return {
			isValid: false,
			processedValue: value,
		};
	}

	// Check if value is within the allowed range (1 to maxRating)
	if (numericValue < 1 || numericValue > maxRating) {
		return {
			isValid: false,
			processedValue: numericValue,
		};
	}

	// Check if value is a whole number
	if (!Number.isInteger(numericValue)) {
		return {
			isValid: false,
			processedValue: numericValue,
		};
	}

	return {
		isValid: true,
		processedValue: numericValue,
	};
}

export default validateRating;
