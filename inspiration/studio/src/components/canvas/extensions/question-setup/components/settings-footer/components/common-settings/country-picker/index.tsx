import { useState, useEffect, useMemo } from "react";
import type { TCountryDetails } from "@oute/oute-ds.core.constants/countries-list";
import { countries } from "@oute/oute-ds.core.constants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { icons } from "@/components/icons";
import { COUNTRY_SELECTION_FOR } from "../../../constants/constants";

const ChevronDown = icons.chevronDown;

type TCountryOption = TCountryDetails | { countryCode: "ALL"; countryName: string };

type TCountryPickerProps = {
  options?: TCountryDetails[];
  value: any;
  onChange: (value: TCountryDetails | string[] | any) => void;
  multiple: boolean;
  includeAll?: any;
  type?: string;
  dataTestId?: string;
  openListOnInitialRender?: boolean;
};

const CountryPicker = ({
  options: optionsFromProp,
  value,
  multiple,
  onChange,
  includeAll = false,
  dataTestId,
  type = COUNTRY_SELECTION_FOR.ZIPCODE,
  openListOnInitialRender = false,
}: TCountryPickerProps) => {
  const [open, setOpen] = useState(openListOnInitialRender);
  const [searchValue, setSearchValue] = useState("");

  const getOptions = () => {
    if (optionsFromProp?.length > 0) {
      const optionCountries = optionsFromProp?.map(
        (option: any) => option?.countryCode
      );
      const countriesList = Object.values(countries)?.filter((country: any) =>
        optionCountries?.includes(country?.countryCode)
      );
      return countriesList;
    }
    return Object.values(countries);
  };

  const options = getOptions();
  const rawValueArray = multiple ? (Array.isArray(value) ? value : [value]) : [];
  // Filter out invalid entries to ensure we only work with valid countries
  const valueArray = rawValueArray.filter(
    (item) => item && item?.countryCode && typeof item?.countryCode === "string"
  );
  const isSelectedAll = multiple && options?.length === valueArray?.length;

  const autocompleteOptions = useMemo((): TCountryOption[] => {
    const baseOptions: TCountryOption[] = multiple && includeAll
      ? [{ countryCode: "ALL", countryName: "Select All" }, ...options]
      : options;

    if (!searchValue) return baseOptions;

    const searchLower = searchValue.toLowerCase();
    return baseOptions.filter((option) =>
      option?.countryName?.toLowerCase().includes(searchLower)
    );
  }, [options, multiple, includeAll, searchValue]);

  const handleSelect = (option: TCountryOption) => {
    if (multiple) {
      if (option?.countryCode === "ALL") {
        if (isSelectedAll) {
          onChange([]);
        } else {
          onChange(options);
        }
      } else {
        const valueArray = Array.isArray(value) ? value : [];
        const isSelected = valueArray.some(
          (item) => item?.countryCode === option?.countryCode
        );

        if (isSelected) {
          onChange(valueArray.filter((item) => item?.countryCode !== option?.countryCode));
        } else {
          onChange([...valueArray, option as TCountryDetails]);
        }
      }
    } else {
      if (option?.countryCode !== "ALL") {
        onChange(option as TCountryDetails);
        setOpen(false);
      }
    }
  };

  const isOptionSelected = (option: TCountryOption) => {
    if (multiple) {
      if (option?.countryCode === "ALL") {
        return isSelectedAll;
      }
      return valueArray.some(
        (item) => item?.countryCode === option?.countryCode
      );
    }
    return value?.countryCode === option?.countryCode;
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (isSelectedAll) {
        return "All";
      }
      if (valueArray.length === 0) {
        return "Select...";
      }
      if (valueArray.length === 1) {
        return valueArray[0]?.countryName || "Select...";
      }
      return `${valueArray[0]?.countryName} +${valueArray.length - 1}`;
    }
    return value?.countryName || "Select...";
  };

  const truncateCountryName = (name: string, maxLength = 15) => {
    if (!name) return "";
    return name.length > maxLength
      ? `${name.substring(0, maxLength)}...`
      : name;
  };

  useEffect(() => {
    if (openListOnInitialRender && open) {
      const inputElement = document.querySelector(
        '[data-testid="country-picker-search"]'
      ) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [open, openListOnInitialRender]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          data-testid={dataTestId}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {multiple && valueArray.length > 0 && !isSelectedAll && valueArray[0]?.countryCode ? (
              <div className="flex items-center gap-1 flex-wrap min-w-0">
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <img
                    loading="lazy"
                    width="15"
                    height="15"
                    srcSet={`https://ccc.oute.app/country-flags/${valueArray[0]?.countryCode}.svg 2x`}
                    src={`https://ccc.oute.app/country-flags/${valueArray[0]?.countryCode}.svg`}
                    alt=""
                  />
                  {truncateCountryName(
                    valueArray[0]?.countryName ||
                      countries[valueArray[0]?.countryCode]?.countryName ||
                      ""
                  )}
                </Badge>
                {valueArray.length > 1 && (
                  <span className="text-sm">+{valueArray.length - 1}</span>
                )}
              </div>
            ) : !multiple && value?.countryCode ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  loading="lazy"
                  width="20"
                  srcSet={`https://ccc.oute.app/country-flags/${value?.countryCode}.svg 2x`}
                  src={`https://ccc.oute.app/country-flags/${value?.countryCode}.svg`}
                  alt=""
                />
                <span className="truncate">
                  {value?.countryName || countries[value?.countryCode]?.countryName || ""}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground">{getDisplayValue()}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-60 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={searchValue}
            onValueChange={setSearchValue}
            data-testid="country-picker-search"
          />
          <CommandList>
            <CommandEmpty>No countries found.</CommandEmpty>
            <CommandGroup>
              {autocompleteOptions.map((option) => {
                const selected = isOptionSelected(option);
                return (
                  <CommandItem
                    key={option?.countryCode}
                    value={option?.countryCode}
                    onSelect={() => handleSelect(option)}
                    data-testid="settings-country-picker-option"
                  >
                    {multiple && (
                      <Checkbox checked={selected} className="mr-2" />
                    )}
                    {option?.countryCode !== "ALL" && (
                      <img
                        loading="lazy"
                        width="20"
                        srcSet={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg 2x`}
                        src={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg`}
                        alt=""
                      />
                    )}
                    <span className="flex-1">{option?.countryName}</span>
                    {type === COUNTRY_SELECTION_FOR.PHONE && option?.countryCode !== "ALL" && (
                      <span>+{(option as TCountryDetails)?.countryNumber}</span>
                    )}
                    {type === COUNTRY_SELECTION_FOR.CURRENCY && option?.countryCode !== "ALL" && (
                      <span>{(option as TCountryDetails)?.currencySymbol}</span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryPicker;
