/**
 * Draw progress bar on canvas
 * Inspired by Teable's drawProcessBar function
 */

import { drawRect } from "@/utils/baseRenderer";

interface DrawProgressBarProps {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	width: number;
	height: number;
	value: number;
	maxValue: number;
	minValue: number;
	radius?: number;
	filledColor?: string;
	unfilledColor?: string;
}

/**
 * Draw a progress bar showing value relative to maxValue
 * @param ctx - Canvas rendering context
 * @param x - X position
 * @param y - Y position
 * @param width - Total width of progress bar
 * @param height - Height of progress bar
 * @param value - Current value
 * @param maxValue - Maximum value
 * @param minValue - Minimum value
 * @param radius - Border radius for rounded corners (default: 4)
 * @param filledColor - Color for filled portion (default: theme primary color)
 * @param unfilledColor - Color for unfilled portion (default: light gray)
 */
export function drawProgressBar({
	ctx,
	x,
	y,
	width,
	height,
	value,
	maxValue,
	minValue,
	radius = 4,
	filledColor = "#212121", // Default to dark gray/black
	unfilledColor = "#E0E0E0", // Default to light gray
}: DrawProgressBarProps): void {
	// Calculate progress percentage
	const range = maxValue - minValue;
	const progress = range > 0 ? (value - minValue) / range : 1;
	const progressWidth = Math.min(width, progress * width);

	ctx.save();

	// Draw unfilled background (full width with reduced opacity)
	ctx.globalAlpha = 0.2;
	drawRect(ctx, {
		x,
		y,
		width,
		height,
		fill: filledColor,
		radius,
	});

	// Draw filled portion (progress width)
	if (progressWidth > 0) {
		ctx.save();
		// Clip to progress width
		ctx.beginPath();
		ctx.rect(x, y, progressWidth, height);
		ctx.clip();

		// Draw filled portion
		ctx.globalAlpha = 1;
		drawRect(ctx, {
			x,
			y,
			width,
			height,
			fill: filledColor,
			radius,
		});
		ctx.restore();
	}

	ctx.restore();
}
