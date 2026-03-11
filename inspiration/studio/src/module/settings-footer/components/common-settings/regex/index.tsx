import { ODSLabel } from "@src/module/ods";
import { ODSTextField } from "@src/module/ods";
import { styles } from "./styles";
import { SettingsTextField } from "../settings-textfield";
interface RegexProps {
  settings?: any;
  handleOnChange?: (key: string, val: any) => void;
  value?: any;
}

const Regex = ({ handleOnChange, settings }: RegexProps) => {
  return (
    <div style={styles.container()} data-testid="settings-regex">
      <SettingsTextField
        label="Regex"
        className="black"
        value={settings?.regex?.value}
        placeholder="e.g ^[A-Za-z]{5}\d{4}[A-Za-z]{1}$"
        onChange={(value) => {
          handleOnChange("regex", {
            value,
            error: settings?.regex?.error,
          });
        }}
        fullWidth
        dataTestId="settings-regex-input"
      />

      <SettingsTextField
        label="Regex Error"
        className="black"
        value={settings?.regex?.error}
        placeholder="Enter regex error here"
        onChange={(value) => {
          handleOnChange("regex", {
            value: settings?.regex?.value,
            error: value,
          });
        }}
        fullWidth
        dataTestId="settings-regex-error"
      />
    </div>
  );
};

export default Regex;
