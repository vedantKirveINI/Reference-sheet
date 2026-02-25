import { describe, it, expect, beforeEach } from 'vitest';
import { useViewStore } from '../view-store';
import { ViewType } from '@/types';

function makeView(overrides: Record<string, any> = {}) {
  return {
    id: 'v1',
    user_id: 'u1',
    name: 'Grid View',
    tableId: 't1',
    type: ViewType.Grid,
    ...overrides,
  };
}

function resetStore() {
  useViewStore.setState({
    views: [],
    currentViewId: null,
    loading: false,
    error: null,
  });
}

describe('useViewStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('has empty views', () => {
      expect(useViewStore.getState().views).toEqual([]);
    });
    it('currentViewId is null', () => {
      expect(useViewStore.getState().currentViewId).toBeNull();
    });
    it('error is null', () => {
      expect(useViewStore.getState().error).toBeNull();
    });
  });

  describe('setViews', () => {
    it('sets views array', () => {
      const views = [makeView({ id: 'v1' }), makeView({ id: 'v2' })];
      useViewStore.getState().setViews(views);
      expect(useViewStore.getState().views).toHaveLength(2);
    });
  });

  describe('addView', () => {
    it('appends a view', () => {
      useViewStore.getState().setViews([makeView({ id: 'v1' })]);
      useViewStore.getState().addView(makeView({ id: 'v2', name: 'Kanban View' }));
      expect(useViewStore.getState().views).toHaveLength(2);
      expect(useViewStore.getState().views[1].id).toBe('v2');
    });
  });

  describe('updateView', () => {
    it('updates view by id', () => {
      useViewStore.getState().setViews([makeView({ id: 'v1', name: 'Old' })]);
      useViewStore.getState().updateView('v1', { name: 'New' });
      expect(useViewStore.getState().views[0].name).toBe('New');
    });

    it('does not affect other views', () => {
      useViewStore.getState().setViews([makeView({ id: 'v1' }), makeView({ id: 'v2', name: 'V2' })]);
      useViewStore.getState().updateView('v1', { name: 'Updated' });
      expect(useViewStore.getState().views[1].name).toBe('V2');
    });
  });

  describe('removeView', () => {
    it('removes a view and returns true', () => {
      useViewStore.getState().setViews([makeView({ id: 'v1' }), makeView({ id: 'v2' })]);
      const result = useViewStore.getState().removeView('v1');
      expect(result).toBe(true);
      expect(useViewStore.getState().views).toHaveLength(1);
    });

    it('cannot delete the last view, returns false and sets error', () => {
      useViewStore.getState().setViews([makeView({ id: 'v1' })]);
      const result = useViewStore.getState().removeView('v1');
      expect(result).toBe(false);
      expect(useViewStore.getState().error).toBe('Cannot delete the last view');
      expect(useViewStore.getState().views).toHaveLength(1);
    });

    it('switches currentViewId if current view is deleted', () => {
      useViewStore.getState().setViews([makeView({ id: 'v1' }), makeView({ id: 'v2' })]);
      useViewStore.getState().setCurrentView('v1');
      useViewStore.getState().removeView('v1');
      expect(useViewStore.getState().currentViewId).toBe('v2');
    });

    it('keeps currentViewId if non-current view is deleted', () => {
      useViewStore.getState().setViews([makeView({ id: 'v1' }), makeView({ id: 'v2' })]);
      useViewStore.getState().setCurrentView('v1');
      useViewStore.getState().removeView('v2');
      expect(useViewStore.getState().currentViewId).toBe('v1');
    });
  });

  describe('setCurrentView', () => {
    it('sets currentViewId', () => {
      useViewStore.getState().setCurrentView('v1');
      expect(useViewStore.getState().currentViewId).toBe('v1');
    });

    it('can set to null', () => {
      useViewStore.getState().setCurrentView('v1');
      useViewStore.getState().setCurrentView(null);
      expect(useViewStore.getState().currentViewId).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears error', () => {
      useViewStore.setState({ error: 'some error' });
      useViewStore.getState().clearError();
      expect(useViewStore.getState().error).toBeNull();
    });
  });
});
