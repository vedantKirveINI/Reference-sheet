import React, { forwardRef, useRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Button from "@mui/material/Button";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  typography: {
    ...default_theme.typography,
    fontFamily: "Inter",
  },
  components: {
    ...default_theme.components,
    MuiButton: {
      variants: [
        {
          props: { variant: "black" },
          style: {
            background: "#212121",
            color: "#FFFFFF",
            "&:hover": {
              background:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.20) 100%), #212121",
            },
            "&.Mui-disabled": {
              background: "#BABABA",
              color: "#6A6A6A",
            },
          },
        },
        {
          props: { variant: "black-outlined" },
          style: {
            border: "0.75px solid #212121",
            background: "#FFFFFF",
            color: "#212121",
            "&:hover": {
              background: "rgba(33, 33, 33, 0.20)",
            },
            "&.Mui-disabled": {
              background: "#FFFFFF",
              color: "#BABABA",
              borderColor: "#BABABA",
            },
          },
        },
        {
          props: { variant: "black-text" },
          style: {
            background: "transparent",
            color: "#212121",
            "&:hover": {
              background: "rgba(33, 33, 33, 0.20)",
            },
            "&.Mui-disabled": {
              color: "#BABABA",
            },
          },
        },
      ],
      styleOverrides: {
        root: {
          textTransform: "none !important",
          borderRadius: "0.375rem",
          height: "2.75rem",
          padding: "0rem 1rem",
          alignItems: "center",
          gap: "1rem",
          display: "flex",
          letterSpacing: "0.0781rem",
          fontWeight: 600,
        },
        startIcon: {
          margin: "0rem",
        },
        endIcon: {
          margin: "0rem",
        },
        sizeMedium: {
          fontSize: "1rem",
          height: "2.25rem",
          padding: "0rem 1rem",
          gap: "1rem",
          borderRadius: "0.375rem",
        },
        sizeSmall: {
          fontSize: "0.75rem", // Design Approved By Shantanu
          height: "1.75rem",
          padding: "0rem 1rem",
          gap: "1rem",
          borderRadius: "0.375rem",
        },
        sizeLarge: {
          fontSize: "1rem",
          height: "2.75rem", // Design Approved By Shantanu
          borderRadius: "0.375rem",
          minWidth: "7.5rem",
        },
      },
    },
  },
});

const ODSButton = forwardRef(
  (
    {
      onClick = () => {},
      onFileChanged = () => {},
      variant = "contained",
      ...props
    },
    ref
  ) => {
    const uploadRef = useRef();
    return (
      <ThemeProvider theme={theme}>
        <Button
          disableElevation={true}
          variant={variant}
          color={"primary"}
          size="medium"
          data-testid="ods-button"
          {...props}
          ref={ref}
          onClick={(e) => {
            e.stopPropagation(); // done to fix file upload bug
            if (props.type === "file") {
              uploadRef?.current?.click();
            } else {
              onClick(e);
            }
          }}
        >
          {props.label}
          {props.type === "file" && (
            <input
              ref={uploadRef}
              hidden
              accept={props?.accept || "*"}
              multiple={!!props?.multiple}
              type="file"
              onChange={onFileChanged}
            />
          )}
          {props?.children}
        </Button>
      </ThemeProvider>
    );
  }
);

export default ODSButton;
