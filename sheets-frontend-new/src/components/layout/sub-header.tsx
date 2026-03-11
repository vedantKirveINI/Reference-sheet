import { useState, forwardRef, useRef, useEffect, createContext, useContext } from "react";
import { useTranslation } from 'react-i18next';
import { CoachMarkTarget } from "@/coach-marks";
import {
  ArrowUpDown,
  Filter,
  Layers,
  EyeOff,
  Rows2,
  Rows3,
  Rows4,
  StretchVertical,
  Minus,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  MoreHorizontal,
  AlertTriangle,
  SlidersHorizontal,
  Check,
  RefreshCw,
  Loader2,
  Paintbrush,
  WrapText,
  Scissors,
  MoveHorizontal,
  ChevronDown,
  PaintBucket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "./search-bar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { SortPopover, type SortRule } from "@/views/grid/sort-modal";
import { FilterPopover, type FilterRule } from "@/views/grid/filter-modal";
import { GroupPopover, type GroupRule } from "@/views/grid/group-modal";
import { ConditionalColorPopover } from "@/views/grid/conditional-color-popover";
import { HideFieldsContent } from "@/views/grid/hide-fields-modal";
import { ColorPalettePicker } from "@/views/grid/ColorPalettePicker";
import { useUIStore, useModalControlStore, useGridViewStore, useConditionalColorStore } from "@/stores";
import { getContrastForeground } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { IColumn, RowHeightLevel, CellType, TextWrapMode } from "@/types";

const rowHeightIconMap: Record<RowHeightLevel, React.ElementType> = {
  [RowHeightLevel.Short]: Rows2,
  [RowHeightLevel.Medium]: Rows3,
  [RowHeightLevel.Tall]: Rows4,
  [RowHeightLevel.ExtraTall]: StretchVertical,
};

const IslandFgContext = createContext<string>("currentColor");

interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string | React.ReactNode;
  isActive?: boolean;
  textClassName?: string;
  children: React.ReactElement | React.ReactElement[];
}

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  (props, ref) => {
    const {
      children,
      text,
      isActive = false,
      className,
      textClassName,
      style,
      ...restProps
    } = props;

    const fgColor = useContext(IslandFgContext);
    const isLight = fgColor === "#1a1a1a";

    return (
      <Button
        variant="ghost"
        size="xs"
        data-island-btn
        className={cn(
          "font-normal shrink-0 truncate gap-1",
          isActive
            ? (isLight ? "bg-black/10" : "bg-white/20")
            : "",
          className
        )}
        style={{
          color: fgColor,
          fontSize: 'var(--toolbar-font-size, 12px)',
          ...style,
        }}
        ref={ref}
        {...restProps}
      >
        {children}
        {text && (
          <span className={cn("truncate", textClassName)}>{text}</span>
        )}
      </Button>
    );
  }
);

ToolbarButton.displayName = "ToolbarButton";

interface SubHeaderProps {
  onDeleteRows?: (rowIndices: number[]) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  sortCount?: number;
  onSearchChange?: (query: string) => void;
  searchMatchCount?: number;
  currentSearchMatch?: number;
  onNextMatch?: () => void;
  onPrevMatch?: () => void;
  onReplace?: (searchText: string, replaceText: string) => void;
  onReplaceAll?: (searchText: string, replaceText: string) => void;
  columns?: IColumn[];
  sortConfig?: SortRule[];
  onSortApply?: (config: SortRule[]) => void;
  filterConfig?: FilterRule[];
  onFilterApply?: (config: FilterRule[]) => void;
  groupConfig?: GroupRule[];
  onGroupApply?: (config: GroupRule[]) => void;
  onAddRow?: () => void;
  currentView?: string;
  onStackFieldChange?: (fieldId: string) => void;
  stackFieldId?: string;
  visibleCardFields?: Set<string>;
  onToggleCardField?: (fieldId: string) => void;
  isDefaultView?: boolean;
  showSyncButton?: boolean;
  onFetchRecords?: () => void;
  isSyncing?: boolean;
  hasNewRecords?: boolean;
  hiddenColumnIds?: Set<string>;
  onToggleColumn?: (columnId: string) => void;
  onHideFieldsPersist?: (hiddenColumnIds: Set<string>) => void;
  onSetSelectionColor?: (color: string | null) => void;
}

export function SubHeader({
  onDeleteRows,
  onDuplicateRow,
  sortCount: _sortCount = 0,
  onSearchChange,
  searchMatchCount,
  currentSearchMatch,
  onNextMatch,
  onPrevMatch,
  onReplace,
  onReplaceAll,
  columns = [],
  sortConfig = [],
  onSortApply,
  filterConfig,
  onFilterApply,
  groupConfig,
  onGroupApply,
  onAddRow,
  currentView,
  onStackFieldChange,
  stackFieldId,
  visibleCardFields,
  onToggleCardField,
  isDefaultView: _isDefaultView,
  showSyncButton = false,
  onFetchRecords,
  isSyncing,
  hasNewRecords,
  hiddenColumnIds = new Set<string>(),
  onToggleColumn,
  onHideFieldsPersist,
  onSetSelectionColor,
}: SubHeaderProps) {
  const { t } = useTranslation(['common']);
  const accentColor = useUIStore((s) => s.accentColor);
  const islandFg = getContrastForeground(accentColor);
  const isLightFg = islandFg === "#1a1a1a";
  const zoomLevel = useUIStore((s) => s.zoomLevel);
  const setZoomLevel = useUIStore((s) => s.setZoomLevel);
  const rowHeightLevel = useUIStore((s) => s.rowHeightLevel);
  const setRowHeightLevel = useUIStore((s) => s.setRowHeightLevel);
  const fieldNameLines = useUIStore((s) => s.fieldNameLines);
  const setFieldNameLines = useUIStore((s) => s.setFieldNameLines);
  useUIStore((s) => s.columnTextWrapModes);
  const setColumnTextWrapMode = useUIStore((s) => s.setColumnTextWrapMode);
  const getColumnTextWrapMode = useUIStore((s) => s.getColumnTextWrapMode);
  const activeCell = useUIStore((s) => s.activeCell);
  const activeColumnId = activeCell ? columns[activeCell.columnIndex]?.id : undefined;
  const lastActiveColumnIdRef = useRef<string | undefined>(undefined);
  const hasColorableSelection = useGridViewStore((s) => s.hasColorableSelection);
  const [selectionColorPopoverOpen, setSelectionColorPopoverOpen] = useState(false);
  const [morePopoverOpen, setMorePopoverOpen] = useState(false);
  
  useEffect(() => {
    if (activeColumnId) {
      lastActiveColumnIdRef.current = activeColumnId;
    }
  }, [activeColumnId]);
  
  const effectiveColumnId = activeColumnId || lastActiveColumnIdRef.current;
  const currentWrapMode = effectiveColumnId ? getColumnTextWrapMode(effectiveColumnId) : TextWrapMode.Clip;
  const wrapIconMap: Record<TextWrapMode, React.ElementType> = {
    [TextWrapMode.Clip]: Scissors,
    [TextWrapMode.Wrap]: WrapText,
    [TextWrapMode.Overflow]: MoveHorizontal,
  };
  const {
    sort,
    openSort,
    closeSort,
    filter,
    openFilter,
    closeFilter,
    groupBy,
    openGroupBy,
    closeGroupBy,
    openExportModal,
    openImportModal,
  } = useModalControlStore();
  const colorRules = useConditionalColorStore((s) => s.rules);
  const activeColorRuleCount = colorRules.filter((r) => r.isActive).length;
  const selectedRows = useGridViewStore((s) => s.selectedRows);
  const clearSelectedRows = useGridViewStore((s) => s.clearSelectedRows);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceMode, setReplaceMode] = useState(false);

  const handleSearchOpenChange = (open: boolean) => {
    setIsSearchOpen(open);
    if (!open) {
      setSearchQuery("");
      setReplaceMode(false);
      onSearchChange?.("");
    }
  };

  const handleSearchInputChange = (query: string, _fieldId?: string) => {
    setSearchQuery(query);
    onSearchChange?.(query);
  };

  const selectedCount = selectedRows.size;
  const selectedIndices = Array.from(selectedRows);

  const handleZoomIn = () => {
    setZoomLevel(Math.min(200, zoomLevel + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(50, zoomLevel - 10));
  };

  const handleDeleteRows = () => {
    if (selectedCount === 0) return;
    onDeleteRows?.(selectedIndices);
  };

  const handleDuplicateRow = () => {
    if (selectedCount !== 1) return;
    onDuplicateRow?.(selectedIndices[0]);
    clearSelectedRows();
  };

  const filterCount = filterConfig?.length ?? 0;
  const groupCount = groupConfig?.length ?? 0;
  const isRowHeightNonDefault = rowHeightLevel !== RowHeightLevel.Short;

  const getFilterButtonText = () => {
    if (filterCount === 0) return t('toolbar.filterRecords');
    const filterRules = filterConfig ?? [];
    const firstFieldId = filterRules[0]?.columnId;
    const firstName = columns.find((c) => c.id === firstFieldId)?.name;
    if (filterCount === 1 && firstName) return `Filtered by ${firstName}`;
    if (filterCount > 1 && firstName) return `Filtered by ${firstName} and ${filterCount - 1} more`;
    return `Filtered by ${filterCount} rule${filterCount > 1 ? "s" : ""}`;
  };

  const getSortButtonText = () => {
    if (sortConfig.length === 0) return t('toolbar.sortRecords');
    const count = sortConfig.length;
    return count > 1 ? t('toolbar.sortedByPlural', { count }) : t('toolbar.sortedBy', { count });
  };

  const getGroupButtonText = () => {
    if (groupCount === 0) return t('toolbar.groupRecords');
    return groupCount > 1 ? t('toolbar.groupedByPlural', { count: groupCount }) : t('toolbar.groupedBy', { count: groupCount });
  };

  return (
    <IslandFgContext.Provider value={islandFg}>
    <div
      className={cn("toolbar-island flex h-[2.625rem] items-center justify-between mx-2 my-1.5 rounded-xl px-3 shadow-sm", isLightFg && "light-fg")}
      style={{ backgroundColor: accentColor, color: islandFg }}
    >
      {selectedCount > 0 ? (
        <div className="flex items-center gap-0.5">
          <span className="text-[0.75rem] font-medium px-2" style={{ color: islandFg }}>
            {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
          </span>
          <Separator orientation="vertical" className="mx-1 h-5 opacity-30" style={{ backgroundColor: islandFg }} />
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDeleteRows}
            className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            style={{ fontSize: 'var(--toolbar-font-size, 12px)' }}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Delete</span>
          </Button>
          {selectedCount === 1 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleDuplicateRow}
              className="gap-1.5"
              style={{ color: islandFg, fontSize: 'var(--toolbar-font-size, 12px)' }}
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Duplicate</span>
            </Button>
          )}
          <Separator orientation="vertical" className="mx-1 h-5 opacity-30" style={{ backgroundColor: islandFg }} />
          <Button
            variant="ghost"
            size="xs"
            onClick={clearSelectedRows}
            className="gap-1.5"
            style={{ color: islandFg, fontSize: 'var(--toolbar-font-size, 12px)' }}
          >
            Clear selection
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <CoachMarkTarget id="cm-add-record">
              <Button
                variant="ghost"
                size="xs"
                onClick={onAddRow}
                className={cn("gap-1.5", isLightFg ? "hover:bg-black/10" : "hover:bg-white/20")}
                style={{ color: islandFg, fontSize: 'var(--toolbar-font-size, 12px)' }}
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">Add record</span>
              </Button>
            </CoachMarkTarget>

            <div className="mx-1 h-4 w-px shrink-0 opacity-30" style={{ backgroundColor: islandFg }} />

            {currentView === "kanban" ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <ToolbarButton
                      isActive={!!stackFieldId}
                      text={
                        stackFieldId
                          ? `Stacked by ${columns.find((c) => c.id === stackFieldId)?.name ?? "field"}`
                          : "Stacked by"
                      }
                      textClassName="hidden sm:inline"
                      className="max-w-xs"
                    >
                      <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </ToolbarButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="min-w-[12.5rem]">
                    <DropdownMenuLabel>Stack by field</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columns
                      .filter(
                        (col) =>
                          col.type === CellType.SCQ ||
                          col.type === CellType.MCQ ||
                          col.type === CellType.DropDown
                      )
                      .map((col) => (
                        <DropdownMenuCheckboxItem
                          key={col.id}
                          checked={stackFieldId === col.id}
                          onCheckedChange={() => onStackFieldChange?.(col.id)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{col.name}</span>
                            <span className="ml-2 text-[length:var(--app-font-2xs)] text-muted-foreground">
                              {col.type === CellType.SCQ
                                ? "Single Choice"
                                : col.type === CellType.MCQ
                                  ? "Multiple Choice"
                                  : "Dropdown"}
                            </span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    {columns.filter(
                      (col) =>
                        col.type === CellType.SCQ ||
                        col.type === CellType.MCQ ||
                        col.type === CellType.DropDown
                    ).length === 0 && (
                      <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                        No stackable fields available
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                  <PopoverTrigger asChild>
                    <ToolbarButton
                      text="Customize cards"
                      textClassName="hidden sm:inline"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </ToolbarButton>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[15rem] p-0">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">Visible fields on cards</p>
                    </div>
                    <div className="max-h-[18.75rem] overflow-y-auto py-1">
                      {columns
                        .filter((col) => col.id !== stackFieldId)
                        .map((col) => (
                          <button
                            key={col.id}
                            onClick={() => onToggleCardField?.(col.id)}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                          >
                            <div
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                                visibleCardFields?.has(col.id)
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30"
                              )}
                            >
                              {visibleCardFields?.has(col.id) && (
                                <Check className="h-3 w-3" strokeWidth={1.5} />
                              )}
                            </div>
                            <span className="truncate">{col.name}</span>
                          </button>
                        ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <CoachMarkTarget id="cm-hide-fields">
                    <ToolbarButton
                      isActive={hiddenColumnIds.size > 0}
                      text={hiddenColumnIds.size > 0 ? `${hiddenColumnIds.size} hidden` : t('toolbar.hideFields')}
                      textClassName="hidden sm:inline"
                    >
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </ToolbarButton>
                    </CoachMarkTarget>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-[17.5rem] p-0">
                    <HideFieldsContent
                      columns={columns}
                      hiddenColumnIds={hiddenColumnIds}
                      onToggleColumn={onToggleColumn ?? (() => {})}
                      onPersist={onHideFieldsPersist}
                    />
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <CoachMarkTarget id="cm-grid-row-height">
                    <ToolbarButton isActive={isRowHeightNonDefault}>
                      {(() => {
                        const RowHeightIcon = rowHeightIconMap[rowHeightLevel] || Rows3;
                        return <RowHeightIcon className="h-3.5 w-3.5" strokeWidth={1.5} />;
                      })()}
                    </ToolbarButton>
                    </CoachMarkTarget>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Row Height</DropdownMenuLabel>
                    {(
                      [
                        { level: RowHeightLevel.Short, label: "Short" },
                        { level: RowHeightLevel.Medium, label: "Medium" },
                        { level: RowHeightLevel.Tall, label: "Tall" },
                        {
                          level: RowHeightLevel.ExtraTall,
                          label: "Extra Tall",
                        },
                      ] as const
                    ).map(({ level, label }) => (
                      <DropdownMenuCheckboxItem
                        key={level}
                        checked={rowHeightLevel === level}
                        onCheckedChange={() => setRowHeightLevel(level)}
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Field name</DropdownMenuLabel>
                    {(
                      [
                        { lines: 1, label: "1 line" },
                        { lines: 2, label: "2 lines" },
                        { lines: 3, label: "3 lines" },
                      ] as const
                    ).map(({ lines, label }) => (
                      <DropdownMenuCheckboxItem
                        key={lines}
                        checked={fieldNameLines === lines}
                        onCheckedChange={() => setFieldNameLines(lines)}
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                  <PopoverTrigger asChild>
                    <ToolbarButton
                      isActive={!!effectiveColumnId && currentWrapMode !== TextWrapMode.Clip}
                      className={cn("gap-0.5", !effectiveColumnId && "opacity-50")}
                    >
                      {(() => {
                        const WrapIcon = wrapIconMap[currentWrapMode] || Scissors;
                        return <WrapIcon className="h-3.5 w-3.5" strokeWidth={1.5} />;
                      })()}
                      <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                    </ToolbarButton>
                  </PopoverTrigger>
                  <PopoverContent align="start" side="bottom" sideOffset={4} className="w-auto p-1">
                    <div className="flex items-center gap-0.5">
                      {([
                        { mode: TextWrapMode.Overflow, Icon: MoveHorizontal, title: "Overflow" },
                        { mode: TextWrapMode.Wrap, Icon: WrapText, title: "Wrap" },
                        { mode: TextWrapMode.Clip, Icon: Scissors, title: "Clip" },
                      ] as const).map(({ mode, Icon, title }) => (
                        <button
                          key={mode}
                          title={title}
                          onClick={() => effectiveColumnId && setColumnTextWrapMode(effectiveColumnId, mode)}
                          className={cn(
                            "flex items-center justify-center h-7 w-7 rounded transition-colors",
                            currentWrapMode === mode
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : "hover:bg-accent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}

            <CoachMarkTarget id="cm-toolbar-overview">
            <div className="flex items-center gap-1">
            <Popover
              open={filter.isOpen}
              onOpenChange={(open) =>
                open ? openFilter() : closeFilter()
              }
            >
              <PopoverTrigger asChild>
                <CoachMarkTarget id="cm-filter">
                <ToolbarButton
                  isActive={filterCount > 0 || filter.isOpen}
                  text={getFilterButtonText()}
                  textClassName="hidden sm:inline"
                  className="max-w-xs"
                >
                  <>
                    <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {filterCount > 0 && (
                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" strokeWidth={1.5} />
                    )}
                  </>
                </ToolbarButton>
                </CoachMarkTarget>
              </PopoverTrigger>
              <FilterPopover
                columns={columns ?? []}
                filterConfig={filterConfig ?? []}
                onApply={(config) => {
                  onFilterApply?.(config);
                  closeFilter();
                }}
              />
            </Popover>

            <Popover
              open={sort.isOpen}
              onOpenChange={(open) =>
                open ? openSort() : closeSort()
              }
            >
              <PopoverTrigger asChild>
                <CoachMarkTarget id="cm-sort">
                <ToolbarButton
                  isActive={sortConfig.length > 0 || sort.isOpen}
                  text={getSortButtonText()}
                  textClassName="hidden sm:inline"
                  className="max-w-xs"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                </ToolbarButton>
                </CoachMarkTarget>
              </PopoverTrigger>
              <SortPopover
                columns={columns}
                sortConfig={sortConfig}
                onApply={(config) => {
                  onSortApply?.(config);
                  closeSort();
                }}
              />
            </Popover>

            <Popover
              open={groupBy.isOpen}
              onOpenChange={(open) =>
                open ? openGroupBy() : closeGroupBy()
              }
            >
              <PopoverTrigger asChild>
                <CoachMarkTarget id="cm-group">
                <ToolbarButton
                  isActive={groupCount > 0 || groupBy.isOpen}
                  text={getGroupButtonText()}
                  textClassName="hidden sm:inline"
                  className="max-w-xs"
                >
                  <Layers className="h-3.5 w-3.5" strokeWidth={1.5} />
                </ToolbarButton>
                </CoachMarkTarget>
              </PopoverTrigger>
              <GroupPopover
                columns={columns ?? []}
                groupConfig={groupConfig ?? []}
                onApply={(config) => {
                  onGroupApply?.(config);
                  closeGroupBy();
                }}
              />
            </Popover>

            {onSetSelectionColor && (
              <Popover open={selectionColorPopoverOpen} onOpenChange={setSelectionColorPopoverOpen}>
                <PopoverTrigger asChild>
                  <ToolbarButton
                    disabled={!hasColorableSelection}
                    text={t('grid:contextMenu.setCellColor', 'Set colour')}
                    textClassName="hidden sm:inline"
                    title={hasColorableSelection ? (t('grid:contextMenu.setCellColor', 'Set colour') as string) : undefined}
                    className={cn(!hasColorableSelection && "opacity-50 cursor-not-allowed")}
                  >
                    <PaintBucket className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </ToolbarButton>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto max-w-[20rem] p-0" sideOffset={4}>
                  <ColorPalettePicker
                    title={t('grid:contextMenu.setCellColor', 'Cell/row colour')}
                    currentColor={null}
                    onSelect={(color) => {
                      onSetSelectionColor(color);
                      setSelectionColorPopoverOpen(false);
                    }}
                    onClose={() => setSelectionColorPopoverOpen(false)}
                    closeOnSelect
                  />
                </PopoverContent>
              </Popover>
            )}

            <ConditionalColorPopover columns={columns ?? []}>
              <CoachMarkTarget id="cm-conditional-color">
              <ToolbarButton
                isActive={activeColorRuleCount > 0}
                text={activeColorRuleCount > 0 ? (activeColorRuleCount > 1 ? t('toolbar.colorRulesPlural', { count: activeColorRuleCount }) : t('toolbar.colorRules', { count: activeColorRuleCount })) : t('toolbar.color')}
                textClassName="hidden sm:inline"
                className="max-w-xs"
              >
                <Paintbrush className="h-3.5 w-3.5" strokeWidth={1.5} />
              </ToolbarButton>
              </CoachMarkTarget>
            </ConditionalColorPopover>
            </div>
            </CoachMarkTarget>
          </div>

          <div className="flex items-center gap-1">
            <CoachMarkTarget id="cm-search">
              <SearchBar
                columns={columns}
                isOpen={isSearchOpen}
                onOpenChange={handleSearchOpenChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchInputChange}
                matchCount={searchMatchCount}
                currentMatch={currentSearchMatch}
                onNextMatch={onNextMatch}
                onPrevMatch={onPrevMatch}
                replaceMode={replaceMode}
                onReplaceModeChange={setReplaceMode}
                onReplace={onReplace}
                onReplaceAll={onReplaceAll}
                triggerStyle={{ color: islandFg, fontSize: 'var(--toolbar-font-size, 12px)' }}
              />
            </CoachMarkTarget>

            <div className="mx-1 h-4 w-px shrink-0 opacity-30" style={{ backgroundColor: islandFg }} />

            <Popover open={morePopoverOpen} onOpenChange={setMorePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  data-island-btn
                  className="font-normal shrink-0"
                  style={{ color: islandFg }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-48 p-1">
                <Button
                  variant="ghost"
                  size="xs"
                  className="w-full justify-start gap-2 font-normal"
                  onClick={() => {
                    setMorePopoverOpen(false);
                    openImportModal("existing");
                  }}
                >
                  <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Import to this table
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="w-full justify-start gap-2 font-normal"
                  onClick={() => {
                    setMorePopoverOpen(false);
                    openImportModal("new");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Import to new table
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="w-full justify-start gap-2 font-normal"
                  onClick={() => {
                    setMorePopoverOpen(false);
                    openExportModal();
                  }}
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Export
                </Button>
                <Separator className="my-1" />
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-xs font-medium text-muted-foreground">Zoom</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                    >
                      <Minus className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                    <span className="w-8 text-center text-xs text-muted-foreground">
                      {zoomLevel}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200}
                    >
                      <Plus className="h-3 w-3" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {showSyncButton && onFetchRecords && (
              <>
                <div className="mx-1 h-4 w-px shrink-0 opacity-30" style={{ backgroundColor: islandFg }} />
                <Button
                  variant="ghost"
                  size="icon"
                  data-island-btn
                  className="h-7 w-7 shrink-0 relative"
                  style={{ color: islandFg }}
                  onClick={onFetchRecords}
                  disabled={isSyncing}
                  title={isSyncing ? "Syncing..." : "Refresh records"}
                >
                  {isSyncing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
                      {hasNewRecords && (
                        <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-blue-500 ring-1 ring-background" />
                      )}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
    </IslandFgContext.Provider>
  );
}
