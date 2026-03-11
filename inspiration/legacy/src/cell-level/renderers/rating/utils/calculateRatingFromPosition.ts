/**
 * Calculate rating value from mouse X position
 * Inspired by Teable's ratingCellRenderer.checkRegion
 */
export interface CalculateRatingResult {
	rating: number | null;
	isInRatingArea: boolean;
}

export function calculateRatingFromPosition({
	mouseX,
	cellX,
	cellWidth,
	maxRating,
	iconSize,
	gapSize,
	cellHorizontalPadding,
}: {
	mouseX: number; // Mouse X position relative to canvas
	cellX: number; // Cell X position
	cellWidth: number; // Cell width
	maxRating: number;
	iconSize: number;
	gapSize: number;
	cellHorizontalPadding: number;
}): CalculateRatingResult {
	// Calculate relative X position within cell
	const relativeX = mouseX - cellX;

	// Calculate rating area bounds
	const minX = cellHorizontalPadding;
	const maxX = minX + maxRating * (iconSize + gapSize);

	// Check if click is within rating area
	if (relativeX < minX || relativeX > maxX) {
		return {
			rating: null,
			isInRatingArea: false,
		};
	}

	// Calculate which icon was clicked
	// Formula: Math.ceil((x - cellHorizontalPadding) / (iconSize + gapSize))
	const rating = Math.ceil(
		(relativeX - cellHorizontalPadding) / (iconSize + gapSize),
	);

	// Clamp to valid range (1 to maxRating)
	const clampedRating = Math.max(1, Math.min(rating, maxRating));

	return {
		rating: clampedRating,
		isInRatingArea: true,
	};
}
