import { create } from "zustand";

const MAX_STACK_SIZE = 50;

export type ActionType = 'cell_change' | 'row_add' | 'row_delete' | 'column_add' | 'column_delete' | 'row_duplicate';

export interface HistoryAction {
  type: ActionType;
  timestamp: number;
  data: any;
  undo: any;
}

interface HistoryState {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
  canUndo: boolean;
  canRedo: boolean;
  pushAction: (action: HistoryAction) => void;
  undo: () => HistoryAction | null;
  redo: () => HistoryAction | null;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  pushAction: (action) => {
    set((state) => {
      const newStack = [...state.undoStack, action];
      if (newStack.length > MAX_STACK_SIZE) {
        newStack.shift();
      }
      return {
        undoStack: newStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { undoStack } = get();
    if (undoStack.length === 0) return null;

    const action = undoStack[undoStack.length - 1];
    set((state) => {
      const newUndoStack = state.undoStack.slice(0, -1);
      const newRedoStack = [...state.redoStack, action];
      if (newRedoStack.length > MAX_STACK_SIZE) {
        newRedoStack.shift();
      }
      return {
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        canUndo: newUndoStack.length > 0,
        canRedo: true,
      };
    });

    return action;
  },

  redo: () => {
    const { redoStack } = get();
    if (redoStack.length === 0) return null;

    const action = redoStack[redoStack.length - 1];
    set((state) => {
      const newRedoStack = state.redoStack.slice(0, -1);
      const newUndoStack = [...state.undoStack, action];
      if (newUndoStack.length > MAX_STACK_SIZE) {
        newUndoStack.shift();
      }
      return {
        undoStack: newUndoStack,
        redoStack: newRedoStack,
        canUndo: true,
        canRedo: newRedoStack.length > 0,
      };
    });

    return action;
  },
}));
