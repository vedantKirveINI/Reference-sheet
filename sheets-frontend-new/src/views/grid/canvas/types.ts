export interface IRenderRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IVisibleRange {
  rowStart: number;
  rowEnd: number;
  colStart: number;
  colEnd: number;
}

export interface IScrollState {
  scrollTop: number;
  scrollLeft: number;
}

export interface ICellPosition {
  rowIndex: number;
  colIndex: number;
}

export interface IGridDimensions {
  containerWidth: number;
  containerHeight: number;
  totalWidth: number;
  totalHeight: number;
  headerHeight: number;
  rowHeaderWidth: number;
}

export type RegionType = 'cell' | 'columnHeader' | 'rowHeader' | 'cornerHeader' | 'appendRow' | 'appendColumn' | 'none';

export interface IHitTestResult {
  region: RegionType;
  rowIndex: number;
  colIndex: number;
  isResizeHandle: boolean;
}
