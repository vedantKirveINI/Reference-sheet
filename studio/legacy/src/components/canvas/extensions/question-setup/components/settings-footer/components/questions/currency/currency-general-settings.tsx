/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React from "react";
import { TCountryDetails } from "@oute/oute-ds.core.constants/countries-list";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import CountryPicker from "../../common-settings/country-picker";
import { styles } from "./styles";
import { COUNTRY_SELECTION_FOR } from "../../../constants/constants";
import {
  DEFAULT_MAX_CURRENCY_VALUE,
  DEFAULT_MIN_CURRENCY_VALUE,
  REGEX_CONSTANTS,
} from "@oute/oute-ds.core.constants";
import CTAEditor from "../../common-settings/cta-editor";
import { ERROR_MESSAGE } from "../../../constants/errorMessages";
import { SettingsTextField } from "../../common-settings/settings-textfield";

const OPTIONS = ["None", "Space", "Comma", "Dot", "Apostrophe"];

type CurrencySettingsProps = {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: any;
  mode?: any;
  disableQuestionAlignment?: boolean;
};

type TDefaultValue = Omit<TCountryDetails, "countryName">;

const CurrencySettings = ({
  onChange,
  question,
  viewPort,
  mode,
  disableQuestionAlignment = false,
}: CurrencySettingsProps) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const handleAllowedCountriesChange = (value: any) => {
    const allowedCountries = Array.isArray(value)
      ? value.map((_v: any) => ({
          countryCode: _v?.countryCode,
          currencyCode: _v?.currencyCode,
          currencySymbol: _v?.currencySymbol,
        }))
      : [];

    if (allowedCountries.length > 0) {
      const defaultCountry = settings?.defaultCountry;
      const defaultCountryIndex = allowedCountries.findIndex(
        (country) => country?.countryCode === defaultCountry?.countryCode
      );

      onChange({
        settings: {
          ...settings,
          allowedCountries: allowedCountries,
          defaultCountry:
            defaultCountryIndex !== -1
              ? allowedCountries[defaultCountryIndex]
              : allowedCountries[0],
        },
      });
    } else {
      onChange({
        settings: {
          ...settings,
          allowedCountries: [settings?.defaultCountry],
        },
      });
    }
  };

  const handleRangeChange = (key: string, value: any) => {
    let error = "";

    const regex = REGEX_CONSTANTS.ALLOW_POSITIVE_NUMBER_REGEX;

    if (value && !regex.test(value)) {
      return;
    }

    const minRange =
      settings?.minRange?.length === 0
        ? DEFAULT_MIN_CURRENCY_VALUE
        : Number(settings?.minRange);
    const maxRange =
      settings?.maxRange?.length === 0
        ? DEFAULT_MAX_CURRENCY_VALUE
        : Number(settings?.maxRange);
    const numericValue = Number(value);

    if (
      value &&
      key === "minRange" &&
      maxRange !== undefined &&
      numericValue > maxRange
    ) {
      error = ERROR_MESSAGE.CURRENCY.minRangeError;
    } else if (
      value &&
      key === "maxRange" &&
      minRange !== undefined &&
      numericValue < minRange
    ) {
      error = ERROR_MESSAGE.CURRENCY.maxRangeError;
    }

    onChange?.({
      settings: {
        ...settings,
        [key]: value,
        errors: {
          rangeError: error,
        },
      },
    });
  };

  return (
    <div css={styles.container} data-testid="currency-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />

        <SwitchOption
          key="currency-required"
          variant="black"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("required", event.target.checked)
          }
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />
        {/* <div
          css={styles.getInputWrapperContainerStyle()}
          data-testid="currency-thousand-separator-container"
        >
          <ODSLabel variant="body1">Thousand Separator</ODSLabel>
          <Dropdown
            multiple={false}
            options={OPTIONS}
            isSearchable={false}
            value={settings?.thousandsSeparator || "None"}
            onChange={(value) => {
              updateSettings("thousandsSeparator", value);
            }}
            viewPort={viewPort}
            style={{
              containerStyle: { maxWidth: "23em" },
              labelStyle: { maxWidth: "23em" },
              listStyle: { height: "15em !important" },
            }}
          />
        </div> */}
      </div>

      <div css={styles.wrapperContainer}>
        <div css={styles.rangeContainer} data-testid="currency-range-container">
          <ODSLabel variant="body1">Currency Range</ODSLabel>
          <div css={styles.rangeWrapper}>
            <SettingsTextField
              value={settings?.minRange || ""}
              className="black"
              placeholder="Min"
              maxLength={15}
              onChange={(val) => {
                handleRangeChange("minRange", val);
              }}
              dataTestId="settings-currency-min-range"
              InputProps={{
                sx: styles.getInputStyle(),
              }}
            />
            -
            <SettingsTextField
              value={settings?.maxRange || ""}
              className="black"
              placeholder="Max"
              maxLength={15}
              onChange={(val) => {
                handleRangeChange("maxRange", val);
              }}
              dataTestId="settings-currency-max-range"
              InputProps={{
                sx: styles.getInputStyle(),
              }}
            />
          </div>
          {settings?.errors?.rangeError && (
            <ODSLabel
              variant="body1"
              color="error"
              data-testid="settings-currency-range-error"
              style={{ position: "absolute", bottom: "-2em" }}
            >
              {settings.errors.rangeError}
            </ODSLabel>
          )}
        </div>

        <div
          css={styles.odsContainer()}
          data-testid="currency-default-country-container"
        >
          <ODSLabel variant="body1">Default Country</ODSLabel>
          <CountryPicker
            type={COUNTRY_SELECTION_FOR.CURRENCY}
            options={settings?.allowedCountries}
            value={settings?.defaultCountry}
            onChange={(_value) => {
              updateSettings("defaultCountry", {
                countryCode: _value?.countryCode,
                currencyCode: _value?.currencyCode,
                currencySymbol: _value?.currencySymbol,
              });
            }}
            includeAll={false}
            multiple={false}
            dataTestId="settings-currency-default-country"
          />
        </div>
        <div
          css={styles.odsContainer()}
          data-testid="currency-allowed-countries-container"
        >
          <ODSLabel variant="body1">Allowed Countries</ODSLabel>
          <CountryPicker
            type={COUNTRY_SELECTION_FOR.CURRENCY}
            value={settings?.allowedCountries}
            includeAll={true}
            onChange={handleAllowedCountriesChange}
            multiple={true}
            dataTestId="settings-currency-allowed-countries"
          />
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;
