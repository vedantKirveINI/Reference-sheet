import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

/** Tab id for Appearance/Image tab in question setup (must match useQuestionModuleTabsV2) */
const APPEARANCE_TAB_ID = "appearance";

interface ToolBarProps {
  question: any;
  onChange: (key: string, value: any) => void;
  style?: React.CSSProperties;
  goToTab?: any;
}

const ToolBar = ({
  question,
  onChange = () => {},
  style = {},
  goToTab = () => {},
}: ToolBarProps) => {
  const objectFit = question?.augmentor?.objectFit;
  const handleObjectFit = (newObjectFit: string) => {
    const augmentor = question?.augmentor;
    onChange("augmentor", { ...augmentor, objectFit: newObjectFit });
  };
  const handleDelete = () => {
    onChange("augmentor", {});
  };
  const handleImageSettings = () => {
    goToTab(APPEARANCE_TAB_ID, { openImageToolbar: true });
  };
  const handleReplace = () => {
    goToTab(APPEARANCE_TAB_ID, { openReplaceSection: true });
  };
  const augmentorAlignment = question?.augmentor?.alignment?.cardDesktop;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        style={style}
        className={cn(
          "toolbar absolute top-3 right-6 flex items-center gap-2 rounded-xl px-2 py-1.5 transition-opacity",
          "bg-black/25 backdrop-blur-md border border-white/20 shadow-lg",
          "opacity-0 group-hover:opacity-100 [&_button]:rounded-lg [&_button]:min-w-8"
        )}
        data-testid="question-augmentor-toolbar"
      >
        {augmentorAlignment !== "background" && (
          <>
            {objectFit === "cover" ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => handleObjectFit("contain")}
                    data-testid="question-augmentor-fit-button"
                  >
                    <icons.minimize2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6} className="bg-white text-black text-xs border border-border shadow-md">
                  Fit
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => handleObjectFit("cover")}
                    data-testid="question-augmentor-fill-button"
                  >
                    <icons.maximize2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={6} className="bg-white text-black text-xs border border-border shadow-md">
                  Fill
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
              onClick={handleImageSettings}
              data-testid="question-augmentor-setting-button"
            >
              <icons.settings className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6} className="bg-white text-black text-xs border border-border shadow-md">
            Image settings
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
              onClick={handleReplace}
              data-testid="question-augmentor-replace-button"
            >
              <icons.refreshCw className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6} className="bg-white text-black text-xs border border-border shadow-md">
            Replace
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
              onClick={handleDelete}
              data-testid="question-augmentor-delete-button"
            >
              <icons.trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6} className="bg-white text-black text-xs border border-border shadow-md">
            Delete
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default ToolBar;
