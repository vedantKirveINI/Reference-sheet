import dayjs from "dayjs";
import { extractDateTimeValues } from "./extractDateTimeValues";

type DateFormat = "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD";

const dateFormatMap: Record<
	DateFormat,
	(day: string, month: string, year: number, separator: string) => string
> = {
	DDMMYYYY: (day, month, year, separator) =>
		`${day}${separator}${month}${separator}${year}`,
	MMDDYYYY: (day, month, year, separator) =>
		`${month}${separator}${day}${separator}${year}`,
	YYYYMMDD: (day, month, year, separator) =>
		`${year}${separator}${month}${separator}${day}`,
};

/**
 * Format date string based on format options
 * Inspired by sheets project's formatDate
 */
export function formatDate(
	dateString: string | null | undefined,
	format: DateFormat = "DDMMYYYY",
	separator: string = "/",
	includeTime: boolean = false,
	isTwentyFourHourFormat: boolean = false,
): string | null {
	if (!dateString) return null;

	try {
		const date = dayjs(dateString);
		
		// Check if date is valid
		if (!date.isValid()) {
			return null;
		}

		const { day, month, year, hour, minute, meridian } = extractDateTimeValues({
			date,
			isTwentyFourHourFormat,
		});

		const formattedValue = dateFormatMap[format];
		const formattedDateTime = formattedValue(day, month, year, separator);

		if (includeTime) {
			// Match sheets format exactly: "date hour:minute AM" or "date hour:minute " (24-hour)
			// Format: "25/11/2025 12:55 PM" or "25/11/2025 12:55" (with trailing space for 24-hour)
			// Sheets format: `${formattedDateTime || ""} ${hour}:${minute} ${!isTwentyFourHourFormat ? meridian : ""}`
			return `${formattedDateTime || ""} ${hour}:${minute} ${!isTwentyFourHourFormat ? meridian : ""}`.trim();
		}

		return formattedDateTime;
	} catch {
		return null;
	}
}

