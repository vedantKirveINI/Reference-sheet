import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap = {
  CARD: icons.layoutGrid,
  CLASSIC: icons.list,
  CHAT: icons.messageCircle,
};

export const ViewOption = ({ mode, isSelected, isPublished, onViewChange }) => {
  const formattedMode = mode.charAt(0) + mode.slice(1).toLowerCase();
  const IconComponent = iconMap[mode] || icons.layoutGrid;
  const isDisabled = !isPublished && !isSelected;

  const content = (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all w-full",
        isSelected
          ? "border-zinc-900 bg-zinc-50"
          : "border-zinc-200 bg-white",
        isDisabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-zinc-400 cursor-pointer"
      )}
      onClick={!isDisabled ? () => onViewChange(mode) : undefined}
      disabled={isDisabled}
      data-testid={`view-option-${mode.toLowerCase()}`}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg",
        isSelected ? "bg-foreground" : "bg-muted"
      )}>
        <IconComponent
          className={cn(
            "w-5 h-5",
            isSelected ? "text-background" : "text-muted-foreground"
          )}
          data-testid={`${mode.toLowerCase()}-view-icon`}
        />
      </div>
      <span
        className={cn(
          "text-xs font-medium",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {formattedMode}
      </span>
    </button>
  );

  if (isDisabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>Please publish the form to allow switching to this view</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
