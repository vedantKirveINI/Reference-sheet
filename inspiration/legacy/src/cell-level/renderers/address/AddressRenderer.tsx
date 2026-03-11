/**
 * Address Cell Renderer
 * Renders address data as comma-separated string on canvas
 * Inspired by StringRenderer pattern
 */
import { GRID_DEFAULT } from "@/config/grid";
import { drawMultiLineText } from "@/utils/baseRenderer";
import type {
	IAddressCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { validateAndParseAddress } from "./utils/validateAndParseAddress";
import { getAddress } from "./utils/getAddress";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const {
	maxRowCount,
	cellHorizontalPadding,
	cellVerticalPaddingMD,
	cellTextLineHeight,
} = GRID_DEFAULT;

export const addressRenderer = {
	type: "Address" as const,

	/**
	 * Measure cell dimensions without rendering
	 */
	measure(cell: IAddressCell, props: ICellMeasureProps): ICellMeasureResult {
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
	 * Renders address as comma-separated string
	 */
	draw(cell: IAddressCell, props: ICellRenderProps) {
		const { data, displayData } = cell;
		const { ctx, rect, theme, isActive } = props;
		const { x, y, width, height } = rect;

		// Validate first
		const cellValue = data || displayData;
		let validationResult: { isValid: boolean; parsedValue: any } | null =
			null;

		if (
			displayData &&
			typeof displayData === "string" &&
			displayData.trim() !== ""
		) {
			// Check if it looks like a formatted address (contains commas) vs JSON
			if (!displayData.startsWith("{") && !displayData.startsWith("[")) {
				// Already formatted string - treat as valid
				validationResult = { isValid: true, parsedValue: null };
			} else {
				// It's JSON, validate it
				validationResult = validateAndParseAddress(displayData);
			}
		} else if (data) {
			// Validate data object
			validationResult = validateAndParseAddress(data);
		}

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		if (
			validationResult &&
			!validationResult.isValid &&
			cellValue !== null &&
			cellValue !== undefined &&
			cellValue !== ""
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

		// Use displayData if it's already a formatted string, otherwise parse and format
		let addressString = "";

		if (
			displayData &&
			typeof displayData === "string" &&
			displayData.trim() !== ""
		) {
			// If displayData is already formatted (comma-separated), use it directly
			// Check if it looks like a formatted address (contains commas) vs JSON
			if (!displayData.startsWith("{") && !displayData.startsWith("[")) {
				addressString = displayData;
			} else {
				// It's JSON, parse and format
				if (validationResult?.isValid && validationResult.parsedValue) {
					addressString = getAddress(validationResult.parsedValue);
				}
			}
		} else if (
			data &&
			validationResult?.isValid &&
			validationResult.parsedValue
		) {
			// Parse from data object
			addressString = getAddress(validationResult.parsedValue);
		}

		if (!addressString) return;

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
			text: addressString,
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
