import React from "react";
import { cn } from "@/lib/utils";

const ODSButtonGroup = ({ children, orientation = "horizontal", className, ...props }) => {
  const childrenArray = React.Children.toArray(children);
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={cn(
        "inline-flex",
        isHorizontal ? "flex-row" : "flex-col",
        className
      )}
      role="group"
      {...props}
    >
      {childrenArray.map((child, index) => {
        const isFirst = index === 0;
        const isLast = index === childrenArray.length - 1;

        return React.cloneElement(child, {
          key: index,
          className: cn(
            child.props?.className,
            !isFirst && isHorizontal && "rounded-l-none border-l-0",
            !isLast && isHorizontal && "rounded-r-none",
            !isFirst && !isHorizontal && "rounded-t-none border-t-0",
            !isLast && !isHorizontal && "rounded-b-none",
          ),
        });
      })}
    </div>
  );
};

export default ODSButtonGroup;
