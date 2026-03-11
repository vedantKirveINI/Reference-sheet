// Cell renderer for MCQ type - Inspired by sheets project's McqRenderer
import { GRID_DEFAULT } from "@/config/grid";
import type {
	IMCQCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import {
	validateAndParseInput,
	calculateChipLayout,
	getChipColor,
	getChipHeight,
} from "./utils/chipUtils";
import { drawChip } from "./utils/drawChip";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const {
	cellHorizontalPadding,
	cellVerticalPaddingSM,
	cellVerticalPaddingMD,
} = GRID_DEFAULT;

export const mcqRenderer = {
	type: "MCQ" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns width, height, and totalHeight for multi-line chips
	 */
	measure(cell: IMCQCell, props: ICellMeasureProps): ICellMeasureResult {
		const { data, displayData, options } = cell;
		const { ctx, theme, width, height, column } = props;
		// Option A: column (field state) is source for options so new options don't show as error
		const optionsArray =
			column?.options ??
			column?.rawOptions?.options ??
			options?.options ??
			[];

		// Validate and parse input
		const { isValid, parsedValue } = validateAndParseInput(
			data || displayData,
			optionsArray,
		);

		if (!isValid || parsedValue.length === 0) {
			return { width, height, totalHeight: height };
		}

		// Set font for accurate measurement
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		// Calculate available dimensions
		// Reference uses: padding top/bottom 4px each, padding left/right 8px each
		const availableWidth = width - cellHorizontalPadding * 2; // 8px * 2 = 16px total
		const availableHeight = height - 4 * 2; // 4px * 2 = 8px total (matches reference)

		// Determine if chips should wrap (based on available height)
		const chipHeight = getChipHeight();
		const isWrapped = availableHeight > 60 && parsedValue.length > 3;

		// Calculate chip layout to determine if wrapping is needed
		calculateChipLayout(
			ctx,
			parsedValue,
			availableWidth,
			availableHeight,
			isWrapped,
		);

		// Calculate total height needed
		if (isWrapped) {
			// Wrapped: calculate rows needed
			const rowsNeeded = Math.ceil(parsedValue.length / 3); // Rough estimate
			const totalHeight = cellVerticalPaddingMD + rowsNeeded * chipHeight;
			return {
				width,
				height: Math.max(height, totalHeight),
				totalHeight,
			};
		} else {
			// Single row: use standard height
			return { width, height, totalHeight: height };
		}
	},

	/**
	 * Draw cell content on canvas
	 * Renders chips with colors and overflow indicator
	 */
	draw(cell: IMCQCell, props: ICellRenderProps) {
		const { data, displayData, options } = cell;
		const { ctx, rect, theme, column } = props;
		const { x, y, width, height } = rect;
		// Option A: column (field state) is source for options so new options don't show as error
		const optionsArray =
			column?.options ??
			column?.rawOptions?.options ??
			options?.options ??
			[];

		// Validate and parse input
		const { isValid, parsedValue } = validateAndParseInput(
			data || displayData,
			optionsArray,
		);

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		const cellValue = data || displayData;
		if (
			!isValid &&
			cellValue !== null &&
			cellValue !== undefined &&
			!(Array.isArray(cellValue) && cellValue.length === 0) &&
			!(typeof cellValue === "string" && cellValue === "")
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value:
					typeof cellValue === "string"
						? cellValue
						: JSON.stringify(cellValue),
			});
			return;
		}

		// If empty or no valid parsed value, don't render
		if (parsedValue.length === 0) {
			return;
		}

		// Set font for rendering
		const { cellTextColor, fontSize, fontFamily } = theme;
		ctx.font = `${fontSize}px ${fontFamily}`;

		// Calculate available dimensions (accounting for padding)
		// Reference uses: padding top/bottom 8px (4px each), padding left/right 8px (4px each)
		// But we use cellHorizontalPadding (8px) for horizontal, and 4px for vertical (like reference)
		const availableWidth = width - cellHorizontalPadding * 2; // 8px * 2 = 16px total
		const availableHeight = height - 4 * 2; // 4px * 2 = 8px total (matches reference)

		// Determine if chips should wrap
		const isWrapped = availableHeight > 60 && parsedValue.length > 3;

		// Calculate chip layout (visible chips and overflow)
		const { limitValue, visibleChips } = calculateChipLayout(
			ctx,
			parsedValue,
			availableWidth,
			availableHeight,
			isWrapped,
		);

		// Starting position for chips - top-left aligned like text cells
		const startX = x + cellHorizontalPadding;
		let chipX = startX;

		// Align chips to the top with slightly smaller padding so they fit nicely in short rows
		const chipY = y + cellVerticalPaddingSM;
		const gap = 4; // Gap between chips

		// Draw visible chips (maxWidth keeps each chip within cell bounds; ellipsis when long)
		visibleChips.forEach((chipValue, index) => {
			const bgColor = getChipColor(index);
			const remainingWidth = Math.max(0, availableWidth - (chipX - startX));

			const chipWidth = drawChip({
				ctx,
				x: chipX,
				y: chipY,
				text: chipValue,
				backgroundColor: bgColor,
				textColor: cellTextColor,
				fontSize,
				fontFamily,
				maxWidth: remainingWidth,
			});

			chipX += chipWidth + gap;
		});

		// Draw overflow indicator (+N) if needed
		if (limitValue && visibleChips.length > 0 && !isWrapped) {
			const limitBgColor = "#F5F5F5"; // Light gray for overflow indicator
			const remainingWidth = Math.max(0, availableWidth - (chipX - startX));
			drawChip({
				ctx,
				x: chipX,
				y: chipY,
				text: limitValue,
				backgroundColor: limitBgColor,
				textColor: cellTextColor,
				fontSize,
				fontFamily,
				maxWidth: remainingWidth,
			});
		}
	},
};
