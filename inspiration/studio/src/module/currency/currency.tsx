import { forwardRef, useEffect } from "react";
import { CurrencyCountryInput } from "./components";

interface ICurrencyDetails {
  currencyCode: string;
  currencyValue: string;
  currencySymbol: string;
  countryCode: string;
}

export type CurrencyProps = {
  value: ICurrencyDetails;
  onChange: (e) => void;
  viewPort?: string;
  placeholder?: string;
  isCreator?: boolean;
  isPreview?: boolean;
  isInputValid?: boolean;
  autoFocus?: boolean;
  theme?: any;
  settings?: any;
  disabled?: boolean;
  isAnswered?: boolean;
  onFocus?: any;
};

export const Currency = forwardRef(
  (
    {
      value,
      onChange,
      viewPort,
      isCreator,
      isPreview = false,
      placeholder,
      isInputValid,
      autoFocus,
      theme,
      settings,
      disabled = false,
      isAnswered = false,
      onFocus = () => {},
    }: CurrencyProps,
    ref
  ) => {
    const defaultCountry = settings?.defaultCountry;

    const getCurrencyList = () => {
      return settings?.allowedCountries ? [...settings?.allowedCountries] : [];
    };
    let countriesList = getCurrencyList();
    const disableCountrySelection =
      disabled ||
      countriesList?.length === 1 ||
      (isCreator === true && isPreview !== true); // disabled in creator; enabled in preview

    const onChangeCurrency = (value) => {
      onChange(value);
    };

    useEffect(() => {
      if (
        !isCreator &&
        defaultCountry?.countryCode &&
        !isAnswered &&
        !value?.currencyValue &&
        !value?.countryCode
      ) {
        onChange({ ...defaultCountry });
      }
    }, []);

    return (
      <CurrencyCountryInput
        value={
          isCreator
            ? {
                ...defaultCountry,
              }
            : value
        }
        countryList={getCurrencyList()}
        onChange={onChangeCurrency}
        disableInput={disabled}
        isInputValid={isInputValid}
        placeholder={placeholder}
        disableCountrySelection={disableCountrySelection}
        isPreview={isPreview}
        viewPort={viewPort}
        autoFocus={autoFocus}
        theme={theme}
        isCreator={isCreator}
        onFocus={onFocus}
      />
    );
  }
);
