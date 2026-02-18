// Keyboard Navigation Hook - Inspired by Teable's useKeyboardSelection
// Phase 2: Updated to use CombinedSelection
import { useCallback } from "react";
import { useHotkeys, isHotkeyPressed } from "react-hotkeys-hook";
import type { IKeyboardNavigationProps } from "@/types/keyboard";
import { CombinedSelection } from "@/managers/selection-manager";
import { SelectionRegionType } from "@/types/selection";
import type { ICellRange } from "@/types/selection";

export const useKeyboardNavigation = (props: IKeyboardNavigationProps) => {
	const {
		columns,
		records,
		activeCell,
		editingCell,
		setActiveCell,
		setEditingCell,
		onCellChange,
		scrollToCell,
		selection,
		setSelection,
		real2RowIndex,
		isRowVisible,
		getAdjacentVisibleRow,
		getVisibleBoundaryRow,
		canEditRecords = Boolean(onCellChange), // Default to true if onCellChange is provided
	} = props;

	const totalColumns = columns.length;
	const totalRows = records.length;

	// Calculate new position with bounds checking
	const getBoundedPosition = useCallback(
		(row: number, col: number): [number, number] => {
			return [
				Math.max(0, Math.min(col, totalColumns - 1)),
				Math.max(0, Math.min(row, totalRows - 1)),
			];
		},
		[totalColumns, totalRows],
	);

	// Update selection helper - Phase 2: Uses CombinedSelection
	const updateSelection = useCallback(
		(newRow: number, newCol: number, expandSelection: boolean = false) => {
			if (!activeCell || !selection) {
				// Create new selection if none exists
				const [boundedCol, boundedRow] = getBoundedPosition(
					newRow,
					newCol,
				);
				const range: ICellRange = [boundedCol, boundedRow];
				const newSelection = new CombinedSelection(
					SelectionRegionType.Cells,
					[range, range],
				);
				setSelection?.(newSelection);
				setActiveCell({ row: boundedRow, col: boundedCol });
				scrollToCell?.(boundedRow, boundedCol);
				return;
			}

			const [boundedCol, boundedRow] = getBoundedPosition(newRow, newCol);
			const newRange: ICellRange = [boundedCol, boundedRow];

			if (expandSelection && selection.isCellSelection) {
				// Expand selection (Shift+Arrow)
				const ranges = [selection.ranges[0], newRange];
				const newSelection = selection.setRanges(ranges);
				setSelection?.(newSelection);
			} else {
				// New single-cell selection
				const newSelection = selection.set(SelectionRegionType.Cells, [
					newRange,
					newRange,
				]);
				setSelection?.(newSelection);
			}

			setActiveCell({ row: boundedRow, col: boundedCol });
			scrollToCell?.(boundedRow, boundedCol);
		},
		[
			activeCell,
			selection,
			setActiveCell,
			scrollToCell,
			setSelection,
			getBoundedPosition,
		],
	);

	// Arrow keys navigation
	useHotkeys(
		[
			"up",
			"down",
			"left",
			"right",
			"shift+up",
			"shift+down",
			"shift+left",
			"shift+right",
		],
		(keyboardEvent, hotkeysEvent) => {
			if (!activeCell || editingCell) return;

			const { shift } = hotkeysEvent;
			let { row, col } = activeCell;

			// Determine which key was pressed
			const isUp = keyboardEvent.key === "ArrowUp";
			const isDown = keyboardEvent.key === "ArrowDown";
			const isLeft = keyboardEvent.key === "ArrowLeft";
			const isRight = keyboardEvent.key === "ArrowRight";

			if (isUp) {
				row = Math.max(0, row - 1);
			} else if (isDown) {
				row = Math.min(totalRows - 1, row + 1);
			} else if (isLeft) {
				col = Math.max(0, col - 1);
			} else if (isRight) {
				col = Math.min(totalColumns - 1, col + 1);
			}

			updateSelection(row, col, Boolean(shift));
		},
		{
			enabled: Boolean(activeCell && !editingCell),
			preventDefault: true,
			enableOnFormTags: ["input", "select", "textarea"],
		},
	);

	// Mod + Arrow navigation (jump to edges). Supports optional Shift to expand selection
	useHotkeys(
		[
			"mod+left",
			"mod+right",
			"mod+up",
			"mod+down",
			"mod+shift+left",
			"mod+shift+right",
			"mod+shift+up",
			"mod+shift+down",
		],
		(keyboardEvent, hotkeysEvent) => {
			if (!activeCell || editingCell) return;

			const { shift } = hotkeysEvent;
			let targetRow = activeCell.row;
			let targetCol = activeCell.col;

			const isUp = keyboardEvent.key === "ArrowUp";
			const isDown = keyboardEvent.key === "ArrowDown";
			const isLeft = keyboardEvent.key === "ArrowLeft";
			const isRight = keyboardEvent.key === "ArrowRight";

			if (isUp) {
				targetRow = findVisibleBoundary(-1, targetRow);
			} else if (isDown) {
				targetRow = findVisibleBoundary(1, targetRow);
			} else if (isLeft) {
				targetCol = 0;
			} else if (isRight) {
				targetCol = totalColumns - 1;
			}

			updateSelection(targetRow, targetCol, Boolean(shift));
		},
		{
			enabled: Boolean(activeCell && !editingCell),
			preventDefault: true,
			enableOnFormTags: ["input", "select", "textarea"],
		},
	);

	// Tab navigation (horizontal)
	useHotkeys(
		["tab", "shift+tab"],
		() => {
			if (!activeCell) return;

			let { row, col } = activeCell;

			// Check if shift is pressed
			if (isHotkeyPressed("shift") && isHotkeyPressed("tab")) {
				col = Math.max(0, col - 1);
			} else {
				col = Math.min(totalColumns - 1, col + 1);
			}

			// Save current editor if editing
			if (editingCell) {
				const record = records[editingCell.row];
				const column = columns[editingCell.col];
				const cell = record?.cells?.[column?.id];

				if (cell && onCellChange) {
					onCellChange(editingCell.row, editingCell.col, cell);
				}
				setEditingCell(null);
			}

			updateSelection(row, col, false);
		},
		{
			enabled: Boolean(activeCell),
			preventDefault: true,
			enableOnFormTags: ["input", "select", "textarea"],
		},
	);

	const getEditingRowIndex = useCallback(
		(realRowIndex: number) => {
			if (typeof real2RowIndex === "function") {
				const converted = real2RowIndex(realRowIndex);
				if (typeof converted === "number" && !Number.isNaN(converted)) {
					return converted;
				}
			}
			return realRowIndex;
		},
		[real2RowIndex],
	);

	const checkRowVisible = useCallback(
		(rowIndex: number) => {
			if (rowIndex < 0 || rowIndex >= totalRows) {
				return false;
			}
			if (typeof isRowVisible === "function") {
				return isRowVisible(rowIndex);
			}
			return true;
		},
		[isRowVisible, totalRows],
	);

	const findVisibleRow = useCallback(
		(startRow: number, direction: 1 | -1) => {
			if (getAdjacentVisibleRow) {
				return getAdjacentVisibleRow(startRow, direction);
			}
			let row = startRow + direction;
			while (row >= 0 && row < totalRows) {
				if (checkRowVisible(row)) {
					return row;
				}
				row += direction;
			}
			return startRow;
		},
		[getAdjacentVisibleRow, checkRowVisible, totalRows],
	);

	const findVisibleBoundary = useCallback(
		(direction: 1 | -1, fallbackRow: number) => {
			if (getVisibleBoundaryRow) {
				return getVisibleBoundaryRow(direction, fallbackRow);
			}
			if (direction > 0) {
				for (let row = totalRows - 1; row >= 0; row--) {
					if (checkRowVisible(row)) {
						return row;
					}
				}
			} else {
				for (let row = 0; row < totalRows; row++) {
					if (checkRowVisible(row)) {
						return row;
					}
				}
			}
			return fallbackRow;
		},
		[getVisibleBoundaryRow, checkRowVisible, totalRows],
	);

	// Enter key behavior (including shift+enter for upward navigation)
	useHotkeys(
		["enter", "shift+enter"],
		(keyboardEvent, hotkeysEvent) => {
			if (keyboardEvent.isComposing) return;
			if (!activeCell) return;

			const { shift } = hotkeysEvent;
			const isShiftPressed = Boolean(shift);
			const direction = isShiftPressed ? -1 : 1;

			if (editingCell) {
				// Already editing - close editor and navigate
				const nextRow =
					findVisibleRow(activeCell.row, direction) ?? activeCell.row;
				setEditingCell(null); // Close editor

				// Phase 2 Fix: Create new single-cell selection (like Teable)
				// This prevents the cell from being in "selected" state when moving
				const newRange: ICellRange = [activeCell.col, nextRow];
				const newSelection =
					selection?.set(
						SelectionRegionType.Cells,
						[newRange, newRange], // Single cell selection
					) ||
					new CombinedSelection(SelectionRegionType.Cells, [
						newRange,
						newRange,
					]);

				// Use setTimeout to ensure state update completes before navigation
				setTimeout(() => {
					setSelection?.(newSelection);
					setActiveCell({ row: nextRow, col: activeCell.col });
					scrollToCell?.(nextRow, activeCell.col);
				}, 0);
			} else {
				// Not editing - enter edit mode
				const editingRowIndex = getEditingRowIndex(activeCell.row);
				setEditingCell({ row: editingRowIndex, col: activeCell.col });
			}
		},
		{
			enabled: Boolean(activeCell),
			preventDefault: true,
			enableOnFormTags: ["input", "select", "textarea"],
		},
	);

	// Escape to cancel editing
	useHotkeys(
		"esc",
		() => {
			if (editingCell) {
				setEditingCell(null);
			}
		},
		{
			enabled: Boolean(activeCell),
			preventDefault: true,
			enableOnFormTags: ["input", "select", "textarea"],
		},
	);

	// F2 to edit
	useHotkeys(
		"f2",
		() => {
			if (!activeCell || editingCell || !canEditRecords) return;
			const editingRowIndex = getEditingRowIndex(activeCell.row);
			setEditingCell({ row: editingRowIndex, col: activeCell.col });
		},
		{
			enabled: Boolean(activeCell && !editingCell && canEditRecords),
			preventDefault: true,
		},
	);

	// Delete/Backspace to clear cell
	useHotkeys(
		["delete", "backspace"],
		() => {
			if (editingCell || !canEditRecords) return;
			if (!activeCell) return;

			const record = records[activeCell.row];
			const column = columns[activeCell.col];

			if (record && column && onCellChange) {
				// Create empty cell based on type
				const emptyCell: any = {
					type: column.type,
					data: null,
					displayData: "",
				};

				onCellChange(activeCell.row, activeCell.col, emptyCell);
			}
		},
		{
			enabled: Boolean(activeCell && !editingCell && canEditRecords),
			preventDefault: true,
		},
	);

	// Page Up/Down for scrolling (future enhancement)
	useHotkeys(
		["PageUp", "PageDown"],
		() => {
			// Scroll viewport up or down
			// This would require integration with virtual scrolling
		},
		{
			enabled: Boolean(activeCell && !editingCell),
			preventDefault: true,
		},
	);

	// Ctrl+A / Cmd+A for select all - Phase 2: Uses CombinedSelection
	useHotkeys(
		"mod+a",
		() => {
			if (!activeCell || !selection) return;

			const allRanges: ICellRange[] = [
				[0, 0],
				[totalColumns - 1, totalRows - 1],
			];
			const newSelection = selection.set(
				SelectionRegionType.Cells,
				allRanges,
			);
			setSelection?.(newSelection);
		},
		{
			enabled: Boolean(activeCell && !editingCell && selection),
			preventDefault: true,
		},
	);

	return {
		activeCell,
		editingCell,
		selection, // Phase 2: Return selection for reference
	};
};
