import { describe, it, expect } from 'vitest';
import { CoordinateManager } from '../coordinate-manager';
import { GRID_THEME } from '../theme';

describe('CoordinateManager', () => {
  const defaultWidths = [100, 150, 200, 120, 80];
  const defaultRowCount = 10;

  function create(widths = defaultWidths, rows = defaultRowCount, rowHeight?: number) {
    return new CoordinateManager(widths, rows, rowHeight);
  }

  describe('constructor & defaults', () => {
    it('initialises with default row height from theme', () => {
      const cm = create();
      expect(cm.getRowHeight(0)).toBe(GRID_THEME.defaultRowHeight);
    });

    it('uses custom row height when provided', () => {
      const cm = create(defaultWidths, 5, 40);
      expect(cm.getRowHeight(0)).toBe(40);
    });

    it('returns a copy of column widths', () => {
      const cm = create();
      const widths = cm.getColumnWidths();
      expect(widths).toEqual(defaultWidths);
      widths[0] = 999;
      expect(cm.getColumnWidths()[0]).toBe(100);
    });
  });

  describe('getTotalWidth / getTotalHeight', () => {
    it('sums all column widths', () => {
      const cm = create();
      expect(cm.getTotalWidth()).toBe(100 + 150 + 200 + 120 + 80);
    });

    it('sums all row heights (uniform)', () => {
      const cm = create(defaultWidths, 5, 30);
      expect(cm.getTotalHeight()).toBe(5 * 30);
    });
  });

  describe('getCellRect', () => {
    it('returns correct rect for first cell at scroll 0', () => {
      const cm = create();
      const scroll = { scrollTop: 0, scrollLeft: 0 };
      const rect = cm.getCellRect(0, 0, scroll);
      expect(rect.x).toBe(GRID_THEME.rowHeaderWidth);
      expect(rect.y).toBe(GRID_THEME.headerHeight);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(GRID_THEME.defaultRowHeight);
    });

    it('returns correct rect for second column', () => {
      const cm = create();
      const scroll = { scrollTop: 0, scrollLeft: 0 };
      const rect = cm.getCellRect(0, 1, scroll);
      expect(rect.x).toBe(GRID_THEME.rowHeaderWidth + 100);
      expect(rect.width).toBe(150);
    });

    it('returns correct rect for second row', () => {
      const cm = create();
      const scroll = { scrollTop: 0, scrollLeft: 0 };
      const rect = cm.getCellRect(1, 0, scroll);
      expect(rect.y).toBe(GRID_THEME.headerHeight + GRID_THEME.defaultRowHeight);
    });

    it('accounts for scrollTop', () => {
      const cm = create();
      const scroll = { scrollTop: 10, scrollLeft: 0 };
      const rect = cm.getCellRect(0, 0, scroll);
      expect(rect.y).toBe(GRID_THEME.headerHeight - 10);
    });

    it('accounts for scrollLeft', () => {
      const cm = create();
      const scroll = { scrollTop: 0, scrollLeft: 50 };
      const rect = cm.getCellRect(0, 0, scroll);
      expect(rect.x).toBe(GRID_THEME.rowHeaderWidth - 50);
    });

    it('frozen column ignores scrollLeft', () => {
      const cm = create();
      cm.setFrozenColumnCount(1);
      const scroll = { scrollTop: 0, scrollLeft: 100 };
      const rectFrozen = cm.getCellRect(0, 0, scroll);
      expect(rectFrozen.x).toBe(GRID_THEME.rowHeaderWidth);
      const rectNonFrozen = cm.getCellRect(0, 1, scroll);
      expect(rectNonFrozen.x).toBe(GRID_THEME.rowHeaderWidth + 100 - 100);
    });
  });

  describe('getColumnX / getRowY', () => {
    it('getColumnX returns correct x for non-frozen column', () => {
      const cm = create();
      expect(cm.getColumnX(0, 0)).toBe(GRID_THEME.rowHeaderWidth);
      expect(cm.getColumnX(1, 0)).toBe(GRID_THEME.rowHeaderWidth + 100);
      expect(cm.getColumnX(1, 50)).toBe(GRID_THEME.rowHeaderWidth + 100 - 50);
    });

    it('getColumnX returns correct x for frozen column regardless of scroll', () => {
      const cm = create();
      cm.setFrozenColumnCount(1);
      expect(cm.getColumnX(0, 200)).toBe(GRID_THEME.rowHeaderWidth);
    });

    it('getRowY returns correct y', () => {
      const cm = create(defaultWidths, 5, 30);
      expect(cm.getRowY(0, 0)).toBe(GRID_THEME.headerHeight);
      expect(cm.getRowY(1, 0)).toBe(GRID_THEME.headerHeight + 30);
      expect(cm.getRowY(2, 10)).toBe(GRID_THEME.headerHeight + 60 - 10);
    });
  });

  describe('header height / row header width', () => {
    it('get/set headerHeight', () => {
      const cm = create();
      expect(cm.getHeaderHeight()).toBe(GRID_THEME.headerHeight);
      cm.setHeaderHeight(50);
      expect(cm.getHeaderHeight()).toBe(50);
    });

    it('get/set rowHeaderWidth', () => {
      const cm = create();
      expect(cm.getRowHeaderWidth()).toBe(GRID_THEME.rowHeaderWidth);
      cm.setRowHeaderWidth(80);
      expect(cm.getRowHeaderWidth()).toBe(80);
    });
  });

  describe('frozen columns', () => {
    it('clamps frozen count to column length', () => {
      const cm = create([100, 200], 5);
      cm.setFrozenColumnCount(10);
      expect(cm.getFrozenColumnCount()).toBe(2);
    });

    it('clamps to 0 for negative values', () => {
      const cm = create();
      cm.setFrozenColumnCount(-1);
      expect(cm.getFrozenColumnCount()).toBe(0);
    });

    it('getFrozenWidth sums frozen column widths', () => {
      const cm = create([100, 200, 300], 3);
      cm.setFrozenColumnCount(2);
      expect(cm.getFrozenWidth()).toBe(300);
    });

    it('getFrozenWidth returns 0 when no frozen columns', () => {
      const cm = create();
      expect(cm.getFrozenWidth()).toBe(0);
    });
  });

  describe('updateColumnWidth', () => {
    it('updates width and respects minimum', () => {
      const cm = create([100, 200], 3);
      cm.updateColumnWidth(0, 20);
      expect(cm.getColumnWidths()[0]).toBe(GRID_THEME.minColumnWidth);
    });

    it('updates width for valid value', () => {
      const cm = create([100, 200], 3);
      cm.updateColumnWidth(0, 300);
      expect(cm.getColumnWidths()[0]).toBe(300);
      expect(cm.getTotalWidth()).toBe(300 + 200);
    });
  });

  describe('variable row heights', () => {
    it('setRowHeights updates row offsets', () => {
      const cm = create([100], 3, 30);
      cm.setRowHeights([20, 40, 60]);
      expect(cm.getRowHeight(0)).toBe(20);
      expect(cm.getRowHeight(1)).toBe(40);
      expect(cm.getRowHeight(2)).toBe(60);
      expect(cm.getTotalHeight()).toBe(120);
    });

    it('getRowHeight returns default for out-of-range index', () => {
      const cm = create([100], 2, 30);
      expect(cm.getRowHeight(999)).toBe(30);
    });
  });

  describe('getVisibleRange', () => {
    it('returns valid range with no scroll', () => {
      const cm = create([100, 100, 100], 20, 30);
      const range = cm.getVisibleRange({ scrollTop: 0, scrollLeft: 0 }, 400, 200);
      expect(range.rowStart).toBeGreaterThanOrEqual(0);
      expect(range.rowEnd).toBeLessThanOrEqual(20);
      expect(range.colStart).toBeGreaterThanOrEqual(0);
      expect(range.colEnd).toBeLessThanOrEqual(3);
    });

    it('adjusts for scroll', () => {
      const cm = create(Array(20).fill(100), 100, 30);
      const range = cm.getVisibleRange({ scrollTop: 300, scrollLeft: 200 }, 500, 400);
      expect(range.rowStart).toBeGreaterThan(0);
      expect(range.colStart).toBeGreaterThanOrEqual(0);
    });

    it('respects frozen columns for colStart', () => {
      const cm = create([100, 100, 100, 100], 10, 30);
      cm.setFrozenColumnCount(1);
      const range = cm.getVisibleRange({ scrollTop: 0, scrollLeft: 200 }, 400, 200);
      expect(range.colStart).toBeGreaterThanOrEqual(1);
    });
  });

  describe('hitTest', () => {
    const scroll = { scrollTop: 0, scrollLeft: 0 };
    const cw = 800;
    const ch = 600;

    it('detects cornerHeader region', () => {
      const cm = create();
      const result = cm.hitTest(10, 10, scroll, cw, ch);
      expect(result.region).toBe('cornerHeader');
      expect(result.rowIndex).toBe(-1);
      expect(result.colIndex).toBe(-1);
    });

    it('detects columnHeader region', () => {
      const cm = create();
      const rhw = GRID_THEME.rowHeaderWidth;
      const result = cm.hitTest(rhw + 10, 5, scroll, cw, ch);
      expect(result.region).toBe('columnHeader');
      expect(result.colIndex).toBe(0);
    });

    it('detects resize handle in column header', () => {
      const cm = create([100], 5);
      const rhw = GRID_THEME.rowHeaderWidth;
      const resizeX = rhw + 100 - 1;
      const result = cm.hitTest(resizeX, 5, scroll, cw, ch);
      expect(result.region).toBe('columnHeader');
      expect(result.isResizeHandle).toBe(true);
    });

    it('detects rowHeader region', () => {
      const cm = create();
      const hh = GRID_THEME.headerHeight;
      const result = cm.hitTest(10, hh + 5, scroll, cw, ch);
      expect(result.region).toBe('rowHeader');
      expect(result.rowIndex).toBe(0);
    });

    it('detects cell region', () => {
      const cm = create();
      const rhw = GRID_THEME.rowHeaderWidth;
      const hh = GRID_THEME.headerHeight;
      const result = cm.hitTest(rhw + 10, hh + 5, scroll, cw, ch);
      expect(result.region).toBe('cell');
      expect(result.rowIndex).toBe(0);
      expect(result.colIndex).toBe(0);
    });

    it('detects second column cell', () => {
      const cm = create([100, 200], 5);
      const rhw = GRID_THEME.rowHeaderWidth;
      const hh = GRID_THEME.headerHeight;
      const result = cm.hitTest(rhw + 110, hh + 5, scroll, cw, ch);
      expect(result.region).toBe('cell');
      expect(result.colIndex).toBe(1);
    });

    it('detects appendColumn region', () => {
      const cm = create([100], 5);
      const rhw = GRID_THEME.rowHeaderWidth;
      const totalW = cm.getTotalWidth();
      const result = cm.hitTest(rhw + totalW + 5, 5, scroll, cw, ch);
      expect(result.region).toBe('appendColumn');
    });

    it('detects appendRow when clicking below last row in row header', () => {
      const cm = create([100], 2, 30);
      const hh = GRID_THEME.headerHeight;
      const belowY = hh + 2 * 30 + 5;
      const result = cm.hitTest(10, belowY, scroll, cw, ch);
      expect(result.region).toBe('appendRow');
    });

    it('detects appendRow when clicking below last row in cell area', () => {
      const cm = create([100], 2, 30);
      const rhw = GRID_THEME.rowHeaderWidth;
      const hh = GRID_THEME.headerHeight;
      const belowY = hh + 2 * 30 + 5;
      const result = cm.hitTest(rhw + 10, belowY, scroll, cw, ch);
      expect(result.region).toBe('appendRow');
    });

    it('returns none for empty area past all columns in header', () => {
      const cm = create([100], 5);
      const rhw = GRID_THEME.rowHeaderWidth;
      const totalW = cm.getTotalWidth();
      const pastAppend = rhw + totalW + GRID_THEME.appendColumnWidth + 50;
      const result = cm.hitTest(pastAppend, 5, scroll, cw, ch);
      expect(result.region).toBe('none');
    });

    it('accounts for scroll in cell hit test', () => {
      const cm = create([100, 100], 5, 30);
      const rhw = GRID_THEME.rowHeaderWidth;
      const hh = GRID_THEME.headerHeight;
      const scrolled = { scrollTop: 30, scrollLeft: 0 };
      const result = cm.hitTest(rhw + 10, hh + 5, scrolled, cw, ch);
      expect(result.region).toBe('cell');
      expect(result.rowIndex).toBe(1);
    });

    it('detects frozen column cell when scrolled', () => {
      const cm = create([100, 100, 100], 5, 30);
      cm.setFrozenColumnCount(1);
      const rhw = GRID_THEME.rowHeaderWidth;
      const hh = GRID_THEME.headerHeight;
      const scrolled = { scrollTop: 0, scrollLeft: 200 };
      const result = cm.hitTest(rhw + 10, hh + 5, scrolled, cw, ch);
      expect(result.region).toBe('cell');
      expect(result.colIndex).toBe(0);
    });

    it('detects frozen column header when scrolled', () => {
      const cm = create([100, 100, 100], 5, 30);
      cm.setFrozenColumnCount(1);
      const rhw = GRID_THEME.rowHeaderWidth;
      const scrolled = { scrollTop: 0, scrollLeft: 200 };
      const result = cm.hitTest(rhw + 10, 5, scrolled, cw, ch);
      expect(result.region).toBe('columnHeader');
      expect(result.colIndex).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles zero columns', () => {
      const cm = create([], 5);
      expect(cm.getTotalWidth()).toBe(0);
      expect(cm.getColumnWidths()).toEqual([]);
    });

    it('handles zero rows', () => {
      const cm = create([100], 0);
      expect(cm.getTotalHeight()).toBe(0);
    });

    it('getCellRect with large row/col indices uses available data', () => {
      const cm = create([100], 2, 30);
      const rect = cm.getCellRect(0, 0, { scrollTop: 0, scrollLeft: 0 });
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(30);
    });
  });
});
