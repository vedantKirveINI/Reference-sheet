import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  Suspense,
} from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import { cn } from "@/lib/utils";
import "./drawer.css";

const DrawerSidebar = forwardRef(
  (
    {
      show = true,
      style = {},
      actions = [],
      activeStyles = {},
      onSidebarActionClick = () => {},
      highlightedActions = [],
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const onClickHandler = useCallback(
      (action, index, e) => {
        onSidebarActionClick(action, index, e);
        // Allow component actions to show selection even if disableActive is true
        // This ensures the white overlay appears for component-based actions like avatar
        if (!action?.disableActive || action?.component) {
          setActiveIndex(action.id);
        }
      },
      [onSidebarActionClick],
    );
    useImperativeHandle(
      ref,
      () => ({
        closeSidebar: () => {
          setActiveIndex(null);
        },
        updateIndexById: (id) => {
          setActiveIndex(id);
        },
        clickAction: (id) => {
          const index = actions?.findIndex((action) => action?.id === id);
          if (index !== -1) {
            onClickHandler(actions[index], index);
            return;
          }
        },
      }),
      [actions, onClickHandler],
    );
    const startActions = actions.filter(
      (action) => !action.position || action.position === "start",
    );
    const endActions = actions.filter((action) => action.position === "end");

    // Helper function to check if icon is an image
    const isImageIcon = (iconValue) => {
      if (typeof iconValue !== "string") return false;

      const imageExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".svg",
        ".gif",
        ".webp",
      ];
      const lowerIcon = iconValue.toLowerCase();

      // Check if it ends with image extension
      if (imageExtensions.some((ext) => lowerIcon.endsWith(ext))) {
        return true;
      }

      // Check if it's a URL (starts with http:// or https://)
      if (iconValue.startsWith("http://") || iconValue.startsWith("https://")) {
        return true;
      }

      // Check if it's an absolute path (starts with /)
      if (iconValue.startsWith("/")) {
        return true;
      }

      return false;
    };

    const renderIcon = (action, isActive, iconColor, index) => {
      const iconValue = action.icon;

      if (!iconValue) {
        return null;
      }

      // Handle image icons
      if (isImageIcon(iconValue)) {
        return (
          <button
            type="button"
            disabled={isActive || action?.disabled}
            onClick={(e) => {
              onClickHandler(action, index, e);
            }}
            data-testid={action?.dataTestId}
            className="z-[20] rounded-[var(--wizard-radius-md)] p-[0.68rem] bg-transparent border-none flex items-center justify-center cursor-pointer disabled:cursor-default group"
          >
            <img
              src={iconValue}
              alt={action?.name || "icon"}
              className="w-5 h-5 object-contain transition-opacity group-hover:opacity-80"
            />
          </button>
        );
      }

      // Handle React components (Lucide icons)
      if (
        typeof iconValue === "function" ||
        (typeof iconValue === "object" && iconValue.$$typeof)
      ) {
        const IconComponent = iconValue;
        return (
          <button
            type="button"
            disabled={isActive || action?.disabled}
            onClick={(e) => {
              onClickHandler(action, index, e);
            }}
            data-testid={action?.dataTestId}
            className="z-[20] rounded-[var(--wizard-radius-md)] p-[0.68rem] bg-transparent border-none flex items-center justify-center cursor-pointer disabled:cursor-default group"
          >
            <IconComponent
              className={cn(
                "w-5 h-5 transition-colors",
                !isActive && "group-hover:text-zinc-900",
              )}
              color={iconColor}
              strokeWidth={1.5}
            />
          </button>
        );
      }

      // Handle string icons (ODS icons)
      if (typeof iconValue === "string") {
        return (
          <Icon
            outeIconName={iconValue}
            outeIconProps={{
              style: {
                width: "1.25rem",
                height: "1.25rem",
                color: iconColor,
              },
              className: "transition-colors group-hover:text-zinc-900",
              "data-testid": action?.dataTestId,
            }}
            onClick={(e) => {
              onClickHandler(action, index, e);
            }}
            buttonProps={{
              disabled: isActive || action?.disabled,
              sx: {
                borderRadius: "var(--wizard-radius-md)",
                padding: "0.68rem !important",
              },
            }}
          />
        );
      }

      return null;
    };

    const renderActions = (actionList) =>
      actionList.map((action, index) => {
        // Pass isHovered to renderIcon if needed, but it's available in closure
        const isActive = activeIndex === action.id;
        const iconColor = isActive
          ? activeStyles?.color || "#ffffff"
          : style?.color || "#52525b";

        return (
          <React.Fragment key={`action-fragment-${index}`}>
            {action.seperator ? (
              <div className="w-full flex items-center justify-center py-2">
                <div className="w-10 h-[1px] bg-zinc-200 rounded-full" />
              </div>
            ) : action?.component ? (
              <div
                className={cn(
                  "w-full h-12 flex items-center justify-center relative oute-drawer-component-item rounded-[var(--wizard-radius-md)] overflow-hidden",
                  !isActive && "hover:bg-zinc-200/60",
                  isActive && "active",
                )}
                id="action-component"
                data-testid={`${action?.id}-sidebar-item`}
              >
                {isActive && (
                  <div
                    className="oute-drawer-item-active"
                    style={{
                      backgroundColor: activeStyles?.background || "#18181b",
                    }}
                  />
                )}
                <Suspense
                  fallback={
                    <div className="w-full h-12 flex items-center justify-center">
                      Loading...
                    </div>
                  }
                >
                  <action.component {...(action?.componentProps || {})} />
                </Suspense>
              </div>
            ) : (
              <div
                className={cn(
                  "relative oute-drawer-icon-item flex items-center transition-all duration-200 group w-full rounded-[var(--wizard-radius-md)] min-h-[3rem] max-h-[3rem]",
                  !isActive && "hover:bg-zinc-200/60",
                  isActive && "active",
                )}
                data-testid={`${action?.id}-sidebar-item`}
              >
                {isActive && (
                  <div
                    className="oute-drawer-item-active"
                    style={{
                      backgroundColor: activeStyles?.background || "#18181b",
                    }}
                  />
                )}

                {action.icon && (
                  <div className="relative z-[20] flex items-center justify-center w-full min-h-[3rem] max-h-[3rem]">
                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                      {renderIcon(action, isActive, iconColor, index)}
                    </div>
                    {highlightedActions.includes(action.id) && !isActive && (
                      <span className="oute-sidebar-pulse-dot" />
                    )}
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        );
      });
    return (
      <div
        className={cn(
          "flex justify-between items-center gap-[1.2rem] py-6 px-3.5 flex-col rounded-[var(--wizard-radius-lg)] shadow-island-sm border w-[74px] h-full",
          !show && "hidden",
        )}
        style={{
          ...style,
        }}
      >
        <div className="flex flex-col justify-between h-full w-full">
          <div className="flex flex-col items-center w-full gap-4">
            {renderActions(startActions)}
          </div>
          <div className="flex flex-col mt-auto w-full gap-4">
            {renderActions(endActions)}
          </div>
        </div>
      </div>
    );
  },
);

export default DrawerSidebar;
