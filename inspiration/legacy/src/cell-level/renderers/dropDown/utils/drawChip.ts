/**
 * Draw a single chip on canvas for DropDown renderer
 * Separate implementation from MCQ to keep DropDown utilities independent
 * When maxWidth is provided and chip would exceed it, text is truncated with "..."
 */

const padding = 8; // 8px padding on each side
const chipHeight = 20;
const borderRadius = 4;
const letterSpacing = 0.25;

export interface DrawChipOptions {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	text: string;
	backgroundColor: string;
	textColor: string;
	fontSize: number;
	fontFamily: string;
	maxWidth?: number; // When provided, chip is capped and text truncated with "..."
}

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
 * Draw a rounded rectangle chip on canvas
 * Returns the actual drawn chip width (capped by maxWidth when truncation is applied)
 */
export function drawChip(options: DrawChipOptions): number {
	const {
		ctx,
		x,
		y,
		text,
		backgroundColor,
		textColor,
		fontSize,
		fontFamily,
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
	const chipWidth = needsTruncation ? maxWidth : naturalChipWidth;

	// Draw rounded rectangle background
	ctx.fillStyle = backgroundColor;
	ctx.beginPath();

	if (ctx.roundRect) {
		ctx.roundRect(x, y, chipWidth, chipHeight, borderRadius);
	} else {
		const r = borderRadius;
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + chipWidth - r, y);
		ctx.quadraticCurveTo(x + chipWidth, y, x + chipWidth, y + r);
		ctx.lineTo(x + chipWidth, y + chipHeight - r);
		ctx.quadraticCurveTo(
			x + chipWidth,
			y + chipHeight,
			x + chipWidth - r,
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

	return chipWidth;
}







