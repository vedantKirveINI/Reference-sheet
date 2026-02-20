import { useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutGrid,
  Kanban,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Eye,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import { useViewStore } from "@/stores";
import { ViewType } from "@/types";
import { cn } from "@/lib/utils";
import { createView, renameView, deleteView } from "@/services/api";

const viewIconMap: Record<string, React.ElementType> = {
  [ViewType.Grid]: LayoutGrid,
  [ViewType.DefaultGrid]: LayoutGrid,
  [ViewType.Kanban]: Kanban,
};

function getViewIcon(type: ViewType) {
  return viewIconMap[type] || Eye;
}

interface SidebarProps {
  baseId?: string;
  tableId?: string;
}

export function Sidebar({ baseId, tableId }: SidebarProps) {
  const { sidebarExpanded, toggleSidebar } = useUIStore();
  const { views, currentViewId, setCurrentView, addView, updateView, removeView } = useViewStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewType, setNewViewType] = useState<"grid" | "kanban">("grid");
  const [creating, setCreating] = useState(false);

  const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const displayViews = views.length > 0
    ? views
    : [
        { id: "default-grid", name: "Grid View", type: ViewType.DefaultGrid },
        { id: "default-kanban", name: "Kanban View", type: ViewType.Kanban },
      ];

  const filteredViews = searchQuery.trim()
    ? displayViews.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : displayViews;

  useEffect(() => {
    if (renamingViewId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingViewId]);

  const handleCreate = useCallback(async () => {
    if (!newViewName.trim()) return;
    setCreating(true);
    try {
      if (baseId && tableId) {
        const res = await createView({
          baseId,
          table_id: tableId,
          name: newViewName.trim(),
          type: newViewType === "kanban" ? ViewType.Kanban : ViewType.Grid,
        });
        const created = res.data?.data || res.data;
        if (created?.id) {
          addView({
            id: created.id,
            name: created.name || newViewName.trim(),
            type: created.type || (newViewType === "kanban" ? ViewType.Kanban : ViewType.Grid),
            user_id: created.user_id || "",
            tableId: created.tableId || tableId,
          });
          setCurrentView(created.id);
        }
      } else {
        const tempId = `view_${Date.now()}`;
        addView({
          id: tempId,
          name: newViewName.trim(),
          type: newViewType === "kanban" ? ViewType.Kanban : ViewType.Grid,
          user_id: "",
          tableId: tableId || "",
        });
        setCurrentView(tempId);
      }
      setCreateDialogOpen(false);
      setNewViewName("");
      setNewViewType("grid");
    } catch (err) {
      console.error("Failed to create view:", err);
    } finally {
      setCreating(false);
    }
  }, [newViewName, newViewType, baseId, tableId, addView, setCurrentView]);

  const startRename = useCallback((viewId: string, currentName: string) => {
    setRenamingViewId(viewId);
    setRenameValue(currentName);
  }, []);

  const commitRename = useCallback(async () => {
    if (!renamingViewId || !renameValue.trim()) {
      setRenamingViewId(null);
      return;
    }
    const view = displayViews.find((v) => v.id === renamingViewId);
    if (view && renameValue.trim() === view.name) {
      setRenamingViewId(null);
      return;
    }
    try {
      if (baseId && tableId) {
        await renameView({
          baseId,
          tableId,
          id: renamingViewId,
          name: renameValue.trim(),
        });
      }
      updateView(renamingViewId, { name: renameValue.trim() });
    } catch (err) {
      console.error("Failed to rename view:", err);
    } finally {
      setRenamingViewId(null);
    }
  }, [renamingViewId, renameValue, baseId, tableId, updateView, displayViews]);

  const handleDeleteRequest = useCallback((viewId: string) => {
    if (displayViews.length <= 1) return;
    setDeletingViewId(viewId);
    setDeleteConfirmOpen(true);
  }, [displayViews.length]);

  const confirmDelete = useCallback(async () => {
    if (!deletingViewId) return;
    setDeleting(true);
    try {
      if (baseId && tableId) {
        await deleteView({ baseId, tableId, viewId: deletingViewId });
      }
      removeView(deletingViewId);
    } catch (err) {
      console.error("Failed to delete view:", err);
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setDeletingViewId(null);
    }
  }, [deletingViewId, baseId, tableId, removeView]);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col bg-white/95 backdrop-blur-sm transition-all duration-200 ease-in-out shadow-[2px_0_8px_-2px_rgba(0,0,0,0.06)] border-r border-gray-200/50",
          sidebarExpanded ? "w-60" : "w-12"
        )}
      >
        <div
          className={cn(
            "flex h-12 items-center border-b px-3",
            sidebarExpanded ? "justify-between" : "justify-center"
          )}
        >
          {sidebarExpanded && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded brand-gradient">
                <LayoutGrid className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">
                Sheets
              </span>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div
              className={cn(
                "mb-1 flex items-center",
                sidebarExpanded ? "justify-between px-2" : "justify-center"
              )}
            >
              {sidebarExpanded && (
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Views
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      setNewViewName("");
                      setNewViewType("grid");
                      setCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Add view</TooltipContent>
              </Tooltip>
            </div>

            {sidebarExpanded && (
              <div className="mb-2 px-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search views..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 pl-7 text-xs rounded-lg border-gray-200 focus:island-focus focus:ring-2 focus:ring-brand-400/30 focus:shadow-md focus:shadow-brand-400/10 focus:border-brand-300 transition-shadow"
                  />
                </div>
              </div>
            )}

            <Separator className="mb-2" />

            <div className="space-y-0.5">
              {filteredViews.map((view) => {
                const Icon = getViewIcon(view.type);
                const isActive = view.id === (currentViewId || displayViews[0]?.id);
                const isRenaming = renamingViewId === view.id;

                return (
                  <div key={view.id} className="group relative flex items-center">
                    {isRenaming ? (
                      <div className="flex w-full items-center gap-1 px-1">
                        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingViewId(null);
                          }}
                          className="h-7 flex-1 text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setCurrentView(view.id)}
                              onDoubleClick={() => {
                                if (sidebarExpanded) startRename(view.id, view.name);
                              }}
                              onContextMenu={(e) => e.preventDefault()}
                              className={cn(
                                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                sidebarExpanded ? "pr-7" : "justify-center",
                                isActive
                                  ? "bg-brand-50 text-brand-700 font-medium"
                                  : "text-sidebar-foreground/70 hover:bg-brand-50/50 hover:text-sidebar-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              {sidebarExpanded && (
                                <span className="truncate">{view.name}</span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side={sidebarExpanded ? "bottom" : "right"}>
                            {view.name}
                          </TooltipContent>
                        </Tooltip>

                        {sidebarExpanded && (
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
                                onClick={() => startRename(view.id, view.name)}
                              >
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRequest(view.id)}
                                disabled={displayViews.length <= 1}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              {filteredViews.length === 0 && searchQuery.trim() && sidebarExpanded && (
                <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                  No views match your search.
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className={cn(
                  "w-full",
                  sidebarExpanded ? "justify-start gap-2" : "justify-center"
                )}
              >
                {sidebarExpanded ? (
                  <>
                    <PanelLeftClose className="h-4 w-4" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            {!sidebarExpanded && (
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create View</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">View Name</label>
              <Input
                placeholder="Enter view name"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newViewName.trim()) handleCreate();
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">View Type</label>
              <div className="flex gap-2">
                <Button
                  variant={newViewType === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewViewType("grid")}
                  className="flex-1 gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </Button>
                <Button
                  variant={newViewType === "kanban" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewViewType("kanban")}
                  className="flex-1 gap-2"
                >
                  <Kanban className="h-4 w-4" />
                  Kanban
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newViewName.trim() || creating}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete View</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this view? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeletingViewId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
