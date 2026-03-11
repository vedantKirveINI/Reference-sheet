/**
 * Utility functions for DropDown chip rendering on canvas
 * Reuses logic from MCQ renderer but adapted for DropDown data format
 * These are pure functions (no React hooks) for use in canvas rendering
 */

// Chip color palette (matches MCQ and sheets project)
const CHIP_COLORS = [
	"#E3F2FD", // Light blue
	"#F3E5F5", // Light purple
	"#E8F5E9", // Light green
	"#FFF3E0", // Light orange
	"#FCE4EC", // Light pink
	"#E0F2F1", // Light teal
	"#FFF9C4", // Light yellow
	"#F1F8E9", // Light lime
];

/**
 * Get chip background color by index
 */
export function getChipColor(index: number): string {
	return CHIP_COLORS[index % CHIP_COLORS.length];
}

/**
 * Calculate text width using canvas context
 */
export function getTextWidth(
	ctx: CanvasRenderingContext2D,
	text: string,
): number {
	return ctx.measureText(text).width;
}

/**
 * Calculate chip width (without delete icon for renderer)
 */
export function getChipWidth(
	ctx: CanvasRenderingContext2D,
	text: string,
	withDeleteIcon: boolean = false,
): number {
	const textWidth = getTextWidth(ctx, text);
	const iconWidth = withDeleteIcon ? 20 + 8 : 0; // icon width + gap
	const padding = 16; // chip padding (8px on each side)
	const gap = 4; // gap between chips

	return textWidth + iconWidth + padding + gap;
}

/**
 * Get chip height
 * NOTE: This returns the actual rendered chip height (20px)
 * Used for layout calculations in calculateChipLayout
 */
export function getChipHeight(): number {
	return 20; // Actual chip height as drawn in drawChip.ts
}

/**
 * Calculate visible chips and limit value
 * Similar to MCQ's calculateChipLayout but for DropDown
 */
export function calculateChipLayout(
	ctx: CanvasRenderingContext2D,
	selectionValues: string[], // Already extracted labels
	availableWidth: number,
	availableHeight: number,
	isWrapped: boolean,
): {
	limitValue: string;
	visibleChips: string[];
	limitValueChipWidth: number;
} {
	if (selectionValues.length === 0) {
		return { limitValue: "", visibleChips: [], limitValueChipWidth: 0 };
	}

	if (isWrapped) {
		return {
			limitValue: "",
			visibleChips: selectionValues,
			limitValueChipWidth: 0,
		};
	}

	const chipHeight = getChipHeight();
	const firstChipWidth = getChipWidth(ctx, selectionValues[0], false);

	let accumulatedWidth = firstChipWidth;
	let accumulatedHeight = chipHeight;
	let limitValue = "";
	let limitValueChipWidth = 0;
	const visibleChips: string[] = [selectionValues[0]];

	for (let i = 1; i < selectionValues.length; i++) {
		const chipWidth = getChipWidth(ctx, selectionValues[i], false);
		accumulatedWidth += chipWidth;

		if (accumulatedWidth >= availableWidth) {
			accumulatedHeight += chipHeight;

			if (!isWrapped || accumulatedHeight >= availableHeight) {
				const remainingChipCount =
					selectionValues.length - visibleChips.length;
				const overflowText = `+${remainingChipCount}`;
				const overflowTextWidth = getTextWidth(ctx, overflowText) + 28;

				if (visibleChips.length > 1) {
					visibleChips.pop();
					limitValue = `+${remainingChipCount + 1}`;
					limitValueChipWidth = getTextWidth(ctx, limitValue) + 28;
				} else {
					limitValue = overflowText;
					limitValueChipWidth = overflowTextWidth;
				}

				break;
			} else {
				accumulatedWidth = chipWidth;
				visibleChips.push(selectionValues[i]);
			}
		} else {
			visibleChips.push(selectionValues[i]);
		}
	}

	return { limitValue, visibleChips, limitValueChipWidth };
}
