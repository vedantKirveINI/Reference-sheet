import { CellType, ICell } from "./cell";

export enum RowHeightLevel {
  Short = "Short",
  Medium = "Medium",
  Tall = "Tall",
  ExtraTall = "ExtraTall",
}

export enum TextWrapMode {
  Clip = "Clip",
  Wrap = "Wrap",
  Overflow = "Overflow",
}

export const ROW_HEIGHT_DEFINITIONS: Record<RowHeightLevel, number> = {
  [RowHeightLevel.Short]: 32,
  [RowHeightLevel.Medium]: 56,
  [RowHeightLevel.Tall]: 84,
  [RowHeightLevel.ExtraTall]: 108,
};

export interface IColumn {
  id: string;
  name: string;
  type: CellType;
  width: number;
  isFrozen?: boolean;
  options?: Record<string, unknown>;
  order?: number;
  minWidth?: number;
  resizable?: boolean;
  isHidden?: boolean;
  textWrapMode?: TextWrapMode;
}

export interface IRecord {
  id: string;
  cells: Record<string, ICell>;
  _raw?: {
    __created_time: string;
  };
}

export interface IRowHeader {
  id: string;
  rowIndex: number;
  heightLevel: RowHeightLevel;
  displayIndex?: number;
  orderValue?: number;
}

export interface ITableData {
  columns: IColumn[];
  records: IRecord[];
  rowHeaders: IRowHeader[];
}

export interface IGridTheme {
  cellBg: string;
  cellBgHover: string;
  cellBgSelected: string;
  cellTextColor: string;
  cellBorderColor: string;
  headerBg: string;
  headerTextColor: string;
  headerBorderColor: string;
  headerIconColor: string;
  rowHeaderBg: string;
  rowHeaderTextColor: string;
  rowHeaderBorderColor: string;
  activeCellBorderColor: string;
  selectionBg: string;
  selectionBorderColor: string;
  fontFamily: string;
  fontSize: number;
  headerFontSize: number;
  cellPaddingX: number;
  cellPaddingY: number;
  iconSize: number;
  frozenColumnBorderColor: string;
  appendRowBg: string;
  appendRowTextColor: string;
  groupHeaderBg: string;
  groupHeaderTextColor: string;
  scrollbarThumbColor: string;
  scrollbarTrackColor: string;
}

export interface IGridConfig {
  rowHeight: number;
  columnWidth: number;
  headerHeight: number;
  freezeColumns: number;
  virtualScrolling: boolean;
  theme: IGridTheme;
  rowHeaderWidth: number;
  showRowNumbers: boolean;
}

export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IPosition {
  x: number;
  y: number;
}

export interface IScrollState {
  scrollTop: number;
  scrollLeft: number;
  isScrolling: boolean;
}

export enum LinearRowType {
  Row = "Row",
  Group = "Group",
  Append = "Append",
}

export interface ILinearRow {
  type: LinearRowType;
  displayIndex?: number;
  realIndex?: number;
  id?: string;
  depth?: number;
  value?: string;
  isCollapsed?: boolean;
}

export enum RegionType {
  Cell = "Cell",
  ActiveCell = "ActiveCell",
  ColumnHeader = "ColumnHeader",
  ColumnHeaderDropdown = "ColumnHeaderDropdown",
  ColumnResizeHandler = "ColumnResizeHandler",
  ColumnFreezeHandler = "ColumnFreezeHandler",
  RowHeader = "RowHeader",
  RowHeaderCheckbox = "RowHeaderCheckbox",
  RowHeaderDragHandler = "RowHeaderDragHandler",
  AllCheckbox = "AllCheckbox",
  AppendRow = "AppendRow",
  AppendColumn = "AppendColumn",
  Blank = "Blank",
  ColumnStatistic = "ColumnStatistic",
  GroupStatistic = "GroupStatistic",
  RowGroupControl = "RowGroupControl",
  RowGroupHeader = "RowGroupHeader",
  None = "None",
}

export enum SelectableType {
  All = "All",
  None = "None",
  Column = "Column",
  Row = "Row",
  Cell = "Cell",
}

export type ICellItem = [colIndex: number, rowIndex: number];

export interface IMouseState extends IPosition {
  rowIndex: number;
  columnIndex: number;
  type: RegionType;
  isOutOfBounds: boolean;
}

export interface IColumnResizeState {
  columnIndex: number;
  startX: number;
  currentX: number;
  width: number;
}

export interface IColumnFreezeState {
  columnIndex: number;
  isFreezing: boolean;
}

export interface IColumnDragState {
  sourceColumnIndex: number;
  targetColumnIndex: number;
  isDragging: boolean;
  startX: number;
  currentX: number;
}

export enum DragRegionType {
  None = "None",
  Columns = "Columns",
}
