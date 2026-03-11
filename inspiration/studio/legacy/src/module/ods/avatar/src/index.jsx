import React, { forwardRef } from "react";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
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

const ODSAvatar = forwardRef(
  (
    { badgeProps = {}, badgeContent = null, avatarProps = {}, children },
    ref
  ) => {
    return (
      <ThemeProvider theme={theme}>
        <Badge {...badgeProps} badgeContent={badgeContent}>
          <Avatar {...avatarProps} ref={ref}>
            {children}
          </Avatar>
        </Badge>
      </ThemeProvider>
    );
  }
);

export default ODSAvatar;
