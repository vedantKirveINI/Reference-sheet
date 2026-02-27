import { ADDRESS_KEY_MAPPING } from "./constant";

function validateAndParseAddress(jsonString) {
	try {
		const parsedValue = JSON.parse(jsonString);

		if (
			parsedValue === null ||
			(typeof parsedValue === "object" &&
				!Array.isArray(parsedValue) &&
				Object.keys(parsedValue).every((key) =>
					ADDRESS_KEY_MAPPING.includes(key),
				))
		) {
			return { isValid: true, parsedValue };
		}

		return { isValid: false, parsedValue: undefined };
	} catch (error) {
		return { isValid: false, parsedValue: undefined };
	}
}

export default validateAndParseAddress;
