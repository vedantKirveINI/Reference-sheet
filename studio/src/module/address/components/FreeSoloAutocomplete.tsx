import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ViewPort } from "@src/module/constants";
import { usePortalContainer } from "@/components/dialogs/form-preview-v2/context/PortalContainerContext";

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
const CheckIcon = icons.check;

export interface FreeSoloAutocompleteProps {
  options: string[];
  value?: string;
  onChange?: (e: any, selectedOption: string) => void;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** When set, wraps the input so --address-placeholder is in scope for placeholder styling */
  placeholderColor?: string;
  /** When MOBILE and in preview, use full-screen overlay attached to top (same as dropdown question type). */
  viewPort?: string;
  textFieldProps?: {
    placeholder?: string;
    inputProps?: Record<string, any>;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  slotProps?: {
    paper?: {
      style?: React.CSSProperties;
    };
  };
}

export const FreeSoloAutocomplete = React.forwardRef<
  HTMLInputElement,
  FreeSoloAutocompleteProps
>(
  (
    {
      options = [],
      value = "",
      onChange,
      searchable = false,
      placeholder = "Select or type...",
      disabled = false,
      fullWidth = true,
      className,
      style,
      placeholderColor,
      viewPort,
      textFieldProps,
      slotProps,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || "");
    const popoverContentRef = React.useRef<HTMLDivElement>(null);
    const mobileOverlayRef = React.useRef<HTMLDivElement>(null);
    const mobileListRef = React.useRef<HTMLDivElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const { isPreviewMode } = usePortalContainer();

    const getMobileMenuItems = React.useCallback(() => {
      const list = mobileListRef.current;
      if (!list) return [];
      return Array.from(
        list.querySelectorAll<HTMLElement>('[role="menuitem"]')
      );
    }, []);

    const handleMobileSearchKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      const items = getMobileMenuItems();
      if (items.length === 0) return;
      e.preventDefault();
      if (e.key === "ArrowDown") {
        items[0]?.focus();
      } else {
        items[items.length - 1]?.focus();
      }
    };

    const handleMobileOptionKeyDown = (
      e: React.KeyboardEvent<HTMLButtonElement>,
      option: string
    ) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        handleSelect(option);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const items = getMobileMenuItems();
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

    const isMobileFullScreen =
      Boolean(isPreviewMode) && viewPort === ViewPort.MOBILE;
    const overlayPortalContainer =
      isMobileFullScreen && open && containerRef.current
        ? findQuestionFillerRoot(containerRef.current)
        : null;

    // Sync inputValue with value prop
    React.useEffect(() => {
      setInputValue(value || "");
    }, [value]);

    // Focus search input after dropdown is painted so the caret is visible (no need to click)
    React.useEffect(() => {
      if (!open || !searchable) return;
      const id = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => window.clearTimeout(id);
    }, [open, searchable]);

    const filteredOptions = React.useMemo(() => {
      if (!searchable || !inputValue) return options;
      return options.filter((opt) =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
      );
    }, [options, inputValue, searchable]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Call textFieldProps.onChange if provided (for freeSolo typing)
      if (textFieldProps?.onChange) {
        textFieldProps.onChange(e);
      }
      
      // Also call main onChange if provided
      if (onChange) {
        const syntheticEvent = {
          target: { value: newValue },
          type: "change",
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        onChange(syntheticEvent, newValue);
      }
    };

    const handleSelect = (selectedValue: string) => {
      setInputValue(selectedValue);
      if (onChange) {
        const syntheticEvent = {
          target: { value: selectedValue },
          type: "change",
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        onChange(syntheticEvent, selectedValue);
      }
      setOpen(false);
    };

    const handleInputFocus = () => {
      setOpen(true);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const next = e.relatedTarget as Node | null;
      // Content can be desktop popover or mobile overlay (only one is mounted at a time)
      const contentEl =
        popoverContentRef.current ?? mobileOverlayRef.current;
      if (next && contentEl?.contains(next)) return;
      // When clicking the search bar, relatedTarget can be null while focus is moving.
      // Defer and check activeElement so we don't close when focus moved into the popover.
      const scheduleClose = () => {
        setTimeout(() => {
          const active = document.activeElement as Node | null;
          const content =
            popoverContentRef.current ?? mobileOverlayRef.current;
          if (active && content?.contains(active)) return;
          setOpen(false);
        }, 200);
      };
      if (!next) {
        requestAnimationFrame(scheduleClose);
      } else {
        scheduleClose();
      }
    };

    const isOptionSelected = (option: string) => {
      return option === value || option === inputValue;
    };

    const triggerWrapperStyle = placeholderColor
      ? { ["--address-placeholder" as string]: placeholderColor }
      : undefined;

    const handleOpenChange = React.useCallback((next: boolean) => {
      if (next) {
        setOpen(true);
        return;
      }
      // Radix calls onOpenChange(false) when trigger blurs (focus moved to content).
      // Defer so we can check activeElement after focus has settled inside the popover or mobile overlay.
      requestAnimationFrame(() => {
        const active = document.activeElement as Node | null;
        const content =
          popoverContentRef.current ?? mobileOverlayRef.current;
        if (active && content?.contains(active)) return;
        setOpen(false);
      });
    }, []);

    const desktopDropdown = (
      <PopoverContent
        ref={popoverContentRef}
        data-testid="address-autocomplete-popover"
        className={cn(
          "p-0 z-[9999] overflow-hidden flex flex-col",
          "rounded-md border bg-popover shadow-md",
          "min-w-[220px]",
          fullWidth ? "w-[var(--radix-popover-trigger-width)]" : "w-full"
        )}
        align="start"
        sideOffset={6}
        collisionPadding={16}
        avoidCollisions={true}
        style={
          fullWidth
            ? {
                ...slotProps?.paper?.style,
                minWidth: "var(--radix-popover-trigger-width)",
                width: "var(--radix-popover-trigger-width)",
                maxHeight:
                  "var(--radix-popover-content-available-height, min(70vh, 400px))",
              }
            : {
                ...slotProps?.paper?.style,
                maxHeight:
                  "var(--radix-popover-content-available-height, min(70vh, 400px))",
              }
        }
      >
        <Command
          shouldFilter={false}
          className="flex flex-col min-h-0 flex-1 overflow-hidden rounded-lg border-0"
        >
          {searchable && (
            <div className="shrink-0 border-b bg-popover">
              <CommandInput
                ref={searchInputRef}
                placeholder="Search..."
                value={inputValue}
                onValueChange={setInputValue}
                className="border-0 text-foreground caret-foreground"
              />
            </div>
          )}
          <CommandList className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden max-h-none">
            {filteredOptions.length === 0 ? (
              <CommandEmpty>No options found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const selected = isOptionSelected(option);
                  return (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={() => handleSelect(option)}
                      className={cn(
                        "cursor-pointer",
                        selected && "bg-accent"
                      )}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          selected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    );

    return (
      <div
        ref={containerRef}
        className={cn(
          "flex flex-col w-full box-border",
          isMobileFullScreen && open && "relative h-full z-[100]"
        )}
      >
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <div
              className={cn(fullWidth && "w-full", "cursor-text")}
              style={triggerWrapperStyle}
              onFocus={(e) => {
                const input = (e.currentTarget as HTMLDivElement).querySelector(
                  "input"
                );
                if (input && document.activeElement === e.currentTarget) {
                  input.focus();
                }
              }}
            >
              <Input
                ref={ref}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={textFieldProps?.placeholder || placeholder}
                disabled={disabled}
                className={cn(fullWidth && "w-full", className)}
                style={style}
                data-testid={textFieldProps?.inputProps?.["data-testid"]}
                {...textFieldProps?.inputProps}
                {...props}
              />
            </div>
          </PopoverTrigger>
          {/* Mobile preview: full-screen overlay attached to top (same as dropdown question type) */}
          {isMobileFullScreen &&
            open &&
            overlayPortalContainer &&
            (() => (
              <>
                {createPortal(
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[998] h-full w-full bg-black/20 backdrop-blur-sm"
                    data-testid="address-autocomplete-mobile-backdrop"
                  />,
                  overlayPortalContainer
                )}
                {createPortal(
                  <div
                    ref={mobileOverlayRef}
                    className="absolute inset-0 z-[9999] flex h-full w-full flex-col bg-background text-[clamp(11px,2.8vw,13px)]"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Select option"
                    data-testid="address-autocomplete-popover"
                  >
                    <div className="sticky top-0 z-10 flex shrink-0 items-center gap-2 rounded-t-xl border-b border-border bg-muted/80 px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="-ml-1 shrink-0 rounded-md p-1.5 text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Close"
                        data-testid="address-autocomplete-mobile-back-button"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      {searchable && (
                        <Input
                          ref={searchInputRef}
                          placeholder="Search..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleMobileSearchKeyDown}
                          className="h-9 flex-1 min-w-0 border-0 bg-transparent text-base text-foreground shadow-none focus-visible:ring-0 caret-foreground"
                          data-testid="address-autocomplete-search"
                        />
                      )}
                    </div>
                    <div
                      ref={mobileListRef}
                      className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2"
                      data-testid="address-autocomplete-listbox"
                    >
                      {filteredOptions.length === 0 ? (
                        <div className="py-[1.5em] text-center text-[0.875em] text-muted-foreground">
                          No options found.
                        </div>
                      ) : (
                        filteredOptions.map((option) => {
                          const selected = isOptionSelected(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              role="menuitem"
                              onClick={() => handleSelect(option)}
                              onKeyDown={(e) =>
                                handleMobileOptionKeyDown(
                                  e as React.KeyboardEvent<HTMLButtonElement>,
                                  option
                                )
                              }
                              className={cn(
                                "flex w-full cursor-pointer items-center gap-[0.5em] rounded-sm py-[0.5em] px-2 text-left outline-none transition-colors focus:bg-accent hover:bg-accent/80",
                                selected && "bg-accent"
                              )}
                              data-testid="address-autocomplete-option"
                            >
                              {selected ? (
                                <CheckIcon className="h-[1em] w-[1em] shrink-0 opacity-100" />
                              ) : (
                                <span
                                  className="h-[1em] w-[1em] shrink-0"
                                  aria-hidden
                                />
                              )}
                              <span className="min-w-0 flex-1 truncate text-[0.875em]">
                                {option}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>,
                  overlayPortalContainer
                )}
              </>
            ))()}
          {(!isMobileFullScreen || viewPort !== ViewPort.MOBILE) && desktopDropdown}
        </Popover>
      </div>
    );
  }
);

FreeSoloAutocomplete.displayName = "FreeSoloAutocomplete";
