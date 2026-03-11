import React, { useState } from "react";
import { ODSIcon as Icon } from "@src/module/ods";
import ODSLabel from "oute-ds-label";
import classes from "./DrawerTitle.module.css";

const DrawerTitle = ({
  showFullscreenIcon = true,
  showCloseIcon = true,
  title,
  titleProps = {},
  dividers = false,
  expanded = false,
  onExpand = () => {},
  onClose = () => {},
  loading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  return (
    <div
      className={`${classes["drawer-title"]} ${
        !title && !showFullscreenIcon && !showCloseIcon && classes["no-title"]
      } ${dividers && classes["divider"]}`}
      {...(titleProps || {})}
      style={{ ...(titleProps.style || {}) }}
      data-testid="drawer-title-root"
    >
      <ODSLabel variant="h5" data-testid="drawer-title">
        {title}
      </ODSLabel>
      <div>
        {showFullscreenIcon && (
          <Icon
            outeIconName={`${
              isExpanded ? "OUTECloseFullscreenIcon" : "OUTEOpenFullscreenIcon"
            }`}
            outeIconProps={{
              sx: {
                width: 24,
                height: 24,
                cursor: "pointer",
                color: "#263238",
              },
              "data-testid": "drawer-fullscreen-icon",
            }}
            buttonProps={{
              sx: {
                padding: 0,
                visibility: showFullscreenIcon ? "visible" : "hidden",
              },
            }}
            onClick={() => {
              const expandedValue = !isExpanded;
              setIsExpanded(expandedValue);
              onExpand(expandedValue);
            }}
          />
        )}
      </div>
      <div>
        {showCloseIcon && (
          <Icon
            outeIconName="OUTECloseIcon"
            outeIconProps={{
              sx: {
                width: "2rem",
                height: "2rem",
                cursor: "pointer",
                color: "#263238",
              },
              "data-testid": "node-drawer-close",
            }}
            buttonProps={{
              sx: {
                padding: 0,
                visibility: showCloseIcon ? "visible" : "hidden",
              },
              disabled: loading,
            }}
            onClick={(e) => onClose(e, "close-clicked")}
          />
        )}
      </div>
    </div>
  );
};

export default DrawerTitle;
