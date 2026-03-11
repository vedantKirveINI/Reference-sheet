import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
// import Tab from "oute-ds-tab";
// import Icon from "oute-ds-icon";
// import AdvancedLabel from "oute-ds-advanced-label";
// import Button from "oute-ds-button";
// import LoadingButton from "oute-ds-loading-button";
import { ODSTab as Tab, ODSIcon as Icon, ODSAdvancedLabel as AdvancedLabel, ODSButton as Button, ODSLoadingButton as LoadingButton } from "@src/module/ods";
import ComponentRenderer from "./ComponentRenderer";
const TabContainer = forwardRef(
  (
    {
      tabs = [],
      colorPalette = {},
      validTabIndices = [],
      errorMessages = [],
      onSave = () => {},
      validateTabs = false,
      showCommonActionFooter = false,
      hasTestTab = false,
      onTest = () => {},
      beforePanelUnmount = () => {},
      beforeTabChange,
      showBottomBorder = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const tabref = useRef();
    const [activetabIndex, setActiveTabIndex] = useState(
      props?.defaultTabIndex || 0
    );
    const [isTabChanging, setIsTabChanging] = useState(false);

    const beforeChangeHandler = useCallback(async () => {
      setIsTabChanging(true);
      await beforeTabChange();
      setIsTabChanging(false);
    }, [beforeTabChange]);

    useImperativeHandle(
      ref,
      () => ({
        ...(tabref.current || {}),
      }),
      []
    );

    return (
      <div
        style={{
          display: "grid",
          gridTemplateRows: "1fr auto",
          height: "100%",
        }}
      >
        {tabs?.length > 1 ? (
          <div
            style={{
              height: "100% ",
              width: "100%",
              overflow: "hidden",
              borderBottom:
                showBottomBorder && `0.75px solid ${colorPalette.light}`,
            }}
          >
            <Tab
              ref={tabref}
              beforePanelUnmount={beforePanelUnmount}
              variant="standard"
              tabData={(tabs || []).slice().map((d, index) => ({
                ...d,
                activeBackgroundColor: colorPalette.dark,
                activeForegroundColor: colorPalette.foreground,
                disabled:
                  validateTabs && index !== 0
                    ? !validTabIndices.includes(index - 1)
                    : false,
                activeIcon:
                  validateTabs && validTabIndices.includes(index) ? (
                    <Icon
                      outeIconName="OUTEDoneIcon"
                      outeIconProps={{
                        sx: { color: "#fff" },
                      }}
                    />
                  ) : null,
                inActiveIcon:
                  validateTabs && validTabIndices.includes(index) ? (
                    <Icon
                      outeIconName="OUTEDoneIcon"
                      outeIconProps={{
                        sx: { color: colorPalette.dark },
                      }}
                    />
                  ) : null,
                iconPosition: "start",
                "data-testid": `node-${d?.label?.toLowerCase()}-tab`,
              }))}
              TabIndicatorProps={{
                sx: {
                  backgroundColor: colorPalette.light,
                },
              }}
              {...props}
              onTabSwitch={(index) => {
                setActiveTabIndex(index);
                props?.onTabSwitch?.(index);
              }}
              sx={{
                padding: "0 1rem",
                boxSizing: "border-box",
                borderColor: colorPalette.dark,
                "& .MuiButtonBase-root": {
                  height: "2.75rem",
                  font: "var(--body2) !important",
                  fontWeight: "var(--font-weight-bold) !important",
                },
                ...(props.sx || {}),
              }}
              data-testid="node-tabs"
            />
          </div>
        ) : (
          <div
            style={{
              borderTop: `0.75px solid ${colorPalette.dark}`,
              borderBottom: `0.75px solid ${colorPalette.light}`,
              height: "100% ",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <ComponentRenderer
              component={tabs[0]?.panelComponent}
              {...(tabs[0]?.panelComponentProps || {})}
            />
          </div>
        )}
        {showCommonActionFooter && (
          <div
            style={{
              padding: "1.25rem",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
            }}
          >
            <div>
              {!!errorMessages?.[activetabIndex]?.[0] && (
                <AdvancedLabel
                  fullWidth={true}
                  labelProps={{
                    variant: "var(--body2)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "#ef4444",
                  }}
                  leftAdornment={
                    <Icon
                      outeIconName="OUTEWarningIcon"
                      outeIconProps={{
                        sx: {
                          color: "#ef4444",
                        },
                      }}
                    />
                  }
                  data-testid="node-tab-error"
                  labelText={errorMessages?.[activetabIndex]?.[0]}
                />
              )}
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                gridTemplateColumns: "repeat(3, auto)",
              }}
            >
              {activetabIndex > 0 && (
                <Button
                  variant="black-text"
                  label="BACK"
                  size="large"
                  disabled={isTabChanging}
                  data-testid="node-tab-back-button"
                  sx={{ color: "#000", borderColor: "#000" }}
                  onClick={async () => {
                    beforeTabChange && (await beforeChangeHandler());
                    tabref.current.goToTab(activetabIndex - 1);
                  }}
                />
              )}
              {activetabIndex === tabs.length - 1 && hasTestTab && (
                <Button
                  label={"TEST"}
                  data-testid="node-tab-test-button"
                  size="large"
                  variant="black-outlined"
                  onClick={async () => {
                    beforeTabChange && (await beforeChangeHandler());
                    onTest();
                  }}
                />
              )}

              {(validTabIndices.length === tabs.length ||
                activetabIndex === tabs.length - 1) && (
                <LoadingButton
                  label={"CLOSE"}
                  variant={
                    activetabIndex === tabs.length - 1
                      ? "black"
                      : "black-outlined"
                  }
                  data-testid="node-tab-close-button"
                  size="large"
                  disabled={
                    validateTabs && !validTabIndices.includes(activetabIndex)
                  }
                  loading={isTabChanging}
                  onClick={async () => {
                    beforeTabChange && (await beforeChangeHandler());
                    onSave(false);
                  }}
                />
              )}

              {activetabIndex !== tabs.length - 1 && (
                <LoadingButton
                  label={"NEXT"}
                  variant="black"
                  size="large"
                  loading={loading}
                  data-testid="node-tab-next-button"
                  disabled={
                    (validateTabs &&
                      !validTabIndices.includes(activetabIndex)) ||
                    isTabChanging
                  }
                  onClick={async () => {
                    beforeTabChange && (await beforeChangeHandler());
                    onSave(true);
                    tabref.current.goToTab(activetabIndex + 1);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default TabContainer;
