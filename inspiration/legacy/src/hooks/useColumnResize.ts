// Inspired by Teable's useColumnResize hook
import { useState, useCallback, useRef } from "react";
import { IColumnResizeState, IMouseState, RegionType, IColumn } from "../types";

export const useColumnResize = (
	columns: IColumn[],
	onColumnResize?: (columnIndex: number, newWidth: number) => void,
) => {
	const [hoveredColumnResizeIndex, setHoveredColumnResizeIndex] =
		useState(-1);
	const [columnResizeState, setColumnResizeState] =
		useState<IColumnResizeState>({
			columnIndex: -1,
			width: 0,
			x: 0,
			isResizing: false,
		});

	// Store initial values for smooth resizing
	const initialValuesRef = useRef<{
		startX: number;
		startWidth: number;
		columnIndex: number;
	} | null>(null);

	const MIN_COLUMN_WIDTH = 50;

	// Called when mouse moves over grid
	const onColumnResizeChange = useCallback(
		(mouseState: IMouseState, callback?: () => void) => {
			const { x, columnIndex, type } = mouseState;
			const { columnIndex: resizeColumnIndex, isResizing } =
				columnResizeState;

			// If we're currently resizing a column
			if (
				isResizing &&
				resizeColumnIndex > -1 &&
				initialValuesRef.current
			) {
				const { startX, startWidth } = initialValuesRef.current;
				const deltaX = x - startX; // How much mouse moved from start position
				const newWidth = Math.max(
					MIN_COLUMN_WIDTH,
					Math.round(startWidth + deltaX),
				);

				// Update resize state with new width
				setColumnResizeState((prev) => ({
					...prev,
					x, // Update mouse position
					width: newWidth, // Update width
				}));

				// DON'T call onColumnResize here - it causes full data updates on every mouse move
				// The parent will be notified on resize end instead

				// Call the animation callback for smooth updates
				if (callback) {
					callback();
				}
			}

			// Check if mouse is hovering over a resize handle
			if (type === RegionType.ColumnResizeHandler) {
				setHoveredColumnResizeIndex(columnIndex);
			} else {
				setHoveredColumnResizeIndex(-1);
			}
		},
		[columnResizeState, columns],
	);

	// Called when mouse is pressed down
	const onColumnResizeStart = useCallback(
		(mouseState: IMouseState) => {
			const { type, columnIndex, x } = mouseState;

			if (type === RegionType.ColumnResizeHandler) {
				const startWidth = columns[columnIndex]?.width || 120;

				// Store initial values for smooth resizing
				initialValuesRef.current = {
					startX: x,
					startWidth: startWidth,
					columnIndex: columnIndex,
				};

				setColumnResizeState({
					columnIndex,
					width: startWidth,
					x,
					isResizing: true, // Start resizing!
				});
			}
		},
		[columns],
	);

	// Called when mouse is released
	const onColumnResizeEnd = useCallback(() => {
		if (
			columnResizeState.isResizing &&
			columnResizeState.columnIndex >= 0
		) {
			// Save the final width - this is the ONLY place we call the parent
			// This ensures the width is persisted properly
			onColumnResize?.(
				columnResizeState.columnIndex,
				columnResizeState.width,
			);
		}

		// Reset resize state
		setColumnResizeState({
			columnIndex: -1,
			width: 0,
			x: 0,
			isResizing: false,
		});

		// FIX: Clear hovered resize index when resize ends (prevent resize handler from staying visible)
		// This matches Teable's behavior: resize handler should only show when hovering or actively resizing
		setHoveredColumnResizeIndex(-1);

		// Clear initial values
		initialValuesRef.current = null;
	}, [columnResizeState, onColumnResize]);

	return {
		columnResizeState,
		hoveredColumnResizeIndex,
		onColumnResizeStart,
		onColumnResizeChange,
		onColumnResizeEnd,
	};
};
