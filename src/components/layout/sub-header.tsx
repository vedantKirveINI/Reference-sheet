import {
  ArrowUpDown,
  Filter,
  Group,
  EyeOff,
  Rows3,
  Search,
  Minus,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUIStore, useModalControlStore } from "@/stores";
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

export function SubHeader() {
  const { zoomLevel, setZoomLevel, sortState, filterState } = useUIStore();
  const { openSort, openFilter, openGroupBy } = useModalControlStore();

  const sortCount = Array.isArray(sortState) ? sortState.length : 0;
  const filterCount = filterState ? Object.keys(filterState).length : 0;

  const handleZoomIn = () => {
    setZoomLevel(Math.min(200, zoomLevel + 10));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(50, zoomLevel - 10));
  };

  return (
    <div className="flex h-10 items-center justify-between border-b bg-white px-2">
      <div className="flex items-center gap-0.5">
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
          onClick={() => openGroupBy()}
        />

        <Separator orientation="vertical" className="mx-1 h-5" />

        <ToolbarButton icon={EyeOff} label="Hide fields" />
        <ToolbarButton icon={Rows3} label="Row height" />
        <ToolbarButton icon={Search} label="Search" />
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
