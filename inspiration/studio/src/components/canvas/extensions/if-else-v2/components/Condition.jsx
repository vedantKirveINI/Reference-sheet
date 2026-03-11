import React, { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VariableSelector from "./VariableSelector";
import OperatorSelector from "./OperatorSelector";
import { getOperators } from "../utils/utils";
import ValueField from "./ValueField";

const Condition = ({
  condition,
  index,
  variables,
  isAdvanced = false,
  onChange = () => {},
  onDelete = () => {},
}) => {
  const handleChange = useCallback(
    (type, value) => {
      if (type === "variable") {
        onChange(
          {
            ...condition,
            variable: value,
            operation: getOperators(
              value?.variableData?.type,
              value?.variableData?.nodeType
            )?.[0],
            value: [],
          },
          index
        );
      } else if (type === "operation") {
        onChange(
          {
            ...condition,
            operation: value,
            value:
              condition.operation.valueInputs?.length ===
                value.valueInputs?.length &&
              condition.operation.valueInputs[0]?.type ===
                value.valueInputs[0]?.type
                ? condition.value
                : [],
          },
          index
        );
      } else if (type === "value") {
        onChange(
          {
            ...condition,
            value: [...(value || [])],
          },
          index
        );
      }
    },
    [condition, index, onChange]
  );

  return (
    <div className="flex gap-2 items-start w-full">
      <div
        className="flex flex-col gap-3 w-full flex-1 min-w-0"
        data-testid={`condition-field-${index}`}
      >
        <VariableSelector
          index={index}
          variables={variables}
          selectedVariable={condition?.variable}
          onChange={(variable) => {
            handleChange("variable", variable);
          }}
        />
        {!condition?.variable ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed w-full"
                  data-testid="condition-operator-value-placeholder"
                >
                  Select a variable above to set operator and value
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Select a variable in the Field column first to compare against an
                operator and value
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <OperatorSelector
              variableType={condition?.variable?.variableData?.type}
              variableNodeType={condition?.variable?.variableData?.nodeType}
              operation={condition?.operation}
              onChange={(operation) => {
                handleChange("operation", operation);
              }}
            />
            {condition?.operation?.valueInputs?.length !== 0 && (
              <ValueField
                index={index}
                variable={condition?.variable}
                operation={condition.operation}
                value={condition?.value || []}
                isAdvanced={isAdvanced}
                variables={variables}
                onChange={(value) => {
                  handleChange("value", value);
                }}
              />
            )}
          </div>
        )}
      </div>
      {index !== 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 text-gray-500 hover:text-red-500 mt-1"
          data-testid="delete-condition"
          onClick={() => onDelete(index)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default Condition;
