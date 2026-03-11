// Keyboard navigation types - Inspired by Teable's selection system
// Phase 2: Updated to use CombinedSelection
export interface IRange {
	start: [number, number]; // [column, row]
	end: [number, number]; // [column, row]
}

export interface IKeyboardNavigationProps {
	// Grid data
	columns: any[];
	records: any[];
	activeCell: { row: number; col: number } | null;
	editingCell: { row: number; col: number } | null;

	// State setters
	setActiveCell: (cell: { row: number; col: number } | null) => void;
	setEditingCell: (cell: { row: number; col: number } | null) => void;

	// Callbacks
	onCellChange?: (rowIndex: number, columnIndex: number, value: any) => void;
	scrollToCell?: (row: number, col: number) => void;
	real2RowIndex?: (rowIndex: number) => number | null | undefined;
	isRowVisible?: (rowIndex: number) => boolean;
	getAdjacentVisibleRow?: (rowIndex: number, direction: 1 | -1) => number;
	getVisibleBoundaryRow?: (
		direction: 1 | -1,
		fallbackRow: number,
	) => number;

	// Selection state - Phase 2: Updated to use CombinedSelection
	selection?: any; // CombinedSelection instance (avoid circular import)
	setSelection?: (selection: any) => void; // CombinedSelection instance setter

	// Additional props
	rowHeaders?: any[];
	getRowHeight?: (rowIndex: number) => number;
	getColumnWidth?: (columnIndex: number) => number;
	canEditRecords?: boolean; // Whether records can be edited (for disabling shortcuts in non-default views)
}

export type NavigationKey =
	| "ArrowUp"
	| "ArrowDown"
	| "ArrowLeft"
	| "ArrowRight"
	| "Tab"
	| "Enter"
	| "Escape"
	| "F2"
	| "Delete"
	| "Backspace";
