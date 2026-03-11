import { forwardRef, useImperativeHandle, useRef, useState } from "react";
// import Tab from "oute-ds-tab";
// import Button from "oute-ds-button";
import { ODSTab as Tab, ODSButton as Button } from "@src/module/ods";
const TabContainer = forwardRef(
  (
    {
      tabs = [],
      colorPalette = {},
      onSave = () => {},
      showCommonActionFooter = false,
      hasTestTab = false,
      onTest = () => {},
      ...props
    },
    ref,
  ) => {
    const tabref = useRef();
    const [activetabIndex, setActiveTabIndex] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        ...(tabref.current || {}),
      }),
      [],
    );

    return (
      <div
        style={{
          display: "grid",
          gridTemplateRows: "1fr auto",
          height: "100%",
        }}
      >
        <Tab
          ref={tabref}
          variant="standard"
          tabData={(tabs || []).slice().map((d) => ({
            ...d,
            activeBackgroundColor: colorPalette.dark,
            activeForegroundColor: colorPalette.foreground,
            iconPosition: "start",
          }))}
          TabIndicatorProps={{
            sx: {
              backgroundColor: colorPalette.light,
            },
          }}
          onTabSwitch={(index) => setActiveTabIndex(index)}
          {...props}
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
        />
        {showCommonActionFooter && (
          <div
            style={{
              padding: "1.25rem",
              display: "grid",
              gridTemplateColumns: "1fr auto",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "1rem",
                gridTemplateColumns: "repeat(3, auto)",
              }}
            >
              {activetabIndex > 0 && (
                <Button
                  variant="black-outlined"
                  label="BACK"
                  size="large"
                  sx={{ color: "#000", borderColor: "#000" }}
                  onClick={() => tabref.current.goToTab(activetabIndex - 1)}
                />
              )}
              {activetabIndex !== tabs.length - 1 && (
                <Button
                  label={"NEXT"}
                  variant="black"
                  size="large"
                  onClick={() => {
                    onSave(true);
                    tabref.current.goToTab(activetabIndex + 1);
                  }}
                />
              )}
              {activetabIndex === tabs.length - 1 && hasTestTab && (
                <Button
                  label={"TEST"}
                  size="large"
                  variant="black"
                  onClick={() => onTest()}
                />
              )}
              {activetabIndex === tabs.length - 1 && (
                <Button
                  label={"CLOSE"}
                  variant="black"
                  size="large"
                  onClick={() => onSave(false)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

export default TabContainer;
