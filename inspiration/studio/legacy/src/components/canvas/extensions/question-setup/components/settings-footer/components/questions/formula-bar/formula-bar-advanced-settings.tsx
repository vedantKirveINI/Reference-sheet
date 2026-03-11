/** @jsxImportSource @emotion/react **/ import {} from "@emotion/react";
import Regex from "../../common-settings/regex";
import AccessKeyInput from "../../common-settings/access-key-input";
import { styles } from "./styles";

const FormulaBarAdvancedSettings = ({ settings, handleOnChange }) => {
  return (
    <div
      css={styles.advancedSettingsContainer}
      data-testid="formula-bar-advanced-settings"
    >
      <Regex settings={settings} handleOnChange={handleOnChange} />
      <AccessKeyInput
        keyValue={settings?.accessKey}
        onChange={(value) => handleOnChange("accessKey", value)}
      />
    </div>
  );
};

export default FormulaBarAdvancedSettings;
