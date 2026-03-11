import React from "react";
import { ODSCheckbox as Checkbox } from "@src/module/ods";
import { checkboxContainer } from "./styles";

function CheckboxCell({
  checked = false,
  onChange = (e) => e,
  disabled = false,
  variant = "black",
  dataTestId,
}) {
  return (
    <div style={checkboxContainer}>
      <Checkbox
        data-testid={`${dataTestId}-checkbox`}
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
        disabled={disabled}
        variant={variant}
      />
    </div>
  );
}

export default CheckboxCell;
