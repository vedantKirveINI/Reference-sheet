import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  ChevronsUpDown,
  Check,
  ArrowDownUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  columns: Array<{ id: string; name: string; type: string }>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string, fieldId?: string) => void;
  matchCount?: number;
  currentMatch?: number;
  onNextMatch?: () => void;
  onPrevMatch?: () => void;
  replaceMode?: boolean;
  onReplaceModeChange?: (mode: boolean) => void;
  onReplace?: (searchText: string, replaceText: string) => void;
  onReplaceAll?: (searchText: string, replaceText: string) => void;
}

export function SearchBar({
  columns,
  isOpen,
  onOpenChange,
  searchQuery,
  onSearchChange,
  matchCount,
  currentMatch,
  onNextMatch,
  onPrevMatch,
  replaceMode,
  onReplaceModeChange,
  onReplace,
  onReplaceAll,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [replaceValue, setReplaceValue] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(
    undefined
  );
  const [fieldPopoverOpen, setFieldPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInputValue("");
      setReplaceValue("");
      setSelectedFieldId(undefined);
    }
  }, [isOpen]);

  const debouncedSearch = useCallback(
    (value: string, fieldId?: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearchChange(value, fieldId);
      }, 300);
    },
    [onSearchChange]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value, selectedFieldId);
  };

  const handleFieldSelect = (fieldId: string | undefined) => {
    setSelectedFieldId(fieldId);
    setFieldPopoverOpen(false);
    if (inputValue) {
      debouncedSearch(inputValue, fieldId);
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleClose = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onSearchChange("", undefined);
    onReplaceModeChange?.(false);
    onOpenChange(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        if (!isOpen) {
          onOpenChange(true);
        } else {
          inputRef.current?.focus();
          inputRef.current?.select();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "h") {
        e.preventDefault();
        if (!isOpen) {
          onOpenChange(true);
        }
        onReplaceModeChange?.(true);
        setTimeout(() => replaceInputRef.current?.focus(), 100);
      }

      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevMatch?.();
      } else {
        onNextMatch?.();
      }
    }
  };

  const handleReplaceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim() && replaceValue !== undefined) {
        onReplace?.(inputValue, replaceValue);
      }
    }
  };

  const handleReplace = () => {
    if (!inputValue.trim()) return;
    onReplace?.(inputValue, replaceValue);
  };

  const handleReplaceAll = () => {
    if (!inputValue.trim()) return;
    onReplaceAll?.(inputValue, replaceValue);
  };

  const selectedFieldName =
    selectedFieldId === undefined
      ? "All fields"
      : columns.find((c) => c.id === selectedFieldId)?.name ?? "All fields";

  const hasMatches = matchCount !== undefined && matchCount > 0;
  const showMatchInfo = inputValue.length > 0 && matchCount !== undefined;

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="xs"
        className="font-normal shrink-0"
        onClick={() => onOpenChange(true)}
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed top-14 right-4 z-50 w-[420px]",
        "border border-border/60 bg-background/95 backdrop-blur-sm shadow-lg rounded-lg",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => onReplaceModeChange?.(!replaceMode)}
          title={replaceMode ? "Close replace (Ctrl+H)" : "Open replace (Ctrl+H)"}
        >
          <ArrowDownUp className={cn("h-3.5 w-3.5", replaceMode && "text-primary")} strokeWidth={1.5} />
        </Button>

        <Popover open={fieldPopoverOpen} onOpenChange={setFieldPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-7 px-2 gap-1 text-xs font-normal max-w-[120px]"
            >
              <span className="truncate">{selectedFieldName}</span>
              <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" strokeWidth={1.5} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-1"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <div className="flex flex-col">
              <button
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer",
                  selectedFieldId === undefined && "bg-accent"
                )}
                onClick={() => handleFieldSelect(undefined)}
              >
                <Check
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    selectedFieldId === undefined
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                  strokeWidth={1.5}
                />
                All fields
              </button>
              {columns.map((col) => (
                <button
                  key={col.id}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer",
                    selectedFieldId === col.id && "bg-accent"
                  )}
                  onClick={() => handleFieldSelect(col.id)}
                >
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      selectedFieldId === col.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                    strokeWidth={1.5}
                  />
                  <span className="truncate">{col.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1 flex items-center min-w-0 gap-2 rounded-md border border-input bg-background px-2.5 h-7">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find in view..."
            className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {showMatchInfo && (
          <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
            {hasMatches
              ? `${currentMatch ?? 0} of ${matchCount}`
              : "0 results"}
          </span>
        )}

        <div className="flex items-center shrink-0 gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onPrevMatch}
            disabled={!hasMatches}
          >
            <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onNextMatch}
            disabled={!hasMatches}
          >
            <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClose}
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      {replaceMode && (
        <div className="flex items-center gap-2 px-3 pb-2.5 pt-0">
          <div className="w-7 shrink-0" />

          <div className="flex-1 flex items-center min-w-0 gap-2 rounded-md border border-input bg-background px-2.5 h-7">
            <input
              ref={replaceInputRef}
              value={replaceValue}
              onChange={(e) => setReplaceValue(e.target.value)}
              onKeyDown={handleReplaceKeyDown}
              placeholder="Replace with..."
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>

          <div className="flex items-center shrink-0 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={handleReplace}
              disabled={!hasMatches || !inputValue.trim()}
            >
              Replace
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={handleReplaceAll}
              disabled={!hasMatches || !inputValue.trim()}
            >
              Replace All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
