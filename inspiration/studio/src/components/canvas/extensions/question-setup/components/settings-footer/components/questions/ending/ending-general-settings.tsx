import React from "react";
import SwitchOption from "../../common-settings/switch";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
import { SettingsTextField } from "../../common-settings/settings-textfield";
import { REGEX_CONSTANTS } from "@oute/oute-ds.core.constants";
interface EndingSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  viewPort?: any;
  mode?: any;
}

const EndingSettings = ({ onChange, question, mode }: EndingSettingsProps) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  let regex = REGEX_CONSTANTS.URL_REGEX;

  return (
    <div style={styles.container} data-testid="ending-general-settings">
      <div style={styles.wrapperContainer}>
        <CTAEditor />

        <SwitchOption
          key="social-share-icons"
          variant="black"
          title="Social Share Icons"
          checked={settings?.socialShareIcons}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("socialShareIcons", event.target.checked)
          }
        />

        <SwitchOption
          key="submit-another-response"
          variant="black"
          title="Submit Another Response"
          checked={settings?.submitAnotherResponse}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            updateSettings("submitAnotherResponse", event.target.checked)
          }
        />
      </div>

      <div style={styles.wrapperContainer}>
        <SettingsTextField
          label="Button Link"
          className="black"
          error={
            settings?.redirectURL ? !regex.test(settings.redirectURL) : false
          }
          helperText={
            settings?.redirectURL && !regex.test(settings.redirectURL)
              ? "Invalid URL"
              : ""
          }
          value={settings?.redirectURL || ""}
          placeholder="url"
          onChange={(value) => updateSettings("redirectURL", value)}
          dataTestId="settings-question-augmentor-redirect-url"
        />
        <SettingsTextField
          label="Promotional Text"
          className="black"
          value={settings?.promotionalText || ""}
          placeholder="Enter text to show above submit again button"
          onChange={(value) => updateSettings("promotionalText", value)}
          dataTestId="settings-question-augmentor-promotional-text"
          multiline
          rows={3}
        />
      </div>
    </div>
  );
};

export default EndingSettings;
