import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ODSAvatarGroup = ({ children, max = 4, className, ...props }) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = max ? childrenArray.slice(0, max) : childrenArray;
  const remainingCount = max && childrenArray.length > max ? childrenArray.length - max : 0;

  return (
    <div className={cn("flex items-center -space-x-2", className)} {...props}>
      {visibleChildren.map((child, index) => (
        <div key={index} className="ring-2 ring-background rounded-full">
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <Avatar className="ring-2 ring-background">
          <AvatarFallback>+{remainingCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ODSAvatarGroup;
