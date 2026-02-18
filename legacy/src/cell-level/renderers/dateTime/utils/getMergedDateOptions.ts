import { normalizeBoolean } from "./normalizeBoolean";

export type DateFormatOption = "DDMMYYYY" | "MMDDYYYY" | "YYYYMMDD";

export interface MergedDateOptions {
	dateFormat: DateFormatOption;
	separator: string;
	includeTime: boolean;
	isTwentyFourHourFormat: boolean;
}

interface CellWithDateOptions {
	options?: Record<string, unknown>;
}

/**
 * Merge column rawOptions (current field config) with cell options.
 * Column options take precedence so UI reflects latest config (e.g. Include Time).
 */
export function getMergedDateOptions(
	cell: CellWithDateOptions,
	columnRawOptions: Record<string, unknown> | undefined,
	defaultIncludeTime: boolean = false,
): MergedDateOptions {
	const cellOpts = cell.options || {};
	const colOpts = columnRawOptions || {};
	const rawOptions = { ...cellOpts, ...colOpts };
	const dateFormat = ((rawOptions.dateFormat as string) || "DDMMYYYY") as DateFormatOption;
	const separator = (rawOptions.separator as string) || "/";
	const includeTime = normalizeBoolean(
		(rawOptions.includeTime as boolean | string | number | undefined) ?? defaultIncludeTime,
	);
	const isTwentyFourHourFormat = normalizeBoolean(
		rawOptions.isTwentyFourHourFormat as boolean | string | number | undefined,
	);
	return { dateFormat, separator, includeTime, isTwentyFourHourFormat };
}
