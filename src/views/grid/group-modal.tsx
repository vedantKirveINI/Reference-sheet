import { useState, useMemo, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  Search,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  ChevronDown,
  List,
  Star,
  DollarSign,
  Phone,
  MapPin,
  Paperclip,
  PenTool,
  FunctionSquare,
  Sparkles,
  ArrowUpAZ,
  ArrowDownZA,
  Check,
} from "lucide-react";
import { PopoverContent, Popover, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { IColumn, CellType } from "@/types";

export interface GroupRule {
  columnId: string;
  direction: "asc" | "desc";
}

interface GroupPopoverProps {
  columns: IColumn[];
  groupConfig: GroupRule[];
  onApply: (config: GroupRule[]) => void;
}

function getFieldTypeIcon(type: CellType) {
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
    default:
      return Type;
  }
}

function FieldPickerList({
  columns,
  excludeIds,
  search,
  onSearchChange,
  onSelect,
}: {
  columns: IColumn[];
  excludeIds: Set<string>;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (col: IColumn) => void;
}) {
  const { t } = useTranslation(['common']);
  const filtered = useMemo(
    () =>
      columns.filter(
        (c) =>
          !excludeIds.has(c.id) &&
          c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [columns, excludeIds, search]
  );

  return (
    <div className="flex flex-col">
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('fieldModal.searchFields')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="max-h-[200px]">
        <div className="py-1">
          {filtered.map((col) => {
            const Icon = getFieldTypeIcon(col.type);
            return (
              <button
                key={col.id}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer"
                onClick={() => onSelect(col)}
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{col.name}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">No fields found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function FieldSelector({
  columns,
  selectedColumn,
  excludeIds,
  onChange,
}: {
  columns: IColumn[];
  selectedColumn: IColumn | undefined;
  excludeIds: Set<string>;
  onChange: (columnId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const Icon = selectedColumn ? getFieldTypeIcon(selectedColumn.type) : Type;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("w-40 h-8 justify-start gap-2 font-normal")}
        >
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selectedColumn?.name ?? "Select field"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <FieldPickerList
          columns={columns}
          excludeIds={excludeIds}
          search={search}
          onSearchChange={setSearch}
          onSelect={(col) => {
            onChange(col.id);
            setOpen(false);
            setSearch("");
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
  onChange: (dir: "asc" | "desc") => void;
}) {
  const [open, setOpen] = useState(false);
  const options: { value: "asc" | "desc"; label: string; icon: typeof ArrowUpAZ }[] = [
    { value: "asc", label: "Ascending", icon: ArrowUpAZ },
    { value: "desc", label: "Descending", icon: ArrowDownZA },
  ];
  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 font-normal min-w-[120px] justify-start">
          <current.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-xs">{current.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {options.map((opt) => {
          const OptIcon = opt.icon;
          return (
            <button
              key={opt.value}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent rounded-sm cursor-pointer",
                value === opt.value && "bg-accent"
              )}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <OptIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

export function GroupPopover({ columns, groupConfig, onApply }: GroupPopoverProps) {
  const [draft, setDraft] = useState<GroupRule[]>(groupConfig);
  const [emptySearch, setEmptySearch] = useState("");

  useEffect(() => {
    setDraft(groupConfig);
  }, [groupConfig]);

  const usedIds = useMemo(
    () => new Set(draft.map((r) => r.columnId)),
    [draft]
  );

  const addRule = (columnId: string) => {
    if (draft.length >= 3) return;
    setDraft([...draft, { columnId, direction: "asc" as const }]);
  };

  const removeRule = (index: number) => {
    setDraft(draft.filter((_, i) => i !== index));
  };

  const updateField = (index: number, columnId: string) => {
    setDraft(draft.map((r, i) =>
      i === index ? { ...r, columnId } : r
    ));
  };

  const updateDirection = (index: number, direction: "asc" | "desc") => {
    setDraft(draft.map((r, i) =>
      i === index ? { ...r, direction } : r
    ));
  };

  const handleApply = () => {
    onApply(draft);
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(groupConfig);

  return (
    <PopoverContent className="w-auto min-w-[340px] p-0" align="start" sideOffset={4}>
      <div className="text-[13px] text-muted-foreground px-4 pt-3">
        Set fields to group records
      </div>
      <div className="py-4 px-4 flex flex-col gap-2">
        {draft.length === 0 ? (
          <FieldPickerList
            columns={columns}
            excludeIds={new Set()}
            search={emptySearch}
            onSearchChange={setEmptySearch}
            onSelect={(col) => addRule(col.id)}
          />
        ) : (
          draft.map((rule, index) => {
            const col = columns.find((c) => c.id === rule.columnId);
            const otherUsedIds = new Set(
              draft.filter((_, i) => i !== index).map((r) => r.columnId)
            );

            return (
              <div key={index} className="flex items-center gap-2">
                <FieldSelector
                  columns={columns}
                  selectedColumn={col}
                  excludeIds={otherUsedIds}
                  onChange={(id) => updateField(index, id)}
                />
                <OrderSelect
                  value={rule.direction}
                  onChange={(dir) => updateDirection(index, dir)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeRule(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>
      <div className="px-4 pb-3 flex items-center gap-2">
        {draft.length < 3 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add another group
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52 p-0" align="start">
              <AddFieldPicker
                columns={columns}
                usedIds={usedIds}
                onSelect={(id) => addRule(id)}
              />
            </PopoverContent>
          </Popover>
        )}
        <div className="flex-1" />
        <Button
          size="sm"
          className="gap-1.5 text-xs bg-[#39A380] hover:bg-[#2e8a6b] text-white"
          onClick={handleApply}
          disabled={!hasChanges}
        >
          <Check className="h-3.5 w-3.5" />
          Apply Grouping
        </Button>
      </div>
    </PopoverContent>
  );
}

function AddFieldPicker({
  columns,
  usedIds,
  onSelect,
}: {
  columns: IColumn[];
  usedIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  return (
    <FieldPickerList
      columns={columns}
      excludeIds={usedIds}
      search={search}
      onSearchChange={setSearch}
      onSelect={(col) => onSelect(col.id)}
    />
  );
}
