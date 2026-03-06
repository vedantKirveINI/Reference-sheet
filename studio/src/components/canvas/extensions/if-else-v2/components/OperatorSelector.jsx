import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOperators } from "../utils/utils";
import InfoTooltip from "./InfoTooltip";

const OperatorSelector = ({
  variableType,
  variableNodeType,
  operation,
  onChange = () => {},
}) => {
  const operatorOptions = getOperators(variableType, variableNodeType);

  return (
    <div className="flex gap-2 items-center">
      <Select
        value={operation?.value || ""}
        onValueChange={(val) => {
          const selected = operatorOptions.find((op) => op.value === val);
          if (selected) onChange(selected);
        }}
      >
        <SelectTrigger
          className={`min-w-[10rem] ${!operation ? "border-red-300 text-red-500" : ""}`}
          data-testid="condition-operator"
        >
          <SelectValue placeholder="Select an operator" />
        </SelectTrigger>
        <SelectContent>
          {operatorOptions.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <InfoTooltip
        content={
          <span className="text-xs text-white">
            Choose how to compare the variable&apos;s value
          </span>
        }
      />
    </div>
  );
};

export default OperatorSelector;
