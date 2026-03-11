import { ODSLabel, ODSTextField } from "@src/module/ods";
import { styles } from "./styles";
interface SettingsTextFieldProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
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
  disabled = false,
  ...props
}: SettingsTextFieldProps) => {
  return (
    <div style={styles.getInputWrapperContainerStyle()}>
      <ODSLabel variant="body1">{label}</ODSLabel>
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
        disabled={disabled}
        style={{
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
          cursor: disabled ? "not-allowed !important" : "text",
        }}
        {...props}
      />
    </div>
  );
};
