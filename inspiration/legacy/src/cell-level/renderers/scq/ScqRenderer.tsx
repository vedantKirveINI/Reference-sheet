// Cell renderer for SCQ type - Inspired by sheets project's ScqRenderer
import { GRID_DEFAULT } from "@/config/grid";
import type {
	ISCQCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { getScqColor } from "./utils/colorUtils";
import { getChipWidth, getChipBorderRadius } from "./utils/chipWidthUtils";
import { validateSCQ } from "./utils/validateScq";
import { drawScqChip } from "./utils/drawScqChip";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingSM } = GRID_DEFAULT;

export const scqRenderer = {
	type: "SCQ" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns width, height, and totalHeight for SCQ chip
	 */
	measure(cell: ISCQCell, props: ICellMeasureProps): ICellMeasureResult {
		const { data, displayData, options } = cell;
		const { ctx, theme, width, height, column } = props;
		// Option A: column (field state) is source for options so new options don't show as error
		const optionsArray =
			column?.options ??
			column?.rawOptions?.options ??
			options?.options ??
			[];

		// Validate value
		const { isValid, newValue } = validateSCQ(
			data || displayData || null,
			optionsArray,
		);

		if (!isValid || !newValue) {
			return { width, height, totalHeight: height };
		}

		// Set font for accurate measurement (needed for proper cell sizing)
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		// Chip always fits in height (single chip, vertically centered)
		// Return standard height
		return { width, height, totalHeight: height };
	},

	/**
	 * Draw cell content on canvas
	 * Renders single chip with dynamic border radius
	 */
	draw(cell: ISCQCell, props: ICellRenderProps) {
		const { data, displayData, options } = cell;
		const { ctx, rect, theme, column } = props;
		const { x, y, width } = rect;
		// Option A: column (field state) is source for options so new options don't show as error
		const optionsArray =
			column?.options ??
			column?.rawOptions?.options ??
			options?.options ??
			[];

		// Validate value
		const { isValid, newValue } = validateSCQ(
			data || displayData || null,
			optionsArray,
		);

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		const cellValue = data || displayData;
		if (
			!isValid &&
			cellValue !== null &&
			cellValue !== undefined &&
			cellValue !== ""
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: String(cellValue),
			});
			return;
		}

		// If empty or no valid value, don't render
		if (!newValue) {
			return;
		}

		// Set font for rendering
		const { cellTextColor, fontSize, fontFamily } = theme;
		ctx.font = `${fontSize}px ${fontFamily}`;

		// Calculate available dimensions (accounting for padding)
		const availableWidth = width - cellHorizontalPadding * 2;

		// Calculate chip width and border radius
		const chipWidth = getChipWidth(ctx, newValue);
		const isWrapped = chipWidth > availableWidth;
		const borderRadius = getChipBorderRadius(
			ctx,
			newValue,
			availableWidth,
			isWrapped,
		);

		// Get chip background color
		const bgColor = getScqColor(newValue, optionsArray);

		// Calculate chip position
		// Horizontal: left padding (8px from left)
		const chipX = x + cellHorizontalPadding;

		// Vertical: top-aligned with slightly smaller padding to fit short rows nicely
		const chipY = y + cellVerticalPaddingSM;

		// Draw chip with dynamic border radius; cap width so chip stays within cell (ellipsis when long)
		drawScqChip({
			ctx,
			x: chipX,
			y: chipY,
			text: newValue,
			backgroundColor: bgColor,
			textColor: cellTextColor,
			fontSize,
			fontFamily,
			borderRadius,
			maxWidth: availableWidth,
		});
	},
};
