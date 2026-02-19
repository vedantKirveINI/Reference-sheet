import { useCallback, useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { showAlert } from "@/lib/toast";
import useRequest from "@/hooks/useRequest";
import { encodeParams } from "@/utils/encodeDecodeUrl";
import truncateName from "@/utils/truncateName";

export interface UseSheetApiState {
	workspaceId: string;
	projectId: string;
	parentId: string;
	assetId: string;
	tableId: string;
	viewId: string;
	decodedParams: Record<string, unknown>;
	hasAccess: boolean;
	setSheet: (v: Record<string, unknown> | ((p: Record<string, unknown>) => Record<string, unknown>)) => void;
	setTableList: (v: any[] | ((p: any[]) => any[])) => void;
	setView: (v: any | ((p: any) => any)) => void;
	setSearchParams: (
		params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
	) => void;
}

export function useSheetApi(state: UseSheetApiState, socket: Socket | null) {
	const {
		workspaceId,
		projectId,
		parentId,
		assetId,
		tableId,
		viewId,
		decodedParams,
		hasAccess,
		setSheet,
		setTableList,
		setView,
		setSearchParams,
	} = state;

	const setEncodedQueryParam = useCallback(
		(encodedValue: string) => {
			const params = new URLSearchParams();
			params.set("q", encodedValue);
			setSearchParams(params);
		},
		[setSearchParams],
	);

	const [{ loading: createSheetLoading }, triggerCreateSheet] = useRequest(
		{ method: "post", url: "/sheet/create_sheet" },
		{ manual: true },
	);
	const [{ loading: getSheetLoading }, triggerGetSheet] = useRequest(
		{ method: "post", url: "/sheet/get_sheet" },
		{ manual: true },
	);

	const lastGetSheetKeyRef = useRef<string | null>(null);

	const onCreateSheetSuccess = useCallback(
		(response: any) => {
			const { base, table, view: createdView } = response?.data || {};
			const baseId = base?.id || "";
			const newTableId = table?.id || "";
			const newViewId = createdView?.id || "";
			setSheet(base || {});
			setTableList(table ? [table] : []);
			if (base?.name) {
				document.title = base.name;
			}
			const newSheetPath = {
				w: workspaceId,
				pj: projectId,
				pr: parentId,
				a: baseId,
				t: newTableId,
				v: newViewId,
			};
			setEncodedQueryParam(encodeParams(newSheetPath));
		},
		[
			workspaceId,
			projectId,
			parentId,
			setEncodedQueryParam,
			setSheet,
			setTableList,
		],
	);

	const getSheetSuccess = useCallback(
		(response: any) => {
			const { data = {} } = response || {};
			const { tables = [] } = data || {};
			setSheet(data);
			setTableList(tables);
			const currentTable =
				tableId && tables.length
					? tables.find((table: any) => table.id === tableId) ||
						tables[0]
					: tables[0];
			const { views = [] } = currentTable || {};
			const currentView =
				viewId && views.length
					? views.find((item: any) => item?.id === viewId) || views[0]
					: views[0];
			if (currentView) setView(currentView);
			if (data?.name) document.title = data.name;
			if (!tableId && currentTable) {
				const updatedParams = {
					...decodedParams,
					t: currentTable?.id || "",
					v: currentView?.id || "",
				};
				setEncodedQueryParam(encodeParams(updatedParams));
			}
		},
		[
			decodedParams,
			setEncodedQueryParam,
			setSheet,
			setTableList,
			setView,
			tableId,
			viewId,
		],
	);

	const getSheet = useCallback(async () => {
		try {
			const response = await triggerGetSheet({
				data: {
					baseId: assetId,
					include_views: true,
					include_tables: true,
				},
			});
			getSheetSuccess(response);
		} catch (error: any) {
			if (error?.isCancel) return;
			showAlert({
				type: "error",
				message:
					truncateName(error?.response?.data?.message, 50) ||
					"Something went wrong",
			});
		}
	}, [assetId, triggerGetSheet, getSheetSuccess]);

	const createSheet = useCallback(
		async (enrichmentKey: string | null = null) => {
			try {
				const requestData: Record<string, unknown> = {
					workspace_id: workspaceId,
					parent_id: parentId,
				};
				if (enrichmentKey) {
					requestData.enrichment_key = enrichmentKey;
				}
				const response = await triggerCreateSheet({
					data: requestData,
				});
				onCreateSheetSuccess(response);
			} catch (error: any) {
				if (error?.isCancel) return;
				showAlert({
					type: "error",
					message:
						truncateName(error?.response?.data?.message, 50) ||
						"Something went wrong",
				});
			}
		},
		[workspaceId, parentId, triggerCreateSheet, onCreateSheetSuccess],
	);

	const leaveRoom = useCallback(
		async (roomId: string | null | undefined) => {
			if (!roomId || !socket) return;
			await socket.emit("leaveRoom", roomId);
		},
		[socket],
	);

	useEffect(() => {
		if (!assetId || !hasAccess) return;
		const key = `${assetId}:${tableId}:${viewId}`;
		if (lastGetSheetKeyRef.current === key) return;
		lastGetSheetKeyRef.current = key;
		getSheet();
	}, [assetId, hasAccess, getSheet, tableId, viewId]);

	return {
		createSheet,
		getSheet,
		leaveRoom,
		setEncodedQueryParam,
		createSheetLoading,
		getSheetLoading,
	};
}
