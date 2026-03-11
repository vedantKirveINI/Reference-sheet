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
import { createTheme, ThemeProvider } from "@mui/material/styles";
// import default_theme from "oute-ds-shared-assets";
import { ODSButton, ODSDialog } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
const theme = createTheme({
  ...default_theme,
  typography: {},
  components: {
    ...default_theme.components,
    MuiTab: {
      styleOverrides: {
        root: {
          gap: "0.5rem", // added this for spacing between icon and text.
          borderRadius: ".75rem",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          borderRadius: ".625rem",
          width: "100%",
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          minHeight: "2.5rem !important",
          height: "2.5rem",
          textTransform: "none !important",
          color: `${default_theme.palette.grey["A100"]} !important`,
          marginBottom: ".5rem !important",
          fontSize: "1rem !important",
          padding: ".75rem .5rem !important",
        },
      },
    },
  },
});
const TabPanel = (props) => {
  const { component: Component, componentProps = {}, index, ...other } = props;
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
      <Component {...componentProps} />
    </div>
  );
};
const ODSVTab = forwardRef(
  (
    {
      tabData = [],
      onTabSwitch = () => {},
      showConfirmDialogOnTabSwitch = false,
      confirmDialogProps = {},
      defaultTabIndex = 0,
      divider = false,
      variant = "scrollable",
      scrollButtons = false, // hide/shows the scroll up/down button
      visibleScrollbar = true, // hide/shows the scrollbar
    },
    ref
  ) => {
    const [value, setValue] = useState(defaultTabIndex);
    const [showDialog, setShowDialog] = useState(null);

    /***
     * The `newValue` parameter represents the index of the tab that is clicked.
     * If the `showConfirmDialogOnTabSwitch` prop is set to true, we avoid directly updating the state with the index of the clicked tab.
     * Instead, we store the value in the `setShowDialog` state. This allows us to control when to show the confirmation dialog and also to update the selected tab index in ConfirmDialogOnTabSwitch actions.
     * If the `showConfirmDialogOnTabSwitch` prop is false, we proceed to update the state (`setValue`) with the index of the tab that was clicked.
     * Additionally, the `onTabSwitch` callback is invoked with the same index to handle any further actions related to tab switching.
     */
    const handleChange = (event, newValue) => {
      if (showConfirmDialogOnTabSwitch) {
        // Store the index of the clicked tab in the `setShowDialog` state
        return setShowDialog(newValue);
      }

      // Update the state with the index of the clicked tab
      setValue(newValue);

      // Trigger the onTabSwitch callback with the same index
      onTabSwitch(newValue);
    };

    const updateTabIndex = useCallback(
      (tabIndex) => {
        if (tabData?.length - 1 < tabIndex) return;
        setValue(tabIndex);
      },
      [tabData?.length]
    );

    const otherTabProps = (index) => {
      return {
        id: `oute-tab-${index}`,
        "aria-controls": `oute-tabpanel-${index}`,
      };
    };
    const renderTabs = (tabData) => {
      let tabs = [];
      let groups = {};

      for (const [index, t] of tabData.entries()) {
        const {
          // eslint-disable-next-line no-unused-vars
          panelComponent,
          // eslint-disable-next-line no-unused-vars
          panelComponentProps,
          icon,
          isGroup = false,
          groupId,
          parentGroup,
          sx = {},
          ...tabProps
        } = t;
        if (isGroup || !parentGroup) {
          tabs.push(
            <Tab
              key={`oute-tabpanel-${index}-key`}
              sx={{
                margin: 0,
                "&.MuiButtonBase-root": {
                  justifyContent:
                    tabProps?.iconPosition === "more-options"
                      ? "space-between"
                      : "center",
                },
                "& .MuiTab-iconWrapper": {
                  zIndex: tabProps?.iconPosition === "more-options" ? 1 : 0,
                },
                "& .MuiIconButton-root": {
                  zIndex: tabProps?.iconPosition === "more-options" ? 1 : 0,
                },
                ...sx,
              }}
              onClick={() => {
                if (isGroup) setValue(index + 1);
              }}
              {...tabProps}
              iconPosition={
                tabProps?.iconPosition === "more-options"
                  ? "end"
                  : tabProps?.iconPosition
              }
              icon={icon || null}
              {...otherTabProps(index)}
            />
          );
          if (isGroup) {
            groups = {
              ...groups,
              [groupId]: {
                index: tabs.length - 1,
                noOfChild: 0,
              },
            };
          } // Store the group's index
        }
        if (parentGroup) {
          const parentIndex = groups[parentGroup]["index"];
          let childIndex = groups[parentGroup]["noOfChild"];
          if (parentIndex !== -1) {
            tabs.splice(
              parentIndex + childIndex + 1,
              0,
              <Tab
                key={`oute-tabpanel-${index}-key`}
                sx={{
                  marginLeft: "8px",
                  "&.MuiButtonBase-root": {
                    justifyContent:
                      tabProps?.iconPosition === "more-options"
                        ? "space-between"
                        : "center",
                  },
                  "& .MuiTab-iconWrapper": {
                    zIndex: tabProps?.iconPosition === "more-options" ? 1 : 0,
                  },
                  "& .MuiIconButton-root": {
                    zIndex: tabProps?.iconPosition === "more-options" ? 1 : 0,
                  },
                }}
                {...tabProps}
                iconPosition={
                  tabProps?.iconPosition === "more-options"
                    ? "end"
                    : tabProps?.iconPosition
                }
                icon={icon || null}
                {...otherTabProps(index)}
              />
            );
          }
          groups[parentGroup]["noOfChild"]++;
        }
      }
      return tabs;
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
          goToTab: updateTabIndex,
        };
      },
      [updateTabIndex]
    );

    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="oute-tabs"
            orientation="vertical"
            variant={variant}
            scrollButtons={scrollButtons}
            visibleScrollbar={visibleScrollbar}
            sx={{
              padding: divider ? "0 .5rem" : 0,
              borderRight: divider ? ".0469rem solid" : 0,
              borderColor: "divider",
              boxSizing: "border-box",
            }}
          >
            {renderTabs(tabData)}
          </Tabs>
          {value !== -1 && (
            <TabPanel
              index={value}
              component={panelComponent}
              componentProps={panelComponentProps}
            />
          )}
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
                  onClick={() => {
                    setShowDialog(null);
                  }}
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
                />
              </>
            }
          />
        </Box>
      </ThemeProvider>
    );
  }
);

export default ODSVTab;
