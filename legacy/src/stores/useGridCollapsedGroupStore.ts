// Phase 1: View-scoped collapsed group store (like Teable)
// Reference: teable/packages/sdk/src/components/grid-enhancements/store/useGridCollapsedGroupStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IGridCollapsedGroupState {
	collapsedGroupMap: Record<string, string[]>;
	setCollapsedGroupMap: (key: string, groupIds: string[]) => void;
	clearCollapsedGroups: (key: string) => void;
}

export const useGridCollapsedGroupStore = create<IGridCollapsedGroupState>()(
	persist(
		(set, get) => ({
			collapsedGroupMap: {},
		setCollapsedGroupMap: (key: string, groupIds: string[]) => {
			set({
				collapsedGroupMap: {
					...get().collapsedGroupMap,
					[key]: groupIds,
				},
			});
		},
		clearCollapsedGroups: (key: string) => {
			set({
				collapsedGroupMap: {
					...get().collapsedGroupMap,
					[key]: [],
				},
			});
		},
		}),
		{
			name: "view-grid-collapsed-group", // LocalStorage key
		},
	),
);

