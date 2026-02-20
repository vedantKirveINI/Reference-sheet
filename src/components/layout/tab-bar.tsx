import { useState } from "react";
import { Plus, Table2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Table {
  id: string;
  name: string;
}

interface TabBarProps {
  tables?: Table[];
  activeTableId?: string;
  onTableSelect?: (id: string) => void;
  onAddTable?: () => void;
  isAddingTable?: boolean;
  onRenameTable?: (tableId: string, newName: string) => void;
  onDeleteTable?: (tableId: string) => void;
}

export function TabBar({
  tables: tablesProp,
  activeTableId: activeIdProp,
  onTableSelect,
  onAddTable,
  isAddingTable,
  onRenameTable,
  onDeleteTable,
}: TabBarProps) {
  const defaultTables: Table[] = [{ id: "table-1", name: "Table 1" }];
  const tables = tablesProp || defaultTables;
  const [localActiveId, setLocalActiveId] = useState(activeIdProp || tables[0]?.id);
  const activeId = activeIdProp || localActiveId;
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setLocalActiveId(id);
    onTableSelect?.(id);
  };

  const handleRenameStart = (tableId: string, currentName: string) => {
    setRenamingId(tableId);
    setRenameValue(currentName);
  };

  const handleRenameSave = (tableId: string) => {
    if (renameValue.trim() && renameValue !== tables.find(t => t.id === tableId)?.name) {
      onRenameTable?.(tableId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const handleDeleteConfirm = () => {
    if (tableToDelete) {
      onDeleteTable?.(tableToDelete);
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    }
  };

  const handleDuplicate = (tableId: string) => {
    console.log("Duplicate table coming soon:", tableId);
  };

  const canDelete = tables.length > 1;

  return (
    <>
      <div className="flex h-9 items-center border-b bg-white">
        <ScrollArea className="flex-1">
          <div className="flex items-center">
            {tables.map((table) => {
              const isActive = table.id === activeId;
              const isRenaming = renamingId === table.id;

              return (
                <DropdownMenu key={table.id}>
                  <div
                    className={cn(
                      "group relative flex h-9 cursor-pointer items-center gap-1.5 border-r px-3 text-sm transition-colors",
                      isActive
                        ? "bg-white text-foreground font-medium"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => handleSelect(table.id)}
                  >
                    <Table2 className="h-3.5 w-3.5 shrink-0" />
                    {isRenaming ? (
                      <input
                        autoFocus
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameSave(table.id);
                          } else if (e.key === "Escape") {
                            handleRenameCancel();
                          }
                        }}
                        onBlur={() => handleRenameSave(table.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 max-w-[120px] px-1 py-0.5 text-sm bg-background border rounded outline-none"
                      />
                    ) : (
                      <span className="truncate max-w-[120px]">{table.name}</span>
                    )}

                    {!isRenaming && (
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="ml-1 rounded p-0.5 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                    )}

                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                    )}
                  </div>
                  {!isRenaming && (
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleRenameStart(table.id, table.name)}
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(table.id)}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={!canDelete}
                        onClick={() => {
                          if (canDelete) {
                            setTableToDelete(table.id);
                            setDeleteDialogOpen(true);
                          }
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="flex items-center border-l px-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onAddTable}
            disabled={isAddingTable}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete table?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. Deleting this table will permanently remove all data associated with it.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
