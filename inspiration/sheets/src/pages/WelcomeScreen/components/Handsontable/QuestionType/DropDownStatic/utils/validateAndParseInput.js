function validateAndParseInput(jsonString = "", options = []) {
	try {
		const parsedValue = JSON.parse(jsonString);

		const isValidArray =
			Array.isArray(parsedValue) &&
			parsedValue.every((value) => options.includes(value));

		if (!parsedValue || isValidArray) {
			return { isValid: true, parsedValue };
		}

		return { isValid: false, parsedValue: undefined };
	} catch (e) {
		return { isValid: false, parsedValue: undefined };
	}
}
export default validateAndParseInput;
