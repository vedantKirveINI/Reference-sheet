import { useCallback } from "react";
import { useFormPublishContext } from "../../../../hooks/use-form-publish-context";
import { EMBED_MODES } from "../../../../constants";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const embedOptions = [
  {
    id: EMBED_MODES.FULL_PAGE,
    label: "Full Page",
    description: "Form takes the entire page",
    icon: icons.maximize2,
  },
  {
    id: EMBED_MODES.STANDARD,
    label: "Standard",
    description: "Embedded in a container",
    icon: icons.layoutGrid,
  },
  {
    id: EMBED_MODES.POPUP,
    label: "Pop up",
    description: "Opens in a popup window",
    icon: icons.square,
  },
  {
    id: EMBED_MODES.SLIDER,
    label: "Slider",
    description: "Slides in from the side",
    icon: icons.chevronRight,
  },
  {
    id: EMBED_MODES.POPOVER,
    label: "Popover",
    description: "Small floating window",
    icon: icons.messageCircle,
  },
  {
    id: EMBED_MODES.SIDE_TAB,
    label: "Side tab",
    description: "Fixed tab on the side",
    icon: icons.layoutDashboard,
  },
];

const EmbedModeSelector = () => {
  const { embedMode, setEmbedMode } = useFormPublishContext();

  const handleOptionClick = useCallback(
    (optionId) => {
      setEmbedMode(optionId);
    },
    [setEmbedMode],
  );

  return (
    <div className="w-full space-y-4" data-testid="embed-mode-selector">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border">
            {icons.settings && (
              <icons.settings className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Embed Mode
            </h4>
            <p className="text-xs text-muted-foreground">
              Choose how your form appears on your website
            </p>
          </div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {embedOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = embedMode === option.id;

          return (
            <TooltipProvider key={option.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOptionClick(option.id)}
                    className={cn(
                      "h-auto flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-foreground bg-muted shadow-sm"
                        : "border-border bg-card hover:border-input hover:bg-accent/50"
                    )}
                    data-testid={`embed-option-${option.id}`}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                        isSelected
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </span>
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="text-xs font-medium mb-0.5">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Helpful Info */}
      <Card className="p-3 bg-muted/50 border-border">
        <div className="flex items-start gap-2">
          {icons.helpCircle && (
            <icons.helpCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground mb-0.5">
              Need help choosing?
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Full Page</strong> works best for dedicated form pages.{" "}
              <strong>Pop up</strong> or <strong>Slider</strong> are great for
              forms that appear on existing pages without disrupting the user
              experience.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmbedModeSelector;
