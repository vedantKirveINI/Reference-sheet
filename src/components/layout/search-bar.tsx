import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  ChevronsUpDown,
  Check,
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
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>(
    undefined
  );
  const [fieldPopoverOpen, setFieldPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInputValue("");
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
        "flex items-center h-8 rounded-full border border-input bg-background shadow-sm overflow-hidden",
        "transition-all duration-200",
        isOpen ? "w-80" : "w-0"
      )}
    >
      <Popover open={fieldPopoverOpen} onOpenChange={setFieldPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="shrink-0 rounded-none border-r border-input px-2 h-full gap-1 text-xs font-normal max-w-[120px]"
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

      <div className="flex-1 flex items-center min-w-0 px-2 gap-1">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Find in view"
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center shrink-0 pr-1 gap-0.5">
        {showMatchInfo && (
          <span className="text-xs text-muted-foreground whitespace-nowrap px-1">
            {hasMatches
              ? `${currentMatch ?? 0} of ${matchCount}`
              : "0 results"}
          </span>
        )}

        {hasMatches && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onPrevMatch}
            >
              <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onNextMatch}
            >
              <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={handleClose}
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  );
}
