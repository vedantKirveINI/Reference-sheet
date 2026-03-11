import React from "react";
import classes from "./DrawerContent.module.css";

//TODO : remove hasAction and related styles from this component. It should be handled by the parent component
const DrawerContent = ({
  removeContentPadding = false,
  allowContentOverflow = false,
  sidebarContent,
  children,
  style = {},
}) => {
  return (
    <div
      className={`${classes["drawer-content"]} ${
        removeContentPadding && classes["no-padding"]
      }  ${!allowContentOverflow && classes["hide-overflow"]}`}
      data-testid="drawer-content"
      style={style}
    >
      {children}
      {sidebarContent && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background: "#fff",
            borderBottomLeftRadius: "inherit",
            overflow: "hidden",
            zIndex: 100,
          }}
          data-testid="drawer-sidebar-content"
        >
          {sidebarContent}
        </div>
      )}
    </div>
  );
};

export default DrawerContent;
