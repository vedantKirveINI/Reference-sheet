// Selection type definitions - Inspired by Teable
// Phase 1: Foundation

export enum SelectionRegionType {
	Rows = "Rows",
	Columns = "Columns",
	Cells = "Cells",
	None = "None",
}

// Range types (must match Teable exactly)
export type ICellRange = [colIndex: number, rowIndex: number]; // The beginning and the end come in pairs
export type IColumnRange = [colStartIndex: number, colEndIndex: number];
export type IRowRange = [rowStartIndex: number, rowEndIndex: number];
export type IRange = ICellRange | IColumnRange | IRowRange;
