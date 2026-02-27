import { isEmpty } from "lodash";
import { showAlert } from "oute-ds-alert";

function ZipCodeValidator(value, callback) {
	const parsedValue = JSON.parse(value);

	const { zipCode = "" } = parsedValue;

	const validZipCodeRegex = /^\d{5,6}$/;

	if (validZipCodeRegex.test(zipCode) || isEmpty(zipCode)) {
		return callback(true);
	}

	showAlert({
		type: "error",
		message: "Invalid Zip Code",
	});
	return callback(false);
}

export default ZipCodeValidator;
