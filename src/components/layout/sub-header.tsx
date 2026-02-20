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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUIStore, useModalControlStore, useGridViewStore } from "@/stores";
import { cn } from "@/lib/utils";

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
}

export function SubHeader({ onDeleteRows, onDuplicateRow, sortCount = 0, filterCount = 0, groupCount = 0 }: SubHeaderProps) {
  const { zoomLevel, setZoomLevel } = useUIStore();
  const { openSort, openFilter, openGroupBy, toggleHideFields, openExportModal, openImportModal } = useModalControlStore();
  const { selectedRows, clearSelectedRows } = useGridViewStore();

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
            <ToolbarButton icon={Rows3} label="Row height" />
            <ToolbarButton icon={Search} label="Search" />

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
