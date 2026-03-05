import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ODSCard = ({ className, children, ...props }) => {
  return (
    <Card className={cn(className)} {...props}>
      {children}
    </Card>
  );
};

export default ODSCard;
