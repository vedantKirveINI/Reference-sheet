import { useCallback, useEffect, useState, useMemo } from "react";
import { Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormulaBar } from "@src/module/ods";
import VariableSelector from "@src/components/canvas/extensions/if-else/components/condition-composer/VariableSelector";
import type { ConditionNode, SchemaField, Operator } from "../types";
import {
  getDataTypeOperator,
  getRhsConfig,
  RHS_TYPES,
} from "../../condition-composer/constant/dataOperator";

interface ConditionRowProps {
  node: ConditionNode;
  path: string;
  schema: SchemaField[];
  variables?: Record<string, any>;
  effects?: any[];
  onUpdateField: (path: string, property: string, value: any) => void;
  onDelete: (path: string) => void;
  onClone: (path: string) => void;
  onChangeConjunction?: (conjunction: "and" | "or") => void;
  isFirst?: boolean;
  conjunction?: "and" | "or";
  dataTestId?: string;
}

export function ConditionRow({
  node,
  path,
  schema,
  variables,
  effects,
  onUpdateField,
  onDelete,
  onClone,
  onChangeConjunction,
  isFirst = false,
  conjunction = "and",
  dataTestId = "condition-row",
}: ConditionRowProps) {
  const [operatorOptions, setOperatorOptions] = useState<Operator[]>([]);
  const [inputMode, setInputMode] = useState<"formula" | "dropdown">("formula");

  const mergedVariables = useMemo(() => {
    if (!effects || effects.length === 0) {
      return variables;
    }
    return {
      ...variables,
      NODE: effects,
    };
  }, [variables, effects]);

  const currentFieldInfo = useMemo(() => {
    return schema.find((f) => f.name === node.key);
  }, [node.key, schema]);

  useEffect(() => {
    if (node.key && currentFieldInfo) {
      const operators =
        getDataTypeOperator(currentFieldInfo.type?.toUpperCase()) || [];
      setOperatorOptions(operators);
    }
  }, [node.key, currentFieldInfo]);

  const rhsConfig = useMemo(() => {
    if (!currentFieldInfo || !node.operator) {
      return {
        rhsType: RHS_TYPES.FORMULA,
        showModeToggle: false,
        dropdownOptions: [],
      };
    }

    const rawOptions = (currentFieldInfo as any).options;
    const fieldOptions =
      Array.isArray(rawOptions)
        ? rawOptions.map((opt: any) => ({
          value: opt?.value ?? opt,
          label: opt?.label ?? String(opt?.value ?? opt),
        }))
        : [];
    const config = getRhsConfig(
      currentFieldInfo.type,
      node.operator,
      fieldOptions,
    );
    return config;
  }, [currentFieldInfo, node.operator]);

  useEffect(() => {
    if (rhsConfig.defaultMode) {
      setInputMode(rhsConfig.defaultMode as "formula" | "dropdown");
    }
  }, [rhsConfig.defaultMode]);

  const handleModeChange = useCallback((newMode: "formula" | "dropdown") => {
    setInputMode(newMode);
  }, []);

  const currentDropdownValue = useMemo(() => {
    const val = node.value;
    if (!val || typeof val === "string") return null;
    if (!val.blocks || val.blocks.length === 0) return null;
    const firstBlock = val.blocks[0];
    if (firstBlock?.type === "PRIMITIVES") {
      return firstBlock.value;
    }
    return null;
  }, [node.value]);

  const handleFieldSelect = useCallback(
    ({ field, nestedField }: { field: any; nestedField?: string }) => {
      if (!field) {
        onUpdateField(path, "key", { fieldInfo: null, nestedField: undefined });
        return;
      }

      const fieldInfo = schema.find((f) => f.name === (field.name || field));
      if (fieldInfo) {
        onUpdateField(path, "key", { fieldInfo, nestedField });
      } else {
        const syntheticFieldInfo: SchemaField = {
          name: field.name || field,
          field: field.field || field.name || field,
          type: field.type || "TEXT",
          label: field.label || field.name || field,
          options: [],
        };
        onUpdateField(path, "key", {
          fieldInfo: syntheticFieldInfo,
          nestedField,
        });
      }
    },
    [path, schema, onUpdateField],
  );

  const handleOperatorChange = useCallback(
    (opValue: string) => {
      const operator = operatorOptions.find((op) => op.value === opValue);
      if (operator) {
        onUpdateField(path, "operator", operator);
      }
    },
    [path, operatorOptions, onUpdateField],
  );

  const handleValueChange = useCallback(
    (updatedValue: any[], updatedValueStr: string) => {
      onUpdateField(path, "value", {
        type: "fx",
        blocks: updatedValue,
      });
      onUpdateField(path, "valueStr", updatedValueStr);
    },
    [path, onUpdateField],
  );

  const showValueField = node.operator && !rhsConfig.hideRhs;

  const handleConjunctionClick = useCallback(() => {
    if (onChangeConjunction) {
      onChangeConjunction(conjunction === "and" ? "or" : "and");
    }
  }, [conjunction, onChangeConjunction]);

  const hasVariables =
    mergedVariables &&
    ((mergedVariables as any)?.NODE?.length > 0 ||
      Object.keys(mergedVariables).length > 0);

  return (
    <div className="flex flex-col gap-3" data-testid={dataTestId}>
      {!isFirst && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleConjunctionClick}
            className={cn(
              "text-xs font-medium uppercase tracking-wider px-2 py-1 rounded transition-colors",
              onChangeConjunction
                ? "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer"
                : "bg-muted/50 text-muted-foreground cursor-default",
            )}
            disabled={!onChangeConjunction}
            title={
              onChangeConjunction
                ? `Click to switch to ${conjunction === "and" ? "OR" : "AND"}`
                : undefined
            }
            data-testid={`${dataTestId}-conjunction-toggle`}
          >
            {conjunction}
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            {hasVariables ? (
              <div
                className="flex-1"
                data-testid={`${dataTestId}-field-select`}
              >
                <VariableSelector
                  schema={schema}
                  selectedField={node.key}
                  selectedNestedField={(node as any).nested_key}
                  onFieldSelect={handleFieldSelect as any}
                  placeholder="Select field..."
                  error={!node.key}
                />
              </div>
            ) : (
              <Select
                value={node.key || ""}
                onValueChange={(fieldName: string) => {
                  const fieldInfo = schema.find((f) => f.name === fieldName);
                  if (fieldInfo) {
                    onUpdateField(path, "key", {
                      fieldInfo,
                      nestedField: undefined,
                    });
                  }
                }}
              >
                <SelectTrigger
                  className="flex-1 h-9 bg-background min-w-0"
                  data-testid={`${dataTestId}-field-select`}
                >
                  <SelectValue placeholder="Select field..." />
                </SelectTrigger>
                <SelectContent className="max-h-[min(18rem,70vh)]">
                  {schema.map((field) => (
                    <SelectItem key={field.name} value={field.name} className="min-w-0">
                      <span className="truncate block max-w-full">
                        {field.label || field.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={node.operator?.value || ""}
              onValueChange={handleOperatorChange}
              disabled={!node.key}
            >
              <SelectTrigger
                className={cn(
                  "flex-1 h-9 bg-background",
                  !node.key && "opacity-50",
                )}
                data-testid={`${dataTestId}-operator-select`}
              >
                <SelectValue placeholder="Select operator..." />
              </SelectTrigger>
              <SelectContent>
                {operatorOptions.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showValueField && (
            <div
              className="border border-input min-w-48 flex-1 box-border rounded-md bg-background min-h-11"
              data-testid={`${dataTestId}-value-input`}
            >
              <FormulaBar
                hideBorders
                defaultInputContent={
                  typeof node.value === "object" && node.value?.blocks
                    ? node.value.blocks
                    : []
                }
                variables={mergedVariables}
                wrapContent={true}
                placeholder="Enter value..."
                inputMode={inputMode}
                dropdownOptions={rhsConfig.dropdownOptions || []}
                showModeToggle={rhsConfig.showModeToggle}
                onModeChange={handleModeChange}
                defaultDropdownValue={currentDropdownValue}
                slotProps={{
                  container: {
                    className: "max-h-40 overflow-auto",
                  },
                }}
                onInputContentChanged={(
                  updatedValue: any[],
                  updatedValueStr: string,
                ) => {
                  handleValueChange(updatedValue, updatedValueStr);
                }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onClone(path)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Clone condition"
            data-testid={`${dataTestId}-clone`}
          >
            <Copy className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(path)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            title="Delete condition"
            data-testid={`${dataTestId}-delete`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConditionRow;
