import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import type { Socket } from "socket.io-client";
import useRequest from "@/hooks/useRequest";
import getSocketInstance from "@/common/websocket/client";

/**
 * WHEN GET /record/group-points IS CALLED
 * --------------------------------------
 * 1. Initial fetch: on mount when enabled && tableId && baseId && viewId.
 *    - useSheetLifecycle sets enabled only when view has groupBy OR view.type === "kanban".
 *    - Default view (no groupBy, not Kanban) → enabled false → no call.
 * 2. Refetch on deps change: when tableId, baseId, viewId, or enabled change and shouldFetch.
 * 3. Socket-triggered refetch (throttled 2s): on "updated_row", "created_row", "deleted_row".
 *    - Only when shouldFetch (enabled + ids); no listeners when disabled.
 * 4. Explicit refetch (refetchGroupPoints):
 *    - handleRecordsFetched: when view has groupBy or is Kanban.
 *    - handleGroupByUpdated: when groupBy is applied (groupObjs.length > 0).
 *
 * Callers: useSheetLifecycle (Grid + shared), KanbanProvider (Kanban only).
 */

interface UseGroupPointsOptions {
	tableId: string;
	baseId: string;
	viewId: string;
	enabled?: boolean;
}

export const useGroupPoints = ({
	tableId,
	baseId,
	viewId,
	enabled = true,
}: UseGroupPointsOptions) => {
	const [groupPoints, setGroupPoints] = useState<any[] | null>(null);
	const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Store latest values in refs to avoid dependency issues
	const tableIdRef = useRef(tableId);
	const baseIdRef = useRef(baseId);
	const viewIdRef = useRef(viewId);
	const enabledRef = useRef(enabled);

	// Update refs when values change
	useEffect(() => {
		tableIdRef.current = tableId;
		baseIdRef.current = baseId;
		viewIdRef.current = viewId;
		enabledRef.current = enabled;
	}, [tableId, baseId, viewId, enabled]);

	// Only fetch if we have valid IDs
	const shouldFetch = useMemo(() => {
		return enabled && !!tableId && !!baseId && !!viewId;
	}, [enabled, tableId, baseId, viewId]);

	// Use your existing useRequest hook for REST API calls
	const [{ data, loading, error }, trigger] = useRequest(
		{
			method: "get",
			url: "/record/group-points",
		},
		{ manual: true }
	);

	// Fetch function - uses refs to avoid dependency issues (prevents infinite loop)
	const fetchGroupPoints = useCallback(async () => {
		const currentEnabled = enabledRef.current;

		if (
			!currentEnabled ||
			!tableIdRef.current ||
			!baseIdRef.current ||
			!viewIdRef.current
		) {
			setGroupPoints(null);
			return;
		}

		try {
			await trigger({
				params: {
					tableId: tableIdRef.current,
					baseId: baseIdRef.current,
					viewId: viewIdRef.current,
					// No groupBy - backend will determine from view type
				},
			});
			// groupPoints will be updated via useEffect when data changes
		} catch (err: any) {
			// Handle cancellation (matches pattern from useTables.js)
			if (err?.isCancel) return;
			// Keep loading state - error is handled by useRequest
		}
		// trigger is stable from useRequest, so this callback is stable
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger]);

	// Fetch on mount and when key dependencies change.
	// Always clear first when view/table/base changes so we never show stale
	// groupPoints from the previous view (e.g. Kanban data in Grid without groupBy).
	useEffect(() => {
		setGroupPoints(null);
		if (shouldFetch) {
			fetchGroupPoints();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tableId, baseId, viewId, shouldFetch]);

	// Refetch when records are updated (via WebSocket events)
	// THROTTLE EXPLANATION (Simple):
	// Problem: If 10 records are updated in 1 second, we'd make 10 API calls
	// Solution: Wait 2 seconds, then make 1 API call (batch all updates)
	// Example: User updates 10 records → wait 2 seconds → 1 API call instead of 10
	// This prevents server overload and improves performance
	useEffect(() => {
		if (!shouldFetch) return;

		let socket: Socket | null = null;
		try {
			socket = getSocketInstance();
		} catch {
			return;
		}

		if (!socket) return;

		const handleRecordUpdate = () => {
			// Clear existing timeout (if another event comes, restart the 2-second timer)
			if (throttleTimeoutRef.current) {
				clearTimeout(throttleTimeoutRef.current);
			}

			// Wait 2 seconds before refetching (batches multiple updates into 1 call)
			throttleTimeoutRef.current = setTimeout(() => {
				fetchGroupPoints();
			}, 2000);
		};

		socket.on("updated_row", handleRecordUpdate);
		socket.on("created_row", handleRecordUpdate);
		socket.on("deleted_row", handleRecordUpdate);

		return () => {
			socket.off("updated_row", handleRecordUpdate);
			socket.off("created_row", handleRecordUpdate);
			socket.off("deleted_row", handleRecordUpdate);
			if (throttleTimeoutRef.current) {
				clearTimeout(throttleTimeoutRef.current);
			}
		};
		// fetchGroupPoints is stable (uses refs), so this won't cause infinite loops
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [shouldFetch]);

	// Update groupPoints when data changes (from useRequest)
	useEffect(() => {
		if (data?.groupPoints !== undefined) {
			setGroupPoints(data.groupPoints || []);
		}
	}, [data]);

	return {
		groupPoints,
		isLoading: loading,
		error,
		refetch: fetchGroupPoints,
	};
};
