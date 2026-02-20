import { useState, useEffect, useMemo } from "react";
import { X, Plus, Filter as FilterIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useModalControlStore } from "@/stores";
import { IColumn, CellType } from "@/types";

export interface FilterRule {
  columnId: string;
  operator: string;
  value: string;
  conjunction: "and" | "or";
}

const OPERATORS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  String: [
    { value: "contains", label: "contains" },
    { value: "does_not_contain", label: "does not contain" },
    { value: "equals", label: "equals" },
    { value: "does_not_equal", label: "does not equal" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  Number: [
    { value: "equals", label: "=" },
    { value: "not_equals", label: "≠" },
    { value: "greater_than", label: ">" },
    { value: "less_than", label: "<" },
    { value: "greater_or_equal", label: "≥" },
    { value: "less_or_equal", label: "≤" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  SCQ: [
    { value: "is", label: "is" },
    { value: "is_not", label: "is not" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  DropDown: [
    { value: "is", label: "is" },
    { value: "is_not", label: "is not" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  MCQ: [
    { value: "contains", label: "contains" },
    { value: "does_not_contain", label: "does not contain" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  YesNo: [
    { value: "is_yes", label: "is Yes" },
    { value: "is_no", label: "is No" },
  ],
  DateTime: [
    { value: "is", label: "is" },
    { value: "is_before", label: "is before" },
    { value: "is_after", label: "is after" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
};

function getOperatorsForType(type: CellType) {
  if (type === CellType.Number || type === CellType.Currency || type === CellType.Rating) {
    return OPERATORS_BY_TYPE.Number;
  }
  if (type === CellType.SCQ) return OPERATORS_BY_TYPE.SCQ;
  if (type === CellType.DropDown) return OPERATORS_BY_TYPE.DropDown;
  if (type === CellType.MCQ) return OPERATORS_BY_TYPE.MCQ;
  if (type === CellType.YesNo) return OPERATORS_BY_TYPE.YesNo;
  if (type === CellType.DateTime || type === CellType.CreatedTime) return OPERATORS_BY_TYPE.DateTime;
  return OPERATORS_BY_TYPE.String;
}

function isNoValueOperator(op: string) {
  return ["is_empty", "is_not_empty", "is_yes", "is_no"].includes(op);
}

interface FilterModalProps {
  columns: IColumn[];
  filterConfig: FilterRule[];
  onApply: (config: FilterRule[]) => void;
}

function FilterRuleValueInput({
  rule,
  column,
  onChange,
}: {
  rule: FilterRule;
  column: IColumn | undefined;
  onChange: (value: string) => void;
}) {
  if (!column || isNoValueOperator(rule.operator)) {
    return null;
  }

  const type = column.type;
  const options = (column.options?.options as string[]) ?? [];

  if (type === CellType.SCQ || type === CellType.DropDown) {
    return (
      <select
        value={rule.value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (type === CellType.MCQ) {
    return (
      <select
        value={rule.value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (type === CellType.Number || type === CellType.Currency || type === CellType.Rating) {
    return (
      <Input
        type="number"
        value={rule.value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Value"
        className="h-8 text-xs"
      />
    );
  }

  if (type === CellType.DateTime || type === CellType.CreatedTime) {
    return (
      <Input
        type="date"
        value={rule.value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-xs"
      />
    );
  }

  return (
    <Input
      type="text"
      value={rule.value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
      className="h-8 text-xs"
    />
  );
}

export function FilterModal({ columns, filterConfig, onApply }: FilterModalProps) {
  const { filter, closeFilter } = useModalControlStore();
  const [rules, setRules] = useState<FilterRule[]>([]);

  useEffect(() => {
    if (filter.isOpen) {
      setRules(filterConfig.length > 0 ? [...filterConfig] : []);
    }
  }, [filter.isOpen, filterConfig]);

  const columnMap = useMemo(
    () => new Map(columns.map((c) => [c.id, c])),
    [columns]
  );

  const addRule = () => {
    const firstCol = columns[0];
    if (!firstCol) return;
    const ops = getOperatorsForType(firstCol.type);
    setRules([
      ...rules,
      {
        columnId: firstCol.id,
        operator: ops[0]?.value ?? "contains",
        value: "",
        conjunction: "and",
      },
    ]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<FilterRule>) => {
    setRules(
      rules.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, ...updates };
        if (updates.columnId && updates.columnId !== r.columnId) {
          const col = columnMap.get(updates.columnId);
          if (col) {
            const ops = getOperatorsForType(col.type);
            updated.operator = ops[0]?.value ?? "contains";
            updated.value = "";
          }
        }
        if (updates.operator && isNoValueOperator(updates.operator)) {
          updated.value = "";
        }
        return updated;
      })
    );
  };

  const handleApply = () => {
    onApply(rules.filter((r) => r.columnId));
    closeFilter();
  };

  const handleClear = () => {
    onApply([]);
    closeFilter();
  };

  return (
    <Dialog open={filter.isOpen} onOpenChange={(open) => !open && closeFilter()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilterIcon className="h-4 w-4" />
            Filter
          </DialogTitle>
          <DialogDescription>
            Add filter conditions to show specific records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {rules.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No filters. Click "Add filter" to begin.
            </p>
          )}
          {rules.map((rule, index) => {
            const col = columnMap.get(rule.columnId);
            const operators = col
              ? getOperatorsForType(col.type)
              : OPERATORS_BY_TYPE.String;

            return (
              <div key={index} className="space-y-1">
                {index > 0 && (
                  <div className="flex items-center gap-2 pl-1">
                    <select
                      value={rule.conjunction}
                      onChange={(e) =>
                        updateRule(index, {
                          conjunction: e.target.value as "and" | "or",
                        })
                      }
                      className="flex h-7 rounded-md border border-input bg-transparent px-2 py-0.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="and">AND</option>
                      <option value="or">OR</option>
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <select
                    value={rule.columnId}
                    onChange={(e) =>
                      updateRule(index, { columnId: e.target.value })
                    }
                    className="flex h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rule.operator}
                    onChange={(e) =>
                      updateRule(index, { operator: e.target.value })
                    }
                    className="flex h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {operators.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex-1 min-w-0">
                    <FilterRuleValueInput
                      rule={rule}
                      column={col}
                      onChange={(value) => updateRule(index, { value })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeRule(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 text-muted-foreground"
          onClick={addRule}
        >
          <Plus className="h-3.5 w-3.5" />
          Add filter
        </Button>

        <DialogFooter>
          {filterConfig.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear all
            </Button>
          )}
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
