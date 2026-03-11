import React, { useCallback, useRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import ODSLabel from "oute-ds-label";
// // import ODSContextMenu from "oute-ds-context-menu";
// import default_theme from "oute-ds-shared-assets";
import { ODSLabel } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiBreadcrumbs: {
      styleOverrides: {
        ol: {
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
        },
      },
    },
  },
});
const ODSBreadcrumbs = ({
  breadcrumbs = [],
  enableNavigation = true,
  variant = "body1",
  ...props
}) => {
  const menuAchorRef = useRef();
  const clickHandler = useCallback(
    (e, b) => {
      b?.onClick && b.onClick(e);
      enableNavigation &&
        b?.navigateToPath &&
        window.history.pushState({}, "", b?.navigateToPath);
    },
    [enableNavigation]
  );

  const getLabel = (b, index) => {
    return (
      <ODSLabel
        key={`label_${b.label}_${index}`}
        sx={{
          width: "auto",
          maxWidth: "100%",
          cursor: enableNavigation ? "pointer" : "default",
        }}
        ref={index === breadcrumbs.length - 1 ? menuAchorRef : null}
        variant={variant}
        onClick={(e) => clickHandler(e, b)}
        color={
          index === breadcrumbs.length - 1
            ? default_theme.palette.grey["A100"]
            : default_theme.palette.grey[500]
        }
      >
        {b?.label}
      </ODSLabel>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Breadcrumbs maxItems={2} {...props}>
        {breadcrumbs?.map((b, index) => {
          if (enableNavigation) {
            return (
              <Link underline="hover" key={`link_${b.label}_${index}`} href="#">
                {getLabel(b, index)}
              </Link>
            );
          } else {
            return getLabel(b, index);
          }
        })}
      </Breadcrumbs>
    </ThemeProvider>
  );
};

export default ODSBreadcrumbs;
