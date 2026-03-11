import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ODSTab as Tab, ODSButton as Button } from "@src/module/ods";
import { cn } from "@/lib/utils";
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
      <div className="grid grid-rows-[1fr_auto] h-full">
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
          
        />
        {showCommonActionFooter && (
          <div className="p-5 grid grid-cols-[1fr_auto]">
            <div className="flex gap-4">
              {activetabIndex > 0 && (
                <Button
                  variant="black-outlined"
                  label="BACK"
                  size="large"
                  style={{ color: "#000", borderColor: "#000" }}
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
