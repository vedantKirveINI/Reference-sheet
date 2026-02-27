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

export const DEFAULT_VIEW_TYPE = ViewType.DefaultGrid;

export function isDefaultView(type: ViewType): boolean {
  return type === ViewType.DefaultGrid;
}

export interface IColumnMeta {
  [columnId: string]: {
    width?: number;
    order?: number;
    isHidden?: boolean;
    color?: string | null;
  };
}

export interface IView {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tableId: string;
  type: ViewType;
  sort?: Array<{ field: string; direction: "asc" | "desc" }>;
  filter?: Record<string, unknown>;
  group?: Array<{ field: string; direction: "asc" | "desc" }>;
  options?: Record<string, unknown>;
  order?: number;
  version?: number;
  columnMeta?: IColumnMeta;
  enableShare?: boolean;
  shareId?: string;
  shareMeta?: Record<string, unknown>;
  createdTime?: string;
  lastModifiedTime?: string;
  deletedTime?: string | null;
  createdBy?: string;
  lastModifiedBy?: string;
  source_id?: string;
}

export interface ICreateViewPayload {
  name: string;
  type: ViewType;
  tableId: string;
  description?: string;
  options?: Record<string, unknown>;
}

export interface IRenameViewPayload {
  id: string;
  name: string;
}

export interface IUpdateViewPayload {
  id: string;
  sort?: Array<{ field: string; direction: "asc" | "desc" }>;
  filter?: Record<string, unknown>;
  group?: Array<{ field: string; direction: "asc" | "desc" }>;
  options?: Record<string, unknown>;
  columnMeta?: IColumnMeta;
}

export interface IDeleteViewPayload {
  id: string;
}

export interface IGetViewsPayload {
  tableId: string;
}

export const VIEW_TYPE_DISPLAY_NAMES: Record<ViewType, string> = {
  [ViewType.DefaultGrid]: "Default Grid",
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
