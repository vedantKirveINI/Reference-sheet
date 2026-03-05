import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Filter, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConditionComposerV2 } from "@src/module/condition-composer-v2";
import { Button } from "@/components/ui/button";
import { getFilterSummary } from "../filterUtils";

const CollapsibleFilterSection = ({
  schema,
  filter,
  onChange,
  variables,
  hasError = false,
  errorMessage = "",
}) => {
  const hasFilter = filter?.childs?.length > 0;
  const [isExpanded, setIsExpanded] = useState(!hasFilter);

  const summary = useMemo(() => getFilterSummary(filter), [filter]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (isExpanded) {
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Find records where...
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-gray-400" />
        </div>
        <div className="p-3">
          <ConditionComposerV2
            initialValue={filter}
            schema={schema}
            onChange={(updateFilterVal, whereClauseStr) => {
              onChange(updateFilterVal, whereClauseStr);
            }}
            variables={variables}
          />
        </div>
        {hasError && errorMessage && (
          <div className="px-3 pb-3">
            <p className="text-sm text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden bg-white cursor-pointer transition-colors",
        hasError ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-gray-300"
      )}
      onClick={handleToggle}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Filter className={cn("w-4 h-4 flex-shrink-0", hasError ? "text-red-400" : "text-[#22C55E]")} />
          <span className="text-sm text-gray-700 truncate">
            {summary || "No conditions set"}
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
      {hasError && errorMessage && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-xs text-red-500">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default CollapsibleFilterSection;
