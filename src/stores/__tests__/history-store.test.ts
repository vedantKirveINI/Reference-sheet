import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore, HistoryAction } from '../history-store';

function makeAction(overrides: Partial<HistoryAction> = {}): HistoryAction {
  return {
    type: 'cell_change',
    timestamp: Date.now(),
    data: { value: 'new' },
    undo: { value: 'old' },
    ...overrides,
  };
}

function resetStore() {
  useHistoryStore.setState({
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
  });
}

describe('useHistoryStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('has empty stacks', () => {
      const s = useHistoryStore.getState();
      expect(s.undoStack).toEqual([]);
      expect(s.redoStack).toEqual([]);
      expect(s.canUndo).toBe(false);
      expect(s.canRedo).toBe(false);
    });
  });

  describe('pushAction', () => {
    it('adds to undoStack and clears redoStack', () => {
      const action = makeAction();
      useHistoryStore.getState().pushAction(action);
      const s = useHistoryStore.getState();
      expect(s.undoStack).toHaveLength(1);
      expect(s.canUndo).toBe(true);
      expect(s.redoStack).toEqual([]);
      expect(s.canRedo).toBe(false);
    });

    it('limits undoStack to 50 items', () => {
      for (let i = 0; i < 55; i++) {
        useHistoryStore.getState().pushAction(makeAction({ timestamp: i }));
      }
      expect(useHistoryStore.getState().undoStack).toHaveLength(50);
      expect(useHistoryStore.getState().undoStack[0].timestamp).toBe(5);
    });
  });

  describe('undo', () => {
    it('returns null when undoStack is empty', () => {
      const result = useHistoryStore.getState().undo();
      expect(result).toBeNull();
    });

    it('pops from undoStack and pushes to redoStack', () => {
      const action = makeAction();
      useHistoryStore.getState().pushAction(action);
      const result = useHistoryStore.getState().undo();
      expect(result).toEqual(action);
      const s = useHistoryStore.getState();
      expect(s.undoStack).toHaveLength(0);
      expect(s.redoStack).toHaveLength(1);
      expect(s.canUndo).toBe(false);
      expect(s.canRedo).toBe(true);
    });

    it('multiple undo operations work correctly', () => {
      const a1 = makeAction({ timestamp: 1 });
      const a2 = makeAction({ timestamp: 2 });
      useHistoryStore.getState().pushAction(a1);
      useHistoryStore.getState().pushAction(a2);
      expect(useHistoryStore.getState().undo()).toEqual(a2);
      expect(useHistoryStore.getState().undo()).toEqual(a1);
      expect(useHistoryStore.getState().canUndo).toBe(false);
      expect(useHistoryStore.getState().canRedo).toBe(true);
    });
  });

  describe('redo', () => {
    it('returns null when redoStack is empty', () => {
      expect(useHistoryStore.getState().redo()).toBeNull();
    });

    it('pops from redoStack and pushes to undoStack', () => {
      const action = makeAction();
      useHistoryStore.getState().pushAction(action);
      useHistoryStore.getState().undo();
      const result = useHistoryStore.getState().redo();
      expect(result).toEqual(action);
      const s = useHistoryStore.getState();
      expect(s.undoStack).toHaveLength(1);
      expect(s.redoStack).toHaveLength(0);
      expect(s.canUndo).toBe(true);
      expect(s.canRedo).toBe(false);
    });
  });

  describe('undo/redo interplay', () => {
    it('push clears redo stack', () => {
      useHistoryStore.getState().pushAction(makeAction({ timestamp: 1 }));
      useHistoryStore.getState().undo();
      expect(useHistoryStore.getState().canRedo).toBe(true);
      useHistoryStore.getState().pushAction(makeAction({ timestamp: 2 }));
      expect(useHistoryStore.getState().canRedo).toBe(false);
      expect(useHistoryStore.getState().redoStack).toEqual([]);
    });

    it('redo stack is limited to 50', () => {
      for (let i = 0; i < 55; i++) {
        useHistoryStore.getState().pushAction(makeAction({ timestamp: i }));
      }
      for (let i = 0; i < 50; i++) {
        useHistoryStore.getState().undo();
      }
      expect(useHistoryStore.getState().redoStack.length).toBeLessThanOrEqual(50);
    });
  });
});
