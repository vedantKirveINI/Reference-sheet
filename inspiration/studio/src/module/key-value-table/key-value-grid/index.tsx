import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type TKeyValueRow = {
  fieldId?: string | number;
  key: string;
  value: any;
  default?: any;
  expand?: boolean;
};

export type TKeyValueGridColumn = {
  field: string;
  headerName: string;
  editable?: boolean;
  cellType?: "text" | "formula" | "action";
  width?: string;
  highlighted?: boolean;
  maxLines?: number;
  placeholder?: string;
  showHeaderCheckbox?: boolean;
  cellRenderer?: (params: { data: TKeyValueRow; rowIndex: number }) => React.ReactNode;
  cellEditor?: (params: {
    data: TKeyValueRow;
    rowIndex: number;
    onValueChange: (newValue: any) => void;
    variables?: any;
    placeholder?: string;
    type?: "any" | "string" | "number" | "boolean" | "int" | "object" | "array";
    onKeyDown?: (e: React.KeyboardEvent) => void;
  }) => React.ReactNode;
};

export type TKeyValueGridProps = {
  rowData: TKeyValueRow[];
  columns: TKeyValueGridColumn[];
  onRowChange?: (rowIndex: number, newData: TKeyValueRow) => void;
  onRowDelete?: (rowIndex: number) => void;
  showDeleteColumn?: boolean;
  className?: string;
  "data-testid"?: string;
  onSelectAll?: (checked: boolean) => void;
};

type EditingCell = {
  rowIndex: number;
  field: string;
} | null;

type FocusedCell = {
  rowIndex: number;
  colIndex: number;
} | null;

export function KeyValueGrid({
  rowData,
  columns,
  onRowChange,
  onRowDelete,
  showDeleteColumn = false,
  className,
  "data-testid": dataTestId,
  onSelectAll,
}: TKeyValueGridProps) {
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [focusedCell, setFocusedCell] = useState<FocusedCell>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement | HTMLInputElement>>(new Map());

  // Compute header checkbox state from rowData
  const headerCheckboxChecked = useMemo(() => {
    // Check if any column has field === "isChecked" && showHeaderCheckbox === true
    const hasHeaderCheckboxColumn = columns.some(
      (col) => col.field === "isChecked" && col.showHeaderCheckbox === true
    );

    if (!hasHeaderCheckboxColumn || rowData.length === 0) {
      return false;
    }

    // Get all rows that have the isChecked field
    const rowsWithIsChecked = rowData.filter((row) => "isChecked" in row);

    if (rowsWithIsChecked.length === 0) {
      return false;
    }

    // Check if all rows with isChecked field have isChecked === true
    return rowsWithIsChecked.every((row) => row.isChecked === true);
  }, [rowData, columns]);

  const getCellKey = (rowIndex: number, colIndex: number) => `${rowIndex}-${colIndex}`;

  const setCellRef = useCallback((rowIndex: number, colIndex: number, element: HTMLDivElement | HTMLInputElement | null) => {
    const key = getCellKey(rowIndex, colIndex);
    if (element) {
      cellRefs.current.set(key, element);
    } else {
      cellRefs.current.delete(key);
    }
  }, []);

  const focusCell = useCallback((rowIndex: number, colIndex: number) => {
    const key = getCellKey(rowIndex, colIndex);
    const element = cellRefs.current.get(key);
    if (element) {
      element.focus();
      setFocusedCell({ rowIndex, colIndex });
    }
  }, []);

  const getEditableColumns = useCallback(() => {
    return columns.map((col, index) => ({ ...col, originalIndex: index }))
      .filter(col => col.editable);
  }, [columns]);

  const findNextEditableCell = useCallback((currentRowIndex: number, currentColIndex: number, reverse: boolean = false): FocusedCell => {
    const editableColumns = getEditableColumns();
    if (editableColumns.length === 0) return null;

    const totalRows = rowData.length;
    if (totalRows === 0) return null;

    const currentEditableIndex = editableColumns.findIndex(col => col.originalIndex === currentColIndex);

    if (reverse) {
      if (currentEditableIndex > 0) {
        return { rowIndex: currentRowIndex, colIndex: editableColumns[currentEditableIndex - 1].originalIndex };
      } else if (currentRowIndex > 0) {
        return { rowIndex: currentRowIndex - 1, colIndex: editableColumns[editableColumns.length - 1].originalIndex };
      }
    } else {
      if (currentEditableIndex < editableColumns.length - 1) {
        return { rowIndex: currentRowIndex, colIndex: editableColumns[currentEditableIndex + 1].originalIndex };
      } else if (currentRowIndex < totalRows - 1) {
        return { rowIndex: currentRowIndex + 1, colIndex: editableColumns[0].originalIndex };
      }
    }
    return null;
  }, [columns, rowData.length, getEditableColumns]);

  const handleCellKeyDown = useCallback((e: React.KeyboardEvent, rowIndex: number, colIndex: number, field: string, column: TKeyValueGridColumn) => {
    const totalRows = rowData.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (rowIndex < totalRows - 1) {
          if (editingCell) {
            handleCellBlur(rowIndex, field);
          }
          focusCell(rowIndex + 1, colIndex);
          if (column.editable) {
            handleCellClick(rowIndex + 1, columns[colIndex].field, columns[colIndex]);
          }
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (rowIndex > 0) {
          if (editingCell) {
            handleCellBlur(rowIndex, field);
          }
          focusCell(rowIndex - 1, colIndex);
          if (column.editable) {
            handleCellClick(rowIndex - 1, columns[colIndex].field, columns[colIndex]);
          }
        }
        break;

      case "Tab":
        e.preventDefault();
        if (editingCell) {
          handleCellBlur(rowIndex, field);
        }
        const nextCell = findNextEditableCell(rowIndex, colIndex, e.shiftKey);
        if (nextCell) {
          focusCell(nextCell.rowIndex, nextCell.colIndex);
          handleCellClick(nextCell.rowIndex, columns[nextCell.colIndex].field, columns[nextCell.colIndex]);
        }
        break;

      case "Enter":
        e.preventDefault();
        if (editingCell) {
          handleCellBlur(rowIndex, field);
        }
        if (rowIndex < totalRows - 1) {
          focusCell(rowIndex + 1, colIndex);
          if (column.editable) {
            handleCellClick(rowIndex + 1, columns[colIndex].field, columns[colIndex]);
          }
        }
        break;

      case "Escape":
        e.preventDefault();
        setEditingCell(null);
        setFocusedCell(null);
        const currentElement = cellRefs.current.get(getCellKey(rowIndex, colIndex));
        currentElement?.blur();
        break;
    }
  }, [rowData.length, editingCell, columns, focusCell, findNextEditableCell]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleCellClick = (rowIndex: number, field: string, column: TKeyValueGridColumn) => {
    if (!column.editable) return;

    const colIndex = columns.findIndex(col => col.field === field);
    setFocusedCell({ rowIndex, colIndex });

    const row = rowData[rowIndex];
    if (column.cellType === "text") {
      setEditingCell({ rowIndex, field });
      setEditValue(row[field as keyof TKeyValueRow] as string || "");
    } else if (column.cellType === "formula") {
      setEditingCell({ rowIndex, field });
    }
  };

  const handleCellBlur = (rowIndex: number, field: string) => {
    if (editingCell?.rowIndex === rowIndex && editingCell?.field === field) {
      const row = rowData[rowIndex];
      const column = columns.find(col => col.field === field);

      if (column?.cellType !== "formula" && onRowChange) {
        onRowChange(rowIndex, { ...row, [field]: editValue });
      }
      setEditingCell(null);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent, rowIndex: number, field: string, colIndex: number, column: TKeyValueGridColumn) => {
    if (["ArrowDown", "ArrowUp", "Tab", "Escape"].includes(e.key) || (e.key === "Enter")) {
      handleCellKeyDown(e, rowIndex, colIndex, field, column);
    }
  };

  const handleCellFocus = (rowIndex: number, colIndex: number) => {
    setFocusedCell({ rowIndex, colIndex });
  };

  const renderCell = (row: TKeyValueRow, column: TKeyValueGridColumn, rowIndex: number, colIndex: number) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === column.field;
    const isFocused = focusedCell?.rowIndex === rowIndex && focusedCell?.colIndex === colIndex;

    if (column.cellType === "text") {
      const cellValue = row[column.field as keyof TKeyValueRow] as string || "";
      const maxLines = column.maxLines || 3;

      if (isEditing) {
        return (
          <Input
            ref={(el) => {
              if (el) {
                inputRef.current = el;
                setCellRef(rowIndex, colIndex, el);
              }
            }}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => handleCellBlur(rowIndex, column.field)}
            onKeyDown={(e) => handleInputKeyDown(e, rowIndex, column.field, colIndex, column)}
            className="h-8 border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-ring"
            data-testid={`${dataTestId}-input-${rowIndex}-${column.field}`}
          />
        );
      }

      const cellContent = (
        <div
          ref={(el) => setCellRef(rowIndex, colIndex, el!)}
          tabIndex={column.editable ? 0 : -1}
          className={cn(
            "min-h-[32px] flex items-start px-2 py-1.5 cursor-text break-words outline-none",
            column.editable && "hover:bg-muted/50 rounded focus:ring-2 focus:ring-ring focus:ring-offset-1",
            column.highlighted && "font-medium text-slate-800"
          )}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
          onClick={() => handleCellClick(rowIndex, column.field, column)}
          onFocus={() => handleCellFocus(rowIndex, colIndex)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleCellClick(rowIndex, column.field, column);
            } else {
              handleCellKeyDown(e, rowIndex, colIndex, column.field, column);
            }
          }}
        >
          {cellValue}
        </div>
      );

      if (cellValue && (column.highlighted || column.maxLines)) {
        return (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                {cellContent}
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[300px] whitespace-pre-wrap break-words"
              >
                {cellValue}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return cellContent;
    }

    if (column.cellType === "formula") {
      if (column.cellEditor) {
        return (
          <div
            ref={(el) => setCellRef(rowIndex, colIndex, el!)}
            tabIndex={column.editable ? 0 : -1}
            className={cn(
              "w-full outline-none",
              column.editable && "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 rounded"
            )}
            onFocus={() => handleCellFocus(rowIndex, colIndex)}
            onKeyDown={(e) => handleCellKeyDown(e, rowIndex, colIndex, column.field, column)}
          >
            {column.cellEditor({
              data: row,
              rowIndex,
              onValueChange: (newValue) => {
                if (onRowChange) {
                  onRowChange(rowIndex, { ...row, [column.field]: newValue });
                }
              },
              placeholder: column.placeholder,
              onKeyDown: (e) => handleCellKeyDown(e, rowIndex, colIndex, column.field, column),
            })}
          </div>
        );
      }
      if (column.cellRenderer) {
        return column.cellRenderer({ data: row, rowIndex });
      }
    }

    if (column.cellRenderer) {
      return column.cellRenderer({ data: row, rowIndex });
    }

    return row[column.field as keyof TKeyValueRow] as React.ReactNode;
  };

  return (
    <div className={cn("w-full border rounded-md", className)} data-testid={dataTestId}>
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="bg-slate-100 border-b border-slate-200">
            {columns.map((column, colIndex) => (
              <TableHead
                key={column.field}
                className={cn(
                  "text-xs font-semibold uppercase text-slate-600 py-2.5",
                  colIndex > 0 && "border-l border-slate-200",
                  column.highlighted && "bg-slate-200/60 text-slate-700",
                )}
                style={{ width: column.width }}
              >
                {column.field === "isChecked" && column.showHeaderCheckbox ? (
                  <Checkbox
                    checked={headerCheckboxChecked}
                    onCheckedChange={(checked) => onSelectAll?.(checked === true)}
                    className="h-4 w-4 data-[state=checked]:bg-[#22C55E] data-[state=checked]:border-[#22C55E]"
                    data-testid={`${dataTestId}-header-checkbox`}
                  />
                ) : (
                  column.headerName
                )}
              </TableHead>
            ))}
            {showDeleteColumn && (
              <TableHead className="w-[60px] border-l border-slate-200" style={{ width: '60px' }} />
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rowData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (showDeleteColumn ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                No data
              </TableCell>
            </TableRow>
          ) : (
            rowData.map((row, rowIndex) => (
              <TableRow
                key={row?.fieldId}
                className="transition-colors border-b border-slate-100"
                data-testid={`${dataTestId}-row-${rowIndex}`}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={column.field}
                    className={cn(
                      "py-1",
                      colIndex > 0 && "border-l border-slate-100",
                      column.highlighted && "bg-slate-50"
                    )}
                  >
                    {renderCell(row, column, rowIndex, colIndex)}
                  </TableCell>
                ))}
                {showDeleteColumn && (
                  <TableCell className="py-1 text-center border-l border-slate-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRowDelete?.(rowIndex)}
                      data-testid={`delete-${rowIndex}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default KeyValueGrid;
