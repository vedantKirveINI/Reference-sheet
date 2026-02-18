import { useMemo, useState, useContext, useCallback, useEffect } from "react";
import { groupPointsToStacks, getLastRecordInStack } from "@/utils/kanban";
import { SheetsContext } from "@/context/SheetsContext";
import getAssetAccessDetails from "@/pages/MainPage/utils/getAssetAccessDetails";
import { showAlert } from "@/lib/toast";
import { useGroupPoints } from "@/hooks/useGroupPoints";
import type { Socket } from "socket.io-client";
import { getCellValueByStack } from "../utils/drag";
import type { IColumn, IRecord, IRowHeader } from "@/types";
import type {
        IStackData,
        IKanbanPermission,
        IKanbanViewOptions,
} from "@/types/kanban";
import type { IKanbanContext } from "../context/KanbanContext";

interface UseKanbanProviderProps {
        columns?: IColumn[];
        records?: IRecord[];
        rowHeaders?: IRowHeader[];
        groupPoints?: any[];
        options?: IKanbanViewOptions;
        tableId?: string;
        baseId?: string;
        viewId?: string;
        onSaveRecord: (
                recordId: string,
                editedFields: Record<string, unknown>,
        ) => Promise<void>;
        onDeleteRecord?: (recordId: string) => Promise<void>;
        onDuplicateRecord?: (recordId: string) => Promise<void>;
        socket?: Socket;
        emitRowCreate?: (
                anchorId: string | null,
                position: "above" | "below",
                groupByFieldValues?: { [fieldId: string]: unknown },
                allFieldValues?: { [fieldId: string]: unknown },
        ) => Promise<void>;
        canEditRecords?: boolean;
}

export const useKanbanProvider = ({
        columns,
        records,
        rowHeaders = [],
        groupPoints: groupPointsProp,
        options,
        tableId,
        baseId,
        viewId,
        onSaveRecord,
        onDeleteRecord,
        onDuplicateRecord,
        socket,
        emitRowCreate,
        canEditRecords = true,
}: UseKanbanProviderProps) => {
        const [expandRecordId, setExpandRecordId] = useState<string | undefined>();
        const [newRecordStackId, setNewRecordStackId] = useState<string | null>(
                null,
        );
        const [optimisticGroupPoints, setOptimisticGroupPoints] = useState<
                any[] | null
        >(null);

        const context = useContext(SheetsContext);
        const { hasAccess, isViewOnly } = useMemo(
                () => getAssetAccessDetails(context?.assetAccessDetails),
                [context?.assetAccessDetails],
        );

        const { groupPoints: groupPointsFromHook } = useGroupPoints({
                tableId: tableId || "",
                baseId: baseId || "",
                viewId: viewId || "",
                enabled: !!tableId && !!baseId && !!viewId,
        });

        const groupPointsEqual = useCallback((a: any[], b: any[]): boolean => {
                if (a.length !== b.length) return false;
                return a.every((point, i) => {
                        const other = b[i];
                        if (point.type !== other.type) return false;
                        if (point.type === 0) {
                                return (
                                        point.id === other.id &&
                                        point.depth === other.depth &&
                                        point.value === other.value &&
                                        point.count === other.count &&
                                        point.isCollapsed === other.isCollapsed
                                );
                        }
                        return point.count === other.count;
                });
        }, []);

        const updateGroupPointsForStack = useCallback(
                (groupPoints: any[], stackValue: unknown, delta: number): any[] => {
                        let previousCount: number | undefined;
                        let newCount: number | undefined;
                        const result = groupPoints.map((point, index) => {
                                // Keep header (type 0) as-is; only update the row (type 1) that follows the matching header
                                if (point.type === 0 && point.value === stackValue) {
                                        const nextPoint = groupPoints[index + 1];
                                        if (nextPoint && nextPoint.type === 1) {
                                                previousCount = nextPoint.count;
                                                newCount = nextPoint.count + delta;
                                        }
                                        return point; // Keep the header
                                }
                                if (point.type === 1 && index > 0) {
                                        const prevPoint = groupPoints[index - 1];
                                        if (
                                                prevPoint.type === 0 &&
                                                prevPoint.value === stackValue
                                        ) {
                                                newCount = point.count + delta;
                                                previousCount = point.count;
                                                return {
                                                        ...point,
                                                        count: newCount,
                                                };
                                        }
                                }
                                return point;
                        });
                        console.log("[updateGroupPointsForStack]", {
                                stackValue,
                                delta,
                                previousCount,
                                returnedCount: newCount,
                                returnedGroupPoints: result,
                        });
                        return result;
                },
                [],
        );

        const activeGroupPoints = useMemo(() => {
                console.log("Inside useMemo");
                return (
                        optimisticGroupPoints ||
                        groupPointsFromHook ||
                        groupPointsProp ||
                        null
                );
        }, [optimisticGroupPoints, groupPointsFromHook, groupPointsProp]);

        useEffect(() => {
                if (!groupPointsFromHook) return;

                // Only clear optimistic when backend has caught up (same data)
                if (
                        optimisticGroupPoints &&
                        groupPointsEqual(groupPointsFromHook, optimisticGroupPoints)
                ) {
                        setOptimisticGroupPoints(null);
                }
        }, [groupPointsFromHook, optimisticGroupPoints, groupPointsEqual]);

        const activeStackField = useMemo<IColumn | undefined>(() => {
                if (!columns || columns.length === 0) return undefined;
                if (!options?.stackFieldId) return undefined;

                return columns.find(
                        (col) =>
                                (col as any).rawId === options.stackFieldId ||
                                col.id === options.stackFieldId,
                );
        }, [columns, options?.stackFieldId]);

        const stackCollection = useMemo<IStackData[] | null>(() => {
                if (!activeGroupPoints || !activeStackField) return null;

                return groupPointsToStacks(
                        activeGroupPoints,
                        activeStackField,
                        options?.isEmptyStackHidden ?? false,
                );
        }, [activeGroupPoints, activeStackField, options?.isEmptyStackHidden]);

        const primaryField = useMemo<IColumn | undefined>(() => {
                if (!columns || columns.length === 0) return undefined;

                const nameField = columns.find(
                        (col) =>
                                col.id === "name_field" ||
                                col.name.toLowerCase().includes("name"),
                );
                if (nameField) return nameField;

                return columns[0];
        }, [columns]);

        const displayFields = useMemo<IColumn[]>(() => {
                if (!columns || !primaryField) return [];
                return columns.filter((col) => col.id !== primaryField.id);
        }, [columns, primaryField]);

        const permission: IKanbanPermission = useMemo(
                () => ({
                        canEdit: hasAccess && !isViewOnly && canEditRecords,
                }),
                [hasAccess, isViewOnly, canEditRecords],
        );

        const handleRecordUpdate = useCallback(
                async (
                        updates: Array<{
                                recordId: string;
                                fieldId: string;
                                value: unknown;
                                order?: number;
                        }>,
                ) => {
                        if (!socket || !socket.connected) return;
                        if (!tableId || !baseId || !viewId) return;
                        if (!updates.length) return;

                        try {
                                const updatesByRecord = new Map<
                                        string,
                                        {
                                                fieldUpdates: Array<{
                                                        field_id: number;
                                                        data: unknown;
                                                }>;
                                                order?: number;
                                        }
                                >();

                                for (const update of updates) {
                                        const recordId = update.recordId;
                                        const fieldIdNum =
                                                Number(update.fieldId) || parseInt(update.fieldId, 10);

                                        if (Number.isNaN(fieldIdNum)) continue;

                                        if (!updatesByRecord.has(recordId)) {
                                                updatesByRecord.set(recordId, {
                                                        fieldUpdates: [],
                                                        order: update.order,
                                                });
                                        }

                                        const entry = updatesByRecord.get(recordId)!;
                                        entry.fieldUpdates.push({
                                                field_id: fieldIdNum,
                                                data: update.value,
                                        });
                                        if (update.order !== undefined) {
                                                entry.order = update.order;
                                        }
                                }

                                if (updatesByRecord.size === 0) return;

                                const column_values = Array.from(updatesByRecord.entries()).map(
                                        ([recordId, { fieldUpdates, order }]) => {
                                                const row_id =
                                                        Number(recordId) || parseInt(recordId, 10);
                                                return {
                                                        row_id,
                                                        fields_info: fieldUpdates,
                                                        ...(order !== undefined && { order }),
                                                };
                                        },
                                );

                                const payload = {
                                        tableId,
                                        baseId,
                                        viewId,
                                        column_values,
                                };

                                await socket.emit("row_update", payload);
                        } catch (error) {
                                showAlert({
                                        type: "error",
                                        message: "Failed to update record",
                                });
                                throw error;
                        }
                },
                [socket, tableId, baseId, viewId, canEditRecords],
        );

        const handleRecordOrderUpdate = useCallback(
                async (payload: {
                        movedRows: Array<{ __id: string | number }>;
                        orderInfo: {
                                is_above: boolean;
                                __id: string | number;
                                order: number;
                        };
                }) => {
                        if (!socket || !socket.connected) return;
                        if (!tableId || !baseId || !viewId) return;
                        if (!canEditRecords) return;

                        try {
                                const socketPayload = {
                                        tableId,
                                        baseId,
                                        viewId,
                                        moved_rows: payload.movedRows.map((r) => ({
                                                __id: Number(r.__id),
                                        })),
                                        order_info: {
                                                ...payload.orderInfo,
                                                __id: Number(payload.orderInfo.__id),
                                        },
                                };

                                await socket.emit("update_record_orders", socketPayload);
                        } catch (error) {
                                showAlert({
                                        type: "error",
                                        message: "Failed to update record order",
                                });
                                throw error;
                        }
                },
                [socket, tableId, baseId, viewId, canEditRecords],
        );

        const handleAddRecordFromStack = useCallback((stackId: string) => {
                setNewRecordStackId(stackId);
                setExpandRecordId(undefined);
        }, []);

        const onCrossStackMoveComplete = useCallback(
                (sourceStackValue: unknown, targetStackValue: unknown) => {
                        if (!activeGroupPoints) return;
                        let updated = updateGroupPointsForStack(
                                activeGroupPoints,
                                sourceStackValue,
                                -1,
                        );
                        updated = updateGroupPointsForStack(updated, targetStackValue, 1);
                        setOptimisticGroupPoints(updated);
                },
                [activeGroupPoints, updateGroupPointsForStack],
        );

        const handleSaveRecord = useCallback(
                async (
                        recordId: string | undefined,
                        editedFields: Record<string, unknown>,
                ) => {
                        const stackFieldId = options?.stackFieldId;

                        if (!recordId && newRecordStackId) {
                                if (stackFieldId && activeStackField) {
                                        const targetStack = stackCollection?.find(
                                                (s) => s.id === newRecordStackId,
                                        );
                                        if (targetStack) {
                                                const stackValue = getCellValueByStack(targetStack);
                                                editedFields[activeStackField.id] = stackValue;
                                        }
                                }

                                const stackValue = activeStackField
                                        ? editedFields[activeStackField.id]
                                        : undefined;
                                const groupByFieldValues =
                                        activeStackField && stackValue !== undefined
                                                ? { [activeStackField.id]: stackValue }
                                                : undefined;

                                if (!emitRowCreate) {
                                        throw new Error("emitRowCreate is not available");
                                }

                                let anchorId: string | null = null;
                                if (
                                        newRecordStackId &&
                                        activeStackField &&
                                        records &&
                                        rowHeaders.length > 0
                                ) {
                                        const targetStack = stackCollection?.find(
                                                (s) => s.id === newRecordStackId,
                                        );
                                        if (targetStack) {
                                                const lastRecordInfo = getLastRecordInStack(
                                                        records,
                                                        rowHeaders,
                                                        targetStack,
                                                        activeStackField,
                                                );
                                                if (lastRecordInfo) {
                                                        anchorId = lastRecordInfo.record.id;
                                                }
                                        }
                                }

                                try {
                                        await emitRowCreate(
                                                anchorId,
                                                "below",
                                                groupByFieldValues,
                                                editedFields,
                                        );
                                        setNewRecordStackId(null);
                                        setExpandRecordId(undefined);

                                        if (stackValue !== undefined && activeGroupPoints) {
                                                console.log("Inside this");
                                                const updated = updateGroupPointsForStack(
                                                        activeGroupPoints,
                                                        stackValue,
                                                        1,
                                                );
                                                console.log("updated-->>", updated);
                                                setOptimisticGroupPoints(
                                                        (_prev: any[] | null) => updated,
                                                );
                                        }
                                } catch (error) {
                                        setOptimisticGroupPoints(null);
                                        setNewRecordStackId(null);
                                        setExpandRecordId(undefined);
                                        throw error;
                                }
                        } else if (!recordId) {
                                const stackValue = activeStackField
                                        ? editedFields[activeStackField.id]
                                        : undefined;
                                const groupByFieldValues =
                                        activeStackField && stackValue !== undefined
                                                ? { [activeStackField.id]: stackValue }
                                                : undefined;

                                if (!emitRowCreate) {
                                        throw new Error("emitRowCreate is not available");
                                }

                                try {
                                        await emitRowCreate(
                                                null,
                                                "below",
                                                groupByFieldValues,
                                                editedFields,
                                        );
                                        setExpandRecordId(undefined);

                                        if (stackValue !== undefined && activeGroupPoints) {
                                                const updated = updateGroupPointsForStack(
                                                        activeGroupPoints,
                                                        stackValue,
                                                        1,
                                                );
                                                setOptimisticGroupPoints(updated);
                                        }
                                } catch (error) {
                                        setOptimisticGroupPoints(null);
                                        setExpandRecordId(undefined);
                                        throw error;
                                }
                        } else {
                                const currentRecord = records?.find((r) => r.id === recordId);
                                const oldStackValue =
                                        currentRecord && activeStackField
                                                ? currentRecord.cells[activeStackField.id]?.data
                                                : undefined;
                                const newStackValue = activeStackField
                                        ? editedFields[activeStackField.id]
                                        : undefined;

                                const stackFieldChanged =
                                        oldStackValue !== undefined &&
                                        newStackValue !== undefined &&
                                        oldStackValue !== newStackValue;

                                try {
                                        await onSaveRecord(recordId, editedFields);
                                        setExpandRecordId(undefined);

                                        if (stackFieldChanged && activeGroupPoints) {
                                                let updated = updateGroupPointsForStack(
                                                        activeGroupPoints,
                                                        oldStackValue,
                                                        -1,
                                                );
                                                updated = updateGroupPointsForStack(
                                                        updated,
                                                        newStackValue,
                                                        1,
                                                );
                                                setOptimisticGroupPoints(updated);
                                        }
                                } catch (error) {
                                        setOptimisticGroupPoints(null);
                                        setExpandRecordId(undefined);
                                        throw error;
                                }
                        }
                },
                [
                        newRecordStackId,
                        options,
                        activeStackField,
                        stackCollection,
                        emitRowCreate,
                        onSaveRecord,
                        activeGroupPoints,
                        updateGroupPointsForStack,
                        records,
                        rowHeaders,
                ],
        );

        const contextValue = useMemo<IKanbanContext>(
                () => ({
                        stackCollection: stackCollection || undefined,
                        stackField: activeStackField,
                        records,
                        rowHeaders: rowHeaders ?? [],
                        columns,
                        options,
                        permission,
                        primaryField,
                        displayFields,
                        setExpandRecordId,
                        handleAddRecordFromStack,
                        tableId,
                        baseId,
                        viewId,
                        socket,
                        onRecordUpdate: handleRecordUpdate,
                        onRecordOrderUpdate: handleRecordOrderUpdate,
                        onCrossStackMoveComplete,
                }),
                [
                        stackCollection,
                        activeStackField,
                        records,
                        rowHeaders,
                        columns,
                        options,
                        permission,
                        primaryField,
                        displayFields,
                        handleAddRecordFromStack,
                        tableId,
                        baseId,
                        viewId,
                        socket,
                        handleRecordUpdate,
                        handleRecordOrderUpdate,
                        onCrossStackMoveComplete,
                ],
        );

        const expandedRecord = useMemo(() => {
                if (!expandRecordId || !records) return null;
                return records.find((r) => r.id === expandRecordId) || null;
        }, [expandRecordId, records]);

        const recordIds = useMemo(() => {
                if (!records) return [];
                return records.map((r) => r.id);
        }, [records]);

        const isExpandedRecordVisible =
                expandRecordId !== undefined || newRecordStackId !== null;

        const initialFields = useMemo(() => {
                if (!newRecordStackId || !activeStackField) {
                        return undefined;
                }
                const targetStack = stackCollection?.find(
                        (s) => s.id === newRecordStackId,
                );
                if (targetStack) {
                        return { [activeStackField.id]: getCellValueByStack(targetStack) };
                }
                return undefined;
        }, [newRecordStackId, activeStackField, stackCollection]);

        const lockedFields = useMemo(() => {
                if (newRecordStackId && options?.stackFieldId) {
                        return [String(options.stackFieldId)];
                }
                return undefined;
        }, [newRecordStackId, options]);

        return {
                contextValue,
                expandedRecord,
                recordIds,
                isExpandedRecordVisible,
                initialFields,
                lockedFields,
                isViewOnly,
                expandRecordId,
                setExpandRecordId,
                setNewRecordStackId,
                handleSaveRecord,
                onDeleteRecord,
                onDuplicateRecord,
        };
};
