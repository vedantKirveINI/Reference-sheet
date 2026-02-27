import { GRID_DEFAULT } from "@/config/grid";
import type {
	IRankingCell,
	ICellRenderProps,
	ICellMeasureProps,
	ICellMeasureResult,
} from "@/types";
import { validateAndParseRanking } from "./utils/validateAndParseRanking";
import { drawRankingChip, drawEllipsisChip } from "./utils/drawRankingChip";
import { calculateChipWidth } from "./utils/calculateChipWidth";
import { ErrorCell } from "@/cell-level/renderers/error/ErrorCell";

const { cellHorizontalPadding, cellVerticalPaddingMD } = GRID_DEFAULT;

export const rankingRenderer = {
	type: "Ranking" as const,

	/**
	 * Measure cell dimensions without rendering
	 * Returns width, height, and totalHeight for ranking cell
	 */
	measure(cell: IRankingCell, props: ICellMeasureProps): ICellMeasureResult {
		const { data, displayData, options } = cell;
		const { ctx, theme, width, height } = props;

		// Validate and parse ranking data
		const { isValid, parsedValue } = validateAndParseRanking(
			data ? JSON.stringify(data) : displayData,
			options?.options || [],
		);

		if (!isValid || !parsedValue || parsedValue.length === 0) {
			return { width, height, totalHeight: height };
		}

		// Set font for accurate measurement
		ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;

		// Calculate available dimensions
		const availableWidth = width - cellHorizontalPadding * 2; // 8px * 2 = 16px total
		const availableHeight = height - cellVerticalPaddingMD; // Top/bottom padding

		// Format ranking values
		const rankingValues = parsedValue.map(
			(item) => `${item.rank}. ${item.label}`,
		);

		// Calculate visible chips (this is a hook, but we need to use it differently in measure)
		// For measure, we'll do a simplified calculation
		const chipHeight = 24; // getRankingChipHeight()
		const isWrapped = false; // For measure, assume no wrapping

		// Simple calculation: estimate if all chips fit
		// Actual calculation happens in draw() using the hook
		const estimatedChipWidth = 100; // Rough estimate
		const estimatedTotalWidth = rankingValues.length * estimatedChipWidth;

		if (estimatedTotalWidth <= availableWidth) {
			// All chips fit in one row
			return { width, height, totalHeight: height };
		} else {
			// Chips overflow - still single row but with ellipsis
			return { width, height, totalHeight: height };
		}
	},

	/**
	 * Draw cell content on canvas
	 * Renders ranking chips with overflow ellipsis
	 */
	draw(cell: IRankingCell, props: ICellRenderProps) {
		const { data, displayData, options } = cell;
		const { ctx, rect, theme } = props;
		const { x, y, width, height } = rect;

		// Validate and parse ranking data
		const jsonString = data ? JSON.stringify(data) : displayData;
		const { isValid, parsedValue } = validateAndParseRanking(
			jsonString,
			options?.options || [],
		);

		// Show error if invalid AND value is not empty/null
		const cellValue = data || displayData;
		if (
			!isValid &&
			cellValue !== null &&
			cellValue !== undefined &&
			cellValue !== ""
		) {
			// Show error cell with the invalid value
			ErrorCell.draw({
				ctx,
				rect,
				theme,
				value:
					typeof cellValue === "string"
						? cellValue
						: JSON.stringify(cellValue),
			});
			return;
		}

		// If empty or no valid parsed value, don't render
		if (!parsedValue || parsedValue.length === 0) {
			return;
		}

		// Set font for rendering
		const { cellTextColor, fontSize, fontFamily } = theme;
		ctx.font = `${fontSize}px ${fontFamily}`;

		// Calculate available dimensions
		const availableWidth = width - cellHorizontalPadding * 2;
		const availableHeight = height - cellVerticalPaddingMD;

		// Format ranking values
		const rankingValues = parsedValue.map(
			(item) => `${item.rank}. ${item.label}`,
		);

		// Calculate visible chips (non-hook version for renderer context)
		const { limitValue, visibleRankings } = calculateVisibleRankings({
			rankingValues,
			availableWidth,
			availableHeight,
			fontSize,
			fontFamily,
		});

		// Starting position
		let currentX = x + cellHorizontalPadding;
		const chipY = y + cellVerticalPaddingMD / 2; // Center vertically

		// Draw visible chips
		for (let i = 0; i < visibleRankings.length; i++) {
			const chipText = visibleRankings[i];
			const chipWidth = drawRankingChip({
				ctx,
				text: chipText,
				x: currentX,
				y: chipY,
				fontSize,
				fontFamily,
				textColor: cellTextColor,
			});
			currentX += chipWidth;
		}

		// Draw ellipsis chip if there are more items
		if (limitValue) {
			drawEllipsisChip({
				ctx,
				x: currentX,
				y: chipY,
				fontSize,
				fontFamily,
				textColor: cellTextColor,
			});
		}
	},
};

/**
 * Calculate visible rankings (non-hook version for renderer)
 * This duplicates the logic from useRankingTiles but works in non-React context
 */
function calculateVisibleRankings({
	rankingValues,
	availableWidth,
	availableHeight,
	fontSize = 13,
	fontFamily = "Inter",
}: {
	rankingValues: string[];
	availableWidth: number;
	availableHeight: number;
	fontSize?: number;
	fontFamily?: string;
}): { limitValue: string; visibleRankings: string[] } {
	if (rankingValues.length === 0) {
		return { limitValue: "", visibleRankings: [] };
	}

	// Use calculateChipWidth directly (already imported)

	const overflowTileWidth = calculateChipWidth({
		text: "...",
		isOverflowTile: true,
		fontSize,
		fontFamily,
	});

	const firstTileWidth = calculateChipWidth({
		text: rankingValues[0],
		fontSize,
		fontFamily,
	});

	let accumulatedWidth = firstTileWidth;
	const visibleRankings: string[] =
		rankingValues.length > 0 ? [rankingValues[0]] : [];

	for (let tileIndex = 1; tileIndex < rankingValues.length; tileIndex++) {
		const tileWidth = calculateChipWidth({
			text: rankingValues[tileIndex],
			isLastElement: tileIndex === rankingValues.length - 1,
			fontSize,
			fontFamily,
		});

		let projectedWidth = accumulatedWidth + tileWidth;

		const remainingItems =
			rankingValues.length - (visibleRankings.length + 1);

		// If there will be overflow tile
		if (remainingItems > 0) {
			projectedWidth += overflowTileWidth;
		}

		if (projectedWidth > availableWidth) {
			// Calculate overflow count
			const overflowCount = rankingValues.length - visibleRankings.length;
			const limitValue = overflowCount > 0 ? `+${overflowCount}` : "";
			return { limitValue, visibleRankings };
		} else {
			accumulatedWidth += tileWidth;
			visibleRankings.push(rankingValues[tileIndex]);
		}
	}

	return { limitValue: "", visibleRankings };
}
