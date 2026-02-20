export interface IGroupPoint {
  type: 0 | 1; // 0 = Header, 1 = Row
  id?: string;
  depth?: number;
  value?: unknown;
  // isCollapsed is a frontend-only state, not stored or managed by backend
  count?: number;
}

export interface IGroupByObject {
  fieldId: number;
  order: 'asc' | 'desc';
  dbFieldName?: string;
  type: string;
}

export interface IGroupByConfig {
  groupObjs: IGroupByObject[];
}
