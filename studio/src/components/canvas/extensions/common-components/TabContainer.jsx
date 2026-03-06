import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import {
  PillTabs,
  PillTabsList,
  PillTabsTrigger,
  PillTabsContent,
} from "@/components/ui/pill-tabs";
import { Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { cn } from "@/lib/utils";
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
      tabSize = "lg",
      ...props
    },
    ref
  ) => {
    const [activetabIndex, setActiveTabIndex] = useState(
      props?.defaultTabIndex || 0
    );
    const [isTabChanging, setIsTabChanging] = useState(false);
    const [isUnmounting, setIsUnmounting] = useState(false);

    const beforeChangeHandler = useCallback(async () => {
      setIsTabChanging(true);
      await beforeTabChange();
      setIsTabChanging(false);
    }, [beforeTabChange]);

    const handleTabChange = useCallback(
      async (newValue) => {
        const newIndex = parseInt(newValue);
        if (newIndex === activetabIndex) return;

        setIsUnmounting(true);
        await beforePanelUnmount(activetabIndex, newIndex);
        setActiveTabIndex(newIndex);
        setIsUnmounting(false);
        props?.onTabSwitch?.(newIndex);
      },
      [activetabIndex, beforePanelUnmount, props]
    );

    const goToTab = useCallback(
      (index) => {
        if (tabs?.length - 1 < index || index < 0) return;
        handleTabChange(index.toString());
      },
      [tabs?.length, handleTabChange]
    );

    useImperativeHandle(
      ref,
      () => ({
        goToTab,
        getActiveTabIndex: () => activetabIndex,
      }),
      [goToTab, activetabIndex]
    );

    const tabData = useMemo(() => {
      return (tabs || []).slice().map((d, index) => ({
        ...d,
        disabled:
          validateTabs && index !== 0
            ? !validTabIndices.includes(index - 1)
            : false,
        activeIcon:
          validateTabs && validTabIndices.includes(index) ? (
            <Check className="w-4 h-4 text-white" />
          ) : null,
        inActiveIcon:
          validateTabs && validTabIndices.includes(index) ? (
            <Check className="w-4 h-4" style={{ color: colorPalette.dark }} />
          ) : null,
        "data-testid": `node-${d?.label?.toLowerCase()}-tab`,
      }));
    }, [tabs, colorPalette.dark, validTabIndices, validateTabs]);

    // Always show tabs UI (even for single tab) - matching Canvas-Flow-Designer pixel-perfect design
    return (
      <div
        style={{
          display: "grid",
          gridTemplateRows: "1fr auto",
          height: "100%",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <PillTabs
            value={activetabIndex.toString()}
            onValueChange={handleTabChange}
            className="w-full h-full flex flex-col gap-4"
            data-testid="node-tabs"
          >
            <PillTabsList className="justify-start" size={tabSize}>
              {tabData.map((tab, index) => {
                const isActive = index === activetabIndex;
                const validationIcon = isActive
                  ? tab.activeIcon
                  : tab.inActiveIcon;

                return (
                  <PillTabsTrigger
                    key={index}
                    value={index.toString()}
                    disabled={tab.disabled}
                    size={tabSize}
                    className={cn(
                      "font-semibold",
                      tab.disabled &&
                        "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                    data-testid={tab["data-testid"]}
                  >
                    {tab.icon && <tab.icon className="w-4 h-4" />}
                    {validationIcon && (
                      <span className="w-4 h-4 flex items-center justify-center">
                        {validationIcon}
                      </span>
                    )}
                    {tab.label || tab.children}
                  </PillTabsTrigger>
                );
              })}
            </PillTabsList>
            {tabData.map((tab, index) => (
              <PillTabsContent
                key={index}
                value={index.toString()}
                className={cn(
                  "mt-0 min-h-0 overflow-hidden flex flex-col",
                  "data-[state=active]:flex-1",
                  "data-[state=inactive]:hidden",
                  "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-2",
                  "data-[state=inactive]:animate-out data-[state=inactive]:fade-out-0",
                  "data-[state=active]:duration-300 data-[state=inactive]:duration-150",
                  "transition-all ease-out"
                )}
              >
                {activetabIndex === index && !isUnmounting && (
                  <div className="flex-1 min-h-0 flex flex-col">
                    <ComponentRenderer
                      component={tab.panelComponent}
                      {...(tab.panelComponentProps || {})}
                    />
                  </div>
                )}
              </PillTabsContent>
            ))}
          </PillTabs>
        </div>
        {showCommonActionFooter && (
          <div
            className={cn(
              "px-5 py-5",
              "bg-white border-t",
              "grid grid-cols-[1fr_auto] items-center gap-4"
            )}
            style={{
              borderTopColor: "#cfd8dc",
            }}
          >
            <div className="min-w-0">
              {!!errorMessages?.[activetabIndex]?.[0] && (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-2",
                    "bg-red-50 border border-red-200 rounded-island-sm",
                    "shadow-island-sm"
                  )}
                  data-testid="node-tab-error"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm font-semibold text-red-600">
                    {errorMessages?.[activetabIndex]?.[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {activetabIndex > 0 && (
                <Button
                  variant="black-text"
                  size="large"
                  disabled={isTabChanging}
                  data-testid="node-tab-back-button"
                  style={{ color: "#000", borderColor: "#000" }}
                  onClick={async () => {
                    beforeTabChange && (await beforeChangeHandler());
                    goToTab(activetabIndex - 1);
                  }}
                >
                  BACK
                </Button>
              )}
              {activetabIndex === tabs.length - 1 && hasTestTab && (
                <Button
                  data-testid="node-tab-test-button"
                  size="large"
                  variant="black-outlined"
                  onClick={async () => {
                    beforeTabChange && (await beforeChangeHandler());
                    onTest();
                  }}
                >
                  TEST
                </Button>
              )}

              {(validTabIndices.length === tabs.length ||
                activetabIndex === tabs.length - 1) && (
                <LoadingButton
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
                >
                  CLOSE
                </LoadingButton>
              )}

              {activetabIndex !== tabs.length - 1 && (
                <LoadingButton
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
                    goToTab(activetabIndex + 1);
                  }}
                >
                  NEXT
                </LoadingButton>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default TabContainer;
