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
    return (tables ?? []).filter((t) =>
      t.name.toLowerCase().includes(trimmedSearch)
    );
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
        const newWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, e.clientX));
        setSidebarWidth(newWidth);
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

  const handleMouseEnter = useCallback(() => {
    if (!sidebarExpanded) setHoverExpanded(true);
  }, [sidebarExpanded]);

  const handleMouseLeave = useCallback(() => {
    if (!sidebarExpanded) setHoverExpanded(false);
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

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className="relative flex h-full flex-col transition-all duration-200 ease-in-out shrink-0 overflow-hidden"
        style={{
          width: isExpanded ? sidebarWidth : 48,
          background: 'linear-gradient(180deg, #0D1F16 0%, #0A1A11 100%)',
          borderRight: '1px solid #162B1E',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Icon strip (collapsed) ── */}
        {!isExpanded && (
          <div className="flex flex-col items-center gap-1.5 py-3 flex-1 overflow-hidden">
            <Tooltip>
              <TooltipTrigger asChild>
                <CoachMarkTarget id="cm-add-table">
                  <button
                    type="button"
                    onClick={onAddTable}
                    disabled={isAddingTable}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40"
                    style={{ color: '#5A8A6A' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1A3525'; e.currentTarget.style.color = '#39A380'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#5A8A6A'; }}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                  </button>
                </CoachMarkTarget>
              </TooltipTrigger>
              <TooltipContent side="right">{t('sidebar.newTable')}</TooltipContent>
            </Tooltip>

            <div className="w-5 h-px my-0.5 shrink-0" style={{ background: '#1A3525' }} />

            <CoachMarkTarget id="cm-sidebar-tables">
              <div className="flex flex-col items-center gap-1.5 overflow-hidden">
                {(tables ?? []).map((table) => {
                  const isActive = table.id === activeTableId;
                  return (
                    <Tooltip key={table.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onTableSelect?.(table.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all duration-150 shrink-0"
                          style={isActive
                            ? { background: '#39A380', color: '#fff', boxShadow: '0 2px 8px rgba(57,163,128,0.4)' }
                            : { background: '#1A3525', color: '#6BA887' }
                          }
                          onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#213D2B'; e.currentTarget.style.color = '#9DCFBA'; } }}
                          onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = '#1A3525'; e.currentTarget.style.color = '#6BA887'; } }}
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
            <div className="px-3 pt-3 pb-2">
              <CoachMarkTarget id="cm-add-table">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 border active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  style={{ borderColor: '#1E3D2A', color: '#6BA887', background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1A3525'; e.currentTarget.style.color = '#39A380'; e.currentTarget.style.borderColor = '#39A380'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6BA887'; e.currentTarget.style.borderColor = '#1E3D2A'; }}
                  onClick={onAddTable}
                  disabled={isAddingTable}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                  {isAddingTable ? `${t('sidebar.newTable')}…` : t('sidebar.newTable')}
                </button>
              </CoachMarkTarget>
            </div>

            <div className="px-3 pb-2">
              <div
                className="flex items-center gap-2 rounded-lg px-2.5 h-7"
                style={{ background: '#07120C', border: '1px solid #162B1E' }}
              >
                <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#3D6B51' }} strokeWidth={1.5} />
                <Input
                  ref={tableSearchInputRef}
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setTableSearchQuery(""); tableSearchInputRef.current?.blur(); }
                  }}
                  placeholder={t('sidebar.searchTables')}
                  className="h-7 flex-1 min-w-0 text-xs border-0 shadow-none focus-visible:ring-0 bg-transparent px-0"
                  style={{ color: '#C8E6D8', caretColor: '#39A380' }}
                />
                {tableSearchQuery.length > 0 && (
                  <button
                    className="h-4 w-4 flex items-center justify-center rounded transition-colors"
                    style={{ color: '#3D6B51' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#9DCFBA'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#3D6B51'; }}
                    onClick={() => { setTableSearchQuery(""); tableSearchInputRef.current?.focus(); }}
                  >
                    <X className="h-3 w-3" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            <CoachMarkTarget id="cm-sidebar-tables">
              <ScrollArea className="flex-1">
                <div className="space-y-0.5 px-2 pb-2">
                  {tableSearchQuery.trim() !== "" && filteredTables.length === 0 ? (
                    <div className="px-2 py-2 text-xs" style={{ color: '#3D6B51' }}>
                      {t('noResults')}
                    </div>
                  ) : (
                    filteredTables.map((table) => {
                      const isActive = table.id === activeTableId;
                      const isRenaming = renamingTableId === table.id;

                      if (isRenaming) {
                        return (
                          <div key={table.id} className="flex w-full items-center gap-2 px-2 py-1">
                            <Table2 className="h-3.5 w-3.5 shrink-0" style={{ color: '#3D6B51' }} strokeWidth={1.5} />
                            <Input
                              ref={tableRenameInputRef}
                              value={tableRenameValue}
                              onChange={(e) => setTableRenameValue(e.target.value)}
                              onBlur={commitTableRename}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitTableRename();
                                if (e.key === "Escape") setRenamingTableId(null);
                              }}
                              className="h-7 flex-1 text-xs border-[#2A4535] text-white bg-[#07120C]"
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={table.id} className="group relative flex items-center">
                          <button
                            onClick={() => onTableSelect?.(table.id)}
                            onDoubleClick={() => startTableRename(table.id, table.name)}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all duration-150 pr-7"
                            style={isActive
                              ? { background: '#1A3525', color: '#fff', borderLeft: '2px solid #39A380', paddingLeft: '8px' }
                              : { color: '#6BA887', borderLeft: '2px solid transparent', paddingLeft: '8px' }
                            }
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#142A1E'; e.currentTarget.style.color = '#9DCFBA'; } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#6BA887'; } }}
                          >
                            <Table2
                              className="h-3.5 w-3.5 shrink-0"
                              strokeWidth={1.5}
                              style={{ color: isActive ? '#39A380' : '#3D6B51' }}
                            />
                            <span className="truncate font-medium">{table.name}</span>
                          </button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="absolute right-1.5 h-5 w-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-all duration-150"
                                style={{ color: '#3D6B51' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#1E3D2A'; e.currentTarget.style.color = '#9DCFBA'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#3D6B51'; }}
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

            <div className="px-3 py-2 shrink-0">
              <CoachMarkTarget id="cm-workflow-button">
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full p-3 rounded-xl text-left group transition-all duration-200"
                  style={{ background: '#07120C', border: '1px solid #162B1E' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#39A380'; e.currentTarget.style.background = '#0D1F16'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#162B1E'; e.currentTarget.style.background = '#07120C'; }}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="h-6 w-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #276e59, #39A380)' }}>
                      <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: '#9DCFBA' }}>
                      {t('workflow.createWorkflow')}
                    </span>
                  </div>
                  <p className="text-[10px] leading-tight pl-8" style={{ color: '#3D6B51' }}>
                    {t('workflow.workflowDescription')}
                  </p>
                </button>
              </CoachMarkTarget>
            </div>

            <div className="px-3 py-2 shrink-0" style={{ borderTop: '1px solid #162B1E' }}>
              <CoachMarkTarget id="cm-language-switcher">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-all duration-150"
                      style={{ color: '#3D6B51' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#142A1E'; e.currentTarget.style.color = '#6BA887'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#3D6B51'; }}
                    >
                      <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {t('language')}: {i18n.language === 'es' ? t('spanish') : i18n.language === 'ar' ? t('arabic') : i18n.language === 'pt' ? t('portuguese') : t('english')}
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
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors z-10"
            style={isResizing ? { background: 'rgba(57,163,128,0.5)' } : undefined}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(57,163,128,0.25)'; }}
            onMouseLeave={e => { if (!isResizing) e.currentTarget.style.background = ''; }}
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
