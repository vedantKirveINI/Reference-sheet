import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Star,
  DollarSign,
  Phone,
  MapPin,
  Paperclip,
  PenTool,
  FunctionSquare,
  Sparkles,
  SlidersHorizontal,
  Gauge,
  ListPlus,
  Check,
} from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IColumn, CellType } from "@/types";
import { getBackendOperatorLabel, isBackendOperatorKey } from "./filter-operator-mapping";
import { getOperatorsForCellType, type FilterOperator } from "./filter-operator-registry";
import { isFilterSupportedType } from "./filter-unsupported-types";
import { cn } from "@/lib/utils";

export interface FilterRule {
  columnId: string;
  operator: string; // operator id from FilterOperator.id
  value: string;
  conjunction: "and" | "or";
}

function isNoValueOperator(op: string) {
  return ["is_empty", "is_not_empty"].includes(op);
}

function getFieldIcon(type: CellType) {
  switch (type) {
    case CellType.String:
    case CellType.LongText:
      return Type;
    case CellType.Number:
      return Hash;
    case CellType.DateTime:
    case CellType.CreatedTime:
      return Calendar;
    case CellType.YesNo:
      return CheckSquare;
    case CellType.SCQ:
    case CellType.DropDown:
      return ChevronDown;
    case CellType.MCQ:
    case CellType.List:
      return List;
    case CellType.Rating:
    case CellType.Ranking:
      return Star;
    case CellType.Currency:
      return DollarSign;
    case CellType.PhoneNumber:
      return Phone;
    case CellType.Address:
      return MapPin;
    case CellType.FileUpload:
      return Paperclip;
    case CellType.Signature:
      return PenTool;
    case CellType.Formula:
      return FunctionSquare;
    case CellType.Enrichment:
    case CellType.AiColumn:
      return Sparkles;
    case CellType.Slider:
      return SlidersHorizontal;
    case CellType.OpinionScale:
      return Gauge;
    default:
      return Type;
  }
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

function parseMaybeJsonStringArray(value: string): string[] | null {
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
  filterConfig: FilterRule[];
  onApply: (config: FilterRule[]) => void;
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

      // Fallback: generic backend label (e.g. "is empty", "is not empty", "<", ">").
      return getBackendOperatorLabel(value);
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
  const options = normalizeChoiceOptions(column);
  const displayValues = (() => {
    if (isNoValueOperator(rule.operator)) return [];

    if (column.type === CellType.MCQ) {
      const parsed = parseMaybeJsonStringArray(rule.value);
      if (parsed) return parsed;
      return rule.value ? [rule.value] : [];
    }

    if (column.type === CellType.SCQ || column.type === CellType.DropDown) {
      return rule.value ? [rule.value] : [];
    }

    return rule.value ? [rule.value] : [];
  })();
  const displayValue =
    displayValues.length > 1
      ? displayValues.join(", ")
      : displayValues[0] ?? "";

  if (
    type === CellType.SCQ ||
    type === CellType.DropDown ||
    type === CellType.MCQ ||
    type === CellType.Ranking
  ) {
    return (
      <SelectValuePicker
        value={rule.value}
        displayValue={displayValue || undefined}
        options={options}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.YesNo) {
    return (
      <SelectValuePicker
        value={rule.value}
        options={["Yes", "No"]}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.Rating) {
    return (
      <SelectValuePicker
        value={rule.value}
        options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.OpinionScale) {
    return (
      <SelectValuePicker
        value={rule.value}
        options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
        onChange={onChange}
      />
    );
  }

  if (type === CellType.Number || type === CellType.Currency || type === CellType.Slider) {
    return (
      <Input
        type="number"
        value={rule.value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Value"
        className="h-8 text-xs flex-1"
      />
    );
  }

  if (type === CellType.DateTime || type === CellType.CreatedTime) {
    return (
      <FilterDateInput
        value={rule.value}
        onChange={onChange}
      />
    );
  }

  return (
    <Input
      type="text"
      value={rule.value}
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
      <PopoverContent className="w-44 p-1" align="start" sideOffset={4}>
        <div>
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
              {opt}
            </button>
          ))}
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

export function FilterPopover({ columns, filterConfig, onApply, isOpen }: FilterPopoverProps) {
  const [draft, setDraft] = useState<FilterRule[]>(filterConfig);

  useEffect(() => {
    setDraft(filterConfig);
  }, [filterConfig]);

  useEffect(() => {
    if (isOpen) {
      setDraft(filterConfig);
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
        // Primary key: grid column id (usually dbFieldName)
        m.set(String(c.id), c);

        // Also index by raw field id when available, because view.filter leaf nodes
        // may store numeric field ids (and App.tsx may pass them through as strings).
        const rawId = (c as any).rawId;
        if (rawId !== undefined && rawId !== null) {
          m.set(String(rawId), c);
        }

        // Also index by dbFieldName when present (some callers may use it explicitly).
        const dbFieldName = (c as any).dbFieldName;
        if (typeof dbFieldName === "string" && dbFieldName) {
          m.set(dbFieldName, c);
        }
      }
      return m;
    },
    [supportedColumns]
  );

  const currentConjunction = useMemo(() => {
    const conj = draft.find((r) => r.conjunction)?.conjunction;
    return conj ?? "and";
  }, [draft]);

  const updateDraft = useCallback(
    (newRules: FilterRule[]) => {
      setDraft(newRules.filter((r) => r.columnId));
    },
    []
  );

  const addRule = () => {
    const firstCol = supportedColumns[0];
    if (!firstCol) return;
    const ops = getOperatorsForCellType(firstCol.type);
    updateDraft([
      ...draft,
      {
        columnId: firstCol.id,
        operator: ops[0]?.id ?? "contains",
        value: "",
        conjunction: currentConjunction,
      },
    ]);
  };

  const removeRule = (index: number) => {
    updateDraft(draft.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<FilterRule>) => {
    updateDraft(
      draft.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, ...updates };
        if (updates.columnId && updates.columnId !== r.columnId) {
          const col = columnMap.get(updates.columnId);
          if (col) {
            const ops = getOperatorsForCellType(col.type);
            updated.operator = ops[0]?.id ?? "contains";
            updated.value = "";
            if (col.type === CellType.YesNo) {
              updated.operator = "is";
              updated.value = "Yes";
            }
          }
        }
        if (updates.operator && isNoValueOperator(updates.operator)) {
          updated.value = "";
        }
        return updated;
      })
    );
  };

  const toggleConjunction = () => {
    const newConj = currentConjunction === "and" ? "or" : "and";
    updateDraft(draft.map((r) => ({ ...r, conjunction: newConj })));
  };

  const handleApply = () => {
    onApply(draft);
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(filterConfig);

  return (
    <PopoverContent className="w-auto min-w-[520px] p-0" align="start" sideOffset={4}>
      {draft.length === 0 ? (
        <div className="px-4 py-4">
          <p className="text-sm text-muted-foreground">No filter conditions applied</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-auto py-3 px-3 flex flex-col gap-2">
          {draft.map((rule, index) => {
            const col = columnMap.get(rule.columnId);
            if (!col) return null;
            const operators = getOperatorsForCellType(col.type);

            return (
              <div key={index} className="flex items-center gap-2">
                <ConjunctionLabel
                  index={index}
                  conjunction={rule.conjunction}
                  onToggle={toggleConjunction}
                />
                <FieldSelectorButton
                  column={col}
                  columns={supportedColumns}
                  onSelect={(c) => updateRule(index, { columnId: c.id })}
                />
                <OperatorSelector
                  value={rule.operator}
                  operators={operators}
                  onChange={(op) => updateRule(index, { operator: op })}
                />
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
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <div className="px-3 pb-3 pt-1 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={addRule}
        >
          <Plus className="h-3.5 w-3.5" />
          Add condition
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={addRule}
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
