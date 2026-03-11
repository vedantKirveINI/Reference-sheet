/**
 * Helper utilities for DropDown editor
 * Handles both string and object option formats
 * Inspired by sheets project's helper utilities
 */

export type DropDownOption =
	| string
	| { id: string | number; label: string };

/**
 * Get display value from an option (handles both string and object)
 */
export function getDisplayValue(option: DropDownOption): string {
	if (typeof option === "string") {
		return option;
	}
	return option.label || "";
}

/**
 * Generate unique key for React list items
 */
export function getItemKey(
	item: DropDownOption,
	index: number,
): string {
	if (typeof item === "string") {
		return `${item}_${index}`;
	}
	return `${item.id}_${item.label}_${index}`;
}

/**
 * Check if an option is selected
 * Handles both string and object formats
 */
export function isOptionSelected(
	option: DropDownOption,
	selectedOptions: DropDownOption[],
): boolean {
	if (typeof option === "string") {
		return selectedOptions.some(
			(selected) => typeof selected === "string" && selected === option,
		);
	}
	// Object format: compare by label
	return selectedOptions.some(
		(selected) =>
			typeof selected === "object" &&
			selected !== null &&
			selected.label === option.label,
	);
}

/**
 * Remove an option from selected options array
 */
export function removeOption(
	option: DropDownOption,
	selectedOptions: DropDownOption[],
): DropDownOption[] {
	if (typeof option === "string") {
		return selectedOptions.filter(
			(selected) => typeof selected === "string" && selected !== option,
		);
	}
	// Object format: remove by label
	return selectedOptions.filter(
		(selected) =>
			typeof selected === "string" ||
			(selected !== null && selected.label !== option.label),
	);
}







