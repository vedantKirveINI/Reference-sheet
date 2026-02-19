import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { showAlert } from "@/lib/toast";
import truncateName from "@/utils/truncateName";
import type { IRecord, IRowHeader } from "@/types";
import { SheetsContext } from "@/context/SheetsContext";
import { useFieldsStore } from "@/stores/fieldsStore";
import { useUIStore } from "@/stores/uiStore";
import { useViewStore } from "@/stores/viewStore";
import useViews from "@/pages/MainPage/hooks/useViews";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import { useGroupPoints } from "@/hooks/useGroupPoints";
import getAssetAccessDetails from "@/pages/MainPage/utils/getAssetAccessDetails";
import { findColumnInsertIndex } from "@/utils/orderUtils";
import {
	mapFieldTypeToCellType,
	createEmptyCellForType,
	formatCell,
} from "../formatters";
import type { ExtendedColumn } from "../types";

export function useSheetState() {
	const [sheet, setSheet] = useState<Record<string, unknown>>({});
	const [view, setView] = useState<any>({});
	const [tableList, setTableList] = useState<any[]>([]);
	const [textWrapped, setTextWrapped] = useState<Record<string, boolean>>({});
	const [zoomLevel, setZoomLevel] = useState<number>(100);
	const [records, setRecords] = useState<IRecord[]>([]);
	const [rowHeaders, setRowHeaders] = useState<IRowHeader[]>([]);
	const [groupPoints, setGroupPoints] = useState<
		Array<{
			type: 0 | 1;
			id?: string;
			depth?: number;
			value?: unknown;
			isCollapsed?: boolean;
			count?: number;
		}>
	>([]);
	const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
	const [hasNewRecords, setHasNewRecords] = useState<boolean>(false);

	const { allColumns, setAllColumns, updateColumns, getVisibleColumns } =
		useFieldsStore();
	const { currentView } = useUIStore();
	const { views: viewStoreViews, setViews: setViewStoreViews } =
		useViewStore();
	const { fetchViews } = useViews();

	const visibleColumns = useMemo(() => {
		return getVisibleColumns(view?.columnMeta, currentView);
	}, [allColumns, view?.columnMeta, currentView, getVisibleColumns]);

	const columnsRef = useRef(visibleColumns);
	const allColumnsRef = useRef(allColumns);
	const recordsRef = useRef(records);
	const rowHeadersRef = useRef(rowHeaders);
	const viewRef = useRef(view);

	useEffect(() => {
		columnsRef.current = visibleColumns;
	}, [visibleColumns]);
	useEffect(() => {
		allColumnsRef.current = allColumns;
	}, [allColumns]);
	useEffect(() => {
		recordsRef.current = records;
	}, [records]);
	useEffect(() => {
		rowHeadersRef.current = rowHeaders;
	}, [rowHeaders]);
	useEffect(() => {
		viewRef.current = view;
	}, [view]);

	const context = useContext(SheetsContext);
	if (!context) {
		throw new Error(
			"useSheetLifecycle must be used within SheetsContextProvider",
		);
	}
	const { assetAccessDetails } = context;
	const { hasAccess, isViewOnly, isInTrash } = useMemo(
		() => getAssetAccessDetails(assetAccessDetails),
		[assetAccessDetails],
	);

	const checkedRowsRef = useRef({
		selectedRow: {} as Record<string, unknown>,
		checkedRowsMap: new Map(),
		selectedColumnsMap: new Map(),
	});
	const hotTableRef = useRef<any>(null);

	const {
		workspaceId = "",
		projectId = "",
		parentId = "",
		assetId = "",
		tableId = "",
		decodedParams = {},
		setSearchParams,
		viewId = "",
		searchParams,
	} = useDecodedUrlParams();

	const groupPointsEnabled = useMemo(() => {
		if (!view) return false;
		const hasGroupBy =
			view?.group?.groupObjs && view.group.groupObjs.length > 0;
		const isKanbanView = view?.type === "kanban";
		return !!(hasGroupBy || isKanbanView);
	}, [view]);

	const { groupPoints: groupPointsFromHook, refetch: refetchGroupPoints } =
		useGroupPoints({
			tableId: tableId || "",
			baseId: assetId || "",
			viewId: viewId || "",
			enabled: !!tableId && !!viewId && !!assetId && groupPointsEnabled,
		});

	useEffect(() => {
		setGroupPoints(groupPointsFromHook ?? []);
	}, [groupPointsFromHook]);

	useEffect(() => {
		setGroupPoints([]);
	}, [viewId]);

	useEffect(() => {
		if (!viewId || viewStoreViews.length === 0) return;
		const viewFromStore = viewStoreViews.find((v) => v.id === viewId);
		if (viewFromStore) {
			setView(viewFromStore);
		}
	}, [viewId, viewStoreViews]);

	const getViews = useCallback(
		(_errorContext?: string) => {
			if (!tableId || !assetId) return;
			fetchViews({ baseId: assetId, tableId, is_field_required: true })
				.then((fetchedViews) => {
					if (fetchedViews && fetchedViews.length > 0) {
						const tableViews = fetchedViews.filter(
							(v) => v.tableId === tableId,
						);
						setViewStoreViews(tableViews);
						const currentViewFromStore = tableViews.find(
							(v) => v.id === viewId,
						);
						if (currentViewFromStore) {
							setView(currentViewFromStore);
						}
					}
				})
				.catch((error) => {
					showAlert({
						type: "error",
						message:
							truncateName(error?.response?.data?.message, 50) ||
							"Failed to refresh views",
					});
				});
		},
		[tableId, assetId, viewId, fetchViews, setViewStoreViews, setView],
	);

	const applyFieldUpdate = useCallback(
		(updatedField: any) => {
			if (!updatedField) return;
			const dbFieldName =
				updatedField.dbFieldName ||
				(updatedField.id ? String(updatedField.id) : undefined);
			if (!dbFieldName) return;

			const currentAllColumns = allColumnsRef.current;
			let didUpdate = false;
			const nextColumns = currentAllColumns.map(
				(column: ExtendedColumn) => {
					const matches =
						column.dbFieldName === dbFieldName ||
						column.id === dbFieldName ||
						String(column.rawId) === String(updatedField.id);
					if (!matches) return column;
					didUpdate = true;
					// Normalize options: Field Modal submits plain array; API/socket may send { options: string[] }
					let nextRawOptions: any;
					let nextOptions: any;
					if (updatedField.options !== undefined) {
						if (Array.isArray(updatedField.options)) {
							nextRawOptions = { options: updatedField.options };
							nextOptions = updatedField.options;
						} else {
							nextRawOptions = updatedField.options;
							nextOptions =
								updatedField.options?.options ??
								column.options ??
								nextRawOptions?.options;
						}
					} else {
						nextRawOptions = column.rawOptions;
						nextOptions =
							column.options ?? column.rawOptions?.options;
					}
					return {
						...column,
						name: updatedField.name ?? column.name,
						rawType: updatedField.type ?? column.rawType,
						rawOptions: nextRawOptions,
						options: nextOptions,
						description:
							updatedField.description ?? column.description,
						computedFieldMeta:
							updatedField.computedFieldMeta ??
							column.computedFieldMeta,
						fieldFormat:
							updatedField.fieldFormat ?? column.fieldFormat,
						entityType:
							updatedField.entityType ?? column.entityType,
						identifier:
							updatedField.identifier ?? column.identifier,
						fieldsToEnrich:
							updatedField.fieldsToEnrich ??
							column.fieldsToEnrich,
					};
				},
			);
			if (didUpdate) setAllColumns(nextColumns);

			setView((prevView: any) => {
				if (!prevView || !Array.isArray(prevView.fields))
					return prevView;
				let didUpdateView = false;
				const nextFields = prevView.fields.map((field: any) => {
					if (
						field?.dbFieldName === dbFieldName ||
						String(field?.id) === String(updatedField.id)
					) {
						didUpdateView = true;
						return { ...field, ...updatedField };
					}
					return field;
				});
				return didUpdateView
					? { ...prevView, fields: nextFields }
					: prevView;
			});
		},
		[setAllColumns, setView],
	);

	const insertFieldFromSocket = useCallback(
		(newField: any): string | null => {
			if (!newField || !newField.dbFieldName) return null;
			const currentAllColumns = allColumnsRef.current;
			const duplicate = currentAllColumns.some(
				(column: ExtendedColumn) =>
					column.dbFieldName === newField.dbFieldName ||
					column.id === newField.dbFieldName ||
					column.rawId === newField.id,
			);
			if (duplicate) return null;

			const columnType = mapFieldTypeToCellType(newField.type);
			const columnId = newField.dbFieldName;
			const columnOptions = newField.options || {};
			const newColumn: ExtendedColumn = {
				id: columnId,
				name: newField.name || "Untitled Column",
				type: columnType,
				width: newField.width || 200,
				isFrozen: false,
				order:
					typeof newField.order === "number"
						? newField.order
						: currentAllColumns.length + 1,
				rawType: newField.type,
				rawOptions: newField.options,
				rawId: newField.id,
				dbFieldName: columnId,
				status: newField.status,
			};
			const insertedColumnName = newColumn.name;

			// CREATED_TIME: records already have __created_time (stored in _raw); use it so UI reflects without refetch (sheets pattern)
			const isCreatedTimeField =
				newField.type === "CREATED_TIME" &&
				columnId === "__created_time";

			setRecords((prevRecords) =>
				prevRecords.map((record) => {
					const rawCreatedTime = record._raw?.__created_time;
					const cell =
						isCreatedTimeField && rawCreatedTime != null
							? formatCell(rawCreatedTime, newColumn)
							: createEmptyCellForType(columnType, columnOptions);
					return {
						...record,
						cells: {
							...record.cells,
							[columnId]: cell,
						},
					};
				}),
			);

			const insertIndex = findColumnInsertIndex(
				currentAllColumns,
				newColumn.order,
			);
			const updatedColumns = [
				...currentAllColumns.slice(0, insertIndex),
				newColumn,
				...currentAllColumns.slice(insertIndex),
			];
			setAllColumns(updatedColumns);
			return insertedColumnName;
		},
		[setAllColumns, setRecords],
	);

	return {
		sheet,
		setSheet,
		view,
		setView,
		tableList,
		setTableList,
		textWrapped,
		setTextWrapped,
		zoomLevel,
		setZoomLevel,
		records,
		setRecords,
		rowHeaders,
		setRowHeaders,
		groupPoints,
		setGroupPoints,
		isTableLoading,
		setIsTableLoading,
		hasNewRecords,
		setHasNewRecords,
		allColumns,
		setAllColumns,
		updateColumns,
		visibleColumns,
		columnsRef,
		allColumnsRef,
		recordsRef,
		rowHeadersRef,
		viewRef,
		checkedRowsRef,
		hotTableRef,
		hasAccess,
		isViewOnly,
		isInTrash,
		workspaceId,
		projectId,
		parentId,
		assetId,
		tableId,
		viewId,
		decodedParams,
		setSearchParams,
		searchParams,
		viewStoreViews,
		setViewStoreViews,
		fetchViews,
		currentView,
		getViews,
		applyFieldUpdate,
		insertFieldFromSocket,
		refetchGroupPoints,
	};
}
