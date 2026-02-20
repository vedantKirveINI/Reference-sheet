import { useState, useEffect } from "react";
import { X, Plus, Layers } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { IColumn } from "@/types";

export interface GroupRule {
  columnId: string;
  direction: "asc" | "desc";
}

interface GroupPopoverProps {
  columns: IColumn[];
  groupConfig: GroupRule[];
  onApply: (config: GroupRule[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupPopover({ columns, groupConfig, onApply, open, onOpenChange }: GroupPopoverProps) {
  const [rules, setRules] = useState<GroupRule[]>([]);

  useEffect(() => {
    if (open) {
      setRules(groupConfig.length > 0 ? [...groupConfig] : []);
    }
  }, [open, groupConfig]);

  const addRule = () => {
    const usedIds = new Set(rules.map((r) => r.columnId));
    const available = columns.find((c) => !usedIds.has(c.id));
    if (available) {
      setRules([...rules, { columnId: available.id, direction: "asc" }]);
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, updates: Partial<GroupRule>) => {
    setRules(rules.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  };

  const handleApply = () => {
    onApply(rules.filter((r) => r.columnId));
    onOpenChange(false);
  };

  const handleClear = () => {
    onApply([]);
    onOpenChange(false);
  };

  return (
    <PopoverContent className="w-96 p-0" align="start" sideOffset={4}>
      <div className="p-3 border-b">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Group By
        </h4>
      </div>
      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        {rules.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No grouping. Click "Add group" to begin.
          </p>
        )}
        {rules.map((rule, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">
              {index === 0 ? "Group by" : "Then by"}
            </span>
            <select
              value={rule.columnId}
              onChange={(e) =>
                updateRule(index, { columnId: e.target.value })
              }
              className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
            <select
              value={rule.direction}
              onChange={(e) =>
                updateRule(index, {
                  direction: e.target.value as "asc" | "desc",
                })
              }
              className="flex h-8 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => removeRule(index)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <div className="p-3 border-t flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={addRule}
          disabled={rules.length >= columns.length}
        >
          <Plus className="h-3.5 w-3.5" />
          Add group
        </Button>
        <div className="flex items-center gap-2">
          {groupConfig.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear all
            </Button>
          )}
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    </PopoverContent>
  );
}
