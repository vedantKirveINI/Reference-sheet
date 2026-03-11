import { styles } from "./styles";
import { ODSLabel, ODSAutocomplete, ODSChip } from "@src/module/ods";
import isEmpty from "lodash/isEmpty";
interface DropdownV2Props {
  label?: string;
  value: any;
  options: any[];
  onChange?: (value: any) => void;
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  selecOnFocus?: boolean;
  getOptionLabel?: (option: any) => string;
  variant?: string;
  placeholder?: string;
  renderTagKey?: string; //if the options are an array of objects: pass key of the object
  [key: string]: any;
  dataTestId?: string;
}

export const DropdownV2 = ({
  label,
  value,
  options,
  onChange,
  isOptionEqualToValue,
  selecOnFocus = true,
  getOptionLabel,
  variant,
  placeholder,
  multiple = false,
  sx,
  renderTagKey,
  dataTestId = "settings-default-value-container",
  maxChipLength = 12,
  ...rest
}: DropdownV2Props) => {
  let extraProps = {};

  if (getOptionLabel) {
    extraProps = {
      ...extraProps,
      getOptionLabel,
    };
  }

  const computedSx = multiple
    ? {
        "&.MuiAutocomplete-root .MuiOutlinedInput-root": {
          display: "flex",
          alignContent: "center",
          paddingRight: "0px",
        },
        ...sx,
      }
    : sx;

  const renderTags = (selectedOption, getTagProps) => {
    const visible = selectedOption[0];
    const extraCount = selectedOption.length - 1;

    const truncateOption = (option, maxLength = 12) => {
      if (!option) return "";

      const label =
        option !== null && typeof option === "object" && option[renderTagKey]
          ? option[renderTagKey]
          : option;

      const labelText =
        typeof label === "string" ? label : JSON.stringify(label);

      return labelText.length > maxLength
        ? `${labelText.substring(0, maxLength)}...`
        : labelText;
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5em",
        }}
      >
        <ODSChip
          
          label={truncateOption(visible, maxChipLength)}
          size="small"
          data-testid="default-value-chip"
          {...getTagProps({ index: 0 })}
        />

        {extraCount > 0 && <span>+{extraCount}</span>}
      </div>
    );
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : !isEmpty(value);

  const computedPlaceholder = hasValue ? "" : placeholder || "Select Value";

  return (
    <div style={styles.getInputWrapperContainerStyle()}>
      {label && <ODSLabel variant="body1">{label}</ODSLabel>}
      <ODSAutocomplete
        options={options}
        multiple={multiple}
        value={value}
        onChange={(e, value) => {
          onChange(value);
        }}
        isOptionEqualToValue={(option, value) => {
          return isOptionEqualToValue(option, value);
        }}
        fullWidth
        variant={variant}
        selectOnFocus={selecOnFocus}
        style={computedSx}
        data-testid="settings-autocomplete-trigger"
        textFieldProps={{
          inputProps: {
            placeholder: computedPlaceholder,
            "data-testid": dataTestId,
          },
          "data-testid": "settings-default-value-trigger",
        }}
        renderTags={multiple ? renderTags : undefined}
        {...extraProps}
        {...rest}
      />
    </div>
  );
};
