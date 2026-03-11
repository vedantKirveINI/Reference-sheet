import ALLOWED_KEYS from "../constant";

function validateAndParseInput(jsonString, options = []) {
	try {
		const parsedValue = JSON.parse(jsonString);

		if (!parsedValue) {
			return { isValid: true, parsedValue };
		}

		if (Array.isArray(parsedValue)) {
			const isValid = parsedValue.every((item) => {
				const hasValidKeys =
					item &&
					typeof item === "object" &&
					ALLOWED_KEYS.every((key) => key in item);

				if (!hasValidKeys) return false;

				return options.some((option) => option?.label === item?.label);
			});

			return { isValid, parsedValue: isValid ? parsedValue : undefined };
		}

		return { isValid: false, parsedValue: undefined };
	} catch (e) {
		return { isValid: false, parsedValue: undefined };
	}
}
export default validateAndParseInput;
