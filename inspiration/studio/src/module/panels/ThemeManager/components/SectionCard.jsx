import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SectionCard = ({ title, children, className }) => {
  return (
    <Card className={cn("rounded-2xl overflow-hidden", className)}>
      <CardHeader className="px-5 pt-4 pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4 pt-0">{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
