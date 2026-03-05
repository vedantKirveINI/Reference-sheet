import React, { forwardRef, useEffect, useState } from "react";
import { ODSIcon } from "../../index.js";

const getIcon = (type) => {
  switch (type) {
    case "success": {
      return (
        <ODSIcon
          outeIconName="OUTEDoneIcon"
          outeIconProps={{
            sx: { color: "var(--success)" },
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
            sx: { color: "var(--error)" },
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
            sx: { color: "var(--info)" },
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
            sx: { color: "var(--warning)" },
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
        const elapsedTime = Date.now() - startTime;
        setProgress((elapsedTime / autoHideDuration) * 100);
      }, 1);
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
          <div
            className="absolute bottom-0 left-0 w-full h-[0.3125rem] rounded-b-lg overflow-hidden bg-muted"
            data-testid="ods-alert-progress"
            {...progressProps}
          >
            <div
              className="h-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                backgroundColor: type === "success" ? "var(--success)" : 
                               type === "error" ? "var(--error)" :
                               type === "warning" ? "var(--warning)" :
                               "var(--info)",
              }}
            />
          </div>
        )}
      </div>
    );
  }
);

export default AlertWrapper;
