// Inspired by Teable's region detection system
// Reference: teable/packages/sdk/src/components/grid/utils/region.ts
import { RegionType, IMouseState, IColumn, LinearRowType, IGridTheme } from "../types";
import type { CoordinateManager } from "../managers/coordinate-manager";

const RESIZE_HANDLE_WIDTH = 5; // 5px wide resize handle
const COLUMN_FREEZE_HANDLER_WIDTH = 10; // 10px wide freeze handler (like Teable)
const COLUMN_FREEZE_HANDLER_HEIGHT = 20; // 20px tall freeze handler (like Teable)
const COLUMN_STATISTIC_HEIGHT = 40; // Footer height (like Teable)

// Helper function to check if value is in range (like Teable)
const inRange = (value: number, min: number, max: number): boolean => {
	return value >= min && value < max;
};

// Phase 1: Enhanced region detection with group row support (like Teable)
// Reference: teable/packages/sdk/src/components/grid/utils/region.ts (checkIsRowHeader)
export const detectRegion = (
	x: number,
	y: number,
	columns: IColumn[],
	headerHeight: number,
	getColumnWidth: (index: number) => number,
	rowHeaderWidth: number = 0,
	scrollLeft: number = 0,
	getColumnRelativeOffset?: (
		columnIndex: number,
		scrollLeft: number,
	) => number,
	// ADD: coordinateManager and scrollTop for accurate row detection with variable row heights
	coordinateManager?: CoordinateManager,
	scrollTop: number = 0,
	// Phase 1: Group row detection (like Teable)
	getLinearRow?: (
		rowIndex: number,
	) => { type: LinearRowType; id?: string } | null,
	columnAppendWidth: number = 0,
	// Phase 2C: Pass contentWidth for accurate append column positioning
	contentWidth?: number,
	// Checkbox detection props
	isMultiSelectionEnable?: boolean,
	pureRowCount?: number,
	theme?: IGridTheme,
	// Column freeze detection
	isColumnFreezable?: boolean,
): IMouseState => {
	const fallbackTotalWidth =
		rowHeaderWidth +
		columns.reduce((sum, _, index) => sum + getColumnWidth(index), 0);
	let appendColumnStart: number | null = null;
	if (columnAppendWidth > 0) {
		// Phase 2C: Use contentWidth if provided (matches GridView calculation)
		// Otherwise fall back to coordinateManager.totalWidth or fallbackTotalWidth
		const actualContentWidth =
			contentWidth ?? coordinateManager?.totalWidth ?? fallbackTotalWidth;
		// Append column sits immediately after the last real column
		appendColumnStart = actualContentWidth - scrollLeft;
	}

	// Check if mouse is in "Select All" checkbox area (top-left corner)
	// Reference: teable/packages/sdk/src/components/grid/utils/region.ts (checkIsAllCheckbox, lines 253-279)
	if (
		isMultiSelectionEnable &&
		x < rowHeaderWidth &&
		y < headerHeight &&
		theme &&
		pureRowCount !== undefined
	) {
		const iconSizeXS = theme.iconSizeXS || 16;
		const halfIconSize = iconSizeXS / 2;
		const minX = rowHeaderWidth / 2 - halfIconSize;
		const minY = headerHeight / 2 - halfIconSize;
		if (inRange(x, minX, minX + iconSizeXS) && inRange(y, minY, minY + iconSizeXS)) {
			return {
				x,
				y,
				columnIndex: -1,
				rowIndex: -1,
				type: RegionType.AllCheckbox,
				isOutOfBounds: false,
			};
		}
	}

	// Check if mouse is in header area (top row)
	if (y < headerHeight) {
		// Like Teable: Check ALL columns for resize handle, even if outside viewport
		// This allows resize handles to appear when columns are scrolled outside view
		if (getColumnRelativeOffset) {
			for (let i = 0; i < columns.length; i++) {
				const columnWidth = getColumnWidth(i);
				const startOffsetX = getColumnRelativeOffset(i, scrollLeft);
				const endOffsetX = startOffsetX + columnWidth;

				// Check if mouse is over the RESIZE HANDLE (like Teable)
				// For non-first columns: check both left and right edges
				// For first column: only check right edge
				const halfHandleWidth = RESIZE_HANDLE_WIDTH / 2;
				const isOverRightHandle =
					x >= endOffsetX - halfHandleWidth &&
					x <= endOffsetX + halfHandleWidth;
				const isOverLeftHandle =
					i !== 0 && // Only check left edge for non-first columns
					x >= startOffsetX - halfHandleWidth &&
					x <= startOffsetX + halfHandleWidth;

				if (isOverRightHandle || isOverLeftHandle) {
					// Determine which column to resize
					// If over left handle of column i, we're resizing column i-1
					const resizeColumnIndex = isOverLeftHandle ? i - 1 : i;
					return {
						x,
						y,
						columnIndex: resizeColumnIndex,
						rowIndex: -1,
						type: RegionType.ColumnResizeHandler,
						isOutOfBounds: false,
					};
				}
			}

			// If not over resize handle, find which column header mouse is over
			for (let i = 0; i < columns.length; i++) {
				const columnWidth = getColumnWidth(i);
				const startOffsetX = getColumnRelativeOffset(i, scrollLeft);
				const endOffsetX = startOffsetX + columnWidth;

				if (x >= startOffsetX && x < endOffsetX) {
					// Check if click is in dropdown area (right side of header)
					const dropdownIconSize = 16;
					const dropdownPadding = 8; // cellHorizontalPadding default
					const dropdownX = endOffsetX - dropdownPadding - dropdownIconSize;
					const dropdownEndX = endOffsetX - dropdownPadding;

					// If click is in dropdown area, return ColumnHeaderDropdown
					if (x >= dropdownX && x <= dropdownEndX) {
						return {
							x,
							y,
							columnIndex: i,
							rowIndex: -1,
							type: RegionType.ColumnHeaderDropdown,
							isOutOfBounds: false,
						};
					}

					// Otherwise, it's a regular column header click
					return {
						x,
						y,
						columnIndex: i,
						rowIndex: -1,
						type: RegionType.ColumnHeader,
						isOutOfBounds: false,
					};
				}
			}
		} else {
			// Fallback to old method if getColumnRelativeOffset not provided
			let currentX = rowHeaderWidth;
			for (let i = 0; i < columns.length; i++) {
				const columnWidth = getColumnWidth(i);
				const columnEndX = currentX + columnWidth;

				if (x >= currentX && x < columnEndX) {
					const handleStartX = columnEndX - RESIZE_HANDLE_WIDTH;
					const handleEndX = columnEndX + RESIZE_HANDLE_WIDTH;

					if (x >= handleStartX && x <= handleEndX) {
						return {
							x,
							y,
							columnIndex: i,
							rowIndex: -1,
							type: RegionType.ColumnResizeHandler,
							isOutOfBounds: false,
						};
					}

					return {
						x,
						y,
						columnIndex: i,
						rowIndex: -1,
						type: RegionType.ColumnHeader,
						isOutOfBounds: false,
					};
				}
				currentX += columnWidth;
			}
		}

		if (
			appendColumnStart != null &&
			x >= appendColumnStart &&
			x <= appendColumnStart + columnAppendWidth
		) {
			return {
				x,
				y,
				columnIndex: columns.length,
				rowIndex: -1,
				type: RegionType.AppendColumn,
				isOutOfBounds: false,
			};
		}
	}

	// Mouse is in data area (not header)
	// FIX: Use coordinateManager.getRowStartIndex() like Teable (handles variable row heights)
	// Instead of hardcoded: Math.floor((y - headerHeight) / 32)
	// Like Teable InteractionLayer.tsx:258: coordInstance.getRowStartIndex(scrollTop + y)
	// y is relative to canvas (includes header), scrollTop is in content space
	// getRowStartIndex expects absolute position: scrollTop + y (both in grid space including header)
	let rowIndex = -1;

	let linearRow =
		getLinearRow && rowIndex >= 0 ? getLinearRow(rowIndex) : null;

	if (coordinateManager) {
		// Like Teable: Use getRowStartIndex with absolute position
		const absoluteY = scrollTop + y;
		rowIndex = coordinateManager.getRowStartIndex(absoluteY);
		linearRow =
			getLinearRow && rowIndex >= 0 ? getLinearRow(rowIndex) : linearRow;
	} else {
		// Fallback to old method (shouldn't be used, but keep for safety)
		rowIndex = Math.floor((y - headerHeight) / 32);
	}

	// Phase 1: Check if clicked on row header area (like Teable's checkIsRowHeader)
	// Reference: teable/packages/sdk/src/components/grid/utils/region.ts (lines 294-303)
	if (x < rowHeaderWidth && rowIndex >= 0 && linearRow) {
		if (linearRow.type === LinearRowType.Append) {
			return {
				x,
				y,
				columnIndex: -1,
				rowIndex,
				type: RegionType.AppendRow,
				isOutOfBounds: false,
			};
		}

		if (linearRow.type === LinearRowType.Group) {
			// LOG: Region detection for group rows (only when region changes, see handleMouseMove)
			// This is called on every mouse move, but we only log when region actually changes
			return {
				x,
				y,
				columnIndex: -1, // Row header area
				rowIndex,
				type: RegionType.RowGroupControl, // Like Teable: RegionType.RowGroupControl
				isOutOfBounds: false,
			};
		}

		// Regular row header - check if click is on checkbox
		if (linearRow.type === LinearRowType.Row) {
			// Check if click is on row header checkbox (like Teable's checkIsRowHeader)
			// Reference: teable/packages/sdk/src/components/grid/utils/region.ts (checkIsRowHeader, lines 294-337)
			if (isMultiSelectionEnable && theme && coordinateManager) {
				const iconSizeXS = theme.iconSizeXS || 16;
				const rowHeadIconPaddingTop = theme.rowHeadIconPaddingTop || 8;
				const halfIconSize = iconSizeXS / 2;
				const checkboxX = rowHeaderWidth / 2 - halfIconSize;
				const offsetY =
					coordinateManager.getRowOffset(rowIndex) - scrollTop;
				const checkboxY = offsetY + rowHeadIconPaddingTop;

				if (
					inRange(x, checkboxX, checkboxX + iconSizeXS) &&
					inRange(y, checkboxY, checkboxY + iconSizeXS)
				) {
					return {
						x,
						y,
						columnIndex: -1,
						rowIndex,
						type: RegionType.RowHeaderCheckbox,
						isOutOfBounds: false,
					};
				}
			}

			// Regular row header (not checkbox)
			return {
				x,
				y,
				columnIndex: -1,
				rowIndex,
				type: RegionType.RowHeader,
				isOutOfBounds: false,
			};
		}
	}

	// FIX: Use coordinateManager.getColumnStartIndex() like Teable
	// Reference: teable/packages/sdk/src/components/grid/InteractionLayer.tsx (lines 259-268)
	// x is relative to canvas (includes row header), same as Teable's elX
	let columnIndex = -1;

	if (coordinateManager) {
		// Like Teable: Calculate column index using getColumnStartIndex
		// x is in full coordinate space (includes row header), same as Teable's elX
		const { freezeRegionWidth, columnInitSize, columnCount, totalWidth } = coordinateManager;

		// Match Teable's logic exactly (lines 259-268)
		// Note: Row header area (x <= columnInitSize) is already handled above (line 177)
		if (x < 0) {
			columnIndex = -Infinity;
		} else if (
			columnAppendWidth > 0 &&
			scrollLeft + x > totalWidth &&
			scrollLeft + x < totalWidth + columnAppendWidth
		) {
			// Append column area
			columnIndex = -2;
		} else if (x <= freezeRegionWidth) {
			// In frozen region (freezeRegionWidth already includes columnInitSize/rowHeaderWidth)
			// Row header already handled above, so x > columnInitSize here
			// Frozen columns: x is already in coordinate space
			columnIndex = coordinateManager.getColumnStartIndex(x);
		} else {
			// Scrollable columns: need absolute position (scrollLeft + x)
			columnIndex = coordinateManager.getColumnStartIndex(scrollLeft + x);
		}

		// Clamp to valid column range (like Teable line 270)
		columnIndex = Math.min(columnIndex, columnCount - 1);

		// Check if mouse is over freeze handler line (like Teable's checkIsFreezeColumnHandler)
		// Reference: teable/packages/sdk/src/components/grid/utils/region.ts (lines 153-169)
		if (isColumnFreezable && freezeRegionWidth > 0) {
			const halfWidth = COLUMN_FREEZE_HANDLER_WIDTH / 2;
			const rowInitSize = coordinateManager.rowInitSize;
			const containerHeight = coordinateManager.containerHeight;
			const rowCount = coordinateManager.rowCount;
			const offsetY = coordinateManager.getRowOffset(rowCount) - scrollTop;
			const maxY = Math.min(offsetY, containerHeight - COLUMN_STATISTIC_HEIGHT);

			if (
				inRange(x, freezeRegionWidth - halfWidth, freezeRegionWidth + halfWidth) &&
				inRange(y, rowInitSize, maxY)
			) {
				return {
					x,
					y,
					columnIndex: -1,
					rowIndex: -1,
					type: RegionType.ColumnFreezeHandler,
					isOutOfBounds: false,
				};
			}
		}
	} else {
		// Fallback to old method if coordinateManager not provided
		// FIX: Start at rowHeaderWidth instead of 0
		let currentX = rowHeaderWidth;
		for (let i = 0; i < columns.length; i++) {
			const columnWidth = getColumnWidth(i);
			if (x >= currentX && x < currentX + columnWidth) {
				columnIndex = i;
				break;
			}
			currentX += columnWidth;
		}
	}

	// Phase 1: Check if clicked on group header content area (column 0, group row)
	// Reference: teable/packages/sdk/src/components/grid/utils/region.ts (checkIsRowGroupHeader, lines 339-362)
	if (rowIndex >= 0 && columnIndex === 0 && linearRow) {
		// LOG: Region detection for group header (only when region changes, see handleMouseMove)
		// This is called on every mouse move, but we only log when region actually changes
		if (linearRow?.type === LinearRowType.Group) {
			return {
				x,
				y,
				columnIndex: 0,
				rowIndex,
				type: RegionType.RowGroupHeader, // Like Teable: RegionType.RowGroupHeader
				isOutOfBounds: false,
			};
		}
	}

	// Check if click is in empty space to the right of the table (before AppendRow check)
	// This prevents cell selection when clicking in empty space
	if (x >= rowHeaderWidth && rowIndex >= 0) {
		// We're in the data area - check if click is beyond content width
		const actualTotalWidth = coordinateManager?.totalWidth ?? 
			(contentWidth ?? (rowHeaderWidth + columns.reduce((sum, _, index) => sum + getColumnWidth(index), 0)));
		
		// Convert relative x to absolute position (account for scrolling)
		// If absolute position is beyond total width, we're in empty space to the right
		if (scrollLeft + x > actualTotalWidth) {
			// Click is in empty space to the right - return Cell type with out of bounds flag
			return {
				x,
				y,
				columnIndex: -1, // Invalid column index
				rowIndex: -1, // Invalid row index
				type: RegionType.Cell,
				isOutOfBounds: true, // Mark as out of bounds to prevent selection
			};
		}
	}

	if (linearRow?.type === LinearRowType.Append) {

		const rowTop = (coordinateManager?.getRowOffset(rowIndex) ?? 0) - scrollTop;
			const rowHeight = coordinateManager?.getRowHeight(rowIndex);
			const rowBottom = rowTop + (rowHeight ?? 0);

		if( y < rowTop || y > rowBottom) {
			// Click is outside append row bounds - return default Cell type
			return {
				x,
				y,
				columnIndex,
				rowIndex: -1, // Invalid row index
				type: RegionType.Cell,
				isOutOfBounds: true, // Mark as out of bounds
			};
		}

		return {
			x,
			y,
			columnIndex,
			rowIndex,
			type: RegionType.AppendRow,
			isOutOfBounds: false,
		};
	}

	return {
		x,
		y,
		columnIndex,
		rowIndex,
		type: RegionType.Cell,
		isOutOfBounds: false,
	};
};
