import { useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutGrid,
  Kanban,
  Calendar,
  GanttChart,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Eye,
  Search,
  Pencil,
  Trash2,
  MoreHorizontal,
  Table2,
  ChevronDown,
  GalleryHorizontalEnd,
  FileText,
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
  DropdownMenuLabel,
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
  [ViewType.Calendar]: Calendar,
  [ViewType.Gantt]: GanttChart,
  [ViewType.Gallery]: GalleryHorizontalEnd,
  [ViewType.Form]: FileText,
};

function getViewIcon(type: ViewType) {
  return viewIconMap[type] || Eye;
}

const viewTypeOptions = [
  { type: "grid", label: "Grid view", icon: LayoutGrid },
  { type: "kanban", label: "Kanban view", icon: Kanban },
  { type: "calendar", label: "Calendar view", icon: Calendar },
  { type: "gantt", label: "Gantt view", icon: GanttChart },
  { type: "gallery", label: "Gallery view", icon: GalleryHorizontalEnd },
  { type: "form", label: "Form view", icon: FileText },
];

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
}

export function Sidebar({ baseId, tableId, tables, activeTableId, onTableSelect, onAddTable, isAddingTable, onRenameTable, onDeleteTable }: SidebarProps) {
  const { sidebarExpanded, toggleSidebar } = useUIStore();
  const { views, currentViewId, setCurrentView, addView, updateView, removeView } = useViewStore();

  const [searchQuery, setSearchQuery] = useState("");

  const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingViewId, setDeletingViewId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [renamingTableId, setRenamingTableId] = useState<string | null>(null);
  const [tableRenameValue, setTableRenameValue] = useState("");
  const tableRenameInputRef = useRef<HTMLInputElement>(null);
  const [deleteTableConfirmOpen, setDeleteTableConfirmOpen] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
  const [tablesExpanded, setTablesExpanded] = useState(true);

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

  useEffect(() => {
    if (renamingTableId && tableRenameInputRef.current) {
      tableRenameInputRef.current.focus();
      tableRenameInputRef.current.select();
    }
  }, [renamingTableId]);

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

  const handleTableDeleteRequest = useCallback((id: string) => {
    if (!tables || tables.length <= 1) return;
    setDeletingTableId(id);
    setDeleteTableConfirmOpen(true);
  }, [tables]);

  const confirmTableDelete = useCallback(() => {
    if (!deletingTableId) return;
    onDeleteTable?.(deletingTableId);
    setDeleteTableConfirmOpen(false);
    setDeletingTableId(null);
  }, [deletingTableId, onDeleteTable]);

  const viewTypeMap: Record<string, ViewType> = {
    grid: ViewType.Grid,
    kanban: ViewType.Kanban,
    calendar: ViewType.Calendar,
    gantt: ViewType.Gantt,
    gallery: ViewType.Gallery,
    form: ViewType.Form,
  };

  const handleQuickCreate = useCallback(async (type: string, label: string) => {
    const resolvedType = viewTypeMap[type] || ViewType.Grid;
    const name = label;
    try {
      if (baseId && tableId) {
        const res = await createView({
          baseId,
          table_id: tableId,
          name,
          type: resolvedType,
        });
        const created = res.data?.data || res.data;
        if (created?.id) {
          addView({
            id: created.id,
            name: created.name || name,
            type: created.type || resolvedType,
            user_id: created.user_id || "",
            tableId: created.tableId || tableId,
          });
          setCurrentView(created.id);
        }
      } else {
        const tempId = `view_${Date.now()}`;
        addView({
          id: tempId,
          name,
          type: resolvedType,
          user_id: "",
          tableId: tableId || "",
        });
        setCurrentView(tempId);
      }
    } catch (err) {
      console.error("Failed to create view:", err);
    }
  }, [baseId, tableId, addView, setCurrentView]);

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
            {tables && tables.length > 0 && (
              <>
                <div
                  className={cn(
                    "mb-1 flex items-center",
                    sidebarExpanded ? "justify-between px-2" : "justify-center"
                  )}
                >
                  {sidebarExpanded && (
                    <button
                      onClick={() => setTablesExpanded(!tablesExpanded)}
                      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          !tablesExpanded && "-rotate-90"
                        )}
                      />
                      Tables
                    </button>
                  )}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={onAddTable}
                        disabled={isAddingTable}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Add table</TooltipContent>
                  </Tooltip>
                </div>

                {tablesExpanded && (
                  <div className="space-y-0.5">
                    {tables.map((table) => {
                      const isActive = table.id === activeTableId;
                      const isRenaming = renamingTableId === table.id;

                      return (
                        <div key={table.id} className="group relative flex items-center">
                          {isRenaming ? (
                            <div className="flex w-full items-center gap-1 px-1">
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
                          ) : (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => onTableSelect?.(table.id)}
                                    onDoubleClick={() => {
                                      if (sidebarExpanded) startTableRename(table.id, table.name);
                                    }}
                                    className={cn(
                                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                      sidebarExpanded ? "pr-7" : "justify-center",
                                      isActive
                                        ? "bg-brand-50 text-brand-700 font-medium"
                                        : "text-sidebar-foreground/70 hover:bg-brand-50/50 hover:text-sidebar-foreground"
                                    )}
                                  >
                                    <Table2 className="h-4 w-4 shrink-0" />
                                    {sidebarExpanded && (
                                      <span className="truncate">{table.name}</span>
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side={sidebarExpanded ? "bottom" : "right"}>
                                  {table.name}
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
                                      onClick={() => startTableRename(table.id, table.name)}
                                    >
                                      <Pencil className="mr-2 h-3.5 w-3.5" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleTableDeleteRequest(table.id)}
                                      disabled={tables.length <= 1}
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
                  </div>
                )}

                <Separator className="my-2" />
              </>
            )}

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
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">Add view</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel>Create a view</DropdownMenuLabel>
                  {viewTypeOptions.map((opt) => (
                    <DropdownMenuItem
                      key={opt.type}
                      onClick={() => handleQuickCreate(opt.type, opt.label)}
                    >
                      <opt.icon className="mr-2 h-4 w-4" />
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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

      <Dialog open={deleteTableConfirmOpen} onOpenChange={setDeleteTableConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this table? This action cannot be undone. All data in this table will be permanently removed.
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
            <Button
              variant="destructive"
              onClick={confirmTableDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
