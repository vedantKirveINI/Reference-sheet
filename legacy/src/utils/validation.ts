// Inspired by Teable's cell value validation system
import { CellType } from "../types";

export interface IValidationResult {
	success: boolean;
	data?: any;
	error?: string;
}

export interface IValidationError {
	field: string;
	message: string;
	code: string;
}

// String cell validation
export const validateStringCell = (value: unknown): IValidationResult => {
	if (value === null || value === undefined) {
		return { success: true, data: null };
	}

	if (typeof value === "string") {
		// Basic string validation
		if (value.length > 1000) {
			return {
				success: false,
				error: "String value exceeds maximum length of 1000 characters",
			};
		}

		// Trim whitespace
		const trimmedValue = value.trim();
		return { success: true, data: trimmedValue };
	}

	// Try to convert to string
	try {
		const stringValue = String(value).trim();
		return { success: true, data: stringValue };
	} catch {
		return {
			success: false,
			error: "Unable to convert value to string",
		};
	}
};

// Number cell validation
export const validateNumberCell = (value: unknown): IValidationResult => {
	if (value === null || value === undefined || value === "") {
		return { success: true, data: null };
	}

	if (typeof value === "number") {
		if (!isFinite(value)) {
			return { success: false, error: "Number must be finite" };
		}
		return { success: true, data: value };
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed === "") {
			return { success: true, data: null };
		}

		const numValue = parseFloat(trimmed);
		if (isNaN(numValue)) {
			return { success: false, error: "Invalid number format" };
		}

		if (!isFinite(numValue)) {
			return { success: false, error: "Number must be finite" };
		}

		return { success: true, data: numValue };
	}

	return { success: false, error: "Unable to convert value to number" };
};

// MCQ cell validation
export const validateMCQCell = (
	value: unknown,
	availableOptions?: string[],
): IValidationResult => {
	if (value === null || value === undefined) {
		return { success: true, data: [] };
	}

	if (!Array.isArray(value)) {
		return { success: false, error: "MCQ value must be an array" };
	}

	// Validate each option
	const validOptions: string[] = [];
	for (const option of value) {
		if (typeof option !== "string") {
			return { success: false, error: "All MCQ options must be strings" };
		}

		const trimmedOption = option.trim();
		if (trimmedOption === "") {
			continue; // Skip empty options
		}

		// Check if option is available (if options are provided)
		if (availableOptions && !availableOptions.includes(trimmedOption)) {
			return {
				success: false,
				error: `Option "${trimmedOption}" is not available`,
			};
		}

		validOptions.push(trimmedOption);
	}

	// Remove duplicates
	const uniqueOptions = [...new Set(validOptions)];

	return { success: true, data: uniqueOptions };
};

// Generic cell validation based on type
export const validateCellValue = (
	cellType: CellType,
	value: unknown,
	options?: { availableOptions?: string[] },
): IValidationResult => {
	switch (cellType) {
		case CellType.String:
			return validateStringCell(value);
		case CellType.Number:
			return validateNumberCell(value);
		case CellType.MCQ:
			return validateMCQCell(value, options?.availableOptions);
		default:
			return { success: false, error: `Unknown cell type: ${cellType}` };
	}
};

// Business rule validation
export const validateBusinessRules = (
	cellType: CellType,
	value: unknown,
	rules?: {
		required?: boolean;
		minLength?: number;
		maxLength?: number;
		min?: number;
		max?: number;
		pattern?: RegExp;
	},
): IValidationResult => {
	// First validate the basic cell value
	const basicValidation = validateCellValue(cellType, value);
	if (!basicValidation.success) {
		return basicValidation;
	}

	const validatedValue = basicValidation.data;

	// Apply business rules
	if (
		rules?.required &&
		(validatedValue === null ||
			validatedValue === undefined ||
			validatedValue === "")
	) {
		return { success: false, error: "This field is required" };
	}

	if (cellType === CellType.String && typeof validatedValue === "string") {
		if (rules?.minLength && validatedValue.length < rules.minLength) {
			return {
				success: false,
				error: `Minimum length is ${rules.minLength} characters`,
			};
		}

		if (rules?.maxLength && validatedValue.length > rules.maxLength) {
			return {
				success: false,
				error: `Maximum length is ${rules.maxLength} characters`,
			};
		}

		if (rules?.pattern && !rules.pattern.test(validatedValue)) {
			return {
				success: false,
				error: "Value does not match required pattern",
			};
		}
	}

	if (cellType === CellType.Number && typeof validatedValue === "number") {
		if (rules?.min !== undefined && validatedValue < rules.min) {
			return {
				success: false,
				error: `Minimum value is ${rules.min}`,
			};
		}

		if (rules?.max !== undefined && validatedValue > rules.max) {
			return {
				success: false,
				error: `Maximum value is ${rules.max}`,
			};
		}
	}

	return { success: true, data: validatedValue };
};

// Error formatting utilities
export const formatValidationError = (error: IValidationError): string => {
	return `${error.field}: ${error.message}`;
};

export const formatValidationErrors = (errors: IValidationError[]): string => {
	return errors.map(formatValidationError).join("; ");
};
