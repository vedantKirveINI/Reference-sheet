// Phase 1: Zustand store for playground state
// Reference: teable/packages/sdk/src/components/grid-enhancements/hooks/use-grid-collapsed-group.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IGroupConfig } from "@/types/grouping";

interface GroupByPlaygroundState {
	// Group configuration
	groupConfig: IGroupConfig | null;
	setGroupConfig: (config: IGroupConfig | null) => void;

	// Reset function
	reset: () => void;
}

const defaultState = {
	groupConfig: null,
};

export const useGroupByPlaygroundStore = create<GroupByPlaygroundState>()(
	persist(
		(set) => ({
			...defaultState,

			setGroupConfig: (config) => set({ groupConfig: config }),

			reset: () => set(defaultState),
		}),
		{
			name: "group-by-playground-state",
			// Only persist groupConfig (collapsed groups are in separate store)
			partialize: (state) => ({
				groupConfig: state.groupConfig,
			}),
		},
	),
);

