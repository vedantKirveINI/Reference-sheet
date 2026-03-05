import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ODSButton, ODSDialog } from "../../index.js";
import { cn } from "@/lib/utils";

const figmaVerticalListStyles = [
  "flex flex-col items-stretch gap-1 p-3",
  "bg-white",
  "rounded-xl",
  "border border-gray-200",
  "w-auto min-w-[180px]",
].join(" ");

const figmaVerticalTriggerBase = [
  "relative flex items-center gap-3",
  "px-4 py-3 min-h-[44px]",
  "rounded-lg",
  "text-sm font-semibold uppercase tracking-[0.5px]",
  "transition-all duration-200 ease-out",
  "outline-none select-none cursor-pointer",
  "w-full text-left",
].join(" ");

const figmaVerticalTriggerInactive = [
  "text-[#607d8b]",
  "bg-transparent",
  "hover:bg-gray-50 hover:text-[#455a64]",
].join(" ");

const figmaVerticalTriggerActive = [
  "bg-[#fb6d2b]",
  "text-white",
  "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
  "before:w-1 before:h-6 before:bg-white/65 before:rounded-r-full",
].join(" ");

const figmaVerticalTriggerDisabled = [
  "opacity-40 pointer-events-none cursor-not-allowed",
].join(" ");

const figmaVerticalTriggerChild = [
  "ml-4 pl-4",
  "border-l-2 border-gray-200",
].join(" ");

const TabPanel = (props) => {
  const { component: Component, componentProps = {}, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      id={`oute-tabpanel-${index}`}
      aria-labelledby={`oute-tab-${index}`}
      className="w-full h-full overflow-hidden"
      {...other}
    >
      {Component ? <Component {...componentProps} /> : null}
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
      scrollButtons = false,
      visibleScrollbar = true,
      className,
      tabListClassName,
      tabTriggerClassName,
    },
    ref
  ) => {
    const [value, setValue] = useState(defaultTabIndex);
    const [showDialog, setShowDialog] = useState(null);

    const handleChange = (event, newValue) => {
      if (showConfirmDialogOnTabSwitch) {
        return setShowDialog(newValue);
      }
      setValue(newValue);
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

    const getTabTriggerStyles = (isActive, isDisabled, isChild, customClassName) => {
      return cn(
        figmaVerticalTriggerBase,
        isActive ? figmaVerticalTriggerActive : figmaVerticalTriggerInactive,
        isDisabled && figmaVerticalTriggerDisabled,
        isChild && figmaVerticalTriggerChild,
        tabTriggerClassName,
        customClassName
      );
    };

    const renderTabs = (tabData) => {
      let tabs = [];
      let groups = {};

      for (const [index, t] of tabData.entries()) {
        const {
          panelComponent,
          panelComponentProps,
          icon,
          isGroup = false,
          groupId,
          parentGroup,
          sx = {},
          ...tabProps
        } = t;

        const isActive = value === index;
        const isDisabled = tabProps?.disabled;
        const { className: tabClassName, iconPosition, ...restTabProps } = tabProps;

        if (isGroup || !parentGroup) {
          tabs.push(
            <TabsTrigger
              key={`oute-tabpanel-${index}-key`}
              value={index.toString()}
              {...restTabProps}
              {...otherTabProps(index)}
              className={getTabTriggerStyles(isActive, isDisabled, false, cn(sx.className, tabClassName))}
              onClick={(e) => {
                if (isGroup) setValue(index + 1);
                restTabProps.onClick?.(e);
              }}
            >
              {icon && (
                <span className={cn(
                  "flex-shrink-0 w-5 h-5 flex items-center justify-center",
                  isActive ? "text-white" : "text-[#607d8b]"
                )}>
                  {React.isValidElement(icon) ? icon : <icon />}
                </span>
              )}
              <span className="truncate flex-1">
                {tabProps.label || tabProps.children}
              </span>
              {tabProps?.iconPosition === "more-options" && tabProps?.rightIcon && (
                <span className={cn(
                  "flex-shrink-0",
                  isActive ? "text-white/70" : "text-[#607d8b]"
                )}>
                  {tabProps.rightIcon}
                </span>
              )}
            </TabsTrigger>
          );
          if (isGroup) {
            groups = {
              ...groups,
              [groupId]: {
                index: tabs.length - 1,
                noOfChild: 0,
              },
            };
          }
        }

        if (parentGroup) {
          const parentIndex = groups[parentGroup]["index"];
          let childIndex = groups[parentGroup]["noOfChild"];
          if (parentIndex !== -1) {
            tabs.splice(
              parentIndex + childIndex + 1,
              0,
              <TabsTrigger
                key={`oute-tabpanel-${index}-key`}
                value={index.toString()}
                {...restTabProps}
                {...otherTabProps(index)}
                className={getTabTriggerStyles(isActive, isDisabled, true, cn(sx.className, tabClassName))}
                onClick={restTabProps.onClick}
              >
                {icon && (
                  <span className={cn(
                    "flex-shrink-0 w-4 h-4 flex items-center justify-center",
                    isActive ? "text-white" : "text-[#607d8b]"
                  )}>
                    {icon}
                  </span>
                )}
                <span className="truncate flex-1">
                  {tabProps.label || tabProps.children}
                </span>
              </TabsTrigger>
            );
          }
          groups[parentGroup]["noOfChild"]++;
        }
      }
      return tabs;
    };

    useEffect(() => {
      if (tabData?.length === 0) {
        setValue(-1);
      }
      if (value > tabData?.length - 1) {
        setValue((prevValue) => prevValue - 1);
      }
    }, [tabData?.length, value]);

    const panelComponent = useMemo(() => {
      if (tabData?.length === 0) {
        return;
      }
      if (tabData[value]?.panelComponent) {
        return tabData[value]?.panelComponent;
      }
      if (!tabData[value]?.panelComponent) {
        return tabData[value - 1]?.panelComponent;
      }
    }, [tabData, value]);

    const panelComponentProps = useMemo(() => {
      return !!tabData[value] && !!tabData[value]?.panelComponentProps
        ? tabData[value].panelComponentProps
        : {};
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
      <div className={cn("w-full h-full grid grid-cols-[auto_1fr] gap-4", className)}>
        <Tabs
          value={value.toString()}
          onValueChange={(newValue) => {
            const newIndex = parseInt(newValue);
            handleChange(null, newIndex);
          }}
          orientation="vertical"
          className={cn(
            divider && "pr-4 border-r border-gray-100",
            "box-border h-fit"
          )}
        >
          <TabsList className={cn(figmaVerticalListStyles, tabListClassName)}>
            {renderTabs(tabData)}
          </TabsList>

          {tabData.map((t, index) => (
            <TabsContent
              key={`tab-content-${index}`}
              value={index.toString()}
              className="w-full h-full overflow-hidden mt-0 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-200"
            >
              {value === index && (
                <TabPanel
                  index={index}
                  component={panelComponent}
                  componentProps={panelComponentProps}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>

        {value !== -1 && (
          <div className="overflow-hidden">
            <TabPanel
              index={value}
              component={panelComponent}
              componentProps={panelComponentProps}
            />
          </div>
        )}

        <ODSDialog
          open={showConfirmDialogOnTabSwitch && showDialog !== null}
          showFullscreenIcon={false}
          dialogTitle={confirmDialogProps?.title}
          dialogContent={confirmDialogProps?.content}
          dialogActions={
            <>
              <ODSButton
                variant="outlined"
                size="small"
                label={confirmDialogProps?.cancelLabel || "DON'T LEAVE"}
                onClick={() => {
                  setShowDialog(null);
                }}
              />
              <ODSButton
                size="small"
                label={confirmDialogProps?.okLabel || "LEAVE"}
                onClick={() => {
                  setValue(showDialog);
                  onTabSwitch(showDialog);
                  setShowDialog(null);
                }}
              />
            </>
          }
        />
      </div>
    );
  }
);

export default ODSVTab;
