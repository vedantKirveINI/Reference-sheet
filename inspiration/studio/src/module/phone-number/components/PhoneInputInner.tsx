import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { countries, getCountryFlagUrl } from "@src/module/constants";
import InputMask from "react-input-mask";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  getPhoneCountryDetailsContainerStyles,
  getPhoneCountryFlagImageStyles,
  getPhoneCountryNumberDisplayStyles,
} from "./phone-details-styles";
import { icons } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PhoneInputInnerProps {
  theme?: any;
  disableInput?: boolean;
  disableCountrySelection?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  isCreator?: boolean;
  isPreview?: boolean;
  onChange: (value: any, e?: any) => void;
  isInputValid?: boolean;
  viewPort?: string;
  value?: any;
  onFocus?: (e: any) => void;
  countryList?: any;
  onDropdownOpenChange?: (open: boolean) => void;
  isMobileFullScreen?: boolean;
}

const Check = icons.check;
const ChevronDown = icons.chevronDown;
const ArrowLeft = icons.arrowLeft;

/**
 * Phone input inner: country selector (shadcn DropdownMenu) + phone input (InputMask).
 * Same data-testid as currency/zip for useEnterKeyPress (country-input-autocomplete, etc.).
 */
export const PhoneInputInner = ({
  theme,
  disableInput,
  disableCountrySelection,
  placeholder,
  autoFocus,
  isCreator,
  isPreview: _isPreview = false,
  onChange,
  isInputValid,
  viewPort,
  value,
  onFocus,
  countryList,
  onDropdownOpenChange,
  isMobileFullScreen = false,
}: PhoneInputInnerProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [contentWidth, setContentWidth] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const openedAtRef = useRef<number>(0);
  const closedAtRef = useRef<number>(0);
  const GRACE_MS = 800;
  const CLOSE_IGNORE_MS = 300;

  const isWithinGracePeriod = () =>
    openedAtRef.current > 0 && Date.now() - openedAtRef.current < GRACE_MS;

  const isWithinCloseIgnoreWindow = () =>
    closedAtRef.current > 0 && Date.now() - closedAtRef.current < CLOSE_IGNORE_MS;

  useEffect(() => {
    if (!open) {
      setContentWidth(null);
      return;
    }
    if (isMobileFullScreen) {
      setContentWidth(typeof window !== "undefined" ? window.innerWidth : 400);
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const parent = el.parentElement;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      let w = rect.width;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const spaceToParentRight = parentRect.right - rect.left;
        w = Math.min(w, Math.max(0, parentRect.width), Math.max(0, spaceToParentRight));
      }
      if (typeof window !== "undefined") {
        w = Math.min(w, Math.max(0, window.innerWidth - rect.left));
      }
      if (viewPort === "MOBILE") {
        const MOBILE_MAX_PX = 390;
        w = Math.min(w, MOBILE_MAX_PX);
      }
      setContentWidth(w);
    };
    let raf2: number;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(measure);
    });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (parent) ro.observe(parent);
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2 != null) cancelAnimationFrame(raf2);
      ro.disconnect();
    };
  }, [open, isMobileFullScreen, viewPort]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 220);
    return () => window.clearTimeout(id);
  }, [open]);

  const filteredCountriesData = useMemo(() => {
    if (countryList?.length > 0) {
      return countryList.reduce((acc: any, curr: any) => {
        acc[curr?.countryCode] = countries[curr?.countryCode];
        return acc;
      }, {});
    }
    return {};
  }, [countryList]);

  const options = useMemo(() => {
    const data =
      Object.keys(filteredCountriesData).length > 0
        ? filteredCountriesData
        : countries;
    return Object.values(data);
  }, [filteredCountriesData]);

  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) return options;
    const searchLower = searchValue.toLowerCase().trim();
    const term = searchLower.startsWith("+") ? searchLower.slice(1) : searchLower;
    const termRaw = searchValue.trim();
    return options.filter((option: any) => {
      const countryName = option?.countryName?.toLowerCase();
      const countryCode = option?.countryCode?.toLowerCase();
      const countryNumber = option?.countryNumber?.toLowerCase() ?? "";
      return (
        countryName?.includes(term) ||
        countryCode?.includes(term) ||
        countryCode?.includes(termRaw) ||
        countryNumber?.includes(term)
      );
    });
  }, [options, searchValue]);

  useEffect(() => {
    if (!value) {
      const us = (countries as any).US;
      onChange({
        phoneNumber: null,
        countryCode: "US",
        countryNumber: us?.countryNumber ?? "1",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- set default once on mount
  }, []);

  const handleInputChange = (e: any) => {
    if (isCreator) {
      onChange(e.target.value);
      return;
    }
    let phoneNumber = e.target.value?.replace(/-()/g, "");
    if (phoneNumber) {
      phoneNumber = parseInt(phoneNumber);
    }
    onChange({ ...value, phoneNumber: phoneNumber || null }, e);
  };

  const getMenuItems = () => {
    const list = listRef.current;
    if (!list) return [];
    return Array.from(list.querySelectorAll<HTMLElement>("[role=\"menuitem\"]"));
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
      handleCountrySelect(option);
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

  const handleCountrySelect = (option: any) => {
    if (isWithinGracePeriod()) return;
    if (isWithinCloseIgnoreWindow()) return;
    onChange({
      ...value,
      countryCode: option.countryCode,
      countryNumber: option.countryNumber,
    });
    setOpen(false);
    onDropdownOpenChange?.(false);
  };

  const phonePattern = (countries as any)[value?.countryCode]?.pattern;
  const mask = isCreator || !phonePattern ? null : phonePattern;

  const inputStyle = theme?.styles
    ? {
        ["--button-color" as string]: theme.styles.buttons,
        ["--font-family" as string]: theme.styles.fontFamily || "Helvetica Neue",
        ["--border-color" as string]: isInputValid
          ? theme.styles.buttons
          : "#C83C3C",
        ["--font-color-creator" as string]: theme.styles.buttons + "B3",
      }
    : undefined;

  const triggerDisabled = disableInput || disableCountrySelection;

  return (
    <div
      ref={containerRef}
      className="grid h-full w-full min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-[0.75em] self-stretch"
    >
      <DropdownMenu
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen && triggerDisabled) return;
          if (nextOpen) {
            openedAtRef.current = Date.now();
            closedAtRef.current = 0;
          } else {
            if (isWithinGracePeriod()) return;
            closedAtRef.current = Date.now();
          }
          setOpen(nextOpen);
          onDropdownOpenChange?.(nextOpen);
        }}
      >
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={triggerDisabled}
            className={cn(
              "min-w-0 shrink-0 flex items-center cursor-pointer border-0 bg-transparent outline-none focus-visible:ring-0 disabled:cursor-default",
              getPhoneCountryDetailsContainerStyles({
                disabled: triggerDisabled,
                theme,
                viewPort,
              }).className
            )}
            style={
              getPhoneCountryDetailsContainerStyles({
                disabled: triggerDisabled,
                theme,
                viewPort,
              }).style
            }
            data-testid="country-details-for-PHONE"
          >
            <img
              className={getPhoneCountryFlagImageStyles(viewPort)}
              src={getCountryFlagUrl(countries[value?.countryCode]?.countryCode)}
              alt={countries[value?.countryCode]?.countryCode}
              data-testid="country-flag-for-PHONE"
            />
            <span
              className={getPhoneCountryNumberDisplayStyles(theme, viewPort).className}
              style={getPhoneCountryNumberDisplayStyles(theme, viewPort).style}
            >
              +{countries[value?.countryCode]?.countryNumber}
            </span>
            {!triggerDisabled && (
              <ChevronDown
                className="h-4 w-4 shrink-0 opacity-70"
                data-testid="country-input-dropdown-icon"
              />
            )}
          </button>
        </DropdownMenuTrigger>
        {isMobileFullScreen && viewPort === "MOBILE" && open &&
          (() => {
            let portalContainer: HTMLElement | null = null;
            let node: HTMLElement | null = containerRef.current;
            while (node) {
              if (node.getAttribute?.("data-testid") === "question-filler-root") {
                portalContainer = node;
                break;
              }
              node = node.parentElement;
            }
            return createPortal(
              <div
                className="absolute inset-0 z-[9999] flex h-full w-full flex-col bg-background text-[clamp(11px,2.8vw,13px)]"
                role="dialog"
                aria-modal="true"
                aria-label="Select country"
                data-testid="country-input-autocomplete"
              >
              <div className="sticky top-0 z-10 flex shrink-0 items-center gap-2 rounded-t-xl border-b border-border bg-muted/80 px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onDropdownOpenChange?.(false);
                  }}
                  className="-ml-1 shrink-0 rounded-md p-1.5 text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close"
                  data-testid="country-picker-back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Input
                  ref={searchInputRef}
                  placeholder="Search countries"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="h-9 flex-1 min-w-0 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                  data-testid="country-picker-search"
                />
              </div>
              <div
                ref={listRef}
                className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-2"
                data-testid="country-autocomplete-listbox"
              >
                {filteredOptions.length === 0 ? (
                  <div className="py-[1.5em] text-center text-[0.875em] text-muted-foreground">
                    No countries found.
                  </div>
                ) : (
                  filteredOptions.map((option: any) => (
                    <button
                      key={option?.countryCode}
                      type="button"
                      role="menuitem"
                      onClick={() => handleCountrySelect(option)}
                      onKeyDown={(e) => handleOptionKeyDown(e, option)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-[0.5em] rounded-sm py-[0.5em] px-2 text-left outline-none transition-colors focus:bg-accent hover:bg-accent/80",
                        value?.countryCode === option?.countryCode && "bg-accent"
                      )}
                      data-testid="country-input-autocomplete-option"
                    >
                      {value?.countryCode === option?.countryCode ? (
                        <Check className="h-[1em] w-[1em] shrink-0 opacity-100" />
                      ) : (
                        <span className="h-[1em] w-[1em] shrink-0" aria-hidden />
                      )}
                      <img
                        loading="lazy"
                        width={24}
                        height={18}
                        className="h-[1.125em] w-[2.375em] shrink-0 object-cover"
                        src={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg`}
                        alt=""
                      />
                      <span className="text-[0.875em]">({option?.countryCode})</span>
                      <span className="min-w-0 flex-1 truncate text-[0.875em]">
                        {option?.countryName}
                      </span>
                      <span className="ml-[0.25em] shrink-0 text-[0.875em]">
                        +{option?.countryNumber}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>,
              portalContainer ?? document.body
            );
          })()}
        {(!isMobileFullScreen || viewPort !== "MOBILE") && (
          <DropdownMenuContent
            align="start"
            className={cn(
              "z-[9999] min-w-0 overflow-x-hidden p-0 flex flex-col box-border",
              viewPort === "MOBILE"
                ? "min-h-0 text-[clamp(11px,2.8vw,13px)] overflow-y-hidden"
                : "max-h-[min(20rem,var(--radix-dropdown-menu-content-available-height))]"
            )}
            style={
              open && contentWidth != null
                ? {
                    width: contentWidth,
                    maxWidth: viewPort === "MOBILE" ? Math.min(contentWidth, 390) : contentWidth,
                  }
                : undefined
            }
            onPointerDownOutside={(e) => {
              if (isWithinGracePeriod()) e.preventDefault();
            }}
            onInteractOutside={(e) => {
              if (isWithinGracePeriod()) e.preventDefault();
            }}
            data-testid="country-input-autocomplete"
          >
            <div
              className={cn(
                "sticky top-0 z-10 min-w-0 shrink-0 border-b bg-popover flex items-center gap-2",
                viewPort === "MOBILE" ? "p-[0.25em]" : "p-1"
              )}
            >
              <Input
                ref={searchInputRef}
                placeholder="Search countries"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className={cn(
                  "border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1 min-w-0",
                  viewPort === "MOBILE" ? "h-[2em]" : "h-8"
                )}
                data-testid="country-picker-search"
              />
            </div>
            <div
              ref={listRef}
              className={cn(
                "min-w-0 overflow-x-hidden overflow-y-auto flex-1 min-h-0",
                viewPort === "MOBILE"
                  ? "p-[0.25em]"
                  : "max-h-[min(16rem,var(--radix-dropdown-menu-content-available-height))] p-1"
              )}
              data-testid="country-autocomplete-listbox"
            >
              {filteredOptions.length === 0 ? (
                <div
                  className={cn(
                    "text-center text-muted-foreground",
                    viewPort === "MOBILE"
                      ? "py-[1.5em] text-[0.875em]"
                      : "py-6 text-sm"
                  )}
                >
                  No countries found.
                </div>
              ) : (
                filteredOptions.map((option: any) => (
                  <DropdownMenuItem
                    key={option?.countryCode}
                    onSelect={() => handleCountrySelect(option)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") e.stopPropagation();
                      else handleOptionKeyDown(e as unknown as React.KeyboardEvent<HTMLButtonElement>, option);
                    }}
                    className={cn(
                      "flex cursor-pointer items-center",
                      viewPort === "MOBILE"
                        ? "gap-[0.5em] py-[0.5em]"
                        : "gap-2 py-2",
                      value?.countryCode === option?.countryCode && "bg-accent"
                    )}
                    data-testid="country-input-autocomplete-option"
                  >
                    {value?.countryCode === option?.countryCode ? (
                      <Check
                        className={cn(
                          "shrink-0 opacity-100",
                          viewPort === "MOBILE" ? "h-[1em] w-[1em]" : "h-4 w-4"
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "shrink-0",
                          viewPort === "MOBILE" ? "h-[1em] w-[1em]" : "h-4 w-4"
                        )}
                        aria-hidden
                      />
                    )}
                    <img
                      loading="lazy"
                      width={24}
                      height={18}
                      className={cn(
                        "shrink-0 object-cover",
                        viewPort === "MOBILE"
                          ? "h-[1.125em] w-[2.375em]"
                          : "h-[1.125rem] w-[2.375rem]"
                      )}
                      src={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg`}
                      alt=""
                    />
                    <span
                      className={
                        viewPort === "MOBILE" ? "text-[0.875em]" : "text-sm"
                      }
                    >
                      ({option?.countryCode})
                    </span>
                    <span
                      className={cn(
                        "flex-1 truncate",
                        viewPort === "MOBILE" ? "text-[0.875em]" : "text-sm"
                      )}
                    >
                      {option?.countryName}
                    </span>
                    <span
                      className={cn(
                        "shrink-0",
                        viewPort === "MOBILE"
                          ? "ml-[0.25em] text-[0.875em]"
                          : "ml-1 text-sm"
                      )}
                    >
                      +{option?.countryNumber}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </div>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
      <div
        className="flex h-full min-w-0 overflow-hidden"
        data-testid="phone-number-input-container"
      >
        <InputMask
          type={isCreator ? "text" : "tel"}
          autoFocus={autoFocus}
          placeholder={placeholder || (countries as any)[value?.countryCode]?.pattern}
          mask={mask}
          value={isCreator ? (placeholder ?? "") : (value?.phoneNumber ?? "")}
          onChange={handleInputChange}
          onFocus={(e) => onFocus?.(e)}
          maskChar={null}
          disabled={disableInput}
          className={cn(
            "flex h-full w-full rounded-none border-0 border-b bg-transparent px-3 py-2 text-[1.25em] shadow-none outline-none focus-visible:ring-0 focus-visible:shadow-[inset_0_-2px_0_0_var(--border-color)] disabled:cursor-not-allowed disabled:opacity-50",
            "placeholder:opacity-60 placeholder:text-current md:text-[1.25em] text-base",
            viewPort === "CREATOR_DESKTOP" && "text-[0.9em] md:text-[1em]",
            isCreator && "text-[var(--font-color-creator)] opacity-60"
          )}
          style={{
            ...inputStyle,
            borderBottomColor: inputStyle
              ? (inputStyle["--border-color"] as string)
              : undefined,
            color: inputStyle
              ? (inputStyle["--button-color"] as string)
              : undefined,
            fontFamily: inputStyle
              ? (inputStyle["--font-family"] as string)
              : undefined,
          }}
          data-testid="phone-number-input"
        />
      </div>
    </div>
  );
};
