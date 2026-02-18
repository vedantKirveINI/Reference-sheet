import { drawRect } from "@/utils/baseRenderer";
import { calculateChipWidth, getRankingChipHeight } from "./calculateChipWidth";

interface DrawRankingChipProps {
	ctx: CanvasRenderingContext2D;
	text: string; // e.g., "1. Banana"
	x: number;
	y: number;
	fontSize?: number;
	fontFamily?: string;
	fill?: string;
	textColor?: string;
}

const CHIP_BACKGROUND = "#cfd8dc"; // Light gray background
const CHIP_BORDER_RADIUS = 6; // 6px border radius
const CHIP_PADDING_X = 8; // 8px left + 8px right
const CHIP_HEIGHT = getRankingChipHeight(); // 24px (20px line height + 4px padding)

/**
 * Draw a ranking chip with rounded background and text
 */
export function drawRankingChip({
	ctx,
	text,
	x,
	y,
	fontSize = 13,
	fontFamily = "Inter",
	fill = CHIP_BACKGROUND,
	textColor = "#212121",
}: DrawRankingChipProps): number {
	// Calculate chip width
	const chipWidth = calculateChipWidth({
		text,
		fontSize,
		fontFamily,
		isLastElement: false, // We'll handle gap separately
	});

	// Draw rounded rectangle background
	drawRect(ctx, {
		x,
		y,
		width: chipWidth - 8, // Subtract gap width (8px) since calculateChipWidth includes it
		height: CHIP_HEIGHT,
		fill,
		radius: CHIP_BORDER_RADIUS,
	});

	// Set font for text
	ctx.font = `${fontSize}px ${fontFamily}`;
	ctx.fillStyle = textColor;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.letterSpacing = "0.1px";

	// Draw text centered vertically in chip
	const textX = x + CHIP_PADDING_X;
	const textY = y + CHIP_HEIGHT / 2;

	// Measure text to handle overflow
	const maxTextWidth = chipWidth - CHIP_PADDING_X * 2 - 8; // Subtract gap
	const textMetrics = ctx.measureText(text);
	let displayText = text;

	// If text is too long, truncate with ellipsis
	if (textMetrics.width > maxTextWidth) {
		const ellipsis = "...";
		const ellipsisWidth = ctx.measureText(ellipsis).width;
		let truncatedText = "";
		let truncatedWidth = 0;

		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			const charWidth = ctx.measureText(char).width;
			if (truncatedWidth + charWidth + ellipsisWidth > maxTextWidth) {
				break;
			}
			truncatedText += char;
			truncatedWidth += charWidth;
		}
		displayText = truncatedText + ellipsis;
	}

	ctx.fillText(displayText, textX, textY);

	// Return the full chip width (including gap)
	return chipWidth;
}

/**
 * Draw ellipsis chip ("...")
 */
export function drawEllipsisChip({
	ctx,
	x,
	y,
	fontSize = 13,
	fontFamily = "Inter",
	fill = CHIP_BACKGROUND,
	textColor = "#212121",
}: {
	ctx: CanvasRenderingContext2D;
	x: number;
	y: number;
	fontSize?: number;
	fontFamily?: string;
	fill?: string;
	textColor?: string;
}): number {
	const ellipsisText = "...";
	const chipWidth = calculateChipWidth({
		text: ellipsisText,
		fontSize,
		fontFamily,
		isOverflowTile: true,
		isLastElement: false,
	});

	// Draw rounded rectangle background
	drawRect(ctx, {
		x,
		y,
		width: chipWidth - 6, // Subtract gap width (6px) for ellipsis chip
		height: CHIP_HEIGHT,
		fill,
		radius: CHIP_BORDER_RADIUS,
	});

	// Set font for text
	ctx.font = `${fontSize}px ${fontFamily}`;
	ctx.fillStyle = textColor;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	ctx.letterSpacing = "0.1px";

	// Draw ellipsis text centered
	const textX = x + 3; // 3px padding for ellipsis chip
	const textY = y + CHIP_HEIGHT / 2;
	ctx.fillText(ellipsisText, textX, textY);

	// Return the full chip width (including gap)
	return chipWidth;
}
