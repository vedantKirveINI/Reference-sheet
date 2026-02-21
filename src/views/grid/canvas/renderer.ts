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
  private frozenColumnCount: number = 0;
  private columnOrder: number[];
  private hiddenColumnIds: Set<string> = new Set();
  private visibleColumnIndices: number[] = [];
  private currentRowHeight: number;
  private zoomScale: number = 1.0;
  private selectionRange: { startRow: number; startCol: number; endRow: number; endCol: number } | null = null;
  private sortedColumnIds: Set<string> = new Set();
  private filteredColumnIds: Set<string> = new Set();
  private groupedColumnIds: Set<string> = new Set();
  private searchQuery: string = '';
  private currentSearchMatchCell: { row: number; col: number } | null = null;
  private dprMediaQuery: MediaQueryList | null = null;
  private dprChangeHandler: (() => void) | null = null;
  private lastLayoutWidth: number = 300;
  private lastLayoutHeight: number = 150;

  constructor(canvas: HTMLCanvasElement, data: ITableData) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.dpr = window.devicePixelRatio || 1;
    this.setupDprListener();
    this.theme = GRID_THEME;
    this.data = data;
    this.columnWidths = data.columns.map(c => c.width);
    this.columnOrder = data.columns.map((_, i) => i);
    this.rebuildVisibleColumns();
    this.coordinateManager = new CoordinateManager(
      this.visibleColumnIndices.map(i => this.columnWidths[i]),
      data.records.length
    );
    this.currentRowHeight = GRID_THEME.defaultRowHeight;
    this.scrollState = { scrollTop: 0, scrollLeft: 0 };
    this.activeCell = null;
    this.selectedRows = new Set();
    this.hoveredRow = -1;
  }

  private rebuildVisibleColumns(): void {
    this.visibleColumnIndices = this.columnOrder.filter(i => {
      const col = this.data.columns[i];
      return col && !this.hiddenColumnIds.has(col.id);
    });
  }

  private rebuildCoordinateManager(): void {
    this.rebuildVisibleColumns();
    this.coordinateManager = new CoordinateManager(
      this.visibleColumnIndices.map(i => this.columnWidths[i]),
      this.data.records.length,
      this.currentRowHeight
    );
    this.coordinateManager.setFrozenColumnCount(this.frozenColumnCount);
  }

  private getVisibleColumn(visibleIndex: number) {
    const originalIndex = this.visibleColumnIndices[visibleIndex];
    if (originalIndex === undefined) return null;
    return this.data.columns[originalIndex];
  }

  private getOriginalIndex(visibleIndex: number): number {
    return this.visibleColumnIndices[visibleIndex] ?? -1;
  }

  private setupDprListener(): void {
    this.teardownDprListener();
    const mqString = `(resolution: ${this.dpr}dppx)`;
    this.dprMediaQuery = window.matchMedia(mqString);
    this.dprChangeHandler = () => {
      const newDpr = window.devicePixelRatio || 1;
      if (newDpr !== this.dpr) {
        this.dpr = newDpr;
        const w = this.lastLayoutWidth;
        const h = this.lastLayoutHeight;
        this.canvas.width = w * this.dpr;
        this.canvas.height = h * this.dpr;
        this.setupDprListener();
        this.scheduleRender();
      }
    };
    this.dprMediaQuery.addEventListener('change', this.dprChangeHandler);
  }

  private teardownDprListener(): void {
    if (this.dprMediaQuery && this.dprChangeHandler) {
      this.dprMediaQuery.removeEventListener('change', this.dprChangeHandler);
      this.dprMediaQuery = null;
      this.dprChangeHandler = null;
    }
  }

  resize(width: number, height: number): void {
    width = Math.round(width);
    height = Math.round(height);
    this.lastLayoutWidth = width;
    this.lastLayoutHeight = height;
    const newDpr = window.devicePixelRatio || 1;
    if (newDpr !== this.dpr) {
      this.dpr = newDpr;
      this.setupDprListener();
    }
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

  setZoomScale(scale: number): void {
    this.zoomScale = Math.max(0.25, Math.min(3, scale));
    this.scheduleRender();
  }

  getZoomScale(): number {
    return this.zoomScale;
  }

  render(): void {
    const ctx = this.ctx;
    const width = this.canvas.width / this.dpr / this.zoomScale;
    const height = this.canvas.height / this.dpr / this.zoomScale;

    ctx.save();
    ctx.scale(this.dpr * this.zoomScale, this.dpr * this.zoomScale);

    ctx.fillStyle = this.theme.bgColor;
    ctx.fillRect(0, 0, width, height);

    const visibleRange = this.coordinateManager.getVisibleRange(this.scrollState, width, height);

    this.drawCells(ctx, visibleRange, width, height);
    this.drawRowHeaders(ctx, visibleRange, height);
    this.drawColumnHeaders(ctx, visibleRange, width);

    if (this.frozenColumnCount > 0) {
      this.drawFrozenCells(ctx, visibleRange, height);
      this.drawFrozenColumnHeaders(ctx, width);
      this.drawFrozenBorder(ctx, height);
    }

    this.drawSelectionRange(ctx, visibleRange);
    this.drawCornerHeader(ctx);
    this.drawAppendRow(ctx, visibleRange, width);
    this.drawActiveCell(ctx);

    ctx.restore();
  }

  private isGroupHeaderRow(rowIndex: number): boolean {
    const record = this.data.records[rowIndex];
    return record?.id?.startsWith('__group__') ?? false;
  }

  private getGroupHeaderInfo(rowIndex: number): { fieldName: string; value: string; count: number; isCollapsed: boolean; key: string } | null {
    const record = this.data.records[rowIndex];
    if (!record?.id?.startsWith('__group__')) return null;
    const meta = record.cells['__group_meta__'];
    if (!meta) return null;
    const d = meta.data as any;
    return { fieldName: d.fieldName, value: d.value, count: d.count, isCollapsed: d.isCollapsed, key: d.key };
  }

  private groupColorIndex(rowIndex: number): number {
    let idx = 0;
    for (let r = 0; r <= rowIndex; r++) {
      if (this.isGroupHeaderRow(r)) idx++;
    }
    return (idx - 1);
  }

  private drawGroupHeaderRow(ctx: CanvasRenderingContext2D, rowIndex: number, containerWidth: number): void {
    const info = this.getGroupHeaderInfo(rowIndex);
    if (!info) return;

    const y = this.coordinateManager.getRowY(rowIndex, this.scrollState.scrollTop);
    const h = this.currentRowHeight;

    const GROUP_COLORS = [
      { bg: '#ecfdf5', border: '#39A380', text: '#065f46', badge: '#d1fae5' },
      { bg: '#f0fdf4', border: '#22c55e', text: '#166534', badge: '#dcfce7' },
      { bg: '#fefce8', border: '#eab308', text: '#854d0e', badge: '#fef3c7' },
      { bg: '#fdf2f8', border: '#ec4899', text: '#9d174d', badge: '#fce7f3' },
      { bg: '#f0f9ff', border: '#06b6d4', text: '#155e75', badge: '#cffafe' },
    ];

    const colorIndex = this.groupColorIndex(rowIndex) % GROUP_COLORS.length;
    const colors = GROUP_COLORS[Math.abs(colorIndex)];

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, y, containerWidth, h);

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + h);
    ctx.lineTo(containerWidth, y + h);
    ctx.stroke();

    ctx.fillStyle = colors.border;
    ctx.fillRect(0, y, 3, h);

    const { rowHeaderWidth } = this.theme;
    const centerY = y + h / 2;
    ctx.fillStyle = colors.text;
    ctx.font = `11px ${this.theme.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.isCollapsed ? '▶' : '▼', rowHeaderWidth / 2, centerY);

    ctx.font = `600 12px ${this.theme.fontFamily}`;
    ctx.textAlign = 'left';
    const fieldLabel = `${info.fieldName}: `;
    ctx.fillText(fieldLabel, rowHeaderWidth + 12, centerY);

    const fieldLabelWidth = ctx.measureText(fieldLabel).width;
    ctx.font = `500 12px ${this.theme.fontFamily}`;
    const valueLabel = info.value || '(empty)';
    ctx.fillText(valueLabel, rowHeaderWidth + 12 + fieldLabelWidth, centerY);

    const fullLabelWidth = fieldLabelWidth + ctx.measureText(valueLabel).width;
    const countText = `${info.count}`;
    ctx.font = `500 10px ${this.theme.fontFamily}`;
    const countW = ctx.measureText(countText).width + 12;
    const badgeX = rowHeaderWidth + 12 + fullLabelWidth + 10;
    const badgeY = centerY - 8;

    ctx.fillStyle = colors.badge;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, countW, 16, 8);
    ctx.fill();

    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countText, badgeX + countW / 2, centerY);

    ctx.textAlign = 'left';
  }

  private drawCells(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange, cw: number, _ch: number): void {
    const { theme, scrollState, data } = this;

    for (let r = visibleRange.rowStart; r < visibleRange.rowEnd; r++) {
      const record = data.records[r];
      if (!record) continue;

      if (this.isGroupHeaderRow(r)) {
        this.drawGroupHeaderRow(ctx, r, cw);
        continue;
      }

      const isSelected = this.selectedRows.has(r);
      const isHovered = this.hoveredRow === r;

      for (let c = visibleRange.colStart; c < visibleRange.colEnd; c++) {
        const col = this.getVisibleColumn(c);
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

        if (col.id && !isSelected && !isHovered) {
          if (this.groupedColumnIds.has(col.id)) {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          } else if (this.filteredColumnIds.has(col.id)) {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.05)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          } else if (this.sortedColumnIds.has(col.id)) {
            ctx.fillStyle = 'rgba(57, 163, 128, 0.05)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          }
        }

        ctx.strokeStyle = theme.cellBorderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cellRect.x + cellRect.width, cellRect.y);
        ctx.lineTo(cellRect.x + cellRect.width, cellRect.y + cellRect.height);
        ctx.lineTo(cellRect.x, cellRect.y + cellRect.height);
        ctx.stroke();

        const cell = record.cells[col.id];
        if (cell && this.searchQuery) {
          const displayText = String(cell.displayData ?? '');
          if (displayText && displayText.toLowerCase().includes(this.searchQuery.toLowerCase())) {
            const isCurrent = this.currentSearchMatchCell?.row === r && this.currentSearchMatchCell?.col === c;
            ctx.fillStyle = isCurrent ? 'rgba(250, 204, 21, 0.6)' : 'rgba(250, 204, 21, 0.2)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          }
        }
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

  private drawFrozenCells(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange, containerHeight: number): void {
    const { theme, scrollState, data } = this;
    const frozenWidth = this.coordinateManager.getFrozenWidth();
    const { headerHeight, rowHeaderWidth } = theme;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rowHeaderWidth, headerHeight, frozenWidth, containerHeight - headerHeight);
    ctx.clip();

    for (let r = visibleRange.rowStart; r < visibleRange.rowEnd; r++) {
      if (this.isGroupHeaderRow(r)) continue;
      const record = data.records[r];
      if (!record) continue;
      const isSelected = this.selectedRows.has(r);
      const isHovered = this.hoveredRow === r;

      for (let c = 0; c < this.frozenColumnCount; c++) {
        const col = this.getVisibleColumn(c);
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

        if (col.id && !isSelected && !isHovered) {
          if (this.groupedColumnIds.has(col.id)) {
            ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          } else if (this.filteredColumnIds.has(col.id)) {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.05)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          } else if (this.sortedColumnIds.has(col.id)) {
            ctx.fillStyle = 'rgba(57, 163, 128, 0.05)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          }
        }

        ctx.strokeStyle = theme.cellBorderColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cellRect.x + cellRect.width, cellRect.y);
        ctx.lineTo(cellRect.x + cellRect.width, cellRect.y + cellRect.height);
        ctx.lineTo(cellRect.x, cellRect.y + cellRect.height);
        ctx.stroke();

        const cell = record.cells[col.id];
        if (cell && this.searchQuery) {
          const displayText = String(cell.displayData ?? '');
          if (displayText && displayText.toLowerCase().includes(this.searchQuery.toLowerCase())) {
            const isCurrent = this.currentSearchMatchCell?.row === r && this.currentSearchMatchCell?.col === c;
            ctx.fillStyle = isCurrent ? 'rgba(250, 204, 21, 0.6)' : 'rgba(250, 204, 21, 0.2)';
            ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
          }
        }
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
    ctx.restore();
  }

  private drawFrozenBorder(ctx: CanvasRenderingContext2D, containerHeight: number): void {
    const { rowHeaderWidth, headerHeight } = this.theme;
    const frozenWidth = this.coordinateManager.getFrozenWidth();
    const borderX = rowHeaderWidth + frozenWidth;

    ctx.save();
    ctx.strokeStyle = '#c7d2e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(borderX, 0);
    ctx.lineTo(borderX, containerHeight);
    ctx.stroke();

    const gradient = ctx.createLinearGradient(borderX, 0, borderX + 6, 0);
    gradient.addColorStop(0, 'rgba(0,0,0,0.06)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(borderX, headerHeight, 6, containerHeight - headerHeight);
    ctx.restore();
  }

  private drawRowHeaders(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange, containerHeight: number): void {
    const { theme, scrollState, currentRowHeight } = this;
    const { rowHeaderWidth, headerHeight } = theme;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, headerHeight, rowHeaderWidth, containerHeight - headerHeight);
    ctx.clip();

    let dataRowNum = 0;
    for (let r = 0; r < visibleRange.rowStart; r++) {
      if (!this.isGroupHeaderRow(r)) dataRowNum++;
    }

    for (let r = visibleRange.rowStart; r < visibleRange.rowEnd; r++) {
      if (this.isGroupHeaderRow(r)) {
        continue;
      }

      dataRowNum++;
      const y = this.coordinateManager.getRowY(r, scrollState.scrollTop);
      const isSelected = this.selectedRows.has(r);
      const isHovered = this.hoveredRow === r;

      ctx.fillStyle = isSelected ? theme.selectedRowBg : theme.headerBgColor;
      ctx.fillRect(0, y, rowHeaderWidth, currentRowHeight);

      ctx.strokeStyle = theme.headerBorderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(rowHeaderWidth, y);
      ctx.lineTo(rowHeaderWidth, y + currentRowHeight);
      ctx.lineTo(0, y + currentRowHeight);
      ctx.stroke();

      const centerY = y + currentRowHeight / 2;

      const showControls = isSelected || isHovered;

      if (showControls) {
        const checkSize = 14;
        const cx = rowHeaderWidth * 0.25 - checkSize / 2;
        const cy = centerY - checkSize / 2;

        if (isSelected) {
          ctx.fillStyle = theme.activeCellBorderColor;
          ctx.beginPath();
          ctx.roundRect(cx, cy, checkSize, checkSize, 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx + 3, centerY);
          ctx.lineTo(cx + 5.5, centerY + 2.5);
          ctx.lineTo(cx + 9, centerY - 2);
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(cx, cy, checkSize, checkSize, 2);
          ctx.stroke();
        }

        if (isHovered) {
          ctx.font = `14px ${theme.fontFamily}`;
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⤢', rowHeaderWidth * 0.75, centerY);
        }
      } else {
        ctx.font = `${theme.fontSize - 1}px ${theme.fontFamily}`;
        ctx.fillStyle = theme.rowNumberColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(dataRowNum), rowHeaderWidth / 2, centerY);
      }
    }

    ctx.restore();
    ctx.textAlign = 'left';
  }

  private drawColumnHeaders(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange, containerWidth: number): void {
    const { theme, scrollState } = this;
    const { headerHeight, rowHeaderWidth } = theme;

    ctx.save();
    ctx.beginPath();
    ctx.rect(rowHeaderWidth, 0, containerWidth - rowHeaderWidth, headerHeight);
    ctx.clip();

    for (let c = visibleRange.colStart; c < visibleRange.colEnd; c++) {
      const col = this.getVisibleColumn(c);
      if (!col) continue;
      const x = this.coordinateManager.getColumnX(c, scrollState.scrollLeft);
      const w = this.visibleColumnIndices[c] !== undefined ? this.columnWidths[this.visibleColumnIndices[c]] : 100;
      this.paintColumnHeader(ctx, col, x, w, c);
    }

    ctx.restore();
    ctx.textAlign = 'left';
  }

  private drawFrozenColumnHeaders(ctx: CanvasRenderingContext2D, _containerWidth: number): void {
    const { theme } = this;
    const { headerHeight, rowHeaderWidth } = theme;
    const frozenWidth = this.coordinateManager.getFrozenWidth();

    ctx.save();
    ctx.beginPath();
    ctx.rect(rowHeaderWidth, 0, frozenWidth, headerHeight);
    ctx.clip();

    for (let c = 0; c < this.frozenColumnCount; c++) {
      const col = this.getVisibleColumn(c);
      if (!col) continue;
      const x = this.coordinateManager.getColumnX(c, 0);
      const origIdx = this.visibleColumnIndices[c];
      const w = origIdx !== undefined ? this.columnWidths[origIdx] : 100;
      this.paintColumnHeader(ctx, col, x, w, c, true);
    }

    ctx.restore();
    ctx.textAlign = 'left';
  }

  private paintColumnHeader(
    ctx: CanvasRenderingContext2D,
    col: { type: string; name: string; id?: string },
    x: number,
    w: number,
    _visibleIndex: number,
    isFrozen: boolean = false
  ): void {
    const { theme } = this;
    const { headerHeight } = theme;

    ctx.fillStyle = theme.headerBgColor;
    ctx.fillRect(x, 0, w, headerHeight);

    const colId = col.id ?? '';
    let highlightColor: string | null = null;
    if (this.groupedColumnIds.has(colId)) {
      highlightColor = '#22c55e';
      ctx.fillStyle = 'rgba(34, 197, 94, 0.08)';
      ctx.fillRect(x, 0, w, headerHeight);
    } else if (this.filteredColumnIds.has(colId)) {
      highlightColor = '#eab308';
      ctx.fillStyle = 'rgba(250, 204, 21, 0.08)';
      ctx.fillRect(x, 0, w, headerHeight);
    } else if (this.sortedColumnIds.has(colId)) {
      highlightColor = '#39A380';
      ctx.fillStyle = 'rgba(57, 163, 128, 0.08)';
      ctx.fillRect(x, 0, w, headerHeight);
    }

    ctx.strokeStyle = theme.headerBorderColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + w, 0);
    ctx.lineTo(x + w, headerHeight);
    ctx.moveTo(x, headerHeight);
    ctx.lineTo(x + w, headerHeight);
    ctx.stroke();

    if (highlightColor) {
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, headerHeight - 1);
      ctx.lineTo(x + w, headerHeight - 1);
      ctx.stroke();
    }

    const icon = TYPE_ICONS[col.type] || 'T';
    ctx.font = `${theme.headerFontSize - 1}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.rowNumberColor;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const iconW = ctx.measureText(icon).width;
    ctx.fillText(icon, x + theme.cellPaddingX, headerHeight / 2);

    if (isFrozen) {
      const pinX = x + w - theme.cellPaddingX - 8;
      ctx.fillStyle = '#94a3b8';
      ctx.font = `10px ${theme.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText('📌', pinX + 8, headerHeight / 2);
      ctx.textAlign = 'left';
    }

    ctx.font = `${theme.headerFontWeight} ${theme.headerFontSize}px ${theme.fontFamily}`;
    ctx.fillStyle = theme.headerTextColor;
    const nameX = x + theme.cellPaddingX + iconW + 6;
    const rightPad = isFrozen ? 20 : 0;
    const maxNameW = w - theme.cellPaddingX * 2 - iconW - 6 - rightPad;
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

    const checkSize = 14;
    const cx = (rowHeaderWidth - checkSize) / 2;
    const cy = (headerHeight - checkSize) / 2;
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx, cy, checkSize, checkSize, 2);
    ctx.stroke();
  }

  private drawSelectionRange(ctx: CanvasRenderingContext2D, visibleRange: IVisibleRange): void {
    if (!this.selectionRange) return;

    const { startRow, startCol, endRow, endCol } = this.selectionRange;
    const minRow = Math.max(0, Math.min(startRow, endRow));
    const maxRow = Math.min(this.data.records.length - 1, Math.max(startRow, endRow));
    const minCol = Math.max(0, Math.min(startCol, endCol));
    const maxCol = Math.min(this.visibleColumnIndices.length - 1, Math.max(startCol, endCol));

    if (minRow > maxRow || minCol > maxCol) return;

    ctx.save();
    ctx.fillStyle = 'rgba(57, 163, 128, 0.12)';
    for (let r = Math.max(minRow, visibleRange.rowStart); r <= Math.min(maxRow, visibleRange.rowEnd - 1); r++) {
      if (this.isGroupHeaderRow(r)) continue;
      for (let c = minCol; c <= maxCol; c++) {
        const cellRect = this.coordinateManager.getCellRect(r, c, this.scrollState);
        ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
      }
    }

    let firstDataRow = minRow;
    while (firstDataRow <= maxRow && this.isGroupHeaderRow(firstDataRow)) firstDataRow++;
    let lastDataRow = maxRow;
    while (lastDataRow >= minRow && this.isGroupHeaderRow(lastDataRow)) lastDataRow--;

    if (firstDataRow <= lastDataRow) {
      const topLeft = this.coordinateManager.getCellRect(firstDataRow, minCol, this.scrollState);
      const bottomRight = this.coordinateManager.getCellRect(lastDataRow, maxCol, this.scrollState);
      const rangeX = topLeft.x;
      const rangeY = topLeft.y;
      const rangeW = bottomRight.x + bottomRight.width - topLeft.x;
      const rangeH = bottomRight.y + bottomRight.height - topLeft.y;

      ctx.strokeStyle = '#39A380';
      ctx.lineWidth = 2;
      ctx.strokeRect(rangeX + 1, rangeY + 1, rangeW - 2, rangeH - 2);
    }
    ctx.restore();
  }

  private drawActiveCell(ctx: CanvasRenderingContext2D): void {
    if (!this.activeCell) return;
    const { row, col } = this.activeCell;
    if (row < 0 || row >= this.data.records.length) return;
    if (col < 0 || col >= this.visibleColumnIndices.length) return;
    if (this.isGroupHeaderRow(row)) return;

    const cellRect = this.coordinateManager.getCellRect(row, col, this.scrollState);
    const bw = this.theme.activeCellBorderWidth;

    const isSelected = this.selectedRows.has(row);
    const isHovered = this.hoveredRow === row;
    if (isSelected) {
      ctx.fillStyle = this.theme.selectedRowBg;
    } else if (isHovered) {
      ctx.fillStyle = this.theme.hoverRowBg;
    } else {
      ctx.fillStyle = this.theme.bgColor;
    }
    ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);

    const visibleCol = this.getVisibleColumn(col);
    if (visibleCol) {
      const record = this.data.records[row];
      const cell = record?.cells[visibleCol.id];
      if (cell && this.searchQuery) {
        const displayText = String(cell.displayData ?? '');
        if (displayText && displayText.toLowerCase().includes(this.searchQuery.toLowerCase())) {
          const isCurrent = this.currentSearchMatchCell?.row === row && this.currentSearchMatchCell?.col === col;
          ctx.fillStyle = isCurrent ? 'rgba(250, 204, 21, 0.6)' : 'rgba(250, 204, 21, 0.2)';
          ctx.fillRect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
        }
      }
      if (cell) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cellRect.x, cellRect.y, cellRect.width, cellRect.height);
        ctx.clip();
        paintCell(ctx, cell, cellRect, this.theme);
        ctx.restore();
      }
    }

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

    if (y > this.canvas.height / this.dpr / this.zoomScale) return;

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


  setScrollState(scroll: IScrollState): void {
    this.scrollState = scroll;
    this.scheduleRender();
  }

  setSelectionRange(range: { startRow: number; startCol: number; endRow: number; endCol: number } | null): void {
    this.selectionRange = range;
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
    this.rebuildCoordinateManager();
    this.scheduleRender();
  }

  setData(data: ITableData): void {
    this.data = data;
    this.columnWidths = data.columns.map(c => c.width);
    this.columnOrder = data.columns.map((_, i) => i);
    this.rebuildCoordinateManager();
    this.scheduleRender();
  }

  setFrozenColumnCount(count: number): void {
    this.frozenColumnCount = Math.max(0, Math.min(count, this.visibleColumnIndices.length));
    this.coordinateManager.setFrozenColumnCount(this.frozenColumnCount);
    this.scheduleRender();
  }

  getFrozenColumnCount(): number {
    return this.frozenColumnCount;
  }

  reorderColumn(fromIndex: number, toIndex: number): void {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || fromIndex >= this.columnOrder.length) return;
    if (toIndex < 0 || toIndex >= this.columnOrder.length) return;

    const fromVisIdx = this.visibleColumnIndices.indexOf(this.columnOrder[fromIndex]);
    const toVisIdx = this.visibleColumnIndices.indexOf(this.columnOrder[toIndex]);

    if (fromVisIdx === -1 || toVisIdx === -1) return;

    const [moved] = this.visibleColumnIndices.splice(fromVisIdx, 1);
    this.visibleColumnIndices.splice(toVisIdx, 0, moved);

    this.columnOrder = [...this.visibleColumnIndices];
    const hiddenOriginals = this.data.columns
      .map((_, i) => i)
      .filter(i => this.hiddenColumnIds.has(this.data.columns[i].id));
    this.columnOrder.push(...hiddenOriginals);

    this.rebuildCoordinateManager();
    this.scheduleRender();
  }

  reorderVisibleColumn(fromVisibleIndex: number, toVisibleIndex: number): void {
    if (fromVisibleIndex === toVisibleIndex) return;
    if (fromVisibleIndex < 0 || fromVisibleIndex >= this.visibleColumnIndices.length) return;
    if (toVisibleIndex < 0 || toVisibleIndex >= this.visibleColumnIndices.length) return;

    const [moved] = this.visibleColumnIndices.splice(fromVisibleIndex, 1);
    this.visibleColumnIndices.splice(toVisibleIndex, 0, moved);

    this.columnOrder = [...this.visibleColumnIndices];
    const hiddenOriginals = this.data.columns
      .map((_, i) => i)
      .filter(i => this.hiddenColumnIds.has(this.data.columns[i].id));
    this.columnOrder.push(...hiddenOriginals);

    this.rebuildCoordinateManager();
    this.scheduleRender();
  }

  setRowHeight(height: number): void {
    this.currentRowHeight = height;
    this.coordinateManager = new CoordinateManager(
      this.visibleColumnIndices.map(i => this.columnWidths[i]),
      this.data.records.length,
      height
    );
    this.coordinateManager.setFrozenColumnCount(this.frozenColumnCount);
    this.scheduleRender();
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.scheduleRender();
  }

  setCurrentSearchMatchCell(cell: { row: number; col: number } | null): void {
    this.currentSearchMatchCell = cell;
    this.scheduleRender();
  }

  setHighlightedColumns(sorted: Set<string>, filtered: Set<string>, grouped: Set<string>): void {
    this.sortedColumnIds = sorted;
    this.filteredColumnIds = filtered;
    this.groupedColumnIds = grouped;
    this.scheduleRender();
  }

  setHiddenColumnIds(ids: Set<string>): void {
    this.hiddenColumnIds = ids;
    this.rebuildCoordinateManager();
    this.scheduleRender();
  }

  getColumnWidths(): number[] {
    return [...this.columnWidths];
  }

  getVisibleColumnWidths(): number[] {
    return this.visibleColumnIndices.map(i => this.columnWidths[i]);
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

  getRowHeight(): number {
    return this.currentRowHeight;
  }

  getVisibleColumnCount(): number {
    return this.visibleColumnIndices.length;
  }

  getVisibleColumnAtIndex(visibleIndex: number) {
    return this.getVisibleColumn(visibleIndex);
  }

  getOriginalColumnIndex(visibleIndex: number): number {
    return this.getOriginalIndex(visibleIndex);
  }

  getVisibleColumns(): Array<{ id: string; name: string; type: string }> {
    return this.visibleColumnIndices.map(i => {
      const col = this.data.columns[i];
      return { id: col.id, name: col.name, type: col.type };
    });
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.teardownDprListener();
  }
}
