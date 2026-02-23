import { useTranslation } from "react-i18next";
import { GripVertical } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { IRecord, IColumn, CellType, ICell } from "@/types";
import { GRID_THEME } from "@/views/grid/canvas/theme";

interface KanbanCardProps {
  record: IRecord;
  columns: IColumn[];
  stackFieldId: string;
  onExpandRecord?: (recordId: string) => void;
  index: number;
  visibleFields?: Set<string>;
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

function renderCellValue(cell: ICell | undefined): React.ReactNode {
  if (!cell) return <span className="text-muted-foreground/70">—</span>;

  switch (cell.type) {
    case CellType.SCQ:
    case CellType.DropDown:
      return cell.data ? (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          {cell.displayData || String(cell.data)}
        </span>
      ) : null;

    case CellType.MCQ: {
      const vals = Array.isArray(cell.data) ? cell.data : [];
      return vals.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {vals.slice(0, 3).map((v: any, i: number) => (
            <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300">
              {String(v)}
            </span>
          ))}
          {vals.length > 3 && <span className="text-xs text-muted-foreground/70">+{vals.length - 3}</span>}
        </div>
      ) : null;
    }

    case CellType.YesNo:
      return (
        <span className={`inline-flex items-center gap-1 text-xs ${cell.data ? "text-green-600 dark:text-green-400" : "text-muted-foreground/70"}`}>
          {cell.data ? "✓ Yes" : "✗ No"}
        </span>
      );

    case CellType.Rating: {
      const rating = typeof cell.data === "number" ? cell.data : 0;
      const max = 5;
      return (
        <div className="flex gap-0.5">
          {Array.from({ length: max }, (_, i) => (
            <span key={i} className={`text-sm ${i < rating ? "text-yellow-400" : "text-muted-foreground/50"}`}>
              ★
            </span>
          ))}
        </div>
      );
    }

    case CellType.Currency:
      return cell.data != null ? (
        <span className="text-sm font-medium text-foreground">
          ${typeof cell.data === "object" && cell.data && "currencyValue" in cell.data
            ? (cell.data.currencyValue as number).toFixed(2)
            : Number(cell.data).toFixed(2)}
        </span>
      ) : null;

    case CellType.Number:
      return cell.data != null ? (
        <span className="text-sm tabular-nums text-foreground">{Number(cell.data).toLocaleString()}</span>
      ) : null;

    case CellType.DateTime:
    case CellType.CreatedTime:
      return cell.displayData ? (
        <span className="text-xs text-muted-foreground">{cell.displayData}</span>
      ) : null;

    case CellType.Slider: {
      const pct = typeof cell.data === "number" ? cell.data : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted dark:bg-muted/50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      );
    }

    default:
      return cell.displayData ? (
        <span className="text-sm text-foreground truncate">{cell.displayData}</span>
      ) : null;
  }
}

export function KanbanCard({
  record,
  columns,
  stackFieldId,
  onExpandRecord,
  index,
  visibleFields,
}: KanbanCardProps) {
  const { t } = useTranslation();
  const titleColumn = columns[0];
  const title = titleColumn ? getCellDisplayValue(record, titleColumn) : record.id;

  const subtitleColumns = columns
    .filter((col) => col.id !== stackFieldId && col.id !== titleColumn?.id && !isChipField(col.type) && (!visibleFields || visibleFields.has(col.id)))
    .slice(0, 3);

  const chipColumns = columns.filter(
    (col) => col.id !== stackFieldId && col.id !== titleColumn?.id && isChipField(col.type) && (!visibleFields || visibleFields.has(col.id))
  );

  return (
    <Draggable draggableId={record.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => onExpandRecord?.(record.id)}
          className={`group cursor-pointer rounded-lg border border-border bg-background dark:bg-card p-3 shadow-sm transition-shadow hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-emerald-300 dark:ring-emerald-500" : ""
          }`}
        >
          <div className="mb-1 flex items-start gap-1.5">
            <div {...provided.dragHandleProps}>
              <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <span className="text-sm font-medium text-foreground line-clamp-2">
              {title || t('header.untitled')}
            </span>
          </div>

          {subtitleColumns.map((col) => {
            const cell = record.cells[col.id];
            const renderedValue = renderCellValue(cell);
            if (!renderedValue) return null;
            return (
              <div key={col.id} className="ml-5 mt-0.5 flex items-baseline gap-1 text-xs">
                <span className="shrink-0 text-muted-foreground/70">{col.name}:</span>
                <div className="flex-1 min-w-0">
                  {renderedValue}
                </div>
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
      )}
    </Draggable>
  );
}
