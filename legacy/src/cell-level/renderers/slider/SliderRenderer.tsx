// Cell renderer for Slider type - Inspired by Teable's progress bar rendering
import { GRID_DEFAULT } from "@/config/grid";
import type {
	ISliderCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { validateSlider } from "./utils/validateSlider";
import { drawProgressBar } from "./utils/drawProgressBar";
import { drawSingleLineText } from "@/utils/baseRenderer";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingMD } = GRID_DEFAULT;

// Constants for slider rendering
const SLIDER_BAR_HEIGHT = 8; // Height of progress bar
const SLIDER_TEXT_GAP = 4; // Gap between bar and text
const SLIDER_DEFAULT_MIN = 0;
const SLIDER_DEFAULT_MAX = 10;

export const sliderRenderer = {
	type: "Slider" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns standard cell dimensions (no special sizing needed)
	 */
	measure(_cell: ISliderCell, props: ICellMeasureProps): ICellMeasureResult {
		const { width, height } = props;

		// Slider cells use standard dimensions
		return { width, height, totalHeight: height };
	},

	/**
	 * Draw cell content on canvas
	 * Renders progress bar showing value relative to maxValue
	 */
	draw(cell: ISliderCell, props: ICellRenderProps) {
		const { data, displayData, options } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, width, height } = rect;

		// Get minValue and maxValue from options, with defaults
		const minValue = options?.minValue ?? SLIDER_DEFAULT_MIN;
		const maxValue = options?.maxValue ?? SLIDER_DEFAULT_MAX;

		// Validate the value
		const { isValid, processedValue } = validateSlider({
			value: data,
			minValue,
			maxValue,
		});

		// Show error if invalid AND value is not empty/null
		// Note: data is number | null, so we only check for null/undefined
		if (!isValid && data !== null && data !== undefined) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: String(displayData || data),
			});
			return;
		}

		// If value is null or processedValue is null, don't render anything
		if (processedValue === null) {
			return;
		}

		// Calculate available width for progress bar
		const availableWidth = width - cellHorizontalPadding * 2;

		// Align bar to the top with standard vertical padding
		const barY = y + cellVerticalPaddingMD;

		// Draw progress bar
		drawProgressBar({
			ctx,
			x: x + cellHorizontalPadding,
			y: barY,
			width: availableWidth,
			height: SLIDER_BAR_HEIGHT,
			value: processedValue,
			maxValue,
			minValue,
			radius: 4,
			filledColor: theme.cellActiveBorderColor || "#212121",
			unfilledColor: "#E0E0E0",
		});

		// Optionally draw text label (e.g., "5/10") next to the bar, top-aligned
		const textX =
			x + cellHorizontalPadding + availableWidth + SLIDER_TEXT_GAP;
		const textY = barY;

		// Set font for text measurement
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		// Check if there's enough space for text
		const textLabel = displayData || `${processedValue}/${maxValue}`;
		const textWidth = ctx.measureText(textLabel).width;
		const remainingWidth = width - (textX - x);

		if (remainingWidth >= textWidth + cellHorizontalPadding) {
			// Draw text label
			drawSingleLineText(ctx, {
				x: textX,
				y: textY,
				text: textLabel,
				fill: theme.cellTextColor,
				fontSize: theme.fontSize,
				textAlign: "left",
				verticalAlign: "top",
				needRender: true,
			});
		}
	},
};
