import { useState, useEffect } from "react";
import { X, Plus, Group } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModalControlStore } from "@/stores";
import { IColumn } from "@/types";

export interface GroupRule {
  columnId: string;
  direction: "asc" | "desc";
}

interface GroupModalProps {
  columns: IColumn[];
  groupConfig: GroupRule[];
  onApply: (config: GroupRule[]) => void;
}

export function GroupModal({ columns, groupConfig, onApply }: GroupModalProps) {
  const { groupBy, closeGroupBy } = useModalControlStore();
  const [rules, setRules] = useState<GroupRule[]>([]);

  useEffect(() => {
    if (groupBy.isOpen) {
      setRules(groupConfig.length > 0 ? [...groupConfig] : []);
    }
  }, [groupBy.isOpen, groupConfig]);

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
    closeGroupBy();
  };

  const handleClear = () => {
    onApply([]);
    closeGroupBy();
  };

  return (
    <Dialog open={groupBy.isOpen} onOpenChange={(open) => !open && closeGroupBy()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Group className="h-4 w-4" />
            Group
          </DialogTitle>
          <DialogDescription>
            Group records by field values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-60 overflow-y-auto">
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

        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-1.5 text-muted-foreground"
          onClick={addRule}
          disabled={rules.length >= columns.length}
        >
          <Plus className="h-3.5 w-3.5" />
          Add group
        </Button>

        <DialogFooter>
          {groupConfig.length > 0 && (
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
