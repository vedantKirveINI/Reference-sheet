import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
  },
});
const ODSToggleButtonGroup = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <ToggleButtonGroup {...props}>{props.children}</ToggleButtonGroup>
    </ThemeProvider>
  );
};

export default ODSToggleButtonGroup;
