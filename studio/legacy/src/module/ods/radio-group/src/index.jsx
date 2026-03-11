import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import RadioGroup from "@mui/material/RadioGroup";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
});
const ODSRadioGroup = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <RadioGroup
        data-testid="ods-radio-group"
        sx={{
          ...(props?.variant === "black" && {
            "& .Mui-checked": {
              color: "#212121",
            },
          }),
        }}
        {...props}
      >
        {props.children}
      </RadioGroup>
    </ThemeProvider>
  );
};

export default ODSRadioGroup;
