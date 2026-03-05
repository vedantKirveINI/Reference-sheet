import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Code2, Palette, Bell, BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

import RemoveBranding from "../form-settings/components/remove-branding";
import CustomDomain from "../form-settings/components/custom-domain";
import NotificationSettings from "../form-settings/components/notification";
import LocationSettings from "../form-settings/components/location";
import ManageResponses from "../form-settings/components/manage-responses";
import GoogleTagManager from "../form-attribution/components/googleTagManager";
import GoogleAnalytics from "../form-attribution/components/googleAnalytics";
import MetaPixel from "../form-attribution/components/metaPixel";
import WebEmbed from "../form-distribution/components/web-embed";
import { useFormPublishContext } from "../../../hooks/use-form-publish-context";

const SECTION_IDS = {
  EMBED: "embed",
  BRANDING: "branding",
  MANAGE_RESPONSES: "manage_responses",
  NOTIFICATIONS: "notifications",
  TRACKING: "tracking",
};

const SECTION_COLORS = {
  [SECTION_IDS.EMBED]: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    iconBg: "bg-blue-100",
    accent: "border-l-blue-500",
  },
  [SECTION_IDS.BRANDING]: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: "text-purple-600",
    iconBg: "bg-purple-100",
    accent: "border-l-purple-500",
  },
  [SECTION_IDS.MANAGE_RESPONSES]: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    icon: "text-teal-600",
    iconBg: "bg-teal-100",
    accent: "border-l-teal-500",
  },
  [SECTION_IDS.NOTIFICATIONS]: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    iconBg: "bg-emerald-100",
    accent: "border-l-emerald-500",
  },
  [SECTION_IDS.TRACKING]: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "text-orange-600",
    iconBg: "bg-orange-100",
    accent: "border-l-orange-500",
  },
};

const SectionHeader = ({ icon: Icon, title, description, colorScheme }) => (
  <div className="flex items-start gap-3">
    <div className={cn("mt-0.5 p-2 rounded-lg", colorScheme?.iconBg || "bg-zinc-100")}>
      <Icon className={cn("w-4 h-4", colorScheme?.icon || "text-zinc-600")} />
    </div>
    <div className="flex-1 text-left">
      <h3 className="text-sm font-medium text-zinc-900">{title}</h3>
      <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
    </div>
  </div>
);

const FormConfigureTab = ({
  userData = {},
  settingsRef,
  formSettingsRef,
  isPremiumUser,
  hideBrandingToogle,
  domainList = [],
  isFetchingDomains = false,
  customUrls = [],
  onAddNewSubdomain,
  onRefreshSubdomains,
  onCustomUrlSaved,
  onCustomUrlDeleted,
  assetDetails,
  trackingRef,
  onAnalyticsEvent,
  onToggleEmbedPreview,
  mode,
}) => {
  const { isAssetPublished } = useFormPublishContext();

  const [openSections, setOpenSections] = useState([]);
  const [settings, setSettings] = useState({});
  const [expandedOptions, setExpandedOptions] = useState({
    notifications: false,
  });

  const [analyticsData, setAnalyticsData] = useState(() => {
    const { settings: assetSettings } = assetDetails?.asset || {};
    const { gtmData, gaData, metaPixelData } = assetSettings?.tracking || {};
    return {
      gtmData: gtmData || {},
      gaData: gaData || {},
      metaPixelData: metaPixelData || {},
    };
  });

  useEffect(() => {
    let updatedSettings = settingsRef?.current;
    const accordionId = formSettingsRef?.current?.formSettingAccordianId;
    if (accordionId === "remove_branding") {
      setOpenSections((prev) =>
        prev.includes(SECTION_IDS.BRANDING) ? prev : [...prev, SECTION_IDS.BRANDING]
      );
    }
    if (formSettingsRef?.current?.removeBranding) {
      updatedSettings = {
        ...updatedSettings,
        remove_branding: formSettingsRef.current?.removeBranding,
      };
    }
    if (settingsRef) {
      settingsRef.current = updatedSettings;
    }
    setSettings(updatedSettings || {});

    return () => {
      if (formSettingsRef) {
        formSettingsRef.current = null;
      }
    };
  }, [formSettingsRef, settingsRef]);

  useEffect(() => {
    if (trackingRef?.current) {
      trackingRef.current = {
        ...trackingRef.current,
        ...analyticsData,
      };
    }
  }, [analyticsData, trackingRef]);

  const onSettingsChange = (values) => {
    const newSettings = { ...settings, ...values };
    setSettings(newSettings);
    if (settingsRef) {
      settingsRef.current = { ...settingsRef?.current, ...values };
    }
  };

  const handleAccordionChange = (value) => {
    if (value.includes(SECTION_IDS.EMBED)) {
      onToggleEmbedPreview?.(true);
    } else {
      onToggleEmbedPreview?.(false);
    }
    setOpenSections(value);
  };

  return (
    <div className="space-y-3">
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={handleAccordionChange}
        className="space-y-3"
      >
        {isAssetPublished && (
          <AccordionItem
            value={SECTION_IDS.EMBED}
            className={cn(
              "border rounded-lg bg-white overflow-hidden border-l-4",
              SECTION_COLORS[SECTION_IDS.EMBED].border,
              SECTION_COLORS[SECTION_IDS.EMBED].accent
            )}
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-blue-50/50">
              <SectionHeader
                icon={Code2}
                title="Embed in website"
                description="Add your form to any website with a code snippet"
                colorScheme={SECTION_COLORS[SECTION_IDS.EMBED]}
              />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <WebEmbed
                  assetId={assetDetails?.asset_id}
                  isPublished={isAssetPublished}
                  onAnalyticsEvent={onAnalyticsEvent}
                  mode={mode}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem
          value={SECTION_IDS.BRANDING}
          className={cn(
            "border rounded-lg bg-white overflow-hidden border-l-4",
            SECTION_COLORS[SECTION_IDS.BRANDING].border,
            SECTION_COLORS[SECTION_IDS.BRANDING].accent
          )}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-purple-50/50">
            <SectionHeader
              icon={Palette}
              title="Branding & domain"
              description="Customize appearance and custom domains"
              colorScheme={SECTION_COLORS[SECTION_IDS.BRANDING]}
            />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 min-w-0 overflow-hidden">
            <div className="space-y-4 pt-2 min-w-0">
              <RemoveBranding
                settings={settings}
                isPremiumUser={isPremiumUser}
                onSettingsChange={onSettingsChange}
                hideBrandingToogle={hideBrandingToogle}
              />
              <CustomDomain
                assetDetails={assetDetails}
                domainList={domainList}
                isPremiumUser={isPremiumUser}
                isLoading={isFetchingDomains}
                customUrls={customUrls}
                onAddNewSubdomain={onAddNewSubdomain}
                onRefreshSubdomains={onRefreshSubdomains}
                onCustomUrlSaved={onCustomUrlSaved}
                onCustomUrlDeleted={onCustomUrlDeleted}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value={SECTION_IDS.MANAGE_RESPONSES}
          className={cn(
            "border rounded-lg bg-white overflow-hidden border-l-4",
            SECTION_COLORS[SECTION_IDS.MANAGE_RESPONSES].border,
            SECTION_COLORS[SECTION_IDS.MANAGE_RESPONSES].accent
          )}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-teal-50/50">
            <SectionHeader
              icon={FileText}
              title="Manage Responses"
              description="Control how and when your form accepts responses"
              colorScheme={SECTION_COLORS[SECTION_IDS.MANAGE_RESPONSES]}
            />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              <ManageResponses
                settings={settings}
                onSettingsChange={onSettingsChange}
                userData={userData}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem
          value={SECTION_IDS.NOTIFICATIONS}
          className={cn(
            "border rounded-lg bg-white overflow-hidden border-l-4",
            SECTION_COLORS[SECTION_IDS.NOTIFICATIONS].border,
            SECTION_COLORS[SECTION_IDS.NOTIFICATIONS].accent
          )}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-emerald-50/50">
            <SectionHeader
              icon={Bell}
              title="Notifications"
              description="Get notified when responses come in"
              colorScheme={SECTION_COLORS[SECTION_IDS.NOTIFICATIONS]}
            />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              <NotificationSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
              {expandedOptions.notifications && (
                <div className="border-t border-emerald-100 pt-4">
                  <LocationSettings
                    settings={settings}
                    onSettingsChange={onSettingsChange}
                  />
                </div>
              )}
              <MoreOptionsButton
                expanded={expandedOptions.notifications}
                onClick={() => toggleExpanded("notifications")}
              />
            </div>
          </AccordionContent>
        </AccordionItem> */}

        <AccordionItem
          value={SECTION_IDS.TRACKING}
          className={cn(
            "border rounded-lg bg-white overflow-hidden border-l-4",
            SECTION_COLORS[SECTION_IDS.TRACKING].border,
            SECTION_COLORS[SECTION_IDS.TRACKING].accent
          )}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-orange-50/50">
            <SectionHeader
              icon={BarChart3}
              title="Tracking & analytics"
              description="Connect your tracking pixels"
              colorScheme={SECTION_COLORS[SECTION_IDS.TRACKING]}
            />
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-4 pt-2">
              <GoogleTagManager
                gtmData={analyticsData.gtmData}
                setGtmData={(data) =>
                  setAnalyticsData({
                    ...analyticsData,
                    gtmData: { ...analyticsData.gtmData, ...data },
                  })
                }
                smartMode={true}
              />
              <GoogleAnalytics
                gaData={analyticsData.gaData}
                setGaData={(data) =>
                  setAnalyticsData({
                    ...analyticsData,
                    gaData: { ...analyticsData.gaData, ...data },
                  })
                }
                smartMode={true}
              />
              <MetaPixel
                metaPixelData={analyticsData.metaPixelData}
                setMetaPixelData={(data) =>
                  setAnalyticsData({
                    ...analyticsData,
                    metaPixelData: { ...analyticsData.metaPixelData, ...data },
                  })
                }
                smartMode={true}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default FormConfigureTab;
