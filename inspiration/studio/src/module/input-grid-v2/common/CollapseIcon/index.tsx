import React from "react";
import { ODSIcon } from "@src/module/ods";

function CollapseIcon({ isCollapse, onClick, variant = "black" }) {
  return (
    <ODSIcon
      outeIconName="OUTEChevronLeftIcon"
      outeIconProps={{
        style: {
          transform: isCollapse ? "rotate(-180deg)" : "rotate(-90deg)",
          borderRadius: "50%",
          transition: "transform 0.2s ease",
          margin: "0 0.5rem",
        },
      }}
      buttonProps={{
        style: {
          padding: "0",
          pointerEvents: "all",
        },
      }}
      onClick={onClick}
    />
  );
}

export default CollapseIcon;
