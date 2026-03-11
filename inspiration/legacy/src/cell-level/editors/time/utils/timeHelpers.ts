/**
 * Time helper functions for editor
 * These functions are used by the Time editor to convert between time formats
 */

/**
 * Convert time and meridiem to ISO 8601 string
 * Inspired by sheets project's getISOValue
 */
export function getISOValue(
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
 * Get timezone string (e.g., "IST", "PST")
 */
export function getTimeZone(): string {
	const date = new Date();
	const options: Intl.DateTimeFormatOptions = {
		timeZoneName: "short",
	};
	const timeWithZone = date.toLocaleString("en-US", options);
	return timeWithZone?.split(" ").pop() || "";
}
