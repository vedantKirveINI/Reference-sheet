/**
 * Validates if a rating value is within the allowed range
 * Inspired by sheets project's validateRating
 */
export interface ValidateRatingResult {
	isValid: boolean;
	processedValue: number | null;
}

export function validateRating({
	value,
	maxRating = 5,
}: {
	value: number | string | null | undefined;
	maxRating?: number;
}): ValidateRatingResult {
	// Convert value to number if it's a string
	const numericValue =
		typeof value === "string" ? parseInt(value, 10) : value;

	// Check if value is empty, null, or undefined
	if (value === null || value === undefined || value === "") {
		return {
			isValid: true,
			processedValue: null,
		};
	}

	// Check if value is a valid number
	if (isNaN(numericValue as number)) {
		return {
			isValid: false,
			processedValue: value as number,
		};
	}

	// Check if value is within the allowed range (1 to maxRating)
	if (
		typeof numericValue === "number" &&
		(numericValue < 1 || numericValue > maxRating)
	) {
		return {
			isValid: false,
			processedValue: numericValue,
		};
	}

	// Check if value is a whole number
	if (typeof numericValue === "number" && !Number.isInteger(numericValue)) {
		return {
			isValid: false,
			processedValue: numericValue,
		};
	}

	return {
		isValid: true,
		processedValue: numericValue as number,
	};
}
