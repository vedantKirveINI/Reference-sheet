import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import classes from "./DrawerSidebar.module.css";
import Tooltip from "oute-ds-tooltip";
import activeImage from "./assets/images/right-panel-selector.svg";

const DrawerSidebar = forwardRef(
  (
    {
      show = true,
      style = {},
      actions = [],
      activeStyles = {},
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const onClickHandler = useCallback(
      (action, index, e) => {
        onSidebarActionClick(action, index, e);
        if (!action?.disableActive) setActiveIndex(action.id);
      },
      [onSidebarActionClick]
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
          console.error("No action found with id:", id);
        },
      }),
      [actions, onClickHandler]
    );
    // Separate actions into start and end groups
    const startActions = actions.filter(
      (action) => !action.position || action.position === "start"
    );
    const endActions = actions.filter((action) => action.position === "end");

    // Helper to render actions
    const renderActions = (actionList) =>
      actionList.map((action, index) => {
        return (
          <React.Fragment key={`action-fragment-${index}`}>
            {action?.component ? (
              <div
                style={{
                  width: "100%",
                  height: "3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <action.component {...(action?.componentProps || {})} />
              </div>
            ) : (
              <Tooltip
                disableInteractive
                title={action?.name}
                placement="right"
                data-testid={`${action?.name}-tooltip`}
                arrow={false}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 14],
                        },
                      },
                    ],
                  },
                  tooltip: {
                    className: "custom-tooltip",
                    sx: {
                      fontSize: "1.1rem",
                      backgroundColor: "rgba(33, 33, 33, 0.90)",
                      color: "#fff",
                      fontFamily: "Inter",
                    },
                  },
                }}
              >
                <div
                  className={`${classes["sidebar-icon"]} ${
                    activeIndex === action.id && classes["active"]
                  }`}
                  data-testid={`${action?.id}-sidebar-item`}
                >
                  {!action.seperator && activeIndex === action.id && (
                    <img
                      src={activeImage}
                      alt="active"
                      className={`${classes["active-image"]}`}
                    />
                  )}

                  {!action.seperator && (
                    <Icon
                      outeIconName={action.icon}
                      outeIconProps={{
                        sx: {
                          width: "2rem",
                          height: "2rem",
                          color:
                            activeIndex === action.id
                              ? activeStyles?.color || "rgb(253, 93, 45)"
                              : style?.color || "#000",
                        },
                        "data-testid": action?.dataTestId,
                      }}
                      onClick={(e) => {
                        onClickHandler(action, index, e);
                      }}
                      buttonProps={{
                        disabled: activeIndex === action.id || action?.disabled,
                        sx: {
                          zIndex: 3,
                          borderRadius: "0.5rem",
                          padding: "0.68rem !important",
                          background:
                            activeIndex === action.id
                              ? activeStyles?.background
                                ? `${activeStyles?.background} !important`
                                : "#fff !important"
                              : "transparent",
                        },
                      }}
                    />
                  )}
                  {action.seperator && (
                    <div
                      style={{
                        width: "2.5rem",
                        height: "0.125rem",
                        background: style?.color || "#000",
                        opacity: 0.5,
                        borderRadius: "0.375rem",
                      }}
                    />
                  )}
                </div>
              </Tooltip>
            )}
          </React.Fragment>
        );
      });
    return (
      <div
        className={`${classes["drawer-sidebar-container"]} ${
          !show && classes["hide"]
        }`}
        style={style}
      >
        <div className={classes["sidebar-icon-container"]}>
          <div className={classes["start-action-container"]}>
            {renderActions(startActions)}
          </div>
          <div className={classes["end-action-container"]}>
            {renderActions(endActions)}
          </div>
        </div>
      </div>
    );
  }
);

export default DrawerSidebar;
