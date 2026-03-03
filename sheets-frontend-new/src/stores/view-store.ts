import { create } from "zustand";
import { IView } from "@/types";

interface ViewState {
  views: IView[];
  currentViewId: string | null;
  loading: boolean;
  error: string | null;

  setViews: (views: IView[]) => void;
  addView: (view: IView) => void;
  updateView: (id: string, updates: Partial<IView>) => void;
  removeView: (id: string) => boolean;
  setCurrentView: (id: string | null) => void;
  clearError: () => void;
}

export const useViewStore = create<ViewState>()((set, get) => ({
  views: [],
  currentViewId: null,
  loading: false,
  error: null,

  setViews: (views) => set({ views }),

  addView: (view) =>
    set((state) => ({ views: [...state.views, view] })),

  updateView: (id, updates) =>
    set((state) => ({
      views: state.views.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    })),

  removeView: (id) => {
    const { views } = get();
    if (views.length <= 1) {
      set({ error: "Cannot delete the last view" });
      return false;
    }
    set((state) => {
      const newViews = state.views.filter((v) => v.id !== id);
      const newCurrentViewId =
        state.currentViewId === id
          ? newViews[0]?.id ?? null
          : state.currentViewId;
      return { views: newViews, currentViewId: newCurrentViewId };
    });
    return true;
  },

  setCurrentView: (id) => set({ currentViewId: id }),

  clearError: () => set({ error: null }),
}));
