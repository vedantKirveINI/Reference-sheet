import React from "react";
import { cn } from "@/lib/utils";

const IconBase = React.forwardRef(({ 
  viewBox = "0 0 24 24",
  width = 24,
  height = 24,
  color,
  sx,
  className,
  children,
  ...props 
}, ref) => {
  // Convert sx prop to className (for backward compatibility)
  const sxStyles = sx || {};
  const sxClassName = sxStyles.className || "";
  
  // Handle color from sx or color prop
  const iconColor = color || sxStyles.color || "currentColor";
  
  // Handle width/height from sx
  const iconWidth = sxStyles.width || sxStyles.fontSize || width;
  const iconHeight = sxStyles.height || sxStyles.fontSize || height;

  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      width={iconWidth}
      height={iconHeight}
      fill={iconColor}
      className={cn("inline-block flex-shrink-0", sxClassName, className)}
      style={{
        color: iconColor,
        ...sxStyles,
        width: undefined, // Remove from style since we use className
        height: undefined,
        fontSize: undefined,
        className: undefined, // Remove className from style
      }}
      {...props}
    >
      {children}
    </svg>
  );
});

IconBase.displayName = "IconBase";

export default IconBase;

