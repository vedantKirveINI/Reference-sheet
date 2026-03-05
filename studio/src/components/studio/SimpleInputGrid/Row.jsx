import React, { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, ChevronDown, FileText, Braces, File, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROW_TYPES, TYPE_LABELS } from "./constants";

const TYPE_ICONS = {
  [ROW_TYPES.TEXT]: FileText,
  [ROW_TYPES.JSON]: Braces,
  [ROW_TYPES.FILE]: File,
};

function EditableCell({ 
  value,
  onChange,
  onBlur,
  placeholder, 
  className, 
  style,
  testId,
  onKeyDown,
  disabled,
}) {
  const inputRef = useRef(null);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={className}
      style={style}
      data-testid={testId}
      disabled={disabled}
    />
  );
}

export function Row({
  row,
  onUpdate,
  onDelete,
  onToggle,
  onSetType,
  showDescription = false,
  showType = true,
  showToggle = true,
  allowFiles = false,
  tabBehavior = null,
  onKeyDown,
  onTabFromLastField,
  onReportMeta,
  rowIndex,
  error = null,
  placeholder = { key: "Key", value: "Value" },
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const [draftKey, setDraftKey] = useState(row.key ?? "");
  const [draftValue, setDraftValue] = useState(row.value ?? "");
  const [draftDescription, setDraftDescription] = useState(row.description ?? "");

  useEffect(() => {
    setDraftKey(row.key ?? "");
  }, [row.key]);

  useEffect(() => {
    setDraftValue(row.value ?? "");
  }, [row.value]);

  useEffect(() => {
    setDraftDescription(row.description ?? "");
  }, [row.description]);

  const computeHasDraftContent = () => {
    const key = draftKey.trim();
    const value = draftValue.trim();
    const desc = showDescription ? draftDescription.trim() : "";
    return Boolean(key || value || desc);
  };

  useEffect(() => {
    const hasDraftContent = computeHasDraftContent();
    onReportMeta?.(row._id, { hasDraftContent });
  }, [draftKey, draftValue, draftDescription, row._id, showDescription]);

  const TypeIcon = TYPE_ICONS[row.type] || FileText;
  const parentIsEmpty = !row.key && !row.value;
  const hasError = Boolean(error);

  const handleKeyBlur = () => {
    if (draftKey !== row.key) {
      onUpdate(row._id, { key: draftKey });
    }
  };

  const handleValueBlur = () => {
    if (draftValue !== row.value) {
      onUpdate(row._id, { value: draftValue });
    }
  };

  const handleDescriptionBlur = () => {
    if (draftDescription !== row.description) {
      onUpdate(row._id, { description: draftDescription });
    }
  };

  const commitAllDrafts = () => {
    const updates = {};
    if (draftKey !== row.key) updates.key = draftKey;
    if (draftValue !== row.value) updates.value = draftValue;
    if (showDescription && draftDescription !== row.description) updates.description = draftDescription;
    if (Object.keys(updates).length > 0) {
      onUpdate(row._id, updates);
    }
  };

  const handleTabFromLastFieldInternal = () => {
    commitAllDrafts();
    setTimeout(() => {
      onTabFromLastField?.(tabBehavior);
    }, 0);
  };

  const handleCellKeyDown = (e, field) => {
    const isLastField = showDescription ? field === "description" : field === "value";
    
    if (e.key === "Tab" && !e.shiftKey && isLastField && tabBehavior) {
      e.preventDefault();
      handleTabFromLastFieldInternal();
      return;
    }
    
    onKeyDown?.(e, rowIndex, field);
  };

  const getGridTemplateColumns = () => {
    const toggleCol = showToggle ? "28px " : "";
    const baseCol = "1fr 1fr";
    const descCol = showDescription ? " 1fr" : "";
    const typeCol = showType ? " 80px" : "";
    const deleteCol = " 32px";
    return `${toggleCol}${baseCol}${descCol}${typeCol}${deleteCol}`;
  };

  const inputBaseClass = cn(
    "h-10 text-sm bg-white border-gray-200 rounded-lg",
    "focus-visible:ring-2 focus-visible:ring-[#1C3693]/20 focus-visible:border-[#1C3693]",
    "transition-all duration-150"
  );

  return (
    <div
      className={cn(
        "grid gap-2.5 items-center py-2 px-2.5 rounded-xl transition-all duration-150",
        isHovered && "bg-gray-50/80",
        !row.enabled && "opacity-50",
        hasError && "bg-red-50/80"
      )}
      style={{
        gridTemplateColumns: getGridTemplateColumns(),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`input-grid-row-${rowIndex}`}
    >
      {showToggle && (
        <Checkbox
          checked={row.enabled}
          onCheckedChange={() => onToggle(row._id)}
          className="data-[state=checked]:bg-[#1C3693] data-[state=checked]:border-[#1C3693]"
        />
      )}

      <div className="relative">
        <EditableCell
          value={draftKey}
          onChange={setDraftKey}
          onBlur={handleKeyBlur}
          placeholder={placeholder.key}
          className={cn(
            inputBaseClass,
            !row.enabled && "text-gray-400",
            hasError && "border-red-400 focus-visible:ring-red-400/20 pr-8"
          )}
          style={{ fontFamily: "Archivo, sans-serif" }}
          testId={`input-grid-key-${rowIndex}`}
          onKeyDown={(e) => handleCellKeyDown(e, "key")}
          disabled={!row.enabled}
        />
        {hasError && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="w-4 h-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent className="bg-red-600 text-white">{error}</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <EditableCell
        value={draftValue}
        onChange={setDraftValue}
        onBlur={handleValueBlur}
        placeholder={placeholder.value}
        className={cn(
          inputBaseClass,
          !row.enabled && "text-gray-400",
          row.type === ROW_TYPES.JSON && "font-mono text-xs"
        )}
        style={{ fontFamily: row.type === ROW_TYPES.JSON ? "monospace" : "Archivo, sans-serif" }}
        testId={`input-grid-value-${rowIndex}`}
        onKeyDown={(e) => handleCellKeyDown(e, "value")}
        disabled={!row.enabled}
      />

      {showDescription && (
        <EditableCell
          value={draftDescription}
          onChange={setDraftDescription}
          onBlur={handleDescriptionBlur}
          placeholder="Description"
          className={cn(
            inputBaseClass,
            "text-gray-500"
          )}
          style={{ fontFamily: "Archivo, sans-serif" }}
          testId={`input-grid-description-${rowIndex}`}
          onKeyDown={(e) => handleCellKeyDown(e, "description")}
          disabled={!row.enabled}
        />
      )}

      {showType && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              tabIndex={parentIsEmpty ? -1 : 0}
              className={cn(
                "h-8 px-2 text-xs gap-1 text-gray-500 hover:text-gray-700",
                "transition-opacity",
                isHovered ? "opacity-100" : "opacity-60"
              )}
            >
              <TypeIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{TYPE_LABELS[row.type]}</span>
              <ChevronDown className={cn("w-3 h-3 transition-opacity", isHovered ? "opacity-100" : "opacity-0")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-28">
            <DropdownMenuItem onClick={() => onSetType(row._id, ROW_TYPES.TEXT)}>
              <FileText className="w-4 h-4 mr-2" />
              Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetType(row._id, ROW_TYPES.JSON)}>
              <Braces className="w-4 h-4 mr-2" />
              JSON
            </DropdownMenuItem>
            {allowFiles && (
              <DropdownMenuItem onClick={() => onSetType(row._id, ROW_TYPES.FILE)}>
                <File className="w-4 h-4 mr-2" />
                File
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            tabIndex={parentIsEmpty ? -1 : 0}
            className={cn(
              "h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50",
              "opacity-0 transition-opacity",
              isHovered && !parentIsEmpty && "opacity-100"
            )}
            onClick={() => onDelete(row._id)}
            disabled={parentIsEmpty}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete row</TooltipContent>
      </Tooltip>

      {hasError && (
        <div 
          className="col-span-full text-xs text-red-600 flex items-center gap-1 pl-8 -mt-1"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
