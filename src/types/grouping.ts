import { ILinearRow } from "./grid";
import { IRecord, IColumn } from "./grid";

export enum GroupPointType {
  Header = 0,
  Row = 1,
}

export interface IGroupHeaderPoint {
  type: GroupPointType.Header;
  depth: number;
  value: string;
  count: number;
  isCollapsed: boolean;
  path: string[];
}

export interface IGroupRowPoint {
  type: GroupPointType.Row;
  recordId: string;
  rowIndex: number;
}

export type IGroupPoint = IGroupHeaderPoint | IGroupRowPoint;

export interface IGroupLinearRow extends ILinearRow {
  groupDepth?: number;
  groupValue?: string;
  groupCount?: number;
  isGroupHeader?: boolean;
}

export interface IGroupObject {
  value: string;
  records: IRecord[];
  subGroups?: IGroupObject[];
  count: number;
  depth: number;
}

export interface IGroupConfig {
  field: string;
  direction: "asc" | "desc";
}

export interface IGroupColumn {
  column: IColumn;
  direction: "asc" | "desc";
}

export interface IGroupCollection {
  groups: IGroupObject[];
  groupColumns: IGroupColumn[];
  totalCount: number;
}

export interface IGroupTransformationResult {
  linearRows: IGroupLinearRow[];
  groupPoints: IGroupPoint[];
  groupCollection: IGroupCollection;
}
