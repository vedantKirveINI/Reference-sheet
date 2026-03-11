import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FormGroup from "@mui/material/FormGroup";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
});
const ODSFormGroup = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <FormGroup {...props}>{props.children}</FormGroup>
    </ThemeProvider>
  );
};

export default ODSFormGroup;
