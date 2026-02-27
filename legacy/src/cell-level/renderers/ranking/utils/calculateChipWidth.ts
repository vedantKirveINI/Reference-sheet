function getTextWidth(
	text: string,
	fontSize: number,
	fontFamily: string,
): number {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	if (!context) return 0;

	context.font = `${fontSize}px ${fontFamily}`;
	context.letterSpacing = "0.1px"; // 0.00625rem ≈ 0.1px

	return +context.measureText(text).width.toFixed(2);
}

/**
 * Calculate the width of a ranking chip
 * @param text - Chip text content (e.g., "1. Banana")
 * @param fontSize - Font size in pixels (default: 13)
 * @param fontFamily - Font family (default: "Inter")
 * @param isOverflowTile - Whether this is the ellipsis chip
 * @param isLastElement - Whether this is the last chip (no gap after)
 * @returns Chip width in pixels
 */
export function calculateChipWidth({
	text = "",
	fontSize = 13,
	fontFamily = "Inter",
	isOverflowTile = false,
	isLastElement = false,
}: {
	text: string;
	fontSize?: number;
	fontFamily?: string;
	isOverflowTile?: boolean;
	isLastElement?: boolean;
}): number {
	const textWidth = getTextWidth(text, fontSize, fontFamily);
	let padding = 2 * 8; // 4px left + 4px right = 8px each side
	let gapWidth = 8; // 8px spacing between tiles

	if (isOverflowTile) {
		padding = 6; // 3px left + 3px right for ellipsis chip
		gapWidth = 6; // 6px gap for ellipsis chip
	}

	if (isLastElement) {
		gapWidth = 0; // No gap after last element
	}

	return +(textWidth + padding + gapWidth).toFixed(2);
}

/**
 * Get the height of a ranking chip
 */
export function getRankingChipHeight(): number {
	// Line height (20px) + top/bottom padding (4px total)
	return 20 + 4;
}
