import dayjs from "dayjs";

export interface DateTimeValues {
	day: string;
	month: string;
	year: number;
	hour: string;
	minute: string;
	meridian: string;
}

/**
 * Extract date and time values from dayjs date object
 * Inspired by sheets project's extractDateTimeValues
 */
export function extractDateTimeValues({
	date,
	isTwentyFourHourFormat = false,
}: {
	date: dayjs.Dayjs;
	isTwentyFourHourFormat?: boolean;
}): DateTimeValues {
	return {
		day: date.date().toString().padStart(2, "0"),
		month: (date.month() + 1).toString().padStart(2, "0"),
		year: date.year(),
		hour: date.format(isTwentyFourHourFormat ? "HH" : "hh"),
		minute: date.format("mm"),
		meridian: date.format("A"),
	};
}







