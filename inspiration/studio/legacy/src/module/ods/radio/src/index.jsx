import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
// import default_theme from "oute-ds-shared-assets";
import { ODSAdvancedLabel } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;

const theme = createTheme({
  ...default_theme,
});
const ODSRadio = ({
  radioProps,
  formControlLabelProps,
  labelText,
  labelSubText,
  labelProps = {},
  variant = "default",
  subTextProps = {},
}) => {
  return (
    <ThemeProvider theme={theme}>
      <FormControlLabel
        control={
          <Radio
            disableRipple
            sx={{
              ...(variant === "black" && {
                "&.Mui-checked": {
                  color: "#212121",
                },
              }),
            }}
            {...radioProps}
          />
        }
        label={
          <ODSAdvancedLabel
            labelText={labelText}
            labelSubText={labelSubText}
            labelProps={labelProps}
            subTextProps={subTextProps}
            fullWidth={true}
            disabled={formControlLabelProps?.disabled}
          />
        }
        data-testid="ods-radio-label"
        {...formControlLabelProps}
      />
    </ThemeProvider>
  );
};

export default ODSRadio;
