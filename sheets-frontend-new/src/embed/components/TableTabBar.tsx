/**
 * TinyTable Embed – Table tab bar
 *
 * Horizontal tabs to switch between tables within the embedded view.
 * Minimal chrome – just table names with an active indicator.
 */

import type { EmbedTableDefinition } from "../types";
import { Table2 } from "lucide-react";

interface TableTabBarProps {
  tables: EmbedTableDefinition[];
  activeTableId: string;
  onSelectTable: (tableId: string) => void;
}

export function TableTabBar({
  tables,
  activeTableId,
  onSelectTable,
}: TableTabBarProps) {
  if (tables.length <= 1) return null;

  return (
    <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/40 overflow-x-auto shrink-0">
      {tables.map((table) => {
        const isActive = table.id === activeTableId;
        return (
          <button
            key={table.id}
            onClick={() => onSelectTable(table.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
              transition-colors whitespace-nowrap cursor-pointer select-none
              ${
                isActive
                  ? "bg-white text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/60"
              }
            `}
          >
            <Table2 className="w-3 h-3 shrink-0" />
            {table.name}
          </button>
        );
      })}
    </div>
  );
}
