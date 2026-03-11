// Phase 1: Hook for collapsed group state (like Teable)
// Reference: teable/packages/sdk/src/components/grid-enhancements/hooks/use-grid-collapsed-group.ts

import { useCallback, useMemo } from "react";
import { useGridCollapsedGroupStore } from "@/stores/useGridCollapsedGroupStore";

/**
 * Hook to manage collapsed group state for a specific view
 * @param cacheKey - Unique key for this view (e.g., "tableId_viewId")
 * @returns collapsedGroupIds Set and onCollapsedGroupChanged callback
 */
export const useGridCollapsedGroup = (cacheKey: string) => {
	const { collapsedGroupMap, setCollapsedGroupMap } = useGridCollapsedGroupStore();

	// Convert array from store to Set (like Teable)
	// Use stringified array for dependency tracking to ensure updates are detected
	const collapsedGroupIdsArray = collapsedGroupMap?.[cacheKey];
	const collapsedGroupIdsArrayKey = collapsedGroupIdsArray
		? JSON.stringify(collapsedGroupIdsArray.sort())
		: "";

	const collapsedGroupIds = useMemo(() => {
		return collapsedGroupIdsArray?.length
			? new Set(collapsedGroupIdsArray)
			: null;
	}, [collapsedGroupIdsArrayKey]); // Use string key for reliable dependency tracking

	// Callback to update collapsed groups (like Teable)
	// This is called from InteractionLayer with a new Set
	const onCollapsedGroupChanged = useCallback(
		(groupIds: Set<string>) => {
			setCollapsedGroupMap(cacheKey, [...groupIds]);
		},
		[cacheKey, setCollapsedGroupMap],
	);

	return useMemo(
		() => ({
			collapsedGroupIds,
			onCollapsedGroupChanged,
		}),
		[collapsedGroupIds, onCollapsedGroupChanged],
	);
};

