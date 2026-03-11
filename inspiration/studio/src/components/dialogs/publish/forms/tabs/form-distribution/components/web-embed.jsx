import { useFormPublishContext } from "../../../../hooks/use-form-publish-context";
import { EMBED_MODES } from "../../../../constants";
import EmbedModeSelector from "./embed-mode-selector";
import ScriptPreview from "./script-preview";
import EmbedSettings from "./embed-settings";

const WebEmbed = ({
  assetId,
  isPublished,
  onAnalyticsEvent = () => {},
  mode,
}) => {
  const { embedMode } = useFormPublishContext();

  return (
    <div
      className="w-full space-y-6"
      data-testid="web-embed-container"
    >
      {/* Step 1: Choose Embed Mode */}
      <div className="space-y-4">
        <EmbedModeSelector />
      </div>

      {/* Step 2: Customize Settings (if applicable) */}
      {embedMode !== EMBED_MODES.FULL_PAGE && (
        <div className="space-y-4">
          <EmbedSettings />
        </div>
      )}

      {/* Step 3: Copy Embed Code */}
      <div className="space-y-4">
        <ScriptPreview assetId={assetId} mode={mode} />
      </div>
    </div>
  );
};

export default WebEmbed;
