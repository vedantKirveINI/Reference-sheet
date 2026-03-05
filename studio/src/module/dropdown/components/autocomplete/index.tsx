import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { isEmpty } from "oute-services-utility-sdk";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { icons } from "@/components/icons";
import { ViewPort } from "@src/module/constants";
import { usePortalContainer } from "@/components/dialogs/form-preview-v2/context/PortalContainerContext";
import { NoOptionsText } from "./noOptionsText";

const QUESTION_FILLER_ROOT_TESTID = "question-filler-root";

function findQuestionFillerRoot(from: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = from;
  while (node) {
    if (node.getAttribute?.("data-testid") === QUESTION_FILLER_ROOT_TESTID) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

const ChevronLeftIcon = icons.chevronLeft;
const ChevronDownIcon = icons.chevronDown;
const SearchIcon = icons.search;
const CheckIcon = icons.check;

interface AutoCompleteProps {
  options?: any;
  viewPort?: string;
  isCreator?: boolean;
  multiple?: boolean;
  placeholder?: string;
  onChange?: any;
  value?: any;
  disabled?: boolean;
  isInputValid?: boolean;
  isIntegration?: boolean;
  theme?: any;
  includeOther?: boolean;
  /** When true (default), show search input in the dropdown list. When false, search is hidden. */
  enableSearch?: boolean;
  /** When true and viewPort is MOBILE, use full-screen overlay (like currency) portaled to question-filler-root. */
  isPreview?: boolean;
}

const AutoComplete = ({
  options = [],
  viewPort,
  isCreator,
  placeholder,
  multiple = false,
  onChange,
  value,
  disabled,
  isIntegration,
  theme,
  includeOther = false,
  enableSearch = true,
  isPreview = false,
}: AutoCompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [cursorIndex, setCursorIndex] = useState<number>(-1);
  const [moreCount, setMoreCount] = useState(0);
  const chipScrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { container: portalContainer, isPreviewMode } = usePortalContainer();

  const isMobileFullScreen = isPreview && viewPort === ViewPort.MOBILE;

  const getValue = () => {
    if (!isEmpty(value)) return value;
    return multiple ? [] : "";
  };

  const getLabel = (opt: any) => {
    return typeof opt === "string" ? opt : opt?.label;
  };

  const getId = (opt: any) => {
    return typeof opt === "string" ? opt : opt?.id;
  };

  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;
    const searchLower = searchValue.toLowerCase();
    return options.filter((opt: any) => {
      const label = getLabel(opt);
      return label?.toLowerCase().includes(searchLower);
    });
  }, [options, searchValue]);

  const isOptionSelected = (option: any) => {
    const optionId = getId(option);
    if (multiple) {
      const valueArray = Array.isArray(value) ? value : [];
      return valueArray.some((val: any) => getId(val) == optionId);
    } else {
      return getId(value) == optionId;
    }
  };

  const handleSelect = (option: any) => {
    if (multiple) {
      const valueArray = Array.isArray(value) ? value : [];
      const isSelected = isOptionSelected(option);
      const newValue = isSelected
        ? valueArray.filter((val: any) => getId(val) != getId(option))
        : [...valueArray, option];
      onChange?.(newValue, undefined);
      if (!isSelected) {
        setCursorIndex(newValue.length - 1);
      }
    } else {
      onChange?.(option, undefined);
      setIsOpen(false);
    }
  };

  const currentValue = getValue();
  const selectedOptions = multiple
    ? (Array.isArray(currentValue) ? currentValue : []).filter((v: any) => !isEmpty(v))
    : [];

  useEffect(() => {
    if (!multiple || selectedOptions.length === 0) {
      setCursorIndex(-1);
    } else {
      setCursorIndex((prev) => {
        if (prev < 0) return selectedOptions.length - 1;
        if (prev >= selectedOptions.length) return selectedOptions.length - 1;
        return prev;
      });
    }
  }, [multiple, selectedOptions.length]);

  const updateMoreCount = useCallback(() => {
    const el = chipScrollRef.current;
    if (!el || selectedOptions.length === 0) {
      setMoreCount(0);
      return;
    }
    const containerRect = el.getBoundingClientRect();
    const containerRight = containerRect.right;
    let hidden = 0;
    for (const child of Array.from(el.children)) {
      const rect = (child as HTMLElement).getBoundingClientRect();
      if (rect.left >= containerRight - 1) hidden += 1;
    }
    setMoreCount(hidden);
  }, [selectedOptions.length]);

  useEffect(() => {
    if (!multiple || selectedOptions.length === 0) {
      setMoreCount(0);
      return;
    }
    const el = chipScrollRef.current;
    const run = () => {
      requestAnimationFrame(updateMoreCount);
    };
    run();
    if (!el) return;
    const ro = new ResizeObserver(run);
    ro.observe(el);
    el.addEventListener("scroll", run);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", run);
    };
  }, [multiple, selectedOptions.length, updateMoreCount]);

  useEffect(() => {
    if (!isOpen) return;
    const id = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 220);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  const getMenuItems = () => {
    const list = listRef.current;
    if (!list) return [];
    return Array.from(
      list.querySelectorAll<HTMLElement>(
        "[role=\"menuitem\"], [role=\"menuitemcheckbox\"], [role=\"menuitemradio\"]"
      )
    );
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const items = getMenuItems();
    if (items.length === 0) return;
    e.preventDefault();
    if (e.key === "ArrowDown") {
      items[0]?.focus();
    } else {
      items[items.length - 1]?.focus();
    }
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    option: any
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      handleSelect(option);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const items = getMenuItems();
      if (items.length === 0) return;
      e.preventDefault();
      const current = items.indexOf(e.currentTarget as HTMLElement);
      if (e.key === "ArrowDown") {
        const next = current < items.length - 1 ? current + 1 : current;
        items[next]?.focus();
      } else {
        if (current <= 0) {
          searchInputRef.current?.focus();
        } else {
          items[current - 1]?.focus();
        }
      }
    }
  };

  const containerClassName = cn(
    "flex flex-col items-start w-full box-border",
    "transition-opacity duration-300 ease-in-out",
    !isIntegration && viewPort === ViewPort.MOBILE && isOpen && [
      "relative h-full z-[100]",
    ],
    viewPort !== ViewPort.MOBILE && "h-auto"
  );

  const contentClassName = cn(
    "z-[9999] p-0",
    viewPort === ViewPort.MOBILE && isOpen && [
      "fixed inset-0 w-screen h-screen rounded-none border-none mt-0",
      "flex flex-col bg-white/70 backdrop-blur-[20px]",
    ],
    viewPort !== ViewPort.MOBILE && [
      "w-[var(--radix-dropdown-menu-trigger-width)] min-w-[8rem] max-h-[min(18rem,var(--radix-dropdown-menu-content-available-height))]",
      "border border-black/20 shadow-md",
    ]
  );

  const overlayPortalContainer =
    isMobileFullScreen && isOpen && containerRef.current
      ? findQuestionFillerRoot(containerRef.current)
      : null;

  return (
    <div
      ref={containerRef}
      className={containerClassName}
      data-testid="dropdown-autocomplete-root"
    >
      {isCreator ? (
        <div
          className="relative w-full flex items-center h-9 rounded-none px-0 border-0 border-b border-b-[1px] text-sm leading-none opacity-70 pointer-events-none"
          style={{
            borderBottomColor: theme?.styles?.buttons,
            fontFamily: theme?.styles?.fontFamily || "Noto serif",
            color: theme?.styles?.buttons,
          }}
          data-testid="dropdown-autocomplete-creator-preview"
        >
          <span className="flex-1 truncate text-left min-w-0 text-base md:text-sm">
            {placeholder || "Select an option"}
          </span>
          <ChevronDownIcon
            className="shrink-0 ml-1.5 h-4 w-4"
            style={{ color: theme?.styles?.buttons }}
          />
        </div>
      ) : (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={isOpen}
              disabled={disabled}
              className={cn(
                "flex items-center justify-between w-full min-h-9 rounded-none border-0 border-b bg-transparent px-0 py-2 text-left",
                isOpen && "border-b-2",
                "focus-visible:outline-none focus-visible:ring-0",
                disabled && "cursor-not-allowed opacity-50"
              )}
              style={{
                fontFamily: theme?.styles?.fontFamily || "Noto serif",
                color: theme?.styles?.buttons,
                borderBottomWidth: isOpen ? "2px" : "1px",
                borderBottomColor: theme?.styles?.buttons || "hsl(var(--border))",
              }}
              data-testid="dropdown-autocomplete-trigger"
              onKeyDown={(e) => {
                if (multiple && selectedOptions.length > 0) {
                  if (e.key === "Backspace" || e.key === "Delete") {
                    e.preventDefault();
                    e.stopPropagation();
                    const idx =
                      cursorIndex >= 0 ? cursorIndex : selectedOptions.length - 1;
                    const newValue = selectedOptions.filter(
                      (_: any, i: number) => i !== idx
                    );
                    onChange?.(newValue, undefined);
                    setCursorIndex(
                      newValue.length === 0 ? -1 : Math.min(idx, newValue.length - 1)
                    );
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    setCursorIndex((i) =>
                      i <= 0 ? selectedOptions.length - 1 : i - 1
                    );
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    setCursorIndex((i) =>
                      i < 0 || i >= selectedOptions.length - 1 ? 0 : i + 1
                    );
                  }
                }
              }}
            >
              <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
                {multiple && selectedOptions.length > 0 ? (
                  <>
                    <div
                      ref={chipScrollRef}
                      className="flex items-center gap-1 flex-1 min-w-0 flex-nowrap overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                      data-testid="dropdown-autocomplete-chip"
                    >
                      {selectedOptions.map((option: any, index: number) => {
                        const isCursor = index === (cursorIndex >= 0 ? cursorIndex : selectedOptions.length - 1);
                        return (
                          <button
                            type="button"
                            key={index}
                            tabIndex={-1}
                            className={cn(
                              "inline-flex items-center rounded-sm transition-colors focus:outline-none shrink-0",
                              isCursor ? "bg-primary/50" : "bg-primary/10"
                            )}
                            style={
                              isCursor && theme?.styles?.buttons
                                ? { backgroundColor: `${theme.styles.buttons}50` }
                                : theme?.styles?.buttons
                                  ? { backgroundColor: `${theme.styles.buttons}15` }
                                  : undefined
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setCursorIndex(index);
                            }}
                            data-testid="dropdown-autocomplete-chip-option"
                            data-cursor={isCursor ? "true" : undefined}
                          >
                            <Badge variant="secondary" className="border-0 bg-transparent text-foreground text-sm font-medium px-2.5 py-1 h-6">
                              {getLabel(option)}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                    {moreCount > 0 && (
                      <span
                        className="shrink-0 text-sm text-muted-foreground tabular-nums"
                        style={{ color: theme?.styles?.buttons ? `${theme.styles.buttons}99` : undefined }}
                        data-testid="dropdown-autocomplete-more-count"
                      >
                        +{moreCount}
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    className={cn(
                      "truncate",
                      (multiple ? selectedOptions.length === 0 : isEmpty(currentValue)) &&
                        "text-gray-500"
                    )}
                  >
                    {(multiple && selectedOptions.length === 0) ||
                    (!multiple && isEmpty(currentValue))
                      ? placeholder || "Select..."
                      : getLabel(currentValue)}
                  </span>
                )}
              </div>
              <ChevronDownIcon
                className={cn("shrink-0 ml-2 h-4 w-4 transition-transform", isOpen && "rotate-180")}
                style={{ color: theme?.styles?.buttons }}
              />
            </button>
          </DropdownMenuTrigger>
          {/* Mobile preview: backdrop + full-screen overlay (same as currency) */}
          {isMobileFullScreen && isOpen &&
            (() => {
              return (
                <>
                  {overlayPortalContainer &&
                    createPortal(
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-[998] h-full w-full bg-black/20 backdrop-blur-sm"
                        data-testid="dropdown-mobile-backdrop"
                      />,
                      overlayPortalContainer
                    )}
                  {createPortal(
                    <div
                      className="absolute inset-0 z-[9999] flex h-full w-full flex-col bg-background text-[clamp(11px,2.8vw,13px)]"
                      role="dialog"
                      aria-modal="true"
                      aria-label="Select option"
                      data-testid="dropdown-autocomplete"
                    >
                      <div className="sticky top-0 z-10 flex shrink-0 items-center gap-2 rounded-t-xl border-b border-border bg-muted/80 px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="-ml-1 shrink-0 rounded-md p-1.5 text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label="Close"
                          data-testid="dropdown-mobile-back-button"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        {enableSearch && (
                          <Input
                            ref={searchInputRef}
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="h-9 flex-1 min-w-0 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                            data-testid="dropdown-picker-search"
                          />
                        )}
                      </div>
                      <div
                        ref={listRef}
                        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2"
                        data-testid="dropdown-autocomplete-listbox"
                      >
                        {filteredOptions.length === 0 ? (
                          <div className="py-[1.5em] text-center text-[0.875em] text-muted-foreground">
                            <NoOptionsText
                              hasOptions={options?.length >= 1}
                              includeOther={includeOther}
                              isOtherSelected={
                                multiple
                                  ? value?.map?.((val: any) => getId(val))?.includes("Other")
                                  : getId(value) === "Other"
                              }
                              isMultiSelect={multiple}
                              onOtherOptionClick={() => {
                                if (multiple) {
                                  let newVal = value?.includes("Other")
                                    ? value?.filter?.((val: any) => val !== "Other")
                                    : [...value, "Other"];
                                  onChange(newVal, undefined);
                                } else {
                                  onChange("Other", undefined);
                                  setIsOpen(false);
                                }
                              }}
                            />
                          </div>
                        ) : (
                          filteredOptions.map((option: any) => {
                            const selected = isOptionSelected(option);
                            return (
                              <button
                                key={getId(option)}
                                type="button"
                                role="menuitem"
                                onClick={() => handleSelect(option)}
                                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                                className={cn(
                                  "flex w-full cursor-pointer items-center gap-[0.5em] rounded-sm py-[0.5em] px-2 text-left outline-none transition-colors focus:bg-accent hover:bg-accent/80",
                                  selected && "bg-accent"
                                )}
                                data-testid="dropdown-autocomplete-option"
                              >
                                {multiple ? (
                                  selected ? (
                                    <CheckIcon className="h-[1em] w-[1em] shrink-0 opacity-100" />
                                  ) : (
                                    <span className="h-[1em] w-[1em] shrink-0" aria-hidden />
                                  )
                                ) : selected ? (
                                  <CheckIcon className="h-[1em] w-[1em] shrink-0 opacity-100" />
                                ) : (
                                  <span className="h-[1em] w-[1em] shrink-0" aria-hidden />
                                )}
                                <span className="min-w-0 flex-1 truncate text-[0.875em]">
                                  {getLabel(option)}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>,
                    overlayPortalContainer ?? document.body
                  )}
                </>
              );
            })()}
          {(!isMobileFullScreen || viewPort !== ViewPort.MOBILE) && (
          <DropdownMenuContent
            className={contentClassName}
            align="start"
            sideOffset={0}
            container={isPreviewMode && portalContainer ? portalContainer : undefined}
            onCloseAutoFocus={(e) => {
              if (viewPort === ViewPort.MOBILE) {
                e.preventDefault();
              }
            }}
            onKeyDown={(e) => {
              if (
                multiple &&
                selectedOptions.length > 0 &&
                e.key === "Backspace" &&
                (!enableSearch || !searchValue)
              ) {
                e.preventDefault();
                e.stopPropagation();
                onChange?.(selectedOptions.slice(0, -1), undefined);
              }
            }}
          >
            <div
              className="flex flex-col min-h-0 flex-1"
              data-testid="dropdown-autocomplete"
            >
              {/* Search + back (mobile) - hide header when search disabled so no extra bar on desktop */}
              {(enableSearch || viewPort === ViewPort.MOBILE) && (
                <div className="relative sticky top-0 z-10 shrink-0 border-b bg-popover flex items-center p-1">
                  {viewPort === ViewPort.MOBILE && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 shrink-0"
                      data-testid="dropdown-mobile-back-button"
                    >
                      <ChevronLeftIcon
                        className="h-4 w-4"
                        style={{ color: theme?.styles?.buttons }}
                      />
                    </Button>
                  )}
                  {enableSearch && viewPort !== ViewPort.MOBILE && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      <SearchIcon
                        className="h-4 w-4 opacity-50"
                        style={{ color: theme?.styles?.buttons }}
                      />
                    </div>
                  )}
                  {enableSearch && (
                    <Input
                      ref={searchInputRef}
                      placeholder="Search..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        handleSearchKeyDown(e);
                      }}
                      className={cn(
                        "border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1 min-w-0 h-8 pl-10",
                        viewPort === ViewPort.MOBILE && "pl-10"
                      )}
                      data-testid="dropdown-picker-search"
                    />
                  )}
                </div>
              )}
              {/* List - same max-height/height as original */}
              <div
                ref={listRef}
                className={cn(
                  "min-w-0 overflow-x-hidden overflow-y-auto flex-1 min-h-0 p-1.5 flex flex-col gap-1.5",
                  !isIntegration && viewPort === ViewPort.MOBILE && "max-h-[42em] h-[41em]"
                )}
                data-testid="dropdown-autocomplete-listbox"
              >
                {filteredOptions.length === 0 ? (
                  <div className="p-2">
                    <NoOptionsText
                      hasOptions={options?.length >= 1}
                      includeOther={includeOther}
                      isOtherSelected={
                        multiple
                          ? value?.map?.((val: any) => getId(val))?.includes("Other")
                          : getId(value) === "Other"
                      }
                      isMultiSelect={multiple}
                      onOtherOptionClick={() => {
                        if (multiple) {
                          let newVal = value?.includes("Other")
                            ? value?.filter?.((val: any) => val !== "Other")
                            : [...value, "Other"];
                          onChange(newVal, undefined);
                        } else {
                          onChange("Other", undefined);
                          setIsOpen(false);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {filteredOptions.map((option: any) => {
                      const selected = isOptionSelected(option);
                      if (multiple) {
                        return (
                          <DropdownMenuCheckboxItem
                            key={getId(option)}
                            checked={selected}
                            onSelect={(e) => {
                              e.preventDefault();
                              handleSelect(option);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                e.stopPropagation();
                              else
                                handleOptionKeyDown(
                                  e as unknown as React.KeyboardEvent<HTMLButtonElement>,
                                  option
                                );
                            }}
                            data-testid="dropdown-autocomplete-option"
                          >
                            <span className="truncate" title={getLabel(option)}>
                              {getLabel(option)}
                            </span>
                          </DropdownMenuCheckboxItem>
                        );
                      }
                      return (
                        <DropdownMenuItem
                          key={getId(option)}
                          onSelect={(e) => {
                            e.preventDefault();
                            handleSelect(option);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              e.stopPropagation();
                            else
                              handleOptionKeyDown(
                                e as unknown as React.KeyboardEvent<HTMLButtonElement>,
                                option
                              );
                          }}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 py-2",
                            selected && "bg-accent"
                          )}
                          data-testid="dropdown-autocomplete-option"
                        >
                          {selected ? (
                            <CheckIcon className="h-4 w-4 shrink-0 opacity-100" />
                          ) : (
                            <span className="h-4 w-4 shrink-0" aria-hidden />
                          )}
                          <span className="truncate" title={getLabel(option)}>
                            {getLabel(option)}
                          </span>
                        </DropdownMenuItem>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </DropdownMenuContent>
          )}
        </DropdownMenu>
      )}
    </div>
  );
};

export default AutoComplete;
