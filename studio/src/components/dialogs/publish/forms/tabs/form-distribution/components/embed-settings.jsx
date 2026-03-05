import { useFormPublishContext } from "../../../../hooks/use-form-publish-context";
import { EMBED_MODES } from "../../../../constants";
import {
  ModeWidthController,
  ModeHeightController,
  ModeButtonTextController,
  ModeButtonColorController,
  ModeFontSizeController,
  ModeRoundedCornersController,
  ModeTextLinkToggleController,
  ModeSliderPositionController,
  ModeCalloutController,
} from "./controllers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { icons } from "@/components/icons";
import classes from "./embed-settings.module.css";

const EmbedSettings = () => {
  const { embedMode } = useFormPublishContext();

  const renderSettingsByMode = () => {
    switch (embedMode) {
      case EMBED_MODES.POPUP:
        return (
          <>
            {/* Settings Row */}
            <div className={classes.settingsRow}>
              <ModeButtonTextController />
              <ModeButtonColorController />
              <ModeFontSizeController />
              <ModeRoundedCornersController />
            </div>

            {/* Toggle Row */}
            <ModeTextLinkToggleController />
          </>
        );

      case EMBED_MODES.SLIDER:
        return (
          <>
            {/* Settings Row */}
            <div className={classes.settingsRow}>
              <ModeButtonTextController />
              <ModeButtonColorController />
              <ModeFontSizeController />
              <ModeRoundedCornersController />
            </div>

            {/* Slider Position Row */}
            <div className={classes.dimensionsRow}>
              <ModeSliderPositionController />
            </div>

            {/* Toggle Row */}
            <ModeTextLinkToggleController />
          </>
        );

      case EMBED_MODES.POPOVER:
        return (
          <>
            {/* Settings Row */}
            <div className={classes.settingsRow}>
              <ModeButtonColorController />
            </div>

            {/* Callout Row */}
            <div className={classes.settingsRow}>
              <ModeCalloutController />
            </div>
          </>
        );

      case EMBED_MODES.SIDE_TAB:
        return (
          <>
            <div className={classes.dimensionsRow}>
              <ModeSliderPositionController />
            </div>
            {/* Settings Row */}
            <div className={classes.settingsRow}>
              <ModeButtonTextController />
              <ModeButtonColorController />
              <ModeFontSizeController />
              <ModeRoundedCornersController />
            </div>
          </>
        );

      case EMBED_MODES.STANDARD:
        return (
          <>
            {/* Dimensions Row */}
            <div className={classes.dimensionsRow}>
              <ModeWidthController />
              <ModeHeightController />
            </div>
          </>
        );

      case EMBED_MODES.FULL_PAGE:
        return null; // No settings for FullPage mode

      default:
        return null;
    }
  };

  const getModeDescription = () => {
    switch (embedMode) {
      case EMBED_MODES.POPUP:
        return "Customize the popup button appearance and behavior. The button will trigger a modal overlay when clicked.";
      case EMBED_MODES.SLIDER:
        return "Configure the slider button and its position on the page. The form slides in from the selected edge.";
      case EMBED_MODES.POPOVER:
        return "Adjust the popover trigger button and callout text. The form appears as a floating element.";
      case EMBED_MODES.SIDE_TAB:
        return "Set the side tab position and button styling. The form appears as a collapsible side panel.";
      case EMBED_MODES.STANDARD:
        return "Set the dimensions for the embedded form. The form will be displayed inline with your content.";
      default:
        return "Customize how your form appears when embedded.";
    }
  };

  return (
    <div className={classes.container} data-testid="embed-settings">
      <div className="space-y-4">
        <div>
          <h3 className={classes.title}>Embed Settings</h3>
          <Alert className="mt-3 bg-muted/50 border-border">
            {icons.info && <icons.info className="h-4 w-4" />}
            <AlertTitle className="text-xs font-semibold">Customize Your Embed</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              {getModeDescription()}
            </AlertDescription>
          </Alert>
        </div>

        <div className={classes.content}>{renderSettingsByMode()}</div>
      </div>
    </div>
  );
};

export default EmbedSettings;
