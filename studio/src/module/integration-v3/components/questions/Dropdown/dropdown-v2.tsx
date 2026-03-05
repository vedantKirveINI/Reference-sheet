"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { icons } from "@/components/icons";

import { getSortedOptions } from "./utils/getSortedOptions";
import type { DropDownProps } from "./index";

// ----- MultiSelect (shadcn-based) -----

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefreshButton?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "Select items...",
  searchPlaceholder = "Search...",
  disabled,
  onRefresh,
  isRefreshing = false,
  showRefreshButton = true,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value]
  );

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newValue);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange?.([]);
    setSearchTerm("");
  };

  const handleRemove = (optionValue: string) => {
    if (disabled) return;
    const newValue = value.filter((v) => v !== optionValue);
    onChange?.(newValue);
  };

  const handleMultiKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (filteredOptions.length === 0) return;
      if (e.key === "Escape") {
        setOpen(false);
        setSearchTerm("");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) =>
          i >= filteredOptions.length - 1 ? 0 : i + 1
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) =>
          i <= 0 ? filteredOptions.length - 1 : i - 1
        );
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const opt = filteredOptions[highlightedIndex];
        if (opt) handleSelect(opt.value);
        return;
      }
    },
    [filteredOptions, highlightedIndex, handleSelect]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    const firstSelectedIdx = filteredOptions.findIndex((o) =>
      value.includes(o.value)
    );
    setHighlightedIndex(firstSelectedIdx >= 0 ? firstSelectedIdx : 0);
  }, [open]);

  useEffect(() => {
    setHighlightedIndex((i) =>
      filteredOptions.length === 0 ? 0 : Math.min(i, filteredOptions.length - 1)
    );
  }, [filteredOptions.length]);

  useEffect(() => {
    const el = optionRefs.current[highlightedIndex];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md px-3 py-2 text-sm h-auto font-normal justify-start text-left",
          open && "ring-2 ring-ring ring-offset-2"
        )}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          selectedOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{option.label}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option.value);
                }}
                className="h-4 w-4 hover:text-destructive"
              >
                <icons.x className="h-3 w-3" />
              </Button>
            </div>
          ))
        )}
        <icons.chevronDown
          className={cn(
            "ml-auto h-4 w-4 shrink-0 opacity-50 transition-transform",
            open && "rotate-180"
          )}
        />
      </Button>

      {/* Dropdown menu (search inside panel, same as single-select) */}
      {open && !disabled && (
        <div
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleMultiKeyDown}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-hidden rounded-md border border-input bg-popover shadow-md flex flex-col outline-none"
        >
          <div className="border-b border-border p-2 space-y-2 shrink-0">
            <div className="flex items-center gap-2 px-2">
              <icons.search className="h-4 w-4 shrink-0 opacity-50" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)
                  ) {
                    e.stopPropagation();
                    handleMultiKeyDown(e as unknown as React.KeyboardEvent);
                  }
                }}
                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              {selectedOptions.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="flex-1 h-8 bg-transparent text-xs"
                >
                  <icons.x className="mr-1 h-3 w-3" />
                  Clear selection
                </Button>
              ) : null}
              {showRefreshButton && onRefresh ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="flex-1 h-8 bg-transparent text-xs"
                >
                  <icons.rotateCcw
                    className={cn(
                      "mr-1 h-3 w-3",
                      isRefreshing && "animate-spin"
                    )}
                  />
                  {isRefreshing ? "Refreshing" : "Refresh"}
                </Button>
              ) : null}
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground px-2">
              No options match your search
            </div>
          ) : (
            <>
              <div className="overflow-y-auto p-1 min-h-0 max-h-48 space-y-1">
                {filteredOptions.map((option, index) => {
                  const isSelected = value.includes(option.value);
                  const isHighlighted = index === highlightedIndex;
                  return (
                    <Button
                      ref={(el) => {
                        optionRefs.current[index] = el;
                      }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      key={option.value}
                      variant="ghost"
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left justify-start h-auto",
                        (isHighlighted || isSelected) &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border border-input",
                          isSelected && "bg-primary border-primary"
                        )}
                      >
                        {isSelected && (
                          <icons.check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="flex-1 text-sm">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

MultiSelect.displayName = "MultiSelect";


export const DropdownV2 = forwardRef<any, DropDownProps>(
  (
    {
      options: optionsFromProps = [],
      value = null,
      onChange,
      isCreator = true,
      settings,
      answers,
      disabled = false,
      question,
      dataTestId,
      onRefresh,
      showRefreshButton: _showRefreshButton,
    },
    ref
  ) => {
    const [options, setOptions] = useState<any[]>([]);
    const isMultiSelect = settings?.selectionType !== "Single";
    const [isRefreshing, setIsRefreshing] = useState(false);
    const shouldShowRefreshButton = false;

    // Helper: normalize how we read ids/labels so that
    // options/value can be either primitives (string/number)
    // or objects with id/label fields.
    const getOptionId = (opt: any): string => {
      if (opt && typeof opt === "object") {
        if ("id" in opt && (opt as any).id != null) {
          return String((opt as any).id);
        }
        if ("value" in opt && (opt as any).value != null) {
          return String((opt as any).value);
        }
      }
      return String(opt);
    };

    const getOptionLabel = (opt: any): string => {
      if (opt && typeof opt === "object" && "label" in opt) {
        return String((opt as any).label);
      }
      return String(opt);
    };

    // Keep value safe w.r.t available options
    const safeValue = useMemo(() => {
      try {
        if (isMultiSelect) {
          if (!Array.isArray(value)) return [];

          return (
            value.filter((v: any) =>
              options.some((o) => getOptionId(o) === getOptionId(v))
            ) ?? []
          );
        }

        if (value == null) return null;

        const exists = options.some(
          (o) => getOptionId(o) === getOptionId(value)
        );
        return exists ? value : null;
      } catch (error) {
        return value;
      }
    }, [options, value, isMultiSelect]);

    const resolveOptions = (initialAnswers = {}) => {
      const optionsTemp = getSortedOptions({
        options: optionsFromProps,
        settings,
        answers: initialAnswers,
        question,
      });

      try {
        if (isMultiSelect) {
          const filteredValue = (Array.isArray(value) ? value : []).filter(
            (v: any) =>
              optionsTemp?.some?.(
                (o: any) => getOptionId(o) === getOptionId(v)
              )
          );

          if (filteredValue?.length !== (Array.isArray(value) ? value : []).length) {
            onChange?.(filteredValue, null, { executeNode: false });
          }
        } else {
          const selectedOption =
            optionsTemp?.find?.(
              (option: any) => getOptionId(option) === getOptionId(value)
            ) || null;
          onChange?.(selectedOption, null, { executeNode: true });
        }
      } catch (error) {
      }

      setOptions(optionsTemp);
    };

    useEffect(() => {
      resolveOptions(answers);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [optionsFromProps]);

    useImperativeHandle(
      ref,
      () => ({
        refresh: (nextAnswers: any) => resolveOptions(nextAnswers),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [settings, question, isMultiSelect]
    );

    // Map options into UI-specific formats
    const multiSelectOptions: MultiSelectOption[] = useMemo(
      () =>
        options.map((opt: any) => ({
          value: getOptionId(opt),
          label: getOptionLabel(opt),
        })),
      [options]
    );

    const multiValueIds: string[] = useMemo(
      () =>
        (Array.isArray(safeValue) ? safeValue : []).map((opt: any) =>
          getOptionId(opt)
        ),
      [safeValue]
    );

    const handleMultiChange = (selectedIds: string[]) => {
      const selectedOptions = options.filter((opt: any) =>
        selectedIds.includes(getOptionId(opt))
      );
      onChange?.(selectedOptions, null, { executeNode: false });
    };

    const singleOptions = useMemo(
      () =>
        options.map((opt: any) => ({
          value: getOptionId(opt),
          label: getOptionLabel(opt),
        })),
      [options]
    );

    const singleValueId: string =
      !isMultiSelect && safeValue != null ? getOptionId(safeValue) : "";

    const [singleSelectOpen, setSingleSelectOpen] = useState(false);
    const [singleSelectSearch, setSingleSelectSearch] = useState("");
    const [singleHighlightedIndex, setSingleHighlightedIndex] = useState(0);
    const singleSelectContainerRef = useRef<HTMLDivElement | null>(null);
    const singleOptionRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const singleFilteredOptions = useMemo(() => {
      if (!singleSelectSearch.trim()) return singleOptions;
      const term = singleSelectSearch.toLowerCase().trim();
      return singleOptions.filter((opt) =>
        opt.label.toLowerCase().includes(term)
      );
    }, [singleOptions, singleSelectSearch]);

    const singleSelectedLabel =
      singleValueId &&
      singleOptions.find((o) => o.value === singleValueId)?.label;

    const handleSingleChange = useCallback(
      (valueId: string) => {
        const selectedOption =
          options.find((opt: any) => getOptionId(opt) === valueId) || null;
        onChange?.(selectedOption, null, { executeNode: true });
        setSingleSelectOpen(false);
        setSingleSelectSearch("");
      },
      [onChange, options]
    );

    const handleSingleClear = useCallback(() => {
      if (disabled) return;
      onChange?.(null, null, { executeNode: true });
      setSingleSelectSearch("");
    }, [disabled, onChange]);

    const handleRefresh = async () => {
      if (disabled || isRefreshing || !onRefresh) return;
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    };

    useEffect(() => {
      if (singleSelectOpen && singleFilteredOptions.length > 0) {
        const idx =
          singleValueId
            ? singleFilteredOptions.findIndex((o) => o.value === singleValueId)
            : -1;
        setSingleHighlightedIndex(idx >= 0 ? idx : 0);
      }
    }, [singleSelectOpen]);

    useEffect(() => {
      const len = singleFilteredOptions.length;
      if (len > 0 && singleHighlightedIndex >= len) {
        setSingleHighlightedIndex(len - 1);
      }
    }, [singleFilteredOptions.length, singleHighlightedIndex]);

    useEffect(() => {
      if (
        singleHighlightedIndex >= 0 &&
        singleOptionRefs.current[singleHighlightedIndex]
      ) {
        singleOptionRefs.current[singleHighlightedIndex]?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }, [singleHighlightedIndex]);

    const handleSingleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const len = singleFilteredOptions.length;
        if (len === 0) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSingleHighlightedIndex((i) => (i + 1 >= len ? 0 : i + 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSingleHighlightedIndex((i) => (i - 1 < 0 ? len - 1 : i - 1));
          return;
        }
        if (
          e.key === "Enter" &&
          singleFilteredOptions[singleHighlightedIndex]
        ) {
          e.preventDefault();
          handleSingleChange(singleFilteredOptions[singleHighlightedIndex].value);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setSingleSelectOpen(false);
          setSingleSelectSearch("");
        }
      },
      [singleFilteredOptions, singleHighlightedIndex, handleSingleChange]
    );

    useEffect(() => {
      if (!isMultiSelect && singleSelectOpen) {
        const handleClickOutside = (event: MouseEvent) => {
          if (
            singleSelectContainerRef.current &&
            !singleSelectContainerRef.current.contains(event.target as Node)
          ) {
            setSingleSelectOpen(false);
            setSingleSelectSearch("");
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isMultiSelect, singleSelectOpen]);

    return (
      <div
        data-testid={
          dataTestId ? `${dataTestId}-container` : "dropdown-root-v2"
        }
      >
        {isMultiSelect ? (
          <MultiSelect
            options={multiSelectOptions}
            value={multiValueIds}
            onChange={handleMultiChange}
            placeholder={settings?.placeholder || "Select items..."}
            searchPlaceholder="Search..."
            disabled={disabled}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            showRefreshButton={shouldShowRefreshButton}
          />
        ) : (
          <div ref={singleSelectContainerRef} className="relative w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => !disabled && setSingleSelectOpen((o) => !o)}
              disabled={disabled}
              className={cn(
                "flex h-10 w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm h-auto font-normal",
                singleSelectOpen && "ring-2 ring-ring ring-offset-2"
              )}
            >
              <span
                className={cn(
                  "truncate",
                  !singleSelectedLabel && "text-muted-foreground"
                )}
              >
                {singleSelectedLabel || settings?.placeholder || "Select..."}
              </span>
              <icons.chevronDown
                className={cn(
                  "h-4 w-4 shrink-0 opacity-50 transition-transform",
                  singleSelectOpen && "rotate-180"
                )}
              />
            </Button>

            {singleSelectOpen && !disabled && (
              <div
                role="listbox"
                tabIndex={-1}
                onKeyDown={handleSingleKeyDown}
                className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-hidden rounded-md border border-input bg-popover shadow-md flex flex-col outline-none"
              >
                <div className="border-b border-border p-2 space-y-2 shrink-0">
                  <div className="flex items-center gap-2 px-2">
                    <icons.search className="h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      type="text"
                      placeholder="Search options..."
                      value={singleSelectSearch}
                      onChange={(e) => setSingleSelectSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
                          e.stopPropagation();
                          handleSingleKeyDown(e as unknown as React.KeyboardEvent);
                        }
                      }}
                      className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    {singleValueId ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSingleClear}
                        className="flex-1 h-8 bg-transparent text-xs"
                      >
                        <icons.x className="mr-1 h-3 w-3" />
                        Clear selection
                      </Button>
                    ) : null}
                    {shouldShowRefreshButton ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex-1 h-8 bg-transparent text-xs"
                      >
                        <icons.rotateCcw
                          className={cn(
                            "mr-1 h-3 w-3",
                            isRefreshing && "animate-spin"
                          )}
                        />
                        {isRefreshing ? "Refreshing" : "Refresh"}
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="overflow-y-auto p-1 min-h-0 max-h-48 space-y-1">
                  {singleFilteredOptions.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground px-2">
                      No options match your search
                    </div>
                  ) : (
                    singleFilteredOptions.map((opt, index) => {
                      const isSelected = opt.value === singleValueId;
                      const isHighlighted = index === singleHighlightedIndex;
                      return (
                        <Button
                          ref={(el) => {
                            singleOptionRefs.current[index] = el;
                          }}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          key={opt.value}
                          variant="ghost"
                          onClick={() => handleSingleChange(opt.value)}
                          onMouseEnter={() => setSingleHighlightedIndex(index)}
                          className={cn(
                            "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none text-left justify-start h-auto font-normal",
                            (isHighlighted || isSelected) &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <span className="flex-1 truncate">{opt.label}</span>
                          {isSelected && (
                            <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center pointer-events-none">
                              <icons.check className="h-4 w-4" />
                            </span>
                          )}
                        </Button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

DropdownV2.displayName = "DropdownV2";

