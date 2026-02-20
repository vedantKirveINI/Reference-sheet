import { useState } from "react";
import { Plus, Table2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Table {
  id: string;
  name: string;
}

interface TabBarProps {
  tables?: Table[];
  activeTableId?: string;
  onTableSelect?: (id: string) => void;
  onAddTable?: () => void;
}

export function TabBar({
  tables: tablesProp,
  activeTableId: activeIdProp,
  onTableSelect,
  onAddTable,
}: TabBarProps) {
  const defaultTables: Table[] = [{ id: "table-1", name: "Table 1" }];
  const tables = tablesProp || defaultTables;
  const [activeId, setActiveId] = useState(activeIdProp || tables[0]?.id);

  const handleSelect = (id: string) => {
    setActiveId(id);
    onTableSelect?.(id);
  };

  return (
    <div className="flex h-9 items-center border-b bg-white">
      <ScrollArea className="flex-1">
        <div className="flex items-center">
          {tables.map((table) => {
            const isActive = table.id === activeId;
            return (
              <DropdownMenu key={table.id}>
                <div
                  className={cn(
                    "group relative flex h-9 cursor-pointer items-center gap-1.5 border-r px-3 text-sm transition-colors",
                    isActive
                      ? "bg-white text-foreground font-medium"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => handleSelect(table.id)}
                >
                  <Table2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate max-w-[120px]">{table.name}</span>

                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="ml-1 rounded p-0.5 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>

                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </div>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex items-center border-l px-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onAddTable}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
