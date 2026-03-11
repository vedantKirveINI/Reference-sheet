import React from "react";
import AvatarGroup from "@mui/material/AvatarGroup";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          height: "1.875rem",
          width: "1.875rem",
        },
      },
    },
  },
});

const ODSAvatarGroup = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <AvatarGroup {...props} />
    </ThemeProvider>
  );
};

export default ODSAvatarGroup;
