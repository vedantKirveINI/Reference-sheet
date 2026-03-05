import { useEffect } from "react";
import { ZipCodeCountryInput } from "./components";

export type ZipCodeProps = {
  value: any;
  onChange: any;
  viewPort?: string;
  isCreator?: boolean;
  settings?: any;
  isInputValid?: boolean;
  disabled?: boolean;
  theme?: any;
  autoFocus?: boolean;
  isAnswered?: boolean;
  placeholder?: string;
  onFocus?: any;
  isPreview?: boolean;
};

export const ZipCode = ({
  onChange,
  value,
  isCreator,
  isInputValid,
  settings,
  viewPort,
  disabled = false,
  theme = {},
  autoFocus,
  isAnswered = false,
  placeholder,
  onFocus = () => {},
  isPreview = false,
}: ZipCodeProps) => {
  const { isCountryChangeEnabled, defaultCountry } = settings ?? {};

  const onChangeValue = (value: any) => {
    onChange(value);
  };

  useEffect(() => {
    if (
      !isCreator &&
      defaultCountry?.countryCode &&
      !isAnswered &&
      !value?.zipCode &&
      !value?.countryCode
    ) {
      onChange({ ...defaultCountry });
    }
  }, []);

  return (
    <ZipCodeCountryInput
      value={
        isCreator
          ? { countryCode: defaultCountry?.countryCode, zipCode: null }
          : value
      }
      onChange={onChangeValue}
      disableInput={isCreator || disabled}
      isInputValid={isInputValid}
      placeholder={placeholder}
      disableCountrySelection={disabled || !isCountryChangeEnabled}
      viewPort={viewPort}
      countryList={[]}
      theme={theme}
      autoFocus={autoFocus}
      isCreator={isCreator}
      isPreview={isPreview}
      onFocus={onFocus}
    />
  );
};
