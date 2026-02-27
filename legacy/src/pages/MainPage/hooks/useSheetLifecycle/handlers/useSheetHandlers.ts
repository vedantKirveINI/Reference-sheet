import { useCallback } from "react";
import type { MutableRefObject } from "react";
import type { ITableData } from "@/types";
import { encodeParams, decodeParams } from "@/utils/encodeDecodeUrl";
import type { HandleTabClickArgs } from "../types";
import type { ExtendedColumn } from "../types";

export interface UseSheetHandlersState {
	tableId: string;
	assetId: string;
	decodedParams: Record<string, unknown>;
	searchParams: URLSearchParams;
	viewStoreViews: any[];
	visibleColumns: ExtendedColumn[];
	records: any[];
	rowHeaders: any[];
	checkedRowsRef: MutableRefObject<{
		selectedRow: Record<string, unknown>;
		checkedRowsMap: Map<any, any>;
		selectedColumnsMap: Map<any, any>;
	}>;
	setSearchParams: (
		params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
		options?: { replace?: boolean },
	) => void;
	setViewStoreViews: (v: any[]) => void;
	setRecords: (v: any[] | ((p: any[]) => any[])) => void;
	setRowHeaders: (v: any[] | ((p: any[]) => any[])) => void;
	setAllColumns: (v: ExtendedColumn[]) => void;
	fetchViews: (opts: {
		baseId: string;
		tableId: string;
		is_field_required: boolean;
	}) => Promise<any[] | undefined>;
}

export interface UseSheetHandlersApi {
	leaveRoom: (roomId: string | null | undefined) => Promise<void>;
	setEncodedQueryParam: (encodedValue: string) => void;
	createSheet: (enrichmentKey: string | null) => Promise<void>;
}

export function useSheetHandlers(
	state: UseSheetHandlersState,
	api: UseSheetHandlersApi,
) {
	const {
		tableId,
		assetId,
		decodedParams,
		searchParams,
		viewStoreViews,
		visibleColumns,
		records,
		rowHeaders,
		checkedRowsRef,
		setSearchParams,
		setViewStoreViews,
		setRecords,
		setRowHeaders,
		setAllColumns,
		fetchViews,
	} = state;
	const { leaveRoom, setEncodedQueryParam, createSheet } = api;

	const handleTabClick = useCallback(
		async ({ tableInfo, isReplace = false }: HandleTabClickArgs) => {
			const { id: nextTableId } = tableInfo || {};
			if (tableId) {
				await leaveRoom(tableId);
			}
			const existingViewsForTable = viewStoreViews.filter(
				(v) => v.tableId === nextTableId,
			);
			let nextViewId = "";
			if (existingViewsForTable.length > 0) {
				nextViewId = existingViewsForTable[0].id;
			} else if (nextTableId && assetId) {
				try {
					const fetchedViews = await fetchViews({
						baseId: assetId,
						tableId: nextTableId,
						is_field_required: true,
					});
					if (fetchedViews && fetchedViews.length > 0) {
						const tableViews = fetchedViews.filter(
							(v) => v.tableId === nextTableId,
						);
						if (tableViews.length > 0) {
							const otherViews = viewStoreViews.filter(
								(v) => v.tableId !== nextTableId,
							);
							setViewStoreViews([...otherViews, ...tableViews]);
							nextViewId = tableViews[0].id;
						}
					}
				} catch {}
			}
			const updatedParams = {
				...decodedParams,
				t: nextTableId || "",
				v: nextViewId,
			};
			const newEncodedParams = encodeParams(updatedParams);
			const newSearchParams = new URLSearchParams();
			newSearchParams.set("q", newEncodedParams);
			if (isReplace) {
				setSearchParams(newSearchParams, { replace: true });
				checkedRowsRef.current.selectedRow = {};
				checkedRowsRef.current.checkedRowsMap.clear();
				checkedRowsRef.current.selectedColumnsMap.clear();
				return;
			}
			setSearchParams(newSearchParams);
			checkedRowsRef.current.selectedRow = {};
			checkedRowsRef.current.checkedRowsMap.clear();
			checkedRowsRef.current.selectedColumnsMap.clear();
		},
		[
			tableId,
			leaveRoom,
			decodedParams,
			setSearchParams,
			viewStoreViews,
			fetchViews,
			assetId,
			setViewStoreViews,
			checkedRowsRef,
		],
	);

	const handleAIEnrichmentClick = useCallback(
		(aiOptionValue: string = "companies") => {
			const currentQuery = searchParams.get("q");
			const currentParams = decodeParams(currentQuery || "");
			const updatedParams = {
				...currentParams,
				ai: aiOptionValue,
			};
			setEncodedQueryParam(encodeParams(updatedParams));
		},
		[searchParams, setEncodedQueryParam],
	);

	const handleBlankTableClick = useCallback(
		(enrichmentKey: string | null = null) => {
			createSheet(enrichmentKey);
		},
		[createSheet],
	);

	const setTableData = useCallback(
		(updater: (prev: ITableData) => ITableData) => {
			const snapshot: ITableData = {
				columns: visibleColumns,
				records,
				rowHeaders,
			};
			const next = updater(snapshot);
			setRecords(next.records);
			setRowHeaders(next.rowHeaders);
			if (next.columns !== snapshot.columns) {
				setAllColumns(next.columns as ExtendedColumn[]);
			}
		},
		[
			visibleColumns,
			records,
			rowHeaders,
			setRecords,
			setRowHeaders,
			setAllColumns,
		],
	);

	return {
		handleTabClick,
		handleAIEnrichmentClick,
		handleBlankTableClick,
		setTableData,
	};
}
