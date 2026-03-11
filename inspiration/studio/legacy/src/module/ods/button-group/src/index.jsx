import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonGroup from "@mui/material/ButtonGroup";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
        },
        firstButton: {
          borderRadius: "0.75rem 0rem 0rem 0.75rem",
        },
        middleButton: {
          borderLeft: "0.0225rem solid #1976D2",
        },
        lastButton: {
          borderLeft: "0.0225rem solid #1976D2",
          borderRadius: "0rem 0.75rem 0.75rem 0rem",
        },
      },
    },
  },
});
const ODSButtonGroup = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <ButtonGroup disableElevation={true} {...props}>
        {props.children}
      </ButtonGroup>
    </ThemeProvider>
  );
};

export default ODSButtonGroup;
