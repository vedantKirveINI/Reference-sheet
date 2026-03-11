import ALLOWED_KEYS from "../constant";

function validateAndParsePhoneNumber(jsonString) {
	try {
		const parsedValue = JSON.parse(jsonString);

		if (
			parsedValue === null ||
			(typeof parsedValue === "object" &&
				!Array.isArray(parsedValue) &&
				Object.keys(parsedValue).every((key) =>
					ALLOWED_KEYS.includes(key),
				))
		) {
			return { isValid: true, parsedValue };
		}
		return { isValid: false, parsedValue: undefined };
	} catch (error) {
		return { isValid: false, parsedValue: undefined };
	}
}

export default validateAndParsePhoneNumber;
