import { VALID_RESPONSE } from "../constants";

function validateYesNo({ value = "", other = false }) {
	if (VALID_RESPONSE.includes(value) || (other && value === "Other")) {
		return { isValid: true, newValue: value };
	}
	return { isValid: false, newValue: "" };
}

export default validateYesNo;
