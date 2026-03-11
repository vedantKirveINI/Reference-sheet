// Selection utility functions - Inspired by Teable
// Phase 1: Foundation
// Phase 2A: Delete Records functionality

import type { IRange } from "@/types/selection";
import { SelectionRegionType } from "@/types/selection";
import type { CombinedSelection } from "@/managers/selection-manager";
import type { ICellItem } from "@/types";

/**
 * Check if a range is within a set of ranges
 */
export const isRangeWithinRanges = (
	checkedRange: IRange,
	ranges: IRange[],
): boolean => {
	const [checkedStart, checkedEnd] = checkedRange;

	for (const range of ranges) {
		const [rangeStart, rangeEnd] = range;

		if (rangeStart <= checkedStart && rangeEnd >= checkedEnd) {
			return true;
		}
	}
	return false;
};

/**
 * Flatten ranges into a flat array of numbers
 */
export const flatRanges = (ranges: IRange[]): number[] => {
	const result: number[] = [];
	for (const range of ranges) {
		for (let i = range[0]; i <= range[1]; i++) {
			result.push(i);
		}
	}
	return result;
};

/**
 * Check if a point is inside a rectangle defined by two points
 */
export const isPointInsideRectangle = (
	checkPoint: [number, number],
	startPoint: [number, number],
	endPoint: [number, number],
): boolean => {
	const [checkX, checkY] = checkPoint;
	const [startX, startY] = startPoint;
	const [endX, endY] = endPoint;

	const minX = Math.min(startX, endX);
	const maxX = Math.max(startX, endX);
	const minY = Math.min(startY, endY);
	const maxY = Math.max(startY, endY);

	return checkX >= minX && checkX <= maxX && checkY >= minY && checkY <= maxY;
};

/**
 * Check if a number is within a range
 */
export const inRange = (num: number, start: number, end: number): boolean => {
	if (start > end) {
		return num >= end && num <= start;
	}
	return num >= start && num <= end;
};

/**
 * Serialize and merge overlapping ranges
 */
export const serializedRanges = (ranges: IRange[]): IRange[] => {
	if (ranges.length <= 1) {
		return ranges;
	}

	const sortedRanges = [...ranges].sort((a, b) => a[0] - b[0]);
	const mergedRanges: IRange[] = [];
	let currentRange: IRange = [...sortedRanges[0]];

	for (let i = 1; i < sortedRanges.length; i++) {
		const nextRange = sortedRanges[i];
		if (nextRange[0] <= currentRange[1] + 1) {
			currentRange = [
				currentRange[0],
				Math.max(currentRange[1], nextRange[1]),
			];
		} else {
			mergedRanges.push(currentRange);
			currentRange = [...nextRange];
		}
	}
	mergedRanges.push(currentRange);

	return mergedRanges;
};

/**
 * Mix ranges - removes overlapping parts (like XOR operation)
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export const mixRanges = (ranges: IRange[], newRange: IRange): IRange[] => {
	const result: IRange[] = [];
	let added = false;

	for (const range of ranges) {
		if (!added && range[0] === newRange[0] && newRange[1] === range[1]) {
			added = true;
		} else if (!added && newRange[0] > range[0] && newRange[1] < range[1]) {
			result.push([range[0], newRange[0] - 1]);
			result.push([newRange[1] + 1, range[1]]);
			added = true;
		} else if (
			!added &&
			newRange[0] <= range[1] &&
			newRange[1] >= range[0]
		) {
			if (newRange[0] > range[0]) {
				result.push([range[0], newRange[0] - 1]);
			}
			if (newRange[1] < range[1]) {
				result.push([newRange[1] + 1, range[1]]);
			}
			added = true;
		} else {
			result.push([...range]);
		}
	}

	if (!added) {
		result.push(newRange);
	}
	return serializedRanges(result);
};

/**
 * Calculate max range for cell selection
 */
export const calculateMaxRange = (
	selection: CombinedSelection,
): [number, number] | null => {
	const { isCellSelection, ranges } = selection;
	if (isCellSelection) {
		const [startColIndex, startRowIndex] = ranges[0];
		const [endColIndex, endRowIndex] = ranges[1];
		return [
			Math.max(startColIndex, endColIndex),
			Math.max(startRowIndex, endRowIndex),
		];
	}
	return null;
};

/**
 * Check if a row or cell is active
 */
export const checkIfRowOrCellActive = (
	activeCell: ICellItem | null,
	rowIndex: number,
	columnIndex: number,
) => {
	if (activeCell == null) {
		return {
			isRowActive: false,
			isCellActive: false,
		};
	}
	const [activeColumnIndex, activeRowIndex] = activeCell;
	return {
		isRowActive: activeRowIndex === rowIndex,
		isCellActive:
			activeRowIndex === rowIndex && activeColumnIndex === columnIndex,
	};
};

/**
 * Check if a row or cell is selected
 */
export const checkIfRowOrCellSelected = (
	selection: CombinedSelection,
	rowIndex: number,
	columnIndex: number,
) => {
	const { isRowSelection, isCellSelection, isColumnSelection } = selection;

	// Check row selection first (row selection takes precedence)
	if (isRowSelection && selection.includes([rowIndex, rowIndex])) {
		return {
			isRowSelected: true,
			isCellSelected: true,
		};
	}

	// Check column selection (column selection makes all cells in that column selected)
	if (isColumnSelection && selection.includes([columnIndex, columnIndex])) {
		return {
			isRowSelected: false,
			isCellSelected: true,
		};
	}

	// Check cell selection (specific cell selection)
	if (isCellSelection && selection.includes([columnIndex, rowIndex])) {
		return {
			isRowSelected: false,
			isCellSelected: true,
		};
	}

	return {
		isRowSelected: false,
		isCellSelected: false,
	};
};

/**
 * Get the number of rows affected by a selection
 * Inspired by Teable's getEffectRows function
 * Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/utils/selection.ts (line 120-134)
 */
export const getEffectRows = (selection: CombinedSelection): number => {
	const { type, ranges } = selection;

	if (type === SelectionRegionType.Rows) {
		// For row selection, sum up all ranges
		return ranges.reduce((acc, range) => acc + range[1] - range[0] + 1, 0);
	}

	if (type === SelectionRegionType.Cells) {
		// For cell selection, calculate row span
		const [startRange, endRange] = ranges;
		const [, startRow] = startRange;
		const [, endRow] = endRange;
		return Math.abs(endRow - startRow) + 1;
	}

	return 0;
};

/**
 * Get record IDs from selection
 * Extracts all record IDs that are selected
 */
export const getSelectedRecordIds = (
	selection: CombinedSelection,
	records: Array<{ id: string }>,
): string[] => {
	const { type, ranges } = selection;
	const recordIds: string[] = [];

	if (type === SelectionRegionType.Rows) {
		// For row selection, get all row indices and map to record IDs
		for (const range of ranges) {
			const [start, end] = range;
			for (let i = start; i <= end; i++) {
				if (records[i]) {
					recordIds.push(records[i].id);
				}
			}
		}
	} else if (type === SelectionRegionType.Cells) {
		// For cell selection, get unique row indices
		const [startRange, endRange] = ranges;
		const [, startRow] = startRange;
		const [, endRow] = endRange;
		const minRow = Math.min(startRow, endRow);
		const maxRow = Math.max(startRow, endRow);

		for (let i = minRow; i <= maxRow; i++) {
			if (records[i]) {
				recordIds.push(records[i].id);
			}
		}
	}

	// Remove duplicates
	return Array.from(new Set(recordIds));
};
