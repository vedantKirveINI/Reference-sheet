/**
 * Utility functions for MCQ chip rendering on canvas
 * Inspired by sheets project's useChipWidths hook
 * These are pure functions (no React hooks) for use in canvas rendering
 */

// Chip color palette (matches editor's CHIP_COLORS)
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
 * Similar to useChipWidths hook but as pure function
 */
export function calculateChipLayout(
	ctx: CanvasRenderingContext2D,
	selectionValues: string[],
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

/**
 * Validate and parse MCQ input
 * Handles both array and JSON string formats
 */
export function validateAndParseInput(
	value: any,
	options: string[] = [],
): {
	isValid: boolean;
	parsedValue: string[];
} {
	if (!value) {
		return { isValid: true, parsedValue: [] };
	}

	// If already an array, validate it
	if (Array.isArray(value)) {
		// If options are provided, check if all values are in options
		if (options.length > 0) {
			const invalidValues = value.filter((v) => !options.includes(v));
			if (invalidValues.length > 0) {
				// Some values are not in options - invalid
				return { isValid: false, parsedValue: [] };
			}
		}
		// All values are valid (or no options provided)
		return { isValid: true, parsedValue: value };
	}

	// If it's a string, try to parse as JSON
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) {
				// If options are provided, check if all values are in options
				if (options.length > 0) {
					const invalidValues = parsed.filter(
						(v: string) => !options.includes(v),
					);
					if (invalidValues.length > 0) {
						// Some values are not in options - invalid
						return { isValid: false, parsedValue: [] };
					}
				}
				// All values are valid (or no options provided)
				return { isValid: true, parsedValue: parsed };
			}
		} catch {
			// Not valid JSON - invalid if options are provided and value is not empty
			// If no options, treat as empty (valid)
			if (options.length > 0 && value.trim() !== "") {
				return { isValid: false, parsedValue: [] };
			}
			return { isValid: true, parsedValue: [] };
		}
	}

	return { isValid: false, parsedValue: [] };
}
