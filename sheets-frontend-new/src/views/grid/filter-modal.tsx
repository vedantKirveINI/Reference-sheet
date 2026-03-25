import { useState, useRef, useEffect, useMemo, useCallback, useReducer } from "react";
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ListPlus,
  Check,
} from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IColumn, CellType } from "@/types";
import { isBackendOperatorKey } from "./filter-operator-mapping";
import { getOperatorsForCellType, type FilterOperator } from "./filter-operator-registry";
import { isFilterSupportedType } from "./filter-unsupported-types";
import { cn } from "@/lib/utils";
import { getFieldIcon } from "@/components/icons/field-type-icons";
import type { FilterNode } from "./filter-tree-utils";
import { isGroupNode, filterRulesToTree, treeToFilterRules, createEmptyRoot } from "./filter-tree-utils";
import { filterReducer } from "./filter-reducer";
import { FilterGroup } from "./filter-group";

// Kept for backward compatibility with App.tsx, ai-chat-panel, etc.
export interface FilterRule {
  columnId: string;
  operator: string; // operator id from FilterOperator.id
  value: string;
  conjunction: "and" | "or";
}

// Re-export FilterNode for consumers that want tree-based access
export type { FilterNode } from "./filter-tree-utils";

function isNoValueOperator(op: string) {
  return ["is_empty", "is_not_empty"].includes(op);
}

function normalizeChoiceOptions(column: IColumn): string[] {
  const raw: unknown = (column as any).options;
  const out: string[] = [];

  const pushString = (v: unknown) => {
    if (typeof v !== "string") return;
    const trimmed = v.trim();
    if (trimmed) out.push(trimmed);
  };

  const pushLabelish = (v: any) => {
    if (typeof v === "string") {
      pushString(v);
      return;
    }
    if (!v || typeof v !== "object") return;
    pushString(v.label);
    pushString(v.name);
    pushString(v.value);
  };

  if (Array.isArray(raw)) {
    raw.forEach(pushLabelish);
  } else if (raw && typeof raw === "object") {
    const maybeOptions: unknown = (raw as any).options;
    const maybeChoices: unknown = (raw as any).choices;
    if (Array.isArray(maybeOptions)) {
      maybeOptions.forEach(pushLabelish);
    } else if (Array.isArray(maybeChoices)) {
      maybeChoices.forEach(pushLabelish);
    }
  }

  return Array.from(new Set(out));
}

function parseMaybeJsonStringArray(value: unknown): string[] | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("[")) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) return null;
    const arr = parsed
      .filter((v) => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);
    return arr;
  } catch {
    return null;
  }
}

interface FilterPopoverProps {
  columns: IColumn[];
  filterConfig: FilterRule[] | FilterNode;
  onApply: (config: FilterNode) => void;
  isOpen?: boolean;
}

function FieldPickerList({
  columns,
  onSelect,
}: {
  columns: IColumn[];
  onSelect: (col: IColumn) => void;
}) {
  const { t } = useTranslation(['common']);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const filtered = columns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <div className="px-2 pt-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={t('fieldModal.searchFields')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="max-h-[260px] overflow-y-auto">
        <div className="py-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2 text-center">
              No fields found
            </p>
          )}
          {filtered.map((col) => {
            const Icon = getFieldIcon(col.type);
            return (
              <button
                key={col.id}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent rounded-sm cursor-pointer"
                onClick={() => onSelect(col)}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{col.name}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function FieldSelectorButton({
  column,
  columns,
  onSelect,
}: {
  column: IColumn;
  columns: IColumn[];
  onSelect: (col: IColumn) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = getFieldIcon(column.type);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[150px] h-8 justify-start gap-1.5 text-xs font-normal"
        >
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{column.name}</span>
          <ChevronDown className="h-3 w-3 ml-auto text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 max-h-[320px] p-0" align="start" sideOffset={4}>
        <FieldPickerList
          columns={columns}
          onSelect={(col) => {
            onSelect(col);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function OperatorSelector({
  value,
  operators,
  onChange,
}: {
  value: string;
  operators: FilterOperator[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = useMemo(() => {
    const direct = operators.find((op) => op.id === value);
    if (direct) return direct.label;

    if (isBackendOperatorKey(value)) {
      // Try to map backend keys to one of the provided operators when possible.
      // This keeps things generic while allowing special handling for date-like sets.
      if (value === "<") {
        const dateBefore = operators.find((op) => op.id === "is_before");
        if (dateBefore) return dateBefore.label;
      }
      if (value === ">") {
        const dateAfter = operators.find((op) => op.id === "is_after");
        if (dateAfter) return dateAfter.label;
      }
      if (value === "<=") {
        const dateOnOrBefore = operators.find((op) => op.id === "is_on_or_before");
        if (dateOnOrBefore) return dateOnOrBefore.label;
      }
      if (value === ">=") {
        const dateOnOrAfter = operators.find((op) => op.id === "is_on_or_after");
        if (dateOnOrAfter) return dateOnOrAfter.label;
      }

      // Final fallback: look up by backendKey on the current operator set.
      const byBackendKey = operators.find((op) => op.backendKey === value as any);
      if (byBackendKey) return byBackendKey.label;

      // Absolute fallback: just echo the raw backend key.
      return value;
    }

    return value;
  }, [operators, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[140px] h-8 justify-between text-xs font-normal"
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start" sideOffset={4}>
        {operators.map((op) => (
          <button
            key={op.id}
            className={cn(
              "flex w-full items-center px-2 py-1.5 text-xs rounded-sm cursor-pointer",
              value === op.id ? "bg-accent" : "hover:bg-accent"
            )}
            onClick={() => {
              onChange(op.id);
              setOpen(false);
            }}
          >
            {op.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function FilterNodeValueInput({
  node,
  column,
  onChange,
}: {
  node: FilterNode;
  column: IColumn | undefined;
  onChange: (value: string) => void;
}) {
  if (!column || isNoValueOperator(node.operator || "")) {
    return null;
  }

  const type = column.type;
  const options = normalizeChoiceOptions(column);
  const displayValues = (() => {
    if (isNoValueOperator(node.operator || "")) return [];

    if (column.type === CellType.MCQ || column.type === CellType.DropDown) {
      const rawValue: any = node.value as any;

      // Preferred: value already stored as array of strings
      if (Array.isArray(rawValue)) {
        return rawValue.filter((v) => typeof v === "string") as string[];
      }

      // Backwards-compat: value stored as JSON string array
      const parsed = parseMaybeJsonStringArray(rawValue);
      if (parsed) return parsed;

      // Fallback: single scalar value
      return rawValue ? [String(rawValue)] : [];
    }

    if (column.type === CellType.SCQ || column.type === CellType.DropDown) {
      const rawValue: any = node.value as any;
      if (Array.isArray(rawValue)) {
        return rawValue.filter((v) => typeof v === "string") as string[];
      }
      return rawValue ? [String(rawValue)] : [];
    }

    const rawValue: any = node.value as any;
    if (Array.isArray(rawValue)) {
      return rawValue.filter((v) => typeof v === "string") as string[];
    }
    return rawValue ? [String(rawValue)] : [];
  })();
  const displayValue =
    displayValues.length > 1
      ? displayValues.join(", ")
      : displayValues[0] ?? "";

  if (
    type === CellType.SCQ ||
    type === CellType.Ranking
  ) {
    return (
      <SelectValuePicker
        value={node.value || ""}
        displayValue={displayValue || undefined}
        options={options}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.MCQ || type === CellType.DropDown) {
    const selectedValues = displayValues;
    return (
      <MultiSelectValuePicker
        value={node.value as any}
        selectedValues={selectedValues}
        options={options}
        onChange={(nextSelected) => {
          // Store as array-of-strings so:
          // - chips are always prefilled in the UI
          // - backend can receive a real string[] without extra parsing
          onChange(nextSelected as any);
        }}
      />
    );
  }

  if (type === CellType.YesNo) {
    return (
      <SelectValuePicker
        value={node.value || ""}
        options={["Yes", "No"]}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.Rating) {
    return (
      <SelectValuePicker
        value={node.value || ""}
        options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.OpinionScale) {
    return (
      <SelectValuePicker
        value={node.value || ""}
        options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.Number || type === CellType.Currency || type === CellType.Slider) {
    return (
      <Input
        type="number"
        value={node.value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Value"
        className="h-8 text-xs flex-1"
      />
    );
  }

  if (type === CellType.DateTime || type === CellType.CreatedTime || type === CellType.LastModifiedTime) {
    return (
      <FilterDateInput
        value={node.value || ""}
        onChange={onChange}
      />
    );
  }

  return (
    <Input
      type="text"
      value={node.value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Value"
      className="h-8 text-xs flex-1"
    />
  );
}

function FilterDateInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const normalizedValue = useMemo(() => {
    if (!value) return "";
    const v = value.trim();

    // Already in native date input format
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      return v;
    }

    // Common DD/MM/YYYY (legacy) → YYYY-MM-DD
    const dateLike = v.replace(/-/g, "/");
    const parts = dateLike.split("/");
    if (parts.length === 3) {
      const [a, b, c] = parts;
      if (a.length === 4) {
        // YYYY/MM/DD
        const year = a;
        const month = b.padStart(2, "0");
        const day = c.padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      if (c.length === 4) {
        // DD/MM/YYYY
        const year = c;
        const month = b.padStart(2, "0");
        const day = a.padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }

    // ISO datetime like 2026-03-13T00:00:00Z → take date part
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
      return v.slice(0, 10);
    }

    // Fallback: try Date.parse
    const d = new Date(v);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return v;
  }, [value]);

  const handleChange = (e: any) => {
    const next = e.target.value;

    // Do not allow clearing the date from an existing rule.
    // Users should delete the rule entirely instead.
    if (!next) {
      return;
    }

    onChange(next);
  };

  return (
    <Input
      type="date"
      value={normalizedValue}
      onChange={handleChange}
      className="h-8 text-xs flex-1"
    />
  );
}

function SelectValuePicker({
  value,
  displayValue,
  options,
  onChange,
}: {
  value: string;
  displayValue?: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const shown = displayValue ?? value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 justify-between text-xs font-normal"
        >
          <span className={cn("truncate", !shown && "text-muted-foreground")}>
            {shown || "Select..."}
          </span>
          <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start" sideOffset={4}>
        <div className="max-h-60 overflow-auto">
          {options.map((opt) => (
            <button
              key={opt}
              className={cn(
                "flex w-full items-center px-2 py-1.5 text-xs rounded-sm cursor-pointer",
                value === opt ? "bg-accent" : "hover:bg-accent"
              )}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <span className="truncate">{opt}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MultiSelectValuePicker({
  value,
  selectedValues,
  options,
  onChange,
}: {
  value: string;
  selectedValues: string[];
  options: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (opt: string) => {
    const set = new Set(selectedValues);
    if (set.has(opt)) {
      set.delete(opt);
    } else {
      set.add(opt);
    }
    onChange(Array.from(set));
  };

  const shown = (() => {
    if (selectedValues.length === 0) return "";
    return "";
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 max-w-56 justify-between text-xs font-normal"
        >
          <span className="flex-1 flex flex-wrap gap-1 items-center overflow-hidden">
            {selectedValues.length === 0 ? (
              <span className="text-muted-foreground truncate">
                Select...
              </span>
            ) : (
              <>
                {selectedValues.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[length:var(--app-font-xs)] font-medium text-foreground max-w-[120px]"
                  >
                    <span className="truncate">{label}</span>
                  </span>
                ))}
              </>
            )}
          </span>
          <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start" sideOffset={4}>
        <div className="max-h-60 overflow-auto py-1">
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt);
            return (
              <button
                key={opt}
                className={cn(
                  "flex w-full items-center px-2 py-1.5 text-xs rounded-sm cursor-pointer gap-2",
                  isSelected ? "bg-accent" : "hover:bg-accent",
                )}
                onClick={() => {
                  toggleOption(opt);
                }}
              >
                <span
                  className={cn(
                    "inline-flex h-3 w-3 min-w-3 items-center justify-center rounded-[2px] border border-muted-foreground/40 shrink-0",
                    isSelected &&
                      "bg-primary text-primary-foreground border-primary",
                  )}
                >
                  {isSelected && <Check className="h-2 w-2" />}
                </span>
                <span className="truncate">{opt}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ConjunctionLabel({
  index,
  conjunction,
  onToggle,
}: {
  index: number;
  conjunction: "and" | "or";
  onToggle: () => void;
}) {
  if (index === 0) {
    return (
      <span className="inline-flex items-center justify-center min-w-[52px] h-7 px-2 text-xs text-muted-foreground">
        Where
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="xs"
      className="min-w-[52px] text-xs font-normal"
      onClick={onToggle}
    >
      {conjunction === "and" ? "And" : "Or"}
    </Button>
  );
}

// Normalize input: accept FilterRule[] (legacy) or FilterNode (tree)
function normalizeFilterConfig(config: FilterRule[] | FilterNode): FilterNode {
  if (Array.isArray(config)) {
    return filterRulesToTree(config);
  }
  // Already a FilterNode tree
  return config;
}

export function FilterPopover({ columns, filterConfig, onApply, isOpen }: FilterPopoverProps) {
  const configAsTree = useMemo(() => normalizeFilterConfig(filterConfig), [filterConfig]);

  const [draft, dispatch] = useReducer(filterReducer, configAsTree);

  // Sync draft when filterConfig changes from outside
  useEffect(() => {
    dispatch({ type: "SET_VALUE", payload: normalizeFilterConfig(filterConfig) });
  }, [filterConfig]);

  useEffect(() => {
    if (isOpen) {
      dispatch({ type: "SET_VALUE", payload: normalizeFilterConfig(filterConfig) });
    }
  }, [isOpen, filterConfig]);

  const supportedColumns = useMemo(
    () => columns.filter((c) => isFilterSupportedType(c.type)),
    [columns]
  );

  const columnMap = useMemo(
    () => {
      const m = new Map<string, IColumn>();
      for (const c of supportedColumns) {
        m.set(String(c.id), c);

        const rawId = (c as any).rawId;
        if (rawId !== undefined && rawId !== null) {
          m.set(String(rawId), c);
        }

        const dbFieldName = (c as any).dbFieldName;
        if (typeof dbFieldName === "string" && dbFieldName) {
          m.set(dbFieldName, c);
        }
      }
      return m;
    },
    [supportedColumns]
  );

  const firstColumnId = supportedColumns[0]?.id ?? "";
  const defaultOperator = useMemo(() => {
    const firstCol = supportedColumns[0];
    if (!firstCol) return "contains";
    const ops = getOperatorsForCellType(firstCol.type);
    return ops[0]?.id ?? "contains";
  }, [supportedColumns]);

  const handleFieldChange = useCallback((path: string, newColumnId: string) => {
    const col = columnMap.get(newColumnId);
    if (col) {
      const ops = getOperatorsForCellType(col.type);
      let newOperator = ops[0]?.id ?? "contains";
      let newValue: any = "";
      if (col.type === CellType.YesNo) {
        newOperator = "is";
        newValue = "Yes";
      }
      dispatch({ type: "UPDATE_FIELD", payload: { path, property: "columnId", value: newColumnId } });
      dispatch({ type: "UPDATE_FIELD", payload: { path, property: "operator", value: newOperator } });
      dispatch({ type: "UPDATE_FIELD", payload: { path, property: "value", value: newValue } });
    }
  }, [columnMap]);

  const handleOperatorChange = useCallback((path: string, newOperator: string) => {
    dispatch({ type: "UPDATE_FIELD", payload: { path, property: "operator", value: newOperator } });
    if (isNoValueOperator(newOperator)) {
      dispatch({ type: "UPDATE_FIELD", payload: { path, property: "value", value: "" } });
    }
  }, []);

  const handleValueChange = useCallback((path: string, newValue: any) => {
    dispatch({ type: "UPDATE_FIELD", payload: { path, property: "value", value: newValue } });
  }, []);

  const handleApply = () => {
    onApply(draft);
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(configAsTree);
  const hasChildren = draft.children && draft.children.length > 0;

  // Renders a single leaf condition row (reusing existing UI components)
  const renderLeafRow = useCallback((child: FilterNode, childPath: string) => {
    const col = child.columnId ? columnMap.get(child.columnId) : undefined;
    if (!col) return null;
    const operators = getOperatorsForCellType(col.type);

    // Determine index within parent for ConjunctionLabel
    const pathParts = childPath.split(".");
    const lastPart = pathParts[pathParts.length - 1];
    const indexMatch = lastPart.match(/children\[(\d+)\]/);
    const childIndex = indexMatch ? parseInt(indexMatch[1], 10) : 0;

    // Get parent path to determine parent conjunction
    const parentPath = pathParts.slice(0, -1).join(".");

    return (
      <div key={child.id} className="flex items-center gap-2">
        <ConjunctionLabel
          index={childIndex}
          conjunction={child.conjunction || "and"}
          onToggle={() => {
            // Toggle the parent group's conjunction
            const targetPath = parentPath || "";
            const currentConj = draft.conjunction;
            // Find the actual parent node's conjunction
            if (parentPath) {
              dispatch({
                type: "CHANGE_CONJUNCTION",
                payload: {
                  path: parentPath,
                  conjunction: (() => {
                    // Walk up to find the parent node
                    const parts = parentPath.split(".");
                    let node: any = draft;
                    for (const p of parts) {
                      const m = p.match(/children\[(\d+)\]/);
                      if (m) node = node.children[parseInt(m[1], 10)];
                    }
                    return node.conjunction === "and" ? "or" : "and";
                  })(),
                },
              });
            } else {
              dispatch({
                type: "CHANGE_CONJUNCTION",
                payload: {
                  path: "",
                  conjunction: currentConj === "and" ? "or" : "and",
                },
              });
            }
          }}
        />
        <FieldSelectorButton
          column={col}
          columns={supportedColumns}
          onSelect={(c) => handleFieldChange(childPath, c.id)}
        />
        <OperatorSelector
          value={child.operator || "contains"}
          operators={operators}
          onChange={(op) => handleOperatorChange(childPath, op)}
        />
        <div className="flex-1 min-w-0">
          <FilterNodeValueInput
            node={child}
            column={col}
            onChange={(value) => handleValueChange(childPath, value)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => dispatch({ type: "DELETE_CONDITION", payload: { path: childPath } })}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }, [columnMap, supportedColumns, draft, handleFieldChange, handleOperatorChange, handleValueChange]);

  return (
    <PopoverContent className="w-auto min-w-[520px] p-0" align="start" sideOffset={4}>
      {!hasChildren ? (
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">No filter conditions applied</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-auto py-3 px-3">
          <FilterGroup
            node={draft}
            path=""
            nestedLevel={0}
            columns={supportedColumns}
            columnMap={columnMap}
            dispatch={dispatch}
            firstColumnId={firstColumnId}
            defaultOperator={defaultOperator}
            renderLeafRow={renderLeafRow}
          />
        </div>
      )}
      <div className="px-3 pb-3 pt-1 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() =>
            dispatch({
              type: "ADD_CONDITION",
              payload: { path: "", isGroup: false, firstColumnId, defaultOperator },
            })
          }
        >
          <Plus className="h-3.5 w-3.5" />
          Add condition
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() =>
            dispatch({
              type: "ADD_CONDITION",
              payload: { path: "", isGroup: true, firstColumnId, defaultOperator },
            })
          }
        >
          <ListPlus className="h-3.5 w-3.5" />
          Add condition group
        </Button>
        <div className="flex-1" />
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-[#39A380] hover:bg-[#2e8a6b] text-white"
          onClick={handleApply}
          disabled={!hasChanges}
        >
          <Check className="h-3.5 w-3.5" />
          Apply Filters
        </Button>
      </div>
    </PopoverContent>
  );
}
