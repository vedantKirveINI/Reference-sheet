function extractDateTimeValues({ date, isTwentyFourHourFormat }) {
	return {
		day: date.date().toString().padStart(2, "0"),
		month: (date.month() + 1).toString().padStart(2, "0"),
		year: date.year(),
		hour: date.format(isTwentyFourHourFormat ? "HH" : "hh"),
		minute: date.format("mm"),
		meridian: date.format("A"),
	};
}

export default extractDateTimeValues;
