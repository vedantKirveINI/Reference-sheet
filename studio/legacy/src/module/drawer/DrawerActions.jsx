import React from "react";
import classes from "./DrawerActions.module.css";

const DrawerActions = ({ actions, actionProps = {}, dividers = false }) => {
  return (
    <div
      className={`${classes["drawer-actions"]} ${
        !actions && classes["no-actions"]
      } ${dividers && classes["divider"]}`}
      {...(actionProps || {})}
      style={{ ...(actionProps.style || {}) }}
      data-testid="drawer-actions"
    >
      {actions}
    </div>
  );
};

export default DrawerActions;
