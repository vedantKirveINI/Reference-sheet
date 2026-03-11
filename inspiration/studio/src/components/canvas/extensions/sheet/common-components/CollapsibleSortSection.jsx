import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SheetOrderByV2 from "./SheetOrderByV2";

const getSortSummary = (sort) => {
  if (!sort || sort.length === 0) {
    return null;
  }

  const validRows = sort.filter((row) => row.column);
  if (validRows.length === 0) {
    return null;
  }

  const parts = validRows.map((row) => {
    const direction = row.order === "ASCENDING" ? "↑" : "↓";
    return `${row.column} ${direction}`;
  });

  return parts.join(", ");
};

const CollapsibleSortSection = ({
  schema,
  sort,
  onChange,
  disabled = false,
}) => {
  const hasSort = sort?.length > 0 && sort.some((r) => r.column);
  const [isExpanded, setIsExpanded] = useState(!hasSort);

  const summary = useMemo(() => getSortSummary(sort), [sort]);

  const handleToggle = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };

  if (disabled) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 opacity-60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">
              Sort is only available for "Update first match"
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isExpanded) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Sort by... <span className="font-normal text-gray-500">(determines which record is "first")</span>
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="p-3">
          <SheetOrderByV2
            schema={schema}
            orderByRowData={sort || []}
            onChange={onChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden bg-white cursor-pointer hover:border-gray-300 transition-colors"
      onClick={handleToggle}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ArrowUpDown className={cn("w-4 h-4 flex-shrink-0", hasSort ? "text-[#22C55E]" : "text-gray-400")} />
          <span className="text-sm text-gray-700 truncate">
            {summary || "No sort applied (uses default order)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
          >
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSortSection;
