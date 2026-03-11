import React, { useState, useCallback, useRef, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Plus, Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Row } from "./Row";
import { BulkImportModal } from "./BulkImportModal";
import { useSimpleInputGridState } from "./useSimpleInputGridState";

const TAB_BEHAVIOR = {
  ADD_ROW: 'addRow',
  EXIT: 'exit',
  NORMAL: null,
};

export function SimpleInputGrid({
  value = [],
  onChange,
  showDescription = false,
  showType = true,
  showToggle = true,
  allowFiles = false,
  autoAddRow = true,
  maxHeight = 400,
  fillHeight = false,
  placeholder = { key: "Key", value: "Value" },
  className,
  rowErrors = {},
  "data-testid": testId = "simple-input-grid",
}) {
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [rowMetaVersion, setRowMetaVersion] = useState(0);
  const gridRef = useRef(null);
  const rowMetaRef = useRef({});

  const {
    rows,
    updateRow,
    deleteRow,
    addRow,
    toggleRow,
    setRowType,
    importRows,
    clearAll,
    addRowAndFocus,
  } = useSimpleInputGridState({ value, onChange, autoAddRow });

  const handleReportMeta = useCallback((rowId, meta) => {
    const prev = rowMetaRef.current[rowId];
    if (!prev || prev.hasDraftContent !== meta.hasDraftContent) {
      rowMetaRef.current[rowId] = meta;
      setRowMetaVersion(v => v + 1);
    }
  }, []);

  const rowIds = useMemo(() => rows.map(r => r._id), [rows]);
  
  useMemo(() => {
    const validIds = new Set(rowIds);
    Object.keys(rowMetaRef.current).forEach(id => {
      if (!validIds.has(id)) {
        delete rowMetaRef.current[id];
      }
    });
  }, [rowIds]);

  const computeTabBehavior = useCallback((rowId, index) => {
    const isLastRow = index === rows.length - 1;
    const isSecondToLast = index === rows.length - 2;
    
    if (!isLastRow && !isSecondToLast) {
      return TAB_BEHAVIOR.NORMAL;
    }
    
    const lastRowId = rows[rows.length - 1]?._id;
    const lastRowMeta = rowMetaRef.current[lastRowId];
    const lastRowHasContent = lastRowMeta?.hasDraftContent ?? false;
    
    if (isLastRow) {
      const currentMeta = rowMetaRef.current[rowId];
      const hasContent = currentMeta?.hasDraftContent ?? false;
      return hasContent ? TAB_BEHAVIOR.ADD_ROW : TAB_BEHAVIOR.EXIT;
    }
    
    if (isSecondToLast && !lastRowHasContent) {
      const currentMeta = rowMetaRef.current[rowId];
      const hasContent = currentMeta?.hasDraftContent ?? false;
      return hasContent ? TAB_BEHAVIOR.ADD_ROW : TAB_BEHAVIOR.NORMAL;
    }
    
    return TAB_BEHAVIOR.NORMAL;
  }, [rows, rowMetaVersion]);

  const focusNextOutsideGrid = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) {
      document.activeElement?.blur();
      return;
    }

    const allFocusable = Array.from(document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    ));
    
    const activeElement = document.activeElement;
    const activeIndex = allFocusable.indexOf(activeElement);
    
    for (let i = activeIndex + 1; i < allFocusable.length; i++) {
      const el = allFocusable[i];
      if (!grid.contains(el)) {
        el.focus();
        return;
      }
    }
    
    for (let i = 0; i < activeIndex; i++) {
      const el = allFocusable[i];
      if (!grid.contains(el)) {
        el.focus();
        return;
      }
    }
    
    document.activeElement?.blur();
  }, []);

  const handleTabFromLastField = useCallback((tabBehavior) => {
    if (tabBehavior === TAB_BEHAVIOR.EXIT) {
      setTimeout(() => focusNextOutsideGrid(), 20);
      return;
    }
    
    if (tabBehavior === TAB_BEHAVIOR.ADD_ROW) {
      if (!autoAddRow) {
        setTimeout(() => focusNextOutsideGrid(), 20);
        return;
      }
      
      addRowAndFocus(() => {
        setTimeout(() => {
          const currentRows = document.querySelectorAll('[data-testid^="input-grid-row-"]');
          const lastRowIndex = currentRows.length - 1;
          const lastRowKeyInput = document.querySelector(`[data-testid="input-grid-key-${lastRowIndex}"]`);
          lastRowKeyInput?.focus();
        }, 10);
      });
    }
  }, [autoAddRow, focusNextOutsideGrid, addRowAndFocus]);

  const handleKeyDown = useCallback((e, rowIndex, field) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (rowIndex < rows.length - 1) {
        const nextRowField = document.querySelector(`[data-testid="input-grid-${field}-${rowIndex + 1}"]`);
        nextRowField?.focus();
      }
    } else if (e.key === "ArrowDown" && rowIndex < rows.length - 1) {
      e.preventDefault();
      const nextRowField = document.querySelector(`[data-testid="input-grid-${field}-${rowIndex + 1}"]`);
      nextRowField?.focus();
    } else if (e.key === "ArrowUp" && rowIndex > 0) {
      e.preventDefault();
      const prevRowField = document.querySelector(`[data-testid="input-grid-${field}-${rowIndex - 1}"]`);
      prevRowField?.focus();
    }
  }, [rows.length]);

  const hasData = rows.some((row) => row.key || row.value);

  return (
    <TooltipProvider>
      <div
        ref={gridRef}
        className={cn(
          "rounded-2xl bg-white overflow-hidden",
          "shadow-[0_2px_12px_rgba(0,0,0,0.08)]",
          "border border-gray-100",
          fillHeight && "flex flex-col min-h-0 flex-1",
          className
        )}
        data-testid={testId}
      >
        {/* Header */}
        <div className={cn("flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80", fillHeight && "shrink-0")}>
          <div
            className="grid gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide flex-1"
            style={{
              gridTemplateColumns: (() => {
                const toggleCol = showToggle ? "28px " : "";
                const baseCol = "1fr 1fr";
                const descCol = showDescription ? " 1fr" : "";
                const typeCol = showType ? " 80px" : "";
                const deleteCol = " 32px";
                return `${toggleCol}${baseCol}${descCol}${typeCol}${deleteCol}`;
              })(),
              fontFamily: "Archivo, sans-serif",
            }}
          >
            {showToggle && <span></span>}
            <span>Key</span>
            <span>Value</span>
            {showDescription && <span>Description</span>}
            {showType && <span>Type</span>}
            <span></span>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-[#1C3693]"
                  onClick={() => setShowBulkImport(true)}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bulk import</TooltipContent>
            </Tooltip>

            {hasData && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                    onClick={clearAll}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Rows */}
        <ScrollArea
          style={fillHeight ? { flex: 1, minHeight: 0 } : { maxHeight }}
          className={cn("w-full", fillHeight && "flex-1 min-h-0")}
        >
          <div className="p-2">
            {rows.map((row, index) => {
              const tabBehavior = computeTabBehavior(row._id, index);
              
              return (
                <Row
                  key={row._id}
                  row={row}
                  rowIndex={index}
                  onUpdate={updateRow}
                  onDelete={deleteRow}
                  onToggle={toggleRow}
                  onSetType={setRowType}
                  showDescription={showDescription}
                  showType={showType}
                  showToggle={showToggle}
                  allowFiles={allowFiles}
                  tabBehavior={tabBehavior}
                  onKeyDown={handleKeyDown}
                  onTabFromLastField={handleTabFromLastField}
                  onReportMeta={handleReportMeta}
                  error={rowErrors[row._id]}
                  placeholder={placeholder}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        {!autoAddRow && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#1C3693] hover:text-[#1C3693] hover:bg-[#1C3693]/10 font-medium"
              onClick={addRow}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Row
            </Button>
          </div>
        )}

        {/* Bulk Import Modal */}
        <BulkImportModal
          open={showBulkImport}
          onOpenChange={setShowBulkImport}
          onImport={importRows}
        />
      </div>
    </TooltipProvider>
  );
}
