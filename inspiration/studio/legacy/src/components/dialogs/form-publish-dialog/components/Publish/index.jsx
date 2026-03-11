import { forwardRef } from "react";
import { PublishTitle } from "../../../publish/components/publish-title";
import FormPublish from "../../../publish/forms";
import { useFormPublishContext } from "../../../publish/hooks/use-form-publish-context";
import classes from "./index.module.css";

const Publish = forwardRef(
  (
    {
      userData = {},
      nodes,
      getSavePayload,
      onAnalyticsEvent,
      onPublishSuccess,
      onCustomDomainDataChange,
      onClose,
      onToggleEmbedPreview,
      mode,
      formSettingsRef,
      isPremiumUser,
      hideBrandingToogle,
    },
    ref,
  ) => {
    const { assetDetails } = useFormPublishContext();
    return (
      <div className={classes["right-container"]}>
        <div className={classes["publish-title-container"]}>
          <PublishTitle title={assetDetails?.asset?.name} />
        </div>
        <FormPublish
          ref={ref}
          userData={userData}
          nodes={nodes}
          getSavePayload={getSavePayload}
          onPublishSuccess={onPublishSuccess}
          onCustomDomainDataChange={onCustomDomainDataChange}
          onAnalyticsEvent={onAnalyticsEvent}
          onClose={onClose}
          onToggleEmbedPreview={onToggleEmbedPreview}
          mode={mode}
          formSettingsRef={formSettingsRef}
          isPremiumUser={isPremiumUser}
          hideBrandingToogle={hideBrandingToogle}
        />
      </div>
    );
  },
);

export default Publish;
