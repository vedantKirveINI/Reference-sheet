import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

interface DropdownV2Props {
  label?: string;
  value: any;
  options: any[];
  onChange?: (value: any) => void;
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  selectOnFocus?: boolean;
  getOptionLabel?: (option: any) => string;
  variant?: string;
  placeholder?: string;
  renderTagKey?: string;
  multiple?: boolean;
  searchable?: boolean;
  renderOption?: (props: any, option: any, state: any) => React.ReactNode;
  disableCloseOnSelect?: boolean;
  clearOnEscape?: boolean;
  disableClearable?: boolean;
  maxChipLength?: number;
  dataTestId?: string;
  [key: string]: any;
}

export const DropdownV2 = ({
  label,
  value,
  options = [],
  onChange,
  isOptionEqualToValue,
  selectOnFocus = true,
  getOptionLabel,
  variant,
  placeholder = "Select option...",
  multiple = false,
  searchable = false,
  renderTagKey,
  renderOption,
  disableCloseOnSelect = false,
  clearOnEscape = false,
  disableClearable = false,
  maxChipLength = 12,
  dataTestId = "settings-default-value-container",
  ...rest
}: DropdownV2Props) => {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Helper to get option label
  const getLabel = (option: any): string => {
    if (getOptionLabel) {
      return getOptionLabel(option);
    }
    if (typeof option === "object" && option !== null) {
      return option.label || option.name || option.value || String(option);
    }
    return String(option);
  };

  // Helper to get option value for comparison
  const getOptionValue = (option: any): any => {
    if (typeof option === "object" && option !== null) {
      return option.value !== undefined ? option.value : option;
    }
    return option;
  };

  // Helper to check if option equals value
  const isEqual = (option: any, val: any): boolean => {
    if (isOptionEqualToValue) {
      return isOptionEqualToValue(option, val);
    }
    // For objects, compare by value property if it exists
    if (typeof option === "object" && typeof val === "object" && option !== null && val !== null) {
      const optionVal = getOptionValue(option);
      const valVal = getOptionValue(val);
      return optionVal === valVal || option === val;
    }
    return option === val;
  };

  // Check if value is selected
  const isSelected = (option: any): boolean => {
    if (multiple) {
      if (!Array.isArray(value)) return false;
      return value.some((v) => isEqual(option, v));
    }
    if (!value && value !== 0 && value !== false) return false;
    return isEqual(option, value);
  };

  // Handle option selection
  const handleSelect = (option: any) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const isAlreadySelected = currentValue.some((v) => isEqual(option, v));
      
      let newValue: any[];
      if (isAlreadySelected) {
        // Remove if already selected
        newValue = currentValue.filter((v) => !isEqual(option, v));
      } else {
        // Add to selection
        newValue = [...currentValue, option];
      }
      
      onChange?.(newValue);
      
      if (!disableCloseOnSelect && newValue.length === 0) {
        setOpen(false);
      }
    } else {
      onChange?.(option);
      if (!disableCloseOnSelect) {
        setOpen(false);
      }
    }
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (multiple) {
      onChange?.([]);
    } else {
      onChange?.(null);
    }
  };

  // Truncate text for chips
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Get display value for trigger
  const getDisplayValue = (): string => {
    if (multiple) {
      if (!Array.isArray(value) || value.length === 0) {
        return "";
      }
      if (value.length === 1) {
        return getLabel(value[0]);
      }
      return `${getLabel(value[0])} +${value.length - 1}`;
    }
    if (!value && value !== 0 && value !== false) return "";
    // Find the matching option to get proper label
    const matchedOption = options.find((opt) => {
      if (isOptionEqualToValue) {
        return isOptionEqualToValue(opt, value);
      }
      // Direct equality check first
      if (opt === value) return true;
      // Try to match by value property, label, or other properties
      if (typeof opt === "object" && opt !== null) {
        return opt.value === value || opt.label === value || isEqual(opt, value);
      }
      // For primitive options, check if label matches
      return getLabel(opt) === String(value);
    });
    return matchedOption ? getLabel(matchedOption) : (typeof value === "string" || typeof value === "number" ? String(value) : getLabel(value));
  };

  // Render tags for multiple selection
  const renderTags = () => {
    if (!multiple || !Array.isArray(value) || value.length === 0) {
      return null;
    }

    const visible = value[0];
    const extraCount = value.length - 1;

    const getTagLabel = (option: any): string => {
      if (renderTagKey && typeof option === "object" && option !== null) {
        return String(option[renderTagKey] || getLabel(option));
      }
      return getLabel(option);
    };

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="secondary"
          className="text-xs"
          data-testid="default-value-chip"
        >
          {truncateText(getTagLabel(visible), maxChipLength)}
        </Badge>
        {extraCount > 0 && (
          <span className="text-xs text-muted-foreground">+{extraCount}</span>
        )}
      </div>
    );
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : (value !== null && value !== undefined && value !== "");

  const displayText = hasValue ? getDisplayValue() : placeholder;

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchValue) return options;
    const searchLower = searchValue.toLowerCase();
    return options.filter((option) =>
      getLabel(option).toLowerCase().includes(searchLower)
    );
  }, [options, searchValue, searchable, getOptionLabel]);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-9 rounded-[0.375em]",
              !hasValue && "text-muted-foreground"
            )}
            data-testid={dataTestId}
            {...rest}
          >
            <span className="flex-1 text-left truncate">
              {multiple && hasValue ? (
                renderTags()
              ) : (
                <span>{displayText}</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              {hasValue && !disableClearable && (
                <span
                  role="button"
                  tabIndex={-1}
                  className="inline-flex cursor-pointer rounded-sm opacity-50 hover:opacity-100 p-0.5"
                  onClick={handleClear}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  aria-label="Clear selection"
                >
                  <X className="h-4 w-4" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] max-w-[var(--radix-popover-trigger-width)] p-0 rounded-[0.375em] overflow-hidden"
          align="start"
        >
          <Command>
            {searchable && (
              <CommandInput
                placeholder="Search..."
                value={searchValue}
                onValueChange={setSearchValue}
              />
            )}
            <CommandList>
              <CommandEmpty className="py-6 text-center text-sm">
                No option found.
              </CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option, index) => {
                  const selected = isSelected(option);
                  const optionLabel = getLabel(option);

                  // Use custom rendering if provided
                  if (renderOption) {
                    const customProps: any = {
                      key: option.id || index,
                      "data-selected": selected,
                    };
                    return (
                      <CommandItem
                        key={index}
                        value={optionLabel}
                        onSelect={() => handleSelect(option)}
                        className="cursor-pointer min-w-0 whitespace-normal break-words text-wrap"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            selected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {renderOption(customProps, option, { selected })}
                      </CommandItem>
                    );
                  }

                  // Default rendering: wrap long options to dropdown width
                  return (
                    <CommandItem
                      key={index}
                      value={optionLabel}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer min-w-0 whitespace-normal break-words text-wrap"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          selected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="min-w-0 break-words">{optionLabel}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DropdownV2;
