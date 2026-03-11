import { useEffect, useState } from "react";
import FormAccordion from "../../../components/form-accordion";
import classes from "./index.module.css";
import ManageResponses from "./components/manage-responses";
import RemoveBranding from "./components/remove-branding";
import CustomDomain from "./components/custom-domain";
// import NotificationSettings from "./components/notification-settings";
// import LocationSettings from "./components/location/location-settings";

export const ACCORDION_IDS = {
  MANAGE_RESPONSES: "manage_responses",
  NOTIFICATION_SETTINGS: "notification_settings",
  LOCATION_SETTINGS: "location_settings",
  REMOVE_BRANDING: "remove_branding",
  CUSTOM_DOMAIN: "custom_domain",
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
  // const [settings, setSettings] = useState(
  //   assetDetails?.settings?.form ||
  //     assetDetails?.asset?.settings?.form || {
  //       accepting_responses: true,
  //       is_close_at_enabled: false,
  //       close_at: null,
  //       is_max_responses_enabled: false,
  //       max_responses: null,
  //     },
  // );

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

  const handleAccordionToggle = (accordionId) => {
    setOpenAccordionId(accordionId === openAccordionId ? null : accordionId);
  };

  return (
    <div className={classes.tabContent} data-testid="form-settings-container">
      <div className={classes.settingsContainer}>
        <FormAccordion
          id={ACCORDION_IDS.MANAGE_RESPONSES}
          title="Manage Responses"
          dataTestId="manage-responses"
          isOpen={openAccordionId === ACCORDION_IDS.MANAGE_RESPONSES}
          onToggle={handleAccordionToggle}
        >
          <ManageResponses
            settings={settings}
            onSettingsChange={onSettingsChange}
            userData={userData}
          />
        </FormAccordion>

        <FormAccordion
          id={ACCORDION_IDS.REMOVE_BRANDING}
          title="Remove Branding"
          dataTestId="remove-branding"
          isOpen={openAccordionId === ACCORDION_IDS.REMOVE_BRANDING}
          onToggle={handleAccordionToggle}
        >
          <RemoveBranding
            settings={settings}
            onSettingsChange={onSettingsChange}
            isPremiumUser={isPremiumUser}
            hideBrandingToogle={hideBrandingToogle}
          />
        </FormAccordion>

        <FormAccordion
          id={ACCORDION_IDS.CUSTOM_DOMAIN}
          title="Custom Domain"
          dataTestId="custom-domain"
          isOpen={openAccordionId === ACCORDION_IDS.CUSTOM_DOMAIN}
          onToggle={handleAccordionToggle}
        >
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
        </FormAccordion>

        {/* <FormAccordion
          id={ACCORDION_IDS.NOTIFICATION_SETTINGS}
          title="Notification Settings"
          isOpen={openAccordionId === ACCORDION_IDS.NOTIFICATION_SETTINGS}
          onToggle={handleAccordionToggle}
        >
          <NotificationSettings
            settings={formSettings}
            onSettingsChange={handleSettingChange}
          />
        </FormAccordion> */}

        {/* <FormAccordion
          id={ACCORDION_IDS.LOCATION_SETTINGS}
          title="Location Settings"
          isOpen={openAccordionId === ACCORDION_IDS.LOCATION_SETTINGS}
          onToggle={handleAccordionToggle}
        >
          <LocationSettings
            settings={formSettings}
            onSettingsChange={handleSettingChange}
          />
        </FormAccordion> */}
      </div>
    </div>
  );
};

export default FormSettingsTab;
