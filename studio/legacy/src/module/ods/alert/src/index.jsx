import React, { useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import AlertWrapper from './AlertWrapper.jsx';
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import { showAlert } from './utils.jsx';
export { showAlert };
const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          background: default_theme.palette["grey"]["A100"],
          borderRadius: "0.5rem",
        },
      },
    },
  },
});
const ODSAlert = ({
  autoHideDuration = 3000,
  anchorOrigin = {
    vertical: "top",
    horizontal: "right",
  },
  open = false,
  type,
  children,
  progressProps = {},
  showProgress = true,
  ...props
}) => {
  const [showSnackbar, setShowSnackbar] = useState(open);
  const handleClose = (e, reason) => {
    if (reason === "timeout") setShowSnackbar(false);
    !!props?.onClose && props.onClose(e, reason);
  };
  return (
    <ThemeProvider theme={theme}>
      <Snackbar
        anchorOrigin={anchorOrigin}
        autoHideDuration={autoHideDuration}
        open={showSnackbar}
        onClose={handleClose}
        message={
          <AlertWrapper
            progressProps={progressProps}
            autoHideDuration={autoHideDuration}
            type={type}
            showProgress={showProgress}
          >
            {children}
          </AlertWrapper>
        }
        data-testid="ods-alert"
        {...props}
      />
    </ThemeProvider>
  );
};

export default ODSAlert;
