import { CellType } from "@/types/cell";
import type { IColumn } from "@/types/grid";
import { getFieldIcon } from "@/components/icons/field-type-icons";

interface ColumnHeaderProps {
  column: IColumn;
}

export function ColumnHeader({ column }: ColumnHeaderProps) {
  const Icon = getFieldIcon(column.type as CellType | undefined);

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 select-none overflow-hidden">
      <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate text-xs font-medium text-foreground">
        {column.name}
      </span>
    </div>
  );
}
