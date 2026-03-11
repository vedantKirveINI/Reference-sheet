/**
 * Date helper functions
 * Matches sheets repo's dateHelpers.js
 * Converted to TypeScript with proper types
 */

import { validateTime } from "@/cell-level/renderers/time/utils/validateTime";

type DateFormat = "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD";

interface DatePart {
	type: string;
	value: string;
}

interface ExtractedDateParts {
	year: string;
	month: string;
	day: string;
}

interface ParsedISOValue {
	year: string;
	month: string;
	day: string;
	hours: string;
	minutes: string;
	seconds: string;
	meridiem: string; // Empty if 24-hour format
}

/**
 * Extract date parts from Intl.DateTimeFormat parts array
 */
function extractDateParts(dateParts: DatePart[]): ExtractedDateParts {
	return {
		year: dateParts.find((p) => p.type === "year")?.value || "",
		month:
			dateParts.find((p) => p.type === "month")?.value.padStart(2, "0") ||
			"",
		day:
			dateParts.find((p) => p.type === "day")?.value.padStart(2, "0") ||
			"",
	};
}

/**
 * Format date string based on format options
 */
function formatDate(
	dateString: string | null | undefined,
	format: DateFormat = "DDMMYYYY",
	separator: string = "/",
): string | null {
	if (!dateString) return null;

	const date = new Date(dateString);

	const options: Intl.DateTimeFormatOptions = {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	};

	const formatter = new Intl.DateTimeFormat("en-US", options);
	const parts = formatter.formatToParts(date);

	const { day, month, year } = extractDateParts(parts);

	switch (format) {
		case "DDMMYYYY":
			return `${day}${separator}${month}${separator}${year}`;
		case "MMDDYYYY":
			return `${month}${separator}${day}${separator}${year}`;
		case "YYYYMMDD":
			return `${year}${separator}${month}${separator}${day}`;
		default:
			return dateString;
	}
}

/**
 * Get part from Intl.DateTimeFormat parts array
 */
function getPart(parts: DatePart[] = [], type: string = ""): string {
	return parts.find((part) => part?.type === type)?.value || "";
}

/**
 * Parse ISO value to time components
 * Returns year, month, day, hours, minutes, seconds, and meridiem
 */
function parseISOValue(
	isoString: string | null | undefined,
	isTwentyFourHour: boolean = false, // parameter to specify if you want 12-hour or 24-hour format
): ParsedISOValue | undefined {
	if (!isoString) return undefined;

	const date = new Date(isoString);

	// Use Intl.DateTimeFormat to get components adjusted to the specified time zone
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: !isTwentyFourHour, // Use 12-hour format if true, 24-hour format if false
	};

	let parts: DatePart[];
	try {
		const formatter = new Intl.DateTimeFormat("en-US", options);
		parts = formatter.formatToParts(date);
	} catch (e) {
		return undefined; // gracefully fail for invalid dates/locales
	}

	if (!Array.isArray(parts)) return undefined;

	let meridiem: string;
	let hours = getPart(parts, "hour");

	if (!isTwentyFourHour) {
		meridiem = getPart(parts, "dayPeriod");
		hours = hours.padStart(2, "0");
	} else {
		hours = hours.padStart(2, "0");
		meridiem = ""; // No AM/PM in 24-hour format
	}

	// Use padStart to keep two digits for other time components
	const minutes = getPart(parts, "minute").padStart(2, "0");
	const seconds = getPart(parts, "second").padStart(2, "0");
	const year = getPart(parts, "year");
	const month = getPart(parts, "month").padStart(2, "0");
	const day = getPart(parts, "day").padStart(2, "0");

	return {
		year,
		month,
		day,
		hours,
		minutes,
		seconds,
		meridiem, // Empty if 24-hour format
	};
}

/**
 * Convert time and meridiem to ISO 8601 string
 */
function getISOValue(
	time: string = "",
	meridiem: string | null = null,
): string {
	// Validate the input time format
	if (time?.length !== 5) {
		return "";
	}

	const currentDate = new Date();

	// Parse time into hours and minutes
	const [hoursStr, minutesStr] = time.split(":");
	let hours = parseInt(hoursStr, 10);
	const minutes = parseInt(minutesStr, 10);

	// Handle 12-hour format when meridiem is provided
	if (meridiem) {
		if (meridiem === "PM" && hours < 12) {
			hours += 12; // Convert PM to 24-hour format (except for 12 PM)
		} else if (meridiem === "AM" && hours === 12) {
			hours = 0; // Midnight case (12 AM)
		}
	}

	// Set the time to the current date object
	currentDate.setHours(hours, minutes, 0, 0); // hours, minutes, seconds, milliseconds

	// Convert to ISO string
	return currentDate.toISOString(); // Returns full ISO 8601 string with date and time
}

/**
 * Format time for display
 * Returns formatted string: "HH:MM AM/PM" for 12hr, "HH:MM" for 24hr
 */
function formatTimeDisplay(
	time: string,
	meridiem: string,
	isTwentyFourHour: boolean,
): string {
	if (!time) return "";

	if (isTwentyFourHour) {
		// 24hr format: "HH:MM"
		return time;
	} else {
		// 12hr format: "HH:MM AM/PM"
		return meridiem ? `${time} ${meridiem}` : time;
	}
}

/**
 * Validate and parse time data
 * Matches sheets repo's validateAndParseTime exactly
 */
function validateAndParseTime(
	data: any,
	isTwentyFourHour: boolean = false,
): {
	isValid: boolean;
	parsedValue: {
		time: string;
		meridiem: string;
		ISOValue: string;
		timeZone?: string;
	} | null;
} {
	// Import validateTime dynamically to avoid circular dependency
	// We'll import it at the top level instead
	try {
		// Match sheets repo: always try JSON.parse
		// If data is already an object, stringify it first, then parse
		// This ensures consistent behavior
		let parsedValue: any;
		if (typeof data === "string") {
			parsedValue = JSON.parse(data);
		} else if (typeof data === "object" && data !== null) {
			// If already an object, use it directly (don't stringify/parse)
			parsedValue = data;
		} else {
			// Not a string and not an object - invalid
			return { isValid: false, parsedValue: null };
		}

		if (typeof parsedValue === "object" && parsedValue !== null) {
			const {
				time = "",
				meridiem = "",
				ISOValue = "",
				timeZone = "",
			} = parsedValue || {};

			// Empty values are valid
			if (!time && !meridiem && !ISOValue && !timeZone) {
				return { isValid: true, parsedValue };
			}

			// For 12hr format, meridiem is required
			if (!isTwentyFourHour && !meridiem) {
				return { isValid: false, parsedValue: null };
			}

			// Validate time format
			const isValidTime = validateTime({
				timeValue: { time, meridiem },
				isTwentyFourHour,
			});

			// Validate ISOValue if present
			if (isValidTime && ISOValue) {
				const date = new Date(ISOValue);
				if (isNaN(date?.getTime?.())) {
					return { isValid: false, parsedValue: null };
				}
			}

			return {
				isValid: isValidTime,
				parsedValue: isValidTime ? parsedValue : null,
			};
		} else if (parsedValue === null) {
			// Null is valid (empty cell)
			return { isValid: true, parsedValue: null };
		}

		// Not an object and not null - invalid
		return { isValid: false, parsedValue: null };
	} catch (err) {
		// JSON parse failed or any other error - invalid
		return { isValid: false, parsedValue: null };
	}
}

/**
 * Parse ISO value to time components (simplified version for time renderer)
 * Returns only hours, minutes, and meridiem
 * This is a convenience function that wraps parseISOValue
 */
function parseISOValueForTime(
	isoString: string | null | undefined,
	isTwentyFourHour: boolean = false,
): {
	hours: string;
	minutes: string;
	meridiem: string;
} | null {
	const parsed = parseISOValue(isoString, isTwentyFourHour);
	if (!parsed) return null;

	return {
		hours: parsed.hours,
		minutes: parsed.minutes,
		meridiem: parsed.meridiem,
	};
}

export {
	formatDate,
	parseISOValue,
	getISOValue,
	formatTimeDisplay,
	validateAndParseTime,
	parseISOValueForTime,
};
export type { DateFormat, ParsedISOValue };
