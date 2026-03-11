import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
// import default_theme from "oute-ds-shared-assets";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
import sharedAssets from "../../shared-assets/src/index.jsx";
import { ODSAdvancedLabel } from "../../index.jsx";
const default_theme = sharedAssets;
import { outeDSCheckboxContainerStyle, checkboxSxStyle } from './style.jsx';

const theme = createTheme({
  ...default_theme,
});
const ODSCheckbox = ({
  labelText,
  labelSubText,
  labelProps = {},
  subTextProps = {},
  defaultChecked = false,
  onChange = () => {},
  sx = {},
  variant = "default",
  indeterminate = false,
  ...props
}) => {
  const [checked, setChecked] = useState(defaultChecked);
  const customSx = {
    ...checkboxSxStyle,
    ...sx,
    ...(variant === "black" && {
      "&.Mui-checked": {
        color: "#000",
      },
    }),
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ ...outeDSCheckboxContainerStyle }}>
        <Checkbox
          sx={{
            ...customSx,
          }}
          indeterminate={indeterminate}
          onChange={(e) => {
            setChecked(e.target.checked);
            onChange(e);
          }}
          checked={checked}
          {...props}
        />
        {labelText && (
          <ODSAdvancedLabel
            labelText={labelText}
            labelSubText={labelSubText}
            labelProps={labelProps}
            subTextProps={subTextProps}
            fullWidth={true}
            disabled={props?.disabled}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default ODSCheckbox;
