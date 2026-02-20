import { CellType, IColumn } from "@/types";
import { cn } from "@/lib/utils";
import {
  Type,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDown,
  ToggleLeft,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  [CellType.String]: Type,
  [CellType.Number]: Hash,
  [CellType.SCQ]: CircleDot,
  [CellType.MCQ]: CheckSquare,
  [CellType.DropDown]: ChevronDown,
  [CellType.YesNo]: ToggleLeft,
};

interface ColumnHeaderProps {
  column: IColumn;
  width: number;
  onResize: (deltaX: number) => void;
  onResizeEnd: () => void;
  isLast?: boolean;
}

export function ColumnHeader({ column, width, onResize, onResizeEnd }: ColumnHeaderProps) {
  const Icon = TYPE_ICONS[column.type] || Type;

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
        "relative flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border-b border-r border-gray-200",
        "text-sm font-medium text-gray-600 select-none shrink-0",
        "hover:bg-gray-100 transition-colors"
      )}
      style={{ width, minWidth: width }}
    >
      <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      <span className="truncate">{column.name}</span>
      <ChevronDown className="h-3 w-3 text-gray-400 ml-auto shrink-0 opacity-0 group-hover:opacity-100" />
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 z-10"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}
