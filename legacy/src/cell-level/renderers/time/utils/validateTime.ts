const time12HourRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])$/;
const time24HourRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

export function validateTime({
	timeValue,
	isTwentyFourHour,
}: {
	timeValue: { time: string };
	isTwentyFourHour: boolean;
}): boolean {
	const { time } = timeValue || {};

	// Handle null/undefined/empty string
	if (!time || time.trim() === "") {
		return true; // Empty time is valid (allows clearing the cell)
	}

	// Trim time before validation to handle whitespace
	const trimmedTime = time.trim();

	if (isTwentyFourHour) {
		// 24hr format: 00:00 to 23:59
		return time24HourRegex.test(trimmedTime);
	} else {
		// 12hr format: 01:00 to 12:59
		return time12HourRegex.test(trimmedTime);
	}
}
