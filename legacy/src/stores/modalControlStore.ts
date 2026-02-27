/**
 * Modal Control Store
 * Zustand store for programmatically controlling Sort/Filter/GroupBy modals
 */

import { create } from "zustand";

interface SortModalState {
	isOpen: boolean;
	initialSort: any;
	fields: any[];
}

interface FilterModalState {
	isOpen: boolean;
	initialFilter: any;
	fields: any[];
}

interface GroupByModalState {
	isOpen: boolean;
	initialGroupBy: any;
	fields: any[];
}

interface ModalControlState {
	sortModalState: SortModalState;
	filterModalState: FilterModalState;
	groupByModalState: GroupByModalState;
	openSortModal: (initialSort: any, fields: any[]) => void;
	closeSortModal: () => void;
	openFilterModal: (initialFilter: any, fields: any[]) => void;
	closeFilterModal: () => void;
	openGroupByModal: (initialGroupBy: any, fields: any[]) => void;
	closeGroupByModal: () => void;
}

export const useModalControlStore = create<ModalControlState>((set) => ({
	sortModalState: {
		isOpen: false,
		initialSort: null,
		fields: [],
	},
	filterModalState: {
		isOpen: false,
		initialFilter: null,
		fields: [],
	},
	groupByModalState: {
		isOpen: false,
		initialGroupBy: null,
		fields: [],
	},
	openSortModal: (initialSort, fields) => {
		set((state) => {
			// If modal is already open, ignore the action
			if (state.sortModalState.isOpen) {
				return state;
			}
			return {
				sortModalState: {
					isOpen: true,
					initialSort,
					fields,
				},
			};
		});
	},
	closeSortModal: () => {
		set({
			sortModalState: {
				isOpen: false,
				initialSort: null,
				fields: [],
			},
		});
	},
	openFilterModal: (initialFilter, fields) => {
		set((state) => {
			// If modal is already open, ignore the action
			if (state.filterModalState.isOpen) {
				return state;
			}
			return {
				filterModalState: {
					isOpen: true,
					initialFilter,
					fields,
				},
			};
		});
	},
	closeFilterModal: () => {
		set({
			filterModalState: {
				isOpen: false,
				initialFilter: null,
				fields: [],
			},
		});
	},
	openGroupByModal: (initialGroupBy, fields) => {
		set((state) => {
			// If modal is already open, ignore the action
			if (state.groupByModalState.isOpen) {
				return state;
			}
			return {
				groupByModalState: {
					isOpen: true,
					initialGroupBy,
					fields,
				},
			};
		});
	},
	closeGroupByModal: () => {
		set({
			groupByModalState: {
				isOpen: false,
				initialGroupBy: null,
				fields: [],
			},
		});
	},
}));
