import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
// import ODSButton from "oute-ds-button";
// import ODSDialog from "oute-ds-dialog";
// import CircularProgress from "oute-ds-circular-progress";
// import default_theme from "oute-ds-shared-assets";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ODSButton, ODSDialog, ODSCircularProgress as CircularProgress } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  components: {
    ...default_theme.components,
    MuiTab: {
      styleOverrides: {
        root: {
          gap: "0.5rem", // added this for spacing between icon and text.
          borderTopLeftRadius: "0.625rem",
          borderTopRightRadius: "0.625rem",
          minHeight: "auto !important",
          textTransform: "none !important",
          fontSize: "1rem !important",
          lineHeight: "1.75rem !important",
          letterSpacing: "0.00938rem !important",
          fontWeight: 400,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "auto !important",
        },
        flexContainer: {
          gap: "0.75rem",
        },
      },
    },
  },
});
const TabPanel = ({
  component: Component,
  componentProps = {},
  index,
  ...other
}) => {
  return (
    <div
      role="tabpanel"
      id={`oute-tabpanel-${index}`}
      aria-labelledby={`oute-tab-${index}`}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
      {...other}
    >
      {Component ? (
        <Component {...componentProps} ref={componentProps?.ref} />
      ) : null}
    </div>
  );
};
const ODSTab = forwardRef(
  (
    {
      tabData = [],
      variant = "fullWidth", // Default remains unchanged
      showConfirmDialogOnTabSwitch = false,
      confirmDialogProps = {},
      onTabSwitch = () => {},
      defaultTabIndex = 0,
      scrollButtons = false,
      visibleScrollbar = false,
      beforePanelUnmount = () => {},
      ...props
    },
    ref
  ) => {
    const [isUnmounting, setIsUnmounting] = useState(false);
    const [value, setValue] = useState(defaultTabIndex);
    const [showDialog, setShowDialog] = useState(null);

    const isBlackVariant = variant === "black" || variant === "black-standard"; // ✅ Check for black variant
    /***
     * The `newValue` parameter represents the index of the tab that is clicked.
     * If the `showConfirmDialogOnTabSwitch` prop is set to true, we avoid directly updating the state with the index of the clicked tab.
     * Instead, we store the value in the `setShowDialog` state. This allows us to control when to show the confirmation dialog and also to update the selected tab index in ConfirmDialogOnTabSwitch actions.
     * If the `showConfirmDialogOnTabSwitch` prop is false, we proceed to update the state (`setValue`) with the index of the tab that was clicked.
     * Additionally, the `onTabSwitch` callback is invoked with the same index to handle any further actions related to tab switching.
     */
    const handleChange = useCallback(
      async (event, newValue) => {
        setIsUnmounting(true);
        await beforePanelUnmount(value, newValue);
        if (showConfirmDialogOnTabSwitch) {
          // Store the index of the clicked tab in the `setShowDialog` state
          return setShowDialog(newValue);
        }

        // Update the state with the index of the clicked tab
        setValue(newValue);

        // Trigger the onTabSwitch callback with the same index
        onTabSwitch(newValue);
        setIsUnmounting(false);
      },
      [beforePanelUnmount, onTabSwitch, showConfirmDialogOnTabSwitch, value]
    );
    const otherTabProps = (index) => {
      return {
        id: `oute-tab-${index}`,
        "aria-controls": `oute-tabpanel-${index}`,
      };
    };

    // useEffect to handle updates when the tabData or value changes
    useEffect(() => {
      // Check if there are no tabs available
      if (tabData?.length === 0) {
        // Set the value to -1 to indicate no selected tab if there are no tabs
        setValue(-1);
      }

      // Check if the current value exceeds the index of the last tab in tabData
      if (value > tabData?.length - 1) {
        // Adjust the value to the index of the last tab to prevent out-of-bounds errors
        setValue((prevValue) => prevValue - 1);
      }
    }, [tabData?.length, value]);

    // Memoized computation of the current panel component to be rendered
    const panelComponent = useMemo(() => {
      // Check if there are no tabs available
      if (tabData?.length === 0) {
        return; // Return undefined if there are no tabs
      }

      // Check if the current tab has a specific panelComponent
      if (tabData[value]?.panelComponent) {
        return tabData[value]?.panelComponent; // Return the panelComponent of the current tab
      }

      // If the current tab doesn't have a specific panelComponent,
      // fallback to the panelComponent of the previous tab (if available)
      if (!tabData[value]?.panelComponent) {
        return tabData[value - 1]?.panelComponent; // Return the panelComponent of the previous tab
      }
    }, [tabData, value]);

    // Memoized computation of the props for the current panel component
    const panelComponentProps = useMemo(() => {
      // Check if the current tab has data and if it has specific panelComponentProps
      return !!tabData[value] && !!tabData[value]?.panelComponentProps
        ? tabData[value].panelComponentProps // Return the panelComponentProps of the current tab
        : {}; // Return an empty object if there are no specific panelComponentProps
    }, [tabData, value]);

    useImperativeHandle(
      ref,
      () => {
        return {
          goToTab: (index) => {
            if (tabData?.length - 1 < index) return;
            setValue(index);
            onTabSwitch(index);
          },
          getActiveTabIndex: () => {
            return value;
          },
        };
      },
      [onTabSwitch, tabData?.length, value]
    );
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "auto 1fr",
            width: "100%",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <Tabs
            variant={
              variant === "black"
                ? "fullWidth"
                : variant === "black-standard"
                ? "standard"
                : variant
            }
            value={value}
            onChange={handleChange}
            aria-label="oute-tabs"
            orientation="horizontal"
            scrollButtons={scrollButtons}
            visibleScrollbar={visibleScrollbar}
            {...props}
            sx={{
              borderBottom: "0.046878rem solid",
              borderColor: "divider",
              ...(isBlackVariant && {
                "& .MuiTabs-indicator": {
                  backgroundColor: "black",
                },
              }),
              ...(props.sx || {}),
            }}
          >
            {tabData.map((t, index) => {
              const {
                // eslint-disable-next-line no-unused-vars
                panelComponent,
                // eslint-disable-next-line no-unused-vars
                panelComponentProps,
                activeIcon,
                inActiveIcon,
                activeBackgroundColor = isBlackVariant
                  ? "white"
                  : "transparent",
                inActiveBackgroundColor = isBlackVariant
                  ? "white"
                  : "transparent",
                activeForegroundColor = isBlackVariant
                  ? "black"
                  : default_theme.palette.primary.main,
                inActiveForegroundColor = isBlackVariant ? "black" : "#607D8B",
                ...tabProps
              } = t;
              /**
               * If activeIcon is provided, show the activeIcon when tab is active.
               * If activeIcon is not provided, no icon will be shown when tab is active.
               * If inActiveIcon is provided, show the inactiveIcon when tab is inactive.
               * If inActiveIcon is not provided, then either activeIcon will be shown (if provided)
               * else no icon will be show when tab is inactive.
               *
               */
              const _activeIcon = activeIcon || null;
              const _inActiveIcon = inActiveIcon || _activeIcon;
              return (
                <Tab
                  key={`oute-tabpanel-${index}-key`}
                  data-testid={`oute-ds-tab-${index}`}
                  {...tabProps}
                  icon={
                    value === index ? (
                      isUnmounting ? (
                        <CircularProgress size={16} />
                      ) : (
                        _activeIcon
                      )
                    ) : (
                      _inActiveIcon
                    )
                  }
                  sx={{
                    background:
                      value === index
                        ? activeBackgroundColor
                        : inActiveBackgroundColor,
                    color: inActiveForegroundColor,
                    "&.Mui-selected": {
                      color: activeForegroundColor,
                    },
                    flexDirection: "row",
                    alignItems: "center",
                    ...(tabProps?.sx || {}),
                  }}
                  disabled={
                    (isUnmounting && value !== index) || tabProps?.disabled
                  }
                  {...otherTabProps(index)}
                />
              );
            })}
          </Tabs>
          <TabPanel
            index={value}
            component={panelComponent}
            componentProps={panelComponentProps}
          />
          {/* Rendering a confirmation dialog if showConfirmDialogOnTabSwitch is true and showDialog is not null */}
          <ODSDialog
            open={showConfirmDialogOnTabSwitch && showDialog !== null}
            showFullscreenIcon={false}
            // Dynamically setting the dialog title based on confirmDialogProps
            dialogTitle={confirmDialogProps?.title}
            // Dynamically setting the dialog content based on confirmDialogProps
            dialogContent={confirmDialogProps?.content}
            dialogActions={
              <>
                {/* Cancel button with optional label, defaulting to "DON'T LEAVE" */}
                <ODSButton
                  variant="outlined"
                  size="small"
                  label={confirmDialogProps?.cancelLabel || "DON'T LEAVE"}
                  // Click handler to close the dialog without switching tabs
                  onClick={() => setShowDialog(null)}
                  data-testid="oute-ds-tab-confirm-dialog-cancel"
                />
                {/* Confirm (OK) button with optional label, defaulting to "LEAVE" */}
                <ODSButton
                  size="small"
                  label={confirmDialogProps?.okLabel || "LEAVE"}
                  // Click handler to switch tabs, trigger onTabSwitch callback, and close the dialog
                  onClick={() => {
                    setValue(showDialog);
                    onTabSwitch(showDialog);
                    setShowDialog(null);
                  }}
                  data-testid="oute-ds-tab-confirm-dialog-ok"
                />
              </>
            }
            data-testid="oute-ds-tab-confirm-dialog"
          />
        </Box>
      </ThemeProvider>
    );
  }
);

export default ODSTab;
