import React from "react";
import Popover from "@mui/material/Popover";
const ODSPopover = (props) => {
  return (
    <Popover
      {...props}
      slotProps={{
        ...(props?.slotProps || {}),
        paper: {
          ...(props?.slotProps?.paper || {}),
          style: {
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            ...(props?.slotProps?.paper?.style || {}),
          },
        },
      }}
    />
  );
};

export default ODSPopover;
