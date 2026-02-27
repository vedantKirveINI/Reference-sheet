/**
 * Validate and parse DropDown input
 * Handles both array of strings and array of objects with {id, label}
 * Inspired by sheets project's validateAndParseInput
 */

export type DropDownOption =
	| string
	| { id: string | number; label: string };

export type DropDownValue =
	| string[]
	| Array<{ id: string | number; label: string }>
	| null
	| undefined;

export interface ValidateAndParseResult {
	isValid: boolean;
	parsedValue: Array<{ id: string | number; label: string }>;
}

/**
 * Check if an option matches a selected option
 * Handles both string and object formats
 */
function isOptionMatch(
	option: DropDownOption,
	selectedOption: { id: string | number; label: string },
): boolean {
	if (typeof option === "string") {
		return option === selectedOption.label;
	}
	return option.label === selectedOption.label;
}

/**
 * Validate and parse DropDown input
 * Handles:
 * - Array of strings: ["A", "B", "C"]
 * - Array of objects: [{id: 1, label: "A"}, {id: 2, label: "B"}]
 * - JSON string: '["A", "B"]' or '[{"id": 1, "label": "A"}]'
 * - Null/undefined: returns empty array
 */
export function validateAndParseInput(
	value: any,
	options: DropDownOption[] = [],
): ValidateAndParseResult {
	if (!value) {
		return { isValid: true, parsedValue: [] };
	}

	let parsed: any;

	// If already an array, use it directly
	if (Array.isArray(value)) {
		parsed = value;
	} else if (typeof value === "string") {
		// Try to parse as JSON
		try {
			parsed = JSON.parse(value);
			if (!Array.isArray(parsed)) {
				return { isValid: false, parsedValue: [] };
			}
		} catch {
			// Not valid JSON, treat as empty
			return { isValid: true, parsedValue: [] };
		}
	} else {
		return { isValid: false, parsedValue: [] };
	}

	// Normalize to array of objects with {id, label}
	const normalized: Array<{ id: string | number; label: string }> = [];

	for (const item of parsed) {
		if (typeof item === "string") {
			// String option: convert to object format
			normalized.push({ id: item, label: item });
		} else if (
			typeof item === "object" &&
			item !== null &&
			"label" in item
		) {
			// Object option: ensure it has id and label
			const id = "id" in item ? item.id : item.label;
			normalized.push({ id, label: item.label });
		}
	}

	// If options are provided, validate against them
	if (options.length > 0) {
		const isValid = normalized.every((selectedOption) => {
			return options.some((option) => isOptionMatch(option, selectedOption));
		});

		return { isValid, parsedValue: isValid ? normalized : [] };
	}

	return { isValid: true, parsedValue: normalized };
}







