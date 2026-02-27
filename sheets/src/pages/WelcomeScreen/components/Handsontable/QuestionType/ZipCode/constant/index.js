import isEmpty from "lodash/isEmpty";
const ALLOWED_KEYS = ["countryCode", "zipCode"];

export const ZIP_CODE_PATTERNS = {
	US: { pattern: "99999", formatChars: { 9: "[0-9]" } },
	CA: { pattern: "A9A 9A9", formatChars: { A: "[A-Za-z]", 9: "[0-9]" } },
	GB: { pattern: "A9 9AA", formatChars: { A: "[A-Za-z]", 9: "[0-9]" } },
	DE: { pattern: "99999", formatChars: { 9: "[0-9]" } },
	FR: { pattern: "99999", formatChars: { 9: "[0-9]" } },
	IN: { pattern: "999999", formatChars: { 9: "[0-9]" } },
	AU: { pattern: "9999", formatChars: { 9: "[0-9]" } },
	JP: { pattern: "999-9999", formatChars: { 9: "[0-9]" } },
	BR: { pattern: "99999999", formatChars: { 9: "[0-9]" } },
	RU: { pattern: "999999", formatChars: { 9: "[0-9]" } },
	IR: {
		pattern: "9999999999",
		formatChars: {
			9: "[0-9]",
		},
	},
};

export const DEFAULT_ZIP_CODE_PATTERN = {
	pattern: "9999999999",
	formatChars: { 9: "[A-Z0-9a-z]" },
};

export function getZipCodePattern(countryCode) {
	if (isEmpty(countryCode)) {
		return DEFAULT_ZIP_CODE_PATTERN;
	}

	const upperCode = countryCode.toUpperCase();
	return ZIP_CODE_PATTERNS[upperCode] || DEFAULT_ZIP_CODE_PATTERN;
}

export default ALLOWED_KEYS;
