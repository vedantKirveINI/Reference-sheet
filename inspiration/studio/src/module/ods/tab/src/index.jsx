import React, {
  forwardRef,
  useState,
  useImperativeHandle,
  useMemo,
  useCallback,
} from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ODSTab = forwardRef(
  (
    {
      tabData = [],
      defaultTabIndex = 0,
      onTabSwitch,
      showConfirmDialogOnTabSwitch = false,
      confirmDialogProps = {},
      beforePanelUnmount,
      variant = "default",
      className,
      tabListClassName,
      tabTriggerClassName,

      TabIndicatorProps, // Filter out - MUI legacy prop not used in shadcn
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState(defaultTabIndex);
    const [isUnmounting, setIsUnmounting] = useState(false);
    const [showDialog, setShowDialog] = useState(null);

    const handleChange = useCallback(
      async (newIndex) => {
        if (beforePanelUnmount) {
          setIsUnmounting(true);
          await beforePanelUnmount(value, newIndex);
        }
        if (showConfirmDialogOnTabSwitch) {
          setShowDialog(newIndex);
          setIsUnmounting(false);
          return;
        }
        setValue(newIndex);
        if (onTabSwitch) onTabSwitch(newIndex);
        setIsUnmounting(false);
      },
      [beforePanelUnmount, onTabSwitch, showConfirmDialogOnTabSwitch, value],
    );

    useImperativeHandle(
      ref,
      () => ({
        goToTab: (index) => {
          if (tabData?.length - 1 < index) return;
          setValue(index);
          if (onTabSwitch) onTabSwitch(index);
        },
        getActiveTabIndex: () => value,
      }),
      [onTabSwitch, tabData?.length, value],
    );

    const panelComponent = useMemo(() => {
      if (tabData?.length === 0) return null;
      return tabData[value]?.panelComponent;
    }, [tabData, value]);

    const panelComponentProps = useMemo(() => {
      return tabData[value]?.panelComponentProps || {};
    }, [tabData, value]);

    return (
      <>
        <Tabs
          value={value.toString()}
          onValueChange={(v) => handleChange(parseInt(v))}
          className={cn("w-full", className)}
          {...props}
        >
          <TabsList className={cn("w-full justify-start", tabListClassName)}>
            {tabData.map((tab, index) => {
              const isActive = value === index;
              const Icon = isActive
                ? tab.activeIcon
                : tab.inActiveIcon || tab.activeIcon;
              const isDisabled =
                (isUnmounting && value !== index) || tab.disabled;

              return (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  data-testid={`oute-ds-tab-${index}`}
                  disabled={isDisabled}
                  className={cn("flex-1", tabTriggerClassName, tab.className)}
                >
                  <div className="flex items-center justify-center gap-2">
                    {Icon && (
                      <span className="inline-flex items-center justify-center w-4 h-4 [&>svg]:w-4 [&>svg]:h-4 [&>img]:w-4 [&>img]:h-4">
                        {Icon}
                      </span>
                    )}
                    <span>{tab.label || tab.children}</span>
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {tabData.map((tab, index) => (
            <TabsContent key={index} value={index.toString()} className="mt-2">
              {value === index &&
                panelComponent &&
                React.createElement(panelComponent, panelComponentProps)}
            </TabsContent>
          ))}
        </Tabs>

        <Dialog
          open={showConfirmDialogOnTabSwitch && showDialog !== null}
          onOpenChange={(open) => {
            if (!open) {
              setShowDialog(null);
              setIsUnmounting(false);
            }
          }}
        >
          <DialogContent data-testid="oute-ds-tab-confirm-dialog">
            {confirmDialogProps?.title && (
              <DialogHeader>
                <DialogTitle>{confirmDialogProps.title}</DialogTitle>
              </DialogHeader>
            )}
            {confirmDialogProps?.content}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDialog(null);
                  setIsUnmounting(false);
                }}
                data-testid="oute-ds-tab-confirm-dialog-cancel"
              >
                {confirmDialogProps?.cancelLabel || "DON'T LEAVE"}
              </Button>
              <Button
                onClick={() => {
                  setValue(showDialog);
                  if (onTabSwitch) onTabSwitch(showDialog);
                  setShowDialog(null);
                  setIsUnmounting(false);
                }}
                data-testid="oute-ds-tab-confirm-dialog-ok"
              >
                {confirmDialogProps?.okLabel || "LEAVE"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

ODSTab.displayName = "ODSTab";

export default ODSTab;
