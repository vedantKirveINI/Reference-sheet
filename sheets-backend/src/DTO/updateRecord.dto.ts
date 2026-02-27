export interface UpdateRecord {
  tableId: string;
  baseId: string;
  viewId?: string;
  user_id: string;
  rowId?: number;
  order: number;
  fields_info: Record<string, any>[];
}
