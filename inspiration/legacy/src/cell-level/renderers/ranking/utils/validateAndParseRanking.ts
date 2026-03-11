/**
 * Validates and parses ranking data
 * Inspired by sheets project's validateAndParseRanking
 */

interface RankingItem {
	id: string;
	rank: number;
	label: string;
}

interface RankingOption {
	id: string;
	label: string;
}

/**
 * Check if input array has valid structure
 */
function hasValidStructure(inputArray: unknown[]): boolean {
	return (
		Array.isArray(inputArray) &&
		inputArray.every(
			(item) =>
				item &&
				typeof item === "object" &&
				"id" in item &&
				"rank" in item &&
				"label" in item,
		)
	);
}

/**
 * Validate and parse ranking JSON string
 * @param jsonString - JSON string from backend
 * @param options - Available ranking options
 * @returns {isValid: boolean, parsedValue: RankingItem[] | undefined}
 */
export function validateAndParseRanking(
	jsonString: string | null | undefined,
	options: RankingOption[] = [],
): {
	isValid: boolean;
	parsedValue: RankingItem[] | undefined;
} {
	try {
		if (!jsonString || jsonString.trim() === "") {
			// If jsonString is empty, check if options are valid
			const isValidOptions = hasValidStructure(options as unknown[]);
			return {
				isValid: isValidOptions,
				parsedValue: undefined,
			};
		}

		const parsedValue = JSON.parse(jsonString) as unknown;

		// Ensure parsedValue is a valid array of objects
		if (!Array.isArray(parsedValue)) {
			return { isValid: false, parsedValue: undefined };
		}

		const isValidParsed = hasValidStructure(parsedValue);

		if (!isValidParsed) {
			return { isValid: false, parsedValue: undefined };
		}

		const typedParsedValue = parsedValue as RankingItem[];

		// Extract IDs from parsedValue and options
		const parsedIds = new Set(typedParsedValue.map((item) => item.id));
		const optionsIds = new Set(options.map((opt) => opt.id));

		// Check if lengths match
		const isRankingDataMatchingOptions = parsedIds.size === optionsIds.size;

		// Ensure every ID in options exists in parsedValue
		const allIdsExist =
			isRankingDataMatchingOptions &&
			[...optionsIds].every((id) => parsedIds.has(id));

		// Data is valid only if all IDs match exactly
		const isValid = isValidParsed && allIdsExist;

		return {
			isValid,
			parsedValue: isValid ? typedParsedValue : undefined,
		};
	} catch (e) {
		return { isValid: false, parsedValue: undefined };
	}
}
