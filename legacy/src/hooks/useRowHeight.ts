// Row height management - Using preset levels (Inspired by Teable)
// Row height is now a view-level setting (stored in Zustand store)
// All rows use the same global height - no per-row heightLevel needed
import { IRowHeader, RowHeightLevel, ROW_HEIGHT_DEFINITIONS } from "../types";

export const useRowHeight = (
	rowHeaders: IRowHeader[],
	defaultRowHeightLevel: RowHeightLevel = RowHeightLevel.Medium,
) => {
	// Helper function to get row height in pixels from preset level
	// All rows use the same global view-level height (like Teable)
	const getRowHeight = (rowIndex: number): number => {
		// Don't check rowHeaders[rowIndex]?.heightLevel
		// All rows use the global view-level setting
		return ROW_HEIGHT_DEFINITIONS[defaultRowHeightLevel];
	};

	// Calculate total height for all rows - Sum of all preset heights
	const getTotalHeight = (): number => {
		return rowHeaders.reduce(
			(sum, _, index) => sum + getRowHeight(index),
			0,
		);
	};

	// Helper function to find row index from y position
	const getRowIndexFromY = (y: number, headerHeight: number): number => {
		let currentY = headerHeight;
		for (let i = 0; i < rowHeaders.length; i++) {
			const rowHeight = getRowHeight(i);
			if (y >= currentY && y < currentY + rowHeight) {
				return i;
			}
			currentY += rowHeight;
		}
		return -1;
	};

	// Helper function to get row offset (Y position where row starts)
	const getRowOffset = (rowIndex: number, headerHeight: number): number => {
		let offset = headerHeight;
		for (let i = 0; i < rowIndex; i++) {
			offset += getRowHeight(i);
		}
		return offset;
	};

	return {
		getRowHeight,
		getTotalHeight,
		getRowIndexFromY,
		getRowOffset,
	};
};
