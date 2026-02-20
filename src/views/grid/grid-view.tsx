import { useState, useRef, useCallback, useMemo } from "react";
import { ITableData } from "@/types";
import { cn } from "@/lib/utils";
import { CellRenderer } from "./cell-renderer";
import { ColumnHeader } from "./column-header";
import { RowHeader } from "./row-header";
import { Plus } from "lucide-react";

const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 34;
const ROW_HEADER_WIDTH = 60;
const OVERSCAN = 5;

interface GridViewProps {
  data: ITableData;
  onCellChange?: (recordId: string, columnId: string, value: any) => void;
}

export function GridView({ data, onCellChange }: GridViewProps) {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    data.columns.forEach((col) => { widths[col.id] = col.width; });
    return widths;
  });
  const [resizingCol, setResizingCol] = useState<{ id: string; startWidth: number } | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalRows = data.records.length;
  const totalContentHeight = totalRows * ROW_HEIGHT;

  const containerHeight = containerRef.current?.clientHeight ?? 600;
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);
  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endRow = Math.min(totalRows, Math.floor(scrollTop / ROW_HEIGHT) + visibleCount + OVERSCAN);

  const visibleRows = useMemo(() => {
    const rows = [];
    for (let i = startRow; i < endRow; i++) {
      rows.push(i);
    }
    return rows;
  }, [startRow, endRow]);

  const totalWidth = useMemo(() => {
    return data.columns.reduce((sum, col) => sum + (columnWidths[col.id] || col.width), 0);
  }, [data.columns, columnWidths]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    if (editingCell && editingCell.row === rowIndex && editingCell.col === colIndex) return;
    setEditingCell(null);
    setActiveCell({ row: rowIndex, col: colIndex });
  }, [editingCell]);

  const handleCellDoubleClick = useCallback((rowIndex: number, colIndex: number) => {
    setEditingCell({ row: rowIndex, col: colIndex });
    setActiveCell({ row: rowIndex, col: colIndex });
  }, []);

  const handleEndEdit = useCallback((rowIndex: number, colIndex: number, value: any) => {
    setEditingCell(null);
    const record = data.records[rowIndex];
    const column = data.columns[colIndex];
    if (record && column) {
      onCellChange?.(record.id, column.id, value);
    }
  }, [data.records, data.columns, onCellChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!activeCell) return;

    if (e.key === "F2" && !editingCell) {
      e.preventDefault();
      setEditingCell({ row: activeCell.row, col: activeCell.col });
      return;
    }

    if (e.key === "Escape" && editingCell) {
      setEditingCell(null);
      return;
    }

    if (editingCell) return;

    if (e.key === "Enter") {
      e.preventDefault();
      setEditingCell({ row: activeCell.row, col: activeCell.col });
      return;
    }

    const { row, col } = activeCell;
    let nextRow = row;
    let nextCol = col;

    switch (e.key) {
      case "ArrowUp": nextRow = Math.max(0, row - 1); break;
      case "ArrowDown": nextRow = Math.min(totalRows - 1, row + 1); break;
      case "ArrowLeft": nextCol = Math.max(0, col - 1); break;
      case "ArrowRight": nextCol = Math.min(data.columns.length - 1, col + 1); break;
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          nextCol = col - 1;
          if (nextCol < 0) { nextCol = data.columns.length - 1; nextRow = Math.max(0, row - 1); }
        } else {
          nextCol = col + 1;
          if (nextCol >= data.columns.length) { nextCol = 0; nextRow = Math.min(totalRows - 1, row + 1); }
        }
        break;
      default: return;
    }

    e.preventDefault();
    setActiveCell({ row: nextRow, col: nextCol });
  }, [activeCell, editingCell, totalRows, data.columns.length]);

  const handleRowSelect = useCallback((rowIndex: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) next.delete(rowIndex); else next.add(rowIndex);
      return next;
    });
  }, []);

  const handleColumnResize = useCallback((colId: string, deltaX: number) => {
    if (!resizingCol) {
      const startWidth = columnWidths[colId] || 100;
      setResizingCol({ id: colId, startWidth });
      setColumnWidths((prev) => ({
        ...prev,
        [colId]: Math.max(50, startWidth + deltaX),
      }));
    } else {
      setColumnWidths((prev) => ({
        ...prev,
        [resizingCol.id]: Math.max(50, resizingCol.startWidth + deltaX),
      }));
    }
  }, [resizingCol, columnWidths]);

  const handleColumnResizeEnd = useCallback(() => {
    setResizingCol(null);
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden bg-white outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        onScroll={handleScroll}
      >
        <div style={{ minWidth: totalWidth + ROW_HEADER_WIDTH + 44 }}>
          <div className="sticky top-0 z-20 flex" style={{ height: HEADER_HEIGHT }}>
            <div
              className="sticky left-0 z-30 flex items-center justify-center bg-gray-50 border-b border-r border-gray-200"
              style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH, height: HEADER_HEIGHT }}
            >
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-gray-300 cursor-pointer"
                checked={selectedRows.size === totalRows && totalRows > 0}
                onChange={() => {
                  if (selectedRows.size === totalRows) {
                    setSelectedRows(new Set());
                  } else {
                    setSelectedRows(new Set(Array.from({ length: totalRows }, (_, i) => i)));
                  }
                }}
              />
            </div>

            {data.columns.map((col) => (
              <ColumnHeader
                key={col.id}
                column={col}
                width={columnWidths[col.id] || col.width}
                onResize={(deltaX) => handleColumnResize(col.id, deltaX)}
                onResizeEnd={handleColumnResizeEnd}
              />
            ))}

            <div
              className="flex items-center justify-center bg-gray-50 border-b border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
              style={{ width: 44, minWidth: 44, height: HEADER_HEIGHT }}
            >
              <Plus className="h-4 w-4" />
            </div>
          </div>

          <div style={{ position: "relative", height: totalContentHeight }}>
            {visibleRows.map((rowIndex) => {
              const record = data.records[rowIndex];
              if (!record) return null;
              const isRowSelected = selectedRows.has(rowIndex);
              const top = rowIndex * ROW_HEIGHT;

              return (
                <div
                  key={record.id}
                  className={cn(
                    "absolute left-0 right-0 flex",
                    "hover:bg-blue-50/30",
                    isRowSelected && "bg-blue-50"
                  )}
                  style={{ top, height: ROW_HEIGHT }}
                >
                  <div className="sticky left-0 z-10">
                    <RowHeader
                      rowNumber={rowIndex + 1}
                      isSelected={isRowSelected}
                      onSelect={() => handleRowSelect(rowIndex)}
                      height={ROW_HEIGHT}
                    />
                  </div>

                  {data.columns.map((col, colIndex) => {
                    const cell = record.cells[col.id];
                    if (!cell) return null;
                    const isActive = activeCell?.row === rowIndex && activeCell?.col === colIndex;
                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === colIndex;
                    const width = columnWidths[col.id] || col.width;

                    return (
                      <div
                        key={col.id}
                        className={cn(
                          "relative border-b border-r border-gray-200 shrink-0 overflow-hidden",
                          isActive && "ring-2 ring-blue-500 ring-inset z-10",
                          !isActive && !isRowSelected && "bg-white",
                          isRowSelected && !isActive && "bg-blue-50"
                        )}
                        style={{ width, minWidth: width, height: ROW_HEIGHT }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onDoubleClick={() => handleCellDoubleClick(rowIndex, colIndex)}
                      >
                        <CellRenderer
                          cell={cell}
                          column={col}
                          isActive={isActive}
                          isEditing={isEditing}
                          onStartEdit={() => setEditingCell({ row: rowIndex, col: colIndex })}
                          onEndEdit={(value) => handleEndEdit(rowIndex, colIndex, value)}
                        />
                      </div>
                    );
                  })}

                  <div
                    className="border-b border-gray-200 bg-white"
                    style={{ width: 44, minWidth: 44, height: ROW_HEIGHT }}
                  />
                </div>
              );
            })}
          </div>

          <div
            className="flex items-center border-t border-dashed border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
            style={{
              height: ROW_HEIGHT,
              position: "relative",
              marginTop: 0,
            }}
          >
            <div
              className="sticky left-0 flex items-center justify-center text-gray-400"
              style={{ width: ROW_HEADER_WIDTH, minWidth: ROW_HEADER_WIDTH }}
            >
              <Plus className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm text-gray-400 pl-2">New record</span>
          </div>
        </div>
      </div>
    </div>
  );
}
