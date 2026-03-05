"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          open && "ring-2 ring-ring ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {/* Selected items */}
        {selectedOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs"
          >
            <span>{option.label}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(option.value)}
              className="h-4 w-4 hover:text-destructive"
            >
              <icons.x className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {/* Search input */}
        <div className="flex min-w-32 flex-1 items-center gap-2">
          <icons.search className="h-4 w-4 opacity-50" />
          <Input
            type="text"
            placeholder={
              selectedOptions.length === 0 ? placeholder : searchPlaceholder
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => !disabled && setOpen(true)}
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={disabled}
          />
        </div>

        {/* Chevron */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "ml-2 h-auto w-auto transition-transform duration-200",
            open && "rotate-180",
            disabled && "cursor-not-allowed"
          )}
          onClick={() => !disabled && setOpen((o) => !o)}
          disabled={disabled}
        >
          <icons.chevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </div>

      {/* Dropdown menu */}
      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-md border border-input bg-popover p-2 shadow-md">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options found
            </div>
          ) : (
            <>
              <div className="border-b border-border bg-popover px-3 py-2">
                <p className="text-xs font-medium text-foreground">
                  Loaded {options.length} result{options.length !== 1 ? "s" : ""}
                </p>
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
              <div className="mb-2 space-y-1">
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <Button
                      type="button"
                      key={option.value}
                      variant="ghost"
                      onClick={() => handleSelect(option.value)}
                      className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left justify-start h-auto"
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

              {/* Clear all button */}
              {selectedOptions.length > 0 && (
                <div className="border-t border-border pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="w-full text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}
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
      showRefreshButton,
    },
    ref
  ) => {
    const [options, setOptions] = useState<any[]>([]);
    const isMultiSelect = settings?.selectionType !== "Single";
    const [isRefreshing, setIsRefreshing] = useState(false);
    const shouldShowRefreshButton =
      typeof showRefreshButton === "boolean"
        ? showRefreshButton
        : settings?.showRefreshButton ?? false;

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

    const handleSingleChange = (valueId: string) => {
      const selectedOption =
        options.find((opt: any) => getOptionId(opt) === valueId) || null;
      onChange?.(selectedOption, null, { executeNode: true });
    };

    const handleSingleClear = () => {
      if (disabled) return;
      onChange?.(null, null, { executeNode: true });
    };

    const handleRefresh = async () => {
      if (disabled || isRefreshing || !onRefresh) return;
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    };

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
          <Select
            value={singleValueId}
            onValueChange={handleSingleChange}
            disabled={disabled}
          >
            <SelectTrigger className="h-10">
              <SelectValue
                placeholder={settings?.placeholder || "Select..."}
              />
            </SelectTrigger>
            <SelectContent>
              <div className="border-b border-border bg-popover px-3 py-2">
                <p className="mb-3 text-xs font-medium text-foreground">
                  Loaded {options.length} result{options.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  {singleValueId && !disabled ? (
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
                      disabled={isRefreshing || disabled}
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
              <div className="py-1">
                {singleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>
    );
  }
);

DropdownV2.displayName = "DropdownV2";

