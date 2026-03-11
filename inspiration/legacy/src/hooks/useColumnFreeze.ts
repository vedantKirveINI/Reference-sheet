// Inspired by Teable's useColumnFreeze hook
// Reference: teable/packages/sdk/src/components/grid/hooks/useColumnFreeze.ts
import { useState } from "react";
import { IColumnFreezeState, IMouseState, RegionType } from "../types";
import type { IScrollState } from "../types";
import type { CoordinateManager } from "../managers/coordinate-manager";

// Default freeze state (like Teable)
const DEFAULT_FREEZE_COLUMN_STATE: IColumnFreezeState = {
	sourceIndex: -1,
	targetIndex: -1,
	isFreezing: false,
};

// Helper function to check if value is in range (like Teable)
const inRangeHelper = (value: number, min: number, max: number): boolean => {
	return value >= min && value < max;
};

export const useColumnFreeze = (
	coordInstance: CoordinateManager,
	scrollState: IScrollState,
) => {
	const [columnFreezeState, setColumnFreezeState] =
		useState<IColumnFreezeState>(DEFAULT_FREEZE_COLUMN_STATE);

	const onColumnFreezeStart = (mouseState: IMouseState) => {
		const { type } = mouseState;

		if (type !== RegionType.ColumnFreezeHandler) return;

		const { freezeColumnCount } = coordInstance;
		setColumnFreezeState({
			sourceIndex: freezeColumnCount - 1,
			targetIndex: freezeColumnCount - 1,
			isFreezing: true,
		});
	};

	const onColumnFreezeMove = (mouseState: IMouseState) => {
		const { sourceIndex, isFreezing } = columnFreezeState;

		if (!isFreezing) return;

		const { scrollLeft } = scrollState;
		const { x } = mouseState;
		const { columnCount, freezeRegionWidth, columnInitSize } = coordInstance;

		// Calculate which column the mouse is over (like Teable's getPosition)
		// Account for frozen vs scrollable regions
		let columnIndex: number;
		if (x <= freezeRegionWidth) {
			// In frozen region: x is already in absolute coordinate space
			if (x <= columnInitSize) {
				// Row header area - use first frozen column
				columnIndex = 0;
			} else {
				columnIndex = coordInstance.getColumnStartIndex(x);
			}
		} else {
			// In scrollable region: need absolute position (scrollLeft + x)
			columnIndex = coordInstance.getColumnStartIndex(scrollLeft + x);
		}

		// Clamp to valid column range
		columnIndex = Math.min(Math.max(columnIndex, 0), columnCount - 1);

		// Calculate target index based on which half of the column we're in
		const columnWidth = coordInstance.getColumnWidth(columnIndex);
		const columnOffsetX = coordInstance.getColumnRelativeOffset(
			columnIndex,
			scrollLeft,
		);
		const targetIndex = inRangeHelper(x, columnOffsetX, columnOffsetX + columnWidth / 2)
			? columnIndex - 1
			: columnIndex;

		setColumnFreezeState({
			sourceIndex,
			targetIndex: Math.min(Math.max(targetIndex, -1), columnCount - 1),
			isFreezing: true,
		});
	};

	const onColumnFreezeEnd = (callbackFn?: (columnCount: number) => void) => {
		const { targetIndex, isFreezing } = columnFreezeState;
		if (!isFreezing) return;
		setColumnFreezeState(() => DEFAULT_FREEZE_COLUMN_STATE);
		callbackFn?.(Math.max(targetIndex + 1, 0));
	};

	return {
		columnFreezeState,
		onColumnFreezeStart,
		onColumnFreezeMove,
		onColumnFreezeEnd,
	};
};
