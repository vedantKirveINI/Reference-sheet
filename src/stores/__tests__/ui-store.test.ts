import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore, THEME_PRESETS } from '../ui-store';
import { RowHeightLevel, TextWrapMode } from '@/types';

function resetStore() {
  useUIStore.setState({
    sidebarExpanded: true,
    currentView: 'grid',
    zoomLevel: 100,
    selectedCells: [],
    activeCell: null,
    filterState: null,
    sortState: null,
    theme: 'light',
    accentColor: '#39A380',
    rowHeightLevel: RowHeightLevel.Medium,
    fieldNameLines: 1,
    defaultTextWrapMode: TextWrapMode.Clip,
    columnTextWrapModes: {},
    columnColors: {},
  });
}

describe('useUIStore', () => {
  beforeEach(resetStore);

  describe('THEME_PRESETS', () => {
    it('exports an array of theme presets', () => {
      expect(THEME_PRESETS).toBeInstanceOf(Array);
      expect(THEME_PRESETS.length).toBe(10);
      THEME_PRESETS.forEach((p) => {
        expect(p).toHaveProperty('name');
        expect(p).toHaveProperty('color');
        expect(p.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('sidebar', () => {
    it('starts expanded', () => {
      expect(useUIStore.getState().sidebarExpanded).toBe(true);
    });

    it('toggleSidebar flips state', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarExpanded).toBe(false);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarExpanded).toBe(true);
    });

    it('expandSidebar sets true', () => {
      useUIStore.getState().collapseSidebar();
      expect(useUIStore.getState().sidebarExpanded).toBe(false);
      useUIStore.getState().expandSidebar();
      expect(useUIStore.getState().sidebarExpanded).toBe(true);
    });

    it('collapseSidebar sets false', () => {
      useUIStore.getState().collapseSidebar();
      expect(useUIStore.getState().sidebarExpanded).toBe(false);
    });
  });

  describe('currentView', () => {
    it('defaults to grid', () => {
      expect(useUIStore.getState().currentView).toBe('grid');
    });

    it('setCurrentView changes view', () => {
      useUIStore.getState().setCurrentView('kanban');
      expect(useUIStore.getState().currentView).toBe('kanban');
    });
  });

  describe('zoomLevel', () => {
    it('defaults to 100', () => {
      expect(useUIStore.getState().zoomLevel).toBe(100);
    });

    it('setZoomLevel updates level', () => {
      useUIStore.getState().setZoomLevel(150);
      expect(useUIStore.getState().zoomLevel).toBe(150);
    });
  });

  describe('selectedCells', () => {
    it('defaults to empty array', () => {
      expect(useUIStore.getState().selectedCells).toEqual([]);
    });

    it('setSelectedCells sets cells', () => {
      const cells = [{ rowIndex: 0, columnIndex: 1 }, { rowIndex: 2, columnIndex: 3 }];
      useUIStore.getState().setSelectedCells(cells);
      expect(useUIStore.getState().selectedCells).toEqual(cells);
    });

    it('clearSelection clears cells and activeCell', () => {
      useUIStore.getState().setSelectedCells([{ rowIndex: 0, columnIndex: 0 }]);
      useUIStore.getState().setActiveCell({ rowIndex: 0, columnIndex: 0 });
      useUIStore.getState().clearSelection();
      expect(useUIStore.getState().selectedCells).toEqual([]);
      expect(useUIStore.getState().activeCell).toBeNull();
    });
  });

  describe('activeCell', () => {
    it('defaults to null', () => {
      expect(useUIStore.getState().activeCell).toBeNull();
    });

    it('setActiveCell sets cell', () => {
      const cell = { rowIndex: 1, columnIndex: 2 };
      useUIStore.getState().setActiveCell(cell);
      expect(useUIStore.getState().activeCell).toEqual(cell);
    });

    it('setActiveCell to null clears it', () => {
      useUIStore.getState().setActiveCell({ rowIndex: 0, columnIndex: 0 });
      useUIStore.getState().setActiveCell(null);
      expect(useUIStore.getState().activeCell).toBeNull();
    });
  });

  describe('filterState', () => {
    it('defaults to null', () => {
      expect(useUIStore.getState().filterState).toBeNull();
    });

    it('setFilterState updates filter', () => {
      const filter = { field: 'name', operator: 'contains', value: 'test' };
      useUIStore.getState().setFilterState(filter);
      expect(useUIStore.getState().filterState).toEqual(filter);
    });
  });

  describe('sortState', () => {
    it('defaults to null', () => {
      expect(useUIStore.getState().sortState).toBeNull();
    });

    it('setSortState updates sort', () => {
      const sort = { field: 'name', direction: 'asc' };
      useUIStore.getState().setSortState(sort);
      expect(useUIStore.getState().sortState).toEqual(sort);
    });
  });

  describe('theme', () => {
    it('defaults to light', () => {
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('setTheme changes to dark', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('setTheme changes back to light', () => {
      useUIStore.getState().setTheme('dark');
      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('accentColor', () => {
    it('defaults to brand green', () => {
      expect(useUIStore.getState().accentColor).toBe('#39A380');
    });

    it('setAccentColor updates color', () => {
      useUIStore.getState().setAccentColor('#2563EB');
      expect(useUIStore.getState().accentColor).toBe('#2563EB');
    });
  });

  describe('rowHeightLevel', () => {
    it('defaults to Medium', () => {
      expect(useUIStore.getState().rowHeightLevel).toBe(RowHeightLevel.Medium);
    });

    it('setRowHeightLevel updates', () => {
      useUIStore.getState().setRowHeightLevel(RowHeightLevel.Tall);
      expect(useUIStore.getState().rowHeightLevel).toBe(RowHeightLevel.Tall);
    });
  });

  describe('fieldNameLines', () => {
    it('defaults to 1', () => {
      expect(useUIStore.getState().fieldNameLines).toBe(1);
    });

    it('setFieldNameLines updates', () => {
      useUIStore.getState().setFieldNameLines(3);
      expect(useUIStore.getState().fieldNameLines).toBe(3);
    });
  });

  describe('columnTextWrapModes', () => {
    it('defaults to empty object', () => {
      expect(useUIStore.getState().columnTextWrapModes).toEqual({});
    });

    it('setColumnTextWrapMode sets mode for a column', () => {
      useUIStore.getState().setColumnTextWrapMode('col-1', TextWrapMode.Wrap);
      expect(useUIStore.getState().columnTextWrapModes['col-1']).toBe(TextWrapMode.Wrap);
    });

    it('getColumnTextWrapMode returns column mode', () => {
      useUIStore.getState().setColumnTextWrapMode('col-1', TextWrapMode.Wrap);
      expect(useUIStore.getState().getColumnTextWrapMode('col-1')).toBe(TextWrapMode.Wrap);
    });

    it('getColumnTextWrapMode returns default when no column mode set', () => {
      expect(useUIStore.getState().getColumnTextWrapMode('col-unknown')).toBe(TextWrapMode.Clip);
    });

    it('multiple columns have independent modes', () => {
      useUIStore.getState().setColumnTextWrapMode('col-1', TextWrapMode.Wrap);
      useUIStore.getState().setColumnTextWrapMode('col-2', TextWrapMode.Clip);
      expect(useUIStore.getState().getColumnTextWrapMode('col-1')).toBe(TextWrapMode.Wrap);
      expect(useUIStore.getState().getColumnTextWrapMode('col-2')).toBe(TextWrapMode.Clip);
    });
  });

  describe('columnColors', () => {
    it('defaults to empty object', () => {
      expect(useUIStore.getState().columnColors).toEqual({});
    });

    it('setColumnColor sets a color', () => {
      useUIStore.getState().setColumnColor('col-1', '#FF0000');
      expect(useUIStore.getState().columnColors['col-1']).toBe('#FF0000');
    });

    it('setColumnColor sets null to remove', () => {
      useUIStore.getState().setColumnColor('col-1', '#FF0000');
      useUIStore.getState().setColumnColor('col-1', null);
      expect(useUIStore.getState().columnColors['col-1']).toBeNull();
    });

    it('setColumnColors replaces all colors', () => {
      useUIStore.getState().setColumnColor('col-1', '#FF0000');
      useUIStore.getState().setColumnColors({ 'col-2': '#00FF00' });
      expect(useUIStore.getState().columnColors).toEqual({ 'col-2': '#00FF00' });
    });

    it('setColumnColor preserves other columns', () => {
      useUIStore.getState().setColumnColor('col-1', '#FF0000');
      useUIStore.getState().setColumnColor('col-2', '#00FF00');
      expect(useUIStore.getState().columnColors).toEqual({ 'col-1': '#FF0000', 'col-2': '#00FF00' });
    });
  });
});
