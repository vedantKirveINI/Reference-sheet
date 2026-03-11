import React, { forwardRef } from "react";
// import Tooltip from "oute-ds-tooltip";
import { ODSTooltip as Tooltip } from "@src/module/ods";

const TooltipWrapper = forwardRef(
  ({ component: Component, title, ...props }, ref) => {
    return (
      <Tooltip
        title={title}
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
              fontSize: "1rem",
              backgroundColor: "rgba(33, 33, 33, 0.90)",
              color: "#fff",
              fontFamily: "Inter",
              border: "0.75px solid #CFD8DC",
              width: "auto",
              height: "auto",
              maxWidth: "16rem",
            },
          },
        }}
      >
        <Component {...props} ref={ref} />
      </Tooltip>
    );
  },
);

export default TooltipWrapper;
