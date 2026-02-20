import { useState, useRef, useEffect } from "react";
import {
  ArrowUpDown,
  Filter,
  Group,
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
} from "@/components/ui/dropdown-menu";
import { useUIStore, useModalControlStore, useGridViewStore } from "@/stores";
import { cn } from "@/lib/utils";
import { RowHeightLevel } from "@/types";

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
  filterCount?: number;
  groupCount?: number;
  onSearchChange?: (query: string) => void;
}

export function SubHeader({ onDeleteRows, onDuplicateRow, sortCount = 0, filterCount = 0, groupCount = 0, onSearchChange }: SubHeaderProps) {
  const { zoomLevel, setZoomLevel, rowHeightLevel, setRowHeightLevel } = useUIStore();
  const { openSort, openFilter, openGroupBy, toggleHideFields, openExportModal, openImportModal } = useModalControlStore();
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
    <div className="flex h-10 items-center justify-between border-b bg-white px-2">
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
            <ToolbarButton
              icon={ArrowUpDown}
              label="Sort"
              count={sortCount}
              onClick={() => openSort()}
              active={sortCount > 0}
            />
            <ToolbarButton
              icon={Filter}
              label="Filter"
              count={filterCount}
              onClick={() => openFilter()}
              active={filterCount > 0}
            />
            <ToolbarButton
              icon={Group}
              label="Group"
              count={groupCount}
              onClick={() => openGroupBy()}
              active={groupCount > 0}
            />

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
                    className="h-7 w-48 pl-7 pr-7 text-xs"
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
