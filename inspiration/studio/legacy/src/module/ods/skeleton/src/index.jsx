import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import Skeleton from "@mui/material/Skeleton";
const theme = createTheme({
  ...default_theme,
});
const ODSSkeleton = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <Skeleton animation="wave" {...props} />
    </ThemeProvider>
  );
};

export default ODSSkeleton;
