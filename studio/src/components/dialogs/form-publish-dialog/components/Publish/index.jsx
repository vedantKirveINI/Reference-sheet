import {
  forwardRef,
  useState,
  useMemo,
  useRef,
  useImperativeHandle,
} from "react";
import FormPublish from "../../../publish/forms";
import { useFormPublishContext } from "../../../publish/hooks/use-form-publish-context";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { Share2, Settings2, FileText, FileSpreadsheet } from "lucide-react";
import { Mode, ViewPort } from "../../../../../module/constants";
import { cookieUtils } from "@src/module/ods";
import { localStorageConstants } from "@oute/oute-ds.core.constants";
import { PUBLISH_POPPER_TABS } from "../../../publish/forms/constants";
import CommonFooter from "../../../publish/components/common-footer";
import { ODSIcon as Icon } from "@src/module/ods";


const FormCanvasIcon = () => {
  return (
    <Icon
      outeIconName="OUTEFormIcon"
      outeIconProps={{
        sx: {
          width: "2rem",
          height: "2rem",
          borderRadius: "0.75rem"
        },
      }}
    />
  );
};

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
      mode: initialMode,
      formSettingsRef,
      isPremiumUser,
      hideBrandingToogle,
      viewPort: initialViewPort,
      onModeChange,
      onViewPortChange,
    },
    ref
  ) => {
    const { assetDetails } = useFormPublishContext();
    const formPublishRef = useRef(null);

    const [mode, setMode] = useState(
      initialMode ||
      cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_MODE) ||
      Mode.CARD
    );

    const [viewPort, setViewPort] = useState(
      initialViewPort ||
      cookieUtils?.getCookie(
        localStorageConstants.QUESTION_CREATOR_VIEWPORT
      ) ||
      ViewPort.DESKTOP
    );

    const [activeTab, setActiveTab] = useState("share");

    const handleModeChange = (newMode) => {
      if (newMode) {
        setMode(newMode);
        onModeChange?.(newMode);
      }
    };

    const handleViewPortChange = (newViewPort) => {
      if (newViewPort) {
        setViewPort(newViewPort);
        onViewPortChange?.(newViewPort);
      }
    };

    const handleTabChange = (tabId) => {
      setActiveTab(tabId);
      if (formPublishRef.current) {
        formPublishRef.current.handleTabChange?.(tabId);
      }
    };

    const wizardTabs = useMemo(
      () => [
        {
          id: "share",
          label: PUBLISH_POPPER_TABS.FORM_DISTRIBUTION,
          icon: Share2,
        },
        {
          id: "responses",
          label: PUBLISH_POPPER_TABS.FORM_RESPONSES,
          icon: FileSpreadsheet,
        },
        {
          id: "configure",
          label: PUBLISH_POPPER_TABS.FORM_CONFIGURE,
          icon: Settings2,
        },
      ],
      []
    );

    useImperativeHandle(ref, () => ({
      goToTab: (tabIdOrIndex) => {
        let tabId = tabIdOrIndex;
        // Handle numeric index (for backward compatibility)
        if (typeof tabIdOrIndex === "number") {
          const tabIds = ["share", "responses", "configure"];
          tabId = tabIds[tabIdOrIndex] || tabIds[0];
        }
        // Map legacy tab names to new structure
        if (tabId === "settings" || tabId === "analytics") {
          tabId = "configure";
        }
        setActiveTab(tabId);
        handleTabChange(tabId);
      },
    }));

    return (
      <>
        <style>{`
          /* Hide WizardDrawer backdrop when used inside dialog */
          .embedded-wizard-drawer div.fixed.inset-0 {
            display: none !important;
          }
          /* Adjust WizardDrawer container positioning for embedded use */
          .embedded-wizard-drawer div.fixed.inset-y-0 {
            position: relative !important;
            right: auto !important;
            padding-right: 0 !important;
            height: 100% !important;
            width: 100% !important;
            top: auto !important;
            bottom: auto !important;
            inset-y: auto !important;
          }
          /* Adjust WizardDrawer root for embedded use */
          .embedded-wizard-drawer [data-testid="wizard-drawer-root"] {
            position: relative !important;
            height: 100% !important;
            max-height: 100% !important;
            width: 100% !important;
          }
        `}</style>
        <div className="w-[40%] flex flex-col h-full bg-white border-l border-zinc-200 shadow-lg rounded-[0.9rem] overflow-hidden relative">
          <div className="embedded-wizard-drawer w-full h-full">
            <WizardDrawer
              open={true}
              // icon={<FileText className="w-5 h-5" />}
              icon={<FormCanvasIcon />}
              title={assetDetails?.asset?.name || "Publish Form"}
              subtitle="Configure and publish your form"
              tabs={wizardTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              showSecondaryAction={false}
              showCloseIcon={false}
              onClose={() => { }} // No-op since close is handled by Header component
              drawerWidth="100%"
              sidebarOffset="0"
              borderRadius="0.9rem"
              hideShadow={true}
              hideFooterBorder={true}
              footerBackground="transparent"
              fullFooterComponent={
                <CommonFooter
                  assetDetails={assetDetails}
                  onPublish={() => {
                    if (formPublishRef.current) {
                      formPublishRef.current.publishWorkflow?.();
                    }
                  }}
                />
              }
            >
              <FormPublish
                ref={formPublishRef}
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
                activeTab={activeTab}
              />
            </WizardDrawer>
          </div>
        </div>
      </>
    );
  }
);

export default Publish;
