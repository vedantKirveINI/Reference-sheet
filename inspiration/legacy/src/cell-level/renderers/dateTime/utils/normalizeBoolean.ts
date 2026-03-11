/**
 * Normalize boolean values from backend/API.
 * Backend may send: boolean, string "true"/"false", number 1/0, or string "1"/"0"
 */
export function normalizeBoolean(
	value: boolean | string | number | undefined,
): boolean {
	return Boolean(
		value === true ||
			value === "true" ||
			value === 1 ||
			value === "1" ||
			String(value).toLowerCase() === "true",
	);
}
