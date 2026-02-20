import { useState, useRef, useEffect, useCallback } from "react";
import {
  Table2,
  List,
  Plus,
  LayoutGrid,
  Kanban,
  Calendar,
  GanttChart,
  GalleryHorizontalEnd,
  FileText,
  Eye,
  Share2,
  Pencil,
  Trash2,
  Copy,
  Download,
  Lock,
  Unlock,
  Pin,
  PinOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useViewStore, useModalControlStore } from "@/stores";
import { ViewType } from "@/types";
import { cn } from "@/lib/utils";
import { createView, renameView, deleteView, exportData } from "@/services/api";
import { UserMenu } from "@/views/auth/user-menu";

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
  { type: "gallery", label: "Gallery view", icon: GalleryHorizontalEnd },
  { type: "kanban", label: "Kanban view", icon: Kanban },
  { type: "calendar", label: "Calendar view", icon: Calendar },
  { type: "form", label: "Form view", icon: FileText },
];

const viewTypeMap: Record<string, ViewType> = {
  grid: ViewType.Grid,
  kanban: ViewType.Kanban,
  calendar: ViewType.Calendar,
  gantt: ViewType.Gantt,
  gallery: ViewType.Gallery,
  form: ViewType.Form,
};

const mockCollaborators = [
  { id: '1', name: 'Alice Chen', color: '#4F46E5' },
  { id: '2', name: 'Bob Kim', color: '#059669' },
  { id: '3', name: 'Carol Wu', color: '#DC2626' },
];

interface HeaderProps {
  sheetName?: string;
  onSheetNameChange?: (name: string) => void;
  baseId?: string;
  tableId?: string;
  tableName?: string;
  onTableNameChange?: (name: string) => void;
}

export function Header({
  sheetName: propSheetName,
  onSheetNameChange,
  baseId,
  tableId,
  tableName,
  onTableNameChange,
}: HeaderProps) {
  const displayName = tableName || propSheetName || "Untitled Sheet";
  const [isEditingName, setIsEditingName] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { openShareModal } = useModalControlStore();
  const { views, currentViewId, setCurrentView, addView, updateView, removeView } = useViewStore();

  const [expandOpen, setExpandOpen] = useState(false);
  const [expandSearch, setExpandSearch] = useState("");
  const [addViewOpen, setAddViewOpen] = useState(false);

  const [contextViewId, setContextViewId] = useState<string | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [lockedViewIds, setLockedViewIds] = useState<Set<string>>(new Set());
  const [pinnedViewIds, setPinnedViewIds] = useState<Set<string>>(new Set());
  const viewPillRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const displayViews = views.length > 0
    ? views
    : [
        { id: "default-grid", name: "Grid View", type: ViewType.DefaultGrid },
        { id: "default-kanban", name: "Kanban View", type: ViewType.Kanban },
      ];

  const activeViewId = currentViewId || displayViews[0]?.id;

  useEffect(() => {
    setEditValue(displayName);
  }, [displayName]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (renamingViewId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingViewId]);

  useEffect(() => {
    if (activeViewId && viewPillRefs.current[activeViewId]) {
      setTimeout(() => {
        viewPillRefs.current[activeViewId]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }, 0);
    }
  }, [activeViewId]);

  const handleDuplicateView = useCallback(
    async (view: { id: string; name: string; type: ViewType }) => {
      const newName = `${view.name} (copy)`;
      try {
        if (baseId && tableId) {
          const res = await createView({
            baseId,
            table_id: tableId,
            name: newName,
            type: view.type,
          });
          const created = res.data?.data || res.data;
          if (created?.id) {
            addView({
              id: created.id,
              name: created.name || newName,
              type: created.type || view.type,
              user_id: created.user_id || "",
              tableId: created.tableId || tableId,
            });
            setCurrentView(created.id);
          }
        } else {
          const tempId = `view_${Date.now()}`;
          addView({
            id: tempId,
            name: newName,
            type: view.type,
            user_id: "",
            tableId: tableId || "",
          });
          setCurrentView(tempId);
        }
      } catch (err) {
        console.error("Failed to duplicate view:", err);
      }
      setContextOpen(false);
      setContextViewId(null);
    },
    [baseId, tableId, addView, setCurrentView]
  );

  const handleExportCsv = useCallback(
    async (viewId: string) => {
      try {
        if (baseId && tableId) {
          const res = await exportData({ baseId, tableId, viewId });
          const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `export_${viewId}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          console.log("Export CSV: no baseId/tableId available");
        }
      } catch (err) {
        console.error("Failed to export CSV:", err);
      }
      setContextOpen(false);
      setContextViewId(null);
    },
    [baseId, tableId]
  );

  const toggleLockView = useCallback((viewId: string) => {
    setLockedViewIds((prev) => {
      const next = new Set(prev);
      if (next.has(viewId)) {
        next.delete(viewId);
      } else {
        next.add(viewId);
      }
      return next;
    });
    setContextOpen(false);
    setContextViewId(null);
  }, []);

  const togglePinView = useCallback((viewId: string) => {
    setPinnedViewIds((prev) => {
      const next = new Set(prev);
      if (next.has(viewId)) {
        next.delete(viewId);
      } else {
        next.add(viewId);
      }
      return next;
    });
    setContextOpen(false);
    setContextViewId(null);
  }, []);

  const isGridType = (type: ViewType) =>
    type === ViewType.Grid || type === ViewType.DefaultGrid;

  const handleNameSubmit = useCallback(() => {
    setIsEditingName(false);
    const trimmed = editValue.trim() || "Untitled Sheet";
    setEditValue(trimmed);
    if (onTableNameChange) {
      onTableNameChange(trimmed);
    } else if (onSheetNameChange) {
      onSheetNameChange(trimmed);
    }
  }, [editValue, onTableNameChange, onSheetNameChange]);

  const handleQuickCreate = useCallback(
    async (type: string, label: string) => {
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
      setAddViewOpen(false);
    },
    [baseId, tableId, addView, setCurrentView]
  );

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

  const handleDeleteView = useCallback(
    async (viewId: string) => {
      if (displayViews.length <= 1) return;
      try {
        if (baseId && tableId) {
          await deleteView({ baseId, tableId, viewId });
        }
        removeView(viewId);
      } catch (err) {
        console.error("Failed to delete view:", err);
      }
      setContextOpen(false);
      setContextViewId(null);
    },
    [baseId, tableId, removeView, displayViews.length]
  );

  const filteredExpandViews = expandSearch.trim()
    ? displayViews.filter((v) =>
        v.name.toLowerCase().includes(expandSearch.trim().toLowerCase())
      )
    : displayViews;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background pl-4 pr-2">
      <div className="flex shrink-0 items-center gap-2">
        <Table2 className="size-5 text-muted-foreground" />
        <div className="relative flex shrink-0 flex-col items-start justify-center gap-0.5">
          {isEditingName ? (
            <Input
              ref={nameInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleNameSubmit();
                if (e.key === "Escape") {
                  setEditValue(displayName);
                  setIsEditingName(false);
                }
              }}
              className="h-6 w-40 px-1 text-sm font-semibold"
            />
          ) : (
            <div
              className="cursor-pointer text-sm font-semibold leading-none"
              onDoubleClick={() => setIsEditingName(true)}
            >
              {displayName}
            </div>
          )}
          <div className="text-[11px] leading-3 text-muted-foreground">
            Last modify: 5 minutes ago
          </div>
        </div>
      </div>

      <Popover open={expandOpen} onOpenChange={setExpandOpen}>
        <PopoverTrigger asChild>
          <Button className="size-7 shrink-0 px-0" size="sm" variant="ghost">
            <List className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-56 p-1">
          <div className="p-1">
            <Input
              placeholder="Search view..."
              value={expandSearch}
              onChange={(e) => setExpandSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto py-1">
            {filteredExpandViews.length === 0 ? (
              <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                No results found.
              </div>
            ) : (
              filteredExpandViews.map((view) => {
                const Icon = getViewIcon(view.type);
                return (
                  <button
                    key={view.id}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                      view.id === activeViewId && "bg-accent"
                    )}
                    onClick={() => {
                      setCurrentView(view.id);
                      setExpandOpen(false);
                      setExpandSearch("");
                    }}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="truncate">{view.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      <ScrollArea className="h-[42px]">
        <div className="flex h-[42px] items-center gap-1">
          {displayViews.map((view) => {
            const Icon = getViewIcon(view.type);
            const isActive = view.id === activeViewId;
            const isRenaming = renamingViewId === view.id;
            const isLocked = lockedViewIds.has(view.id);
            const isPinned = pinnedViewIds.has(view.id);

            return (
              <Popover
                key={view.id}
                open={contextOpen && contextViewId === view.id}
                onOpenChange={(open) => {
                  if (!open) {
                    setContextOpen(false);
                    setContextViewId(null);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div
                    ref={(el) => { viewPillRefs.current[view.id] = el; }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "flex h-7 max-w-52 items-center overflow-hidden rounded-md p-1 text-sm hover:bg-accent",
                      isActive && "bg-accent"
                    )}
                    onClick={() => {
                      if (!isRenaming) {
                        if (isActive) {
                          setContextViewId(view.id);
                          setContextOpen(true);
                        } else {
                          setCurrentView(view.id);
                        }
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextViewId(view.id);
                      setContextOpen(true);
                    }}
                    onDoubleClick={() => {
                      setRenamingViewId(view.id);
                      setRenameValue(view.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setCurrentView(view.id);
                      }
                    }}
                  >
                    <div className="relative flex w-full items-center overflow-hidden px-0.5">
                      {isPinned && <Pin className="mr-[2px] size-3.5 shrink-0" />}
                      {isLocked && <Lock className="mr-[2px] size-4 shrink-0" />}
                      <Icon className="mr-1 size-4 shrink-0" />
                      <div className="flex flex-1 items-center overflow-hidden">
                        <div className="truncate text-xs font-medium leading-5">
                          {view.name}
                        </div>
                      </div>
                      {isRenaming && (
                        <Input
                          ref={renameInputRef}
                          type="text"
                          defaultValue={view.name}
                          className="absolute left-0 top-0 size-full py-0 text-xs"
                          autoFocus
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => commitRename()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setRenamingViewId(null);
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </div>
                </PopoverTrigger>
                {contextOpen && contextViewId === view.id && (
                  <PopoverContent className="w-auto p-1">
                    <div
                      className="flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex justify-start text-sm"
                        onClick={() => {
                          setRenamingViewId(view.id);
                          setRenameValue(view.name);
                          setContextOpen(false);
                          setContextViewId(null);
                        }}
                      >
                        <Pencil className="mr-2 size-3 shrink-0" />
                        Rename
                      </Button>
                      {isGridType(view.type) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex justify-start text-sm"
                          onClick={() => handleExportCsv(view.id)}
                        >
                          <Download className="mr-2 size-3 shrink-0" />
                          Export as CSV
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex justify-start text-sm"
                        onClick={() => handleDuplicateView(view)}
                      >
                        <Copy className="mr-2 size-3 shrink-0" />
                        Duplicate
                      </Button>
                      <Separator className="my-0.5" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex justify-start text-sm"
                        onClick={() => toggleLockView(view.id)}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="mr-2 size-3 shrink-0" />
                            Unlock view
                          </>
                        ) : (
                          <>
                            <Unlock className="mr-2 size-3 shrink-0" />
                            Lock view
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex justify-start text-sm"
                        onClick={() => togglePinView(view.id)}
                      >
                        {isPinned ? (
                          <>
                            <PinOff className="mr-2 size-3 shrink-0" />
                            Unpin view
                          </>
                        ) : (
                          <>
                            <Pin className="mr-2 size-3 shrink-0" />
                            Pin view
                          </>
                        )}
                      </Button>
                      <Separator className="my-0.5" />
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={displayViews.length <= 1}
                        className="flex justify-start text-sm text-red-500 hover:text-red-500"
                        onClick={() => handleDeleteView(view.id)}
                      >
                        <Trash2 className="mr-2 size-3 shrink-0" />
                        Delete
                      </Button>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Popover open={addViewOpen} onOpenChange={setAddViewOpen}>
        <PopoverTrigger asChild>
          <Button className="size-7 shrink-0 px-0" size="sm" variant="outline">
            <Plus className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" className="w-36 p-1">
          {viewTypeOptions.map((opt) => (
            <Button
              key={opt.type}
              variant="ghost"
              size="sm"
              className="w-full justify-start font-normal"
              onClick={() => handleQuickCreate(opt.type, opt.label)}
            >
              <opt.icon className="mr-2 size-4" />
              {opt.label}
            </Button>
          ))}
        </PopoverContent>
      </Popover>

      <div className="grow basis-0" />

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {mockCollaborators.slice(0, 3).map((collaborator, index) => (
            <div
              key={collaborator.id}
              title={collaborator.name}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white text-xs font-bold text-white",
                index > 0 && "-ml-1.5"
              )}
              style={{ backgroundColor: collaborator.color }}
            >
              {collaborator.name.charAt(0)}
            </div>
          ))}
          {mockCollaborators.length > 3 && (
            <div
              className="-ml-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground ring-2 ring-white"
            >
              +{mockCollaborators.length - 3}
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-brand-500/30 text-brand-700 hover:bg-brand-50 hover:text-brand-800"
          onClick={openShareModal}
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <UserMenu />
      </div>
    </header>
  );
}
