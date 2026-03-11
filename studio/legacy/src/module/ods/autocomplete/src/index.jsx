import React, { forwardRef, useCallback } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
// import ODSTextField from "oute-ds-text-field";
import Autocomplete from "@mui/material/Autocomplete";
// import ODSIcon from "oute-ds-icon";
import sharedAssets from "../../shared-assets/src/index.jsx";
import ODSTextField from "../../text-field/src/index.jsx";
import ODSIcon from "../../icon/src/index.jsx";
const default_theme = sharedAssets;

const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiAutocomplete: {
      styleOverrides: {
        option: ({ ownerState }) => ({
          minHeight: "3rem !important",
          borderRadius: "0.375rem",
          padding: "0.75rem !important",
          ...(ownerState.variant === "black" && {
            "&:hover": {
              backgroundColor: "rgba(33, 33, 33, 0.20)",
            },
            '&[aria-selected="true"]': {
              color: "#fff",
              backgroundColor: "#212121 !important",
            },
          }),
        }),
      },
    },
  },
});
const ODSAutocomplete = forwardRef(
  (
    {
      textFieldProps = {},
      searchable = false,
      hideBorders = false,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const getSx = useCallback(() => {
      let sx = {
        width: props?.fullWidth ? "100%" : "16rem",
        "& .MuiOutlinedInput-root": {
          padding:
            props?.size === "small" || textFieldProps?.size === "small"
              ? "0.325rem 20px 0.325rem 0.325rem !important"
              : "0.625rem",
        },
        "& .MuiInputBase-root": {
          background: "#FFFFFF",
        },
      };
      if (hideBorders) {
        sx = {
          ...sx,
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
        };
      }
      return sx;
    }, [hideBorders, props?.fullWidth, props?.size, textFieldProps?.size]);
    return (
      <ThemeProvider theme={theme}>
        <Autocomplete
          data-testid="ods-autocomplete"
          disableClearable={true}
          size="medium"
          popupIcon={
            <ODSIcon
              outeIconName={"OUTEExpandMoreIcon"}
              outeIconProps={{
                "data-testid": "ArrowDropDownIcon",
                ...((props?.size === "small" ||
                  textFieldProps?.size === "small") && {
                  sx: {
                    width: "1.25rem",
                    height: "1.25rem",
                  },
                }),
              }}
            />
          }
          slotProps={{
            paper: {
              style: {
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
                marginTop: "0.38rem",
                borderRadius: "0.375rem",
              },
            },
          }}
          ListboxProps={{
            "data-testid": "ods-autocomplete-listbox",
            style: {
              padding: "0.375rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.375rem",
            },
          }}
          renderInput={(params) => {
            if (props?.renderInput) return props?.renderInput(params);
            const mergedProps = { ...params };
            for (const key in params) {
              if (typeof params[key] === "object") {
                mergedProps[key] = {
                  ...mergedProps[key],
                  ...textFieldProps[key],
                };
              } else {
                if (textFieldProps[key]?.toString())
                  mergedProps[key] = textFieldProps[key];
              }
            }

            // Make the input readOnly if typeahead is false
            if (!searchable) {
              mergedProps.inputProps = {
                ...mergedProps.inputProps,
                readOnly: true,
                style: { cursor: "default" },
              };
            }

            return (
              <ODSTextField
                data-testid="ods-text-field"
                {...textFieldProps}
                {...mergedProps}
                className={`${textFieldProps.className} ${
                  variant === "black" ? "black" : ""
                }`}
                size={props?.size || textFieldProps?.size || "medium"}
                ref={ref}
              />
            );
          }}
          {...props}
          sx={{
            ...getSx(),
            ...props?.sx,
          }}
          variant={variant}
        />
      </ThemeProvider>
    );
  }
);

export default ODSAutocomplete;
