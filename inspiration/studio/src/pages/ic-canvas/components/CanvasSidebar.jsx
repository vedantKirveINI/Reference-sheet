import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback, cloneElement, Children } from "react";
import DrawerSidebar from "@src/module/drawer/DrawerSidebar";
import { CANVAS_MODES } from "@src/module/constants";
import "./CanvasSidebar.css";

const NEUTRAL_THEME = {
  iconColor: "#52525b",
  activeIconColor: "#18181b",
  activeBackground: "#18181b",
  activeColor: "#ffffff",
};

/* Match canvas header: island pattern, greysh surface, minimal border */
const HEADER_LIKE_SIDEBAR = {
  background: "#ffffff",
  borderColor: "rgba(0, 0, 0, 0.04)",
};

const TIP_TYPE_TO_SIDEBAR_ICONS = {
  suggestion: ["add-nodes"],
  empathy: ["help"],
  celebration: [],
  health: ["help"],
  default: ["help"],
};

const CanvasSidebar = forwardRef(
  (
    {
      actions = [],
      style = {},
      activeStyles = {},
      onSidebarActionClick = () => {},
      canvasMode = CANVAS_MODES.WORKFLOW_CANVAS,
      children,
    },
    ref
  ) => {
    const sidebarRef = useRef();
    const [highlightedActions, setHighlightedActions] = useState([]);
    const tint = HEADER_LIKE_SIDEBAR;

    useImperativeHandle(
      ref,
      () => ({
        closeSidebar: () => sidebarRef.current?.closeSidebar(),
        updateIndexById: (id) => sidebarRef.current?.updateIndexById(id),
        clickAction: (id) => sidebarRef.current?.clickAction(id),
      }),
      []
    );

    const handleTipStateChange = useCallback((hasTip, tip) => {
      if (hasTip && tip) {
        const tipType = tip.type || "default";
        const icons = TIP_TYPE_TO_SIDEBAR_ICONS[tipType] || TIP_TYPE_TO_SIDEBAR_ICONS.default;
        setHighlightedActions(icons);
      } else {
        setHighlightedActions([]);
      }
    }, []);

    return (
      <div className="canvas-sidebar-wrapper">
        <div className="canvas-sidebar-tools">
          <DrawerSidebar
            ref={sidebarRef}
            show={true}
            style={{
              color: NEUTRAL_THEME.iconColor,
              backgroundColor: tint.background,
              borderColor: tint.borderColor,
              ...style,
            }}
            activeStyles={{
              background: NEUTRAL_THEME.activeBackground,
              color: NEUTRAL_THEME.activeColor,
              ...activeStyles,
            }}
            actions={actions}
            onSidebarActionClick={onSidebarActionClick}
            highlightedActions={highlightedActions}
          />
        </div>
        {children && (
          <div className="canvas-sidebar-agent">
            {Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return cloneElement(child, { onTipStateChange: handleTipStateChange });
              }
              return child;
            })}
          </div>
        )}
      </div>
    );
  }
);

export default CanvasSidebar;
