import { IColumn, IRecord } from "./grid";

export interface IContextMenuPosition {
  x: number;
  y: number;
}

export interface IRecordMenu {
  record: IRecord;
  neighborRecords: IRecord[];
  isMultipleSelected: boolean;
  position: IContextMenuPosition;
  deleteRecords: (recordIds: string[]) => void;
  insertRecord: (recordId: string, position: "above" | "below") => void;
  duplicateRecord: (recordId: string) => void;
}

export interface IHeaderMenu {
  columns: IColumn[];
  position: IContextMenuPosition;
  onSelectionClear: () => void;
  onInsertColumn: (columnId: string, position: "left" | "right") => void;
  onDeleteColumn: (columnId: string) => void;
  onDuplicateColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string) => void;
  onFreezeColumn: (columnId: string) => void;
  onHideColumn: (columnId: string) => void;
  onSortColumn: (columnId: string, direction: "asc" | "desc") => void;
}
