// useSelection hook - Inspired by Teable
// Phase 2: Full implementation with mouse/keyboard event handling

import { useRef, useState } from "react";
import { useUnmount, useUpdateEffect } from "react-use";
import type { ICellItem, ILinearRow, IMouseState, IPosition } from "@/types";
import { RegionType, SelectableType } from "@/types";
import { SelectionRegionType } from "@/types/selection";
import type { IRange } from "@/types/selection";
import { CombinedSelection } from "@/managers/selection-manager";
import type { CoordinateManager } from "@/managers/coordinate-manager";

// Props interface for useSelection hook
export interface IUseSelectionProps {
	coordInstance: CoordinateManager;
	selectable?: SelectableType;
	isMultiSelectionEnable?: boolean;
	getLinearRow: (index: number) => ILinearRow;
	onSelectionChanged?: (selection: CombinedSelection) => void;
	setActiveCell: React.Dispatch<React.SetStateAction<ICellItem | null>>;
}

export const useSelection = (props: IUseSelectionProps) => {
	const {
		coordInstance,
		selectable,
		isMultiSelectionEnable,
		getLinearRow,
		setActiveCell,
		onSelectionChanged,
	} = props;
	const onSelectionChangedRef = useRef<
		IUseSelectionProps["onSelectionChanged"] | undefined
	>();
	const prevSelectedRowIndex = useRef<number | null>(null);
	const [isSelecting, setSelecting] = useState(false);
	const justFinishedSelecting = useRef(false); // Track if we just finished a drag
	const selectionStartPos = useRef<{ x: number; y: number } | null>(null); // Track drag start position
	const [selection, setSelection] = useState(() => new CombinedSelection());
	const { pureRowCount } = coordInstance;
	onSelectionChangedRef.current = onSelectionChanged;

	/**
	 * Called when user starts selecting (mousedown) - Phase 2 Implementation
	 * Inspired by Teable's onSelectionStart
	 */
	const onSelectionStart = (
		event: React.MouseEvent<HTMLElement, MouseEvent>,
		mouseState: IMouseState,
	) => {
		if (
			selectable !== SelectableType.All &&
			selectable !== SelectableType.Cell
		)
			return;

		const { type, rowIndex, columnIndex, x, y } = mouseState;
		const { isRowSelection: isPrevRowSelection, ranges: prevRanges } =
			selection;
		const isShiftKey = event.shiftKey && !event.metaKey;

		// Track starting position to detect if user dragged
		selectionStartPos.current = { x, y };

		switch (type) {
			case RegionType.Cell:
			case RegionType.ActiveCell: {
				const { realIndex } = getLinearRow(rowIndex);
				const range = [columnIndex, realIndex] as IRange;
				const isExpandSelection =
					isShiftKey && !isPrevRowSelection && prevRanges[0] != null;
				const ranges = [
					isExpandSelection ? prevRanges[0] : range,
					range,
				];
				if (!isExpandSelection) {
					setActiveCell(range);
				}
				if (isMultiSelectionEnable) {
					setSelecting(true);
				}
				return setSelection(
					selection.set(SelectionRegionType.Cells, ranges),
				);
			}
			case RegionType.RowHeaderDragHandler:
			case RegionType.RowHeaderCheckbox:
			case RegionType.ColumnHeader:
			case RegionType.AllCheckbox:
			case RegionType.RowHeader:
			case RegionType.AppendRow:
			case RegionType.AppendColumn:
				return;
			default:
				setActiveCell(null);
				return setSelection(selection.reset());
		}
	};

	/**
	 * Called when user drags to extend selection (mousemove during drag) - Phase 2 Implementation
	 * Inspired by Teable's onSelectionChange
	 */
	const onSelectionChange = (mouseState: IMouseState) => {
		const { isCellSelection, ranges } = selection;
		const { rowIndex, columnIndex } = mouseState;

		if (!isSelecting) return;
		const { realIndex } = getLinearRow(rowIndex);
		const newRange = [columnIndex, realIndex] as IRange;
		if (isCellSelection && !selection.equals([ranges[0], newRange])) {
			setSelection(selection.merge(newRange));
		}
	};

	/**
	 * Called when user ends selection (mouseup) - Phase 2 Implementation
	 * Inspired by Teable's onSelectionEnd
	 */
	const onSelectionEnd = (mouseState?: IMouseState) => {
		// Check if user actually dragged (moved more than 5 pixels)
		const dragged =
			selectionStartPos.current &&
			mouseState &&
			(Math.abs(mouseState.x - selectionStartPos.current.x) > 5 ||
				Math.abs(mouseState.y - selectionStartPos.current.y) > 5);

		// Only preserve selection if user was dragging (not just clicking)
		justFinishedSelecting.current = isSelecting && (dragged || false);

		setSelecting(false);
		selectionStartPos.current = null;

		// Clear flag after a short delay to allow click handler to check it
		setTimeout(() => {
			justFinishedSelecting.current = false;
		}, 100);
	};

	/**
	 * Called when user clicks on a cell/header - Phase 2 Implementation
	 * Inspired by Teable's onSelectionClick
	 */
	const onSelectionClick = (
		event: React.MouseEvent<HTMLElement, MouseEvent>,
		mouseState: IMouseState,
	) => {
		const { shiftKey, metaKey } = event;
		const isShiftKey = shiftKey && !metaKey;
		const isMetaKey = metaKey && !shiftKey;
		const { type, rowIndex: hoverRowIndex, columnIndex } = mouseState;
		const {
			ranges: prevSelectionRanges,
			isColumnSelection: isPrevColumnSelection,
			isRowSelection: isPrevRowSelection,
		} = selection;

		const pureSelectColumnOrRow = (
			colOrRowIndex: number,
			type: SelectionRegionType,
		) => {
			const range = [colOrRowIndex, colOrRowIndex] as IRange;
			let newSelection;

			if (
				isPrevRowSelection &&
				(isMultiSelectionEnable ||
					(!isMultiSelectionEnable &&
						prevSelectionRanges[0][0] === colOrRowIndex))
			) {
				newSelection = selection.merge(range);
			} else {
				newSelection = selection.set(type, [range]);
			}
			if (newSelection.includes(range)) {
				prevSelectedRowIndex.current = colOrRowIndex;
			}
			setActiveCell(null);
			setSelection(newSelection);
		};

		switch (type) {
			case RegionType.ColumnHeader: {
				if (
					selectable !== SelectableType.All &&
					selectable !== SelectableType.Column
				)
					return;
				const thresholdColIndex =
					isMultiSelectionEnable &&
					isShiftKey &&
					isPrevColumnSelection
						? prevSelectionRanges[0][0]
						: columnIndex;
				const ranges = [
					[
						Math.min(thresholdColIndex, columnIndex),
						Math.max(thresholdColIndex, columnIndex),
					],
				] as IRange[];
				let newSelection = selection.set(
					SelectionRegionType.Columns,
					ranges,
				);
				if (
					isMultiSelectionEnable &&
					isMetaKey &&
					isPrevColumnSelection
				) {
					newSelection = selection.merge([columnIndex, columnIndex]);
				}
				if (!isShiftKey || !isPrevColumnSelection) {
					const { isNoneSelection, ranges } = newSelection;
					isNoneSelection
						? setActiveCell(null)
						: setActiveCell([ranges[0][0], 0]);
				}
				return setSelection(newSelection);
			}
			case RegionType.RowHeaderCheckbox: {
				const { realIndex: rowIndex } = getLinearRow(hoverRowIndex);
				if (
					selectable !== SelectableType.All &&
					selectable !== SelectableType.Row
				)
					return;
				const range = [rowIndex, rowIndex] as IRange;
				if (
					isMultiSelectionEnable &&
					isShiftKey &&
					isPrevRowSelection &&
					prevSelectedRowIndex.current != null
				) {
					if (selection.includes(range)) return;
					const prevIndex = prevSelectedRowIndex.current;
					const newRange = [
						Math.min(rowIndex, prevIndex),
						Math.max(rowIndex, prevIndex),
					] as IRange;
					const newSelection = selection.expand(newRange);
					prevSelectedRowIndex.current = rowIndex;
					setActiveCell(null);
					return setSelection(newSelection);
				}
				return pureSelectColumnOrRow(
					rowIndex,
					SelectionRegionType.Rows,
				);
			}
			case RegionType.Cell: {
				const { realIndex: rowIndex } = getLinearRow(hoverRowIndex);
				if (selectable === SelectableType.Row) {
					return pureSelectColumnOrRow(
						rowIndex,
						SelectionRegionType.Rows,
					);
				}
				if (selectable === SelectableType.Column) {
					return pureSelectColumnOrRow(
						columnIndex,
						SelectionRegionType.Columns,
					);
				}
				// Phase 2 Fix: Handle regular cell clicks for cell selection
				// When selectable is All or Cell, create a single-cell selection
				// BUT: Don't overwrite if we just finished a drag selection (Shift+drag)
				if (
					selectable === SelectableType.All ||
					selectable === SelectableType.Cell
				) {
					// If we just finished selecting (drag operation), preserve the selection
					if (justFinishedSelecting.current) {
						// Preserve the existing selection that was created during drag
						return;
					}

					// Handle Shift+Click for expanding selection (without drag)
					const isShiftKey = event.shiftKey && !event.metaKey;
					const {
						ranges: prevRanges,
						isRowSelection: isPrevRowSelection,
					} = selection;
					const isExpandSelection =
						isShiftKey &&
						!isPrevRowSelection &&
						prevRanges[0] != null;

					const range = [columnIndex, rowIndex] as IRange;
					let newSelection: CombinedSelection;

					if (isExpandSelection) {
						// Expand from previous anchor point
						const ranges = [prevRanges[0], range];
						newSelection = selection.set(
							SelectionRegionType.Cells,
							ranges,
						);
					} else {
						// Single cell selection
						newSelection = selection.set(
							SelectionRegionType.Cells,
							[range, range],
						);
						setActiveCell(range);
					}

					setSelection(newSelection);
				}
				return;
			}
			case RegionType.AllCheckbox: {
				if (
					selectable !== SelectableType.All &&
					selectable !== SelectableType.Row
				)
					return;
				const allRanges = [[0, pureRowCount - 1]] as IRange[];
				const isPrevAll =
					isPrevRowSelection && selection.equals(allRanges);
				const newSelection = isPrevAll
					? selection.reset()
					: selection.set(SelectionRegionType.Rows, allRanges);
				return setSelection(newSelection);
			}
		}
	};

	/**
	 * Called when user right-clicks for context menu - Phase 2 Implementation
	 * Inspired by Teable's onSelectionContextMenu
	 */
	const onSelectionContextMenu = (
		mouseState: IMouseState,
		callback: (selection: CombinedSelection, position: IPosition) => void,
	) => {
		const { x, y, columnIndex, rowIndex: hoverRowIndex, type } = mouseState;
		if (
			[
				RegionType.Blank,
				RegionType.ColumnStatistic,
				RegionType.GroupStatistic,
			].includes(type)
		)
			return;
		const {
			isCellSelection: isPrevCellSelection,
			isRowSelection: isPrevRowSelection,
			isColumnSelection: isPrevColumnSelection,
		} = selection;
		const isCellHovered = columnIndex >= -1 && hoverRowIndex > -1;
		const isColumnHovered = columnIndex > -1 && hoverRowIndex === -1;

		if (isCellHovered) {
			const { realIndex: rowIndex } = getLinearRow(hoverRowIndex);
			// Determine the checked range based on current selection type (exactly like Teable)
			const checkedRange = (
				isPrevCellSelection
					? [columnIndex, rowIndex]
					: isPrevRowSelection
						? [rowIndex, rowIndex]
						: isPrevColumnSelection
							? [columnIndex, columnIndex]
							: undefined
			) as IRange;
			const inPrevRanges = selection.includes(checkedRange);

			// If clicked cell/row/column is within the existing selection, preserve it
			// This is the key: we return early WITHOUT creating a new selection
			if (inPrevRanges) {
				return callback(selection, { x, y });
			}
			
			// Only create new selection if clicked cell is NOT in existing selection
			if (columnIndex > -1) {
				const range = [columnIndex, rowIndex] as IRange;
				const newSelection = selection.set(SelectionRegionType.Cells, [
					range,
					range,
				]);
				setActiveCell(range);
				setSelection(newSelection);
				return callback(newSelection, { x, y });
			}
		}

		if (isColumnHovered) {
			const inPrevColumnRanges =
				isPrevColumnSelection &&
				selection.includes([columnIndex, columnIndex]);

			if (inPrevColumnRanges) {
				return callback(selection, { x, y });
			}
			const newSelection = selection.set(SelectionRegionType.Columns, [
				[columnIndex, columnIndex],
			]);
			setActiveCell([columnIndex, 0]);
			setSelection(newSelection);
			callback(newSelection, { x, y });
		}
	};

	// ========================================
	// Selection change callback (exactly like Teable)
	// ========================================
	useUpdateEffect(() => {
		onSelectionChangedRef.current?.(selection);
	}, [selection]);

	// ========================================
	// Cleanup on unmount (exactly like Teable)
	// ========================================
	useUnmount(() => {
		onSelectionChangedRef.current = undefined;
	});

	return {
		selection,
		isSelecting,
		setActiveCell,
		setSelection,
		onSelectionStart,
		onSelectionChange,
		onSelectionEnd,
		onSelectionClick,
		onSelectionContextMenu,
	};
};
