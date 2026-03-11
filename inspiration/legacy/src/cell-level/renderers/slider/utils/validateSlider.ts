/**
 * Validate slider value against minValue and maxValue constraints
 * Inspired by sheets project's validateSlider utility
 */

interface ValidateSliderParams {
	value: number | string | null | undefined;
	minValue?: number;
	maxValue?: number;
}

interface ValidateSliderResult {
	isValid: boolean;
	processedValue: number | null;
}

export function validateSlider({
	value,
	minValue = 0,
	maxValue = 10,
}: ValidateSliderParams): ValidateSliderResult {
	// Convert string to number if needed
	const numericValue =
		typeof value === "string" && value.trim() !== ""
			? Number(value)
			: value;

	// Empty/null values are valid (empty cell)
	if (value === null || value === undefined || value === "") {
		return {
			isValid: true,
			processedValue: null,
		};
	}

	// Check if value is a valid number
	if (Number.isNaN(numericValue)) {
		return {
			isValid: false,
			processedValue: numericValue as number,
		};
	}

	// Validate minValue and maxValue are valid numbers
	if (
		typeof minValue !== "number" ||
		typeof maxValue !== "number" ||
		minValue > maxValue
	) {
		return {
			isValid: false,
			processedValue: numericValue as number,
		};
	}

	// Check if value is within range
	if (numericValue < minValue || numericValue > maxValue) {
		return {
			isValid: false,
			processedValue: numericValue as number,
		};
	}

	// Check if value is an integer
	if (!Number.isInteger(numericValue)) {
		return {
			isValid: false,
			processedValue: numericValue as number,
		};
	}

	return {
		isValid: true,
		processedValue: numericValue as number,
	};
}
