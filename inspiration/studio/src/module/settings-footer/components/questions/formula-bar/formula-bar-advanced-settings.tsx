import Regex from "../../common-settings/regex";
import AccessKeyInput from "../../common-settings/access-key-input";

const FormulaBarAdvancedSettings = ({ settings, handleOnChange }) => {
  return (
    <div
      className="flex flex-col gap-8"
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
