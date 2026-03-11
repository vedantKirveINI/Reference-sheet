import { useFormPublishContext } from "../../../hooks/use-form-publish-context";
import { ShareLink } from "./components/share-link";

const FormDistributionTab = ({
  onAnalyticsEvent = () => {},
  onToggleEmbedPreview = () => {},
  mode,
}) => {
  const { assetDetails } = useFormPublishContext();

  return (
    <div className="h-full p-4" data-testid="form-distribution-tab">
      <ShareLink
        assetId={assetDetails?.asset_id}
        isPublished={!!assetDetails?.asset?.published_info}
        onAnalyticsEvent={onAnalyticsEvent}
      />
    </div>
  );
};

export default FormDistributionTab;
