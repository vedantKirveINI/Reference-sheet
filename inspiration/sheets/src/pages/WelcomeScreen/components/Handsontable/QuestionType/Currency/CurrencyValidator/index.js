import { isEmpty } from "lodash";
import { showAlert } from "oute-ds-alert";

import { VALID_INTEGER_REGEX } from "../../../../../../../constants/regex";

function CurrencyValidator(value, callback) {
	const parsedValue = JSON.parse(value);

	const { currencyValue = "" } = parsedValue;

	if (VALID_INTEGER_REGEX.test(currencyValue) || isEmpty(currencyValue)) {
		return callback(true);
	}

	showAlert({
		type: "error",
		message: "Invalid Number",
	});
	return callback(false);
}

export default CurrencyValidator;
