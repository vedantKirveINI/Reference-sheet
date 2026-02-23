import { useTranslation } from "react-i18next";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { IRecord, IColumn } from "@/types";
import { KanbanCard } from "./kanban-card";

interface KanbanStackProps {
  id: string;
  title: string;
  records: IRecord[];
  columns: IColumn[];
  stackFieldId: string;
  colorBg: string;
  colorText: string;
  onExpandRecord?: (recordId: string) => void;
  onAddRecord: () => void;
  visibleFields?: Set<string>;
}

export function KanbanStack({
  id,
  title,
  records,
  columns,
  stackFieldId,
  colorBg,
  colorText,
  onExpandRecord,
  onAddRecord,
  visibleFields,
}: KanbanStackProps) {
  const { t } = useTranslation('views');

  return (
    <div className="flex w-[280px] shrink-0 flex-col rounded-xl border border-border bg-background dark:bg-card shadow-sm">
      <div className="rounded-t-xl px-3 py-2" style={{ backgroundColor: colorBg }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold" style={{ color: colorText }}>
            {title}
          </span>
          <span
            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-medium"
            style={{ backgroundColor: `${colorText}20`, color: colorText }}
          >
            {records.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 overflow-y-auto p-2 transition-colors bg-muted/50 dark:bg-muted/30 ${
              snapshot.isDraggingOver ? "bg-emerald-50 dark:bg-emerald-500/10" : ""
            }`}
            style={{ maxHeight: "calc(100vh - 220px)" }}
          >
            {records.map((record, index) => (
              <KanbanCard
                key={record.id}
                record={record}
                columns={columns}
                stackFieldId={stackFieldId}
                onExpandRecord={onExpandRecord}
                index={index}
                visibleFields={visibleFields}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="border-t border-border p-2">
        <button
          onClick={onAddRecord}
          className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/50 dark:hover:bg-accent hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('kanban.addCard')}
        </button>
      </div>
    </div>
  );
}
