// Cell renderer for number type - Inspired by Teable's cell renderer architecture
import { GRID_DEFAULT } from "@/config/grid";
import { drawMultiLineText } from "@/utils/baseRenderer";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";
import type {
	INumberCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";

const {
	maxRowCount,
	cellVerticalPaddingMD,
	cellHorizontalPadding,
	cellTextLineHeight,
} = GRID_DEFAULT;

/**
 * Validate number value
 * Inspired by sheets repo's NumberRenderer validation
 * Returns true if value is valid (null/undefined/empty are valid, or valid number)
 */
function validateNumber(value: unknown): boolean {
	if (value === null || value === undefined || value === "") {
		return true; // Empty values are valid
	}

	// Check if value is a valid number
	// Allow both string and number types
	const numValue = typeof value === "string" ? value.trim() : String(value);
	// Check if it's a valid number (allows decimals, negatives, etc.)
	return !isNaN(Number(numValue)) && numValue !== "";
}

export const numberRenderer = {
	type: "Number" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns width, height, and totalHeight for multi-line cells
	 */
	measure(cell: INumberCell, props: ICellMeasureProps): ICellMeasureResult {
		const { displayData } = cell;
		const { ctx, theme, width, height } = props;

		// If no display data, return default dimensions
		if (!displayData || displayData === "") {
			return { width, height, totalHeight: height };
		}

		// Set font for accurate measurement
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		// For numbers, displayData is typically a string
		// If it's an array (multi-value), handle it separately
		if (Array.isArray(displayData)) {
			const lineCount = displayData.length;
			const totalHeight =
				cellVerticalPaddingMD + lineCount * cellTextLineHeight;
			const displayRowCount = Math.min(maxRowCount, lineCount);

			return {
				width,
				height: Math.max(
					height,
					cellVerticalPaddingMD +
						displayRowCount * cellTextLineHeight,
				),
				totalHeight,
			};
		}

		// Single value - calculate text wrapping
		const lineCount = drawMultiLineText(ctx, {
			text: displayData,
			maxLines: Infinity, // Calculate all lines for totalHeight
			lineHeight: cellTextLineHeight,
			maxWidth: width - cellHorizontalPadding * 2,
			fill: theme.cellTextColor,
			fontSize: theme.fontSize,
			textAlign: "right",
			needRender: false, // Don't render, just calculate
		}).length;

		const totalHeight =
			cellVerticalPaddingMD + lineCount * cellTextLineHeight;
		const displayRowCount = Math.min(maxRowCount, lineCount);

		return {
			width,
			height: Math.max(
				height,
				cellVerticalPaddingMD + displayRowCount * cellTextLineHeight,
			),
			totalHeight,
		};
	},

	/**
	 * Draw cell content on canvas
	 * Supports multi-line text with active cell expansion
	 * Numbers are right-aligned by default
	 */
	draw(cell: INumberCell, props: ICellRenderProps) {
		const { data, displayData } = cell;
		const { ctx, rect, theme, isActive } = props;
		const { x, y, width, height } = rect;

		// Validate the value - show error if invalid
		// Match sheets repo: show error if invalid AND value is not empty/null
		const isValidNumber = validateNumber(data ?? displayData);
		if (
			!isValidNumber &&
			data !== null &&
			data !== undefined &&
			displayData !== null &&
			displayData !== undefined &&
			displayData !== ""
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: String(displayData || data),
			});
			return;
		}

		// If no data or display data, don't render
		if (data == null || displayData == null || displayData === "") return;

		const { cellTextColor, fontSize, fontFamily } = theme;

		// Set font for rendering
		ctx.font = `${fontSize}px ${fontFamily}`;

		// Calculate text position (right-aligned)
		const textX = x + width - cellHorizontalPadding;
		const textMaxWidth = width - cellHorizontalPadding * 2;
		const renderHeight = height - cellVerticalPaddingMD;

		// Handle multi-value arrays (if displayData is an array)
		if (Array.isArray(displayData)) {
			// Calculate max lines based on active state
			const maxLines = isActive
				? Infinity
				: Math.max(Math.floor(renderHeight / cellTextLineHeight), 1);

			// Draw each value on a separate line
			let curY = y + cellVerticalPaddingMD;
			const rowsToRender = isActive
				? displayData.length
				: Math.min(maxLines, displayData.length);

			for (let i = 0; i < rowsToRender; i++) {
				const text =
					i === displayData.length - 1
						? displayData[i]
						: `${displayData[i]},`;
				drawMultiLineText(ctx, {
					x: textX,
					y: curY,
					text,
					maxLines: 1,
					maxWidth: textMaxWidth,
					fill: cellTextColor,
					fontSize,
					textAlign: "right",
					verticalAlign: "top",
					needRender: true,
				});
				curY += cellTextLineHeight;
			}
			return;
		}

		// Single value - render as string
		const maxLines = isActive
			? Infinity
			: Math.max(Math.floor(renderHeight / cellTextLineHeight), 1);

		drawMultiLineText(ctx, {
			x: textX,
			y: y + cellVerticalPaddingMD,
			text: displayData,
			maxLines,
			lineHeight: cellTextLineHeight,
			maxWidth: textMaxWidth,
			fill: cellTextColor,
			fontSize,
			textAlign: "right",
			verticalAlign: "top",
			needRender: true,
		});
	},
};
