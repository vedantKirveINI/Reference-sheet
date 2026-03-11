import { isEmpty } from "lodash";
import { showAlert } from "oute-ds-alert";

function PhoneNumberValidator(value, callback) {
	const parsedValue = JSON.parse(value);

	const { phoneNumber = "" } = parsedValue;

	const validPhoneNumberRegex = /^\d{10}$/;

	if (validPhoneNumberRegex.test(phoneNumber) || isEmpty(phoneNumber)) {
		return callback(true);
	}

	showAlert({
		type: "error",
		message: "Invalid Phone Number",
	});
	return callback(false);
}

export default PhoneNumberValidator;
