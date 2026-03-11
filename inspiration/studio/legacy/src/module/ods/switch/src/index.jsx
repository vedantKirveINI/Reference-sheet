import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import ODSAdvancedLabel from "oute-ds-advanced-label";
// import default_theme from "oute-ds-shared-assets";
import { ODSAdvancedLabel } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import Switch from "@mui/material/Switch";
import classes from './index.module.css';

const theme = createTheme({
  ...default_theme,
  components: {
    MuiSwitch: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          width: ownerState.size === "small" ? "2.375rem" : "2.875rem",
          height: ownerState.size === "small" ? "1.375rem" : "1.625rem",
          padding: 0,
        }),
        switchBase: ({ ownerState }) => ({
          padding: "0 !important",
          margin: "0.125rem",
          transitionDuration: "300ms",
          "&.Mui-checked": {
            transform: `translateX(${
              ownerState.size === "small" ? "1rem" : "1.25rem"
            }) !important`,

            color: "#fff",
            "& + .MuiSwitch-track": {
              backgroundColor:
                ownerState.variant === "black" ? "#000" : "#2196F3",
              opacity: 1,
              border: 0,
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              opacity: 0.5,
            },
          },
          "&.Mui-focusVisible .MuiSwitch-thumb": {
            color: "#33cf4d",
            border: "0.375rem solid #fff",
          },
          "&.Mui-disabled .MuiSwitch-thumb": {
            color: theme.palette.grey[100],
          },
          "&.Mui-disabled + .MuiSwitch-track": {
            opacity: 0.3,
          },
        }),
        track: ({ ownerState }) => ({
          borderRadius: ownerState.size === "small" ? "0.688rem" : "0.813rem",
          backgroundColor: ownerState.variant === "black" ? "#000" : "#2196F3",
        }),
        thumb: ({ ownerState }) => ({
          boxSizing: "border-box",
          width:
            ownerState.size === "small" ? "1.125rem !important" : "1.375rem",
          height:
            ownerState.size === "small" ? "1.125rem !important" : "1.375rem",
        }),
      },
    },
  },
});

const ODSSwitch = ({
  labelText,
  labelSubText,
  labelProps = {},
  subTextProps = {},
  checked = false,
  variant = "default",
  size = "medium",
  ...props
}) => {
  return (
    <ThemeProvider theme={theme}>
      <div
        className={`${classes["oute-ds-switch"]}`}
        data-testid="oute-ds-switch-container"
      >
        <Switch
          data-testid="oute-ds-switch"
          checked={checked}
          variant={variant}
          size={size}
          {...props}
          onChange={(e) => props?.onChange && props.onChange(e)}
        />
        {labelText && (
          <ODSAdvancedLabel
            labelText={labelText}
            labelSubText={labelSubText}
            labelProps={{ variant: "body1", ...(labelProps || {}) }}
            subTextProps={subTextProps}
            fullWidth={false}
            disabled={props?.disabled}
            sx={{
              cursor: props?.disabled ? "default" : "pointer",
              width: "fit-content",
              maxWidth: "fit-content",
            }}
            onClick={(e) => {
              if (!props?.disabled) {
                e.target.checked = !checked;
                props?.onChange && props.onChange(e);
              }
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default ODSSwitch;
