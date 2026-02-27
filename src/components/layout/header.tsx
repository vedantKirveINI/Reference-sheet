import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
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
  Sparkles,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useViewStore, useModalControlStore } from "@/stores";
import { ViewType } from "@/types";
import { cn } from "@/lib/utils";
import { createView, renameView, deleteView, exportData, getShareMembers } from "@/services/api";
import { UserMenu } from "@/views/auth/user-menu";
import { ThemePicker } from "./theme-picker";
import { CreateViewModal } from "@/components/create-view-modal";
import { GetStartedModal } from "@/components/get-started-modal";
import { useCreateBlankSheet } from "@/hooks/useCreateBlankSheet";

const COLLABORATOR_COLORS = [
  '#6366f1', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#06b6d4', '#84cc16', '#f97316',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getColorForName(name: string): string {
  return COLLABORATOR_COLORS[hashString(name) % COLLABORATOR_COLORS.length];
}

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


interface CollaboratorAvatar {
  id: string;
  name: string;
  color: string;
}

interface HeaderProps {
  sheetName?: string;
  onSheetNameChange?: (name: string) => void;
  baseId?: string;
  tableId?: string;
  tableName?: string;
  onTableNameChange?: (name: string) => void;
  onOpenGetStarted?: () => void;
}

function getLastModifyText(): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('tinytable_last_modify') : null;
  if (!stored) return '';
  const diff = Date.now() - Number(stored);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Edited just now';
  if (mins < 60) return `Edited ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Edited ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `Edited ${days}d ago`;
}

export function Header({
  sheetName: propSheetName,
  onSheetNameChange,
  baseId,
  tableId,
  tableName,
  onTableNameChange,
  onOpenGetStarted,
}: HeaderProps) {
  const { t } = useTranslation();
  const displayName = tableName || propSheetName || t('header.untitled');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editValue, setEditValue] = useState(displayName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { openShareModal } = useModalControlStore();
  const views = useViewStore((s) => s.views);
  const currentViewId = useViewStore((s) => s.currentViewId);
  const setCurrentView = useViewStore((s) => s.setCurrentView);
  const addView = useViewStore((s) => s.addView);
  const updateView = useViewStore((s) => s.updateView);
  const removeView = useViewStore((s) => s.removeView);

  const [expandOpen, setExpandOpen] = useState(false);
  const [expandSearch, setExpandSearch] = useState("");
  const [createViewModalOpen, setCreateViewModalOpen] = useState(false);
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  const { createBlankSheet, creating } = useCreateBlankSheet();

  const [collaborators, setCollaborators] = useState<CollaboratorAvatar[]>([]);

  useEffect(() => {
    if (!baseId) return;
    let cancelled = false;
    getShareMembers({ baseId })
      .then((res) => {
        if (cancelled) return;
        const members = res.data?.members || res.data || [];
        if (Array.isArray(members)) {
          setCollaborators(
            members.map((m: any) => ({
              id: m.id || m.userId || m.email || '',
              name: m.name || m.email || '',
              color: getColorForName(m.name || m.email || ''),
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) setCollaborators([]);
      });
    return () => { cancelled = true; };
  }, [baseId]);

  const [contextViewId, setContextViewId] = useState<string | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [lockedViewIds, setLockedViewIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('tinytable_locked_views');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [pinnedViewIds, setPinnedViewIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('tinytable_pinned_views');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
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
      localStorage.setItem('tinytable_locked_views', JSON.stringify(Array.from(next)));
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
      localStorage.setItem('tinytable_pinned_views', JSON.stringify(Array.from(next)));
      return next;
    });
    setContextOpen(false);
    setContextViewId(null);
  }, []);

  const isGridType = (type: ViewType) =>
    type === ViewType.Grid || type === ViewType.DefaultGrid;

  const handleNameSubmit = useCallback(() => {
    setIsEditingName(false);
    const trimmed = editValue.trim() || t('header.untitled');
    setEditValue(trimmed);
    if (onTableNameChange) {
      onTableNameChange(trimmed);
    } else if (onSheetNameChange) {
      onSheetNameChange(trimmed);
    }
  }, [editValue, onTableNameChange, onSheetNameChange]);

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

  const lastModify = getLastModifyText();

  return (
    <header className="flex h-[44px] shrink-0 items-center border-b border-border/50 bg-background px-3">

      {/* ── Left zone: Brand mark + Table name ── */}
      <div className="flex shrink-0 items-center gap-2.5 pr-4">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: 'linear-gradient(135deg, #369B7D 0%, #4FDB95 100%)' }}
        >
          <svg viewBox="0 0 96 96" className="h-3.5 w-3.5" fill="none">
            <path d="M38.628 41.109H21.5254V24.3447H41.3468L42.3116 25.51L45.7446 29.6071L55.267 40.9963L55.3672 41.109V71.6681H38.6154V41.109H38.628Z" fill="white"/>
            <path d="M72.1316 24.3447H55.3799V41.0965H72.1316V24.3447Z" fill="white"/>
          </svg>
        </div>
        <div className="flex flex-col">
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
              className="h-5 w-36 border-none bg-transparent px-0 text-[13px] font-medium shadow-none focus-visible:ring-0"
            />
          ) : (
            <span
              className="cursor-pointer text-[13px] font-medium leading-tight text-foreground hover:text-foreground/80 transition-colors"
              onDoubleClick={() => setIsEditingName(true)}
            >
              {displayName}
            </span>
          )}
          {lastModify && (
            <span className="text-[10px] leading-tight text-muted-foreground/60">
              {lastModify}
            </span>
          )}
        </div>
      </div>

      {/* ── Thin vertical separator ── */}
      <div className="h-5 w-px bg-border/40 shrink-0" />

      {/* ── Center zone: View tabs (island group) ── */}
      <div className="flex flex-1 items-center gap-0.5 overflow-hidden mx-2 px-1.5 rounded-lg bg-muted/30">
        <Popover open={expandOpen} onOpenChange={setExpandOpen}>
          <PopoverTrigger asChild>
            <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 hover:bg-accent hover:text-foreground transition-colors">
              <List className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-52 p-1.5 island-elevated">
            <div className="pb-1.5">
              <Input
                placeholder={t('search')}
                value={expandSearch}
                onChange={(e) => setExpandSearch(e.target.value)}
                className="h-7 text-xs border-border/50"
              />
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {filteredExpandViews.length === 0 ? (
                <div className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                  {t('noResults')}
                </div>
              ) : (
                filteredExpandViews.map((view) => {
                  const Icon = getViewIcon(view.type);
                  return (
                    <button
                      key={view.id}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent",
                        view.id === activeViewId && "bg-accent font-medium"
                      )}
                      onClick={() => {
                        if (view.id.startsWith('default-')) return;
                        setCurrentView(view.id);
                        setExpandOpen(false);
                        setExpandSearch("");
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                      <span className="truncate">{view.name}</span>
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        <ScrollArea className="h-[44px] flex-1">
          <div className="flex h-[44px] items-center gap-0.5">
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
                        "group relative flex h-7 max-w-44 items-center gap-1.5 rounded-md px-2 text-xs transition-all cursor-pointer select-none",
                        isActive
                          ? "font-medium text-foreground bg-background shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      )}
                      onClick={() => {
                        if (!isRenaming) {
                          if (view.id.startsWith('default-')) return;
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
                        if ((e.key === "Enter" || e.key === " ") && !view.id.startsWith('default-')) {
                          setCurrentView(view.id);
                        }
                      }}
                    >
                      {isPinned && <Pin className="h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={1.5} />}
                      {isLocked && <Lock className="h-3.5 w-3.5 shrink-0 opacity-40" strokeWidth={1.5} />}
                      <Icon
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={1.5}
                        style={isActive ? { color: 'var(--color-theme-accent, #39A380)' } : undefined}
                      />
                      <span className="truncate leading-none">{view.name}</span>
                      {isActive && (
                        <div
                          className="absolute bottom-0 left-2 right-2 h-px rounded-full"
                          style={{ backgroundColor: 'var(--color-theme-accent, #39A380)' }}
                        />
                      )}
                      {isRenaming && (
                        <Input
                          ref={renameInputRef}
                          type="text"
                          defaultValue={view.name}
                          className="absolute inset-0 h-full w-full border-none bg-background px-2 py-0 text-xs shadow-none focus-visible:ring-1"
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
                  </PopoverTrigger>
                  {contextOpen && contextViewId === view.id && (
                    <PopoverContent className="w-44 p-1 island-elevated">
                      <div
                        className="flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                          onClick={() => {
                            setRenamingViewId(view.id);
                            setRenameValue(view.name);
                            setContextOpen(false);
                            setContextViewId(null);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                          {t('rename')}
                        </button>
                        {isGridType(view.type) && (
                          <button
                            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                            onClick={() => handleExportCsv(view.id)}
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                            {t('export')}
                          </button>
                        )}
                        <button
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                          onClick={() => handleDuplicateView(view)}
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                          {t('duplicate')}
                        </button>
                        <div className="my-0.5 h-px bg-border/50" />
                        <button
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                          onClick={() => toggleLockView(view.id)}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                              {t('show')}
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                              {t('hide')}
                            </>
                          )}
                        </button>
                        <button
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                          onClick={() => togglePinView(view.id)}
                        >
                          {isPinned ? (
                            <>
                              <PinOff className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                              Unpin view
                            </>
                          ) : (
                            <>
                              <Pin className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                              Pin view
                            </>
                          )}
                        </button>
                        <div className="my-0.5 h-px bg-border/50" />
                        <button
                          disabled={displayViews.length <= 1}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30"
                          onClick={() => handleDeleteView(view.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          {t('delete')}
                        </button>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-0.5" />
        </ScrollArea>

        <button
          className="flex h-6 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] font-medium border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:border-border transition-all"
          title={t('header.addView', 'Add view')}
          onClick={() => setCreateViewModalOpen(true)}
        >
          <Plus className="h-3 w-3" strokeWidth={2} />
          <span className="hidden lg:inline">{t('header.addView', 'Add view')}</span>
        </button>
        <CreateViewModal
          open={createViewModalOpen}
          onClose={() => setCreateViewModalOpen(false)}
          baseId={baseId}
          tableId={tableId}
        />
      </div>

      {/* ── Thin vertical separator ── */}
      <div className="h-5 w-px bg-border/40 shrink-0" />

      {/* ── Right zone: Collaborators + Actions (island group) ── */}
      <div className="flex shrink-0 items-center gap-1 pl-2.5 ml-1.5">
        {collaborators.length > 0 && (
          <>
            <div className="flex items-center -space-x-1.5">
              {collaborators.slice(0, 3).map((collaborator, index) => (
                <div
                  key={collaborator.id || `collab-${index}`}
                  title={collaborator.name}
                  className="flex h-5.5 w-5.5 items-center justify-center rounded-full ring-[1.5px] ring-background text-[9px] font-semibold text-white"
                  style={{
                    backgroundColor: collaborator.color,
                    width: '22px',
                    height: '22px',
                  }}
                >
                  {collaborator.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {collaborators.length > 3 && (
                <div
                  className="flex items-center justify-center rounded-full bg-muted text-[9px] font-medium text-muted-foreground ring-[1.5px] ring-background"
                  style={{ width: '22px', height: '22px' }}
                >
                  +{collaborators.length - 3}
                </div>
              )}
            </div>
            <div className="h-4 w-px bg-border/30 mx-0.5" />
          </>
        )}

        <button
          className="flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted/60 transition-all"
          onClick={openShareModal}
        >
          <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span>{t('share')}</span>
        </button>

        <div className="h-4 w-px bg-border/20 mx-0.5" />

        <button
          onClick={() => onOpenGetStarted?.()}
          className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border transition-colors"
          title="Get started"
        >
          <Sparkles className="h-3 w-3" />
          Get Started
        </button>

        <div className="h-4 w-px bg-border/20 mx-0.5" />

        <ThemePicker />
        <UserMenu />
      </div>

      <GetStartedModal
        open={getStartedOpen}
        onOpenChange={setGetStartedOpen}
        creating={creating}
        onCreateBlank={async () => {
          try {
            const result = await createBlankSheet();
            if (!result) return;
            // Reload to let grid re-initialize with the newly created sheet
            window.location.reload();
          } catch (err) {
            console.error('[Header] Failed to create blank table', err);
          } finally {
            setGetStartedOpen(false);
          }
        }}
        onSelectOption={(id) => {
          console.log('[GetStarted] Selected option:', id);
          setGetStartedOpen(false);
        }}
      />
    </header>
  );
}
