import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import ManageResponses from "./components/manage-responses";
import RemoveBranding from "./components/remove-branding";
import CustomDomain from "./components/custom-domain";
import NotificationSettings from "./components/notification";
import LocationSettings from "./components/location";

export const ACCORDION_IDS = {
  MANAGE_RESPONSES: "manage_responses",
  NOTIFICATION_SETTINGS: "notification_settings",
  LOCATION_SETTINGS: "location_settings",
  REMOVE_BRANDING: "remove_branding",
  CUSTOM_DOMAIN: "custom_domain",
};

const ACCORDION_CONFIG = {
  [ACCORDION_IDS.MANAGE_RESPONSES]: {
    title: "Manage Responses",
    description: "Control how and when your form accepts responses",
    icon: icons.fileText,
  },
  [ACCORDION_IDS.REMOVE_BRANDING]: {
    title: "Remove Branding",
    description: "Customize your form's appearance and branding",
    icon: icons.settings,
  },
  [ACCORDION_IDS.CUSTOM_DOMAIN]: {
    title: "Custom Domain",
    description: "Use your own domain for form links",
    icon: icons.globe,
  },
  [ACCORDION_IDS.NOTIFICATION_SETTINGS]: {
    title: "Notification Settings",
    description: "Configure email notifications for new responses",
    icon: icons.bell,
  },
  [ACCORDION_IDS.LOCATION_SETTINGS]: {
    title: "Location Settings",
    description: "Collect location and IP address data",
    icon: icons.mapPin,
  },
};

const FormSettingsTab = ({
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
}) => {
  const [openAccordionId, setOpenAccordionId] = useState(
    ACCORDION_IDS.MANAGE_RESPONSES,
  );

  const [settings, setSettings] = useState({});

  useEffect(() => {
    let updatedSettings = settingsRef?.current;
    if (formSettingsRef.current?.formSettingAccordianId) {
      setOpenAccordionId(formSettingsRef.current?.formSettingAccordianId);
    }
    if (formSettingsRef.current?.removeBranding) {
      updatedSettings = {
        ...updatedSettings,
        remove_branding: formSettingsRef.current?.removeBranding,
      };
    }
    settingsRef.current = updatedSettings;
    setSettings(updatedSettings);
    return () => {
      formSettingsRef.current = null;
    };
  }, [formSettingsRef, settingsRef]);

  const onSettingsChange = (values) => {
    setSettings({
      ...settings,
      ...values,
    });
    settingsRef.current = { ...settingsRef?.current, ...values };
  };

  const handleAccordionChange = (value) => {
    setOpenAccordionId(value || null);
  };

  const getAccordionSummary = (accordionId, settings, customUrls = []) => {
    switch (accordionId) {
      case ACCORDION_IDS.MANAGE_RESPONSES:
        return settings?.accepting_responses ? "Accepting responses" : "Closed";
      
      case ACCORDION_IDS.REMOVE_BRANDING:
        if (settings?.remove_branding) {
          return settings?.custom_logo ? "Enabled • Logo uploaded" : "Enabled";
        }
        return "Disabled";
      
      case ACCORDION_IDS.CUSTOM_DOMAIN:
        const urlCount = customUrls?.length || 0;
        return urlCount > 0 ? `${urlCount} custom URL${urlCount > 1 ? 's' : ''}` : "Not configured";
      
      case ACCORDION_IDS.NOTIFICATION_SETTINGS:
        const enabledNotifications = [
          settings?.newResponseNotification && "New responses",
          settings?.enableAutomatedResponse && "Automated emails",
          settings?.sendResponseCopy && "Response copy"
        ].filter(Boolean);
        return enabledNotifications.length > 0 
          ? enabledNotifications.join(", ") 
          : "None enabled";
      
      case ACCORDION_IDS.LOCATION_SETTINGS:
        const enabledLocation = [
          settings?.collectLocation && "Location",
          settings?.collectIP && "IP address"
        ].filter(Boolean);
        return enabledLocation.length > 0 
          ? enabledLocation.join(", ") 
          : "None enabled";
      
      default:
        return null;
    }
  };

  const renderAccordionItem = (accordionId) => {
    const config = ACCORDION_CONFIG[accordionId];
    const Icon = config?.icon;
    const summary = getAccordionSummary(accordionId, settings, customUrls);
    const isOpen = openAccordionId === accordionId;

    return (
      <AccordionItem
        key={accordionId}
        value={accordionId}
        className="border border-border rounded-lg bg-card shadow-sm overflow-hidden transition-all hover:shadow-md mb-3 data-[state=open]:border-border"
      >
        <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
          <div className="flex-1 text-left flex items-center gap-3">
            {Icon && (
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border shrink-0">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground">
                  {config?.title}
                </h3>
                {!isOpen && summary && (
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium px-2 py-0.5"
                  >
                    {summary}
                  </Badge>
                )}
              </div>
              {config?.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.description}
                </p>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4 pt-0">
          <div className="pt-2">
            {accordionId === ACCORDION_IDS.MANAGE_RESPONSES && (
              <ManageResponses
                settings={settings}
                onSettingsChange={onSettingsChange}
                userData={userData}
              />
            )}
            {accordionId === ACCORDION_IDS.REMOVE_BRANDING && (
              <RemoveBranding
                settings={settings}
                onSettingsChange={onSettingsChange}
                isPremiumUser={isPremiumUser}
                hideBrandingToogle={hideBrandingToogle}
              />
            )}
            {accordionId === ACCORDION_IDS.CUSTOM_DOMAIN && (
              <CustomDomain
                domainList={domainList}
                isLoading={isFetchingDomains}
                customUrls={customUrls}
                onAddNewSubdomain={onAddNewSubdomain}
                onRefreshSubdomains={onRefreshSubdomains}
                onCustomUrlSaved={onCustomUrlSaved}
                onCustomUrlDeleted={onCustomUrlDeleted}
                assetDetails={assetDetails}
                isPremiumUser={isPremiumUser}
              />
            )}
            {accordionId === ACCORDION_IDS.NOTIFICATION_SETTINGS && (
              <NotificationSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            )}
            {accordionId === ACCORDION_IDS.LOCATION_SETTINGS && (
              <LocationSettings
                settings={settings}
                onSettingsChange={onSettingsChange}
              />
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="h-full" data-testid="form-settings-container">
      <div className="space-y-0">
        <Accordion
          type="single"
          collapsible
          value={openAccordionId}
          onValueChange={handleAccordionChange}
          className="w-full"
        >
          {Object.values(ACCORDION_IDS).map((accordionId) =>
            renderAccordionItem(accordionId)
          )}
        </Accordion>
      </div>
    </div>
  );
};

export default FormSettingsTab;
