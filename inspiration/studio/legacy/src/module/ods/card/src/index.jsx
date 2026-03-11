import React from "react";
// import default_theme from "oute-ds-shared-assets";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import Card from "@mui/material/Card";

const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: default_theme.palette["oute-background-hover"],
          },
          "&:focus": {
            outline: `auto ${default_theme.palette["oute-background-active"]}`,
          },
        },
      },
    },
  },
});
const ODSCard = ({
  /**
   * These are additional props which can be applied to MUI Card.
   * For more info, visit https://mui.com/material-ui/api/card/
   */
  ...props
}) => {
  return (
    <ThemeProvider theme={theme}>
      {/**
       *  The tabIndex is by default set to -1, to allow focus visibility of the MUI Card.
       */}
      <Card tabIndex={-1} {...props} sx={{ borderRadius: "16px", ...props.sx }}>
        {props.children}
      </Card>
    </ThemeProvider>
  );
};

export default ODSCard;
