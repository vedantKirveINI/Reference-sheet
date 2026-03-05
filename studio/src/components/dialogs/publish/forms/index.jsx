import {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useEffect,
  useContext,
  useImperativeHandle,
} from "react";
import FormDistributionTab from "./tabs/form-distribution";
import FormResponsesTab from "./tabs/form-responses-tab";
import FormConfigureTab from "./tabs/form-configure";
import { handleSheetsFlow } from "../../../../pages/ic-canvas/utils/sheets-flow-helper";
import canvasServices from "../../../../sdk-services/canvas-sdk-services";
import { toast } from "sonner";
import { PublishStatus } from "../components/publish-status";
import { FAILED, PENDING, SUCCESS } from "../../../../constants/keys";
import Overlay from "../components/overlay";
import { CANVAS_HOSTS } from "../../../../module/constants";
import {
  sanitizeFormSettingsBeforeSave,
  sheetMappingToFormMapping,
} from "./utils";
import {
  getAutoUpdatedMappingData,
  getInitialNodeMapping,
  getTransformedNodeData,
  validateFormResponsesMapping,
} from "./utils/formResponses";
import cloneDeep from "lodash/cloneDeep";
import { DEFAULT_FORM_SETTINGS } from "./tabs/form-settings/utils";
import RecipePublishLoader from "./components/RecipePublishLoader";
import { ICStudioContext } from "../../../../ICStudioContext";
import { useFormPublishContext } from "../hooks/use-form-publish-context";
import domainSDKServices from "../../../../sdk-services/domain-sdk-services";

const MIN_STEP_DISPLAY_MS = 1200;
const delay = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

export const FormPublish = forwardRef(
  (
    {
      userData = {},
      nodes = [],
      getSavePayload = () => { },
      onPublishSuccess = () => { },
      onCustomDomainDataChange,
      onAnalyticsEvent = () => { },
      onClose = () => { },
      onToggleEmbedPreview = () => { },
      mode,
      formSettingsRef,
      isPremiumUser,
      hideBrandingToogle,
      activeTab: externalActiveTab,
    },
    ref,
  ) => {
    const { host } = useContext(ICStudioContext) || {};
    const {
      assetDetails,
      setAssetDetails,
      customDomainData,
      setCustomDomainData,
    } = useFormPublishContext();

    const questions = getTransformedNodeData(nodes);

    const settingsRef = useRef(
      assetDetails?.asset?.settings?.form || DEFAULT_FORM_SETTINGS,
    );
    const trackingRef = useRef({});

    const [publishStatus, setPublishStatus] = useState(null);
    const [publishStep, setPublishStep] = useState(null);
    const [isFetchingDomains, setIsFetchingDomains] = useState(false);
    const [responseMappings, setResponseMappings] = useState([]);
    const [internalActiveTab, setInternalActiveTab] = useState("share");

    const activeTab =
      externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

    useEffect(() => {
      if (!assetDetails?.asset?.published_info) {
        const initialMappings = getInitialNodeMapping({ questions });
        setResponseMappings(initialMappings);
      } else {
        const initialMappings = getAutoUpdatedMappingData({
          nodeDataArray: questions,
          initialMappedData: sheetMappingToFormMapping(
            assetDetails?.meta?.sheet?.fields,
          ),
        });
        setResponseMappings(initialMappings);
      }
    }, []);

    const handleSubdomainRefresh = useCallback(async () => {
      const workspaceId = assetDetails?.asset?.workspace_id;
      if (!workspaceId) {
        return;
      }

      setIsFetchingDomains(true);
      try {
        const response = await domainSDKServices.findByWorkspace({
          workspace_id: workspaceId,
          mapping_type: "domain",
        });

        if (response?.status === "success" && Array.isArray(response?.result)) {
          setCustomDomainData((prev) => ({
            ...prev,
            domainList: response.result,
          }));
        }
      } catch (domainFetchError) {
        toast.error(
          domainFetchError?.result?.message ||
          "Failed to fetch workspace domains",
        );
      } finally {
        setIsFetchingDomains(false);
      }
    }, [assetDetails?.asset?.workspace_id, setCustomDomainData]);

    const handleCustomUrlSaved = useCallback(
      (savedUrl) => {
        setCustomDomainData((prev) => {
          const existingIndex = prev.customUrls.findIndex(
            (url) => url._id === savedUrl._id || url.id === savedUrl._id,
          );
          const updatedCustomUrls =
            existingIndex >= 0
              ? prev.customUrls.map((url, idx) =>
                idx === existingIndex ? savedUrl : url,
              )
              : [...prev.customUrls, savedUrl];

          const updated = {
            ...prev,
            customUrls: updatedCustomUrls,
          };

          if (onCustomDomainDataChange) {
            onCustomDomainDataChange(updated);
          }

          return updated;
        });
      },
      [setCustomDomainData, onCustomDomainDataChange],
    );

    const handleCustomUrlDeleted = useCallback(
      (deletedUrlId) => {
        setCustomDomainData((prev) => {
          const updated = {
            ...prev,
            customUrls: prev.customUrls.filter(
              (url) => (url._id || url.id) !== deletedUrlId,
            ),
          };

          if (onCustomDomainDataChange) {
            onCustomDomainDataChange(updated);
          }

          return updated;
        });
      },
      [setCustomDomainData, onCustomDomainDataChange],
    );

    const publishWorkflow = useCallback(async () => {
      const _questions = cloneDeep(questions);

      const analyticsData = trackingRef?.current || {};

      if (!responseMappings?.length) {
        toast.error("Please map at least one value");
        return;
      }

      const formResponseMappingError = validateFormResponsesMapping({
        mappings: responseMappings,
        questions: _questions,
      });
      if (formResponseMappingError) {
        toast.error("There are some issues in manage response settings");
        return;
      }

      setPublishStatus(PENDING);

      const sheetsResponse = await handleSheetsFlow({
        access_token: window.accessToken,
        form_name: assetDetails?.asset?.name,
        nodeDataArray: _questions,
        mappedSheetData: responseMappings,
        parent_id: assetDetails?.asset?.parent_id,
        sheetAssetDetails: assetDetails?.meta?.sheet,
        workspace_id: assetDetails?.asset?.workspace_id,
      });

      if (sheetsResponse?.error) {
        toast.error(sheetsResponse.message);
        setPublishStep(null);
        setPublishStatus(FAILED);
        return { status: FAILED, error: sheetsResponse.message };
      }
      const assetMeta = {
        sheetMeta: {
          tableId: sheetsResponse?.table?.id,
          viewId: sheetsResponse?.view?.id,
          baseId: sheetsResponse?.base?.id,
          spaceId: sheetsResponse?.space?.id,
        },
      };
      setResponseMappings(sheetMappingToFormMapping(sheetsResponse?.fields));

      let updatedAssetDetails = await getSavePayload(
        assetDetails?.asset?.name,
        assetDetails,
      );

      const formSettings = sanitizeFormSettingsBeforeSave(
        settingsRef.current || {},
      );

      updatedAssetDetails = {
        ...updatedAssetDetails,
        asset_meta: {
          ...updatedAssetDetails?.asset_meta,
          ...assetMeta,
        },
        meta: {
          ...updatedAssetDetails?.meta,
          sheet: sheetsResponse,
        },
        settings: {
          ...updatedAssetDetails?.settings,
          form: formSettings,
          tracking: {
            ...updatedAssetDetails?.settings?.tracking,
            ...analyticsData,
          },
          execution_control: {
            enabled: true,
          },
        },
      };

      setPublishStep("saving");
      const saveStepStart = Date.now();
      const saveCanvasResponse =
        await canvasServices.saveCanvas(updatedAssetDetails);
      await delay(MIN_STEP_DISPLAY_MS - (Date.now() - saveStepStart));

      setPublishStep("publishing");
      const publishStepStart = Date.now();
      const publishCanvasResponse =
        await canvasServices.publishCanvas(updatedAssetDetails);
      await delay(MIN_STEP_DISPLAY_MS - (Date.now() - publishStepStart));

      if (publishCanvasResponse?.status === SUCCESS) {
        setPublishStep(null);
        setPublishStatus(SUCCESS);
        updatedAssetDetails = {
          ...updatedAssetDetails,
          ...(saveCanvasResponse?.result || {}),
          asset: {
            ...updatedAssetDetails?.asset,
            ...(saveCanvasResponse?.result?.asset || {}),
            published_info: {
              details: publishCanvasResponse?.result?.deployment_info,
              published_at: publishCanvasResponse?.result?.updated_at,
            },
          },
        };
        setAssetDetails(updatedAssetDetails);
        onPublishSuccess(updatedAssetDetails);
        return { status: SUCCESS };
      } else {
        setPublishStep(null);
        setPublishStatus(FAILED);
        return { status: FAILED, error: "Something Went Wrong !" };
      }
    }, [assetDetails, getSavePayload, onPublishSuccess, responseMappings]);

    const handleTabChange = (tabId) => {
      if (externalActiveTab === undefined) {
        setInternalActiveTab(tabId);
      }
      if (tabId === "share") {
        onToggleEmbedPreview(false);
      }
    };

    useImperativeHandle(ref, () => ({
      goToTab: (tabId) => {
        handleTabChange(tabId);
      },
      handleTabChange,
      publishWorkflow,
    }));

    if (host === CANVAS_HOSTS.RECIPE_BUILDER) {
      return (
        <RecipePublishLoader
          publishWorkflow={publishWorkflow}
          onClose={onClose}
          responseMappings={responseMappings}
          setPublishStatus={setPublishStatus}
          publishStatus={publishStatus}
          publishStep={publishStep}
          assetType="form"
        />
      );
    }



    return (
      <div className="w-full h-full flex flex-col bg-white overflow-hidden">
        {/* {publishStatus && <Overlay />} */}
        {publishStatus && (
          <PublishStatus
            publishStatus={publishStatus}
            setPublishStatus={setPublishStatus}
            publishStep={publishStep}
            assetType="form"
          />
        )}
        {!publishStatus && (
          <div className="flex-1 overflow-y-auto h-full">
            {activeTab === "share" && (
              <div className="h-full">
                <FormDistributionTab
                  assetDetails={assetDetails}
                  onAnalyticsEvent={onAnalyticsEvent}
                  onToggleEmbedPreview={onToggleEmbedPreview}
                  mode={mode}
                />
              </div>
            )}

            {activeTab === "responses" && (
              <div className="h-full">
                <FormResponsesTab
                  assetDetails={assetDetails}
                  responseMappings={responseMappings}
                  setResponseMappings={setResponseMappings}
                  onMappingsChange={setResponseMappings}
                  onAnalyticsEvent={onAnalyticsEvent}
                  questions={questions}
                  settings={settingsRef.current}
                  onSettingsChange={(values) => {
                    settingsRef.current = { ...settingsRef.current, ...values };
                  }}
                />
              </div>
            )}

            {activeTab === "configure" && (
              <div className="h-full">
                <FormConfigureTab
                  userData={userData}
                  settingsRef={settingsRef}
                  assetDetails={assetDetails}
                  formSettingsRef={formSettingsRef}
                  isPremiumUser={isPremiumUser}
                  hideBrandingToogle={hideBrandingToogle}
                  domainList={customDomainData?.domainList || []}
                  isFetchingDomains={isFetchingDomains}
                  customUrls={customDomainData?.customUrls || []}
                  onAddNewSubdomain={handleSubdomainRefresh}
                  onRefreshSubdomains={handleSubdomainRefresh}
                  onCustomUrlSaved={handleCustomUrlSaved}
                  onCustomUrlDeleted={handleCustomUrlDeleted}
                  trackingRef={trackingRef}
                  onAnalyticsEvent={onAnalyticsEvent}
                  onToggleEmbedPreview={onToggleEmbedPreview}
                  mode={mode}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

export default FormPublish;
