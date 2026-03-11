import React, { useState } from "react";
import { cn } from "@/lib/utils";

const CustomTooltip = ({ children, title, className, ...props }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      {...props}
    >
      {children}
      {title && (
        <div
          className={cn(
            "oute-drawer-tooltip",
            isVisible && "oute-drawer-tooltip-visible"
          )}
        >
          {title}
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;
