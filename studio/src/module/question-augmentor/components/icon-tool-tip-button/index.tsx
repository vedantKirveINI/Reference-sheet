import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconToolTipButtonProps {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
  dataTestId?: string;
}

const IconToolTipButton = ({
  icon,
  tooltip,
  onClick,
  style,
  className,
  dataTestId = "icon-tool-tip-button",
}: IconToolTipButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-9 w-9 shrink-0", className)}
          style={style}
          onClick={onClick}
          data-testid={dataTestId}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="bg-white text-black text-xs border border-border shadow-md">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

export default IconToolTipButton;
