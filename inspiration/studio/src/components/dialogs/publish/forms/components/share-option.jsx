import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap = {
  QRCodeIcon: icons.qrCode,
  FacebookIcon: icons.facebook,
  LinkedInIcon: icons.linkedin,
  TwitterIcon: icons.twitter,
  WCEmailIcon: icons.mail,
};

const ShareOption = ({
  iconName,
  label,
  onClick,
  disabled = false,
  iconColor,
  dataTestId,
}) => {
  const IconComponent = iconMap[iconName] || icons.qrCode;

  const content = (
    <button
      type="button"
      className={cn(
        "flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-card transition-all w-full",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-muted/50 hover:border-input cursor-pointer",
      )}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      data-testid={dataTestId ? `${dataTestId}-container` : ""}
    >
      <IconComponent
        className="w-6 h-6"
        style={{ color: disabled ? "hsl(var(--muted-foreground))" : iconColor }}
        data-testid={dataTestId ? `${dataTestId}-icon` : ""}
      />
      <span
        className="text-xs text-muted-foreground font-medium"
        data-testid={dataTestId ? `${dataTestId}-label` : ""}
      >
        {label}
      </span>
    </button>
  );

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>
            <p>Please publish the form to share</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};

export default ShareOption;
