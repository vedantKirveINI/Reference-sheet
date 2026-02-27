/**
 * Rating Cell Renderer
 * Renders rating icons on canvas with hover effects
 * Handles interactions directly in renderer mode (no separate editor)
 * Inspired by Teable's ratingCellRenderer
 */
import { GRID_DEFAULT } from "@/config/grid";
import type {
	IRatingCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { RatingEditor } from "@/cell-level/editors/rating/RatingEditor";
import { validateRating } from "./utils/validateRating";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingMD } = GRID_DEFAULT;
const GAP_SIZE = 3; // Gap between icons (like Teable)

// Icon mapping - support different icon types from rawOptions
const ICON_MAP: Record<string, string> = {
	star: "★",
	crown: "♔",
	heart: "♥",
	thumbs: "👍",
	// Add more as needed
};

// Helper to get icon character
function getIconChar(iconOption?: string): string {
	if (!iconOption) return "★"; // Default star

	// Convert emoji to basic character
	if (iconOption === "⭐" || iconOption === "🌟" || iconOption === "✨") {
		return "★"; // Convert emoji stars to basic star
	}

	// Check if it's a key in our map
	if (ICON_MAP[iconOption.toLowerCase()]) {
		return ICON_MAP[iconOption.toLowerCase()];
	}

	// If it's already a single character (and not an emoji), use it
	if (iconOption.length === 1) {
		return iconOption;
	}

	// Default to star
	return "★";
}

export const ratingRenderer = {
	type: "Rating" as const,

	measure(cell: IRatingCell, props: ICellMeasureProps): ICellMeasureResult {
		const { width, height, theme } = props;
		// Use actual maxRating from options, don't default to 5
		const maxRating = cell.options?.maxRating ?? 10;
		const iconSize = theme.iconSizeSM || theme.fontSize || 20;

		// Calculate total width needed for rating icons
		const totalWidth =
			cellHorizontalPadding * 2 +
			maxRating * (iconSize + GAP_SIZE) -
			GAP_SIZE;

		return {
			width: Math.max(width, totalWidth),
			height,
			totalHeight: height,
		};
	},

	draw(cell: IRatingCell, props: ICellRenderProps) {
		const { data, options } = cell;
		const { ctx, rect, theme, hoverCellPosition } = props;
		const { x, y, width, height } = rect;

		// Get options with defaults
		// Use actual maxRating from options, don't default to 5
		const maxRating = options?.maxRating ?? 10;

		// Validate the value
		const { isValid, processedValue } = validateRating({
			value: data,
			maxRating,
		});

		// Show error if invalid AND value is not empty/null
		// Match sheets repo pattern: show error for invalid values that are not empty
		if (
			!isValid &&
			data !== null &&
			data !== undefined &&
			String(data) !== ""
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value: String(data),
			});
			return;
		}

		const iconChar = getIconChar(options?.icon);
		const iconColor = options?.color || theme.cellTextColor || "#212121";
		const emptyColor = theme.cellLineColor || "#E0E0E0";

		// Icon size
		const iconSize = theme.iconSizeSM || theme.fontSize || 20;

		// Get current rating value (use processedValue from validation, or 0 if null)
		const rating =
			processedValue !== null && processedValue !== undefined
				? processedValue
				: 0;

		// Calculate starting position - top-left aligned
		let currentX = x + cellHorizontalPadding;
		const initY = y + cellVerticalPaddingMD;

		// Calculate hover position relative to cell
		const [hoverX = 0, hoverY = 0] = hoverCellPosition || [];
		const isVerticalRange =
			hoverY >= cellVerticalPaddingMD &&
			hoverY <= cellVerticalPaddingMD + iconSize;
		const maxHoverX =
			cellHorizontalPadding + maxRating * (iconSize + GAP_SIZE);

		// Determine hover rating (which icon we're hovering over)
		let hoverRating = 0;
		if (hoverCellPosition && isVerticalRange && hoverX >= 0) {
			const relativeX = hoverX;
			if (relativeX >= cellHorizontalPadding && relativeX < maxHoverX) {
				hoverRating = Math.ceil(
					(relativeX - cellHorizontalPadding) / (iconSize + GAP_SIZE),
				);
				hoverRating = Math.max(1, Math.min(hoverRating, maxRating));
			}
		}

		// Set font for icon rendering
		ctx.font = `${iconSize}px ${theme.fontFamily}`;
		ctx.textAlign = "left";
		ctx.textBaseline = "top";

		// Clip drawing to the cell bounds so stars never render outside the cell
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, width, height);
		ctx.clip();

		// Draw all icons (always show all outlined icons, even when data is null)
		// Show hover preview with lighter color (30% opacity)
		for (let i = 0; i < maxRating; i++) {
			const isFilled = rating > i;
			// Show hover preview for icons that would be filled on hover
			const isHovered =
				hoverCellPosition !== undefined &&
				hoverRating > i &&
				hoverRating > rating;

			let color: string;
			if (isFilled) {
				// Filled icon - use full color (solid, opaque)
				color = iconColor;
			} else if (isHovered) {
				// Hover preview - use lighter color (30% opacity)
				// Convert hex to rgba with 0.3 opacity
				const r = parseInt(iconColor.slice(1, 3), 16);
				const g = parseInt(iconColor.slice(3, 5), 16);
				const b = parseInt(iconColor.slice(5, 7), 16);
				color = `rgba(${r}, ${g}, ${b}, 0.3)`;
			} else {
				// Empty icon - use empty color (outline only)
				color = emptyColor;
			}

			// Draw icon
			ctx.fillStyle = color;
			ctx.fillText(iconChar, currentX, initY);

			currentX += iconSize + GAP_SIZE;
		}

		// Restore previous clipping region
		ctx.restore();
	},

	provideEditor: () => RatingEditor,
};
