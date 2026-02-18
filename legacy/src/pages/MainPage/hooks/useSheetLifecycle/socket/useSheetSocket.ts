import { useCallback, useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import type { Socket } from "socket.io-client";
import { showAlert } from "@/lib/toast";
import type { ICell } from "@/types";
import { parseColumnMeta } from "@/utils/columnMetaUtils";
import { searchByRowOrder } from "@/utils/orderUtils";
import { useGridCollapsedGroupStore } from "@/stores/useGridCollapsedGroupStore";
import {
        formatRecordsFetched,
        formatCreatedRow,
        formatUpdatedRow,
} from "../formatters";
import type {
        RecordsFetchedPayload,
        CreatedRowPayload,
        UpdatedRowPayload,
        UseSheetLifecycleOptions,
} from "../types";
import type { ExtendedColumn } from "../types";
import { isDefaultView } from "@/types/view";

/** Matches optimistic record ids from generateRecordId(): record_<timestamp>_<random> */
function isOptimisticRecordId(id: string): boolean {
        return /^record_\d+_[a-z0-9]+$/.test(id);
}

export interface UseSheetSocketState {
        tableId: string;
        assetId: string;
        viewId: string;
        viewRef: MutableRefObject<any>;
        columnsRef: MutableRefObject<ExtendedColumn[]>;
        allColumnsRef: MutableRefObject<ExtendedColumn[]>;
        recordsRef: MutableRefObject<any[]>;
        rowHeadersRef: MutableRefObject<any[]>;
        setAllColumns: (v: ExtendedColumn[]) => void;
        setRecords: (v: any[] | ((p: any[]) => any[])) => void;
        setRowHeaders: (v: any[] | ((p: any[]) => any[])) => void;
        setView: (v: any | ((p: any) => any)) => void;
        setGroupPoints: (v: any[]) => void;
        setIsTableLoading: (v: boolean) => void;
        getViews: (ctx?: string) => void;
        applyFieldUpdate: (field: any) => void;
        insertFieldFromSocket: (field: any) => string | null;
        refetchGroupPoints: () => void;
        updateColumns: (
                updates: Array<{ id: string; updates: Partial<ExtendedColumn> }>,
        ) => void;
        setHasNewRecords?: (v: boolean) => void;
}

export function useSheetSocket(
        socket: Socket | null,
        options: UseSheetLifecycleOptions,
        state: UseSheetSocketState,
) {
        const {
                tableId,
                assetId,
                viewId,
                viewRef,
                columnsRef,
                allColumnsRef,
                recordsRef,
                rowHeadersRef,
                setAllColumns,
                setRecords,
                setRowHeaders,
                setView,
                setGroupPoints,
                setIsTableLoading,
                getViews,
                applyFieldUpdate,
                insertFieldFromSocket,
                refetchGroupPoints,
                updateColumns,
                setHasNewRecords,
        } = state;
        const { onClearCellLoading, onSetCellLoading } = options;

        const lastSocketEffectKeyRef = useRef<string | null>(null);
        const requestRecordsInProgressRef = useRef<string | null>(null);
        const currentTableRoomRef = useRef<string | null>(null);
        const currentViewRoomRef = useRef<string | null>(null);
        const lastRequestKeyRef = useRef<string | null>(null);

        const requestRecords = useCallback(
                async (options?: { force?: boolean }) => {
                        if (!socket || !socket.connected) return;
                        if (!tableId || !assetId || !viewId) return;
                        const requestKey = `${tableId}:${viewId}`;
                        if (requestRecordsInProgressRef.current === requestKey) return;
                        // Allow refetch when user explicitly clicks "Fetch records" (force refresh)
                        if (!options?.force && lastRequestKeyRef.current === requestKey) return;
                        requestRecordsInProgressRef.current = requestKey;
                        lastRequestKeyRef.current = requestKey;
                        try {
                                await socket.emit("getRecord", {
                                        tableId,
                                        baseId: assetId,
                                        viewId,
                                        should_stringify: true,
                                });
                        } finally {
                                setTimeout(() => {
                                        if (requestRecordsInProgressRef.current === requestKey) {
                                                requestRecordsInProgressRef.current = null;
                                        }
                                }, 1000);
                        }
                },
                [socket, tableId, assetId, viewId],
        );

        useEffect(() => {
                if (!socket) return;

                const handleRecordsFetched = (payload: RecordsFetchedPayload) => {
                        if (payload.viewId && payload.viewId !== viewId) return;
                        const requestKey = `${tableId}:${viewId}`;
                        if (requestRecordsInProgressRef.current === requestKey) {
                                requestRecordsInProgressRef.current = null;
                        }
                        const currentView = viewRef.current;
                        const formatted = formatRecordsFetched(
                                payload,
                                viewId,
                                currentView?.columnMeta,
                        );
                        setAllColumns(formatted.columns);
                        setRecords(formatted.records);
                        setRowHeaders(formatted.rowHeaders);
                        const hasGroupBy =
                                currentView?.group?.groupObjs &&
                                currentView.group.groupObjs.length > 0;
                        const isKanbanView = currentView?.type === "kanban";
                        if (hasGroupBy || isKanbanView) refetchGroupPoints();
                        setIsTableLoading(false);
                };

                const handleCreatedRow = (payload: CreatedRowPayload[]) => {
                        if (!isDefaultView(viewRef.current)) return;
                        const currentView = viewRef.current;
                        const isKanbanView = currentView?.type === "kanban";
                        const hasFilters =
                                currentView?.filter &&
                                Object.keys(currentView.filter).length > 0;
                        const hasSorts =
                                currentView?.sort?.sortObjs &&
                                currentView.sort.sortObjs.length > 0;
                        const hasGroupBy =
                                currentView?.group?.groupObjs &&
                                currentView.group.groupObjs.length > 0;
                        if ((hasFilters || hasSorts || hasGroupBy) && !isKanbanView) return;

                        const isSameClient =
                                payload[0]?.socket_id === socket.id && !isKanbanView;

                        if (isSameClient) {
                                try {
                                        const { newRecord, rowHeader } = formatCreatedRow(
                                                payload,
                                                columnsRef.current,
                                                viewId,
                                        );
                                        const records = recordsRef.current;
                                        const replaceIndex = records.findIndex((r) =>
                                                isOptimisticRecordId(String(r.id)),
                                        );
                                        if (replaceIndex === -1) return;
                                        setRecords((prev) => {
                                                const next = [...prev];
                                                next[replaceIndex] = newRecord;
                                                return next;
                                        });
                                        setRowHeaders((prev) => {
                                                const next = [...prev];
                                                next[replaceIndex] = {
                                                        ...rowHeader,
                                                        rowIndex: replaceIndex,
                                                };
                                                return next.map((h, i) => ({
                                                        ...h,
                                                        rowIndex: i,
                                                        displayIndex: i + 1,
                                                }));
                                        });
                                } catch (e) {
                                        showAlert({
                                                type: "error",
                                                message: "Failed to process new record",
                                        });
                                }
                                return;
                        }

                        try {
                                const { newRecord, rowHeader, orderValue } = formatCreatedRow(
                                        payload,
                                        columnsRef.current,
                                        viewId,
                                );
                                let insertIndex: number;
                                if (orderValue !== undefined) {
                                        insertIndex = searchByRowOrder(
                                                orderValue,
                                                recordsRef.current,
                                                rowHeadersRef.current,
                                        );
                                } else {
                                        insertIndex = recordsRef.current.length;
                                }
                                setRecords((prev) => {
                                        const next = [...prev];
                                        next.splice(insertIndex, 0, newRecord);
                                        return next;
                                });
                                setRowHeaders((prev) => {
                                        const next = [...prev];
                                        const updated = {
                                                ...rowHeader,
                                                rowIndex: insertIndex,
                                        };
                                        next.splice(insertIndex, 0, updated);
                                        return next.map((h, i) => ({
                                                ...h,
                                                rowIndex: i,
                                                displayIndex: i + 1,
                                        }));
                                });
                        } catch (e) {
                                showAlert({
                                        type: "error",
                                        message: "Failed to process new record",
                                });
                        }
                };

                const handleUpdatedRow = (payload: UpdatedRowPayload[]) => {
                        if (!isDefaultView(viewRef.current)) return;
                        const currentView = viewRef.current;
                        const isKanbanView = currentView?.type === "kanban";
                        const hasFilters =
                                currentView?.filter &&
                                Object.keys(currentView.filter).length > 0;
                        const hasSorts =
                                currentView?.sort?.sortObjs &&
                                currentView.sort.sortObjs.length > 0;
                        const hasGroupBy =
                                currentView?.group?.groupObjs &&
                                currentView.group.groupObjs.length > 0;
                        let isGroupByFieldUpdated = false;
                        if (hasGroupBy) {
                                const groupByFieldIds = currentView.group.groupObjs.map(
                                        (obj: any) => Number(obj.fieldId),
                                );
                                isGroupByFieldUpdated = payload.some((rowData) =>
                                        rowData.fields_info.some((field) =>
                                                groupByFieldIds.includes(Number(field.field_id)),
                                        ),
                                );
                        }
                        if (hasFilters || hasSorts) return;
                        // For Kanban view, apply group-field updates so other clients see the new stack; for grid, skip
                        if (hasGroupBy && isGroupByFieldUpdated && !isKanbanView) return;
                        try {
                                const { updatedCells, enrichedFieldIds, formulaFieldIds } =
                                        formatUpdatedRow(
                                                payload,
                                                columnsRef.current,
                                                recordsRef.current,
                                        );
                                enrichedFieldIds.forEach(({ rowId, fieldId }) => {
                                        onClearCellLoading?.(String(rowId), fieldId);
                                });
                                formulaFieldIds.forEach(({ rowId, fieldId }) => {
                                        onClearCellLoading?.(String(rowId), fieldId);
                                });
                                if (updatedCells.size === 0) return;
                                setRecords((prev) => {
                                        const next = [...prev];
                                        updatedCells.forEach((cells, rowId) => {
                                                const rid = Number(rowId);
                                                const idx = next.findIndex(
                                                        (r) =>
                                                                Number(r.id) === rid ||
                                                                r.id === String(rid) ||
                                                                String(r.id) === String(rid),
                                                );
                                                if (idx !== -1) {
                                                        next[idx] = {
                                                                ...next[idx],
                                                                cells: { ...next[idx].cells, ...cells },
                                                        };
                                                }
                                        });
                                        return next;
                                });
                                // Kanban: always refetch group points after group-field update so stack counts stay correct
                                if (isKanbanView && isGroupByFieldUpdated) {
                                        refetchGroupPoints();
                                }
                        } catch (e) {
                                showAlert({
                                        type: "error",
                                        message: "Failed to process record update",
                                });
                        }
                };

                const handleDeletedRecords = (
                        payload: Array<{
                                __id: number;
                                __status: string;
                                socket_id?: string;
                        }>,
                ) => {
                        if (!isDefaultView(viewRef.current)) return;
                        if (!payload?.length) return;
                        if (payload[0]?.socket_id === socket.id) return;
                        const deletedIds = new Set(
                                payload
                                        .map((i) => String(i?.__id))
                                        .filter((id) => id !== undefined),
                        );
                        if (!deletedIds.size) return;
                        setRecords((prev) => {
                                const next = prev.filter((r) => !deletedIds.has(r.id));
                                setRowHeaders((headers) => {
                                        const filtered = headers.filter((_, i) => {
                                                const id = prev[i]?.id;
                                                return id ? !deletedIds.has(id) : true;
                                        });
                                        return filtered.map((h, i) => ({
                                                ...h,
                                                rowIndex: i,
                                                displayIndex: i + 1,
                                        }));
                                });
                                return next;
                        });
                };

                const handleCreatedField = (newFieldData: any) => {
                        // In non-default views, show notification instead of applying changes
                        if (!isDefaultView(viewRef.current)) {
                                setHasNewRecords?.(true);
                                return;
                        }
                        const name = insertFieldFromSocket(newFieldData);
                        if (name) {
                                showAlert({ type: "success", message: `${name} column added` });
                                getViews("field creation");
                        }
                };

                const handleCreatedFields = (newFields: any[]) => {
                        if (!Array.isArray(newFields)) return;
                        // In non-default views, show notification instead of applying changes
                        if (!isDefaultView(viewRef.current)) {
                                setHasNewRecords?.(true);
                                return;
                        }
                        let n = 0;
                        newFields.forEach((f) => {
                                if (insertFieldFromSocket(f)) n++;
                        });
                        if (n > 0) {
                                showAlert({
                                        type: "success",
                                        message:
                                                n === 1 ? "New column added" : `${n} columns added`,
                                });
                                getViews("fields creation");
                        }
                };

                const handleUpdatedField = (payload: {
                        updatedFields?: any[];
                        isExpressionUpdate?: boolean;
                }) => {
                        const { updatedFields, isExpressionUpdate } = payload || {};
                        if (!Array.isArray(updatedFields) || !updatedFields.length) return;
                        // In non-default views, show notification instead of applying changes
                        if (!isDefaultView(viewRef.current)) {
                                setHasNewRecords?.(true);
                                return;
                        }
                        if (isExpressionUpdate) {
                                updatedFields.forEach((field) => {
                                        if (field?.type === "ENRICHMENT") return;
                                        if (field?.type === "FORMULA" && field?.id) {
                                                onSetCellLoading?.(String(field.id), true);
                                        }
                                });
                        }
                        updatedFields.forEach((f) => applyFieldUpdate(f));
                        getViews("field update");
                };

                const handleDeletedFields = (
                        payload: Array<{
                                id: string | number;
                                dbFieldName: string;
                                type: string;
                        }>,
                ) => {
                        if (!payload?.length) return;
                        const deletedIds = new Set<string>();
                        const byDbName: Record<string, string> = {};
                        payload.forEach((field) => {
                                const { id, dbFieldName = "", type = "" } = field || {};
                                if (id != null) deletedIds.add(String(id));
                                if (["CREATED_TIME", "ID"].includes(type)) return;
                                if (dbFieldName) byDbName[dbFieldName] = dbFieldName;
                        });
                        const current = allColumnsRef.current;
                        const updated = current.filter((col: ExtendedColumn) => {
                                const fid =
                                        col.rawId != null ? String(col.rawId) : String(col.id);
                                return (
                                        !deletedIds.has(fid) &&
                                        !(col.dbFieldName && byDbName[col.dbFieldName])
                                );
                        });
                        setAllColumns(updated);
                        setRecords((prev) =>
                                prev.map((rec) => {
                                        const cells: Record<string, ICell> = {};
                                        Object.keys(rec.cells).forEach((k) => {
                                                if (!byDbName[k]) cells[k] = rec.cells[k];
                                        });
                                        return { ...rec, cells };
                                }),
                        );
                        getViews("field deletion");
                };

                const handleRecordsChanged = (payload: { tableId?: string }) => {
                        if (payload?.tableId && payload.tableId === tableId) {
                                setHasNewRecords?.(true);
                        }
                };

                const handleFieldsChanged = (payload: { tableId?: string }) => {
                        // Notify non-default views that fields have changed
                        if (payload?.tableId && payload.tableId === tableId) {
                                setHasNewRecords?.(true);
                        }
                };

                const handleConnect = async () => {
                        if (!tableId) return;
                        if (shouldReconnect) {
                                if (currentViewRoomRef.current) {
                                        await socket.emit("leaveRoom", currentViewRoomRef.current);
                                        currentViewRoomRef.current = null;
                                }
                                if (currentTableRoomRef.current) {
                                        await socket.emit("leaveRoom", currentTableRoomRef.current);
                                        currentTableRoomRef.current = null;
                                }
                        }
                        if (currentTableRoomRef.current !== tableId) {
                                await socket.emit("joinRoom", tableId);
                                currentTableRoomRef.current = tableId;
                        }
                        if (viewId && currentViewRoomRef.current !== viewId) {
                                await socket.emit("joinRoom", viewId);
                                currentViewRoomRef.current = viewId;
                        }
                        setIsTableLoading(true);
                        await requestRecords();
                };

                const handleSortUpdated = (payload: { sort?: any }) => {
                        if (!payload) return;
                        setView((prev: any) => ({
                                ...(prev || {}),
                                sort: payload.sort ?? prev?.sort,
                        }));
                };

                const handleGroupByUpdated = (payload: { group?: any }) => {
                        if (!payload) return;
                        let g = payload.group;
                        if (typeof g === "string") {
                                try {
                                        g = JSON.parse(g);
                                } catch (e) {
                                        g = payload.group;
                                }
                        }
                        const newGroup = g
                                ? {
                                                ...g,
                                                groupObjs: (g.groupObjs || []).map((obj: any) => ({
                                                        ...obj,
                                                        fieldId:
                                                                typeof obj.fieldId === "string"
                                                                        ? Number(obj.fieldId)
                                                                        : obj.fieldId,
                                                })),
                                        }
                                : null;
                        setView((prev: any) => ({
                                ...(prev || {}),
                                group: newGroup ? { ...newGroup } : null,
                        }));
                        if (!newGroup?.groupObjs?.length) {
                                setGroupPoints([]);
                        } else {
                                refetchGroupPoints();
                        }
                        const { clearCollapsedGroups } =
                                useGridCollapsedGroupStore.getState();
                        const cacheKey = tableId && viewId ? `${tableId}_${viewId}` : null;
                        if (cacheKey) clearCollapsedGroups(cacheKey);
                };

                const handleUpdatedColumnMeta = (payload: {
                        columnMeta?: Array<{
                                id: string;
                                width?: number;
                                text_wrap?: string;
                                is_hidden?: boolean;
                        }>;
                        freezeColumns?: number;
                        socket_id?: string;
                }) => {
                        if (!payload) return;
                        if (payload.socket_id === socket.id) return;
                        if (payload.columnMeta?.length) {
                                setView((prev: any) => {
                                        if (!prev) return prev;
                                        const meta = parseColumnMeta(prev.columnMeta);
                                        const next = { ...meta };
                                        payload.columnMeta!.forEach((m) => {
                                                if (!m.id) return;
                                                next[m.id] = {
                                                        ...(next[m.id] || {}),
                                                        ...(m.width != null && { width: m.width }),
                                                        ...(m.text_wrap && { text_wrap: m.text_wrap }),
                                                        ...(m.is_hidden !== undefined && {
                                                                is_hidden: m.is_hidden,
                                                        }),
                                                };
                                        });
                                        return { ...prev, columnMeta: JSON.stringify(next) };
                                });
                                const all = allColumnsRef.current;
                                const updates = payload.columnMeta
                                        .filter((m) => m.width != null)
                                        .map((m) => {
                                                const col = all.find(
                                                        (c: ExtendedColumn) =>
                                                                String(c.rawId) === String(m.id),
                                                );
                                                return col
                                                        ? { id: col.id, updates: { width: m.width! } }
                                                        : null;
                                        })
                                        .filter(Boolean) as Array<{
                                        id: string;
                                        updates: Partial<ExtendedColumn>;
                                }>;
                                if (updates.length) updateColumns(updates);
                        }
                        if (payload.freezeColumns !== undefined) {
                                setView((prev: any) => ({
                                        ...(prev || {}),
                                        options: {
                                                ...(prev?.options || {}),
                                                freezeColumns: payload.freezeColumns,
                                        },
                                }));
                        }
                };

                const handleFormulaFieldErrors = (
                        data: Array<{
                                id: string | number;
                                type: string;
                                computedFieldMeta?: {
                                        hasError?: boolean;
                                        shouldShowLoading?: boolean;
                                };
                        }>,
                ) => {
                        if (!data?.length) return;
                        const all = allColumnsRef.current;
                        const errorMap: Record<string, boolean> = {};
                        const loadingMap: Record<string, boolean> = {};
                        data.forEach((f) => {
                                const id = String(f.id);
                                if (f.computedFieldMeta?.hasError !== undefined)
                                        errorMap[id] = f.computedFieldMeta.hasError;
                                if (
                                        f.type === "FORMULA" &&
                                        f.computedFieldMeta?.shouldShowLoading !== undefined
                                )
                                        loadingMap[id] = f.computedFieldMeta.shouldShowLoading;
                        });
                        const updates = all
                                .filter((c) => errorMap[String(c.rawId ?? c.id)] !== undefined)
                                .map((c) => {
                                        const id = String(c.rawId ?? c.id);
                                        return {
                                                id: c.id,
                                                updates: {
                                                        computedFieldMeta: {
                                                                ...(c.computedFieldMeta || {}),
                                                                hasError: errorMap[id],
                                                        },
                                                },
                                        };
                                });
                        if (updates.length) updateColumns(updates);
                        Object.entries(loadingMap).forEach(([fieldId, loading]) => {
                                onSetCellLoading?.(fieldId, loading);
                        });
                };

                const currentKey = `${tableId}:${viewId}`;
                const prevKey = lastSocketEffectKeyRef.current;
                const shouldReconnect = prevKey !== currentKey;

                if (shouldReconnect) {
                        lastSocketEffectKeyRef.current = currentKey;
                        requestRecordsInProgressRef.current = null;
                        lastRequestKeyRef.current = null;
                }

                socket.on("connect", handleConnect);
                socket.on("recordsFetched", handleRecordsFetched);
                socket.on("created_row", handleCreatedRow);
                socket.on("updated_row", handleUpdatedRow);
                socket.on("deleted_records", handleDeletedRecords);
                socket.on("created_field", handleCreatedField);
                socket.on("created_fields", handleCreatedFields);
                socket.on("updated_field", handleUpdatedField);
                socket.on("deleted_fields", handleDeletedFields);
                socket.on("sort_updated", handleSortUpdated);
                socket.on("group_by_updated", handleGroupByUpdated);
                socket.on("updated_column_meta", handleUpdatedColumnMeta);
                socket.on("formula_field_errors", handleFormulaFieldErrors);
                socket.on("records_changed", handleRecordsChanged);
                socket.on("fields_changed", handleFieldsChanged);

                if (socket.connected && tableId && shouldReconnect) {
                        // [DEBUG] Trace what tableId/viewId the effect uses when calling handleConnect
                        console.log("[useSheetSocket] handleConnect with", {
                                tableId,
                                viewId,
                        });
                        handleConnect();
                }

                return () => {
                        socket.off("connect", handleConnect);
                        socket.off("recordsFetched", handleRecordsFetched);
                        socket.off("created_row", handleCreatedRow);
                        socket.off("updated_row", handleUpdatedRow);
                        socket.off("deleted_records", handleDeletedRecords);
                        socket.off("created_field", handleCreatedField);
                        socket.off("created_fields", handleCreatedFields);
                        socket.off("updated_field", handleUpdatedField);
                        socket.off("deleted_fields", handleDeletedFields);
                        socket.off("sort_updated", handleSortUpdated);
                        socket.off("group_by_updated", handleGroupByUpdated);
                        socket.off("updated_column_meta", handleUpdatedColumnMeta);
                        socket.off("formula_field_errors", handleFormulaFieldErrors);
                        socket.off("records_changed", handleRecordsChanged);
                        socket.off("fields_changed", handleFieldsChanged);
                        if (shouldReconnect) {
                                if (currentViewRoomRef.current) {
                                        socket.emit("leaveRoom", currentViewRoomRef.current);
                                        currentViewRoomRef.current = null;
                                }
                                if (tableId && currentTableRoomRef.current === tableId) {
                                        socket.emit("leaveRoom", tableId);
                                        currentTableRoomRef.current = null;
                                }
                        }
                        setIsTableLoading(false);
                };
        }, [
                socket,
                tableId,
                assetId,
                viewId,
                insertFieldFromSocket,
                applyFieldUpdate,
                getViews,
                setHasNewRecords,
        ]);

        return { requestRecords };
}
