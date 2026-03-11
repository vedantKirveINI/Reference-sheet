import AccessKeyInput from "../../common-settings/access-key-input/index";

const MultiQuestionPageAdvanceSettings = ({ settings, onChange }) => {
  const handleOnChange = (key: string, value: any) => {
    onChange({ settings: { ...settings, [key]: value } });
  };
  return (
    <AccessKeyInput
      keyValue={settings?.accessKey}
      onChange={(value) => handleOnChange("accessKey", value)}
    />
  );
};

export default MultiQuestionPageAdvanceSettings;
