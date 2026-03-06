import React, { useState, forwardRef, useEffect } from "react";
import { Accordion } from "@/components/ui/accordion";
import FormAccordion from "../../../components/form-accordion";
import GoogleTagManager from "./components/googleTagManager";
import GoogleAnalytics from "./components/googleAnalytics";
import MetaPixel from "./components/metaPixel";

const ACCORDION_IDS = {
  GOOGLE_TAG_MANAGER: "google_tag_manager",
  GOOGLE_ANALYTICS: "google_analytics",
  META_PIXEL: "meta_pixel",
};

function FormAttributionTab({ assetDetails = {}, trackingRef }, ref) {
  const [analyticsData, setAnalyticsData] = useState(() => {
    const { settings } = assetDetails?.asset || {};
    const { gtmData, gaData, metaPixelData } = settings?.tracking || {};

    return {
      gtmData: gtmData || {},
      gaData: gaData || {},
      metaPixelData: metaPixelData || {},
    };
  });

  const [openAccordionId, setOpenAccordionId] = useState(
    ACCORDION_IDS.GOOGLE_TAG_MANAGER,
  );

  const handleAccordionToggle = (accordionId) => {
    setOpenAccordionId(accordionId === openAccordionId ? null : accordionId);
  };

  useEffect(() => {
    if (trackingRef.current) {
      trackingRef.current = {
        ...trackingRef.current,
        ...analyticsData,
      };
    }
  }, [analyticsData, trackingRef]);

  return (
    <Accordion
      type="single"
      collapsible
      value={openAccordionId}
      onValueChange={(value) => setOpenAccordionId(value || null)}
      className="space-y-3"
    >
      <FormAccordion
        id={ACCORDION_IDS.GOOGLE_TAG_MANAGER}
        title="Google Tag Manager"
        description="Integrate Google Tag Manager to track and analyze your form submissions."
        isOpen={openAccordionId === ACCORDION_IDS.GOOGLE_TAG_MANAGER}
        onToggle={handleAccordionToggle}
        dataTestId="google-tag-manager"
      >
        <GoogleTagManager
          gtmData={analyticsData.gtmData}
          setGtmData={(data) =>
            setAnalyticsData({
              ...analyticsData,
              gtmData: { ...analyticsData.gtmData, ...data },
            })
          }
        />
      </FormAccordion>

      <FormAccordion
        id={ACCORDION_IDS.GOOGLE_ANALYTICS}
        title="Google Analytics"
        description="Integrate Google Analytics to track and analyze your form submissions."
        isOpen={openAccordionId === ACCORDION_IDS.GOOGLE_ANALYTICS}
        onToggle={handleAccordionToggle}
        dataTestId="google-analytics"
      >
        <GoogleAnalytics
          gaData={analyticsData.gaData}
          setGaData={(data) =>
            setAnalyticsData({
              ...analyticsData,
              gaData: { ...analyticsData.gaData, ...data },
            })
          }
        />
      </FormAccordion>

      <FormAccordion
        id={ACCORDION_IDS.META_PIXEL}
        title="Meta Pixel"
        description="Integrate Meta Pixel to track form submissions and optimize your Meta ads campaigns."
        isOpen={openAccordionId === ACCORDION_IDS.META_PIXEL}
        onToggle={handleAccordionToggle}
        dataTestId="meta-pixel"
      >
        <MetaPixel
          metaPixelData={analyticsData.metaPixelData}
          setMetaPixelData={(data) =>
            setAnalyticsData({
              ...analyticsData,
              metaPixelData: { ...analyticsData.metaPixelData, ...data },
            })
          }
        />
      </FormAccordion>
    </Accordion>
  );
}

export default forwardRef(FormAttributionTab);
