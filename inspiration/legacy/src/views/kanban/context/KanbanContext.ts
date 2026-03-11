// Phase 3: Kanban Context Definition
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/context/KanbanContext.ts

import type { IColumn, IRecord, IRowHeader } from "@/types";
import type {
	IStackData,
	IKanbanViewOptions,
	IKanbanPermission,
} from "@/types/kanban";
import type { Dispatch, SetStateAction } from "react";
import { createContext } from "react";
import type { Socket } from "socket.io-client";

export interface IKanbanContext {
	// Data
	stackCollection?: IStackData[];
	stackField?: IColumn;
	records?: IRecord[];
	rowHeaders?: IRowHeader[];
	columns?: IColumn[];

	// Configuration
	options?: IKanbanViewOptions;
	permission?: IKanbanPermission;

	// Primary field for card title
	primaryField?: IColumn;

	// Display fields (fields to show on cards, excluding primary)
	displayFields?: IColumn[];

	// Expand record handler
	setExpandRecordId?: Dispatch<SetStateAction<string | undefined>>;

	// Add record from stack handler
	handleAddRecordFromStack?: (stackId: string) => void;

	// Drag and drop support
	tableId?: string;
	baseId?: string;
	viewId?: string;
	socket?: Socket;
	onRecordUpdate?: (
		updates: Array<{
			recordId: string;
			fieldId: string;
			value: unknown;
			order?: number;
		}>,
	) => Promise<void>;
	onRecordOrderUpdate?: (payload: {
		movedRows: Array<{ __id: string | number }>;
		orderInfo: {
			is_above: boolean;
			__id: string | number;
			order: number;
		};
	}) => Promise<void>;
	onCrossStackMoveComplete?: (
		sourceStackValue: unknown,
		targetStackValue: unknown,
	) => void;
}

export const KanbanContext = createContext<IKanbanContext>({});
