import React, { forwardRef, useState, useMemo, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger,  } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,  } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

const ODSAutocomplete = forwardRef(
  (
    {
      textFieldProps = {},
      searchable = false,
      hideBorders = false,
      variant = "default",
      options = [],
      value,
      onChange,
      getOptionLabel,
      renderOption,
      fullWidth,
      disableCloseOnSelect,
      disableClearable,
      freeSolo,
      groupBy,
      loading,
      loadingText = "Loading...",
      noOptionsText = "No options",
      openOnFocus,
      autoHighlight,
      autoSelect,
      clearOnBlur,
      clearOnEscape,
      size,
      className,
      disabled,
      placeholder,
      sx, // MUI sx prop - converted to inline styles
      style, // inline style prop
      multiple = false,
      isOptionEqualToValue,
      renderTags,
      filterOptions, // custom filter function
      open: controlledOpen, // external open control
      disablePortal, // for inline rendering
      slotProps = {}, // styling for paper, listbox, etc.
      ListboxProps = {}, // legacy MUI prop for listbox styling
      onFocus,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    
    // Support both controlled and uncontrolled open state
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (newOpen) => {
      if (!isControlled) {
        setInternalOpen(newOpen);
      }
    };
    
    // Determine if we should render inline (no popover) based on disablePortal or controlled mode
    const shouldRenderInline = disablePortal === true || (isControlled && open);

    const comboboxOptions = useMemo(() => {
      return options.map((option, index) => ({
        value: option.value ?? option.id ?? index,
        label: getOptionLabel
          ? getOptionLabel(option)
          : option.label || option.name || String(option),
        option,
      }));
    }, [options, getOptionLabel]);

    const filteredOptions = useMemo(() => {
      // If custom filterOptions is provided, use it
      if (filterOptions) {
        const filtered = filterOptions(options, { inputValue });
        return filtered.map((option, index) => {
          // Try to find existing comboboxOption using isOptionEqualToValue if provided
          const existing = comboboxOptions.find((o) => {
            if (isOptionEqualToValue) {
              return isOptionEqualToValue(o.option, option);
            }
            // Fallback comparison
            return o.option === option || 
                   o.option?.countryCode === option?.countryCode ||
                   o.option?.id === option?.id;
          });
          return existing || {
            value: option.value ?? option.id ?? option?.countryCode ?? index,
            label: getOptionLabel
              ? getOptionLabel(option)
              : option.label || option.name || option?.countryName || String(option),
            option,
          };
        });
      }
      // Default filtering behavior
      if (!searchable || !inputValue) return comboboxOptions;
      return comboboxOptions.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      );
    }, [comboboxOptions, inputValue, searchable, filterOptions, options, getOptionLabel, isOptionEqualToValue]);

    // Handle value matching for both single and multiple modes
    const isOptionSelected = useMemo(() => {
      if (multiple) {
        const valueArray = Array.isArray(value) ? value : [];
        return (opt) => {
          if (isOptionEqualToValue) {
            return valueArray.some((val) => isOptionEqualToValue(opt.option, val));
          }
          // Default comparison
          return valueArray.some((val) => {
            if (typeof opt.option === "object" && typeof val === "object") {
              return opt.option?.countryCode === val?.countryCode ||
                     opt.option?.id === val?.id ||
                     opt.option === val;
            }
            return opt.value === val || opt.option === val;
          });
        };
      } else {
        return (opt) => {
          if (isOptionEqualToValue && value) {
            return isOptionEqualToValue(opt.option, value);
          }
          // Default comparison
          if (typeof opt.option === "object" && typeof value === "object") {
            return opt.option?.countryCode === value?.countryCode ||
                   opt.option?.id === value?.id ||
                   opt.option === value;
          }
          return opt.value === value || opt.option === value;
        };
      }
    }, [multiple, value, isOptionEqualToValue]);

    const selectedOption = multiple ? null : comboboxOptions.find((opt) => isOptionSelected(opt));
    const selectedOptions = multiple 
      ? comboboxOptions.filter((opt) => isOptionSelected(opt))
      : [];

    const handleSelect = (optionValue) => {
      const comboboxOpt = comboboxOptions.find(
        (opt) => String(opt.value) === String(optionValue)
      );
      const option = comboboxOpt?.option || options.find(
        (opt) => String(opt.value ?? opt.id) === String(optionValue)
      );
      
      if (onChange) {
        if (multiple) {
          const valueArray = Array.isArray(value) ? value : [];
          const isAlreadySelected = isOptionSelected(comboboxOpt);
          
          let newValue;
          if (isAlreadySelected) {
            // Remove from selection
            if (isOptionEqualToValue) {
              newValue = valueArray.filter((val) => !isOptionEqualToValue(option, val));
            } else {
              newValue = valueArray.filter((val) => {
                if (typeof option === "object" && typeof val === "object") {
                  return option?.countryCode !== val?.countryCode &&
                         option?.id !== val?.id &&
                         option !== val;
                }
                return option !== val;
              });
            }
          } else {
            // Add to selection
            newValue = [...valueArray, option];
          }
          
          const syntheticEvent = {
            target: { value: newValue },
            type: "change",
            preventDefault: () => {},
            stopPropagation: () => {},
          };
          onChange(syntheticEvent, newValue, "selectOption", { option });
        } else {
          const syntheticEvent = {
            target: { value: option },
            type: "change",
            preventDefault: () => {},
            stopPropagation: () => {},
          };
          onChange(syntheticEvent, option, "selectOption", { option });
        }
      }
      if (!disableCloseOnSelect) {
        setOpen(false);
      }
      setInputValue("");
    };

    const handleClear = (e, optionToRemove) => {
      e.stopPropagation();
      e.preventDefault();
      if (multiple && optionToRemove) {
        const valueArray = Array.isArray(value) ? value : [];
        const newValue = valueArray.filter((val) => {
          if (isOptionEqualToValue) {
            return !isOptionEqualToValue(optionToRemove, val);
          }
          return val !== optionToRemove && 
                 (typeof val === "object" && typeof optionToRemove === "object"
                   ? val?.countryCode !== optionToRemove?.countryCode
                   : true);
        });
        const syntheticEvent = {
          target: { value: newValue },
          type: "change",
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        onChange?.(syntheticEvent, newValue, "removeOption", { option: optionToRemove });
      } else if (!multiple) {
        const syntheticEvent = {
          target: { value: null },
          type: "change",
          preventDefault: () => {},
          stopPropagation: () => {},
        };
        onChange?.(syntheticEvent, null, "clear", {});
      }
    };

    const effectiveSize = size || textFieldProps?.size || "medium";
    const isSmall = effectiveSize === "small";
    const isBlackVariant = variant === "black";

    // Merge slotProps and ListboxProps styles
    const paperStyle = slotProps?.paper?.style || {};
    const listboxStyle = ListboxProps?.style || slotProps?.listbox?.style || {};
    const listboxTestId = ListboxProps?.["data-testid"] || "ods-autocomplete-listbox";

    // Handle focus event
    const handleFocus = (e) => {
      if (onFocus) {
        onFocus(e);
      }
    };

    // Inline/embedded mode: when disablePortal is true or when controlled externally and open
    // This renders without a popover trigger - just the content inline
    if (shouldRenderInline) {
      return (
        <div 
          ref={ref}
          className={cn("w-full", className)}
          style={{ ...style, ...sx }}
          data-testid="ods-autocomplete-inline"
          {...props}
        >
          <Command shouldFilter={false} className="w-full">
            {searchable && (
              <div 
                className={cn(
                  "flex items-center w-full",
                  "border-b border-gray-200"
                )}
                style={textFieldProps?.sx || {}}
              >
                {textFieldProps?.InputProps?.startAdornment && (
                  <div className="shrink-0 pl-3">
                    {textFieldProps.InputProps.startAdornment}
                  </div>
                )}
                <CommandInput
                  placeholder={textFieldProps?.placeholder || "Search..."}
                  value={inputValue}
                  onValueChange={setInputValue}
                  autoFocus={textFieldProps?.autoFocus}
                  onFocus={handleFocus}
                  className={cn(
                    "flex-1 border-0 focus:ring-0",
                    isSmall ? "h-10 text-sm" : "h-12 text-base"
                  )}
                />
              </div>
            )}
            <CommandList
              data-testid={listboxTestId}
              className={cn(
                "flex flex-col",
                !Object.keys(listboxStyle).length && "p-2 gap-1"
              )}
              style={listboxStyle}
            >
              {loading ? (
                <div className="py-3 text-center text-sm text-gray-500">
                  {loadingText}
                </div>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty className="py-3 text-center text-sm">
                  {noOptionsText}
                </CommandEmpty>
              ) : (
                <CommandGroup className="p-0" style={paperStyle}>
                  {filteredOptions.map((opt) => {
                    const isSelected = isOptionSelected(opt);
                    return (
                      <CommandItem
                        key={String(opt.value)}
                        value={String(opt.value)}
                        onSelect={() => handleSelect(opt.value)}
                        data-testid="country-input-autocomplete-option"
                        className={cn(
                          "rounded-lg cursor-pointer",
                          "transition-colors",
                          isBlackVariant
                            ? cn(
                                "hover:bg-[rgba(33,33,33,0.20)]",
                                isSelected && "bg-[#212121] text-white hover:bg-[#212121]"
                              )
                            : cn(
                                "hover:bg-blue-50",
                                isSelected && "bg-blue-50"
                              )
                        )}
                      >
                        {renderOption ? (
                          (() => {
                            const rendered = renderOption(
                              { key: opt.value, "data-testid": `option-${opt.value}` },
                              opt.option,
                              { selected: isSelected }
                            );
                            if (React.isValidElement(rendered) && rendered.type === "li") {
                              return rendered.props.children;
                            }
                            return rendered;
                          })()
                        ) : (
                          <>
                            {!isBlackVariant && (
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                            )}
                            <span className="truncate">{opt.label}</span>
                          </>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      );
    }

    // Standard popover mode
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            data-testid="ods-autocomplete"
            className={cn(
              "flex items-center justify-between bg-white text-left",
              "rounded-md border transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              fullWidth ? "w-full" : "w-64",
              isSmall
                ? "min-h-[2.25rem] px-2 py-[0.325rem] text-sm"
                : "min-h-[2.75rem] px-3 py-[0.625rem] text-base",
              hideBorders
                ? "border-transparent"
                : isBlackVariant
                ? "border-black"
                : "border-gray-300",
              disabled && "cursor-not-allowed opacity-50",
              !disabled && "hover:border-gray-400",
              isBlackVariant && !disabled && "hover:border-black",
              className,
              textFieldProps?.className
            )}
            style={sx ? (sx) : undefined}
          >
            <div className="flex-1 flex items-center gap-2 min-w-0">
              {multiple && selectedOptions.length > 0 ? (
                <div className="flex items-center gap-1 flex-wrap min-w-0">
                  {renderTags ? (
                    renderTags(
                      selectedOptions.map((opt) => opt.option),
                      (props) => props
                    )
                  ) : (
                    <>
                      {selectedOptions.length === 1 ? (
                        <span className="truncate text-sm">
                          {selectedOptions[0].label}
                        </span>
                      ) : (
                        <span className="truncate text-sm">
                          {selectedOptions[0].label} +{selectedOptions.length - 1}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    !selectedOption && "text-gray-500"
                  )}
                >
                  {selectedOption
                    ? selectedOption.label
                    : textFieldProps?.placeholder || placeholder || "Select..."}
                </span>
              )}
              {textFieldProps?.InputProps?.startAdornment && (
                <div className="shrink-0">
                  {textFieldProps.InputProps.startAdornment}
                </div>
              )}
            </div>
            {!disableClearable && ((multiple && selectedOptions.length > 0) || (!multiple && selectedOption)) && (
              <X
                className={cn(
                  "shrink-0 opacity-60 hover:opacity-100 cursor-pointer",
                  isSmall ? "h-3 w-3" : "h-4 w-4"
                )}
                onClick={(e) => handleClear(e, multiple ? undefined : selectedOption?.option)}
              />
            )}
            <ChevronDown
              className={cn(
                "shrink-0 opacity-60",
                isSmall ? "ml-1 h-4 w-4" : "ml-2 h-5 w-5"
              )}
              data-testid="ArrowDropDownIcon"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-0 mt-[0.38rem]",
            "rounded-[0.375rem]",
            "border-[0.75px] border-[#CFD8DC]",
            "shadow-[0px_4px_6px_rgba(0,0,0,0.1)]",
            fullWidth ? "w-[var(--radix-popover-trigger-width)]" : "w-64"
          )}
          align="start"
          sideOffset={0}
          style={paperStyle}
        >
          <Command shouldFilter={false}>
            {searchable && (
              <CommandInput
                placeholder={textFieldProps?.placeholder || "Search..."}
                value={inputValue}
                onValueChange={setInputValue}
                className="border-b"
                autoFocus={textFieldProps?.autoFocus}
              />
            )}
            <CommandList
              data-testid={listboxTestId}
              className={cn(
                "flex flex-col",
                !Object.keys(listboxStyle).length && "p-[0.375rem] gap-[0.375rem]"
              )}
              style={listboxStyle}
            >
              {loading ? (
                <div className="py-3 text-center text-sm text-gray-500">
                  {loadingText}
                </div>
              ) : filteredOptions.length === 0 ? (
                <CommandEmpty className="py-3 text-center text-sm">
                  {noOptionsText}
                </CommandEmpty>
              ) : (
                <CommandGroup className="p-0">
                  {filteredOptions.map((opt) => {
                    const isSelected = isOptionSelected(opt);
                    return (
                      <CommandItem
                        key={String(opt.value)}
                        value={String(opt.value)}
                        onSelect={() => handleSelect(opt.value)}
                        className={cn(
                          "min-h-[3rem] rounded-[0.375rem] px-[0.75rem] py-[0.75rem] cursor-pointer",
                          "transition-colors",
                          isBlackVariant
                            ? cn(
                                "hover:bg-[rgba(33,33,33,0.20)]",
                                isSelected && "bg-[#212121] text-white hover:bg-[#212121]"
                              )
                            : cn(
                                "hover:bg-gray-100",
                                isSelected && "bg-gray-100"
                              )
                        )}
                      >
                        {renderOption ? (
                          (() => {
                            const rendered = renderOption(
                              { key: opt.value, "data-testid": `option-${opt.value}` },
                              opt.option,
                              { selected: isSelected }
                            );
                            // If renderOption returns a <li>, extract its children
                            if (React.isValidElement(rendered) && rendered.type === "li") {
                              return rendered.props.children;
                            }
                            return rendered;
                          })()
                        ) : (
                          <>
                            {!isBlackVariant && (
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                            )}
                            <span className="truncate">{opt.label}</span>
                          </>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

ODSAutocomplete.displayName = "ODSAutocomplete";

export default ODSAutocomplete;
