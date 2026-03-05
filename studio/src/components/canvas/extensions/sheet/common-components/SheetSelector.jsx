import * as React from "react";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { List } from "react-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";

const ROW_HEIGHT = 52;
const LIST_HEIGHT = 300;


const SheetSelector = ({
  sheets = [],
  value = null,
  onChange = () => { },
  onRefresh = () => { },
  onCreate = () => { },
  loading = false,
  disabled = false,
  placeholder = "Select a sheet...",
  themeColor = "#8B5CF6",
}) => {
  const [open, setOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [listWidth, setListWidth] = useState(300);
  const listContainerRef = useRef(null);

  const handleOpenChange = useCallback((nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearchQuery("");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = listContainerRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setListWidth(w);
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const handleRefresh = (e) => {
    e.stopPropagation();
    setIsRotating(true);
    onRefresh();
    setTimeout(() => setIsRotating(false), 1000);
  };

  const handleSelect = useCallback(
    (sheet) => {
      onChange(null, sheet);
      setOpen(false);
    },
    [onChange]
  );

  const handleCreate = useCallback(() => {
    onCreate();
    setOpen(false);
  }, [onCreate]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  }, []);

  const selectedSheet = value;
  const sheetId = selectedSheet?._id || selectedSheet?.id;

  const filteredSheets = useMemo(
    () =>
      sheets.filter((s) =>
        (s?.name ?? "")
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      ),
    [sheets, searchQuery]
  );

  const rowRenderer = ({ index, style }) => {
    const sheet = filteredSheets[index];
    if (!sheet) return null;
    const optionId = sheet?._id || sheet?.id;
    const isSelected = sheetId === optionId;
    return (
      <div
        style={style}
        role="option"
        aria-selected={isSelected}
        className={cn(
          "flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg my-0.5 box-border transition-colors",
          isSelected ? "bg-gray-200" : "hover:bg-gray-100"
        )}
        onClick={() => handleSelect(sheet)}
      >
        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="w-full truncate font-medium text-gray-900">
            {sheet?.name}
          </span>
          <span className="text-xs text-gray-500">
            Last updated: {formatDate(sheet?.edited_at)}
          </span>
        </div>
        <span
          className={cn(
            "ml-2 flex shrink-0 items-center justify-center",
            isSelected ? "opacity-100" : "opacity-0"
          )}
          style={{ color: "var(--sheet-selector-theme-color)" }}
        >
          <Check className="size-4" />
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-xl bg-gray-100" />
        <div className="size-10 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "flex h-10 flex-1 justify-between rounded-xl border border-gray-200 bg-white px-3",
              "transition-colors hover:bg-gray-50",
              !selectedSheet && "text-gray-500",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            <span className="truncate font-medium">
              {selectedSheet?.name || placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-gray-200 p-0 shadow-lg"
          align="start"
          style={{ ["--sheet-selector-theme-color"]: themeColor }}
        >
          <div className="flex flex-col max-h-[450px]">
            <div className="flex h-10 items-center gap-2 border-b px-3">
              <Search className="size-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search sheets..."
                className="h-9 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleCreate}
              className="mx-1 my-0.5 flex w-[calc(100%-8px)] cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
              style={{ color: "var(--sheet-selector-theme-color)" }}
            >
              <Plus className="size-4 shrink-0" />
              <span className="font-semibold">Create New Sheet</span>
            </button>

            {filteredSheets.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No sheets found.
              </div>
            ) : (
              <div
                ref={listContainerRef}
                role="listbox"
                aria-label="Sheets list"
                className="flex min-h-0 min-w-0 w-full flex-1 overflow-hidden outline-none [&>div]:ml-2"
              >
                <List
                  rowComponent={rowRenderer}
                  rowCount={filteredSheets.length}
                  rowHeight={ROW_HEIGHT}
                  defaultHeight={LIST_HEIGHT}
                  overscanCount={5}
                  rowProps={{}}
                >
                </List>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        disabled={disabled}
        className={cn(
          "h-10 w-10 rounded-xl bg-white border border-gray-200",
          "hover:bg-gray-50 transition-colors",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        data-testid="sheet-refresh-button"
      >
        <RefreshCw
          className={cn("size-4 text-gray-600", isRotating && "animate-spin")}
        />
      </Button>
    </div>
  );
};

export default SheetSelector;
