import { describe, it, expect, beforeEach } from 'vitest';
import { useGridViewStore } from '../grid-view-store';

function resetStore() {
  useGridViewStore.setState({
    selection: null,
    headerMenu: null,
    recordMenu: null,
    selectedRows: new Set<number>(),
    expandedRecordId: null,
    commentSidebarRecordId: null,
    commentSidebarOpen: false,
    linkedRecordStack: [],
    linkedRecordModalOpen: false,
  });
}

describe('useGridViewStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('has null selection', () => {
      expect(useGridViewStore.getState().selection).toBeNull();
    });
    it('has null headerMenu', () => {
      expect(useGridViewStore.getState().headerMenu).toBeNull();
    });
    it('has null recordMenu', () => {
      expect(useGridViewStore.getState().recordMenu).toBeNull();
    });
    it('has empty selectedRows', () => {
      expect(useGridViewStore.getState().selectedRows.size).toBe(0);
    });
    it('has null expandedRecordId', () => {
      expect(useGridViewStore.getState().expandedRecordId).toBeNull();
    });
    it('commentSidebarOpen is false', () => {
      expect(useGridViewStore.getState().commentSidebarOpen).toBe(false);
    });
  });

  describe('selection', () => {
    it('setSelection updates selection', () => {
      const sel = { start: { row: 0, col: 0 }, end: { row: 1, col: 1 } };
      useGridViewStore.getState().setSelection(sel);
      expect(useGridViewStore.getState().selection).toEqual(sel);
    });
  });

  describe('headerMenu', () => {
    it('openHeaderMenu sets menu and clears recordMenu', () => {
      useGridViewStore.setState({ recordMenu: { x: 10, y: 10, recordId: 'r1', rowIndex: 0 } as any });
      const menu = { x: 100, y: 200, columnId: 'c1', columnIndex: 0 } as any;
      useGridViewStore.getState().openHeaderMenu(menu);
      expect(useGridViewStore.getState().headerMenu).toEqual(menu);
      expect(useGridViewStore.getState().recordMenu).toBeNull();
    });

    it('closeHeaderMenu clears menu', () => {
      useGridViewStore.getState().openHeaderMenu({ x: 0, y: 0, columnId: 'c1', columnIndex: 0 } as any);
      useGridViewStore.getState().closeHeaderMenu();
      expect(useGridViewStore.getState().headerMenu).toBeNull();
    });
  });

  describe('recordMenu', () => {
    it('openRecordMenu sets menu and clears headerMenu', () => {
      useGridViewStore.setState({ headerMenu: { x: 0, y: 0, columnId: 'c1', columnIndex: 0 } as any });
      const menu = { x: 10, y: 20, recordId: 'r1', rowIndex: 0 } as any;
      useGridViewStore.getState().openRecordMenu(menu);
      expect(useGridViewStore.getState().recordMenu).toEqual(menu);
      expect(useGridViewStore.getState().headerMenu).toBeNull();
    });

    it('closeRecordMenu clears menu', () => {
      useGridViewStore.getState().openRecordMenu({ x: 0, y: 0, recordId: 'r1', rowIndex: 0 } as any);
      useGridViewStore.getState().closeRecordMenu();
      expect(useGridViewStore.getState().recordMenu).toBeNull();
    });
  });

  describe('selectedRows', () => {
    it('setSelectedRows sets rows', () => {
      const rows = new Set([1, 2, 3]);
      useGridViewStore.getState().setSelectedRows(rows);
      expect(useGridViewStore.getState().selectedRows).toEqual(rows);
    });

    it('clearSelectedRows empties set', () => {
      useGridViewStore.getState().setSelectedRows(new Set([1, 2]));
      useGridViewStore.getState().clearSelectedRows();
      expect(useGridViewStore.getState().selectedRows.size).toBe(0);
    });
  });

  describe('expandedRecordId', () => {
    it('setExpandedRecordId sets id', () => {
      useGridViewStore.getState().setExpandedRecordId('rec-1');
      expect(useGridViewStore.getState().expandedRecordId).toBe('rec-1');
    });

    it('setExpandedRecordId null clears id', () => {
      useGridViewStore.getState().setExpandedRecordId('rec-1');
      useGridViewStore.getState().setExpandedRecordId(null);
      expect(useGridViewStore.getState().expandedRecordId).toBeNull();
    });
  });

  describe('commentSidebar', () => {
    it('setCommentSidebarRecordId sets id and opens sidebar', () => {
      useGridViewStore.getState().setCommentSidebarRecordId('rec-1');
      expect(useGridViewStore.getState().commentSidebarRecordId).toBe('rec-1');
      expect(useGridViewStore.getState().commentSidebarOpen).toBe(true);
    });

    it('setCommentSidebarRecordId null closes sidebar', () => {
      useGridViewStore.getState().setCommentSidebarRecordId('rec-1');
      useGridViewStore.getState().setCommentSidebarRecordId(null);
      expect(useGridViewStore.getState().commentSidebarRecordId).toBeNull();
      expect(useGridViewStore.getState().commentSidebarOpen).toBe(false);
    });

    it('setCommentSidebarOpen directly sets open', () => {
      useGridViewStore.getState().setCommentSidebarOpen(true);
      expect(useGridViewStore.getState().commentSidebarOpen).toBe(true);
    });
  });

  describe('linkedRecordStack', () => {
    const item1 = { foreignTableId: 't1', recordId: 1, title: 'Rec 1' };
    const item2 = { foreignTableId: 't2', recordId: 2, title: 'Rec 2' };

    it('openLinkedRecord sets stack with one item and opens modal', () => {
      useGridViewStore.getState().openLinkedRecord(item1);
      expect(useGridViewStore.getState().linkedRecordStack).toEqual([item1]);
      expect(useGridViewStore.getState().linkedRecordModalOpen).toBe(true);
    });

    it('pushLinkedRecord appends to stack', () => {
      useGridViewStore.getState().openLinkedRecord(item1);
      useGridViewStore.getState().pushLinkedRecord(item2);
      expect(useGridViewStore.getState().linkedRecordStack).toEqual([item1, item2]);
    });

    it('popLinkedRecord removes last item', () => {
      useGridViewStore.getState().openLinkedRecord(item1);
      useGridViewStore.getState().pushLinkedRecord(item2);
      useGridViewStore.getState().popLinkedRecord();
      expect(useGridViewStore.getState().linkedRecordStack).toEqual([item1]);
    });

    it('popLinkedRecord does not pop below 1 item', () => {
      useGridViewStore.getState().openLinkedRecord(item1);
      useGridViewStore.getState().popLinkedRecord();
      expect(useGridViewStore.getState().linkedRecordStack).toEqual([item1]);
    });

    it('closeLinkedRecordModal clears stack and closes modal', () => {
      useGridViewStore.getState().openLinkedRecord(item1);
      useGridViewStore.getState().closeLinkedRecordModal();
      expect(useGridViewStore.getState().linkedRecordStack).toEqual([]);
      expect(useGridViewStore.getState().linkedRecordModalOpen).toBe(false);
    });
  });
});
