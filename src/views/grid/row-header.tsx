import { cn } from "@/lib/utils";

interface RowHeaderProps {
  rowNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  height: number;
}

export function RowHeader({ rowNumber, isSelected, onSelect, height }: RowHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center border-b border-r border-gray-200 bg-gray-50",
        "text-xs text-gray-400 select-none shrink-0",
        "hover:bg-gray-100 transition-colors group"
      )}
      style={{ width: 60, minWidth: 60, height }}
      onClick={onSelect}
    >
      <span className={cn("group-hover:hidden", isSelected && "hidden")}>
        {rowNumber}
      </span>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        className={cn(
          "h-3.5 w-3.5 rounded border-gray-300 cursor-pointer",
          "hidden group-hover:block",
          isSelected && "!block"
        )}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
