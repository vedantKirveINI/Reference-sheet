/**
 * Wheel event utilities
 * Inspired by Teable's getWheelDelta implementation
 *
 * Normalizes wheel event deltas across different browsers and delta modes
 */

/**
 * Normalizes wheel event deltas across different browsers and delta modes
 * Handles:
 * - Pixel mode (default): Returns deltas as-is
 * - Line mode: Converts line deltas to pixels using lineHeight
 * - Page mode: Converts page deltas to pixels using pageHeight
 * - Shift+scroll: Swaps X/Y for horizontal scrolling
 *
 * @param event - The wheel event
 * @param pageHeight - Height of page for DOM_DELTA_PAGE conversion (optional)
 * @param lineHeight - Height of line for DOM_DELTA_LINE conversion (optional)
 * @returns Tuple of [deltaX, deltaY] in pixels
 */
export const getWheelDelta = ({
	event,
	pageHeight,
	lineHeight,
}: {
	event: WheelEvent;
	pageHeight?: number;
	lineHeight?: number;
}) => {
	let [x, y] = [event.deltaX, event.deltaY];

	// Handle shift+scroll for horizontal scrolling
	if (x === 0 && event.shiftKey) {
		[y, x] = [0, y];
	}

	// Convert delta modes (LINE and PAGE) to pixels
	// This value is approximate, it does not have to be precise.
	if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
		y *= lineHeight ?? 32;
	} else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
		y *= pageHeight ?? document.body.clientHeight - 180;
	}

	return [x, y];
};
