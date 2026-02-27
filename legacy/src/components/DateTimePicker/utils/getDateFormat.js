const getDateTimeFormat = ({
	dateFormat,
	isTwentyFourHourFormat,
	separator,
	includeTime,
}) => {
	let timeFormat = isTwentyFourHourFormat ? "HH:mm" : "hh:mm A";

	if (!includeTime) {
		timeFormat = "";
	}

	switch (dateFormat) {
		case "DDMMYYYY":
			return `DD${separator}MM${separator}YYYY ${timeFormat}`;
		case "MMDDYYYY":
			return `MM${separator}DD${separator}YYYY ${timeFormat}`;
		case "YYYYMMDD":
			return `YYYY${separator}MM${separator}DD ${timeFormat}`;
		default:
			throw new Error("Invalid date format");
	}
};

export default getDateTimeFormat;
