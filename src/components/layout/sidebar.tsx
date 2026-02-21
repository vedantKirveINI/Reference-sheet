import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Trash2,
  MoreHorizontal,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores";
import { cn } from "@/lib/utils";

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_DEFAULT_WIDTH = 256;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_WIDTH_KEY = "tinytable-sidebar-width";

function getSavedWidth(): number {
  try {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (saved) {
      const val = parseInt(saved, 10);
      if (!isNaN(val) && val >= SIDEBAR_MIN_WIDTH && val <= SIDEBAR_MAX_WIDTH) return val;
    }
  } catch {}
  return SIDEBAR_DEFAULT_WIDTH;
}

interface SidebarProps {
  baseId?: string;
  tableId?: string;
  tables?: Array<{ id: string; name: string }>;
  activeTableId?: string;
  onTableSelect?: (id: string) => void;
  onAddTable?: () => void;
  isAddingTable?: boolean;
  onRenameTable?: (tableId: string, newName: string) => void;
  onDeleteTable?: (tableId: string) => void;
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
}

export function Sidebar({
  tables,
  activeTableId,
  onTableSelect,
  onAddTable,
  isAddingTable,
  onRenameTable,
  onDeleteTable,
  sidebarWidth: externalWidth,
  onSidebarWidthChange,
}: SidebarProps) {
  const { sidebarExpanded, toggleSidebar } = useUIStore();

  const [internalWidth, setInternalWidth] = useState(getSavedWidth);
  const sidebarWidth = externalWidth ?? internalWidth;
  const setSidebarWidth = useCallback((w: number) => {
    setInternalWidth(w);
    onSidebarWidthChange?.(w);
  }, [onSidebarWidthChange]);

  const [isResizing, setIsResizing] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const peekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [renamingTableId, setRenamingTableId] = useState<string | null>(null);
  const [tableRenameValue, setTableRenameValue] = useState("");
  const tableRenameInputRef = useRef<HTMLInputElement>(null);
  const [deleteTableConfirmOpen, setDeleteTableConfirmOpen] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);

  useEffect(() => {
    if (renamingTableId && tableRenameInputRef.current) {
      tableRenameInputRef.current.focus();
      tableRenameInputRef.current.select();
    }
  }, [renamingTableId]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    } catch {}
  }, [sidebarWidth]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        const newWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, e.clientX));
        setSidebarWidth(newWidth);
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const handlePeekEnter = useCallback(() => {
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }
    setIsPeeking(true);
  }, []);

  const handlePeekLeave = useCallback(() => {
    peekTimeoutRef.current = setTimeout(() => {
      setIsPeeking(false);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (sidebarExpanded) {
      setIsPeeking(false);
    }
  }, [sidebarExpanded]);

  const startTableRename = useCallback((id: string, currentName: string) => {
    setRenamingTableId(id);
    setTableRenameValue(currentName);
  }, []);

  const commitTableRename = useCallback(() => {
    if (!renamingTableId || !tableRenameValue.trim()) {
      setRenamingTableId(null);
      return;
    }
    const table = tables?.find((t) => t.id === renamingTableId);
    if (table && tableRenameValue.trim() !== table.name) {
      onRenameTable?.(renamingTableId, tableRenameValue.trim());
    }
    setRenamingTableId(null);
  }, [renamingTableId, tableRenameValue, tables, onRenameTable]);

  const handleTableDeleteRequest = useCallback(
    (id: string) => {
      if (!tables || tables.length <= 1) return;
      setDeletingTableId(id);
      setDeleteTableConfirmOpen(true);
    },
    [tables]
  );

  const confirmTableDelete = useCallback(() => {
    if (!deletingTableId) return;
    onDeleteTable?.(deletingTableId);
    setDeleteTableConfirmOpen(false);
    setDeletingTableId(null);
  }, [deletingTableId, onDeleteTable]);

  const sidebarContent = (
    <>
      <div className="flex h-10 items-center justify-end px-2 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleSidebar}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Collapse sidebar</TooltipContent>
        </Tooltip>
      </div>

      <div className="px-3 pb-2">
        <Button
          variant="default"
          className="w-full justify-start gap-2 text-sm"
          onClick={onAddTable}
          disabled={isAddingTable}
        >
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 px-2 pb-2">
          {tables?.map((table) => {
            const isActive = table.id === activeTableId;
            const isRenaming = renamingTableId === table.id;

            if (isRenaming) {
              return (
                <div
                  key={table.id}
                  className="flex w-full items-center gap-2 px-2 py-1"
                >
                  <Table2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    ref={tableRenameInputRef}
                    value={tableRenameValue}
                    onChange={(e) => setTableRenameValue(e.target.value)}
                    onBlur={commitTableRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitTableRename();
                      if (e.key === "Escape") setRenamingTableId(null);
                    }}
                    className="h-7 flex-1 text-sm"
                  />
                </div>
              );
            }

            return (
              <div key={table.id} className="group relative flex items-center">
                <button
                  onClick={() => onTableSelect?.(table.id)}
                  onDoubleClick={() =>
                    startTableRename(table.id, table.name)
                  }
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors pr-7",
                    isActive
                      ? "font-medium"
                      : "hover:bg-accent/50"
                  )}
                  style={isActive ? { backgroundColor: 'var(--color-theme-accent-subtle, #f0fdf4)', color: 'var(--color-theme-accent, #39A380)' } : undefined}
                >
                  <Table2 className="h-4 w-4 shrink-0" />
                  <span className="truncate">{table.name}</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="right">
                    <DropdownMenuItem
                      onClick={() =>
                        startTableRename(table.id, table.name)
                      }
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleTableDeleteRequest(table.id)
                      }
                      disabled={tables.length <= 1}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <TooltipProvider delayDuration={0}>
      {sidebarExpanded && (
        <aside
          className="relative flex h-full flex-col bg-background border-r"
          style={{ width: sidebarWidth, borderColor: 'var(--color-theme-accent-light, #e5e7eb)' }}
        >
          {sidebarContent}

          <div
            onMouseDown={handleResizeMouseDown}
            className={cn(
              "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors z-10",
              isResizing ? "bg-primary/40" : "hover:bg-primary/20"
            )}
          />
        </aside>
      )}

      {!sidebarExpanded && (
        <>
          <div
            className="fixed left-0 top-0 bottom-0 w-2 z-40"
            onMouseEnter={handlePeekEnter}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed left-0 top-7 z-40 rounded-none rounded-r-full h-7 w-7"
                onClick={toggleSidebar}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>

          <div
            className={cn(
              "fixed left-0 top-0 bottom-0 bg-background shadow-2xl z-50 flex flex-col transition-transform duration-200",
              isPeeking ? "translate-x-0" : "-translate-x-full"
            )}
            style={{ width: sidebarWidth }}
            onMouseEnter={handlePeekEnter}
            onMouseLeave={handlePeekLeave}
          >
            {sidebarContent}
          </div>
        </>
      )}

      <Dialog
        open={deleteTableConfirmOpen}
        onOpenChange={setDeleteTableConfirmOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this table? This action cannot be
            undone. All data in this table will be permanently removed.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTableConfirmOpen(false);
                setDeletingTableId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmTableDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
