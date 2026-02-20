import { useState } from "react";
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
  onDrop: (recordId: string, stackValue: string | null) => void;
  onAddRecord: () => void;
  onDragStart: (e: React.DragEvent, recordId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
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
  onDrop,
  onAddRecord,
  onDragStart,
  onDragEnd,
}: KanbanStackProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const recordId = e.dataTransfer.getData("text/plain");
    if (recordId) {
      const stackValue = id === "__uncategorized__" ? null : id;
      onDrop(recordId, stackValue);
    }
  };

  return (
    <div
      className={`flex w-[280px] shrink-0 flex-col rounded-xl border bg-white shadow-sm transition-colors ${
        isDragOver ? "border-dashed border-blue-400 bg-blue-50" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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

      <div className="flex-1 space-y-2 overflow-y-auto p-2" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {records.map((record) => (
          <KanbanCard
            key={record.id}
            record={record}
            columns={columns}
            stackFieldId={stackFieldId}
            onExpandRecord={onExpandRecord}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>

      <div className="border-t p-2">
        <button
          onClick={onAddRecord}
          className="flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add record
        </button>
      </div>
    </div>
  );
}
