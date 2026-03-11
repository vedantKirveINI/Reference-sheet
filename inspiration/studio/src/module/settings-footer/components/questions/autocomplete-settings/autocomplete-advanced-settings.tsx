import AccessKeyInput from "../../common-settings/access-key-input";
import { accessKeyInputStyles } from "../../validation-settings/styles";

const AutoCompleteAdvancedSettings = ({ settings, handleOnChange }) => {
  return (
    <AccessKeyInput
      keyValue={settings?.accessKey}
      onChange={(value) => handleOnChange("accessKey", value)}
      style={accessKeyInputStyles}
    />
  );
};

export default AutoCompleteAdvancedSettings;
