import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Trash2, Copy, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import {
  getRhsConfig,
  RHS_TYPES,
} from "@src/module/condition-composer/constant/dataOperator";
import { getOperatorsBySchema } from "@src/module/condition-composer/utils/getOption";
import VariableSelector from "./VariableSelector";

const NO_VALUE_OPERATORS = [
  "is_null",
  "is_not_null",
  "is empty",
  "is not empty",
];

const ConditionRow = ({
  condition,
  schema = [],
  variables = {},
  onUpdate,
  onDelete,
  onClone,
  isFirst = false,
  conjunction = "and",
  dataTestId = "condition-row",
}) => {
  const [inputMode, setInputMode] = useState("formula");
  const [operatorOptions, setOperatorOptions] = useState([]);

  const showValueField = useMemo(() => {
    const opKey = condition.operator?.key || condition.operator;
    return !NO_VALUE_OPERATORS.includes(opKey);
  }, [condition.operator]);

  useEffect(() => {
    if (condition.key) {
      const options = getOperatorsBySchema({
        schema,
        colName: condition.key,
        nestedKey: condition.nested_key,
      });
      setOperatorOptions(options || []);
    }
  }, [condition.key, schema, condition.nested_key]);

  const selectedFieldType = useMemo(() => {
    const fieldInfo = schema.find((f) => f.name === condition.key);
    return fieldInfo?.type || null;
  }, [condition.key, schema]);

  const rhsConfig = useMemo(() => {
    if (!selectedFieldType || !condition.operator) {
      return {
        rhsType: RHS_TYPES.FORMULA,
        showModeToggle: false,
        dropdownOptions: [],
      };
    }
    const operatorObj = {
      value: condition.operator?.key || condition.operator,
      label: condition.operator?.value || condition.operator,
    };
    const config = getRhsConfig(selectedFieldType, operatorObj, []);
    return config;
  }, [selectedFieldType, condition.operator]);

  useEffect(() => {
    if (rhsConfig.defaultMode) {
      setInputMode(rhsConfig.defaultMode);
    }
  }, [rhsConfig.defaultMode]);

  const handleModeChange = useCallback(
    (newMode) => {
      setInputMode(newMode);
      onUpdate({
        ...condition,
        value: { type: "fx", blocks: [] },
        valueStr: "",
      });
    },
    [condition, onUpdate],
  );

  const currentDropdownValue = useMemo(() => {
    if (!condition.value?.blocks || condition.value.blocks.length === 0)
      return null;
    const block = condition.value.blocks[0];
    if (block?.type === "PRIMITIVES") return block.value;
    return null;
  }, [condition.value]);

  const handleFieldSelect = useCallback(
    ({ field, nestedField }) => {
      if (!field) {
        onUpdate({
          ...condition,
          key: undefined,
          field: undefined,
          type: undefined,
          nested_key: undefined,
          operator: undefined,
        });
        return;
      }

      onUpdate({
        ...condition,
        key: field.name,
        field: field.field || field.name,
        type: field.type,
        nested_key: nestedField,
        operator: undefined,
      });
    },
    [condition, onUpdate],
  );

  const handleOperatorChange = useCallback(
    (opKey) => {
      const operator = operatorOptions.find((op) => op.key === opKey);
      onUpdate({
        ...condition,
        operator: operator || { key: opKey, value: opKey },
      });
    },
    [condition, operatorOptions, onUpdate],
  );

  const handleValueChange = useCallback(
    (blocks, blocksStr) => {
      onUpdate({
        ...condition,
        value: { type: "fx", blocks },
        valueStr: blocksStr,
      });
    },
    [condition, onUpdate],
  );

  return (
    <div className="flex flex-col gap-2" data-testid={dataTestId}>
      {!isFirst && (
        <div className="flex items-center justify-center py-1">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded",
              conjunction === "and"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700",
            )}
          >
            {conjunction}
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex items-start gap-2 p-3 rounded-lg border border-gray-200 bg-white",
          "hover:border-gray-300 transition-colors group",
        )}
      >
        <div className="flex items-center pt-2 opacity-0 group-hover:opacity-40 cursor-grab">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-start">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Field
              </label>
              <VariableSelector
                schema={schema}
                selectedField={condition.key}
                selectedNestedField={condition.nested_key}
                onFieldSelect={handleFieldSelect}
                placeholder="Select a field"
                error={!condition.key}
              />
            </div>

            <div className="space-y-1 w-[140px]">
              <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Operator
              </label>
              <Select
                value={condition.operator?.key || ""}
                onValueChange={handleOperatorChange}
                disabled={!condition.key}
              >
                <SelectTrigger
                  className="h-9 text-sm border-gray-200 bg-gray-50 focus:bg-white"
                  data-testid={`${dataTestId}-operator`}
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {operatorOptions.map((op) => (
                    <SelectItem key={op.key} value={op.key}>
                      {op.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showValueField && (
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  Value
                </label>
                <FormulaBar
                  variables={variables}
                  wrapContent
                  placeholder="Enter value..."
                  defaultInputContent={condition.value?.blocks || []}
                  onInputContentChanged={handleValueChange}
                  inputMode={inputMode}
                  dropdownOptions={rhsConfig.dropdownOptions || []}
                  showModeToggle={"formula"}
                  onModeChange={handleModeChange}
                  defaultDropdownValue={currentDropdownValue}
                  slotProps={{
                    container: {
                      className:
                        "h-9 min-h-[36px] rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-sm focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400 focus-within:bg-white",
                    },
                  }}
                />
              </div>
            )}

            {!showValueField && <div />}
          </div>
        </div>

        <div className="flex items-center gap-0.5 pt-5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClone}
            className="h-7 w-7 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Clone condition"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete condition"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConditionRow;
