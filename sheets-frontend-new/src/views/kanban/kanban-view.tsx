import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { ITableData, IColumn, CellType, IDropDownOption } from "@/types";
import { GRID_THEME } from "@/views/grid/canvas/theme";
import { KanbanStack } from "./kanban-stack";

interface KanbanViewProps {
  data: ITableData;
  onAddRow?: () => void;
  onExpandRecord?: (recordId: string) => void;
  stackFieldId?: string | null;
  visibleCardFields?: Set<string>;
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
  onAddRow,
  onExpandRecord,
  stackFieldId,
  visibleCardFields,
}: KanbanViewProps) {
  const { t } = useTranslation('views');
  const stackableColumns = useMemo(() => getStackableColumns(data.columns), [data.columns]);

  const stackColumn = useMemo(
    () => (stackFieldId ? data.columns.find((c) => c.id === stackFieldId) : null) ?? null,
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
        title: t('kanban.uncategorized'),
        records: uncategorized,
        colorIdx: -1,
      });
    }

    return result;
  }, [stackFieldId, options, data.records]);

  const handleDragEnd = (_result: DropResult) => {
    // Editing disabled in Kanban view — drag-and-drop cell changes are disabled
  };

  if (stackableColumns.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/50 dark:bg-muted p-8">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">{t('kanban.noCards')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('kanban.stack')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-muted/50 dark:bg-background">
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
                visibleFields={visibleCardFields}
                onAddRecord={onAddRow}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
