import Regex from "../../common-settings/regex";
import AccessKeyInput from "../../common-settings/access-key-input";
import { styles } from "./styles";
const ShortTextAdvancedSettings = ({ settings, handleOnChange }) => {
  return (
    <div
      style={styles.advancedSettingsContainer}
      data-testid="short-text-advanced-settings"
    >
      <Regex settings={settings} handleOnChange={handleOnChange} />
      <AccessKeyInput
        keyValue={settings?.accessKey}
        onChange={(value) => handleOnChange("accessKey", value)}
      />
    </div>
  );
};

export default ShortTextAdvancedSettings;
