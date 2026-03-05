import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ODSBadge = ({ className, children, ...props }) => {
  return (
    <Badge className={cn(className)} {...props}>
      {children}
    </Badge>
  );
};

ODSBadge.displayName = "ODSBadge";

export default ODSBadge;
