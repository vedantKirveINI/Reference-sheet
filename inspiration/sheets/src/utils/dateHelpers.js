function extractDateParts(dateParts) {
	return {
		year: dateParts.find((p) => p.type === "year").value,
		month: dateParts.find((p) => p.type === "month").value.padStart(2, "0"),
		day: dateParts.find((p) => p.type === "day").value.padStart(2, "0"),
	};
}

function formatDate(dateString, format = "DDMMYYYY", separator = "/") {
	if (!dateString) return null;

	const date = new Date(dateString);

	const options = {
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

function parseISOValue(
	isoString,
	isTwentyFourHour = false, // parameter to specify if you want 12-hour or 24-hour format
) {
	if (!isoString) return;

	const date = new Date(isoString);

	// Use Intl.DateTimeFormat to get components adjusted to the specified time zone
	const options = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: !isTwentyFourHour, // Use 12-hour format if true, 24-hour format if false
	};

	// Format the date according to the time zone
	const formatter = new Intl.DateTimeFormat("en-US", options);
	const parts = formatter.formatToParts(date);

	// Extract the components based on 12-hour or 24-hour format
	let meridiem;
	let hours = parts.find((p) => p.type === "hour").value;

	if (!isTwentyFourHour) {
		meridiem = parts.find((p) => p.type === "dayPeriod").value;
		hours = hours.padStart(2, "0");
	} else {
		hours = hours.padStart(2, "0");
		meridiem = ""; // No AM/PM in 24-hour format
	}

	// Use padStart to keep two digits for other time components
	return {
		year: parts.find((p) => p.type === "year").value,
		month: parts.find((p) => p.type === "month").value.padStart(2, "0"),
		day: parts.find((p) => p.type === "day").value.padStart(2, "0"),
		hours,
		minutes: parts.find((p) => p.type === "minute").value.padStart(2, "0"),
		seconds: parts.find((p) => p.type === "second").value.padStart(2, "0"),
		meridiem, // Empty if 24-hour format
	};
}

function getISOValue(time = "", meridiem = null) {
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

export { formatDate, parseISOValue, getISOValue };
