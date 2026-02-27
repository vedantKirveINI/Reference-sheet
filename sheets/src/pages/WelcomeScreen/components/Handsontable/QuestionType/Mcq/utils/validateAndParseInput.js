function validateAndParseInput(jsonString = "", options = []) {
	try {
		const parsedValue = JSON.parse(jsonString);

		if (
			!parsedValue ||
			(Array.isArray(parsedValue) &&
				parsedValue.every((value) => options.includes(value)))
		) {
			return { isValid: true, parsedValue };
		}

		return { isValid: false, parsedValue: undefined };
	} catch (e) {
		return { isValid: false, parsedValue: undefined };
	}
}
export default validateAndParseInput;
