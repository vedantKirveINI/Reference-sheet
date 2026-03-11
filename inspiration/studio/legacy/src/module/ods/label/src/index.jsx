import React, { forwardRef } from "react";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  typography: default_theme.typography,
});
const ODSLabel = forwardRef(({ required = false, ...props }, ref) => {
  return (
    <ThemeProvider theme={theme}>
      <Typography ref={ref} variant="h6" color="grey.A100" {...props}>
        {props?.children} {required && <sup style={{ color: "red" }}>*</sup>}
      </Typography>
    </ThemeProvider>
  );
});

export default ODSLabel;
