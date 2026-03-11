import React, { forwardRef } from "react";
import Tooltip from "@mui/material/Tooltip";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
});
const TooltipChild = forwardRef((props, ref) => {
  return (
    <div {...props} ref={ref}>
      {props?.children}
    </div>
  );
});
const ODSTooltip = ({ children, ...props }) => {
  return (
    <ThemeProvider theme={theme}>
      <Tooltip
        arrow
        {...props}
        slotProps={{
          tooltip: {
            sx: {
              background: "rgba(38, 50, 56, 0.9)",
              color: "fff",
              font: "var(--subtitle2)",
              letterSpacing: "var(--subtitle2-letter-spacing)",
            },
          },
          ...props?.slotProps,
        }}
      >
        <TooltipChild>{children}</TooltipChild>
      </Tooltip>
    </ThemeProvider>
  );
};

export default ODSTooltip;
