import { useState, useMemo, useCallback } from "react";
import { ChevronDown, Settings2 } from "lucide-react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { ITableData, IColumn, CellType, IDropDownOption } from "@/types";
import { GRID_THEME } from "@/views/grid/canvas/theme";
import { KanbanStack } from "./kanban-stack";

interface KanbanViewProps {
  data: ITableData;
  onCellChange: (recordId: string, columnId: string, value: any) => void;
  onAddRow: () => void;
  onDeleteRows: (rowIndices: number[]) => void;
  onDuplicateRow: (rowIndex: number) => void;
  onExpandRecord?: (recordId: string) => void;
}

function getStackableColumns(columns: IColumn[]): IColumn[] {
  return columns.filter(
    (col) => col.type === CellType.SCQ || col.type === CellType.DropDown
  );
}

function getOptionsForColumn(
  column: IColumn,
  data: ITableData
): string[] {
  const optionSet = new Set<string>();

  for (const record of data.records) {
    const cell = record.cells[column.id];
    if (!cell) continue;

    if (cell.type === CellType.SCQ) {
      if ("options" in cell && cell.options?.options) {
        for (const opt of cell.options.options) {
          optionSet.add(opt);
        }
      }
    }

    if (cell.type === CellType.DropDown) {
      if ("options" in cell && cell.options?.options) {
        for (const opt of cell.options.options) {
          if (typeof opt === "string") {
            optionSet.add(opt);
          } else if (opt && typeof opt === "object" && "label" in opt) {
            optionSet.add((opt as IDropDownOption).label);
          }
        }
      }
    }
  }

  return Array.from(optionSet);
}

function getRecordStackValue(
  record: { cells: Record<string, any> },
  columnId: string
): string | null {
  const cell = record.cells[columnId];
  if (!cell || cell.data == null) return null;

  if (cell.type === CellType.SCQ) {
    return typeof cell.data === "string" ? cell.data : null;
  }

  if (cell.type === CellType.DropDown) {
    if (Array.isArray(cell.data)) {
      const first = cell.data[0];
      if (!first) return null;
      if (typeof first === "string") return first;
      if (typeof first === "object" && "label" in first) return first.label;
    }
    if (typeof cell.data === "string") return cell.data;
  }

  return null;
}

export function KanbanView({
  data,
  onCellChange,
  onAddRow,
  onExpandRecord,
}: KanbanViewProps) {
  const stackableColumns = useMemo(() => getStackableColumns(data.columns), [data.columns]);

  const [stackFieldId, setStackFieldId] = useState<string | null>(
    stackableColumns[0]?.id ?? null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibleCardFields, setVisibleCardFields] = useState<Set<string>>(new Set(data.columns.map(c => c.id)));
  const [showCustomize, setShowCustomize] = useState(false);

  const stackColumn = useMemo(
    () => data.columns.find((c) => c.id === stackFieldId) ?? null,
    [data.columns, stackFieldId]
  );

  const options = useMemo(
    () => (stackColumn ? getOptionsForColumn(stackColumn, data) : []),
    [stackColumn, data]
  );

  const stacks = useMemo(() => {
    if (!stackFieldId) return [];

    const grouped: Record<string, typeof data.records> = {};
    const uncategorized: typeof data.records = [];

    for (const opt of options) {
      grouped[opt] = [];
    }

    for (const record of data.records) {
      const value = getRecordStackValue(record, stackFieldId);
      if (value && grouped[value]) {
        grouped[value].push(record);
      } else {
        uncategorized.push(record);
      }
    }

    const result = options.map((opt, idx) => ({
      id: opt,
      title: opt,
      records: grouped[opt] || [],
      colorIdx: idx % GRID_THEME.chipColors.length,
    }));

    if (uncategorized.length > 0 || result.length === 0) {
      result.push({
        id: "__uncategorized__",
        title: "Uncategorized",
        records: uncategorized,
        colorIdx: -1,
      });
    }

    return result;
  }, [stackFieldId, options, data.records]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    
    const newStackValue = destination.droppableId === '__uncategorized__' ? null : destination.droppableId;
    onCellChange(draggableId, stackFieldId!, newStackValue);
  }, [stackFieldId, onCellChange]);

  if (stackableColumns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">No stackable fields</p>
          <p className="mt-1 text-sm text-gray-500">
            Add a Single Choice or Dropdown field to use Kanban view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="flex items-center gap-2 border-b bg-white px-4 py-2">
        <span className="text-xs font-medium text-gray-500">Stack by:</span>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {stackColumn?.name ?? "Select field"}
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] rounded-md border bg-white py-1 shadow-lg">
                {stackableColumns.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => {
                      setStackFieldId(col.id);
                      setShowDropdown(false);
                    }}
                    className={`flex w-full items-center px-3 py-1.5 text-sm transition-colors hover:bg-gray-100 ${
                      col.id === stackFieldId
                        ? "font-medium text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {col.name}
                    <span className="ml-auto text-[10px] text-gray-400">
                      {col.type === CellType.SCQ ? "SCQ" : "Dropdown"}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowCustomize(!showCustomize)}
            className="flex items-center gap-1 rounded-md border px-2.5 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Customize cards
          </button>
          {showCustomize && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCustomize(false)} />
              <div className="absolute left-0 top-full z-20 mt-1 min-w-[220px] rounded-md border bg-white py-1 shadow-lg">
                <div className="px-3 py-1.5 text-xs font-medium text-gray-500">Visible fields</div>
                {data.columns.filter(c => c.id !== stackFieldId).map(col => (
                  <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCardFields.has(col.id)}
                      onChange={(e) => {
                        setVisibleCardFields(prev => {
                          const next = new Set(prev);
                          e.target.checked ? next.add(col.id) : next.delete(col.id);
                          return next;
                        });
                      }}
                      className="rounded"
                    />
                    {col.name}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto px-4 py-3">
          {stacks.map((stack) => {
            const color =
              stack.colorIdx >= 0
                ? GRID_THEME.chipColors[stack.colorIdx]
                : { bg: "#f3f4f6", text: "#6b7280" };
            return (
              <KanbanStack
                key={stack.id}
                id={stack.id}
                title={stack.title}
                records={stack.records}
                columns={data.columns}
                stackFieldId={stackFieldId!}
                colorBg={color.bg}
                colorText={color.text}
                onExpandRecord={onExpandRecord}
                onAddRecord={onAddRow}
                visibleFields={visibleCardFields}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
