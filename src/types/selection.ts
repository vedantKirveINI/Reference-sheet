export enum SelectionRegionType {
  Rows = "Rows",
  Columns = "Columns",
  Cells = "Cells",
  None = "None",
}

export interface ICellRange {
  start: { columnIndex: number; rowIndex: number };
  end: { columnIndex: number; rowIndex: number };
}

export interface IColumnRange {
  start: number;
  end: number;
}

export interface IRowRange {
  start: number;
  end: number;
}

export type IRange =
  | { type: SelectionRegionType.Cells; range: ICellRange }
  | { type: SelectionRegionType.Columns; range: IColumnRange }
  | { type: SelectionRegionType.Rows; range: IRowRange }
  | { type: SelectionRegionType.None };
