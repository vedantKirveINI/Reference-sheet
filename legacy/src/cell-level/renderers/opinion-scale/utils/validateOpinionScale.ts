export interface ValidateOpinionScaleResult {
	isValid: boolean;
	processedValue: number | null;
}

export function validateOpinionScale({
	value,
	maxValue = 10,
}: {
	value: number | string | null | undefined;
	maxValue?: number;
}): ValidateOpinionScaleResult {
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

	// Check if value is within the allowed range (1 to maxValue)
	if (
		typeof numericValue === "number" &&
		(numericValue < 1 || numericValue > maxValue)
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
