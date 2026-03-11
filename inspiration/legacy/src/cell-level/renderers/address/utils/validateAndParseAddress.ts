/**
 * Validate and parse address data
 * Handles both JSON string and object input
 * Inspired by sheets project's validateAndParseAddress
 */
import { ADDRESS_KEY_MAPPING } from "./constants";

export interface AddressData {
	fullName?: string;
	addressLineOne?: string;
	addressLineTwo?: string;
	zipCode?: string;
	city?: string;
	state?: string;
	country?: string;
}

export interface ValidationResult {
	isValid: boolean;
	parsedValue: AddressData | null;
}

export function validateAndParseAddress(
	value: string | AddressData | null | undefined,
): ValidationResult {
	if (!value) {
		return { isValid: true, parsedValue: null };
	}

	try {
		let parsedValue: AddressData;

		// If it's already an object, use it directly
		if (typeof value === "object" && !Array.isArray(value)) {
			parsedValue = value as AddressData;
		} else if (typeof value === "string") {
			// Try to parse as JSON
			parsedValue = JSON.parse(value);
		} else {
			return { isValid: false, parsedValue: null };
		}

		// Validate that all keys are in ADDRESS_KEY_MAPPING
		if (
			parsedValue === null ||
			(typeof parsedValue === "object" &&
				!Array.isArray(parsedValue) &&
				Object.keys(parsedValue).every((key) =>
					ADDRESS_KEY_MAPPING.includes(key as any),
				))
		) {
			return { isValid: true, parsedValue };
		}

		return { isValid: false, parsedValue: null };
	} catch (error) {
		return { isValid: false, parsedValue: null };
	}
}







