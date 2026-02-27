import { cn } from "@/lib/utils";
import { GripVertical, Maximize2 } from "lucide-react";

interface RowHeaderProps {
  rowNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  onExpand?: () => void;
  height: number;
}

export function RowHeader({ rowNumber, isSelected, onSelect, onExpand, height }: RowHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-r border-border bg-muted",
        "text-xs text-muted-foreground select-none shrink-0",
        "hover:bg-accent transition-colors group relative"
      )}
      style={{ width: 60, minWidth: 60, height }}
      onClick={onSelect}
    >
      <div className={cn("flex items-center justify-center w-full gap-0.5", isSelected && "hidden")}>
        <span className="group-hover:hidden">{rowNumber}</span>
      </div>

      <div className={cn(
        "absolute inset-0 items-center justify-between px-1",
        "hidden group-hover:flex",
        isSelected && "!flex"
      )}>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab shrink-0" />
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="h-3.5 w-3.5 rounded border-border cursor-pointer accent-brand-600"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExpand?.();
          }}
          className={cn("p-0.5 rounded hover:bg-accent transition-colors", isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
        >
          <Maximize2 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}