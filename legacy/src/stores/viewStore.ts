// Zustand View Store - Manages view state
// Inspired by Teable's view management system
import { create } from "zustand";
import type {
	IView,
	ICreateViewPayload,
	IRenameViewPayload,
	IDeleteViewPayload,
} from "@/types/view";

interface ViewState {
	// State
	views: IView[];
	currentViewId: string | null;
	loading: boolean;
	error: string | null;

	// Actions
	setViews: (views: IView[]) => void;
	fetchViews: (tableId: string, baseId: string) => Promise<void>;
	addView: (view: IView) => void;
	createView: (payload: ICreateViewPayload) => Promise<IView | null>;
	updateView: (viewId: string, updatedView: IView) => void;
	renameView: (viewId: string, newName: string) => Promise<void>;
	setCurrentView: (viewId: string) => void;
	removeView: (viewId: string) => void;
	deleteView: (viewId: string) => Promise<void>;
	preventLastViewDeletion: () => boolean;
	clearError: () => void;
}

export const useViewStore = create<ViewState>((set, get) => ({
	// Initial state
	views: [],
	currentViewId: null,
	loading: false,
	error: null,

	// Fetch views from API
	// Note: This should be called from a component using the useViews hook
	// This is just a setter for the views array
	setViews: (views: IView[]) => {
		set({ views });
	},
	fetchViews: async (tableId: string, baseId: string) => {
		// This is a placeholder - actual fetching should be done in component
		// using useViews hook and then calling setViews
		set({ loading: true, error: null });
	},

	// Add view to store (called after successful API call)
	addView: (view: IView) => {
		set((state) => ({
			views: [...state.views, view],
			currentViewId: view.id,
		}));
	},
	// Create new view - placeholder, actual creation done in component
	createView: async (payload: ICreateViewPayload) => {
		set({ loading: true, error: null });
	},

	// Update view in store (called after successful API call)
	updateView: (viewId: string, updatedView: IView) => {
		set((state) => ({
			views: state.views.map((view) =>
				view.id === viewId ? updatedView : view,
			),
		}));
	},
	// Rename view - placeholder, actual rename done in component
	renameView: async (viewId: string, newName: string) => {
		set({ loading: true, error: null });
	},

	// Set current view (updates URL)
	setCurrentView: (viewId: string) => {
		set({ currentViewId: viewId });
		// URL update will be handled in MainPage integration
	},

	// Remove view from store (called after successful API call)
	removeView: (viewId: string) => {
		set((state) => {
			const newViews = state.views.filter((view) => view.id !== viewId);
			const newCurrentViewId =
				state.currentViewId === viewId
					? newViews.length > 0
						? newViews[0].id
						: null
					: state.currentViewId;
			return {
				views: newViews,
				currentViewId: newCurrentViewId,
			};
		});
	},
	// Delete view - placeholder, actual delete done in component
	deleteView: async (viewId: string) => {
		// Check if this is the last view
		if (get().preventLastViewDeletion()) {
			set({
				error: "Cannot delete the last remaining view",
			});
			return;
		}
		set({ loading: true, error: null });
	},

	// Check if view can be deleted (prevent if last view)
	preventLastViewDeletion: () => {
		const { views } = get();
		return views.length <= 1;
	},

	// Clear error
	clearError: () => {
		set({ error: null });
	},
}));

