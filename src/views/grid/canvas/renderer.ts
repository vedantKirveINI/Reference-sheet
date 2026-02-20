import { CoordinateManager } from './coordinate-manager';
import { GRID_THEME, GridTheme } from './theme';
import { paintCell } from './cell-painters';
import { IScrollState, IVisibleRange } from './types';
import { ITableData, CellType } from '@/types';

const TYPE_ICONS: Record<string, string> = {
  [CellType.String]: 'T',
  [CellType.Number]: '#',
  [CellType.SCQ]: '◉',
  [CellType.MCQ]: '☑',
  [CellType.DropDown]: '▾',
  [CellType.YesNo]: '☐',
  [CellType.DateTime]: '📅',
  [CellType.CreatedTime]: '🔒',
  [CellType.Currency]: '$',
  [CellType.PhoneNumber]: '☎',
  [CellType.Address]: '📍',
  [CellType.Signature]: '✍',
  [CellType.Slider]: '◐',
  [CellType.FileUpload]: '📎',
  [CellType.Time]: '⏰',
  [CellType.Ranking]: '⇅',
  [CellType.Rating]: '★',
  [CellType.OpinionScale]: '⊝',
  [CellType.Formula]: 'ƒ',
  [CellType.List]: '≡',
  [CellType.Enrichment]: '✨',
};

export class GridRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private coordinateManager: CoordinateManager;
  private theme: GridTheme;
  private dpr: number;
  private data: ITableData;
  private scrollState: IScrollState;
  private activeCell: { row: number; col: number } | null;
  private selectedRows: Set<number>;
  private hoveredRow: number;
  private columnWidths: number[];
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement, data: ITableData) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.theme = GRID_THEME;
    this.data = data;
    this.columnWidths = data.columns.map(c => c.width);
    this.coordinateManager = new CoordinateManager(this.columnWidths, data.records.length);
    this.scrollState = { scrollTop: 0, scrollLeft: 0 };
    this.activeCell = null;
    this.selectedRows = new Set();
    this.hoveredRow = -1;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.scheduleRender();
  }

  private scheduleRender(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.render();
    });
  }

  render(): void {
    const ctx = this.ctx;
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    ctx.fillStyle = this.theme.bgColor;
    ctx.fillRect(0, 0, width, height);

    const visibleRange = this.coordinateManager.getVisibleRange(this.scrollState, width, height);

    this.drawCells(ctx, visibleRange, width, height);
    this.drawRowHeaders(ctx, visibleRange, height);
    this.drawColumnHeaders(ctx, visibleRange, width);
    this.drawCornerHeader(ctx);
    this.drawAppendRow(ctx, visibleRange, width);
    this.drawAppendColumn(ctx, visibleRange, height);
    this.drawActiveCell(ctx);

    ctx.restore();
  }

  private drawCells(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange, _cw: number, _ch: number): void {
    const { theme, scrollState, data } = this;

    for (let r = visibleRange.rowStart; r < visibleRange.rowEnd; r++) {
      const record = data.records[r];
      if (!record) continue;
      const isSelected = this.selectedRows.has(r);
      const isHovered = this.hoveredRow === r;

      for (let c = visibleRange.colStart; c < visibleRange.colEnd; c++) {
        const col = data.columns[c];
        if (!col) continue;
        const cellRect = this.coordinateManager.getCellRect(r, c, scrollState);

        if (isSelected) {
          ctx.fillStyle = theme.selectedRowBg;
        } else if (isHovered) {
          ctx.fillStyle = theme.hoverRowBg;
        } else {
          ctx.fillStyle = theme.bgColor;
        }
        ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);

        ctx.strokeStyle = theme.cellBorderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cellRect.x + cellRect.width, cellRect.y);
        ctx.lineTo(cellRect.x + cellRect.width, cellRect.y + cellRect.height);
        ctx.lineTo(cellRect.x, cellRect.y + cellRect.height);
        ctx.stroke();

        const cell = record.cells[col.id];
        if (cell) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          ctx.clip();
          paintCell(ctx, cell, cellRect, theme);
          ctx.restore();
        }
      }
    }
  }

  private drawRowHeaders(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange, containerHeight: number): void {
    const { theme, scrollState } = this;
    const { rowHeaderWidth, headerHeight } = theme;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, headerHeight, rowHeaderWidth, containerHeight - headerHeight);
    ctx.clip();

    for (let r = visibleRange.rowStart; r < visibleRange.rowEnd; r++) {
      const y = this.coordinateManager.getRowY(r, scrollState.scrollTop);
      const isSelected = this.selectedRows.has(r);

      ctx.fillStyle = isSelected ? theme.selectedRowBg : theme.headerBgColor;
      ctx.fillRect(0, y, rowHeaderWidth, theme.defaultRowHeight);

      ctx.strokeStyle = theme.headerBorderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rowHeaderWidth, y);
      ctx.lineTo(rowHeaderWidth, y + theme.defaultRowHeight);
      ctx.lineTo(0, y + theme.defaultRowHeight);
      ctx.stroke();

      ctx.font = `${theme.fontSize - 1}px ${theme.fontFamily}`;
      ctx.fillStyle = theme.rowNumberColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(r + 1), rowHeaderWidth / 2, y + theme.defaultRowHeight / 2);
    }

    ctx.restore();
    ctx.textAlign = 'left';
  }

  private drawColumnHeaders(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange, containerWidth: number): void {
    const { theme, scrollState, data } = this;
    const { headerHeight, rowHeaderWidth } = theme;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rowHeaderWidth, 0, containerWidth - rowHeaderWidth, headerHeight);
    ctx.clip();

    for (let c = visibleRange.colStart; c < visibleRange.colEnd; c++) {
      const col = data.columns[c];
      if (!col) continue;
      const x = this.coordinateManager.getColumnX(c, scrollState.scrollLeft);
      const w = this.columnWidths[c];

      ctx.fillStyle = theme.headerBgColor;
      ctx.fillRect(x, 0, w, headerHeight);

      ctx.strokeStyle = theme.headerBorderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + w, 0);
      ctx.lineTo(x + w, headerHeight);
      ctx.moveTo(x, headerHeight);
      ctx.lineTo(x + w, headerHeight);
      ctx.stroke();

      const icon = TYPE_ICONS[col.type] || 'T';
      ctx.font = `${theme.headerFontSize - 1}px ${theme.fontFamily}`;
      ctx.fillStyle = theme.rowNumberColor;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const iconW = ctx.measureText(icon).width;
      ctx.fillText(icon, x + theme.cellPaddingX, headerHeight / 2);

      ctx.font = `${theme.headerFontWeight} ${theme.headerFontSize}px ${theme.fontFamily}`;
      ctx.fillStyle = theme.headerTextColor;
      const nameX = x + theme.cellPaddingX + iconW + 6;
      const maxNameW = w - theme.cellPaddingX * 2 - iconW - 6;
      if (maxNameW > 0) {
        const name = col.name;
        let displayName = name;
        if (ctx.measureText(displayName).width > maxNameW) {
          while (displayName.length > 0 && ctx.measureText(displayName + '…').width > maxNameW) {
            displayName = displayName.slice(0, -1);
          }
          displayName += '…';
        }
        ctx.fillText(displayName, nameX, headerHeight / 2);
      }
    }

    ctx.restore();
    ctx.textAlign = 'left';
  }

  private drawCornerHeader(ctx: CanvasRenderingContext2D): void {
    const { theme } = this;
    const { headerHeight, rowHeaderWidth } = theme;

    ctx.fillStyle = theme.headerBgColor;
    ctx.fillRect(0, 0, rowHeaderWidth, headerHeight);

    ctx.strokeStyle = theme.headerBorderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rowHeaderWidth, 0);
    ctx.lineTo(rowHeaderWidth, headerHeight);
    ctx.moveTo(0, headerHeight);
    ctx.lineTo(rowHeaderWidth, headerHeight);
    ctx.stroke();

    const checkSize = 12;
    const cx = (rowHeaderWidth - checkSize) / 2;
    const cy = (headerHeight - checkSize) / 2;
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx, cy, checkSize, checkSize);
  }

  private drawActiveCell(ctx: CanvasRenderingContext2D): void {
    if (!this.activeCell) return;
    const { row, col } = this.activeCell;
    if (row < 0 || row >= this.data.records.length) return;
    if (col < 0 || col >= this.data.columns.length) return;

    const cellRect = this.coordinateManager.getCellRect(row, col, this.scrollState);
    const bw = this.theme.activeCellBorderWidth;

    ctx.strokeStyle = this.theme.activeCellBorderColor;
    ctx.lineWidth = bw;
    ctx.strokeRect(
      cellRect.x + bw / 2,
      cellRect.y + bw / 2,
      cellRect.width - bw,
      cellRect.height - bw
    );
  }

  private drawAppendRow(ctx: CanvasRenderingContext2D, _visibleRange: IVisibleRange, containerWidth: number): void {
    const { theme, scrollState } = this;
    const rowCount = this.data.records.length;
    const y = this.coordinateManager.getRowY(rowCount, scrollState.scrollTop);

    if (y > this.canvas.height / this.dpr) return;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(containerWidth, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.font = `${theme.fontSize}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.rowNumberColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText('+', theme.rowHeaderWidth / 2, y + theme.appendRowHeight / 2);

    ctx.textAlign = 'left';
    ctx.fillText('New record', theme.rowHeaderWidth + theme.cellPaddingX, y + theme.appendRowHeight / 2);
  }

  private drawAppendColumn(ctx: CanvasRenderingContext2D, _visibleRange: IVisibleRange, _containerHeight: number): void {
    const { theme, scrollState } = this;
    const totalW = this.coordinateManager.getTotalWidth();
    const x = theme.rowHeaderWidth + totalW - scrollState.scrollLeft;
    const { headerHeight, appendColumnWidth } = theme;

    ctx.fillStyle = theme.headerBgColor;
    ctx.fillRect(x, 0, appendColumnWidth, headerHeight);

    ctx.strokeStyle = theme.headerBorderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, headerHeight);
    ctx.lineTo(x + appendColumnWidth, headerHeight);
    ctx.stroke();

    ctx.font = `${theme.headerFontSize}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.rowNumberColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', x + appendColumnWidth / 2, headerHeight / 2);
    ctx.textAlign = 'left';
  }

  setScrollState(scroll: IScrollState): void {
    this.scrollState = scroll;
    this.scheduleRender();
  }

  setActiveCell(cell: { row: number; col: number } | null): void {
    this.activeCell = cell;
    this.scheduleRender();
  }

  setSelectedRows(rows: Set<number>): void {
    this.selectedRows = rows;
    this.scheduleRender();
  }

  setHoveredRow(row: number): void {
    if (this.hoveredRow === row) return;
    this.hoveredRow = row;
    this.scheduleRender();
  }

  setColumnWidth(colIndex: number, width: number): void {
    this.columnWidths[colIndex] = Math.max(this.theme.minColumnWidth, width);
    this.coordinateManager.updateColumnWidth(colIndex, this.columnWidths[colIndex]);
    this.scheduleRender();
  }

  setData(data: ITableData): void {
    this.data = data;
    this.columnWidths = data.columns.map(c => c.width);
    this.coordinateManager = new CoordinateManager(this.columnWidths, data.records.length);
    this.scheduleRender();
  }

  getColumnWidths(): number[] {
    return [...this.columnWidths];
  }

  getCoordinateManager(): CoordinateManager {
    return this.coordinateManager;
  }

  getScrollState(): IScrollState {
    return { ...this.scrollState };
  }

  getData(): ITableData {
    return this.data;
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
