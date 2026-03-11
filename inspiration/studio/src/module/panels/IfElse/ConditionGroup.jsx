import React from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConditionRow from "./ConditionRow";

const ConditionGroup = ({
  conditions = [],
  availableFields = [],
  onConditionChange,
  onConditionDelete,
  onAddCondition,
  onLogicToggle,
}) => {
  const handleFieldChange = (conditionId, field) => {
    onConditionChange(conditionId, { field });
  };

  const handleOperatorChange = (conditionId, operator) => {
    onConditionChange(conditionId, { operator });
  };

  const handleValueChange = (conditionId, value) => {
    onConditionChange(conditionId, { value });
  };

  if (conditions.length === 0) {
    return (
      <div className="text-center py-6">
        <p
          className="text-gray-500 text-sm mb-3"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          No conditions defined
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddCondition}
          className={cn(
            "border-dashed border-gray-300",
            "hover:border-[#1C3693] hover:text-[#1C3693]"
          )}
          data-testid="add-first-condition-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Condition
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conditions.map((condition, index) => (
        <ConditionRow
          key={condition.id}
          condition={condition}
          availableFields={availableFields}
          showLogicToggle={index > 0}
          onFieldChange={(field) => handleFieldChange(condition.id, field)}
          onOperatorChange={(operator) => handleOperatorChange(condition.id, operator)}
          onValueChange={(value) => handleValueChange(condition.id, value)}
          onLogicToggle={() => onLogicToggle(condition.id)}
          onDelete={() => onConditionDelete(condition.id)}
        />
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onAddCondition}
        className={cn(
          "w-full mt-2 border border-dashed border-gray-300",
          "text-gray-500 hover:text-[#1C3693] hover:border-[#1C3693]",
          "hover:bg-[#1C3693]/5"
        )}
        data-testid="add-condition-button"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Condition
      </Button>
    </div>
  );
};

export default ConditionGroup;
