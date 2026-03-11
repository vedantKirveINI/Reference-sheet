import { createTheme } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;

export const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiPopover: {
      styleOverrides: {
        root: {
          position: "static",
        },
      },
    },
  },
});
