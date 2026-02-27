function validateSCQ(value = "", options = []) {
	if (Array.isArray(options) && options.includes(value)) {
		return { isValid: true, newValue: value };
	}
	return { isValid: false, newValue: "" };
}

export default validateSCQ;
