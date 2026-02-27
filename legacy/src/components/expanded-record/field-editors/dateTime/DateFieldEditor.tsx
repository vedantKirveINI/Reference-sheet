// Date Field Editor for Expanded Record
// Date picker for date/datetime/time fields
// Uses DateTimePicker component (like cell-level editors)

import React, { useMemo } from "react";
import DateTimePicker from "@/components/DateTimePicker";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IDateTimeCell, ITimeCell } from "@/types";
import { CellType } from "@/types";
import styles from "./DateFieldEditor.module.scss";

/**
 * DateFieldEditor - Date/DateTime/Time input editor
 *
 * Handles:
 * - DateTime: Date with optional time
 * - Time: Time only (12hr or 24hr format)
 */
export const DateFieldEditor: React.FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	// Determine field type and options
	const isTimeField = field.type === CellType.Time;
	const dateTimeCell = cell as IDateTimeCell | undefined;
	const timeCell = cell as ITimeCell | undefined;

	// Normalize boolean values (backend may send string/number)
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

	// Get options based on field type
	const { dateFormat, separator, includeTime, isTwentyFourHourFormat } =
		useMemo(() => {
			if (isTimeField) {
				// Time field - always include time, check isTwentyFourHour option
				const opts = timeCell?.options || (field.options as any);
				const isTwentyFourHourRaw = opts?.isTwentyFourHour;
				return {
					dateFormat: "DDMMYYYY" as const,
					separator: "/",
					includeTime: true, // Time fields always include time
					isTwentyFourHourFormat: normalizeBoolean(
						isTwentyFourHourRaw !== undefined
							? isTwentyFourHourRaw
							: false,
					),
				};
			} else {
				// DateTime field - check includeTime and isTwentyFourHourFormat options
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

	// Convert value to ISO string for DateTimePicker
	const dateTimeValue = useMemo(() => {
		if (!value) return null;
		if (typeof value === "string") return value;
		return String(value);
	}, [value]);

	// Handle change from DateTimePicker
	const handleChange = (newValue: string | null) => {
		onChange(newValue);
	};

	return (
		<div className={styles.date_field_editor}>
			<DateTimePicker
				value={dateTimeValue}
				onChange={handleChange}
				dateFormat={dateFormat}
				separator={separator}
				includeTime={includeTime}
				isTwentyFourHourFormat={isTwentyFourHourFormat}
				hideBorders={false}
				inputFocus={false}
				sx={{
					"& .MuiInputBase-input": {
						fontSize: "0.875rem",
						fontFamily: "Inter, sans-serif",
						padding: "0.5rem 0.75rem",
						cursor: readonly ? "not-allowed" : "text",
					},
					"& .MuiOutlinedInput-root": {
						borderRadius: "0.375rem",
						backgroundColor: readonly ? "#f5f5f5" : "#ffffff",
						"&.Mui-disabled": {
							backgroundColor: "#f5f5f5",
						},
					},
					"& .MuiInputBase-input[readonly]": {
						cursor: "not-allowed",
					},
				}}
			/>
		</div>
	);
};
