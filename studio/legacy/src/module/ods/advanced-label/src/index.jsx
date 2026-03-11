import React, { forwardRef, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// import ODSCheckbox from "oute-ds-checkbox";
import sharedAssets from "../../shared-assets/src/index.jsx";
import ODSCheckbox from "../../checkbox/src/index.jsx";
const default_theme = sharedAssets;
import classes from './index.module.css';
const theme = createTheme({
  ...default_theme,
});
const ODSAdvancedLabel = forwardRef(
  (
    {
      labelText, // To display main label text.
      labelSubText, // To display subtitle below the main label.
      leftAdornment, // To add an additional element or component on the left side of the label.
      rightAdornment, // To add an additional element or component on the right side of the label.
      fullWidth = false, // To make the label take up the 100% width of its container.
      sx = {}, // To provide custom styling to the component.
      required = false, // To add `*` to the end of the main label.
      showCheckbox = false, // To show the checkbox on the left side.
      /**
       * To provide custom styling to the main label. eg. labelProps={{variant: "body2",color: "primary",sx:{}}}
       * For more details on styling of labelText visit : https://mui.com/material-ui/api/typography/
       */
      labelProps = {}, // To provide custom styling to the main label. eg. labelProps={{variant: "body2",color: "primary",sx:{}}}
      /**
       * To provide custom styling to the subtitle. eg. subTextProps={{variant: "caption",color: "primary",sx:{}}}
       * For more details on styling of labeSubText visit : https://mui.com/material-ui/api/typography/
       */
      subTextProps = {},
      onCheckboxChange = () => { }, // To handle checkbox change.
      defaultChecked = false, // To set the initial state of the checkbox.
      disabled = false, // To disable the label.
      ...props
    },
    ref
  ) => {
    const [checked, setChecked] = useState(defaultChecked);
    const [_styleOverrides] = useState({
      width: fullWidth ? "100%" : sx.width || "16rem",
      maxWidth: fullWidth ? "100%" : sx.maxWidth || "16rem",
      ...sx,
    });
    return (
      <ThemeProvider theme={theme}>
        <Box sx={_styleOverrides} {...props}>
          <div
            ref={ref}
            className={`${classes["oute-ds-label"]} ${disabled && classes["disabled"]
              }`}
            data-testid="oute-ds-advance-label-box"
          >
            <div
              className={`${classes["left-adornment-container"]} ${!!labelSubText && classes["start"]
                } ${!showCheckbox && !leftAdornment && classes["hide"]}`}
              style={{
                minWidth: showCheckbox || leftAdornment ? "1.875rem" : 0,
              }}
              data-testid="oute-ds-advance-label-left-adornment-container"
            >
              {showCheckbox && (
                <ODSCheckbox
                  checked={checked}
                  sx={{ padding: "0rem" }}
                  onChange={(e) => {
                    setChecked(e.target.checked);
                    onCheckboxChange(e);
                  }}
                  data-testid="oute-ds-advance-label-checkbox"
                />
              )}
              {!!leftAdornment && !showCheckbox && leftAdornment}
            </div>
            <div
              className={classes["typography-container"]}
              data-testid="oute-ds-advance-label-typography-container"
            >
              <Typography
                variant="h6"
                color="grey.A100"
                textOverflow="ellipsis"
                overflow="hidden"
                data-testid="oute-ds-advance-label-text"
                {...labelProps}
                title={labelText}
              >
                {labelText}
                {required ? <sup className={classes["required"]}>*</sup> : ""}
              </Typography>
              {labelSubText && (
                <Typography
                  variant="subtitle1"
                  color="grey.600"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  data-testid="oute-ds-advance-label-sub-text"
                  {...subTextProps}
                  title={labelSubText}
                >
                  {labelSubText}
                </Typography>
              )}
            </div>
            <div
              className={`${classes["right-container"]} ${!rightAdornment && classes["hide"]
                }`}
              data-testid="oute-ds-advance-label-right-container"
            >
              {rightAdornment}
            </div>
          </div>
        </Box>
      </ThemeProvider>
    );
  }
);

export default ODSAdvancedLabel;
