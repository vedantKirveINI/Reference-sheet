/**
 * Utilities for calculating visible row/column ranges
 * Inspired by Teable's useVisibleRegion
 *
 * Provides functions to calculate which rows and columns are visible
 * based on scroll position using CoordinateManager's binary search
 */

import type { CoordinateManager } from "@/managers/coordinate-manager";

/**
 * Interface for visible region information
 */
export interface IVisibleRegion {
	startRowIndex: number;
	stopRowIndex: number;
	startColumnIndex: number;
	stopColumnIndex: number;
}

/**
 * Calculate visible row range for a given scroll position
 *
 * Uses CoordinateManager's binary search to efficiently find:
 * - First visible row (startRowIndex)
 * - Last visible row (stopRowIndex)
 *
 * @param coordInstance - CoordinateManager instance
 * @param scrollTop - Vertical scroll position in pixels
 * @returns Object with startRowIndex and stopRowIndex (inclusive bounds)
 *
 * @example
 * ```tsx
 * const { startRowIndex, stopRowIndex } = getVerticalRangeInfo(
 *   coordinateManager,
 *   scrollState.scrollTop
 * );
 * ```
 */
export const getVerticalRangeInfo = (
	coordInstance: CoordinateManager,
	scrollTop: number,
) => {
	const { rowCount } = coordInstance;
	const startIndex = coordInstance.getRowStartIndex(scrollTop);
	const stopIndex = coordInstance.getRowStopIndex(startIndex, scrollTop);

	return {
		startRowIndex: Math.max(0, startIndex),
		stopRowIndex: Math.max(0, Math.min(rowCount - 1, stopIndex + 1)),
	};
};

/**
 * Calculate visible column range for a given scroll position
 *
 * Uses CoordinateManager's binary search to efficiently find:
 * - First visible column (startColumnIndex)
 * - Last visible column (stopColumnIndex)
 *
 * @param coordInstance - CoordinateManager instance
 * @param scrollLeft - Horizontal scroll position in pixels
 * @returns Object with startColumnIndex and stopColumnIndex (inclusive bounds)
 *
 * @example
 * ```tsx
 * const { startColumnIndex, stopColumnIndex } = getHorizontalRangeInfo(
 *   coordinateManager,
 *   scrollState.scrollLeft
 * );
 * ```
 */
export const getHorizontalRangeInfo = (
	coordInstance: CoordinateManager,
	scrollLeft: number,
) => {
	const { columnCount } = coordInstance;
	const startIndex = coordInstance.getColumnStartIndex(scrollLeft);
	const stopIndex = coordInstance.getColumnStopIndex(startIndex, scrollLeft);

	return {
		startColumnIndex: Math.max(0, startIndex),
		stopColumnIndex: Math.max(0, Math.min(columnCount - 1, stopIndex)),
	};
};
