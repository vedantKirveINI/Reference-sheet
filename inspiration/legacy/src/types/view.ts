// View Types - Matching backend DTO structure
// Inspired by Teable's view type system

/** Single editable (default) view per table; only this view receives real-time record events. */
export const DEFAULT_VIEW_TYPE = "default_grid";

export function isDefaultView(view: { type?: string } | null | undefined): boolean {
	return view?.type === DEFAULT_VIEW_TYPE;
}

export enum ViewType {
	DefaultGrid = "default_grid",
	Grid = "grid",
	Kanban = "kanban",
	Calendar = "calendar",
	Gallery = "gallery",
	List = "list",
	Gantt = "gantt",
	Form = "form",
	Timeline = "timeline",
	Section = "section",
}

// View interface matching backend DTO
export interface IView {
	id: string;
	user_id: string | null;
	name: string;
	description: string | null;
	tableId: string;
	type: string; // ViewType as string
	sort: any | null;
	filter: any | null;
	group: any | null;
	options: any | null;
	order: number;
	version: number;
	columnMeta: string;
	enableShare: boolean | null;
	shareId: string | null;
	shareMeta: string | null;
	createdTime: Date | string;
	lastModifiedTime: Date | string | null;
	deletedTime: Date | string | null;
	createdBy: string;
	lastModifiedBy: string | null;
	source_id: string | null;
}

// Payload interfaces for API calls
export interface ICreateViewPayload {
	table_id: string;
	baseId: string;
	name: string;
	type: string; // ViewType
	version?: number;
	columnMeta?: string;
	order?: number;
	createdBy?: string;
	source_id?: string;
	filter?: any;
	sort?: any;
	options?: {
		stackFieldId?: number;
		isEmptyStackHidden?: boolean;
	};
}

export interface IRenameViewPayload {
	id?: string;
	name: string;
	tableId: string;
	baseId: string;
}

export interface IUpdateViewPayload {
	viewId: string;
	tableId: string;
	baseId: string;
	name?: string;
	type?: string;
	description?: string;
	options?: any;
}

export interface IDeleteViewPayload {
	viewId: string;
	tableId: string;
	baseId: string;
}

export interface IGetViewsPayload {
	baseId: string;
	tableId?: string;
	is_field_required?: boolean;
}

// View type display names
export const VIEW_TYPE_DISPLAY_NAMES: Record<ViewType, string> = {
	[ViewType.DefaultGrid]: "Grid (default)",
	[ViewType.Grid]: "Grid",
	[ViewType.Kanban]: "Kanban",
	[ViewType.Calendar]: "Calendar",
	[ViewType.Gallery]: "Gallery",
	[ViewType.List]: "List",
	[ViewType.Gantt]: "Gantt",
	[ViewType.Form]: "Form",
	[ViewType.Timeline]: "Timeline",
	[ViewType.Section]: "Section",
};
