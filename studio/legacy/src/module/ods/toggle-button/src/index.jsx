import React from "react";
import ToggleButton from "@mui/material/ToggleButton";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;

const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: "0.375rem",
        },
      },
    },
  },
});
const ODSToggleButton = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <ToggleButton size="small" {...props} />
    </ThemeProvider>
  );
};

export default ODSToggleButton;
