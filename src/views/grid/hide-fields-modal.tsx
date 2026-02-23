import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useModalControlStore, useFieldsStore } from "@/stores";
import { IColumn } from "@/types";
import { cn } from "@/lib/utils";

interface HideFieldsModalProps {
  columns: IColumn[];
  hiddenColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onPersist?: (hiddenColumnIds: Set<string>) => void;
}

export function HideFieldsModal({ columns, hiddenColumnIds, onToggleColumn, onPersist }: HideFieldsModalProps) {
  const { hideFields, closeHideFields } = useModalControlStore();
  const getEnrichmentGroupMap = useFieldsStore((s) => s.getEnrichmentGroupMap);

  const groupedColumns = useMemo(() => {
    const enrichmentMap = getEnrichmentGroupMap();
    const childColumnIds = new Set<string>();
    enrichmentMap.forEach((childIds) => {
      childIds.forEach((id) => childColumnIds.add(id));
    });

    const result: Array<{ column: typeof columns[0]; isChild: boolean; parentId: string | null }> = [];

    columns.forEach((col) => {
      if (childColumnIds.has(col.id)) return;

      result.push({ column: col, isChild: false, parentId: null });

      const children = enrichmentMap.get(col.id);
      if (children) {
        children.forEach((childId) => {
          const childCol = columns.find((c) => c.id === childId);
          if (childCol) {
            result.push({ column: childCol, isChild: true, parentId: col.id });
          }
        });
      }
    });

    return result;
  }, [columns, getEnrichmentGroupMap]);

  const enrichmentMap = getEnrichmentGroupMap();

  const handleToggle = (columnId: string) => {
    onToggleColumn(columnId);
    const updatedHidden = new Set(hiddenColumnIds);
    if (updatedHidden.has(columnId)) {
      updatedHidden.delete(columnId);
    } else {
      updatedHidden.add(columnId);
    }
    onPersist?.(updatedHidden);
  };

  return (
    <Dialog open={hideFields} onOpenChange={(open) => { if (!open) closeHideFields(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hide fields</DialogTitle>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto">
          <div className="space-y-1">
            {groupedColumns.map(({ column: col, isChild }) => {
              const isVisible = !hiddenColumnIds.has(col.id);
              return (
                <div
                  key={col.id}
                  className={cn(
                    "flex items-center justify-between rounded-md py-2 transition-colors",
                    isChild
                      ? "pl-6 pr-3 ml-2 border-l-2 border-purple-200 hover:bg-purple-50/50"
                      : "px-3 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2 truncate mr-3">
                    {!isChild && enrichmentMap.has(col.id) && (
                      <span className="text-xs text-purple-500">✨</span>
                    )}
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isChild && "text-muted-foreground text-xs"
                    )}>
                      {col.name}
                    </span>
                  </div>
                  <Switch
                    checked={isVisible}
                    onCheckedChange={() => handleToggle(col.id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {hiddenColumnIds.size > 0 && (
          <div className="border-t pt-3 mt-2">
            <p className="text-xs text-muted-foreground">
              {hiddenColumnIds.size} field{hiddenColumnIds.size !== 1 ? 's' : ''} hidden
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
