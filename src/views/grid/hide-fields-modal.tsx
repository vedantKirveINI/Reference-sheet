import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useModalControlStore } from "@/stores";
import { IColumn } from "@/types";

interface HideFieldsModalProps {
  columns: IColumn[];
  hiddenColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onPersist?: (hiddenColumnIds: Set<string>) => void;
}

export function HideFieldsModal({ columns, hiddenColumnIds, onToggleColumn, onPersist }: HideFieldsModalProps) {
  const { hideFields, closeHideFields } = useModalControlStore();

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
            {columns.map((col) => {
              const isVisible = !hiddenColumnIds.has(col.id);
              return (
                <div
                  key={col.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium truncate mr-3">{col.name}</span>
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
