// Phase 3: Kanban View Root Component
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/KanbanView.tsx

import React from "react";
import { KanbanProvider } from "./context/KanbanProvider";
import { KanbanViewBase } from "./KanbanViewBase";
import type { IColumn, IRecord, IRowHeader } from "@/types";
import type { IKanbanViewOptions } from "@/types/kanban";
import type { Socket } from "socket.io-client";

interface KanbanViewProps {
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
	// Drag and drop support
	socket?: Socket;
	// Record creation handler
	emitRowCreate?: (
		anchorId: string | null,
		position: "above" | "below",
		groupByFieldValues?: { [fieldId: string]: unknown },
		allFieldValues?: { [fieldId: string]: unknown },
	) => Promise<void>;
	/** When false, card edits and drag reorder must not emit socket events. */
	canEditRecords?: boolean;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
	columns,
	records,
	rowHeaders,
	groupPoints,
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
	return (
		<KanbanProvider
			columns={columns}
			records={records}
			rowHeaders={rowHeaders}
			groupPoints={groupPoints}
			options={options}
			tableId={tableId}
			baseId={baseId}
			viewId={viewId}
			onSaveRecord={onSaveRecord}
			onDeleteRecord={onDeleteRecord}
			onDuplicateRecord={onDuplicateRecord}
			socket={socket}
			emitRowCreate={emitRowCreate}
			canEditRecords={canEditRecords}
		>
			<KanbanViewBase />
		</KanbanProvider>
	);
};
