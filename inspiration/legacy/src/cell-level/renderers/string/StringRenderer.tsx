// Cell renderer for string type - Inspired by Teable's cell renderer architecture
import { GRID_DEFAULT } from "@/config/grid";
import { drawMultiLineText } from "@/utils/baseRenderer";
import type {
	IStringCell,
	IFormulaCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { LoadingCell } from "../loading/LoadingCell";

const {
	maxRowCount,
	cellHorizontalPadding,
	cellVerticalPaddingMD,
	cellTextLineHeight,
} = GRID_DEFAULT;

export const stringRenderer = {
	type: "String" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns width, height, and totalHeight for multi-line cells
	 */
	measure(cell: IStringCell, props: ICellMeasureProps): ICellMeasureResult {
		const { displayData } = cell;
		const { ctx, theme, width, height } = props;
		const { cellTextColor } = theme;

		if (!displayData) {
			return { width, height, totalHeight: height };
		}

		// Set font for accurate measurement
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		// Calculate line count using drawMultiLineText with needRender: false
		const lineCount = drawMultiLineText(ctx, {
			text: displayData,
			maxLines: Infinity, // Calculate all lines for totalHeight
			lineHeight: cellTextLineHeight,
			maxWidth: width - cellHorizontalPadding * 2,
			fill: cellTextColor,
			fontSize: theme.fontSize,
			needRender: false, // Don't render, just calculate
		}).length;

		// Calculate total height (full content height)
		const totalHeight =
			cellVerticalPaddingMD + lineCount * cellTextLineHeight;

		// Calculate display height (limited to maxRowCount when not active)
		const displayRowCount = Math.min(maxRowCount, lineCount);
		const displayHeight = Math.max(
			height,
			cellVerticalPaddingMD + displayRowCount * cellTextLineHeight,
		);

		return {
			width,
			height: displayHeight,
			totalHeight,
		};
	},

	/**
	 * Draw cell content on canvas
	 * Supports multi-line text with active cell expansion
	 * Also handles formula cells with loading and error states
	 */
	draw(cell: IStringCell | IFormulaCell, props: ICellRenderProps) {
		const { displayData } = cell;
		const { ctx, rect, theme, isActive, cellLoading, rowId, fieldId } =
			props;
		const { x, y, width, height } = rect;

		// Check if this is a formula cell
		const isFormulaCell =
			(cell as IFormulaCell).options?.computedFieldMeta !== undefined;
		const formulaCell = cell as IFormulaCell;
		const computedFieldMeta = formulaCell.options?.computedFieldMeta;

		// Check loading state for formula cells
		if (isFormulaCell && cellLoading && rowId && fieldId) {
			const isCellLoading = cellLoading[rowId]?.[fieldId];
			if (isCellLoading) {
				// Show loading state (shimmer effect)
				LoadingCell.draw({
					ctx,
					rect,
					theme,
					variant: "rounded",
					shouldShowText: false,
				});
				return;
			}
		}

		// Check error state for formula cells
		if (isFormulaCell && computedFieldMeta?.hasError) {
			// Draw text with reduced width to make room for icon
			const textWidth = width - cellHorizontalPadding * 2 - 4; // 4px gap
			if (displayData) {
				const { cellTextColor, fontSize, fontFamily } = theme;
				ctx.font = `${fontSize}px ${fontFamily}`;
				const renderHeight = height - cellVerticalPaddingMD;
				const maxLines = isActive
					? Infinity
					: Math.max(
							Math.floor(renderHeight / cellTextLineHeight),
							1,
						);

				drawMultiLineText(ctx, {
					x: x + cellHorizontalPadding,
					y: y + cellVerticalPaddingMD,
					text: displayData,
					maxLines,
					lineHeight: cellTextLineHeight,
					maxWidth: textWidth,
					fill: cellTextColor,
					fontSize,
					textAlign: "left",
					verticalAlign: "top",
					needRender: true,
				});
			}
			return;
		}

		// Normal string rendering
		if (!displayData) return;

		const { cellTextColor, fontSize, fontFamily } = theme;

		// Set font for rendering
		ctx.font = `${fontSize}px ${fontFamily}`;

		// Calculate available render height (excluding padding)
		const renderHeight = height - cellVerticalPaddingMD;

		// Calculate max lines:
		// - If active: show unlimited lines (Infinity)
		// - If not active: calculate based on available height
		const maxLines = isActive
			? Infinity
			: Math.max(Math.floor(renderHeight / cellTextLineHeight), 1);

		// Draw multi-line text with proper padding and clipping
		drawMultiLineText(ctx, {
			x: x + cellHorizontalPadding,
			y: y + cellVerticalPaddingMD,
			text: displayData,
			maxLines,
			lineHeight: cellTextLineHeight,
			maxWidth: width - cellHorizontalPadding * 2,
			fill: cellTextColor,
			fontSize,
			textAlign: "left",
			verticalAlign: "top",
			needRender: true,
		});
	},
};
