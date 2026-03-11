import type { Socket } from "socket.io-client";
import type { IColumn, IRecord, IRowHeader } from "@/types";

export interface UseSheetLifecycleOptions {
	socket: Socket | null;
	onClearCellLoading?: (rowId: string, fieldId: string) => void;
	onSetCellLoading?: (fieldId: string, isLoading: boolean) => void;
}

export interface HandleTabClickArgs {
	tableInfo: any;
	isReplace?: boolean;
}

export interface RecordsFetchedPayload {
	viewId?: string;
	fields?: Array<{
		id: number;
		name: string;
		description?: string | null;
		order?: number;
		options?: any;
		type: string;
		cellValueType?: string;
		dbFieldType?: string;
		dbFieldName: string;
		computedFieldMeta?: any;
		fieldFormat?: string;
		entityType?: string;
		identifier?: any;
		fieldsToEnrich?: any;
	}>;
	records?: Array<Record<string, any>>;
	groupPoints?: GroupPointItem[];
}

export interface CreatedRowPayload {
	__id: number;
	__status: string;
	field_id?: number;
	data?: any;
	[dbFieldName: string]: any;
	socket_id?: string;
}

export interface GroupPointItem {
	type: 0 | 1;
	id?: string;
	depth?: number;
	value?: unknown;
	isCollapsed?: boolean;
	count?: number;
}

export interface FormatResult {
	columns: ExtendedColumn[];
	records: IRecord[];
	rowHeaders: IRowHeader[];
	groupPoints?: GroupPointItem[];
}

export type ExtendedColumn = IColumn & {
	rawType?: string;
	rawOptions?: any;
	rawId?: string | number;
	dbFieldName?: string;
	description?: string | null;
	computedFieldMeta?: any;
	fieldFormat?: string;
	entityType?: string;
	identifier?: any;
	fieldsToEnrich?: any;
	status?: string;
	order?: number;
};

export interface UpdatedRowPayload {
	row_id: number;
	fields_info: Array<{
		field_id: number;
		data: any;
	}>;
	enrichedFieldId?: string;
	socket_id?: string;
}
