/**
 * TinyTable Embed – Table preview component
 *
 * A lightweight, read-only HTML table that renders columns + sample data.
 * No canvas, no virtual scrolling, no editing – just a clean preview.
 */

import type { ITableData } from "@/types/grid";
import { ColumnHeader } from "./ColumnHeader";
import { CellRenderer } from "./CellRenderer";
import { Table2 } from "lucide-react";

interface TablePreviewProps {
  data: ITableData | undefined;
  tableName?: string;
  isLoading?: boolean;
}

export function TablePreview({ data, tableName, isLoading }: TablePreviewProps) {
  // Loading / building state
  if (isLoading || !data) {
    return <TableSkeleton />;
  }

  // Empty table (schema defined but no records yet)
  const hasRecords = data.records.length > 0;

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse text-sm">
        {/* Column headers */}
        <thead className="sticky top-0 z-10">
          <tr className="bg-muted/60 border-b border-border">
            {/* Row number column */}
            <th className="w-10 min-w-10 px-2 py-2 text-center text-[10px] font-medium text-muted-foreground border-r border-border bg-muted/60">
              #
            </th>
            {data.columns.map((col) => (
              <th
                key={col.id}
                className="border-r border-border bg-muted/60 text-left font-normal"
                style={{ minWidth: col.width, maxWidth: col.width }}
              >
                <ColumnHeader column={col} />
              </th>
            ))}
            {/* Spacer column to fill remaining width */}
            <th className="bg-muted/60 w-full" />
          </tr>
        </thead>

        {/* Data rows */}
        <tbody>
          {data.records.map((record, rowIdx) => (
            <tr
              key={record.id}
              className="border-b border-border hover:bg-muted/20 transition-colors"
            >
              {/* Row number */}
              <td className="px-2 py-1.5 text-center text-[10px] text-muted-foreground border-r border-border tabular-nums">
                {rowIdx + 1}
              </td>
              {data.columns.map((col) => {
                const cell = record.cells[col.id];
                return (
                  <td
                    key={col.id}
                    className="px-3 py-1.5 border-r border-border align-middle overflow-hidden"
                    style={{ minWidth: col.width, maxWidth: col.width }}
                  >
                    {cell ? (
                      <CellRenderer cell={cell} />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                );
              })}
              <td />
            </tr>
          ))}

          {/* Empty rows to give visual structure */}
          {hasRecords &&
            Array.from({ length: Math.max(0, 3 - data.records.length) }, (_, i) => (
              <tr key={`empty_${i}`} className="border-b border-border">
                <td className="px-2 py-1.5 text-center text-[10px] text-muted-foreground border-r border-border tabular-nums">
                  {data.records.length + i + 1}
                </td>
                {data.columns.map((col) => (
                  <td
                    key={col.id}
                    className="px-3 py-1.5 border-r border-border"
                    style={{ minWidth: col.width, maxWidth: col.width }}
                  />
                ))}
                <td />
              </tr>
            ))}

          {/* No records message */}
          {!hasRecords && (
            <tr>
              <td
                colSpan={data.columns.length + 2}
                className="px-4 py-8 text-center text-muted-foreground text-xs"
              >
                No sample data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-8">
      <Table2 className="w-8 h-8 animate-pulse-smooth" />
      <span className="text-xs">Building table...</span>
    </div>
  );
}
