/**
 * Draw a single SCQ chip on canvas with dynamic border radius
 * Inspired by sheets project's chip rendering and MCQ's drawChip
 * Key difference: Dynamic border radius (16px or 4px) instead of fixed 4px
 */

export interface DrawScqChipOptions {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	text: string;
	backgroundColor: string;
	textColor: string;
	fontSize: number;
	fontFamily: string;
	borderRadius: number; // Dynamic: 16 (rounded pill) or 4 (rounded rectangle)
	maxWidth?: number; // When provided, chip is capped to this width and text is truncated with "..."
}

const padding = 8; // 8px padding on each side
const chipHeight = 20;
const letterSpacing = 0.25;

/**
 * Truncate text with "..." so it fits within maxTextWidth (using measureText + letter spacing).
 */
function truncateTextWithEllipsis(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxTextWidth: number,
): string {
	const ellipsis = "...";
	const ellipsisWidth = ctx.measureText(ellipsis).width;
	let truncatedText = "";
	let truncatedWidth = 0;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];
		const charWidth = ctx.measureText(char).width + letterSpacing;
		if (truncatedWidth + charWidth + ellipsisWidth > maxTextWidth) {
			break;
		}
		truncatedText += char;
		truncatedWidth += charWidth;
	}
	return truncatedText + ellipsis;
}

/**
 * Draw a rounded rectangle chip on canvas with dynamic border radius
 * When maxWidth is provided and the chip would overflow, text is truncated with "..." and the chip is drawn at maxWidth.
 * Returns the actual drawn chip width.
 */
export function drawScqChip(options: DrawScqChipOptions): number {
	const {
		ctx,
		x,
		y,
		text,
		backgroundColor,
		textColor,
		fontSize,
		fontFamily,
		borderRadius,
		maxWidth,
	} = options;

	ctx.font = `${fontSize}px ${fontFamily}`;
	const textWidth = ctx.measureText(text).width;
	const adjustedTextWidth = textWidth + letterSpacing * text.length;
	const naturalChipWidth = adjustedTextWidth + padding * 2;

	const needsTruncation = maxWidth != null && naturalChipWidth > maxWidth;
	const maxTextWidth = maxWidth != null ? maxWidth - padding * 2 : 0;
	const displayText = needsTruncation
		? truncateTextWithEllipsis(ctx, text, maxTextWidth)
		: text;
	const drawnWidth = needsTruncation ? maxWidth : naturalChipWidth;

	// Draw rounded rectangle background with dynamic border radius
	ctx.fillStyle = backgroundColor;
	ctx.beginPath();

	if (ctx.roundRect) {
		ctx.roundRect(x, y, drawnWidth, chipHeight, borderRadius);
	} else {
		const r = borderRadius;
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + drawnWidth - r, y);
		ctx.quadraticCurveTo(x + drawnWidth, y, x + drawnWidth, y + r);
		ctx.lineTo(x + drawnWidth, y + chipHeight - r);
		ctx.quadraticCurveTo(
			x + drawnWidth,
			y + chipHeight,
			x + drawnWidth - r,
			y + chipHeight,
		);
		ctx.lineTo(x + r, y + chipHeight);
		ctx.quadraticCurveTo(x, y + chipHeight, x, y + chipHeight - r);
		ctx.lineTo(x, y + r);
		ctx.quadraticCurveTo(x, y, x + r, y);
		ctx.closePath();
	}

	ctx.fill();

	ctx.fillStyle = textColor;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.fillText(displayText, x + padding, y + chipHeight / 2);

	return drawnWidth;
}
