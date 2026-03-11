/**
 * Draw "+N" chip on canvas
 * Matches Sheets implementation: dark background, white text, fully rounded
 */

import { drawRect } from "@/utils/baseRenderer";

const CHIP_HEIGHT = 20;
const CHIP_PADDING = 6; // 6px padding on each side
const CHIP_BACKGROUND = "#212121"; // Dark background
const CHIP_TEXT_COLOR = "#FFFFFF"; // White text
const CHIP_FONT_SIZE = 12;

/**
 * Draw a "+N" chip on canvas
 * Matches Sheets styling: border-radius: 100px, background: #212121, color: #fff
 */
export function drawChip(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	count: number,
	theme: { fontSize: number; fontFamily: string },
): void {
	// Set font for text measurement
	ctx.font = `${CHIP_FONT_SIZE}px ${theme.fontFamily}`;
	const text = `+ ${count}`;
	const textMetrics = ctx.measureText(text);
	const textWidth = textMetrics.width;

	// Calculate chip width (text + padding on both sides)
	const chipWidth = textWidth + CHIP_PADDING * 2;
	const chipRadius = CHIP_HEIGHT / 2; // Fully rounded (100px border-radius)

	// Draw chip background (fully rounded rectangle)
	drawRect(ctx, {
		x,
		y,
		width: chipWidth,
		height: CHIP_HEIGHT,
		fill: CHIP_BACKGROUND,
		radius: chipRadius, // Fully rounded
	});

	// Draw chip text
	ctx.save();
	ctx.font = `${CHIP_FONT_SIZE}px ${theme.fontFamily}`;
	ctx.fillStyle = CHIP_TEXT_COLOR;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(text, x + chipWidth / 2, y + CHIP_HEIGHT / 2);
	ctx.restore();
}

// Export approximate width for layout calculations
// Actual width will be calculated based on text, but this is a reasonable estimate
export const CHIP_WIDTH = 36;
