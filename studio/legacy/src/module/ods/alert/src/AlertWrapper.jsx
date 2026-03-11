import React, { forwardRef, useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
// import ODSIcon from "oute-ds-icon";
// import default_theme from "oute-ds-shared-assets";
import { ODSIcon } from "../../index.jsx";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;

const getIcon = (type) => {
  switch (type) {
    case "success": {
      return (
        <ODSIcon
          outeIconName="OUTEDoneIcon"
          outeIconProps={{
            sx: { color: default_theme.palette.success.main },
            "data-testid": "ods-alert-success-icon",
          }}
        />
      );
    }
    case "error": {
      return (
        <ODSIcon
          outeIconName="OUTEInfoIcon"
          outeIconProps={{
            sx: { color: default_theme.palette.error.main },
            "data-testid": "ods-alert-error-icon",
          }}
        />
      );
    }
    case "info": {
      return (
        <ODSIcon
          outeIconName="OUTEInfoIcon"
          outeIconProps={{
            sx: { color: default_theme.palette.info.main },
            "data-testid": "ods-alert-info-icon",
          }}
        />
      );
    }
    case "warning": {
      return (
        <ODSIcon
          outeIconName="OUTEWarningIcon"
          outeIconProps={{
            sx: { color: default_theme.palette.warning.main },
            "data-testid": "ods-alert-warning-icon",
          }}
        />
      );
    }
  }
};
const AlertWrapper = forwardRef(
  ({ type, autoHideDuration, children, progressProps, showProgress }, ref) => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
      if (!showProgress) return;
      const startTime = Date.now();
      const endTime = startTime + autoHideDuration;
      const interval = setInterval(() => {
        if (Date.now() > endTime) {
          clearInterval(interval);
          return;
        }
        // const currentTime = Date.now();
        const elapsedTime = Date.now() - startTime;
        // const newProgress = (elapsedTime / autoHideDuration) * 100;
        setProgress((elapsedTime / autoHideDuration) * 100);
      }, 1); // Adjust interval timing if needed
      return () => clearInterval(interval);
    }, [autoHideDuration, showProgress]);
    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        }}
        data-testid="ods-alert-container"
      >
        {!!type && getIcon(type)}
        {children}
        {showProgress && (
          <LinearProgress
            sx={{
              position: "absolute",
              bottom: "0rem",
              left: "0rem",
              width: "100%",
              height: "0.3125rem",
              borderBottomLeftRadius: "0.5rem",
              borderBottomRightRadius: "0.5rem",
            }}
            color={type}
            variant="determinate"
            value={progress}
            data-testid="ods-alert-progress"
            {...progressProps}
          />
        )}
      </div>
    );
  }
);

export default AlertWrapper;
