const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const VALID_INTEGER_REGEX = /^\d*$/;
const REPLACE_NON_NUMBERS_REGEX = /\D/g; // Removes non-numeric characters
const NUMBER_PATTERN = /^[+-]?\d+(\.\d+)?$/;
const DOMAIN_REGEX =
	/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export {
	EMAIL_REGEX,
	VALID_INTEGER_REGEX,
	NUMBER_PATTERN,
	REPLACE_NON_NUMBERS_REGEX,
	DOMAIN_REGEX,
};
