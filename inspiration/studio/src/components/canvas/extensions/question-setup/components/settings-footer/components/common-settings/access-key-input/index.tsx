import { ODSTextField, ODSLabel } from "@src/module/ods";
import { styles } from "./styles";
import { SettingsTextField } from "../settings-textfield";
function AccessKeyInput({ keyValue, onChange, style = {} }) {
  return (
    <div
      style={styles.getWrapperContainerStyle(style)}
      data-testid="settings-key"
    >
      <SettingsTextField
        label="Key"
        className="black"
        value={keyValue}
        onChange={(value) => onChange(value)}
        placeholder="Enter a key"
        dataTestId="settings-access-key-input"
      />
    </div>
  );
}

export default AccessKeyInput;
