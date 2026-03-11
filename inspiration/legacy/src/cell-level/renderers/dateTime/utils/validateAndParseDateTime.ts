import dayjs from "dayjs";

/**
 * Validate and parse PostgreSQL datetime string
 * Handles ISO 8601 format (e.g., "2024-01-15T10:30:00Z")
 */
export function validateAndParseDateTime(
	value: string | null | undefined,
): dayjs.Dayjs | null {
	if (!value) return null;

	try {
		const date = dayjs(value);
		
		// Check if date is valid
		if (!date.isValid()) {
			return null;
		}

		return date;
	} catch {
		return null;
	}
}







