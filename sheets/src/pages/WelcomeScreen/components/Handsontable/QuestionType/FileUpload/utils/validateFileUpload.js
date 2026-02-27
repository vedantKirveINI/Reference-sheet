import isEmpty from "lodash/isEmpty";

function validateFileUpload(newValue) {
	try {
		const parsedValue = JSON.parse(newValue);

		// Check if the value is a number
		if (typeof parsedValue === "number") {
			return { isValid: false, newValue: undefined };
		}

		if (
			isEmpty(parsedValue) ||
			(Array.isArray(parsedValue) && parsedValue.every(({ url }) => url))
		) {
			return {
				isValid: true,
				newValue: parsedValue,
			};
		}

		return { isValid: false, newValue: undefined };
	} catch (e) {
		return { isValid: false, newValue: undefined };
	}
}

export default validateFileUpload;
