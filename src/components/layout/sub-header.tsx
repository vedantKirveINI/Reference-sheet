import { useState, useRef, useEffect } from "react";
import {
  ArrowUpDown,
  Filter,
  Layers,
  EyeOff,
  Rows3,
  Search,
  Minus,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { SortPopover, type SortRule } from "@/views/grid/sort-modal";
import { FilterPopover, type FilterRule } from "@/views/grid/filter-modal";
import { GroupPopover, type GroupRule } from "@/views/grid/group-modal";
import { useUIStore, useModalControlStore, useGridViewStore } from "@/stores";
import { cn } from "@/lib/utils";
import { IColumn, RowHeightLevel } from "@/types";

interface ToolbarButtonProps {
  icon: React.ElementType;
  label: string;
  count?: number;
  onClick?: () => void;
  active?: boolean;
}

function ToolbarButton({
  icon: Icon,
  label,
  count,
  onClick,
  active,
}: ToolbarButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-1.5 text-muted-foreground hover:text-foreground",
        active && "text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <Badge
          variant="secondary"
          className="ml-0.5 h-5 min-w-[20px] px-1.5 text-[10px]"
        >
          {count}
        </Badge>
      )}
    </Button>
  );
}

interface SubHeaderProps {
  onDeleteRows?: (rowIndices: number[]) => void;
  onDuplicateRow?: (rowIndex: number) => void;
  sortCount?: number;
  onSearchChange?: (query: string) => void;
  columns?: IColumn[];
  sortConfig?: SortRule[];
  onSortApply?: (config: SortRule[]) => void;
  filterConfig?: FilterRule[];
  onFilterApply?: (config: FilterRule[]) => void;
  groupConfig?: GroupRule[];
  onGroupApply?: (config: GroupRule[]) => void;
  onAddRow?: () => void;
}

export function SubHeader({ onDeleteRows, onDuplicateRow, sortCount = 0, onSearchChange, columns = [], sortConfig = [], onSortApply, filterConfig, onFilterApply, groupConfig, onGroupApply, onAddRow }: SubHeaderProps) {
  const { zoomLevel, setZoomLevel, rowHeightLevel, setRowHeightLevel, fieldNameLines, setFieldNameLines } = useUIStore();
  const { sort, openSort, closeSort, filter, openFilter, closeFilter, groupBy, openGroupBy, closeGroupBy, toggleHideFields, openExportModal, openImportModal } = useModalControlStore();
  const { selectedRows, clearSelectedRows } = useGridViewStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery("");
      onSearchChange?.("");
    } else {
      setIsSearchOpen(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    onSearchChange?.("");
    setIsSearchOpen(false);
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
    const confirmed = selectedCount > 1
      ? window.confirm(`Are you sure you want to delete ${selectedCount} rows?`)
      : true;
    if (confirmed) {
      onDeleteRows?.(selectedIndices);
      clearSelectedRows();
    }
  };

  const handleDuplicateRow = () => {
    if (selectedCount !== 1) return;
    onDuplicateRow?.(selectedIndices[0]);
    clearSelectedRows();
  };

  return (
    <div className="flex h-10 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-3">
      <div className="flex items-center gap-0.5">
        {selectedCount > 0 ? (
          <>
            <span className="text-sm font-medium text-primary px-2">
              {selectedCount} row{selectedCount > 1 ? 's' : ''} selected
            </span>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteRows}
              className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
            {selectedCount === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDuplicateRow}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Duplicate</span>
              </Button>
            )}
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelectedRows}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddRow}
              className="gap-1.5 text-brand-700 border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add record</span>
            </Button>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <Popover open={sort.isOpen} onOpenChange={(open) => open ? openSort() : closeSort()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("gap-1.5 text-muted-foreground hover:text-foreground", sortCount > 0 && "text-brand-700 bg-brand-50 hover:bg-brand-100 hover:text-brand-800", sort.isOpen && "ring-1 ring-brand-300")}>
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {sortCount > 0 ? `Sorted by ${sortCount} field${sortCount > 1 ? 's' : ''}` : 'Sort'}
                  </span>
                  {sortCount > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-5 min-w-[20px] px-1.5 text-[10px] bg-brand-100 text-brand-700">
                      {sortCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <SortPopover columns={columns} sortConfig={sortConfig} onApply={onSortApply ?? (() => {})} open={sort.isOpen} onOpenChange={(o) => !o && closeSort()} />
            </Popover>
            <Popover open={filter.isOpen} onOpenChange={(open) => open ? openFilter() : closeFilter()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("gap-1.5 text-muted-foreground hover:text-foreground", (filterConfig?.length ?? 0) > 0 && "text-yellow-700 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-800", filter.isOpen && "ring-1 ring-yellow-300")}>
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {(filterConfig?.length ?? 0) > 0 ? `Filtered by ${filterConfig!.length} rule${filterConfig!.length > 1 ? 's' : ''}` : 'Filter'}
                  </span>
                  {(filterConfig?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-5 min-w-[20px] px-1.5 text-[10px] bg-yellow-100 text-yellow-700">
                      {filterConfig!.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <FilterPopover columns={columns ?? []} filterConfig={filterConfig ?? []} onApply={onFilterApply!} open={filter.isOpen} onOpenChange={(o) => !o && closeFilter()} />
            </Popover>
            <Popover open={groupBy.isOpen} onOpenChange={(open) => open ? openGroupBy() : closeGroupBy()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className={cn("gap-1.5 text-muted-foreground hover:text-foreground", (groupConfig?.length ?? 0) > 0 && "text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800", groupBy.isOpen && "ring-1 ring-green-300")}>
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {(groupConfig?.length ?? 0) > 0 ? `Grouped by ${groupConfig!.length} field${groupConfig!.length > 1 ? 's' : ''}` : 'Group'}
                  </span>
                  {(groupConfig?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-5 min-w-[20px] px-1.5 text-[10px] bg-green-100 text-green-700">
                      {groupConfig!.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <GroupPopover columns={columns ?? []} groupConfig={groupConfig ?? []} onApply={onGroupApply!} open={groupBy.isOpen} onOpenChange={(o) => !o && closeGroupBy()} />
            </Popover>

            <Separator orientation="vertical" className="mx-1 h-5" />

            <ToolbarButton icon={EyeOff} label="Hide fields" onClick={() => toggleHideFields()} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Rows3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Row height</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Row Height</DropdownMenuLabel>
                {([
                  { level: RowHeightLevel.Short, label: "Short" },
                  { level: RowHeightLevel.Medium, label: "Medium" },
                  { level: RowHeightLevel.Tall, label: "Tall" },
                  { level: RowHeightLevel.ExtraTall, label: "Extra Tall" },
                ] as const).map(({ level, label }) => (
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
                {([
                  { lines: 1, label: "1 line" },
                  { lines: 2, label: "2 lines" },
                  { lines: 3, label: "3 lines" },
                ] as const).map(({ lines, label }) => (
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
            <ToolbarButton icon={Search} label="Search" onClick={handleSearchToggle} active={isSearchOpen} />
            {isSearchOpen && (
              <div className="flex items-center gap-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search..."
                    className="h-7 w-48 pl-7 pr-7 text-xs focus:ring-2 focus:ring-brand-400/30 focus:border-brand-300 transition-shadow"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleSearchClear}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <Separator orientation="vertical" className="mx-1 h-5" />

            <ToolbarButton icon={Upload} label="Import" onClick={() => openImportModal()} />
            <ToolbarButton icon={Download} label="Export" onClick={() => openExportModal()} />
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomOut}
          disabled={zoomLevel <= 50}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-10 text-center text-xs text-muted-foreground">
          {zoomLevel}%
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleZoomIn}
          disabled={zoomLevel >= 200}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
