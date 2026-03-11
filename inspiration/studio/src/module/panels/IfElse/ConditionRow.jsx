import React from "react";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

const ConditionRow = ({
  condition,
  availableFields = [],
  showLogicToggle = false,
  onFieldChange,
  onOperatorChange,
  onValueChange,
  onLogicToggle,
  onDelete,
}) => {
  const hideValueInput = condition.operator === "is_empty" || condition.operator === "is_not_empty";

  return (
    <div className="space-y-2">
      {showLogicToggle && (
        <div className="flex justify-center py-1">
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer px-3 py-1 text-xs font-medium uppercase",
              "hover:bg-[#1C3693]/10 transition-colors",
              "border-[#1C3693]/30 text-[#1C3693]"
            )}
            onClick={onLogicToggle}
            data-testid="condition-logic-toggle"
          >
            {condition.logic || "and"}
          </Badge>
        </div>
      )}

      <div
        className={cn(
          "flex items-center gap-2 p-3",
          "rounded-lg border border-gray-200",
          "hover:bg-gray-50 transition-colors",
          "bg-white"
        )}
        style={{ fontFamily: "Archivo, sans-serif" }}
        data-testid="condition-row"
      >
        <div className="flex-1 grid grid-cols-3 gap-2">
          <Select
            value={condition.field || ""}
            onValueChange={onFieldChange}
          >
            <SelectTrigger
              className="h-9 text-sm border-gray-200"
              data-testid="condition-field-select"
            >
              <SelectValue placeholder="Field" />
            </SelectTrigger>
            <SelectContent>
              {availableFields.map((field) => (
                <SelectItem key={field} value={field}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={condition.operator || "equals"}
            onValueChange={onOperatorChange}
          >
            <SelectTrigger
              className="h-9 text-sm border-gray-200"
              data-testid="condition-operator-select"
            >
              <SelectValue placeholder="Operator" />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((op) => (
                <SelectItem key={op.value} value={op.value}>
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!hideValueInput && (
            <Input
              value={condition.value || ""}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="Value"
              className="h-9 text-sm border-gray-200"
              data-testid="condition-value-input"
            />
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
          data-testid="condition-delete-button"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ConditionRow;
