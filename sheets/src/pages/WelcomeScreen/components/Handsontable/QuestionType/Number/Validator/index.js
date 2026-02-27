import { NUMBER_PATTERN } from "../../../../../../../constants/regex";

function numberValidator(numberStr, callback) {
	if (!numberStr) {
		return callback(true);
	}

	if (NUMBER_PATTERN.test(numberStr)) {
		return callback(true);
	}

	return callback(false);
}

export { numberValidator };
