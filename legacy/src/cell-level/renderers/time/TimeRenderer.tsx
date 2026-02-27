// Cell renderer for Time type - Inspired by sheets project's TimeRenderer
import { GRID_DEFAULT } from "@/config/grid";
import { drawSingleLineText } from "@/utils/baseRenderer";
import type {
	ITimeCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import {
	validateAndParseTime,
	formatTimeDisplay,
	parseISOValueForTime,
} from "@/utils/dateHelpers";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingMD } = GRID_DEFAULT;

export const timeRenderer = {
	type: "Time" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns standard cell dimensions (no special sizing needed)
	 */
	measure(_cell: ITimeCell, props: ICellMeasureProps): ICellMeasureResult {
		const { width, height } = props;

		// Time cells use standard dimensions
		return { width, height, totalHeight: height };
	},

	/**
	 * Draw cell content on canvas
	 * Renders time in "HH:MM" or "HH:MM AM/PM" format based on isTwentyFourHour option
	 */
	draw(cell: ITimeCell, props: ICellRenderProps) {
		const { data, displayData, options } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, width, height } = rect;

		// Get isTwentyFourHour from options (default: false for 12hr format)
		const isTwentyFourHour = options?.isTwentyFourHour ?? false;

		// Validate time data first
		// Prioritize data over displayData for validation
		// If data is null (invalid), use displayData which contains the original invalid value
		const valueToValidate =
			data !== null && data !== undefined ? data : displayData;
		const cellValue = data || displayData;

		// Always validate if we have a value
		let validationResult: {
			isValid: boolean;
			parsedValue: {
				time: string;
				meridiem: string;
				ISOValue: string;
				timeZone?: string;
			} | null;
		} | null = null;

		// Check if we have any value to validate
		const hasAnyValue =
			(data !== null && data !== undefined) ||
			(displayData !== null &&
				displayData !== undefined &&
				displayData !== "");

		if (
			hasAnyValue &&
			valueToValidate !== null &&
			valueToValidate !== undefined
		) {
			// Validate the value
			validationResult = validateAndParseTime(
				valueToValidate,
				isTwentyFourHour,
			);
		}

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		if (validationResult && !validationResult.isValid && hasAnyValue) {
			// Show error cell with the invalid value
			// Use displayData if it's a string (might contain the raw invalid value), otherwise stringify data
			const errorValue =
				typeof displayData === "string" && displayData !== ""
					? displayData
					: typeof valueToValidate === "string"
						? valueToValidate
						: JSON.stringify(valueToValidate || cellValue);

			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: errorValue,
			});
			return;
		}

		// Parse and validate time data
		let timeData: {
			time: string;
			meridiem: string;
			ISOValue: string;
			timeZone?: string;
		} | null = null;

		if (data) {
			// Use data if available
			timeData = data;
		} else if (
			displayData &&
			validationResult?.isValid &&
			validationResult.parsedValue
		) {
			// Use parsed value from validation
			timeData = validationResult.parsedValue;
		}

		// Extract time components - handle null/undefined/empty string
		let { time, meridiem, ISOValue } = timeData || {};
		time = time || "";
		meridiem = meridiem || "";
		ISOValue = ISOValue || "";

		// If we have ISOValue but missing or empty time, parse from ISO
		// This is important for 24hr format where time might be in ISOValue only
		// Check both !time (for null/undefined) and time.trim() === "" (for empty string)
		if (ISOValue && (!time || time.trim() === "")) {
			const parsed = parseISOValueForTime(ISOValue, isTwentyFourHour);
			if (parsed) {
				const { hours, minutes, meridiem: parsedMeridiem } = parsed;
				if (hours && minutes) {
					time = `${hours}:${minutes}`;
					if (!isTwentyFourHour && parsedMeridiem) {
						meridiem = parsedMeridiem;
					}
				}
			}
		} else if (ISOValue && time && !isTwentyFourHour && !meridiem) {
			// For 12hr format: if we have time but missing meridiem, try to get it from ISO
			const parsed = parseISOValueForTime(ISOValue, isTwentyFourHour);
			if (parsed && parsed.meridiem) {
				meridiem = parsed.meridiem;
			}
		}

		// If we still don't have time, try using displayData directly (it might already be formatted)
		if (
			(!time || time.trim() === "") &&
			displayData &&
			displayData.trim() !== ""
		) {
			// For 24hr format, displayData should be "HH:MM"
			// For 12hr format, displayData should be "HH:MM AM/PM"
			// Try to extract time from displayData
			const timeMatch = displayData.match(/^(\d{1,2}:\d{2})/);
			if (timeMatch) {
				time = timeMatch[1];
				// Pad hours if needed
				const [hours, minutes] = time.split(":");
				time = `${hours.padStart(2, "0")}:${minutes}`;
			}
		}

		// If no time after all parsing attempts, don't render anything
		// Check both !time and empty string
		if (!time || time.trim() === "") {
			return;
		}

		// Format time for display
		const displayText = formatTimeDisplay(time, meridiem, isTwentyFourHour);

		if (!displayText) {
			return;
		}

		// Set font for rendering
		const { cellTextColor, fontSize, fontFamily } =
			theme;
		ctx.font = `${fontSize}px ${fontFamily}`;

		// Align to top with standard vertical padding (match text cells)
		const textY = y + cellVerticalPaddingMD;

		drawSingleLineText(ctx, {
			x: x + cellHorizontalPadding,
			y: textY,
			text: displayText,
			fill: cellTextColor,
			fontSize,
			textAlign: "left",
			verticalAlign: "top",
			maxWidth: width - cellHorizontalPadding * 2,
			needRender: true,
		});
	},
};
