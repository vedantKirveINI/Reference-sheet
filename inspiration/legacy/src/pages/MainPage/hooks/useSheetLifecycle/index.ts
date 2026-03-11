import { formatCell } from "./formatters";
import type { UseSheetLifecycleOptions } from "./types";
import { useSheetState } from "./state/useSheetState";
import { useSheetApi } from "./api/useSheetApi";
import { useSheetHandlers } from "./handlers/useSheetHandlers";
import { useSheetSocket } from "./socket/useSheetSocket";
import { useSheetRowOps } from "./rowOps/useSheetRowOps";

export { formatCell };
export type { UseSheetLifecycleOptions } from "./types";

function useSheetLifecycle({
	socket,
	onClearCellLoading,
	onSetCellLoading,
}: UseSheetLifecycleOptions) {
	const state = useSheetState();

	const api = useSheetApi(
		{
			workspaceId: state.workspaceId,
			projectId: state.projectId,
			parentId: state.parentId,
			assetId: state.assetId,
			tableId: state.tableId,
			viewId: state.viewId,
			decodedParams: state.decodedParams as Record<string, unknown>,
			hasAccess: state.hasAccess,
			setSheet: state.setSheet,
			setTableList: state.setTableList,
			setView: state.setView,
			setSearchParams: state.setSearchParams,
		},
		socket,
	);

	const handlers = useSheetHandlers(
		{
			tableId: state.tableId,
			assetId: state.assetId,
			decodedParams: state.decodedParams as Record<string, unknown>,
			searchParams: state.searchParams,
			viewStoreViews: state.viewStoreViews,
			visibleColumns: state.visibleColumns,
			records: state.records,
			rowHeaders: state.rowHeaders,
			checkedRowsRef: state.checkedRowsRef,
			setSearchParams: state.setSearchParams,
			setViewStoreViews: state.setViewStoreViews,
			setRecords: state.setRecords,
			setRowHeaders: state.setRowHeaders,
			setAllColumns: state.setAllColumns,
			fetchViews: state.fetchViews,
		},
		{
			leaveRoom: api.leaveRoom,
			setEncodedQueryParam: api.setEncodedQueryParam,
			createSheet: api.createSheet,
		},
	);

	const socketApi = useSheetSocket(
		socket,
		{ socket, onClearCellLoading, onSetCellLoading },
		{
			tableId: state.tableId,
			assetId: state.assetId,
			viewId: state.viewId,
			viewRef: state.viewRef,
			columnsRef: state.columnsRef,
			allColumnsRef: state.allColumnsRef,
			recordsRef: state.recordsRef,
			rowHeadersRef: state.rowHeadersRef,
			setAllColumns: state.setAllColumns,
			setRecords: state.setRecords,
			setRowHeaders: state.setRowHeaders,
			setView: state.setView,
			setGroupPoints: state.setGroupPoints,
			setIsTableLoading: state.setIsTableLoading,
			getViews: state.getViews,
			applyFieldUpdate: state.applyFieldUpdate,
			insertFieldFromSocket: state.insertFieldFromSocket,
			refetchGroupPoints: state.refetchGroupPoints,
			updateColumns: state.updateColumns,
			setHasNewRecords: state.setHasNewRecords,
		},
	);

	const rowOps = useSheetRowOps(socket, {
		tableId: state.tableId,
		assetId: state.assetId,
		viewId: state.viewId,
		records: state.records,
		rowHeaders: state.rowHeaders,
		columnsRef: state.columnsRef,
		recordsRef: state.recordsRef,
		rowHeadersRef: state.rowHeadersRef,
	});

	return {
		sheet: state.sheet,
		setSheet: state.setSheet,
		view: state.view,
		setView: state.setView,
		tableList: state.tableList,
		setTableList: state.setTableList,
		textWrapped: state.textWrapped,
		setTextWrapped: state.setTextWrapped,
		zoomLevel: state.zoomLevel,
		setZoomLevel: state.setZoomLevel,
		checkedRowsRef: state.checkedRowsRef,
		hotTableRef: state.hotTableRef,
		handleTabClick: handlers.handleTabClick,
		leaveRoom: api.leaveRoom,
		handleAIEnrichmentClick: handlers.handleAIEnrichmentClick,
		handleBlankTableClick: handlers.handleBlankTableClick,
		hasAccess: state.hasAccess,
		isViewOnly: state.isViewOnly,
		isInTrash: state.isInTrash,
		assetId: state.assetId,
		tableId: state.tableId,
		viewId: state.viewId,
		createSheetLoading: api.createSheetLoading,
		getSheetLoading: api.getSheetLoading,
		createSheet: api.createSheet,
		getSheet: api.getSheet,
		setEncodedQueryParam: api.setEncodedQueryParam,
		columns: state.visibleColumns,
		allColumns: state.allColumns,
		visibleColumns: state.visibleColumns,
		records: state.records,
		rowHeaders: state.rowHeaders,
		groupPoints: state.groupPoints,
		setRecords: state.setRecords,
		setRowHeaders: state.setRowHeaders,
		setTableData: handlers.setTableData,
		isTableLoading: state.isTableLoading,
		applyFieldUpdate: state.applyFieldUpdate,
		fetchRecords: socketApi?.requestRecords
			? () => socketApi.requestRecords({ force: true })
			: undefined,
		hasNewRecords: state.hasNewRecords,
		clearHasNewRecords: () => state.setHasNewRecords(false),
		emitRowCreate: rowOps.emitRowCreate,
		emitRowUpdate: rowOps.emitRowUpdate,
		emitRowUpdates: rowOps.emitRowUpdates,
		deleteRecordsRequest: rowOps.deleteRecordsRequest,
	};
}

export default useSheetLifecycle;
