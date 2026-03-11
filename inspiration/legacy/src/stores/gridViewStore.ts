// Grid View Store - Inspired by Teable
// Phase 1: Foundation - Zustand store for grid view state and context menus
// Reference: teable/packages/sdk/src/components/grid-enhancements/store/useGridViewStore.ts

import { create } from "zustand";
import type { CombinedSelection } from "@/managers/selection-manager";
import type { IHeaderMenu, IRecordMenu } from "@/types/contextMenu";

interface IGridViewState {
	// Selection state
	selection?: CombinedSelection;
	// Context menu states
	headerMenu?: IHeaderMenu;
	recordMenu?: IRecordMenu;
	// Actions
	openHeaderMenu: (props: IHeaderMenu) => void;
	closeHeaderMenu: () => void;
	openRecordMenu: (props: IRecordMenu) => void;
	closeRecordMenu: () => void;
	setSelection: (props: CombinedSelection) => void;
}

export const useGridViewStore = create<IGridViewState>((set) => ({
	// Open header menu (column context menu)
	openHeaderMenu: (props) => {
		set((state) => ({
			...state,
			headerMenu: props,
		}));
	},
	// Close header menu
	closeHeaderMenu: () => {
		set((state) => {
			if (state.headerMenu == null) {
				return state;
			}
			return {
				...state,
				headerMenu: undefined,
			};
		});
	},
	// Open record menu (row/cell context menu)
	openRecordMenu: (props) => {
		set((state) => ({
			...state,
			recordMenu: props,
		}));
	},
	// Close record menu
	closeRecordMenu: () => {
		set((state) => {
			if (state.recordMenu == null) {
				return state;
			}
			return {
				...state,
				recordMenu: undefined,
			};
		});
	},
	// Set selection
	setSelection: (props) => {
		set((state) => ({
			...state,
			selection: props,
		}));
	},
}));
