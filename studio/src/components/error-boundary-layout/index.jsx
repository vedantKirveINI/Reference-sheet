import React from "react";
// import { ODSLabel } from '@src/module/ods';
import { ODSLabel } from "@src/module/ods";
import classes from "./index.module.css";

const ErrorBoundaryLayout = () => {
  return (
    <div className={classes["error-container"]}>
      <div className={classes["error-box"]}>
        <div className={classes["error-icon"]}>!</div>
        <div className={classes["error-content"]}>
          <ODSLabel variant="body2" className={classes["error-text"]}>
            Something went wrong. Please try refreshing the page.
          </ODSLabel>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryLayout;
