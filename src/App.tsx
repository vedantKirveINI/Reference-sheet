import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MainLayout } from "@/components/layout/main-layout";
import { GridView } from "@/views/grid/grid-view";
import { FooterStatsBar } from "@/views/grid/footer-stats-bar";
import { KanbanView } from "@/views/kanban/kanban-view";
import { CalendarView } from "@/views/calendar/calendar-view";
import { GanttView } from "@/views/gantt/gantt-view";
import { HideFieldsModal } from "@/views/grid/hide-fields-modal";
import { ExpandedRecordModal } from "@/views/grid/expanded-record-modal";
import { type SortRule } from "@/views/grid/sort-modal";
import { type FilterRule } from "@/views/grid/filter-modal";
import { type GroupRule } from "@/views/grid/group-modal";
import { ExportModal } from "@/views/grid/export-modal";
import { ImportModal } from "@/views/grid/import-modal";
import { ShareModal } from "@/views/sharing/share-modal";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useFieldsStore, useGridViewStore, useViewStore, useModalControlStore } from "@/stores";
import { ITableData, IRecord, ICell, CellType, IColumn, ViewType } from "@/types";
import { useSheetData } from "@/hooks/useSheetData";
import { updateColumnMeta, createTable, renameTable, deleteTable, updateSheetName, createField, updateField, updateFieldsStatus } from "@/services/api";
import { generateMockTableData } from "@/lib/mock-data";
import { TableSkeleton } from "@/components/layout/table-skeleton";

export interface GroupHeaderInfo {
  key: string;
  fieldName: string;
  value: string;
  startIndex: number;
  count: number;
}

function createEmptyCell(column: { type: CellType; options?: Record<string, unknown> }): ICell {
  switch (column.type) {
    case CellType.String:
      return { type: CellType.String, data: '', displayData: '' };
    case CellType.Number:
      return { type: CellType.Number, data: null, displayData: '' };
    case CellType.SCQ:
      return { type: CellType.SCQ, data: null, displayData: '', options: { options: (column.options?.options as string[]) ?? [] } };
    case CellType.MCQ:
      return { type: CellType.MCQ, data: [], displayData: '', options: { options: (column.options?.options as string[]) ?? [] } };
    case CellType.YesNo:
      return { type: CellType.YesNo, data: null, displayData: '', options: { options: ['Yes', 'No'] } };
    case CellType.Rating:
      return { type: CellType.Rating, data: null, displayData: '' };
    case CellType.DateTime:
      return { type: CellType.DateTime, data: null, displayData: '', options: { dateFormat: 'MM/DD/YYYY', separator: '/', includeTime: false, isTwentyFourHourFormat: false } };
    case CellType.Currency:
      return { type: CellType.Currency, data: null, displayData: '' };
    case CellType.DropDown:
      return { type: CellType.DropDown, data: null, displayData: '', options: { options: (column.options?.options as string[]) ?? [] } };
    default:
      return { type: CellType.String, data: '', displayData: '' };
  }
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function App() {
  const {
    data: backendData,
    isLoading,
    error,
    usingMockData,
    emitRowCreate,
    emitRowUpdate,
    emitRowInsert,
    deleteRecords,
    tableList,
    sheetName,
    switchTable,
    currentTableId,
    getIds,
    setTableList,
    setSheetName: setBackendSheetName,
    currentView,
  } = useSheetData();

  const [tableData, setTableData] = useState<ITableData | null>(null);
  const { hiddenColumnIds, toggleColumnVisibility } = useFieldsStore();
  const { expandedRecordId, setExpandedRecordId } = useGridViewStore();
  const { views, currentViewId, setViews, setCurrentView: setCurrentViewId } = useViewStore();

  const currentViewObj = views.find(v => v.id === currentViewId);
  const currentViewType = currentViewObj?.type ? String(currentViewObj.type) : 'default_grid';
  const isKanbanView = currentViewType === ViewType.Kanban || currentViewType === 'kanban';
  const isCalendarView = currentViewType === ViewType.Calendar || currentViewType === 'calendar';
  const isGanttView = currentViewType === ViewType.Gantt || currentViewType === 'gantt';

  const [isAddingTable, setIsAddingTable] = useState(false);
  const addingTableRef = useRef(false);
  const [sortConfig, setSortConfig] = useState<SortRule[]>([]);
  const [filterConfig, setFilterConfig] = useState<FilterRule[]>([]);
  const [groupConfig, setGroupConfig] = useState<GroupRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const [initialMockData] = useState(() => generateMockTableData());

  const activeData = useMemo(() => {
    if (tableData) return tableData;
    if (backendData) return backendData;
    return initialMockData;
  }, [tableData, backendData, initialMockData]);

  useEffect(() => {
    if (backendData) {
      setTableData(backendData);
    }
  }, [backendData]);

  useEffect(() => {
    if (!tableList.length || !currentTableId) return;
    const currentTable = tableList.find((t: any) => t.id === currentTableId);
    if (currentTable?.views?.length) {
      const mappedViews = currentTable.views.map((v: any) => ({
        id: v.id,
        name: v.name || 'Untitled View',
        type: v.type || 'default_grid',
        user_id: v.user_id || '',
        tableId: currentTableId,
      }));
      setViews(mappedViews);
      if (!currentViewId || !currentTable.views.find((v: any) => v.id === currentViewId)) {
        setCurrentViewId(currentTable.views[0]?.id || null);
      }
    } else {
      setViews([]);
      setCurrentViewId(null);
    }
  }, [tableList, currentTableId]);

  useEffect(() => {
    setSortConfig([]);
    setFilterConfig([]);
    setGroupConfig([]);
    setSearchQuery("");
    setCollapsedGroups(new Set());
  }, [currentViewId, currentTableId]);

  const currentData = activeData;

  const handleSheetNameChange = useCallback(async (name: string) => {
    setBackendSheetName(name);
    if (usingMockData) return;
    const ids = getIds();
    if (!ids.assetId) return;
    try {
      await updateSheetName({ baseId: ids.assetId, name });
    } catch (err) {
      console.error('Failed to update sheet name:', err);
    }
  }, [usingMockData, getIds, setBackendSheetName]);

  const handleToggleGroup = useCallback((groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }, []);

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setTableData(prev => {
      if (!prev) return prev;
      const newColumns = [...prev.columns];
      const [moved] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, moved);
      return { ...prev, columns: newColumns };
    });
  }, []);

  const handleAddRow = useCallback(() => {
    if (!usingMockData) {
      emitRowCreate();
      return;
    }
    setTableData(prev => {
      if (!prev) return prev;
      const newId = `rec_${generateId()}`;
      const cells: Record<string, ICell> = {};
      for (const col of prev.columns) {
        cells[col.id] = createEmptyCell(col);
      }
      const newRecord: IRecord = { id: newId, cells };
      return {
        ...prev,
        records: [...prev.records, newRecord],
        rowHeaders: [...prev.rowHeaders, {
          id: newId,
          rowIndex: prev.records.length,
          heightLevel: prev.rowHeaders[0]?.heightLevel ?? 'Short' as any,
        }],
      };
    });
  }, [usingMockData, emitRowCreate]);

  const executeDeleteRows = useCallback((rowIndices: number[]) => {
    if (!currentData) return;
    if (!usingMockData) {
      const recordIds = rowIndices
        .map(idx => currentData.records[idx]?.id)
        .filter(Boolean) as string[];
      if (recordIds.length > 0) {
        deleteRecords(recordIds);
      }
      return;
    }
    setTableData(prev => {
      if (!prev) return prev;
      const sorted = [...rowIndices].sort((a, b) => b - a);
      const newRecords = [...prev.records];
      const newRowHeaders = [...prev.rowHeaders];
      for (const idx of sorted) {
        if (idx >= 0 && idx < newRecords.length) {
          newRecords.splice(idx, 1);
          if (idx < newRowHeaders.length) {
            newRowHeaders.splice(idx, 1);
          }
        }
      }
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, [usingMockData, deleteRecords, currentData]);

  const handleDeleteRows = useCallback((rowIndices: number[]) => {
    const count = rowIndices.length;
    setConfirmDialog({
      open: true,
      title: count > 1 ? `Delete ${count} rows` : 'Delete row',
      description: count > 1
        ? `Are you sure you want to delete ${count} rows? This action cannot be undone.`
        : 'Are you sure you want to delete this row? This action cannot be undone.',
      onConfirm: () => executeDeleteRows(rowIndices),
    });
  }, [executeDeleteRows]);

  const handleDuplicateRow = useCallback((rowIndex: number) => {
    setTableData(prev => {
      if (!prev) return prev;
      const original = prev.records[rowIndex];
      if (!original) return prev;
      const newId = `rec_${generateId()}`;
      const newCells: Record<string, ICell> = {};
      for (const [key, cell] of Object.entries(original.cells)) {
        newCells[key] = { ...cell } as ICell;
      }
      const newRecord: IRecord = { id: newId, cells: newCells };
      const newRecords = [...prev.records];
      newRecords.splice(rowIndex + 1, 0, newRecord);
      const newRowHeaders = [...prev.rowHeaders];
      newRowHeaders.splice(rowIndex + 1, 0, {
        id: newId,
        rowIndex: rowIndex + 1,
        heightLevel: prev.rowHeaders[rowIndex]?.heightLevel ?? 'Short' as any,
      });
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, []);

  const handleAddTable = useCallback(async () => {
    if (addingTableRef.current) return;
    addingTableRef.current = true;
    setIsAddingTable(true);
    const baseId = getIds().assetId;
    const newTableName = `Table ${tableList.length + 1}`;
    try {
      const res = await createTable({ baseId, name: newTableName });
      const newTable = res.data?.data || res.data;
      if (newTable?.id) {
        setTableList((prev: any[]) => {
          if (prev.some((t: any) => t.id === newTable.id)) return prev;
          return [...prev, { id: newTable.id, name: newTable.name || newTableName, views: newTable.views || [] }];
        });
        switchTable(newTable.id);
      }
    } catch (err) {
      console.error('Failed to create table:', err);
    } finally {
      addingTableRef.current = false;
      setIsAddingTable(false);
    }
  }, [tableList.length, getIds, setTableList, switchTable]);

  const handleRenameTable = useCallback((tableId: string, newName: string) => {
    const baseId = getIds().assetId;
    setTableList((prev: any[]) => prev.map((t: any) => t.id === tableId ? { ...t, name: newName } : t));
    renameTable({ baseId, tableId, name: newName }).catch(err => {
      console.error('Failed to rename table:', err);
    });
  }, [getIds, setTableList]);

  const handleDeleteTable = useCallback((tableId: string) => {
    const baseId = getIds().assetId;
    setTableList((prev: any[]) => {
      const remaining = prev.filter((t: any) => t.id !== tableId);
      if (remaining.length > 0 && currentTableId === tableId) {
        const deletedIdx = prev.findIndex((t: any) => t.id === tableId);
        const nextTable = deletedIdx > 0 ? remaining[deletedIdx - 1] : remaining[0];
        switchTable(nextTable.id);
      }
      return remaining;
    });
    deleteTable({ baseId, tableId }).catch(err => {
      console.error('Failed to delete table:', err);
    });
  }, [getIds, setTableList, switchTable, currentTableId]);

  const handleExpandRecord = useCallback((recordId: string) => {
    setExpandedRecordId(recordId);
  }, [setExpandedRecordId]);

  const handleRecordUpdate = useCallback((recordId: string, updatedCells: Record<string, any>) => {
    setTableData(prev => {
      if (!prev) return prev;
      const newRecords = prev.records.map(record => {
        if (record.id !== recordId) return record;
        const newCellsMap = { ...record.cells };
        for (const [colId, value] of Object.entries(updatedCells)) {
          if (newCellsMap[colId]) {
            const existingCell = newCellsMap[colId];
            newCellsMap[colId] = {
              ...existingCell,
              data: value,
              displayData: value != null ? String(value) : '',
            } as ICell;
          }
        }
        return { ...record, cells: newCellsMap };
      });
      return { ...prev, records: newRecords };
    });
  }, []);

  const handleCellChange = useCallback((recordId: string, columnId: string, value: any) => {
    setTableData(prev => {
      if (!prev) return prev;
      const recordIndex = prev.records.findIndex(r => r.id === recordId);
      if (recordIndex === -1) return prev;
      const record = prev.records[recordIndex];
      const cell = record.cells[columnId];
      if (!cell) return prev;

      const updatedCell = { ...cell, data: value, displayData: value != null ? String(value) : '' } as ICell;

      if (!usingMockData) {
        emitRowUpdate(recordIndex, columnId, updatedCell);
      }

      const newRecords = prev.records.map(r => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          cells: {
            ...r.cells,
            [columnId]: updatedCell,
          },
        };
      });
      return { ...prev, records: newRecords };
    });
  }, [usingMockData, emitRowUpdate]);

  const handleInsertRowAbove = useCallback((rowIndex: number) => {
    if (!currentData) return;
    const targetRecord = currentData.records[rowIndex];
    if (!targetRecord) return;

    if (!usingMockData) {
      emitRowInsert(targetRecord.id, 'before');
      return;
    }

    setTableData(prev => {
      if (!prev) return prev;
      const newId = `rec_${generateId()}`;
      const cells: Record<string, ICell> = {};
      for (const col of prev.columns) {
        cells[col.id] = createEmptyCell(col);
      }
      const newRecord: IRecord = { id: newId, cells };
      const newRecords = [...prev.records];
      newRecords.splice(rowIndex, 0, newRecord);
      const newRowHeaders = [...prev.rowHeaders];
      newRowHeaders.splice(rowIndex, 0, {
        id: newId,
        rowIndex,
        heightLevel: prev.rowHeaders[0]?.heightLevel ?? 'Short' as any,
      });
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, [currentData, usingMockData, emitRowInsert]);

  const handleInsertRowBelow = useCallback((rowIndex: number) => {
    if (!currentData) return;
    const targetRecord = currentData.records[rowIndex];
    if (!targetRecord) return;

    if (!usingMockData) {
      emitRowInsert(targetRecord.id, 'after');
      return;
    }

    setTableData(prev => {
      if (!prev) return prev;
      const newId = `rec_${generateId()}`;
      const cells: Record<string, ICell> = {};
      for (const col of prev.columns) {
        cells[col.id] = createEmptyCell(col);
      }
      const newRecord: IRecord = { id: newId, cells };
      const newRecords = [...prev.records];
      newRecords.splice(rowIndex + 1, 0, newRecord);
      const newRowHeaders = [...prev.rowHeaders];
      newRowHeaders.splice(rowIndex + 1, 0, {
        id: newId,
        rowIndex: rowIndex + 1,
        heightLevel: prev.rowHeaders[0]?.heightLevel ?? 'Short' as any,
      });
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, [currentData, usingMockData, emitRowInsert]);

  const handleFieldSave = useCallback(async (fieldData: any) => {
    const ids = getIds();
    if (fieldData.mode === 'create') {
      const tempColId = `col_${generateId()}`;
      const newColumn: IColumn = {
        id: tempColId,
        name: fieldData.fieldName,
        type: fieldData.fieldType,
        width: 150,
        options: fieldData.options,
      };
      setTableData(prev => {
        if (!prev) return prev;
        const newColumns = [...prev.columns, newColumn];
        const newRecords = prev.records.map(record => ({
          ...record,
          cells: { ...record.cells, [tempColId]: createEmptyCell(newColumn) },
        }));
        return { ...prev, columns: newColumns, records: newRecords };
      });
      if (!usingMockData && ids.tableId && ids.assetId) {
        try {
          const lastCol = currentData?.columns[currentData.columns.length - 1];
          const newOrder = lastCol ? (Number(lastCol.order ?? currentData.columns.length) + 1) : 1;
          const res = await createField({
            baseId: ids.assetId,
            tableId: ids.tableId,
            viewId: ids.viewId,
            name: fieldData.fieldName,
            type: fieldData.fieldType,
            order: newOrder,
            options: fieldData.options,
          });
          const serverField = res.data?.field || res.data?.data || res.data;
          if (serverField?.id) {
            setTableData(prev => {
              if (!prev) return prev;
              const newColumns = prev.columns.map(c =>
                c.id === tempColId ? { ...c, id: serverField.id, order: serverField.order } : c
              );
              const newRecords = prev.records.map(record => {
                if (!(tempColId in record.cells)) return record;
                const newCells = { ...record.cells };
                newCells[serverField.id] = newCells[tempColId];
                delete newCells[tempColId];
                return { ...record, cells: newCells };
              });
              return { ...prev, columns: newColumns, records: newRecords };
            });
          }
        } catch (err) {
          console.error('Failed to create field:', err);
          setTableData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              columns: prev.columns.filter(c => c.id !== tempColId),
              records: prev.records.map(r => {
                const newCells = { ...r.cells };
                delete newCells[tempColId];
                return { ...r, cells: newCells };
              }),
            };
          });
        }
      }
    } else if (fieldData.mode === 'edit' && fieldData.fieldId) {
      setTableData(prev => {
        if (!prev) return prev;
        const newColumns = prev.columns.map(c =>
          c.id === fieldData.fieldId ? { ...c, name: fieldData.fieldName, type: fieldData.fieldType, options: fieldData.options } : c
        );
        return { ...prev, columns: newColumns };
      });
      if (!usingMockData && ids.tableId && ids.assetId) {
        try {
          const col = currentData?.columns.find(c => c.id === fieldData.fieldId);
          await updateField({
            baseId: ids.assetId,
            tableId: ids.tableId,
            viewId: ids.viewId,
            id: fieldData.fieldId,
            name: fieldData.fieldName,
            type: fieldData.fieldType,
            order: col?.order,
            options: fieldData.options,
          });
        } catch (err) {
          console.error('Failed to update field:', err);
        }
      }
    }
  }, [usingMockData, getIds, currentData]);

  const executeDeleteColumn = useCallback(async (columnId: string) => {
    const snapshot = currentData;
    setTableData(prev => {
      if (!prev) return prev;
      const newColumns = prev.columns.filter(c => c.id !== columnId);
      const newRecords = prev.records.map(record => {
        const newCells = { ...record.cells };
        delete newCells[columnId];
        return { ...record, cells: newCells };
      });
      return { ...prev, columns: newColumns, records: newRecords };
    });
    if (!usingMockData) {
      const ids = getIds();
      if (ids.tableId && ids.assetId) {
        try {
          const numId = Number(columnId);
          const fieldIdForApi = Number.isNaN(numId) ? columnId : numId;
          await updateFieldsStatus({
            baseId: ids.assetId,
            tableId: ids.tableId,
            viewId: ids.viewId,
            fields: [{ id: fieldIdForApi as number, status: 'inactive' }],
          });
        } catch (err) {
          console.error('Failed to delete field:', err);
          if (snapshot) {
            setTableData(snapshot);
          }
        }
      }
    }
  }, [usingMockData, getIds, currentData]);

  const handleDeleteColumn = useCallback((columnId: string) => {
    const column = currentData?.columns.find(c => c.id === columnId);
    const columnName = column?.name ?? 'this field';
    setConfirmDialog({
      open: true,
      title: 'Delete field',
      description: `Are you sure you want to delete "${columnName}"? All data in this field will be permanently lost.`,
      onConfirm: () => executeDeleteColumn(columnId),
    });
  }, [executeDeleteColumn, currentData]);

  const handleDuplicateColumn = useCallback((columnId: string) => {
    setTableData(prev => {
      if (!prev) return prev;
      const colIndex = prev.columns.findIndex(c => c.id === columnId);
      if (colIndex === -1) return prev;
      const original = prev.columns[colIndex];
      const newColId = `col_${generateId()}`;
      const newColumn: IColumn = {
        ...original,
        id: newColId,
        name: `${original.name} (copy)`,
      };
      const newColumns = [...prev.columns];
      newColumns.splice(colIndex + 1, 0, newColumn);
      const newRecords = prev.records.map(record => {
        const originalCell = record.cells[columnId];
        const newCells = { ...record.cells };
        if (originalCell) {
          newCells[newColId] = { ...originalCell } as ICell;
        } else {
          newCells[newColId] = createEmptyCell(newColumn);
        }
        return { ...record, cells: newCells };
      });
      return { ...prev, columns: newColumns, records: newRecords };
    });
  }, []);

  const handleInsertColumnBefore = useCallback((columnId: string) => {
    setTableData(prev => {
      if (!prev) return prev;
      const colIndex = prev.columns.findIndex(c => c.id === columnId);
      if (colIndex === -1) return prev;
      const newColId = `col_${generateId()}`;
      const newColumn: IColumn = {
        id: newColId,
        name: 'New Field',
        type: CellType.String,
        width: 150,
      };
      const newColumns = [...prev.columns];
      newColumns.splice(colIndex, 0, newColumn);
      const newRecords = prev.records.map(record => {
        const newCells = { ...record.cells };
        newCells[newColId] = createEmptyCell(newColumn);
        return { ...record, cells: newCells };
      });
      return { ...prev, columns: newColumns, records: newRecords };
    });
  }, []);

  const handleInsertColumnAfter = useCallback((columnId: string) => {
    setTableData(prev => {
      if (!prev) return prev;
      const colIndex = prev.columns.findIndex(c => c.id === columnId);
      if (colIndex === -1) return prev;
      const newColId = `col_${generateId()}`;
      const newColumn: IColumn = {
        id: newColId,
        name: 'New Field',
        type: CellType.String,
        width: 150,
      };
      const newColumns = [...prev.columns];
      newColumns.splice(colIndex + 1, 0, newColumn);
      const newRecords = prev.records.map(record => {
        const newCells = { ...record.cells };
        newCells[newColId] = createEmptyCell(newColumn);
        return { ...record, cells: newCells };
      });
      return { ...prev, columns: newColumns, records: newRecords };
    });
  }, []);

  const handleHideColumn = useCallback((columnId: string) => {
    toggleColumnVisibility(columnId);
  }, [toggleColumnVisibility]);

  const handleHideFieldsPersist = useCallback(async (hiddenIds: Set<string>) => {
    if (usingMockData || !currentData) return;
    const ids = getIds();
    if (!ids.assetId || !ids.tableId || !ids.viewId) return;
    try {
      const columnMeta: Record<string, any> = {};
      currentData.columns.forEach(col => {
        columnMeta[col.id] = {
          hidden: hiddenIds.has(col.id),
          width: col.width || 150,
        };
      });
      await updateColumnMeta({
        baseId: ids.assetId,
        tableId: ids.tableId,
        viewId: ids.viewId,
        columnMeta,
      });
    } catch (err) {
      console.error('Failed to persist column visibility:', err);
    }
  }, [usingMockData, currentData, getIds]);

  const handleSortColumn = useCallback((columnId: string, direction: 'asc' | 'desc') => {
    setSortConfig([{ columnId, direction }]);
  }, []);

  const handleImport = useCallback((records: IRecord[], mode: "append" | "replace") => {
    setTableData(prev => {
      if (!prev) return prev;
      const newRecords = mode === "replace" ? records : [...prev.records, ...records];
      const newRowHeaders = newRecords.map((r, i) => ({
        id: r.id,
        rowIndex: i,
        heightLevel: prev.rowHeaders[0]?.heightLevel ?? 'Short' as any,
      }));
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, []);

  const handleFilterByColumn = useCallback((columnId: string) => {
    const column = currentData?.columns.find(c => c.id === columnId);
    if (!column) return;
    const newRule: FilterRule = {
      columnId,
      operator: 'contains',
      value: '',
      conjunction: 'and',
    };
    setFilterConfig(prev => {
      const existing = prev.find(r => r.columnId === columnId);
      if (existing) return prev;
      return [...prev, newRule];
    });
    useModalControlStore.getState().openFilter();
  }, [currentData]);

  const handleGroupByColumn = useCallback((columnId: string) => {
    const column = currentData?.columns.find(c => c.id === columnId);
    if (!column) return;
    const newRule: GroupRule = {
      columnId,
      direction: 'asc',
    };
    setGroupConfig(prev => {
      const existing = prev.find(r => r.columnId === columnId);
      if (existing) return prev;
      return [...prev, newRule];
    });
    useModalControlStore.getState().openGroupBy();
  }, [currentData]);

  const handleFreezeColumn = useCallback((_columnId: string) => {
    console.log('[Freeze] Column frozen:', _columnId);
  }, []);

  const handleUnfreezeColumns = useCallback(() => {
    console.log('[Freeze] All columns unfrozen');
  }, []);

  const sortedColumnIds = useMemo(() => new Set(sortConfig.map(r => r.columnId)), [sortConfig]);
  const filteredColumnIds = useMemo(() => new Set(filterConfig.map(r => r.columnId)), [filterConfig]);
  const groupedColumnIds = useMemo(() => new Set(groupConfig.map(r => r.columnId)), [groupConfig]);

  const processedData = useMemo(() => {
    if (!currentData) return null;
    let records = [...currentData.records];

    if (filterConfig.length > 0) {
      records = records.filter((record) => {
        const results = filterConfig.map((rule) => {
          const cell = record.cells[rule.columnId];
          if (!cell) return false;
          const cellData = cell.data;
          const displayData = cell.displayData ?? "";
          const op = rule.operator;

          if (op === "is_empty") return cellData == null || displayData === "";
          if (op === "is_not_empty") return cellData != null && displayData !== "";
          if (op === "is_yes") return String(cellData).toLowerCase() === "yes";
          if (op === "is_no") return String(cellData).toLowerCase() === "no";

          const val = rule.value;
          const strData = String(displayData).toLowerCase();
          const strVal = val.toLowerCase();

          switch (op) {
            case "contains": return strData.includes(strVal);
            case "does_not_contain": return !strData.includes(strVal);
            case "equals":
            case "is": return strData === strVal;
            case "does_not_equal":
            case "is_not": return strData !== strVal;
            case "not_equals": return strData !== strVal;
            case "greater_than": return Number(cellData) > Number(val);
            case "less_than": return Number(cellData) < Number(val);
            case "greater_or_equal": return Number(cellData) >= Number(val);
            case "less_or_equal": return Number(cellData) <= Number(val);
            case "is_before": return String(cellData) < val;
            case "is_after": return String(cellData) > val;
            default: return true;
          }
        });

        if (filterConfig.length <= 1) return results[0] ?? true;

        let result = results[0] ?? true;
        for (let i = 1; i < filterConfig.length; i++) {
          const conj = filterConfig[i].conjunction;
          if (conj === "or") {
            result = result || (results[i] ?? true);
          } else {
            result = result && (results[i] ?? true);
          }
        }
        return result;
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      records = records.filter((record) =>
        Object.values(record.cells).some((cell) => {
          const display = cell.displayData ?? "";
          return String(display).toLowerCase().includes(query);
        })
      );
    }

    const getCellSortValue = (record: IRecord, columnId: string): string | number => {
      const cell = record.cells[columnId];
      if (!cell) return "";
      if (cell.data == null) return "";
      if (typeof cell.data === "number") return cell.data;
      return String(cell.displayData ?? cell.data).toLowerCase();
    };

    const compareRecords = (a: IRecord, b: IRecord, rules: { columnId: string; direction: "asc" | "desc" }[]): number => {
      for (const rule of rules) {
        const aVal = getCellSortValue(a, rule.columnId);
        const bVal = getCellSortValue(b, rule.columnId);
        let cmp = 0;
        if (typeof aVal === "number" && typeof bVal === "number") {
          cmp = aVal - bVal;
        } else {
          cmp = String(aVal).localeCompare(String(bVal));
        }
        if (cmp !== 0) return rule.direction === "desc" ? -cmp : cmp;
      }
      return 0;
    };

    if (groupConfig.length > 0) {
      const allSortRules = [...groupConfig, ...sortConfig];
      records.sort((a, b) => compareRecords(a, b, allSortRules));
    } else if (sortConfig.length > 0) {
      records.sort((a, b) => compareRecords(a, b, sortConfig));
    }

    if (groupConfig.length > 0) {
      const groupCol = currentData.columns.find(c => c.id === groupConfig[0].columnId);
      if (groupCol) {
        let groups: GroupHeaderInfo[] = [];
        let currentValue: string | null = null;
        let currentStart = 0;
        let currentCount = 0;

        records.forEach((record, index) => {
          const cell = record.cells[groupConfig[0].columnId];
          const val = cell?.displayData ?? '';
          if (val !== currentValue) {
            if (currentValue !== null) {
              groups.push({
                key: `${groupCol.name}:${currentValue}`,
                fieldName: groupCol.name,
                value: currentValue,
                startIndex: currentStart,
                count: currentCount,
              });
            }
            currentValue = val;
            currentStart = index;
            currentCount = 1;
          } else {
            currentCount++;
          }
        });
        if (currentValue !== null) {
          groups.push({
            key: `${groupCol.name}:${currentValue}`,
            fieldName: groupCol.name,
            value: currentValue,
            startIndex: currentStart,
            count: currentCount,
          });
        }

        const recordsWithHeaders: IRecord[] = [];
        for (const group of groups) {
          const isCollapsed = collapsedGroups.has(group.key);
          const markerRecord: IRecord = {
            id: `__group__${group.key}`,
            cells: {
              '__group_meta__': {
                type: CellType.String,
                data: {
                  fieldName: group.fieldName,
                  value: group.value,
                  count: group.count,
                  isCollapsed,
                  key: group.key,
                } as any,
                displayData: group.value,
              } as any,
            },
          };
          recordsWithHeaders.push(markerRecord);
          if (!isCollapsed) {
            for (let i = group.startIndex; i < group.startIndex + group.count; i++) {
              recordsWithHeaders.push(records[i]);
            }
          }
        }
        records = recordsWithHeaders;
      }
    }

    const newRowHeaders = records.map((r, i) => ({
      id: r.id,
      rowIndex: i,
      heightLevel: currentData.rowHeaders[0]?.heightLevel ?? ("Short" as any),
    }));

    return { ...currentData, records, rowHeaders: newRowHeaders };
  }, [currentData, sortConfig, filterConfig, groupConfig, searchQuery, collapsedGroups]);

  const expandedRecord = useMemo(() => {
    if (!expandedRecordId || !currentData) return null;
    return currentData.records.find(r => r.id === expandedRecordId) ?? null;
  }, [expandedRecordId, currentData]);

  const expandedRecordIndex = useMemo(() => {
    if (!expandedRecordId || !currentData) return -1;
    return currentData.records.findIndex(r => r.id === expandedRecordId);
  }, [expandedRecordId, currentData]);

  const handleExpandPrev = useCallback(() => {
    if (!currentData || expandedRecordIndex <= 0) return;
    setExpandedRecordId(currentData.records[expandedRecordIndex - 1].id);
  }, [currentData, expandedRecordIndex, setExpandedRecordId]);

  const handleExpandNext = useCallback(() => {
    if (!currentData || expandedRecordIndex >= currentData.records.length - 1) return;
    setExpandedRecordId(currentData.records[expandedRecordIndex + 1].id);
  }, [currentData, expandedRecordIndex, setExpandedRecordId]);

  const handleDeleteExpandedRecord = useCallback((recordId: string) => {
    if (!currentData) return;
    const idx = currentData.records.findIndex(r => r.id === recordId);
    if (idx === -1) return;
    setConfirmDialog({
      open: true,
      title: 'Delete record',
      description: 'Are you sure you want to delete this record? This action cannot be undone.',
      onConfirm: () => {
        executeDeleteRows([idx]);
        setExpandedRecordId(null);
      },
    });
  }, [currentData, executeDeleteRows, setExpandedRecordId]);

  const handleDuplicateExpandedRecord = useCallback((recordId: string) => {
    if (!currentData) return;
    const idx = currentData.records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      handleDuplicateRow(idx);
    }
    setExpandedRecordId(null);
  }, [currentData, handleDuplicateRow, setExpandedRecordId]);

  if (!processedData) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <MainLayout
      tables={tableList.map((t: any) => ({ id: t.id, name: t.name }))}
      activeTableId={currentTableId}
      onTableSelect={switchTable}
      onAddTable={handleAddTable}
      isAddingTable={isAddingTable}
      onRenameTable={handleRenameTable}
      onDeleteTable={handleDeleteTable}
      onDeleteRows={handleDeleteRows}
      onDuplicateRow={handleDuplicateRow}
      sortCount={sortConfig.length}
      onSearchChange={setSearchQuery}
      columns={currentData?.columns ?? []}
      sortConfig={sortConfig}
      onSortApply={setSortConfig}
      filterConfig={filterConfig}
      onFilterApply={setFilterConfig}
      groupConfig={groupConfig}
      onGroupApply={setGroupConfig}
      baseId={getIds().assetId}
      tableId={currentTableId}
      sheetName={sheetName}
      onSheetNameChange={handleSheetNameChange}
      onAddRow={handleAddRow}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          {isKanbanView ? (
            <KanbanView
              data={processedData}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onDeleteRows={handleDeleteRows}
              onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
            />
          ) : isCalendarView ? (
            <CalendarView
              data={processedData}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onDeleteRows={handleDeleteRows}
              onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
            />
          ) : isGanttView ? (
            <GanttView
              data={processedData}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onDeleteRows={handleDeleteRows}
              onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
            />
          ) : (
            <GridView
              data={processedData}
              hiddenColumnIds={hiddenColumnIds}
              onColumnReorder={handleColumnReorder}
              onCellChange={handleCellChange}
              onAddRow={handleAddRow}
              onDeleteRows={handleDeleteRows}
              onDuplicateRow={handleDuplicateRow}
              onExpandRecord={handleExpandRecord}
              onInsertRowAbove={handleInsertRowAbove}
              onInsertRowBelow={handleInsertRowBelow}
              onDeleteColumn={handleDeleteColumn}
              onDuplicateColumn={handleDuplicateColumn}
              onInsertColumnBefore={handleInsertColumnBefore}
              onInsertColumnAfter={handleInsertColumnAfter}
              onSortColumn={handleSortColumn}
              onHideColumn={handleHideColumn}
              onFilterByColumn={handleFilterByColumn}
              onGroupByColumn={handleGroupByColumn}
              onFreezeColumn={handleFreezeColumn}
              onUnfreezeColumns={handleUnfreezeColumns}
              onToggleGroup={handleToggleGroup}
              onFieldSave={handleFieldSave}
              sortedColumnIds={sortedColumnIds}
              filteredColumnIds={filteredColumnIds}
              groupedColumnIds={groupedColumnIds}
            />
          )}
        </div>
        {processedData && (
          <FooterStatsBar
            data={processedData}
            totalRecordCount={currentData?.records.filter(r => !r.id?.startsWith('__group__')).length ?? 0}
            visibleRecordCount={processedData.records.filter(r => !r.id?.startsWith('__group__')).length}
            sortCount={sortConfig.length}
            filterCount={filterConfig.length}
            groupCount={groupConfig.length}
          />
        )}
      </div>
      <HideFieldsModal
        columns={currentData?.columns ?? []}
        hiddenColumnIds={hiddenColumnIds}
        onToggleColumn={toggleColumnVisibility}
        onPersist={handleHideFieldsPersist}
      />
      <ExpandedRecordModal
        open={!!expandedRecordId}
        record={expandedRecord}
        columns={currentData?.columns ?? []}
        onClose={() => setExpandedRecordId(null)}
        onSave={handleRecordUpdate}
        onDelete={handleDeleteExpandedRecord}
        onDuplicate={handleDuplicateExpandedRecord}
        onPrev={handleExpandPrev}
        onNext={handleExpandNext}
        hasPrev={expandedRecordIndex > 0}
        hasNext={currentData ? expandedRecordIndex < currentData.records.length - 1 : false}
        currentIndex={expandedRecordIndex}
        totalRecords={currentData?.records.length}
      />
      <ExportModal
        data={processedData}
        hiddenColumnIds={hiddenColumnIds}
      />
      <ImportModal
        data={currentData ?? { columns: [], records: [], rowHeaders: [] }}
        onImport={handleImport}
      />
      <ShareModal />
      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </MainLayout>
  );
}

export default App;
