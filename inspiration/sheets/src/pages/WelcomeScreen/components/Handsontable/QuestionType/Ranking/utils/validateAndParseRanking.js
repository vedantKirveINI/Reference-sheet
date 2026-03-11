const hasValidStructure = ({ inputArray = [] }) =>
	Array.isArray(inputArray) &&
	inputArray.every(
		(item) =>
			item &&
			typeof item === "object" &&
			"id" in item &&
			"rank" in item &&
			"label" in item,
	);

function validateAndParseRanking(jsonString = "", options = []) {
	try {
		if (!jsonString) {
			// If jsonString is empty, check if options are valid
			const isValidOptions = hasValidStructure({ inputArray: options });

			return {
				isValid: isValidOptions,
				parsedValue: undefined,
			};
		}

		const parsedValue = JSON.parse(jsonString);

		// Ensure parsedValue is a valid array of objects
		const isValidParsed = hasValidStructure({ inputArray: parsedValue });

		if (!isValidParsed) {
			return { isValid: false, parsedValue: undefined };
		}

		// Extract IDs from parsedValue and options
		const parsedIds = new Set(parsedValue.map((item) => item.id));
		const optionsIds = new Set(options.map((opt) => opt.id));

		// check if lengths match
		const isRankingDataMatchingOptions = parsedIds.size === optionsIds.size;

		// Ensure every ID in options exists in parsedValue
		const allIdsExist =
			isRankingDataMatchingOptions &&
			[...optionsIds].every((id) => parsedIds.has(id));

		// Data is valid only if all IDs match exactly
		const isValid = isValidParsed && allIdsExist;

		return {
			isValid,
			parsedValue: isValid ? parsedValue : undefined,
		};
	} catch (e) {
		return { isValid: false, parsedValue: undefined };
	}
}

export default validateAndParseRanking;
