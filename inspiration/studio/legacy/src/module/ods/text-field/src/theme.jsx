import { createTheme } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import {
  MUIInputLabelAsteriskStyleOverride,
  MUIInputLabelShrinkStyleOverride,
} from './style.jsx';

export const textFieldTheme = (errorType) =>
  createTheme({
    ...default_theme,
    components: {
      ...default_theme.components,
      MuiTextField: {
        styleOverrides: {
          root: {
            "&.black .MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "#212121 !important",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#212121 !important",
                borderWidth: "2px",
              },
              "&.Mui-error fieldset": {
                borderColor: errorType === "icon" ? "#90a4ae" : "var(--error)",
              },
            },
            "&.black .MuiInputLabel-outlined": {
              color: "#212121",
              "&.Mui-focused": {
                color: "#212121",
              },
              "&.Mui-error": {
                color: errorType === "icon" ? "inherit" : "red",
              },
            },
            "&.black .MuiOutlinedInput-input": {
              color: "#212121",
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "#a4a9ab",
            transform: "translate(0.625rem, 50%)",
          },
          sizeSmall: {
            transform: "translate(0.325rem, 30%)",
          },
          shrink: MUIInputLabelShrinkStyleOverride,
          asterisk: MUIInputLabelAsteriskStyleOverride,
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            background: "#fff",
          },
          input: {
            font: "var(--body1)",
            color: default_theme.palette["grey"]["A100"],
            letterSpacing: "var(--body1-letter-spacing)",
            padding: "0rem !important",
            "&::placeholder": {
              color: "#607D8B",
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: ".375rem",
            padding: "0.625rem",
            gap: "0.625rem",
          },
          sizeSmall: {
            padding: "0.325rem",
            gap: "0.325rem",
          },
          notchedOutline: {
            top: 0,
            "& legend": {
              display: "none",
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            margin: 0,
            bottom: "-1.5rem",
            left: "0.75rem",
            position: "absolute",
            width: "calc(100% - 1.5rem)",
            height: "1.25rem",
            overflow: "auto hidden",
            whiteSpace: "nowrap",
            font: "var(--subtitle2)",
            letterSpacing: "var(--subtitle2-letter-spacing)",
            "&::-webkit-scrollbar": {
              display: "none",
              width: 0,
              height: 0,
            },
          },
        },
      },
    },
  });
