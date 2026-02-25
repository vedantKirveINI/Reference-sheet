import { describe, it, expect, beforeEach } from 'vitest';
import { useFieldsStore, IExtendedColumn } from '../fields-store';

function makeCol(overrides: Partial<IExtendedColumn> = {}): IExtendedColumn {
  return {
    id: 'col-1',
    name: 'Name',
    type: 'SHORT_TEXT',
    width: 200,
    options: [],
    isPrimary: false,
    isComputed: false,
    order: 0,
    ...overrides,
  } as IExtendedColumn;
}

function resetStore() {
  useFieldsStore.setState({
    allColumns: [],
    hiddenColumnIds: new Set(),
    collapsedEnrichmentGroups: new Set(),
    loading: false,
    error: null,
  });
}

describe('useFieldsStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('has empty columns', () => {
      expect(useFieldsStore.getState().allColumns).toEqual([]);
    });
    it('has empty hiddenColumnIds', () => {
      expect(useFieldsStore.getState().hiddenColumnIds.size).toBe(0);
    });
    it('loading is false', () => {
      expect(useFieldsStore.getState().loading).toBe(false);
    });
    it('error is null', () => {
      expect(useFieldsStore.getState().error).toBeNull();
    });
  });

  describe('setAllColumns', () => {
    it('sets columns', () => {
      const cols = [makeCol({ id: 'a' }), makeCol({ id: 'b' })];
      useFieldsStore.getState().setAllColumns(cols);
      expect(useFieldsStore.getState().allColumns).toHaveLength(2);
    });
  });

  describe('updateColumn', () => {
    it('updates a single column by id', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a', name: 'Old' })]);
      useFieldsStore.getState().updateColumn('a', { name: 'New' });
      expect(useFieldsStore.getState().allColumns[0].name).toBe('New');
    });

    it('does not modify non-matching columns', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a', name: 'A' }), makeCol({ id: 'b', name: 'B' })]);
      useFieldsStore.getState().updateColumn('a', { name: 'Updated' });
      expect(useFieldsStore.getState().allColumns[1].name).toBe('B');
    });
  });

  describe('updateColumns', () => {
    it('updates multiple columns at once', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a', name: 'A' }), makeCol({ id: 'b', name: 'B' })]);
      useFieldsStore.getState().updateColumns([
        { id: 'a', name: 'A2' },
        { id: 'b', name: 'B2' },
      ]);
      expect(useFieldsStore.getState().allColumns[0].name).toBe('A2');
      expect(useFieldsStore.getState().allColumns[1].name).toBe('B2');
    });
  });

  describe('toggleColumnVisibility', () => {
    it('adds column to hidden set', () => {
      useFieldsStore.getState().toggleColumnVisibility('col-1');
      expect(useFieldsStore.getState().hiddenColumnIds.has('col-1')).toBe(true);
    });

    it('removes column from hidden set on second toggle', () => {
      useFieldsStore.getState().toggleColumnVisibility('col-1');
      useFieldsStore.getState().toggleColumnVisibility('col-1');
      expect(useFieldsStore.getState().hiddenColumnIds.has('col-1')).toBe(false);
    });
  });

  describe('setColumnVisibility', () => {
    it('visible=false hides column', () => {
      useFieldsStore.getState().setColumnVisibility('col-1', false);
      expect(useFieldsStore.getState().hiddenColumnIds.has('col-1')).toBe(true);
    });

    it('visible=true shows column', () => {
      useFieldsStore.getState().setColumnVisibility('col-1', false);
      useFieldsStore.getState().setColumnVisibility('col-1', true);
      expect(useFieldsStore.getState().hiddenColumnIds.has('col-1')).toBe(false);
    });
  });

  describe('visibleColumns', () => {
    it('filters out hidden columns', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a' }), makeCol({ id: 'b' })]);
      useFieldsStore.getState().setColumnVisibility('a', false);
      const visible = useFieldsStore.getState().visibleColumns();
      expect(visible).toHaveLength(1);
      expect(visible[0].id).toBe('b');
    });

    it('returns all when none hidden', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a' }), makeCol({ id: 'b' })]);
      expect(useFieldsStore.getState().visibleColumns()).toHaveLength(2);
    });
  });

  describe('getVisibleColumns', () => {
    it('without columnMeta filters by isHidden', () => {
      useFieldsStore.getState().setAllColumns([
        makeCol({ id: 'a', isHidden: false }),
        makeCol({ id: 'b', isHidden: true }),
      ]);
      const result = useFieldsStore.getState().getVisibleColumns();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });

    it('with columnMeta respects hidden flag', () => {
      useFieldsStore.getState().setAllColumns([
        makeCol({ id: 'a', order: 1 }),
        makeCol({ id: 'b', order: 2 }),
      ]);
      const meta = JSON.stringify({ a: { order: 2 }, b: { order: 1, hidden: true } });
      const result = useFieldsStore.getState().getVisibleColumns(meta);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('a');
    });

    it('with columnMeta sorts by order', () => {
      useFieldsStore.getState().setAllColumns([
        makeCol({ id: 'a', order: 0 }),
        makeCol({ id: 'b', order: 1 }),
        makeCol({ id: 'c', order: 2 }),
      ]);
      const meta = JSON.stringify({ a: { order: 3 }, b: { order: 1 }, c: { order: 2 } });
      const result = useFieldsStore.getState().getVisibleColumns(meta);
      expect(result.map((r) => r.id)).toEqual(['b', 'c', 'a']);
    });

    it('with invalid columnMeta JSON falls back to isHidden', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a' })]);
      const result = useFieldsStore.getState().getVisibleColumns('invalid json');
      expect(result).toHaveLength(1);
    });
  });

  describe('enrichment groups', () => {
    it('toggleEnrichmentGroupCollapse adds/removes from set', () => {
      useFieldsStore.getState().toggleEnrichmentGroupCollapse('parent-1');
      expect(useFieldsStore.getState().isEnrichmentGroupCollapsed('parent-1')).toBe(true);
      useFieldsStore.getState().toggleEnrichmentGroupCollapse('parent-1');
      expect(useFieldsStore.getState().isEnrichmentGroupCollapsed('parent-1')).toBe(false);
    });

    it('getEnrichmentGroupMap returns mapping', () => {
      useFieldsStore.getState().setAllColumns([
        makeCol({
          id: 'enrich-1',
          rawType: 'ENRICHMENT',
          type: 'Enrichment',
          fieldsToEnrich: [{ dbFieldName: 'child-1' }, { dbFieldName: 'child-2' }],
        }),
        makeCol({ id: 'child-1' }),
        makeCol({ id: 'child-2' }),
      ]);
      const map = useFieldsStore.getState().getEnrichmentGroupMap();
      expect(map.get('enrich-1')).toEqual(['child-1', 'child-2']);
    });

    it('getEnrichmentGroupMap returns empty map when no enrichment columns', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a' })]);
      expect(useFieldsStore.getState().getEnrichmentGroupMap().size).toBe(0);
    });

    it('getEnrichmentParentId finds parent', () => {
      useFieldsStore.getState().setAllColumns([
        makeCol({
          id: 'enrich-1',
          rawType: 'ENRICHMENT',
          type: 'Enrichment',
          fieldsToEnrich: [{ dbFieldName: 'child-1' }],
        }),
        makeCol({ id: 'child-1' }),
      ]);
      expect(useFieldsStore.getState().getEnrichmentParentId('child-1')).toBe('enrich-1');
    });

    it('getEnrichmentParentId returns null for non-child', () => {
      useFieldsStore.getState().setAllColumns([makeCol({ id: 'a' })]);
      expect(useFieldsStore.getState().getEnrichmentParentId('a')).toBeNull();
    });
  });

  describe('clearFields', () => {
    it('resets columns, hidden, collapsed, error', () => {
      useFieldsStore.getState().setAllColumns([makeCol()]);
      useFieldsStore.getState().setColumnVisibility('col-1', false);
      useFieldsStore.setState({ error: 'some error' });
      useFieldsStore.getState().clearFields();
      const state = useFieldsStore.getState();
      expect(state.allColumns).toEqual([]);
      expect(state.hiddenColumnIds.size).toBe(0);
      expect(state.collapsedEnrichmentGroups.size).toBe(0);
      expect(state.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears error', () => {
      useFieldsStore.setState({ error: 'err' });
      useFieldsStore.getState().clearError();
      expect(useFieldsStore.getState().error).toBeNull();
    });
  });
});
