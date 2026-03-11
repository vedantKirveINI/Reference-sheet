/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import React, { forwardRef } from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { TCountryDetails } from "@oute/oute-ds.core.constants/countries-list";
import CountryPicker from "../../common-settings/country-picker";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";

const ZipCodeSettings = ({
  question,
  onChange,
  mode,
  disableQuestionAlignment = false,
}: any) => {
  const settings = question?.settings;

  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  const handleCountryChange = (details: TCountryDetails) => {
    onChange({
      settings: {
        ...settings,
        defaultCountry: {
          countryCode: details.countryCode,
        },
      },
    });
  };

  return (
    <div css={styles.container} data-testid="zip-code-general-settings">
      <div css={styles.wrapperContainer}>
        <QuestionAlignment
          settings={settings}
          onChange={updateSettings}
          style={{ width: "100%" }}
          mode={mode}
          disabled={disableQuestionAlignment}
        />
        <SwitchOption
          key="zip-code-required"
          variant="black"
          title="Required"
          checked={settings?.required}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("required", event.target.checked)
          }
          dataTestId="question-settings-required-toggle"
        />
        <CTAEditor />

        <SwitchOption
          key="zip-code-Changing"
          variant="black"
          title="Allow Changing Country"
          checked={settings?.isCountryChangeEnabled}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("isCountryChangeEnabled", event.target.checked)
          }
          dataTestId="settings-allow-changing-country-switch"
        />

        {/* <SwitchOption
          key="allow-other-zip-code"
          title="Allow Other Zip Codes"
          checked={settings?.allowOtherZipCodes}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("allowOtherZipCodes", event.target.checked)
          }
        /> */}
      </div>
      <div css={styles.wrapperContainer}>
        <div
          css={styles.odsContainer()}
          data-testid="settings-zip-code-default-country-container"
        >
          <ODSLabel variant="body1">Default Country</ODSLabel>
          <CountryPicker
            value={settings?.defaultCountry}
            onChange={handleCountryChange}
            multiple={false}
            dataTestId="settings-zip-code-default-country"
          />
        </div>
      </div>
    </div>
  );
};

export default ZipCodeSettings;
