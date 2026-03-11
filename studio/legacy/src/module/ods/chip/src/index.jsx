import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
// import ODSIcon from "oute-ds-icon";
import sharedAssets from "../../shared-assets/src/index.jsx";
import { ODSIcon } from "../../index.jsx";
const default_theme = sharedAssets;
import Chip from "@mui/material/Chip";
const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiChip: {
      styleOverrides: {
        root: {
          padding: "0rem 0.5rem",
        },
        sizeSmall: {
          fontSize: default_theme.typography.xsmallchip.fontSize,
          lineHeight: default_theme.typography.xsmallchip.lineHeight,
        },
        sizeMedium: {
          fontSize: default_theme.typography.caption.fontSize,
          lineHeight: default_theme.typography.caption.lineHeight,
        },
      },
    },
  },
});
const ODSChip = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <Chip
        data-testid="ods-chip"
        // When onDelete is provided, then delete icon is rendered
        deleteIcon={
          props.deleteIcon || (
            <ODSIcon
              outeIconName="OUTECloseIcon"
              outeIconProps={{
                sx: {
                  width:
                    props?.size === "small"
                      ? default_theme.typography.xsmallchip.fontSize
                      : default_theme.typography.caption.fontSize,
                  height:
                    props?.size === "small"
                      ? default_theme.typography.xsmallchip.fontSize
                      : default_theme.typography.caption.fontSize,
                  color: (theme) => theme.palette.grey[500],
                  ...props.sx,
                },
                "data-testid": "ods-chip-delete-icon",
              }}
              onClick={props.onClick}
              onDelete={props.onDelete}
            />
          )
        }
        {...props}
      />
    </ThemeProvider>
  );
};

export default ODSChip;
