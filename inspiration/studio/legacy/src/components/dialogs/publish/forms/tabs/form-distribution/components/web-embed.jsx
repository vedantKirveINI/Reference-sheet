import { useFormPublishContext } from "../../../../hooks/use-form-publish-context";
import { EMBED_MODES } from "../../../../constants";
import EmbedModeSelector from "./embed-mode-selector";
import ScriptPreview from "./script-preview";
import EmbedSettings from "./embed-settings";
import classes from "./web-embed.module.css";

const WebEmbed = ({
  assetId,
  isPublished,
  onAnalyticsEvent = () => {},
  mode,
}) => {
  const { embedMode } = useFormPublishContext();

  return (
    <div
      className={classes.webEmbedContainer}
      data-testid="web-embed-container"
    >
      <ScriptPreview assetId={assetId} mode={mode} />
      <EmbedModeSelector />
      {embedMode !== EMBED_MODES.FULL_PAGE && <EmbedSettings />}
    </div>
  );
};

export default WebEmbed;
