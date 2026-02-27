import { CellType, IColumn, isSystemField } from "@/types";
import { cn } from "@/lib/utils";
import {
  Type,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDown,
  ToggleLeft,
  Calendar,
  CalendarClock,
  DollarSign,
  Phone,
  MapPin,
  PenTool,
  SlidersHorizontal,
  Paperclip,
  Clock,
  ListOrdered,
  Star,
  Gauge,
  FunctionSquare,
  List,
  Sparkles,
  Lock,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  [CellType.String]: Type,
  [CellType.Number]: Hash,
  [CellType.SCQ]: CircleDot,
  [CellType.MCQ]: CheckSquare,
  [CellType.DropDown]: ChevronDown,
  [CellType.YesNo]: ToggleLeft,
  [CellType.DateTime]: Calendar,
  [CellType.CreatedTime]: CalendarClock,
  [CellType.Currency]: DollarSign,
  [CellType.PhoneNumber]: Phone,
  [CellType.Address]: MapPin,
  [CellType.Signature]: PenTool,
  [CellType.Slider]: SlidersHorizontal,
  [CellType.FileUpload]: Paperclip,
  [CellType.Time]: Clock,
  [CellType.Ranking]: ListOrdered,
  [CellType.Rating]: Star,
  [CellType.OpinionScale]: Gauge,
  [CellType.Formula]: FunctionSquare,
  [CellType.List]: List,
  [CellType.Enrichment]: Sparkles,
  [CellType.ID]: Hash,
  [CellType.LongText]: Type,
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
      <Icon className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
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
