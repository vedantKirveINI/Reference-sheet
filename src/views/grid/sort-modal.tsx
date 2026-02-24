import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Star,
  DollarSign,
  Phone,
  MapPin,
  Paperclip,
  PenTool,
  FunctionSquare,
  Sparkles,
  SlidersHorizontal,
  Gauge,
  Check,
} from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IColumn, CellType } from "@/types";
import { cn } from "@/lib/utils";

export interface SortRule {
  columnId: string;
  direction: "asc" | "desc";
}

interface SortPopoverProps {
  columns: IColumn[];
  sortConfig: SortRule[];
  onApply: (config: SortRule[]) => void;
}

function getFieldIcon(type: CellType) {
  switch (type) {
    case CellType.String:
      return Type;
    case CellType.Number:
      return Hash;
    case CellType.DateTime:
    case CellType.CreatedTime:
      return Calendar;
    case CellType.YesNo:
      return CheckSquare;
    case CellType.SCQ:
    case CellType.DropDown:
      return ChevronDown;
    case CellType.MCQ:
    case CellType.List:
      return List;
    case CellType.Rating:
    case CellType.Ranking:
      return Star;
    case CellType.Currency:
      return DollarSign;
    case CellType.PhoneNumber:
      return Phone;
    case CellType.Address:
      return MapPin;
    case CellType.FileUpload:
      return Paperclip;
    case CellType.Signature:
      return PenTool;
    case CellType.Formula:
      return FunctionSquare;
    case CellType.Enrichment:
      return Sparkles;
    case CellType.Slider:
      return SlidersHorizontal;
    case CellType.OpinionScale:
      return Gauge;
    default:
      return Type;
  }
}

function FieldPickerList({
  columns,
  excludeIds,
  onSelect,
}: {
  columns: IColumn[];
  excludeIds?: Set<string>;
  onSelect: (col: IColumn) => void;
}) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const filtered = columns
    .filter((c) => !(excludeIds?.has(c.id)))
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col">
      <div className="px-2 pt-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search fields..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="max-h-[240px]">
        <div className="py-1">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground px-3 py-2 text-center">
              No fields found
            </p>
          )}
          {filtered.map((col) => {
            const Icon = getFieldIcon(col.type);
            return (
              <button
                key={col.id}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent rounded-sm cursor-pointer"
                onClick={() => onSelect(col)}
              >
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{col.name}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function FieldSelectorButton({
  column,
  columns,
  excludeIds,
  onSelect,
}: {
  column: IColumn;
  columns: IColumn[];
  excludeIds: Set<string>;
  onSelect: (col: IColumn) => void;
}) {
  const [open, setOpen] = useState(false);
  const Icon = getFieldIcon(column.type);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-40 h-8 justify-start gap-1.5 text-xs font-normal"
        >
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{column.name}</span>
          <ChevronDown className="h-3 w-3 ml-auto text-muted-foreground shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start" sideOffset={4}>
        <FieldPickerList
          columns={columns}
          excludeIds={excludeIds}
          onSelect={(col) => {
            onSelect(col);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function OrderSelect({
  value,
  onChange,
}: {
  value: "asc" | "desc";
  onChange: (v: "asc" | "desc") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs font-normal shrink-0 gap-1"
        >
          <span>{value === "asc" ? "A → Z" : "Z → A"}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-28 p-1" align="start" sideOffset={4}>
        <button
          className={cn(
            "flex w-full items-center px-2 py-1.5 text-xs rounded-sm cursor-pointer",
            value === "asc" ? "bg-accent" : "hover:bg-accent"
          )}
          onClick={() => { onChange("asc"); setOpen(false); }}
        >
          A → Z
        </button>
        <button
          className={cn(
            "flex w-full items-center px-2 py-1.5 text-xs rounded-sm cursor-pointer",
            value === "desc" ? "bg-accent" : "hover:bg-accent"
          )}
          onClick={() => { onChange("desc"); setOpen(false); }}
        >
          Z → A
        </button>
      </PopoverContent>
    </Popover>
  );
}

export function SortPopover({ columns, sortConfig, onApply }: SortPopoverProps) {
  const [draft, setDraft] = useState<SortRule[]>(sortConfig);
  const [addPickerOpen, setAddPickerOpen] = useState(false);

  useEffect(() => {
    setDraft(sortConfig);
  }, [sortConfig]);

  const usedIds = new Set(draft.map((r) => r.columnId));

  const addRule = (col: IColumn) => {
    setDraft([...draft, { columnId: col.id, direction: "asc" }]);
  };

  const removeRule = (index: number) => {
    setDraft(draft.filter((_, i) => i !== index));
  };

  const updateField = (index: number, col: IColumn) => {
    setDraft(draft.map((r, i) => (i === index ? { ...r, columnId: col.id } : r)));
  };

  const updateDirection = (index: number, direction: "asc" | "desc") => {
    setDraft(draft.map((r, i) => (i === index ? { ...r, direction } : r)));
  };

  const handleApply = () => {
    onApply(draft);
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(sortConfig);

  return (
    <PopoverContent className="w-auto min-w-[340px] p-0" align="start" sideOffset={4}>
      <div className="text-[13px] text-muted-foreground px-4 pt-3">
        Pick fields to sort by
      </div>
      <div className="py-4 px-4 flex flex-col gap-2">
        {draft.length === 0 ? (
          <FieldPickerList
            columns={columns}
            excludeIds={new Set()}
            onSelect={(col) => addRule(col)}
          />
        ) : (
          draft.map((rule, index) => {
            const col = columns.find((c) => c.id === rule.columnId);
            if (!col) return null;
            const excludeForThis = new Set(
              draft.filter((_, i) => i !== index).map((r) => r.columnId)
            );
            return (
              <div key={rule.columnId} className="flex items-center gap-2">
                <FieldSelectorButton
                  column={col}
                  columns={columns}
                  excludeIds={excludeForThis}
                  onSelect={(c) => updateField(index, c)}
                />
                <OrderSelect
                  value={rule.direction}
                  onChange={(d) => updateDirection(index, d)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </div>
      <div className="px-4 pb-3 flex items-center gap-2">
        <Popover open={addPickerOpen} onOpenChange={setAddPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={usedIds.size >= columns.length}
            >
              <Plus className="h-3.5 w-3.5" />
              Add another sort
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-0" align="start" sideOffset={4}>
            <FieldPickerList
              columns={columns}
              excludeIds={usedIds}
              onSelect={(col) => {
                addRule(col);
                setAddPickerOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
        <div className="flex-1" />
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-[#39A380] hover:bg-[#2e8a6b] text-white"
          onClick={handleApply}
          disabled={!hasChanges}
        >
          <Check className="h-3.5 w-3.5" />
          Apply Sort
        </Button>
      </div>
    </PopoverContent>
  );
}
