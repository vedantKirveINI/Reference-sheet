import React from "react";
import LoadingButtonMUI from "@mui/lab/LoadingButton";

import { createTheme, ThemeProvider } from "@mui/material/styles";
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
          borderRadius: ".375rem",
          display: "flex",
          gap: "1rem",
          letterSpacing: ".078rem",
          fontWeight: 600,
        },
        startIcon: {
          margin: 0,
        },
        endIcon: {
          margin: 0,
        },
        sizeMedium: {
          fontSize: "1rem",
          height: "2.25rem",
          padding: "0rem 1rem",
          gap: "1rem",
          borderRadius: "0.375rem",
        },
        sizeSmall: {
          fontSize: "0.75rem",
          height: "1.75rem",
          padding: "0rem 1rem",
          gap: "1rem",
          borderRadius: "0.375rem",
        },
        sizeLarge: {
          fontSize: "1rem",
          height: "2.75rem",
          borderRadius: "0.375rem",
          minWidth: "7.5rem",
        },
      },
    },
  },
});
const LoadingButton = ({ label, ...props }) => {
  return (
    <ThemeProvider theme={theme}>
      <LoadingButtonMUI
        disableElevation={true}
        variant="contained"
        color="primary"
        size="medium"
        {...props}
      >
        {label}
      </LoadingButtonMUI>
    </ThemeProvider>
  );
};

export default LoadingButton;
