import { useMemo } from "react";
import {
	calculateChipWidth,
	getRankingChipHeight,
} from "../utils/calculateChipWidth";

interface UseRankingTilesParams {
	rankingValues: string[]; // Array of formatted strings like ["1. Banana", "2. Apple"]
	availableWidth: number;
	availableHeight: number;
	isWrapped?: boolean;
	fontSize?: number;
	fontFamily?: string;
}

interface UseRankingTilesResult {
	limitValue: string; // Overflow count like "+3" or ""
	visibleRankings: string[]; // Visible chip texts
}

/**
 * Calculate overflow count when last tile would overflow
 */
function calculateLimitValue({
	visibleRankings,
	availableWidth,
	rankingValues,
	fontSize = 13,
	fontFamily = "Inter",
}: {
	visibleRankings: string[];
	availableWidth: number;
	rankingValues: string[];
	fontSize?: number;
	fontFamily?: string;
}): string {
	const lastIndex = visibleRankings.length - 1;
	const lastTileText = visibleRankings[lastIndex];

	// Get width of the last visible tile
	const lastTileWidth =
		calculateChipWidth({
			text: lastTileText,
			fontSize,
			fontFamily,
		}) + 16; // Add some buffer

	// If it overflows, remove it from visible and count as overflow
	if (lastTileWidth > availableWidth && visibleRankings.length > 1) {
		visibleRankings.pop();
	}

	// Return the overflow count
	const overflowCount = rankingValues.length - visibleRankings.length;
	return overflowCount > 0 ? `+${overflowCount}` : "";
}

/**
 * Calculate which ranking chips are visible based on available width
 */
export function useRankingTiles({
	rankingValues = [],
	availableWidth = 0,
	availableHeight = 0,
	isWrapped = false,
	fontSize = 13,
	fontFamily = "Inter",
}: UseRankingTilesParams): UseRankingTilesResult {
	return useMemo(() => {
		if (rankingValues.length === 0) {
			return { limitValue: "", visibleRankings: [] };
		}

		if (isWrapped) {
			// If wrap mode is enabled, show all rankings
			return { limitValue: "", visibleRankings: rankingValues };
		}

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
		let accumulatedHeight = getRankingChipHeight();

		let limitValue = "";
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
				if (
					!isWrapped ||
					accumulatedHeight + getRankingChipHeight() > availableHeight
				) {
					limitValue = calculateLimitValue({
						visibleRankings,
						availableWidth: availableWidth - overflowTileWidth,
						rankingValues,
						fontSize,
						fontFamily,
					});
					break;
				} else {
					accumulatedHeight += getRankingChipHeight();
					accumulatedWidth = tileWidth;
					visibleRankings.push(rankingValues[tileIndex]);
				}
			} else {
				accumulatedWidth += tileWidth;
				visibleRankings.push(rankingValues[tileIndex]);
			}
		}

		return { limitValue, visibleRankings };
	}, [
		rankingValues,
		availableWidth,
		availableHeight,
		isWrapped,
		fontSize,
		fontFamily,
	]);
}
