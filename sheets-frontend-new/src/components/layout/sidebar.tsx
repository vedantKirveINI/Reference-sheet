import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CoachMarkTarget } from "@/coach-marks";
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Table2,
  Search,
  X,
  Globe,
  Zap,
  ChevronDown,
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
const SIDEBAR_DEFAULT_WIDTH = 240;
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

const BrandMark = ({ size = 26 }: { size?: number }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: 6,
      background: '#39A380',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg viewBox="0 0 96 96" style={{ width: size * 0.56, height: size * 0.56 }} fill="none">
      <path d="M38.628 41.109H21.5254V24.3447H41.3468L42.3116 25.51L45.7446 29.6071L55.267 40.9963L55.3672 41.109V71.6681H38.6154V41.109H38.628Z" fill="white"/>
      <path d="M72.1316 24.3447H55.3799V41.0965H72.1316V24.3447Z" fill="white"/>
    </svg>
  </div>
);

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
  const { t, i18n } = useTranslation();
  const sidebarExpanded = useUIStore((s) => s.sidebarExpanded);

  const [internalWidth, setInternalWidth] = useState(getSavedWidth);
  const sidebarWidth = externalWidth ?? internalWidth;
  const setSidebarWidth = useCallback((w: number) => {
    setInternalWidth(w);
    onSidebarWidthChange?.(w);
  }, [onSidebarWidthChange]);

  const [isResizing, setIsResizing] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);

  const [renamingTableId, setRenamingTableId] = useState<string | null>(null);
  const [tableRenameValue, setTableRenameValue] = useState("");
  const tableRenameInputRef = useRef<HTMLInputElement>(null);
  const [deleteTableConfirmOpen, setDeleteTableConfirmOpen] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);

  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const tableSearchInputRef = useRef<HTMLInputElement>(null);

  const trimmedSearch = tableSearchQuery.trim().toLowerCase();
  const filteredTables = useMemo(() => {
    if (!trimmedSearch) return tables ?? [];
    return (tables ?? []).filter((t) => t.name.toLowerCase().includes(trimmedSearch));
  }, [tables, trimmedSearch]);

  const isExpanded = sidebarExpanded || hoverExpanded;

  useEffect(() => {
    if (renamingTableId && tableRenameInputRef.current) {
      tableRenameInputRef.current.focus();
      tableRenameInputRef.current.select();
    }
  }, [renamingTableId]);

  useEffect(() => {
    try { localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)); } catch {}
  }, [sidebarWidth]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setSidebarWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, e.clientX)));
      });
    };
    const handleMouseUp = () => setIsResizing(false);
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

  const handleMouseEnter = useCallback(() => { if (!sidebarExpanded) setHoverExpanded(true); }, [sidebarExpanded]);
  const handleMouseLeave = useCallback(() => { if (!sidebarExpanded) setHoverExpanded(false); }, [sidebarExpanded]);

  const startTableRename = useCallback((id: string, name: string) => {
    setRenamingTableId(id); setTableRenameValue(name);
  }, []);

  const commitTableRename = useCallback(() => {
    if (!renamingTableId || !tableRenameValue.trim()) { setRenamingTableId(null); return; }
    const table = tables?.find((t) => t.id === renamingTableId);
    if (table && tableRenameValue.trim() !== table.name) onRenameTable?.(renamingTableId, tableRenameValue.trim());
    setRenamingTableId(null);
  }, [renamingTableId, tableRenameValue, tables, onRenameTable]);

  const handleTableDeleteRequest = useCallback((id: string) => {
    if (!tables || tables.length <= 1) return;
    setDeletingTableId(id); setDeleteTableConfirmOpen(true);
  }, [tables]);

  const confirmTableDelete = useCallback(() => {
    if (!deletingTableId) return;
    onDeleteTable?.(deletingTableId);
    setDeleteTableConfirmOpen(false); setDeletingTableId(null);
  }, [deletingTableId, onDeleteTable]);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className="relative flex h-full flex-col transition-all duration-200 ease-in-out shrink-0 overflow-hidden"
        style={{
          width: isExpanded ? sidebarWidth : 48,
          background: '#f5f6f7',
          borderRight: '1px solid #e0e2e1',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >

        {/* ── Icon strip (collapsed) ── */}
        {!isExpanded && (
          <div className="flex flex-col items-center gap-1.5 py-3 flex-1 overflow-hidden">

            <div className="mb-1">
              <BrandMark size={30} />
            </div>

            <div className="w-6 h-px shrink-0 bg-gray-200" />

            <Tooltip>
              <TooltipTrigger asChild>
                <CoachMarkTarget id="cm-add-table">
                  <button
                    type="button"
                    onClick={onAddTable}
                    disabled={isAddingTable}
                    className="w-7 h-7 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </CoachMarkTarget>
              </TooltipTrigger>
              <TooltipContent side="right">{t('sidebar.newTable')}</TooltipContent>
            </Tooltip>

            <CoachMarkTarget id="cm-sidebar-tables">
              <div className="flex flex-col items-center gap-1 overflow-hidden">
                {(tables ?? []).map((table) => {
                  const isActive = table.id === activeTableId;
                  return (
                    <Tooltip key={table.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onTableSelect?.(table.id)}
                          className="w-7 h-7 flex items-center justify-center rounded text-[11px] font-semibold transition-colors shrink-0"
                          style={isActive
                            ? { background: '#39A380', color: '#fff' }
                            : { background: 'transparent', color: '#888' }
                          }
                          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#e8e9ea'; e.currentTarget.style.color = '#444'; } }}
                          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#888'; } }}
                        >
                          {table.name.charAt(0).toUpperCase()}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{table.name}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </CoachMarkTarget>
          </div>
        )}

        {/* ── Full sidebar (expanded) ── */}
        {isExpanded && (
          <>
            {/* Brand header */}
            <div
              className="flex items-center gap-2.5 px-3.5 py-3 shrink-0"
              style={{ borderBottom: '1px solid #e0e2e1' }}
            >
              <BrandMark size={26} />
              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-[13px] font-semibold text-gray-800 truncate">
                  TinyTable
                </span>
                <span className="text-[10px] text-gray-400">
                  Your workspace
                </span>
              </div>
            </div>

            {/* New table button */}
            <div className="px-3 pt-2.5 pb-2">
              <CoachMarkTarget id="cm-add-table">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 rounded px-2.5 py-1.5 text-xs text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                  onClick={onAddTable}
                  disabled={isAddingTable}
                >
                  <Plus className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
                  {isAddingTable ? `${t('sidebar.newTable')}…` : t('sidebar.newTable')}
                </button>
              </CoachMarkTarget>
            </div>

            {/* Search */}
            <div className="px-3 pb-2">
              <div className="flex items-center gap-1.5 rounded px-2 h-7 bg-white border border-gray-200">
                <Search className="h-3.5 w-3.5 text-gray-300 shrink-0" strokeWidth={1.5} />
                <input
                  ref={tableSearchInputRef}
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setTableSearchQuery(""); tableSearchInputRef.current?.blur(); }
                  }}
                  placeholder={t('sidebar.searchTables')}
                  className="flex-1 min-w-0 text-xs bg-transparent outline-none border-none text-gray-700 placeholder-gray-300"
                />
                {tableSearchQuery.length > 0 && (
                  <button
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                    onClick={() => { setTableSearchQuery(""); tableSearchInputRef.current?.focus(); }}
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            {/* Section label */}
            <div className="px-3.5 pb-1">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400">
                Tables
              </span>
            </div>

            {/* Table list */}
            <CoachMarkTarget id="cm-sidebar-tables">
              <ScrollArea className="flex-1">
                <div className="space-y-px px-2 pb-2">
                  {tableSearchQuery.trim() !== "" && filteredTables.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-400">
                      {t('noResults')}
                    </div>
                  ) : (
                    filteredTables.map((table) => {
                      const isActive = table.id === activeTableId;
                      const isRenaming = renamingTableId === table.id;

                      if (isRenaming) {
                        return (
                          <div key={table.id} className="flex items-center gap-2 px-2 py-1">
                            <Table2 className="h-3.5 w-3.5 shrink-0 text-gray-400" strokeWidth={1.5} />
                            <Input
                              ref={tableRenameInputRef}
                              value={tableRenameValue}
                              onChange={(e) => setTableRenameValue(e.target.value)}
                              onBlur={commitTableRename}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitTableRename();
                                if (e.key === "Escape") setRenamingTableId(null);
                              }}
                              className="h-6 flex-1 text-xs"
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={table.id} className="group relative flex items-center">
                          <button
                            onClick={() => onTableSelect?.(table.id)}
                            onDoubleClick={() => startTableRename(table.id, table.name)}
                            className="flex w-full items-center gap-2 rounded py-1.5 text-xs transition-colors pr-7"
                            style={isActive
                              ? {
                                  background: '#e8f5f1',
                                  color: '#1a6b50',
                                  paddingLeft: '10px',
                                  borderLeft: '2px solid #39A380',
                                  fontWeight: 500,
                                }
                              : {
                                  color: '#555',
                                  paddingLeft: '12px',
                                  borderLeft: '2px solid transparent',
                                }
                            }
                            onMouseEnter={e => {
                              if (!isActive) {
                                e.currentTarget.style.background = '#ebebec';
                                e.currentTarget.style.color = '#333';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isActive) {
                                e.currentTarget.style.background = '';
                                e.currentTarget.style.color = '#555';
                              }
                            }}
                          >
                            <Table2
                              className="h-3.5 w-3.5 shrink-0"
                              strokeWidth={1.5}
                              style={{ color: isActive ? '#39A380' : '#aaa' }}
                            />
                            <span className="truncate">{table.name}</span>
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="absolute right-1.5 h-5 w-5 flex items-center justify-center rounded text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-600 transition-all"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" side="right">
                              <DropdownMenuItem onClick={() => startTableRename(table.id, table.name)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
                                {t('rename')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleTableDeleteRequest(table.id)}
                                disabled={(tables?.length ?? 0) <= 1}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
                                {t('delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CoachMarkTarget>

            {/* Workflow card */}
            <div className="px-3 py-2 shrink-0">
              <CoachMarkTarget id="cm-workflow-button">
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full p-2.5 rounded text-left border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="h-5 w-5 rounded flex items-center justify-center shrink-0" style={{ background: '#39A380' }}>
                      <Zap className="h-3 w-3 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {t('workflow.createWorkflow')}
                    </span>
                  </div>
                  <p className="text-[10px] leading-tight text-gray-400 pl-7">
                    {t('workflow.workflowDescription')}
                  </p>
                </button>
              </CoachMarkTarget>
            </div>

            {/* Language footer */}
            <div className="px-3 py-2 shrink-0 border-t border-gray-200">
              <CoachMarkTarget id="cm-language-switcher">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center gap-2 rounded px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                      <Globe className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
                      <span className="flex-1 text-left">
                        {t('language')}: {i18n.language === 'es' ? t('spanish') : i18n.language === 'ar' ? t('arabic') : i18n.language === 'pt' ? t('portuguese') : t('english')}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50" strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {(['en', 'es', 'ar', 'pt'] as const).map(lang => (
                      <DropdownMenuItem key={lang} onClick={() => i18n.changeLanguage(lang)} className={i18n.language === lang ? 'bg-accent' : ''}>
                        {lang === 'en' ? t('english') : lang === 'es' ? t('spanish') : lang === 'ar' ? t('arabic') : t('portuguese')}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CoachMarkTarget>
            </div>
          </>
        )}

        {/* Resize handle */}
        {sidebarExpanded && (
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-10 hover:bg-gray-300 transition-colors"
          />
        )}
      </aside>

      <Dialog open={deleteTableConfirmOpen} onOpenChange={setDeleteTableConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('sidebar.deleteTable')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this table? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteTableConfirmOpen(false); setDeletingTableId(null); }}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmTableDelete}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
