/**
 * Error cell renderer utility
 * Draws invalid cell values with error icon on canvas
 * Inspired by sheets repo's ErrorCellRenderer but adapted for canvas rendering
 * Pattern: Similar to LoadingCell.tsx
 */

import { GRID_DEFAULT } from "@/config/grid";
import { drawSingleLineText } from "@/utils/baseRenderer";
import { drawErrorIcon, ERROR_ICON_WIDTH } from "./utils/loadErrorIcon";
import { ERROR_ICON_GAP, ERROR_ICON_HEIGHT } from "./utils/constants";

const { cellHorizontalPadding } = GRID_DEFAULT;

interface ErrorCellProps {
	ctx: CanvasRenderingContext2D;
	rect: { x: number; y: number; width: number; height: number };
	theme: {
		fontSize?: number;
		fontFamily?: string;
		cellTextColor?: string;
	};
	value: string; // The invalid value to display
}

/**
 * Draw error text on canvas (left-aligned, with truncation, top-aligned)
 */
function drawErrorText(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	text: string,
	theme: {
		fontSize?: number;
		fontFamily?: string;
		cellTextColor?: string;
	},
): void {
	const fontSize = theme.fontSize || 14;
	const fontFamily = theme.fontFamily || "Arial";
	const textColor = theme.cellTextColor || "#212121";

	// Set font for text measurement and rendering
	ctx.font = `${fontSize}px ${fontFamily}`;

	// Calculate available width for text (accounting for padding, gap, and icon)
	const availableTextWidth =
		width - cellHorizontalPadding * 2 - ERROR_ICON_GAP - ERROR_ICON_WIDTH;

	// Draw text with truncation (drawSingleLineText handles ellipsis)
	drawSingleLineText(ctx, {
		x: x + cellHorizontalPadding,
		y: y + cellHorizontalPadding,
		text,
		maxWidth: availableTextWidth,
		fill: textColor,
		fontSize,
		textAlign: "left",
		verticalAlign: "top",
		needRender: true,
	});
}

/**
 * Draw error icon on canvas (right-aligned, vertically centered with text)
 */
function drawErrorIconRight(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	_height: number,
	theme: {
		fontSize?: number;
		fontFamily?: string;
		cellTextColor?: string;
	},
): void {
	const fontSize = theme.fontSize || 14;
	
	// Calculate icon position (right-aligned with padding)
	const iconX = x + width - cellHorizontalPadding - ERROR_ICON_WIDTH;
	
	// Align icon vertically with text center
	// Text top is at: y + cellVerticalPaddingSM
	// Text visual center is approximately at: y + cellVerticalPaddingSM + fontSize/2
	// Icon center should match text center, so icon top is: textCenter - iconHeight/2
	const textTop = y + cellHorizontalPadding;
	const textCenter = textTop + fontSize / 2;
	const iconY = textCenter - ERROR_ICON_HEIGHT / 2;

	// Draw error icon (handles loading and placeholder internally)
	drawErrorIcon(ctx, iconX, iconY);
}

export const ErrorCell = {
	/**
	 * Draw error state on canvas
	 * Shows invalid value with error icon (text left, icon right, space-between layout)
	 * Matches sheets repo's ErrorCellRenderer layout
	 * Includes light red background to match visual design
	 */
	draw(props: ErrorCellProps) {
		const { ctx, rect, theme, value } = props;
		const { x, y, width, height } = rect;

		// Draw light red background (matches sheets repo error cell styling)
		ctx.fillStyle = "#FFEBEE"; // Light red/pink background
		ctx.fillRect(x, y, width, height);

		// Top-aligned text (drawErrorText handles padding)
		drawErrorText(ctx, x, y, width, value, theme);

		// Draw error icon (right-aligned, vertically centered with text)
		drawErrorIconRight(ctx, x, y, width, height, theme);
	},
};
