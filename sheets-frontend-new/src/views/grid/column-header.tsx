import { IColumn, isSystemField } from "@/types";
import { cn } from "@/lib/utils";
import { ChevronDown, Lock } from "lucide-react";
import { getFieldIcon } from "@/components/icons/field-type-icons";

interface ColumnHeaderProps {
  column: IColumn;
  width: number;
  onResize: (deltaX: number) => void;
  onResizeEnd: () => void;
  isLast?: boolean;
}

export function ColumnHeader({ column, width, onResize, onResizeEnd }: ColumnHeaderProps) {
  const Icon = getFieldIcon(column.type);
  const isSystem = isSystemField(column.type);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onResize(moveEvent.clientX - startX);
    };

    const handleMouseUp = () => {
      onResizeEnd();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={cn(
        "relative flex items-center gap-1.5 px-3 py-1.5 border-b border-r border-border",
        "text-sm font-medium text-muted-foreground select-none shrink-0",
        isSystem ? "system-field-cell" : "bg-muted",
        "hover:bg-accent transition-colors"
      )}
      style={{ width, minWidth: width }}
    >
      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
      <span className="truncate">{column.name}</span>
      {isSystem && (
        <Lock className="h-2.5 w-2.5 text-slate-400 shrink-0" />
      )}
      <ChevronDown className="h-3 w-3 text-muted-foreground/70 ml-auto shrink-0 opacity-0 group-hover:opacity-100" />
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500 z-10"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
