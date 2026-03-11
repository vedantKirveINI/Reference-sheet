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

  return (
    <div className={classes.container} data-testid="embed-settings">
      <h3 className={classes.title}>Embed Settings</h3>

      <div className={classes.content}>{renderSettingsByMode()}</div>
    </div>
  );
};

export default EmbedSettings;
