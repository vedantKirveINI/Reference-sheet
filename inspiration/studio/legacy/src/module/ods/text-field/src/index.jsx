import React, { forwardRef, useCallback, useState } from "react";
import { ThemeProvider } from "@mui/material";
import TextField from "@mui/material/TextField";
// import ODSIcon from "oute-ds-icon";
// import Tooltip from "oute-ds-tooltip";
import { ODSIcon, ODSTooltip as Tooltip } from "../../index.jsx";
import { textFieldTheme } from './theme.jsx';

const ODSTextField = forwardRef(
  (
    {
      onEnter = () => {},
      hideBorders = false,
      allowShowPasswordToggle = true,
      errorType = "default",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [type, setType] = useState(props?.type || "text");

    const showPasswordHandler = useCallback(() => {
      let show = !showPassword;
      setShowPassword(show);
      if (show) {
        setType("text");
      } else {
        setType(props?.type || "text");
      }
      setTimeout(() => ref.current?.select(), 10);
    }, [props?.type, ref, showPassword]);

    return (
      <ThemeProvider theme={textFieldTheme(errorType)}>
        <TextField
          size="medium"
          variant="outlined"
          autoComplete="off"
          {...props}
          ref={ref}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEnter(e);
            }
            props?.onKeyDown && props.onKeyDown(e);
          }}
          InputProps={{
            ...props?.InputProps,
            endAdornment: (
              <>
                {props?.InputProps?.endAdornment}
                {props?.type === "password" && allowShowPasswordToggle && (
                  <ODSIcon
                    outeIconName={
                      showPassword
                        ? "OUTEVisibilityOffIcon"
                        : "OUTEVisibilityOnIcon"
                    }
                    outeIconProps={{
                      "data-testid": "show-password-icon",
                      sx: {
                        cursor: "pointer",
                      },
                    }}
                    buttonProps={{
                      sx: {
                        padding: "0rem",
                      },
                    }}
                    onClick={showPasswordHandler}
                  />
                )}
                {errorType === "icon" && props.error && (
                  <Tooltip title={props?.helperText} arrow={false}>
                    <div
                      style={{
                        display: "flex",
                        height: "100%",
                        alignItems: "center",
                      }}
                    >
                      <ODSIcon
                        outeIconName="OUTEWarningIcon"
                        outeIconProps={{
                          sx: {
                            color: "var(--error)",
                            cursor: "default",
                          },
                          "data-testid": "error-icon",
                        }}
                      />
                    </div>
                  </Tooltip>
                )}
              </>
            ),
          }}
          sx={{
            ...(hideBorders
              ? { ".MuiOutlinedInput-notchedOutline": { border: "none" } }
              : {}),
            margin: 0,
            marginTop: !props?.label ? 0 : "1.25rem",
            marginBottom: !props?.helperText
              ? 0
              : errorType === "default"
              ? "1.25rem"
              : 0,
            ...props?.sx,
          }}
          helperText={
            props.helperText
              ? props.error && errorType === "icon"
                ? ""
                : props.helperText
              : ""
          }
          type={type}
          onFocus={(e) => {
            setTimeout(() => ref?.current?.select(), 10);
            props.onFocus && props?.onFocus(e);
          }}
        />
      </ThemeProvider>
    );
  }
);

export default ODSTextField;
