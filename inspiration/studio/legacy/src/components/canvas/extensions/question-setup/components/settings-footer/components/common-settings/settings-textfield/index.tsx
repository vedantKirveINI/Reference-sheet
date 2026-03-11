/** @jsxImportSource @emotion/react **/
import { ODSLabel, ODSTextField } from "@src/module/ods";
import { styles } from "./styles";

interface SettingsTextFieldProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  dataTestId?: string;
  multiline?: boolean;
  rows?: number;
  error?: boolean;
  helperText?: string;
  className?: string;
  maxLength?: number;
  [key: string]: any; // Allow any additional props to be passed through
}

export const SettingsTextField = ({
  label,
  value,
  placeholder,
  onChange,
  dataTestId,
  multiline,
  rows,
  error,
  helperText,
  maxLength,
  className = "default",
  ...props
}: SettingsTextFieldProps) => {
  return (
    <div css={styles.getInputWrapperContainerStyle({ multiline })}>
      <ODSLabel children={label} variant="body1" />
      <ODSTextField
        value={value || ""}
        placeholder={placeholder || ""}
        className={className}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        multiline={multiline}
        rows={rows}
        error={error}
        helperText={helperText}
        inputProps={{
          "data-testid": dataTestId,
          maxLength: maxLength,
        }}
        {...props}
      />
    </div>
  );
};

export default SettingsTextField;
