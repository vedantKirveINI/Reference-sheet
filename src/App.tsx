import { MainLayout } from "@/components/layout/main-layout";
import { GridView } from "@/views/grid/grid-view";
import { KanbanView } from "@/views/kanban/kanban-view";
import { HideFieldsModal } from "@/views/grid/hide-fields-modal";
import { ExpandedRecordModal } from "@/views/grid/expanded-record-modal";
import { SortModal, type SortRule } from "@/views/grid/sort-modal";
import { FilterModal, type FilterRule } from "@/views/grid/filter-modal";
import { GroupModal, type GroupRule } from "@/views/grid/group-modal";
import { ExportModal } from "@/views/grid/export-modal";
import { ImportModal } from "@/views/grid/import-modal";
import { ShareModal } from "@/views/sharing/share-modal";
import { generateMockTableData } from "@/lib/mock-data";
import { useState, useMemo, useCallback } from "react";
import { useFieldsStore, useGridViewStore, useViewStore } from "@/stores";
import { ITableData, IRecord, ICell, CellType, IColumn } from "@/types";

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
  const initialData = useMemo(() => generateMockTableData(), []);
  const [tableData, setTableData] = useState<ITableData>(initialData);
  const { hiddenColumnIds, toggleColumnVisibility } = useFieldsStore();
  const { expandedRecordId, setExpandedRecordId } = useGridViewStore();
  const { currentViewId } = useViewStore();

  const isKanbanView = currentViewId === "default-kanban";

  const [sortConfig, setSortConfig] = useState<SortRule[]>([]);
  const [filterConfig, setFilterConfig] = useState<FilterRule[]>([]);
  const [groupConfig, setGroupConfig] = useState<GroupRule[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleColumnReorder = useCallback((fromIndex: number, toIndex: number) => {
    setTableData(prev => {
      const newColumns = [...prev.columns];
      const [moved] = newColumns.splice(fromIndex, 1);
      newColumns.splice(toIndex, 0, moved);
      return { ...prev, columns: newColumns };
    });
  }, []);

  const handleAddRow = useCallback(() => {
    setTableData(prev => {
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
  }, []);

  const handleDeleteRows = useCallback((rowIndices: number[]) => {
    setTableData(prev => {
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
  }, []);

  const handleDuplicateRow = useCallback((rowIndex: number) => {
    setTableData(prev => {
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

  const handleExpandRecord = useCallback((recordId: string) => {
    setExpandedRecordId(recordId);
  }, [setExpandedRecordId]);

  const handleRecordUpdate = useCallback((recordId: string, updatedCells: Record<string, any>) => {
    setTableData(prev => {
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
      const newRecords = prev.records.map(record => {
        if (record.id !== recordId) return record;
        const cell = record.cells[columnId];
        if (!cell) return record;
        return {
          ...record,
          cells: {
            ...record.cells,
            [columnId]: { ...cell, data: value, displayData: value != null ? String(value) : '' } as ICell,
          },
        };
      });
      return { ...prev, records: newRecords };
    });
  }, []);

  const handleInsertRowAbove = useCallback((rowIndex: number) => {
    setTableData(prev => {
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
  }, []);

  const handleInsertRowBelow = useCallback((rowIndex: number) => {
    setTableData(prev => {
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
  }, []);

  const handleDeleteColumn = useCallback((columnId: string) => {
    setTableData(prev => {
      const newColumns = prev.columns.filter(c => c.id !== columnId);
      const newRecords = prev.records.map(record => {
        const newCells = { ...record.cells };
        delete newCells[columnId];
        return { ...record, cells: newCells };
      });
      return { ...prev, columns: newColumns, records: newRecords };
    });
  }, []);

  const handleDuplicateColumn = useCallback((columnId: string) => {
    setTableData(prev => {
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

  const handleSortColumn = useCallback((columnId: string, direction: 'asc' | 'desc') => {
    setSortConfig([{ columnId, direction }]);
  }, []);

  const handleImport = useCallback((records: IRecord[], mode: "append" | "replace") => {
    setTableData(prev => {
      const newRecords = mode === "replace" ? records : [...prev.records, ...records];
      const newRowHeaders = newRecords.map((r, i) => ({
        id: r.id,
        rowIndex: i,
        heightLevel: prev.rowHeaders[0]?.heightLevel ?? 'Short' as any,
      }));
      return { ...prev, records: newRecords, rowHeaders: newRowHeaders };
    });
  }, []);

  const processedData = useMemo(() => {
    let records = [...tableData.records];

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

    const newRowHeaders = records.map((r, i) => ({
      id: r.id,
      rowIndex: i,
      heightLevel: tableData.rowHeaders[0]?.heightLevel ?? ("Short" as any),
    }));

    return { ...tableData, records, rowHeaders: newRowHeaders };
  }, [tableData, sortConfig, filterConfig, groupConfig, searchQuery]);

  const expandedRecord = useMemo(() => {
    if (!expandedRecordId) return null;
    return tableData.records.find(r => r.id === expandedRecordId) ?? null;
  }, [expandedRecordId, tableData.records]);

  return (
    <MainLayout
      onDeleteRows={handleDeleteRows}
      onDuplicateRow={handleDuplicateRow}
      sortCount={sortConfig.length}
      filterCount={filterConfig.length}
      groupCount={groupConfig.length}
      onSearchChange={setSearchQuery}
    >
      {isKanbanView ? (
        <KanbanView
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
        />
      )}
      <HideFieldsModal
        columns={tableData.columns}
        hiddenColumnIds={hiddenColumnIds}
        onToggleColumn={toggleColumnVisibility}
      />
      <ExpandedRecordModal
        open={!!expandedRecordId}
        record={expandedRecord}
        columns={tableData.columns}
        onClose={() => setExpandedRecordId(null)}
        onSave={handleRecordUpdate}
      />
      <SortModal
        columns={tableData.columns}
        sortConfig={sortConfig}
        onApply={setSortConfig}
      />
      <FilterModal
        columns={tableData.columns}
        filterConfig={filterConfig}
        onApply={setFilterConfig}
      />
      <GroupModal
        columns={tableData.columns}
        groupConfig={groupConfig}
        onApply={setGroupConfig}
      />
      <ExportModal
        data={processedData}
        hiddenColumnIds={hiddenColumnIds}
      />
      <ImportModal
        data={tableData}
        onImport={handleImport}
      />
      <ShareModal />
    </MainLayout>
  );
}

export default App;
