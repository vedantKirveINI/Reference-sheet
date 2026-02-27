import isEmpty from "lodash/isEmpty";

function getTextWidth({ text = "" }) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	context.font = "13px Inter"; // 0.8125rem = 13px
	context.letterSpacing = "0.1px"; // 0.00625rem ≈ 0.1px

	return +context.measureText(text).width.toFixed(2);
}

/**
 * Calculates the width of a ranking tile based on text width and padding.
 */
function getRankingTileWidth({
	text = "",
	isOverflowTile = false,
	lastElement = false,
}) {
	const textWidth = getTextWidth({ text });
	let padding = 2 * 8; // 4px left + right
	let gapWidth = 8; // 8px spacing between tiles

	if (isOverflowTile) {
		padding = 6;
		gapWidth = 6;
	}

	if (lastElement) {
		gapWidth = 0;
	}

	return +(textWidth + padding + gapWidth).toFixed(2);
}

/**
 * Calculates the height of a ranking tile.
 */
function getRankingTileHeight() {
	// Line height
	return 20 + 4; // e.g. 20px font + 4px  top/bottom padding
}

function calculateLimitValue({
	visibleRankings = [],
	availableWidth = 0,
	rankingValues = [],
}) {
	const lastIndex = visibleRankings.length - 1;
	const lastTileText = visibleRankings[lastIndex];

	// Get width of the last visible tile
	const lastTileWidth =
		getRankingTileWidth({
			text: lastTileText,
		}) + 16;

	// If it overflows, remove it from visible and count as overflow
	if (lastTileWidth > availableWidth && visibleRankings?.length > 1) {
		visibleRankings.pop();
	}

	// Return the overflow count
	return `+${rankingValues.length - visibleRankings.length}`;
}

const useRankingTiles = ({
	rankingValues = [],
	availableWidth = 0,
	availableHeight = 0,
	isWrapped = false,
}) => {
	if (isEmpty(rankingValues)) {
		return { limitValue: "", visibleRankings: [] };
	}

	if (isWrapped) {
		// If wrap mode is enabled, show all rankings
		return { limitValue: "", visibleRankings: rankingValues };
	}

	const overflowTileWidth = getRankingTileWidth({
		text: "...",
		isOverflowTile: true,
	});

	const firstTileWidth = getRankingTileWidth({ text: rankingValues?.[0] });

	let accumulatedWidth = firstTileWidth;
	let accumulatedHeight = getRankingTileHeight();

	let limitValue = "";
	const visibleRankings = !isEmpty(rankingValues) ? [rankingValues[0]] : [];

	for (let tileIndex = 1; tileIndex < rankingValues.length; tileIndex++) {
		const tileWidth = getRankingTileWidth({
			text: rankingValues[tileIndex],
			lastElement: tileIndex === rankingValues.length - 1,
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
				accumulatedHeight + getRankingTileHeight() > availableHeight
			) {
				limitValue = calculateLimitValue({
					visibleRankings,
					availableWidth: availableWidth - overflowTileWidth,
					rankingValues,
				});
				break;
			} else {
				accumulatedHeight += getRankingTileHeight();
				accumulatedWidth = tileWidth;
				visibleRankings.push(rankingValues[tileIndex]);
			}
		} else {
			accumulatedWidth += tileWidth;
			visibleRankings.push(rankingValues[tileIndex]);
		}
	}

	return { limitValue, visibleRankings };
};

export default useRankingTiles;
