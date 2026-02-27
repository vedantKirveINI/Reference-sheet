import React, { type ReactNode } from "react";
import { KanbanContext } from "./KanbanContext";
import { ExpandedRecord } from "@/components/expanded-record";
import { useKanbanProvider } from "../hooks/useKanbanProvider";
import type { IColumn, IRecord, IRowHeader } from "@/types";
import type { IKanbanViewOptions } from "@/types/kanban";
import type { Socket } from "socket.io-client";

interface KanbanProviderProps {
	children: ReactNode;
	// For future: real data props
	columns?: IColumn[];
	records?: IRecord[];
	rowHeaders?: IRowHeader[];
	groupPoints?: any[]; // Keep for backward compatibility, but will use hook instead
	options?: IKanbanViewOptions;
	tableId?: string;
	baseId?: string;
	viewId?: string;
	// Save handler for expanded record
	onSaveRecord: (
		recordId: string,
		editedFields: Record<string, unknown>,
	) => Promise<void>;
	// Phase 4: Action handlers for expanded record
	onDeleteRecord?: (recordId: string) => Promise<void>;
	onDuplicateRecord?: (recordId: string) => Promise<void>;
	socket?: Socket;
	// Record creation handler
	emitRowCreate?: (
		anchorId: string | null,
		position: "above" | "below",
		groupByFieldValues?: { [fieldId: string]: unknown },
		allFieldValues?: { [fieldId: string]: unknown },
	) => Promise<void>;
	canEditRecords?: boolean;
}

export const KanbanProvider: React.FC<KanbanProviderProps> = ({
	children,
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
}) => {
	const {
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
		onDeleteRecord: onDeleteRecordFromHook,
		onDuplicateRecord: onDuplicateRecordFromHook,
	} = useKanbanProvider({
		columns,
		records,
		rowHeaders,
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
		canEditRecords,
	});

	return (
		<KanbanContext.Provider value={contextValue}>
			{children}
			{isExpandedRecordVisible && columns && (
				<ExpandedRecord
					record={expandedRecord}
					columns={columns}
					recordIds={recordIds}
					visible={isExpandedRecordVisible}
					onClose={() => {
						setExpandRecordId(undefined);
						setNewRecordStackId(null);
					}}
					onFieldChange={() => {}}
					onSave={
						// TEMPORARILY DISABLED: Save functionality in Kanban view
						// Reason: Non-default views should not allow editing records/cells
						// To re-enable:
						// 1. Replace the no-op function below with: async (editedFields) => { await handleSaveRecord(expandRecordId || undefined, editedFields); }
						// 2. Change isViewOnly back to: isViewOnly={isViewOnly}
						async () => {
							// Save disabled - no-op function
							// Original implementation (commented out):
							// await handleSaveRecord(expandRecordId || undefined, editedFields);
						}
					}
					isViewOnly={true}
					onDelete={expandRecordId ? onDeleteRecordFromHook : undefined}
					onDuplicate={expandRecordId ? onDuplicateRecordFromHook : undefined}
					onCopyUrl={
						expandRecordId
							? () => {
									const url = new URL(window.location.href);
									url.searchParams.set("recordId", expandRecordId);
									navigator.clipboard.writeText(url.toString());
								}
							: undefined
					}
					onRecordChange={(recordId) => {
						setExpandRecordId(recordId);
					}}
					initialFields={initialFields}
					lockedFields={lockedFields}
				/>
			)}
		</KanbanContext.Provider>
	);
};
