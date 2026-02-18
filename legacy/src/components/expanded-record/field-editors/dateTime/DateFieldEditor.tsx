import React, { useMemo } from "react";
import DateTimePicker from "@/components/DateTimePicker";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IDateTimeCell, ITimeCell } from "@/types";
import { CellType } from "@/types";

export const DateFieldEditor: React.FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const isTimeField = field.type === CellType.Time;
	const dateTimeCell = cell as IDateTimeCell | undefined;
	const timeCell = cell as ITimeCell | undefined;

	const normalizeBoolean = (
		val: boolean | string | number | undefined,
	): boolean => {
		return Boolean(
			val === true ||
			val === "true" ||
			val === 1 ||
			val === "1" ||
			String(val).toLowerCase() === "true",
		);
	};

	const { dateFormat, separator, includeTime, isTwentyFourHourFormat } =
		useMemo(() => {
			if (isTimeField) {
				const opts = timeCell?.options || (field.options as any);
				const isTwentyFourHourRaw = opts?.isTwentyFourHour;
				return {
					dateFormat: "DDMMYYYY" as const,
					separator: "/",
					includeTime: true,
					isTwentyFourHourFormat: normalizeBoolean(
						isTwentyFourHourRaw !== undefined
							? isTwentyFourHourRaw
							: false,
					),
				};
			} else {
				const opts = dateTimeCell?.options || (field.options as any);
				const includeTimeRaw = opts?.includeTime;
				const isTwentyFourHourFormatRaw = opts?.isTwentyFourHourFormat;
				return {
					dateFormat: (opts?.dateFormat || "DDMMYYYY") as
						| "DDMMYYYY"
						| "MMDDYYYY"
						| "YYYYMMDD",
					separator: opts?.separator || "/",
					includeTime: normalizeBoolean(
						includeTimeRaw !== undefined ? includeTimeRaw : false,
					),
					isTwentyFourHourFormat: normalizeBoolean(
						isTwentyFourHourFormatRaw !== undefined
							? isTwentyFourHourFormatRaw
							: false,
					),
				};
			}
		}, [isTimeField, timeCell, dateTimeCell, field.options]);

	const dateTimeValue = useMemo(() => {
		if (!value) return null;
		if (typeof value === "string") return value;
		return String(value);
	}, [value]);

	const handleChange = (newValue: string | null) => {
		onChange(newValue);
	};

	return (
		<div className="w-full relative min-h-[36px]">
			<DateTimePicker
				value={dateTimeValue}
				onChange={handleChange}
				dateFormat={dateFormat}
				separator={separator}
				includeTime={includeTime}
				isTwentyFourHourFormat={isTwentyFourHourFormat}
				hideBorders={false}
				inputFocus={false}
			/>
		</div>
	);
};
