import { IScrollState, IVisibleRange, IHitTestResult } from './types';
import { GRID_THEME } from './theme';

export class CoordinateManager {
  private columnWidths: number[];
  private columnOffsets: number[];
  private rowCount: number;
  private rowHeight: number;

  constructor(columnWidths: number[], rowCount: number, rowHeight?: number) {
    this.columnWidths = [...columnWidths];
    this.rowCount = rowCount;
    this.rowHeight = rowHeight ?? GRID_THEME.defaultRowHeight;
    this.columnOffsets = this.computeOffsets();
  }

  private computeOffsets(): number[] {
    const offsets: number[] = [0];
    for (let i = 0; i < this.columnWidths.length; i++) {
      offsets.push(offsets[i] + this.columnWidths[i]);
    }
    return offsets;
  }

  getVisibleRange(scroll: IScrollState, containerWidth: number, containerHeight: number): IVisibleRange {
    const { scrollTop, scrollLeft } = scroll;
    const { headerHeight, rowHeaderWidth } = GRID_THEME;

    const dataAreaWidth = containerWidth - rowHeaderWidth;
    const dataAreaHeight = containerHeight - headerHeight;

    let rowStart = Math.floor(scrollTop / this.rowHeight);
    rowStart = Math.max(0, rowStart - 1);
    let rowEnd = Math.ceil((scrollTop + dataAreaHeight) / this.rowHeight);
    rowEnd = Math.min(this.rowCount, rowEnd + 1);

    let colStart = 0;
    for (let i = 0; i < this.columnOffsets.length - 1; i++) {
      if (this.columnOffsets[i + 1] > scrollLeft) {
        colStart = i;
        break;
      }
    }
    colStart = Math.max(0, colStart);

    let colEnd = this.columnWidths.length;
    for (let i = colStart; i < this.columnWidths.length; i++) {
      if (this.columnOffsets[i] - scrollLeft > dataAreaWidth) {
        colEnd = i;
        break;
      }
    }
    colEnd = Math.min(this.columnWidths.length, colEnd);

    return { rowStart, rowEnd, colStart, colEnd };
  }

  getCellRect(rowIndex: number, colIndex: number, scroll: IScrollState): { x: number; y: number; width: number; height: number } {
    const { headerHeight, rowHeaderWidth } = GRID_THEME;
    const x = rowHeaderWidth + this.columnOffsets[colIndex] - scroll.scrollLeft;
    const y = headerHeight + rowIndex * this.rowHeight - scroll.scrollTop;
    const width = this.columnWidths[colIndex];
    const height = this.rowHeight;
    return { x, y, width, height };
  }

  hitTest(x: number, y: number, scroll: IScrollState, _containerWidth: number, _containerHeight: number): IHitTestResult {
    const { headerHeight, rowHeaderWidth, resizeHandleWidth, appendColumnWidth } = GRID_THEME;

    if (x < rowHeaderWidth && y < headerHeight) {
      return { region: 'cornerHeader', rowIndex: -1, colIndex: -1, isResizeHandle: false };
    }

    if (y < headerHeight && x >= rowHeaderWidth) {
      const scrolledX = x - rowHeaderWidth + scroll.scrollLeft;
      for (let i = 0; i < this.columnWidths.length; i++) {
        const colRight = this.columnOffsets[i + 1];
        if (scrolledX < colRight) {
          const isResize = scrolledX >= colRight - resizeHandleWidth;
          return { region: 'columnHeader', rowIndex: -1, colIndex: i, isResizeHandle: isResize };
        }
      }
      const totalW = this.getTotalWidth();
      if (scrolledX >= totalW && scrolledX < totalW + appendColumnWidth) {
        return { region: 'appendColumn', rowIndex: -1, colIndex: -1, isResizeHandle: false };
      }
      return { region: 'none', rowIndex: -1, colIndex: -1, isResizeHandle: false };
    }

    if (x < rowHeaderWidth && y >= headerHeight) {
      const scrolledY = y - headerHeight + scroll.scrollTop;
      const rowIndex = Math.floor(scrolledY / this.rowHeight);
      if (rowIndex >= 0 && rowIndex < this.rowCount) {
        return { region: 'rowHeader', rowIndex, colIndex: -1, isResizeHandle: false };
      }
      if (rowIndex === this.rowCount) {
        return { region: 'appendRow', rowIndex: -1, colIndex: -1, isResizeHandle: false };
      }
      return { region: 'none', rowIndex: -1, colIndex: -1, isResizeHandle: false };
    }

    if (x >= rowHeaderWidth && y >= headerHeight) {
      const scrolledX = x - rowHeaderWidth + scroll.scrollLeft;
      const scrolledY = y - headerHeight + scroll.scrollTop;
      const rowIndex = Math.floor(scrolledY / this.rowHeight);

      if (rowIndex === this.rowCount) {
        return { region: 'appendRow', rowIndex: -1, colIndex: -1, isResizeHandle: false };
      }

      if (rowIndex >= 0 && rowIndex < this.rowCount) {
        for (let i = 0; i < this.columnWidths.length; i++) {
          if (scrolledX < this.columnOffsets[i + 1]) {
            return { region: 'cell', rowIndex, colIndex: i, isResizeHandle: false };
          }
        }
      }
    }

    return { region: 'none', rowIndex: -1, colIndex: -1, isResizeHandle: false };
  }

  getColumnX(colIndex: number, scrollLeft: number): number {
    return GRID_THEME.rowHeaderWidth + this.columnOffsets[colIndex] - scrollLeft;
  }

  getRowY(rowIndex: number, scrollTop: number): number {
    return GRID_THEME.headerHeight + rowIndex * this.rowHeight - scrollTop;
  }

  getTotalWidth(): number {
    return this.columnOffsets[this.columnOffsets.length - 1];
  }

  getTotalHeight(): number {
    return this.rowCount * this.rowHeight;
  }

  updateColumnWidth(colIndex: number, width: number): void {
    this.columnWidths[colIndex] = Math.max(GRID_THEME.minColumnWidth, width);
    this.columnOffsets = this.computeOffsets();
  }

  getColumnWidths(): number[] {
    return [...this.columnWidths];
  }
}
