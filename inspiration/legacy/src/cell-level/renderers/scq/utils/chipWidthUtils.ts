/**
 * SCQ Chip Width and Border Radius Utilities
 * Inspired by sheets project's useChipWidths hook
 * These are pure functions (no React hooks) for use in canvas rendering
 */

/**
 * Calculate text width using canvas context
 */
export function getChipTextWidth(
	ctx: CanvasRenderingContext2D,
	text: string,
): number {
	// Add letter spacing (0.25px per character) like sheets project
	const letterSpacing = 0.25;
	const textWidth = ctx.measureText(text).width;
	return textWidth + letterSpacing * text.length;
}

/**
 * Calculate chip width (text width + padding)
 * Padding: 8px on each side = 16px total
 */
export function getChipWidth(
	ctx: CanvasRenderingContext2D,
	text: string,
): number {
	const textWidth = getChipTextWidth(ctx, text);
	const padding = 16; // 8px on each side
	return textWidth + padding;
}

/**
 * Determine if chip should wrap (based on available width)
 * Returns true if chip width exceeds available width when not wrapped
 */
export function shouldWrapChip(
	ctx: CanvasRenderingContext2D,
	text: string,
	availableWidth: number,
	isWrapped: boolean,
): boolean {
	if (isWrapped) {
		// If already wrapped, check if chip fits
		const chipWidth = getChipWidth(ctx, text);
		return chipWidth > availableWidth;
	}
	return false;
}

/**
 * Get chip border radius based on wrapping state
 * - 16px (rounded pill) when chip fits and not wrapped
 * - 4px (rounded rectangle) when chip is wrapped or doesn't fit
 * Inspired by sheets project's useChipWidths hook
 */
export function getChipBorderRadius(
	ctx: CanvasRenderingContext2D,
	text: string,
	availableWidth: number,
	isWrapped: boolean,
): number {
	const chipWidth = getChipWidth(ctx, text);
	const shouldWrap = shouldWrapChip(ctx, text, availableWidth, isWrapped);

	// If chip fits and not wrapped: use 16px (rounded pill)
	// If chip doesn't fit or is wrapped: use 4px (rounded rectangle)
	if (!shouldWrap && chipWidth <= availableWidth) {
		return 16; // Rounded pill
	}
	return 4; // Rounded rectangle
}

