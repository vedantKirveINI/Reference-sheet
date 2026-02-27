import dayjs from "dayjs";

import extractDateTimeValues from "./extractDateTimeValues";

const dateFormatMap = {
	DDMMYYYY: (day, month, year, separator) =>
		`${day}${separator}${month}${separator}${year}`,
	MMDDYYYY: (day, month, year, separator) =>
		`${month}${separator}${day}${separator}${year}`,
	YYYYMMDD: (day, month, year, separator) =>
		`${year}${separator}${month}${separator}${day}`,
};

function formatDate(
	dateString,
	format = "DDMMYYYY",
	separator = "/",
	includeTime = false,
	isTwentyFourHourFormat = false,
) {
	if (!dateString) return null;

	const date = dayjs(dateString);
	const { day, month, year, hour, minute, meridian } = extractDateTimeValues({
		date,
		isTwentyFourHourFormat,
	});

	const formattedValue = dateFormatMap[format];

	const formattedDateTime = formattedValue(day, month, year, separator);

	if (includeTime) {
		return `${formattedDateTime || ""} ${hour}:${minute} ${!isTwentyFourHourFormat ? meridian : ""}`;
	}

	return formattedDateTime;
}

export default formatDate;
