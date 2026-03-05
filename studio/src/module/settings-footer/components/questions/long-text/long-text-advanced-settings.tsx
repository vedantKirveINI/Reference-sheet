import Regex from "../../common-settings/regex";
import AccessKeyInput from "../../common-settings/access-key-input";
const LongTextAdvancedSettings = ({ settings, handleOnChange }) => {
  return (
    <>
      <Regex settings={settings} handleOnChange={handleOnChange} />
      <AccessKeyInput
        keyValue={settings?.accessKey}
        onChange={(value) => handleOnChange("accessKey", value)}
      />
    </>
  );
};

export default LongTextAdvancedSettings;
