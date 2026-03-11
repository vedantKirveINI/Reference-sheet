/** @jsxImportSource @emotion/react * */ import {} from "@emotion/react";
import React from "react";
import { ODSLabel } from "@src/module/ods";
import { TCountryDetails } from "@oute/oute-ds.core.constants/countries-list";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CountryPicker from "../../common-settings/country-picker";
import { COUNTRY_SELECTION_FOR } from "../../../constants/constants";
import CTAEditor from "../../common-settings/cta-editor";
import { ODSIcon, ODSTooltip as ODSToolTip } from "@src/module/ods";
import {
  OTP_SUPPORTED_COUNTRIES,
  SETTINGS_INPUT_NAMES,
} from "@oute/oute-ds.core.constants/constants";
import { useQuestionContext } from "@oute/oute-ds.core.contexts";

const PhoneNumberSettings = ({
  question,
  onChange,
  mode,
  disableQuestionAlignment = false,
}: any) => {
  const settings = question?.settings;
  const { settingsInputToFocus } = useQuestionContext();

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const handleCountryChange = (details: TCountryDetails) => {
    onChange({
      settings: {
        ...settings,
        defaultCountry: {
          countryCode: details.countryCode,
          countryNumber: details.countryNumber,
        },
      },
    });
  };

  return (
    <div css={styles.container} data-testid="phone-number-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          title="Required"
          variant="black"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("required", event.target.checked)
          }
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />

        <SwitchOption
          title="Allow Changing Country"
          variant="black"
          checked={settings?.isCountryChangeEnabled}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("isCountryChangeEnabled", event.target.checked)
          }
          dataTestId="allow-changing-country-toggle"
        />

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <SwitchOption
            title="Verify Phone Number"
            variant="black"
            checked={settings?.isPhoneValidationEnabled}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              updateSettings("isPhoneValidationEnabled", event.target.checked)
            }
            dataTestId="phone-number-validation-toggle"
          />

          <ODSToolTip
            title={`Phone number verification is only supported for ${OTP_SUPPORTED_COUNTRIES.join(",")} phone numbers.`}
            arrow={false}
            style={{
              cursor: "pointer",
            }}
          >
            <ODSIcon
              outeIconName="OUTEInfoIcon"
              outeIconProps={{
                "data-testid": "phone-number-validation-tooltip",
                sx: {
                  cursor: "pointer",
                },
              }}
            />
          </ODSToolTip>
        </div>
      </div>

      <div css={styles.wrapperContainer}>
        <div
          css={styles.odsContainer()}
          data-testid="settings-phone-number-default-country-container"
        >
          <ODSLabel variant="body1">Default Country</ODSLabel>
          <CountryPicker
            type={COUNTRY_SELECTION_FOR.PHONE}
            value={settings?.defaultCountry}
            onChange={handleCountryChange}
            multiple={false}
            dataTestId="settings-phone-number-default-country"
            openListOnInitialRender={
              settingsInputToFocus ===
              SETTINGS_INPUT_NAMES.DEFAULT_COUNTRY_PICKER
            }
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberSettings;
