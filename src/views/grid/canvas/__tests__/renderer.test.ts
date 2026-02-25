import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GridRenderer } from '../renderer';
import { GRID_THEME, GRID_THEME_DARK } from '../theme';
import { CellType } from '@/types';

function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as string,
    textBaseline: 'top' as string,
    lineCap: 'butt',
    lineJoin: 'miter',
    globalAlpha: 1,
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    rect: vi.fn(),
    roundRect: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createPattern: vi.fn(() => null),
    setLineDash: vi.fn(),
    getLineDash: vi.fn(() => []),
    isPointInPath: vi.fn(() => false),
  };

  const canvas = {
    width: 800,
    height: 600,
    style: { width: '800px', height: '600px' },
    getContext: vi.fn(() => ctx),
  } as unknown as HTMLCanvasElement;

  return { canvas, ctx };
}

function createTestData(cols = 3, rows = 5) {
  const columns = Array.from({ length: cols }, (_, i) => ({
    id: `col-${i}`,
    name: `Column ${i}`,
    type: CellType.String,
    rawId: i,
    width: 150,
    options: [],
    rawOptions: {},
    dbFieldName: `field_${i}`,
    isPrimary: i === 0,
    isComputed: false,
    fieldFormat: null,
  }));

  const records = Array.from({ length: rows }, (_, r) => ({
    id: `rec-${r}`,
    cells: Object.fromEntries(columns.map(c => [c.id, { type: CellType.String, data: `val-${r}-${c.id}`, displayData: `val-${r}-${c.id}` }])),
    createdTime: '2025-01-01T00:00:00Z',
  }));

  return { columns, records };
}

describe('GridRenderer', () => {
  let canvas: HTMLCanvasElement;
  let ctx: any;
  let renderer: GridRenderer;
  let data: ReturnType<typeof createTestData>;

  beforeEach(() => {
    vi.stubGlobal('devicePixelRatio', 1);
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) => { cb(); return 1; });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const mock = createMockCanvas();
    canvas = mock.canvas;
    ctx = mock.ctx;
    data = createTestData();
    renderer = new GridRenderer(canvas, data as any);
  });

  describe('initialization', () => {
    it('creates renderer without errors', () => {
      expect(renderer).toBeDefined();
    });

    it('can render without crashing', () => {
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('resize', () => {
    it('updates canvas dimensions', () => {
      renderer.resize(1024, 768);
      expect(canvas.width).toBe(1024);
      expect(canvas.height).toBe(768);
      expect(canvas.style.width).toBe('1024px');
      expect(canvas.style.height).toBe('768px');
    });
  });

  describe('setTheme', () => {
    it('applies dark theme', () => {
      expect(() => renderer.setTheme(GRID_THEME_DARK)).not.toThrow();
    });

    it('applies light theme', () => {
      expect(() => renderer.setTheme(GRID_THEME)).not.toThrow();
    });
  });

  describe('zoom', () => {
    it('sets and gets zoom scale', () => {
      renderer.setZoomScale(1.5);
      expect(renderer.getZoomScale()).toBe(1.5);
    });

    it('clamps zoom to min 0.25', () => {
      renderer.setZoomScale(0.1);
      expect(renderer.getZoomScale()).toBe(0.25);
    });

    it('clamps zoom to max 3', () => {
      renderer.setZoomScale(5);
      expect(renderer.getZoomScale()).toBe(3);
    });
  });

  describe('effectiveHeaderHeight', () => {
    it('returns theme headerHeight for single line', () => {
      expect(renderer.effectiveHeaderHeight).toBe(GRID_THEME.headerHeight);
    });
  });

  describe('effectiveRowHeaderWidth', () => {
    it('returns theme rowHeaderWidth when no comments', () => {
      expect(renderer.effectiveRowHeaderWidth).toBe(GRID_THEME.rowHeaderWidth);
    });
  });

  describe('setScroll', () => {
    it('updates scroll state and renders', () => {
      expect(() => (renderer as any).scrollState = { scrollTop: 50, scrollLeft: 30 }).not.toThrow();
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('setActiveCell', () => {
    it('sets active cell', () => {
      (renderer as any).activeCell = { row: 1, col: 2 };
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('setSelectedRows', () => {
    it('sets selected rows', () => {
      (renderer as any).selectedRows = new Set([0, 2]);
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('setHoveredRow', () => {
    it('sets hovered row', () => {
      (renderer as any).hoveredRow = 1;
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('render calls drawing functions', () => {
    it('calls ctx.save and ctx.restore', () => {
      renderer.render();
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('calls ctx.scale for DPR and zoom', () => {
      renderer.render();
      expect(ctx.scale).toHaveBeenCalled();
    });

    it('fills background', () => {
      renderer.render();
      expect(ctx.fillRect).toHaveBeenCalled();
    });
  });

  describe('data update', () => {
    it('handles data with no records', () => {
      const emptyData = { columns: data.columns, records: [] };
      const r = new GridRenderer(canvas, emptyData as any);
      expect(() => r.render()).not.toThrow();
    });

    it('handles data with no columns', () => {
      const noColData = { columns: [], records: [] };
      const r = new GridRenderer(canvas, noColData as any);
      expect(() => r.render()).not.toThrow();
    });
  });

  describe('group header rows', () => {
    it('recognizes group header records', () => {
      const groupData = createTestData(2, 3);
      groupData.records.unshift({
        id: '__group__test',
        cells: {
          '__group_meta__': {
            type: CellType.String,
            data: { fieldName: 'Status', value: 'Active', count: 3, isCollapsed: false, key: 'status-active', depth: 0 } as any,
            displayData: '',
          }
        },
        createdTime: '',
      });
      const r = new GridRenderer(canvas, groupData as any);
      expect(() => r.render()).not.toThrow();
    });
  });

  describe('frozen columns', () => {
    it('sets frozen column count', () => {
      (renderer as any).frozenColumnCount = 1;
      (renderer as any).rebuildCoordinateManager();
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('search highlighting', () => {
    it('renders with search query', () => {
      (renderer as any).searchQuery = 'val';
      expect(() => renderer.render()).not.toThrow();
    });

    it('renders with current search match cell', () => {
      (renderer as any).searchQuery = 'val';
      (renderer as any).currentSearchMatchCell = { row: 0, col: 0 };
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('column text wrap modes', () => {
    it('applies wrap mode without error', () => {
      (renderer as any).columnTextWrapModes = { 'col-0': 'Wrap' };
      (renderer as any).rowHeightsDirty = true;
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('column colors', () => {
    it('applies column background colors', () => {
      (renderer as any).columnColors = { 'col-0': 'rgba(255,0,0,0.1)' };
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('conditional color rules', () => {
    it('applies conditional color rules', () => {
      (renderer as any).conditionalColorRules = [
        { conditions: [{ fieldId: 'col-0', operator: 'eq', value: 'test' }], conjunction: 'and', color: 'rgba(255,0,0,0.1)' },
      ];
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('enrichment groups', () => {
    it('handles enrichment group map', () => {
      (renderer as any).enrichmentGroupMap = new Map([['col-0', ['col-1']]]);
      (renderer as any).enrichmentChildToParent = new Map([['col-1', 'col-0']]);
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('selection range', () => {
    it('renders with selection range', () => {
      (renderer as any).selectionRange = { startRow: 0, startCol: 0, endRow: 2, endCol: 1 };
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('sorted/filtered/grouped column indicators', () => {
    it('handles sorted column ids', () => {
      (renderer as any).sortedColumnIds = new Set(['col-0']);
      expect(() => renderer.render()).not.toThrow();
    });

    it('handles filtered column ids', () => {
      (renderer as any).filteredColumnIds = new Set(['col-1']);
      expect(() => renderer.render()).not.toThrow();
    });

    it('handles grouped column ids', () => {
      (renderer as any).groupedColumnIds = new Set(['col-0']);
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('hidden columns', () => {
    it('hides columns', () => {
      (renderer as any).hiddenColumnIds = new Set(['col-1']);
      (renderer as any).rebuildCoordinateManager();
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('comment counts', () => {
    it('renders with comment counts', () => {
      (renderer as any).commentCounts = { 'rec-0': 3 };
      (renderer as any).hasAnyComments = true;
      (renderer as any).rebuildCoordinateManager();
      expect(() => renderer.render()).not.toThrow();
    });
  });

  describe('enriching cells', () => {
    it('renders loading state for enriching cells', () => {
      data.records[0].cells['col-0'] = { type: CellType.Enrichment, data: null, displayData: '' } as any;
      const r = new GridRenderer(canvas, data as any);
      (r as any).enrichingCells = new Set(['rec-0_col-0']);
      expect(() => r.render()).not.toThrow();
    });
  });
});
