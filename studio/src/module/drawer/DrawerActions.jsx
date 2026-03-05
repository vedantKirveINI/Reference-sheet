import React from "react";
import { cn } from "@/lib/utils";

const DrawerActions = ({ 
  actions, 
  actionProps = {}, 
  dividers = false,
  footerGuidance = null,
}) => {
  const hasActions = Boolean(actions);
  
  return (
    <div
      className={cn(
        "flex-none h-14 border-t border-border/40 px-5 flex items-center justify-between text-xs bg-background",
        !hasActions && !footerGuidance && "h-0 p-0 border-none"
      )}
      {...(actionProps || {})}
      style={{ ...(actionProps.style || {}) }}
      data-testid="drawer-actions"
    >
      {/* Left: Contextual Guidance */}
      <div className="text-muted-foreground text-xs">
        {footerGuidance}
      </div>
      
      {/* Right: Actions */}
      <div className="flex gap-2">
        {actions}
      </div>
    </div>
  );
};

export default DrawerActions;
