import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConditionalColorStore, type ColorRule } from "@/stores/conditional-color-store";
import { cn } from "@/lib/utils";
import { IColumn } from "@/types";

const COLOR_OPTIONS = [
  { label: "Red", value: "rgba(239, 68, 68, 0.15)" },
  { label: "Orange", value: "rgba(249, 115, 22, 0.15)" },
  { label: "Yellow", value: "rgba(234, 179, 8, 0.15)" },
  { label: "Green", value: "rgba(34, 197, 94, 0.15)" },
  { label: "Blue", value: "rgba(59, 130, 246, 0.15)" },
  { label: "Purple", value: "rgba(168, 85, 247, 0.15)" },
  { label: "Pink", value: "rgba(236, 72, 153, 0.15)" },
  { label: "Teal", value: "rgba(20, 184, 166, 0.15)" },
];

const COLOR_PREVIEW = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
];

const OPERATORS: { value: ColorRule["operator"]; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "not contains" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
  { value: "greater_than", label: "greater than" },
  { value: "less_than", label: "less than" },
];

function isNoValueOperator(op: string) {
  return op === "is_empty" || op === "is_not_empty";
}

function MiniDropdown({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 h-8 px-2 text-xs rounded-md border border-input bg-background hover:bg-accent truncate",
            className
          )}
        >
          <span className="truncate">{selected?.label ?? value}</span>
          <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-[140px] p-1" align="start" sideOffset={2}>
        <ScrollArea className="max-h-[200px]">
          <div className="flex flex-col gap-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                className={cn(
                  "w-full text-left px-2 py-1.5 text-xs rounded hover:bg-accent truncate",
                  opt.value === value && "bg-accent font-medium"
                )}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

interface ConditionalColorPopoverProps {
  columns: IColumn[];
  children: React.ReactNode;
}

export function ConditionalColorPopover({
  columns,
  children,
}: ConditionalColorPopoverProps) {
  const rules = useConditionalColorStore((s) => s.rules);
  const addRule = useConditionalColorStore((s) => s.addRule);
  const updateRule = useConditionalColorStore((s) => s.updateRule);
  const removeRule = useConditionalColorStore((s) => s.removeRule);
  const [open, setOpen] = useState(false);

  const columnOptions = columns.map((c) => ({ value: c.id, label: c.name }));
  const operatorOptions = OPERATORS.map((o) => ({ value: o.value, label: o.label }));

  const handleAddRule = () => {
    const firstCol = columns[0];
    if (!firstCol) return;
    const newRule: ColorRule = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      fieldId: firstCol.id,
      operator: "equals",
      value: "",
      color: COLOR_OPTIONS[0].value,
      isActive: true,
    };
    addRule(newRule);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-auto min-w-[480px] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="px-4 pt-3 pb-1">
          <p className="text-[13px] text-muted-foreground">
            Color rows based on field values
          </p>
        </div>

        {rules.length === 0 ? (
          <div className="px-4 py-4">
            <p className="text-sm text-muted-foreground">
              No color rules configured
            </p>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-auto py-3 px-4 flex flex-col gap-2.5">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-1.5">
                <MiniDropdown
                  value={rule.fieldId}
                  options={columnOptions}
                  onChange={(v) => updateRule(rule.id, { fieldId: v })}
                  className="w-[130px]"
                />

                <MiniDropdown
                  value={rule.operator}
                  options={operatorOptions}
                  onChange={(v) =>
                    updateRule(rule.id, { operator: v as ColorRule["operator"] })
                  }
                  className="w-[120px]"
                />

                {!isNoValueOperator(rule.operator) && (
                  <Input
                    value={rule.value}
                    onChange={(e) =>
                      updateRule(rule.id, { value: e.target.value })
                    }
                    placeholder="Value"
                    className="h-8 w-[80px] text-xs"
                  />
                )}

                <div className="flex items-center gap-1 px-1">
                  {COLOR_OPTIONS.map((color, idx) => (
                    <button
                      key={color.value}
                      className={cn(
                        "h-4 w-4 rounded-full border-2 shrink-0 transition-transform",
                        rule.color === color.value
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-110"
                      )}
                      style={{ backgroundColor: COLOR_PREVIEW[idx] }}
                      title={color.label}
                      onClick={() =>
                        updateRule(rule.id, { color: color.value })
                      }
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => removeRule(rule.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 pb-3 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleAddRule}
            disabled={columns.length === 0}
          >
            <Plus className="h-3.5 w-3.5" />
            Add rule
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
