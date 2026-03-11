import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import CircularProgress from "@mui/material/CircularProgress";
const theme = createTheme({
  ...default_theme,
});
const ODSCircularProgress = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <CircularProgress {...props} />
    </ThemeProvider>
  );
};

export default ODSCircularProgress;
