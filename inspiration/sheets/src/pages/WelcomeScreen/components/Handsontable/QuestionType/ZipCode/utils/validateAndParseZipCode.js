import ALLOWED_KEYS from "../constant";

function validateAndParseZipCode(data) {
	try {
		const parsedValue = JSON.parse(data);

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
	} catch (err) {
		return { isValid: false, parsedValue: undefined };
	}
}

export default validateAndParseZipCode;
