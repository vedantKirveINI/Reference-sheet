import { describe, it, expect, beforeEach } from 'vitest';
import { useModalControlStore } from '../modal-control-store';

function resetStore() {
  useModalControlStore.setState({
    sort: { isOpen: false, initialData: null, fields: [] },
    filter: { isOpen: false, initialData: null, fields: [] },
    groupBy: { isOpen: false, initialData: null, fields: [] },
    hideFields: false,
    exportModal: false,
    importModal: false,
    importModalMode: 'existing',
    shareModal: false,
  });
}

describe('useModalControlStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('all modals are closed', () => {
      const s = useModalControlStore.getState();
      expect(s.sort.isOpen).toBe(false);
      expect(s.filter.isOpen).toBe(false);
      expect(s.groupBy.isOpen).toBe(false);
      expect(s.hideFields).toBe(false);
      expect(s.exportModal).toBe(false);
      expect(s.importModal).toBe(false);
      expect(s.shareModal).toBe(false);
    });
  });

  describe('sort modal', () => {
    it('openSort opens with data and fields', () => {
      const data = [{ field: 'name', direction: 'asc' }];
      const fields = [{ id: 'f1', name: 'Name' }] as any;
      useModalControlStore.getState().openSort(data, fields);
      const s = useModalControlStore.getState();
      expect(s.sort.isOpen).toBe(true);
      expect(s.sort.initialData).toEqual(data);
      expect(s.sort.fields).toEqual(fields);
    });

    it('openSort does not reopen if already open', () => {
      useModalControlStore.getState().openSort({ a: 1 });
      useModalControlStore.getState().openSort({ b: 2 });
      expect(useModalControlStore.getState().sort.initialData).toEqual({ a: 1 });
    });

    it('closeSort resets sort state', () => {
      useModalControlStore.getState().openSort({ a: 1 });
      useModalControlStore.getState().closeSort();
      const s = useModalControlStore.getState();
      expect(s.sort.isOpen).toBe(false);
      expect(s.sort.initialData).toBeNull();
      expect(s.sort.fields).toEqual([]);
    });

    it('openSort with no args uses defaults', () => {
      useModalControlStore.getState().openSort();
      const s = useModalControlStore.getState();
      expect(s.sort.isOpen).toBe(true);
      expect(s.sort.initialData).toBeNull();
      expect(s.sort.fields).toEqual([]);
    });
  });

  describe('filter modal', () => {
    it('openFilter / closeFilter', () => {
      useModalControlStore.getState().openFilter({ op: 'eq' });
      expect(useModalControlStore.getState().filter.isOpen).toBe(true);
      useModalControlStore.getState().closeFilter();
      expect(useModalControlStore.getState().filter.isOpen).toBe(false);
    });

    it('openFilter does not reopen if already open', () => {
      useModalControlStore.getState().openFilter({ a: 1 });
      useModalControlStore.getState().openFilter({ b: 2 });
      expect(useModalControlStore.getState().filter.initialData).toEqual({ a: 1 });
    });
  });

  describe('groupBy modal', () => {
    it('openGroupBy / closeGroupBy', () => {
      useModalControlStore.getState().openGroupBy({ field: 'status' });
      expect(useModalControlStore.getState().groupBy.isOpen).toBe(true);
      useModalControlStore.getState().closeGroupBy();
      expect(useModalControlStore.getState().groupBy.isOpen).toBe(false);
    });

    it('openGroupBy does not reopen if already open', () => {
      useModalControlStore.getState().openGroupBy({ a: 1 });
      useModalControlStore.getState().openGroupBy({ b: 2 });
      expect(useModalControlStore.getState().groupBy.initialData).toEqual({ a: 1 });
    });
  });

  describe('hideFields', () => {
    it('toggleHideFields flips state', () => {
      useModalControlStore.getState().toggleHideFields();
      expect(useModalControlStore.getState().hideFields).toBe(true);
      useModalControlStore.getState().toggleHideFields();
      expect(useModalControlStore.getState().hideFields).toBe(false);
    });

    it('openHideFields sets true', () => {
      useModalControlStore.getState().openHideFields();
      expect(useModalControlStore.getState().hideFields).toBe(true);
    });

    it('closeHideFields sets false', () => {
      useModalControlStore.getState().openHideFields();
      useModalControlStore.getState().closeHideFields();
      expect(useModalControlStore.getState().hideFields).toBe(false);
    });
  });

  describe('exportModal', () => {
    it('open/close', () => {
      useModalControlStore.getState().openExportModal();
      expect(useModalControlStore.getState().exportModal).toBe(true);
      useModalControlStore.getState().closeExportModal();
      expect(useModalControlStore.getState().exportModal).toBe(false);
    });
  });

  describe('importModal', () => {
    it('open with default mode', () => {
      useModalControlStore.getState().openImportModal();
      expect(useModalControlStore.getState().importModal).toBe(true);
      expect(useModalControlStore.getState().importModalMode).toBe('existing');
    });

    it('open with new mode', () => {
      useModalControlStore.getState().openImportModal('new');
      expect(useModalControlStore.getState().importModalMode).toBe('new');
    });

    it('close resets mode to existing', () => {
      useModalControlStore.getState().openImportModal('new');
      useModalControlStore.getState().closeImportModal();
      expect(useModalControlStore.getState().importModal).toBe(false);
      expect(useModalControlStore.getState().importModalMode).toBe('existing');
    });
  });

  describe('shareModal', () => {
    it('open/close', () => {
      useModalControlStore.getState().openShareModal();
      expect(useModalControlStore.getState().shareModal).toBe(true);
      useModalControlStore.getState().closeShareModal();
      expect(useModalControlStore.getState().shareModal).toBe(false);
    });
  });
});
