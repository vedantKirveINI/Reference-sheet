/**
 * Validate YesNo value
 * Inspired by sheets repo's validateYesNo utility
 */

const VALID_RESPONSE = ["Yes", "No"];

export interface ValidateYesNoResult {
	isValid: boolean;
	newValue: "Yes" | "No" | "Other" | "";
}

export function validateYesNo({
	value,
	other = false,
}: {
	value: string | null | undefined;
	other?: boolean;
}): ValidateYesNoResult {
	if (!value || value === "") {
		return { isValid: true, newValue: "" };
	}

	// Check if value is in valid responses
	if (VALID_RESPONSE.includes(value)) {
		return { isValid: true, newValue: value as "Yes" | "No" };
	}

	// Check if "Other" is allowed and value is "Other"
	if (other && value === "Other") {
		return { isValid: true, newValue: "Other" };
	}

	// Value is not valid
	return { isValid: false, newValue: "" };
}
