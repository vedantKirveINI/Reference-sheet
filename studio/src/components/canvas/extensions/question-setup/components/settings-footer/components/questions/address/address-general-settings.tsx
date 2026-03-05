import React from "react";
import { ODSLabel } from "@src/module/ods";
import SwitchOption from "../../common-settings/switch";
import QuestionAlignment from "../../common-settings/alignment";
import { styles } from "./styles";
import CTAEditor from "../../common-settings/cta-editor";
interface AddressSettingsProps {
  question?: any;
  onChange?: (val: any) => void;
  mode?: any;
  disableQuestionAlignment?: boolean;
}

const AddressGeneralSettings = ({
  onChange,
  question,
  mode,
  disableQuestionAlignment,
}: AddressSettingsProps) => {
  const settings = question?.settings;
  const updateSettings = (key: string, value: any) => {
    onChange?.({ settings: { ...settings, [key]: value } });
  };

  return (
    <div style={styles.container} data-testid="address-general-settings">
      <QuestionAlignment
        settings={settings}
        onChange={updateSettings}
        mode={mode}
        disabled={disableQuestionAlignment}
      />
      <CTAEditor style={{ maxWidth: "50%" }} />
      <div>
        <ODSLabel variant="h6">Select Required fields</ODSLabel>
        <div style={styles.switchContainer}>
          <div style={styles.wrapperContainer}>
            <SwitchOption
              key="full-name-required"
              variant="black"
              title="Full Name"
              styles={{ width: "100%" }}
              checked={settings?.fullName}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateSettings("fullName", event.target.checked)
              }
            />
            <SwitchOption
              key="country-required"
              variant="black"
              title="Country"
              checked={settings?.country}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateSettings("country", event.target.checked)
              }
            />
            <SwitchOption
              key="address-line-one-required"
              variant="black"
              title="Address Line 1"
              styles={{ width: "100%" }}
              checked={settings?.addressLineOne}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateSettings("addressLineOne", event.target.checked)
              }
            />
            <SwitchOption
              key="address-line-two-required"
              variant="black"
              title="Address Line 2"
              checked={settings?.addressLineTwo}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateSettings("addressLineTwo", event.target.checked)
              }
            />
          </div>
          <div style={styles.wrapperContainer}>
            <SwitchOption
              key="city-required"
              variant="black"
              title="City/Town"
              checked={settings?.city}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateSettings("city", event.target.checked)
              }
            />
            <SwitchOption
              key="state-required"
              variant="black"
              title="State/Region/Province"
              checked={settings?.state}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateSettings("state", event.target.checked)
              }
            />
            <SwitchOption
              key="zipCode-required"
              variant="black"
              title="Zip/Post code"
              checked={settings?.zipCode}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                updateSettings("zipCode", event.target.checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressGeneralSettings;
