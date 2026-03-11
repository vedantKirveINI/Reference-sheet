import React, { forwardRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import getOuteIconComponent from './oute-icons/index.jsx';
import IconButton from "@mui/material/IconButton";

const theme = createTheme({ ...default_theme });
const ODSIcon = forwardRef(
  (
    {
      outeIconName,
      outeIconProps = {},
      imageProps = {},
      buttonProps = {},
      children,
      onClick,
    },
    ref
  ) => {
    const renderIcon = (
      <>
        {outeIconName &&
          getOuteIconComponent(outeIconName, {
            ...outeIconProps,
            ref,
            sx: {
              ...outeIconProps.sx,
              pointerEvents: "none",
            },
          })}
        {!outeIconName && Object.keys(imageProps).length > 0 && (
          <img {...imageProps} />
        )}
        {!outeIconName && Object.keys(imageProps).length === 0 && children}
      </>
    );
    return (
      <ThemeProvider theme={theme}>
        {onClick ? (
          <IconButton
            data-testid="ods-icon"
            disableRipple
            disableFocusRipple
            onClick={onClick}
            {...buttonProps}
            sx={{ padding: 0, ...buttonProps.sx }}
          >
            {renderIcon}
          </IconButton>
        ) : (
          renderIcon
        )}
      </ThemeProvider>
    );
  }
);

export default ODSIcon;
