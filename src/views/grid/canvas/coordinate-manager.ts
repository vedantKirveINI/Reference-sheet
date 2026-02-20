import { IScrollState, IVisibleRange, IHitTestResult } from './types';
import { GRID_THEME } from './theme';

export class CoordinateManager {
  private columnWidths: number[];
  private columnOffsets: number[];
  private rowCount: number;
  private rowHeight: number;
  private frozenColumnCount: number = 0;

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

  setFrozenColumnCount(count: number): void {
    this.frozenColumnCount = Math.max(0, Math.min(count, this.columnWidths.length));
  }

  getFrozenColumnCount(): number {
    return this.frozenColumnCount;
  }

  getFrozenWidth(): number {
    if (this.frozenColumnCount <= 0) return 0;
    return this.columnOffsets[this.frozenColumnCount];
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

    const frozenWidth = this.getFrozenWidth();
    const scrollableAreaStart = frozenWidth;

    let colStart = this.frozenColumnCount;
    for (let i = this.frozenColumnCount; i < this.columnOffsets.length - 1; i++) {
      if (this.columnOffsets[i + 1] > scrollLeft + scrollableAreaStart) {
        colStart = i;
        break;
      }
    }
    colStart = Math.max(this.frozenColumnCount, colStart);

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
    const isFrozen = colIndex < this.frozenColumnCount;
    const x = isFrozen
      ? rowHeaderWidth + this.columnOffsets[colIndex]
      : rowHeaderWidth + this.columnOffsets[colIndex] - scroll.scrollLeft;
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
      const frozenWidth = this.getFrozenWidth();
      const localX = x - rowHeaderWidth;

      if (this.frozenColumnCount > 0 && localX < frozenWidth) {
        for (let i = 0; i < this.frozenColumnCount; i++) {
          const colRight = this.columnOffsets[i + 1];
          if (localX < colRight) {
            const isResize = localX >= colRight - resizeHandleWidth;
            return { region: 'columnHeader', rowIndex: -1, colIndex: i, isResizeHandle: isResize };
          }
        }
      }

      const scrolledX = localX + scroll.scrollLeft;
      for (let i = this.frozenColumnCount; i < this.columnWidths.length; i++) {
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
      const localX = x - rowHeaderWidth;
      const scrolledY = y - headerHeight + scroll.scrollTop;
      const rowIndex = Math.floor(scrolledY / this.rowHeight);

      if (rowIndex === this.rowCount) {
        return { region: 'appendRow', rowIndex: -1, colIndex: -1, isResizeHandle: false };
      }

      if (rowIndex >= 0 && rowIndex < this.rowCount) {
        const frozenWidth = this.getFrozenWidth();
        if (this.frozenColumnCount > 0 && localX < frozenWidth) {
          for (let i = 0; i < this.frozenColumnCount; i++) {
            if (localX < this.columnOffsets[i + 1]) {
              return { region: 'cell', rowIndex, colIndex: i, isResizeHandle: false };
            }
          }
        }

        const scrolledX = localX + scroll.scrollLeft;
        for (let i = this.frozenColumnCount; i < this.columnWidths.length; i++) {
          if (scrolledX < this.columnOffsets[i + 1]) {
            return { region: 'cell', rowIndex, colIndex: i, isResizeHandle: false };
          }
        }
      }
    }

    return { region: 'none', rowIndex: -1, colIndex: -1, isResizeHandle: false };
  }

  getColumnX(colIndex: number, scrollLeft: number): number {
    const isFrozen = colIndex < this.frozenColumnCount;
    if (isFrozen) {
      return GRID_THEME.rowHeaderWidth + this.columnOffsets[colIndex];
    }
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
