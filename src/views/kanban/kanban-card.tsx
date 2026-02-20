import { GripVertical } from "lucide-react";
import { IRecord, IColumn, CellType } from "@/types";
import { GRID_THEME } from "@/views/grid/canvas/theme";

interface KanbanCardProps {
  record: IRecord;
  columns: IColumn[];
  stackFieldId: string;
  onExpandRecord?: (recordId: string) => void;
  onDragStart: (e: React.DragEvent, recordId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

function getCellDisplayValue(record: IRecord, column: IColumn): string {
  const cell = record.cells[column.id];
  if (!cell) return "";
  if (cell.displayData) return cell.displayData;
  if (cell.data == null) return "";
  if (typeof cell.data === "string") return cell.data;
  if (typeof cell.data === "number") return String(cell.data);
  if (Array.isArray(cell.data)) {
    return (cell.data as any[])
      .map((item) =>
        typeof item === "object" && item !== null && "label" in item ? item.label : String(item)
      )
      .join(", ");
  }
  return String(cell.data);
}

function isChipField(type: CellType): boolean {
  return type === CellType.SCQ || type === CellType.MCQ;
}

function getChipValues(record: IRecord, column: IColumn): string[] {
  const cell = record.cells[column.id];
  if (!cell || cell.data == null) return [];
  if (cell.type === CellType.SCQ && typeof cell.data === "string") {
    return [cell.data];
  }
  if (cell.type === CellType.MCQ && Array.isArray(cell.data)) {
    return cell.data as string[];
  }
  return [];
}

function getChipColor(value: string, options: string[]): { bg: string; text: string } {
  const idx = options.indexOf(value);
  const colorIdx = idx >= 0 ? idx % GRID_THEME.chipColors.length : 0;
  return GRID_THEME.chipColors[colorIdx];
}

export function KanbanCard({
  record,
  columns,
  stackFieldId,
  onExpandRecord,
  onDragStart,
  onDragEnd,
}: KanbanCardProps) {
  const titleColumn = columns[0];
  const title = titleColumn ? getCellDisplayValue(record, titleColumn) : record.id;

  const subtitleColumns = columns
    .filter((col) => col.id !== stackFieldId && col.id !== titleColumn?.id && !isChipField(col.type))
    .slice(0, 3);

  const chipColumns = columns.filter(
    (col) => col.id !== stackFieldId && col.id !== titleColumn?.id && isChipField(col.type)
  );

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, record.id)}
      onDragEnd={onDragEnd}
      onClick={() => onExpandRecord?.(record.id)}
      className="group cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-1 flex items-start gap-1.5">
        <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="text-sm font-medium text-gray-900 line-clamp-2">
          {title || "Untitled"}
        </span>
      </div>

      {subtitleColumns.map((col) => {
        const value = getCellDisplayValue(record, col);
        if (!value) return null;
        return (
          <div key={col.id} className="ml-5 mt-0.5 flex items-baseline gap-1 text-xs">
            <span className="shrink-0 text-gray-400">{col.name}:</span>
            <span className="truncate text-gray-600">{value}</span>
          </div>
        );
      })}

      {chipColumns.length > 0 && (
        <div className="ml-5 mt-1.5 flex flex-wrap gap-1">
          {chipColumns.map((col) => {
            const values = getChipValues(record, col);
            const cellOptions =
              record.cells[col.id] && "options" in record.cells[col.id]
                ? ((record.cells[col.id] as any).options?.options as string[]) ?? []
                : [];
            return values.map((val) => {
              const color = getChipColor(val, cellOptions);
              return (
                <span
                  key={`${col.id}-${val}`}
                  className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ backgroundColor: color.bg, color: color.text }}
                >
                  {val}
                </span>
              );
            });
          })}
        </div>
      )}
    </div>
  );
}
