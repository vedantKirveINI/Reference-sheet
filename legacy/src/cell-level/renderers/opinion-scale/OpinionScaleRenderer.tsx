import { GRID_DEFAULT } from "@/config/grid";
import type {
	IOpinionScaleCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { OpinionScaleEditor } from "@/cell-level/editors/opinion-scale/OpinionScaleEditor";
import { validateOpinionScale } from "./utils/validateOpinionScale";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingMD } = GRID_DEFAULT;

export const opinionScaleRenderer = {
	type: "OpinionScale" as const,

	measure(
		cell: IOpinionScaleCell,
		props: ICellMeasureProps,
	): ICellMeasureResult {
		const { width, height, theme, ctx } = props;
		const maxValue = cell.options?.maxValue ?? 10;

		// Calculate text width for the widest possible value (e.g., "10/10")
		// Use a temporary canvas to measure text
		ctx.save();
		ctx.font = `${theme.fontSize || 14}px ${theme.fontFamily || "Arial"}`;
		const widestText = `${maxValue}/${maxValue}`;
		const textMetrics = ctx.measureText(widestText);
		const textWidth = textMetrics.width;
		ctx.restore();

		// Calculate total width needed (padding + text)
		const totalWidth = cellHorizontalPadding * 2 + textWidth;

		return {
			width: Math.max(width, totalWidth),
			height,
			totalHeight: height,
		};
	},

	draw(cell: IOpinionScaleCell, props: ICellRenderProps) {
		const { data, options } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, height } = rect;

		// Get options with defaults
		const maxValue = options?.maxValue ?? 10;

		// Validate the value
		const { isValid, processedValue } = validateOpinionScale({
			value: data,
			maxValue,
		});

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		if (
			!isValid &&
			data !== null &&
			data !== undefined &&
			data !== ""
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: String(data),
			});
			return;
		}

		// Don't render anything if data is null (like Rating)
		if (data == null || processedValue == null) return;

		// Format display text (e.g., "4/10")
		const displayText = `${processedValue}/${maxValue}`;

		// Get text color from theme
		const textColor = theme.cellTextColor || "#212121";

		// Set font properties
		const fontSize = theme.fontSize || 14;
		ctx.font = `${fontSize}px ${theme.fontFamily || "Arial"}`;
		ctx.fillStyle = textColor;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";

		// Align text to the top with standard vertical padding (like String/Number)
		const textY = y + cellVerticalPaddingMD;

		// Draw text with horizontal padding
		ctx.fillText(displayText, x + cellHorizontalPadding, textY);
	},

	provideEditor: () => OpinionScaleEditor,
};
