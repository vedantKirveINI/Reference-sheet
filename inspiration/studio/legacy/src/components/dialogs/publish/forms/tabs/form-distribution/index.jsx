import { useState } from "react";
import classes from "./index.module.css";
import FormAccordion from "../../../components/form-accordion";
import { ShareLink } from "./components/share-link";
import WebEmbed from "./components/web-embed";
import { useFormPublishContext } from "../../../hooks/use-form-publish-context";

const ACCORDION_IDS = {
  SHARE_LINK: "share_link",
  EMBED_EMAIL: "embed_email",
  EMBED_WEB: "embed_web",
  SHARE_EMAIL: "share_email",
};

const FormDistributionTab = ({
  onAnalyticsEvent = () => {},
  onToggleEmbedPreview = () => {},
  mode,
}) => {
  const { assetDetails, isAssetPublished } = useFormPublishContext();
  const [openAccordionId, setOpenAccordionId] = useState(
    ACCORDION_IDS.SHARE_LINK,
  );

  const handleAccordionToggle = (accordionId) => {
    if (accordionId === ACCORDION_IDS.EMBED_WEB) {
      onToggleEmbedPreview(true);
    } else {
      onToggleEmbedPreview(false);
    }
    setOpenAccordionId(accordionId === openAccordionId ? null : accordionId);
  };

  return (
    <div className={classes.tabContent} data-testid="form-distribution-tab">
      <div
        className={classes.distributionContainer}
        data-testid="distribution-container"
      >
        <FormAccordion
          id={ACCORDION_IDS.SHARE_LINK}
          title="Share Form Link"
          description="Share this link with your audience and ready to use in a link"
          isOpen={openAccordionId === ACCORDION_IDS.SHARE_LINK}
          onToggle={handleAccordionToggle}
        >
          <ShareLink
            assetId={assetDetails?.asset_id}
            isPublished={!!assetDetails?.asset?.published_info}
            onAnalyticsEvent={onAnalyticsEvent}
          />
        </FormAccordion>

        {isAssetPublished && (
          <FormAccordion
            id={ACCORDION_IDS.EMBED_WEB}
            title="Embed in Web"
            description="Copy and paste to appear in your code and put your form on your website"
            isOpen={openAccordionId === ACCORDION_IDS.EMBED_WEB}
            onToggle={handleAccordionToggle}
          >
            <WebEmbed
              assetId={assetDetails?.asset_id}
              isPublished={!!assetDetails?.asset?.published_info}
              onAnalyticsEvent={onAnalyticsEvent}
              mode={mode}
            />
          </FormAccordion>
        )}

        {/* <FormAccordion
            id={ACCORDION_IDS.EMBED_EMAIL}
            title="Embed in Email"
            description="Copy this code to appear in your code and put your form in your email"
            isOpen={openAccordionId === ACCORDION_IDS.EMBED_EMAIL}
            onToggle={handleAccordionToggle}
          >
            <div
              className={classes.accordionContentItem}
              data-testid="accordion-embed_email-content-item"
            >
              <ODSLabel
                variant="body2"
                data-testid="accordion-embed_email-content-text"
                children="Email embed code content here"
              />
            </div>
          </FormAccordion>

          <FormAccordion
            id={ACCORDION_IDS.EMBED_WEB}
            title="Embed in Web"
            description="Copy and paste to appear in your code and put your form on your website"
            isOpen={openAccordionId === ACCORDION_IDS.EMBED_WEB}
            onToggle={handleAccordionToggle}
          >
            <div
              className={classes.accordionContentItem}
              data-testid="accordion-embed_web-content-item"
            >
              <ODSLabel
                variant="body2"
                data-testid="accordion-embed_web-content-text"
                children="Web embed code content here"
              />
            </div>
          </FormAccordion>

          <FormAccordion
            id={ACCORDION_IDS.SHARE_EMAIL}
            title="Share on Email"
            description="Share this form with email with permissions"
            isOpen={openAccordionId === ACCORDION_IDS.SHARE_EMAIL}
            onToggle={handleAccordionToggle}
          >
            <div
              className={classes.accordionContentItem}
              data-testid="accordion-share_email-content-item"
            >
              <ODSLabel
                variant="body2"
                data-testid="accordion-share_email-content-text"
                children="Email sharing options here"
              />
            </div>
          </FormAccordion> */}
      </div>
    </div>
  );
};

export default FormDistributionTab;
