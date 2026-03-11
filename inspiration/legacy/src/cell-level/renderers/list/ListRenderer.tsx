// Cell renderer for List type - Inspired by sheets project's ListRenderer
import { GRID_DEFAULT } from "@/config/grid";
import type {
	IListCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import {
	calculateChipLayout,
	getChipColor,
	getChipHeight,
} from "../mcq/utils/chipUtils";
import { drawChip } from "../mcq/utils/drawChip";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";
import { validateAndParseList } from "./utils/validateAndParseList";

const { cellHorizontalPadding, cellVerticalPaddingSM, cellVerticalPaddingMD } =
	GRID_DEFAULT;

export const listRenderer = {
	type: "List" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns width, height, and totalHeight for multi-line chips
	 */
	measure(cell: IListCell, props: ICellMeasureProps): ICellMeasureResult {
		const { data, displayData } = cell;
		const { ctx, theme, width, height } = props;

		// Validate and parse input
		const { isValid, parsedValue } = validateAndParseList(
			data || displayData,
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
			parsedValue.map(String), // Convert to strings for layout calculation
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
	 * Shows error if data structure is invalid (e.g., array of objects)
	 */
	draw(cell: IListCell, props: ICellRenderProps) {
		const { data, displayData } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, width, height } = rect;

		// Validate and parse input
		const { isValid, parsedValue } = validateAndParseList(
			data || displayData,
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
		const availableWidth = width - cellHorizontalPadding * 2; // 8px * 2 = 16px total
		const availableHeight = height - 4 * 2; // 4px * 2 = 8px total (matches reference)

		// Determine if chips should wrap
		const isWrapped = availableHeight > 60 && parsedValue.length > 3;

		// Calculate chip layout (visible chips and overflow)
		const { limitValue, visibleChips } = calculateChipLayout(
			ctx,
			parsedValue.map(String), // Convert to strings for display
			availableWidth,
			availableHeight,
			isWrapped,
		);

		// Starting position for chips - top-left aligned
		let chipX = x + cellHorizontalPadding; // 8px from left

		// Align chips to the top with compact padding for short rows
		const chipY = y + cellVerticalPaddingSM;
		const gap = 4; // Gap between chips

		// Draw visible chips
		visibleChips.forEach((chipValue, index) => {
			const bgColor = getChipColor(index);

			// Draw chip (returns chip width)
			const chipWidth = drawChip({
				ctx,
				x: chipX,
				y: chipY,
				text: chipValue,
				backgroundColor: bgColor,
				textColor: cellTextColor,
				fontSize,
				fontFamily,
			});

			// Move to next chip position (chipWidth already includes gap in calculation)
			chipX += chipWidth + gap;
		});

		// Draw overflow indicator (+N) if needed
		if (limitValue && visibleChips.length > 0 && !isWrapped) {
			// Draw limit value chip
			const limitBgColor = "#F5F5F5"; // Light gray for overflow indicator
			drawChip({
				ctx,
				x: chipX,
				y: chipY,
				text: limitValue,
				backgroundColor: limitBgColor,
				textColor: cellTextColor,
				fontSize,
				fontFamily,
			});
		}
	},
};
