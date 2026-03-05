import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InfoTooltip from "./InfoTooltip";
import { QuestionType } from "@src/module/constants";
import {
  booleanOptions,
  yesNoOptions,
  MESSAGES,
  TYPES,
} from "../constants/constants";

const ValueField = ({
  variable,
  variables,
  value,
  operation,
  onChange = () => {},
}) => {
  const handleChange = useCallback(
    (type, newValue, index) => {
      let updatedValue = [];
      operation?.valueInputs?.forEach((input, i) => {
        if (i === index) {
          updatedValue.push({ type, value: newValue });
        } else {
          if (value[i]) {
            updatedValue.push(value[i]);
          } else {
            updatedValue.push({ type, value: "" });
          }
        }
      });
      onChange(updatedValue);
    },
    [onChange, operation?.valueInputs, value]
  );

  const getDescriptionContent = () => {
    if (operation?.description?.length > 0) {
      return (
        <div className="flex flex-col gap-2 p-2">
          {operation.description.map((x, index) => (
            <div
              className="flex flex-col gap-1"
              key={`${x.title}-${index}`}
            >
              <span className="text-xs font-medium text-white">
                {x.title}:
              </span>
              <span className="text-xs text-white">{x.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <span className="text-xs text-white">{MESSAGES.DEFAULT_VALUE_INFO}</span>
    );
  };

  return (
    <div className="flex gap-2 items-start w-full">
      <div className="flex flex-col gap-2 w-full">
        {operation?.valueInputs?.map((input, index) => {
          const allowOverrideNodes = [
            "MCQ",
            "SCQ",
            "DROP_DOWN_STATIC",
            "YES_NO",
          ];
          if (
            operation.allowOverride &&
            allowOverrideNodes.indexOf(variable?.variableData?.nodeType) !== -1
          ) {
            const isYesNo =
              variable?.variableData?.nodeType &&
              String(variable.variableData.nodeType).toUpperCase() ===
                QuestionType.YES_NO;
            const options = isYesNo
              ? yesNoOptions
              : (variables?.NODE?.find(
                  (v) => v.key === variable.variableData.nodeId
                )?.go_data?.options || []).map((opt) => ({
                  label: opt,
                  value: opt,
                }));

            return (
              <Select
                key={`${operation.value}_${index}`}
                value={value?.[index]?.value || ""}
                onValueChange={(val) =>
                  handleChange(TYPES.STRING, val, index)
                }
              >
                <SelectTrigger
                  className={`w-full ${!value?.[index]?.value ? "border-red-300" : ""}`}
                  data-testid="condition-value-dropdown"
                >
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem
                      key={typeof opt === "string" ? opt : opt.value}
                      value={typeof opt === "string" ? opt : opt.value}
                    >
                      {typeof opt === "string" ? opt : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          } else if (input.type === "number") {
            return (
              <Input
                key={`${operation.value}_${index}`}
                data-testid="condition-value"
                type="number"
                defaultValue={value?.[index]?.value}
                placeholder={input.placeholder || "Enter value"}
                className={`w-full ${!value?.[index]?.value ? "border-red-300" : ""}`}
                onChange={(e) =>
                  handleChange(TYPES.NUMBER, e.target.value, index)
                }
              />
            );
          } else if (input.type === "boolean") {
            const isYesNo =
              variable?.variableData?.nodeType &&
              String(variable.variableData.nodeType).toUpperCase() ===
                QuestionType.YES_NO;
            const options = isYesNo ? yesNoOptions : booleanOptions;
            return (
              <Select
                key={`${operation.value}_${index}`}
                value={value?.[index]?.value || ""}
                onValueChange={(val) =>
                  handleChange(
                    isYesNo ? TYPES.STRING : TYPES.BOOLEAN,
                    val,
                    index
                  )
                }
              >
                <SelectTrigger
                  className={`w-full ${!value?.[index]?.value ? "border-red-300" : ""}`}
                  data-testid="condition-value-dropdown"
                >
                  <SelectValue placeholder="Select a value" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          } else if (
            input.type === "string" &&
            variable?.variableData?.nodeType &&
            String(variable.variableData.nodeType).toUpperCase() ===
              QuestionType.YES_NO
          ) {
            return (
              <Select
                key={`${operation.value}_${index}`}
                value={value?.[index]?.value || ""}
                onValueChange={(val) =>
                  handleChange(TYPES.STRING, val, index)
                }
              >
                <SelectTrigger
                  className={`w-full ${!value?.[index]?.value ? "border-red-300" : ""}`}
                  data-testid="condition-value-dropdown"
                >
                  <SelectValue placeholder="Select a value" />
                </SelectTrigger>
                <SelectContent>
                  {yesNoOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          } else {
            return (
              <Input
                key={`${operation.value}_${index}`}
                data-testid="condition-value"
                defaultValue={value?.[index]?.value}
                placeholder={input.placeholder || "Enter value"}
                className={`w-full ${!value?.[index]?.value ? "border-red-300" : ""}`}
                onChange={(e) =>
                  handleChange(TYPES.STRING, e.target.value, index)
                }
              />
            );
          }
        })}
      </div>
      <div className="flex-shrink-0 mt-2">
        <InfoTooltip content={getDescriptionContent()} />
      </div>
    </div>
  );
};

export default ValueField;
