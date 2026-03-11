import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
});
const ODSFormControl = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <FormControl {...props}>{props.children}</FormControl>
    </ThemeProvider>
  );
};

export default ODSFormControl;
