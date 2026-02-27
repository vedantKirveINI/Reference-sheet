/**
 * Get option labels from DropDown options list
 * Handles both string and object formats
 * Inspired by sheets project's getOptionLabel
 */

export type DropDownOption =
	| string
	| { id: string | number; label: string };

/**
 * Extract label from an option (handles both string and object)
 */
function getLabel(option: DropDownOption): string {
	if (typeof option === "string") {
		return option;
	}
	return option.label || "";
}

/**
 * Get array of labels from options list
 * @param optionsList - Array of selected options (can be strings or objects)
 * @returns Array of label strings
 */
export function getOptionLabel(
	optionsList: DropDownOption[] = [],
): string[] {
	return optionsList.map((item) => getLabel(item));
}







