import type React from "react";
import { useEffect, useRef } from "react";
import type { TCountryDetails } from "@oute/oute-ds.core.constants/countries-list";
import { countries, type ViewPort } from "@oute/oute-ds.core.constants";
import { ODSAutocomplete as ODSAutoComplete } from "@src/module/ods";
import { ODSCheckbox } from "@src/module/ods";
import { ODSChip as Chip } from "@src/module/ods";
import { countryPickerStyles } from "./styles";
import { COUNTRY_SELECTION_FOR, INPUT_HEIGHT,  } from "../../../constants/constants";
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
  const autocompleteRef = useRef(null);

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
  const isSelectedAll = options?.length === value?.length;

  const handleOnChange = (_e, _value, reason, selectedOption) => {
    const selectedVal = selectedOption?.option;

    if (selectedVal?.countryCode === "ALL") {
      if (isSelectedAll) {
        onChange([]);
      } else {
        onChange(options);
      }
    } else {
      // Handle individual country selection/deselection
      const newValue = _value || [];
      onChange(newValue);
    }
  };

  const autocompleteOptions =
    multiple && includeAll
      ? [{ countryCode: "ALL", countryName: "Select All" }, ...options]
      : options;

  const textFieldProps = !multiple && {
    InputProps: {
      placeholder: "Search Country",
      startAdornment: value?.countryCode ? (
        <img
          loading="lazy"
          width="20"
          srcSet={`https://ccc.oute.app/country-flags/${value?.countryCode}.svg 2x`}
          src={`https://ccc.oute.app/country-flags/${value?.countryCode}.svg`}
          alt=""
          style={{ marginRight: "8px" }}
        />
      ) : null,
    },
  };

  //  renderOption function based on multiple prop
  const renderOption = (props, option: TCountryDetails, state) => {
    if (multiple) {
      const valueArray = Array.isArray(value) ? value : [value];
      const checked =
        option?.countryCode === "ALL"
          ? isSelectedAll
          : valueArray?.some(
              (item) => item?.countryCode === option?.countryCode
            );

      return (
        <li
          {...props}
          key={option?.countryCode}
          style={countryPickerStyles?.autocomplete?.option}
          data-testid="settings-country-picker-option"
          aria-selected={checked}
        >
          <ODSCheckbox checked={checked} />
          {option?.countryCode !== "ALL" && (
            <img
              loading="lazy"
              width="20"
              srcSet={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg 2x`}
              src={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg`}
              alt=""
            />
          )}
          <span
            style={countryPickerStyles?.autocomplete?.option?.text({
              flex: 1,
            })}
          >
            {option?.countryName}
          </span>
          {type === COUNTRY_SELECTION_FOR.PHONE && (
            <span style={countryPickerStyles?.autocomplete?.option?.text()}>
              +{option?.countryNumber}
            </span>
          )}
          {type === COUNTRY_SELECTION_FOR.CURRENCY && (
            <span style={countryPickerStyles?.autocomplete?.option?.text()}>
              {option?.currencySymbol}
            </span>
          )}
        </li>
      );
    } else {
      // Single selection mode
      return (
        <li
          {...props}
          key={option?.countryCode}
          style={countryPickerStyles?.autocomplete?.option}
          data-testid="settings-country-picker-option"
        >
          <img
            loading="lazy"
            width="20"
            srcSet={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg 2x`}
            src={`https://ccc.oute.app/country-flags/${option?.countryCode}.svg`}
            alt=""
          />
          <span
            style={countryPickerStyles?.autocomplete?.option?.text({
              flex: 1,
            })}
            data-testid="country-picker-option-country-name"
          >
            {option?.countryName}
          </span>
          {type === COUNTRY_SELECTION_FOR.PHONE && (
            <span style={countryPickerStyles?.autocomplete?.option?.text()}>
              +{option?.countryNumber}
            </span>
          )}
          {type === COUNTRY_SELECTION_FOR.CURRENCY && (
            <span style={countryPickerStyles?.autocomplete?.option?.text()}>
              {option?.currencySymbol}
            </span>
          )}
        </li>
      );
    }
  };

  const renderTags = multiple
    ? (selectedOptions, getTagProps) => {
        if (!selectedOptions.length) return null;

        if (isSelectedAll) {
          return <span style={{ fontSize: "1em" }}>All</span>;
        }

        const firstOption = selectedOptions[0];
        const extraCount = selectedOptions.length - 1;

        const truncateCountryName = (name, maxLength = 15) => {
          if (!name) return "";
          return name.length > maxLength
            ? `${name.substring(0, maxLength)}...`
            : name;
        };

        return (
          <>
            <Chip
              size="small"
              
              label={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75em",
                  }}
                >
                  <img
                    loading="lazy"
                    width="15"
                    height="15"
                    srcSet={`https://ccc.oute.app/country-flags/${firstOption?.countryCode}.svg 2x`}
                    src={`https://ccc.oute.app/country-flags/${firstOption?.countryCode}.svg`}
                    alt=""
                  />
                  {truncateCountryName(
                    firstOption?.countryName ||
                      countries[firstOption?.countryCode]?.countryName ||
                      ""
                  )}
                </div>
              }
              {...getTagProps({ index: 0 })}
            />
            {extraCount > 0 && (
              //
              <span>+{extraCount}</span>
            )}
          </>
        );
      }
    : undefined;

  useEffect(() => {
    if (openListOnInitialRender && autocompleteRef.current) {
      const inputElement = autocompleteRef.current.querySelector("input");
      if (inputElement) {
        inputElement.focus();
      }
    }
  }, [openListOnInitialRender]);

  return (
    <ODSAutoComplete
      fullWidth
      searchable
      openOnFocus={openListOnInitialRender}
      options={autocompleteOptions}
      variant="black"
      ListboxProps={{ "data-testid": "country-autocomplete-listbox" }}
      
      multiple={multiple}
      disableCloseOnSelect={multiple}
      data-testid={dataTestId}
      value={value}
      textFieldProps={textFieldProps}
      getOptionLabel={(option: TCountryDetails) =>
        option?.countryName || countries[option?.countryCode]?.countryName || ""
      }
      isOptionEqualToValue={(option: TCountryDetails, value) => {
        return (
          option?.countryName === countries[value?.countryCode]?.countryName
        );
      }}
      onChange={handleOnChange}
      renderOption={renderOption}
      renderTags={renderTags}
      ref={autocompleteRef}
    />
  );
};

export default CountryPicker;
