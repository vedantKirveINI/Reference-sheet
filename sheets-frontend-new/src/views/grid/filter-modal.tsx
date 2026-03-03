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
import { cn } from "@/lib/utils";

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
      return Sparkles;
    case CellType.Slider:
      return SlidersHorizontal;
    case CellType.OpinionScale:
      return Gauge;
    default:
      return Type;
  }
}

interface FilterPopoverProps {
  columns: IColumn[];
  filterConfig: FilterRule[];
  onApply: (config: FilterRule[]) => void;
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
      <ScrollArea className="max-h-[240px]">
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
      <PopoverContent className="w-52 p-0" align="start" sideOffset={4}>
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
  operators: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = operators.find((op) => op.value === value)?.label ?? value;

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
            key={op.value}
            className={cn(
              "flex w-full items-center px-2 py-1.5 text-xs rounded-sm cursor-pointer",
              value === op.value ? "bg-accent" : "hover:bg-accent"
            )}
            onClick={() => {
              onChange(op.value);
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
  const options = (column.options?.options as string[]) ?? [];

  if (type === CellType.SCQ || type === CellType.DropDown || type === CellType.MCQ) {
    return (
      <SelectValuePicker
        value={rule.value}
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
        options={["1", "2", "3", "4", "5"]}
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
      <Input
        type="date"
        value={rule.value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-xs flex-1"
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

function SelectValuePicker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex-1 justify-between text-xs font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || "Select..."}
          </span>
          <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start" sideOffset={4}>
        <ScrollArea className="max-h-[200px]">
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
        </ScrollArea>
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

export function FilterPopover({ columns, filterConfig, onApply }: FilterPopoverProps) {
  const [draft, setDraft] = useState<FilterRule[]>(filterConfig);

  useEffect(() => {
    setDraft(filterConfig);
  }, [filterConfig]);

  const columnMap = useMemo(
    () => new Map(columns.map((c) => [c.id, c])),
    [columns]
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
    const firstCol = columns[0];
    if (!firstCol) return;
    const ops = getOperatorsForType(firstCol.type);
    updateDraft([
      ...draft,
      {
        columnId: firstCol.id,
        operator: ops[0]?.value ?? "contains",
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
            const operators = getOperatorsForType(col.type);

            return (
              <div key={index} className="flex items-center gap-2">
                <ConjunctionLabel
                  index={index}
                  conjunction={rule.conjunction}
                  onToggle={toggleConjunction}
                />
                <FieldSelectorButton
                  column={col}
                  columns={columns}
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
