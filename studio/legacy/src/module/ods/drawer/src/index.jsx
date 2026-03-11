import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
// import ODSIcon from "oute-ds-icon";
// import default_theme from "oute-ds-shared-assets";
import { ODSIcon } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import classes from "./index.module.css";

const theme = createTheme({
  ...default_theme,
});
const ODSDrawer = forwardRef((props, ref) => {
  const {
    open = true,
    drawerWidth = "",
    showCloseIcon = false,
    anchor = "left",
    resizable = false,
    onDrawerHide = () => {},
    onDrawerResize = () => {},
    minDrawerWidth = "18.75rem",
    maxDrawerWidth = "31.25rem",
    variant = "persistent",
    className = "",
    drawerBackgroundColor = "transparent",
    title,
    showFullscreenIcon, // Filter out this prop to prevent it from reaching DOM
    showSidebar, // Filter out this prop if it exists
    sidebarProps, // Filter out this prop if it exists
    sliderProps, // Filter out this prop if it exists
    onSidebarToggle, // Filter out this prop if it exists
    onSidebarActionClick, // Filter out this prop if it exists
    onSidebarPanelClose, // Filter out this prop if it exists
    removeContentPadding, // Filter out this prop if it exists
    allowContentOverflow, // Filter out this prop if it exists
    beforeClose, // Filter out this prop if it exists
    loading, // Filter out this prop if it exists
    dividers, // Filter out this prop if it exists
    ...others
  } = props;
  const [width, setWidth] = useState(drawerWidth);
  const [isResizing, setIsResizing] = useState(false);
  const THROTTLE_TIME_IN_MS = 1000;
  const handleMousedown = () => {
    setIsResizing(true);
  };
  const handleMouseup = () => {
    setIsResizing(false);
  };
  const handleMouseMoveLeftAnchor = useCallback(
    (e) => {
      if (!isResizing) {
        return;
      }
      throttle(
        (() => {
          let width = e.clientX;

          if (width > maxDrawerWidth || width < minDrawerWidth) {
            return;
          }
          setWidth(width);
          onDrawerResize(width);
        })()
      );
    },
    [isResizing, maxDrawerWidth, minDrawerWidth, onDrawerResize]
  );
  const handleMouseMoveRightAnchor = useCallback(
    (e) => {
      if (!isResizing) {
        return;
      }
      throttle(
        (() => {
          let width =
            document.body.offsetWidth - (e.clientX - document.body.offsetLeft);

          if (width > maxDrawerWidth || width < minDrawerWidth) {
            return;
          }
          setWidth(width);
          onDrawerResize(width);
        })()
      );
    },
    [isResizing, maxDrawerWidth, minDrawerWidth, onDrawerResize]
  );
  const throttle = (fn) => {
    var allow = true;
    const enable = () => {
      allow = true;
    };
    return (e) => {
      if (allow) {
        allow = false;
        setTimeout(enable, THROTTLE_TIME_IN_MS);
        fn.call(this, e);
      }
    };
  };
  useEffect(() => {
    if (resizable) document.addEventListener("mouseup", handleMouseup, false);
    return () => {
      document.removeEventListener("mouseup", handleMouseup, false);
    };
  }, [resizable]);
  useEffect(() => {
    if (resizable && anchor === "right") {
      document.addEventListener("mousemove", handleMouseMoveRightAnchor, false);
    }
    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMoveRightAnchor,
        false
      );
    };
  }, [resizable, anchor, handleMouseMoveRightAnchor]);
  useEffect(() => {
    if (resizable && anchor === "left") {
      document.addEventListener("mousemove", handleMouseMoveLeftAnchor, false);
    }
    return () => {
      document.removeEventListener(
        "mousemove",
        handleMouseMoveLeftAnchor,
        false
      );
    };
  }, [resizable, anchor, handleMouseMoveLeftAnchor]);
  useEffect(() => {
    if (!resizable) {
      setWidth(drawerWidth);
    }
  }, [resizable, drawerWidth]);
  return (
    <ThemeProvider theme={theme}>
      <MuiDrawer
        {...others}
        sx={{
          width,
          // position: "relative",
          ...(others?.sx || {}),
        }}
        className={`${classes["oute-ds-drawer"]} ${classes[anchor]} ${classes[variant]} ${classes[className]}`}
        variant={variant}
        anchor={anchor}
        open={open}
        ref={ref}
        PaperProps={{
          sx: {
            width,
            boxSizing: "border-box",
            borderRightWidth: "0.047rem",
            background:
              default_theme.palette["oute-background-color"] ||
              drawerBackgroundColor,
            position: "absolute",
          },
        }}
      >
        {showCloseIcon && (
          <div className={classes["drawer-header"]}>
            <IconButton
              disableRipple
              disableFocusRipple
              disableTouchRipple
              onClick={onDrawerHide}
            >
              {anchor === "left" ? (
                <ODSIcon outeIconName="OUTEChevronLeftIcon" />
              ) : (
                <ODSIcon outeIconName="OUTEChevronRightIcon" />
              )}
            </IconButton>
            {title}
          </div>
        )}
        {props.children}
        {resizable && (
          <div
            className={classes["dragger"]}
            style={{
              ...(anchor === "left" ? { left: width } : { right: width }),
            }}
            onMouseDown={(event) => {
              handleMousedown(event);
            }}
          />
        )}
        {isResizing && <div className={classes["resize-overlay"]}></div>}
      </MuiDrawer>
    </ThemeProvider>
  );
});
export default ODSDrawer;
