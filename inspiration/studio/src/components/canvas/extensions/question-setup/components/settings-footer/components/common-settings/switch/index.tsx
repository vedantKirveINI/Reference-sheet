import { ODSSwitch } from "@src/module/ods";
import { optionContainer, optionTitle } from "./styles";

const SwitchOption = ({
  title,
  styles,
  checked,
  onChange,
  switchProps = {},
  disabled = false,
  variant = "default",
  dataTestId,
}: {
  title: string;
  styles?: React.CSSProperties;
  checked?: boolean;
  onChange?: any;
  switchProps?: any;
  disabled?: boolean;
  variant?: string;
  dataTestId?: string;
}) => {
  return (
    <ODSSwitch
      labelText={title}
      disabled={disabled}
      labelProps={{ variant: "body1" }}
      variant={variant}
      checked={checked}
      onChange={onChange}
      data-testid={
        dataTestId || `settings-${title.replace(/\s+/g, "")}-option-switch`
      }
      {...switchProps}
    />
  );
};

export default SwitchOption;
