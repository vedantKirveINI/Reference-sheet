import {
  useRef,
  useState,
  useCallback,
  forwardRef,
  useEffect,
  useContext,
} from "react";
import classes from "./index.module.css";
import FormDistributionTab from "./tabs/form-distribution";
import FormResponsesTab from "./tabs/form-responses";
import FormSettingsTab from "./tabs/form-settings";
import FormAttributionTab from "./tabs/form-attribution";
import TabContainer from "../../../tab-container";
import { PUBLISH_POPPER_TABS } from "./constants";
import { handleSheetsFlow } from "../../../../pages/ic-canvas/utils/sheets-flow-helper";
import canvasServices from "../../../../sdk-services/canvas-sdk-services";
// import { showAlert } from "oute-ds-alert";
import { showAlert } from "@src/module/ods";
import { PublishStatus } from "../components/publish-status";
import { FAILED, PENDING, SUCCESS } from "../../../../constants/keys";
import CommonFooter from "../components/common-footer";
import Overlay from "../components/overlay";
import { CANVAS_HOSTS, getCanvasTheme } from "../../../../module/constants";
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

export const FormPublish = forwardRef(
  (
    {
      userData = {},
      nodes = [],
      getSavePayload = () => {},
      onPublishSuccess = () => {},
      onCustomDomainDataChange,
      onAnalyticsEvent = () => {},
      onClose = () => {},
      onToggleEmbedPreview = () => {},
      mode,
      formSettingsRef,
      isPremiumUser,
      hideBrandingToogle,
    },
    ref
  ) => {
    const { host } = useContext(ICStudioContext);
    const {
      assetDetails,
      setAssetDetails,
      customDomainData,
      setCustomDomainData,
    } = useFormPublishContext();

    const questions = getTransformedNodeData(nodes);

    const canvasTheme = getCanvasTheme();
    const settingsRef = useRef(
      assetDetails?.asset?.settings?.form || DEFAULT_FORM_SETTINGS
    );
    const trackingRef = useRef({});

    const [publishStatus, setPublishStatus] = useState(null);
    const [isFetchingDomains, setIsFetchingDomains] = useState(false);
    const [responseMappings, setResponseMappings] = useState([]);

    useEffect(() => {
      if (!assetDetails?.asset?.published_info) {
        const initialMappings = getInitialNodeMapping({ questions });
        setResponseMappings(initialMappings);
      } else {
        const initialMappings = getAutoUpdatedMappingData({
          nodeDataArray: questions,
          initialMappedData: sheetMappingToFormMapping(
            assetDetails?.meta?.sheet?.fields
          ),
        });
        setResponseMappings(initialMappings);
      }
    }, []);

    // Fetch domains only when user explicitly requests refresh (e.g., after adding subdomain)
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
        showAlert({
          type: "error",
          message:
            domainFetchError?.result?.message ||
            "Failed to fetch workspace domains",
        });
      } finally {
        setIsFetchingDomains(false);
      }
    }, [assetDetails?.asset?.workspace_id, setCustomDomainData]);

    const handleCustomUrlSaved = useCallback(
      (savedUrl) => {
        // Update customUrls in context state directly from save response
        setCustomDomainData((prev) => {
          const existingIndex = prev.customUrls.findIndex(
            (url) => url._id === savedUrl._id || url.id === savedUrl._id
          );
          const updatedCustomUrls =
            existingIndex >= 0
              ? prev.customUrls.map((url, idx) =>
                  idx === existingIndex ? savedUrl : url
                )
              : [...prev.customUrls, savedUrl];

          const updated = {
            ...prev,
            customUrls: updatedCustomUrls,
          };

          // Sync with parent canvas page state
          if (onCustomDomainDataChange) {
            onCustomDomainDataChange(updated);
          }

          return updated;
        });
      },
      [setCustomDomainData, onCustomDomainDataChange]
    );

    const handleCustomUrlDeleted = useCallback(
      (deletedUrlId) => {
        // Remove deleted URL from customUrls in context state
        setCustomDomainData((prev) => {
          const updated = {
            ...prev,
            customUrls: prev.customUrls.filter(
              (url) => (url._id || url.id) !== deletedUrlId
            ),
          };

          // Sync with parent canvas page state
          if (onCustomDomainDataChange) {
            onCustomDomainDataChange(updated);
          }

          return updated;
        });
      },
      [setCustomDomainData, onCustomDomainDataChange]
    );

    const publishWorkflow = useCallback(async () => {
      const _questions = cloneDeep(questions);

      const analyticsData = trackingRef?.current || {};

      if (!responseMappings?.length) {
        showAlert({
          type: "error",
          message: "Please map at least one value",
        });
        return;
      }

      const formResponseMappingError = validateFormResponsesMapping({
        mappings: responseMappings,
        questions: _questions,
      });
      if (formResponseMappingError) {
        showAlert({
          type: "error",
          message: "There are some issues in manage response settings",
        });
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
        showAlert({ type: "error", message: sheetsResponse.message });
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
        assetDetails
      );

      const formSettings = sanitizeFormSettingsBeforeSave(
        settingsRef.current || {}
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

      const saveCanvasResponse = await canvasServices.saveCanvas(
        updatedAssetDetails
      );
      const publishCanvasResponse = await canvasServices.publishCanvas(
        updatedAssetDetails
      );
      if (publishCanvasResponse?.status === SUCCESS) {
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
        setPublishStatus(FAILED);
        return { status: FAILED, error: "Something Went Wrong !" };
      }
    }, [assetDetails, getSavePayload, onPublishSuccess, responseMappings]);

    const tabData = [
      {
        label: PUBLISH_POPPER_TABS.FORM_DISTRIBUTION,
        panelComponent: FormDistributionTab,
        panelComponentProps: {
          assetDetails: assetDetails,
          onAnalyticsEvent: onAnalyticsEvent,
          onToggleEmbedPreview: onToggleEmbedPreview,
          mode,
        },
      },
      {
        label: PUBLISH_POPPER_TABS.FORM_SETTINGS,
        panelComponent: FormSettingsTab,
        panelComponentProps: {
          userData,
          settingsRef,
          assetDetails,
          formSettingsRef,
          isPremiumUser,
          hideBrandingToogle,
          domainList: customDomainData?.domainList || [],
          isFetchingDomains,
          customUrls: customDomainData?.customUrls || [],
          onAddNewSubdomain: handleSubdomainRefresh,
          onRefreshSubdomains: handleSubdomainRefresh,
          onCustomUrlSaved: handleCustomUrlSaved,
          onCustomUrlDeleted: handleCustomUrlDeleted,
          getSavePayload,
        },
      },
      {
        label: PUBLISH_POPPER_TABS.FORM_ATTRIBUTION,
        panelComponent: FormAttributionTab,
        panelComponentProps: {
          assetDetails: assetDetails,
          trackingRef,
        },
      },
      {
        label: PUBLISH_POPPER_TABS.FORM_RESPONSES,
        panelComponent: FormResponsesTab,
        panelComponentProps: {
          assetDetails: assetDetails,
          responseMappings,
          setResponseMappings,
          onMappingsChange: setResponseMappings,
          onAnalyticsEvent,
          questions,
        },
      },
    ];

    // useImperativeHandle(ref, () => {
    //   return {
    //     saveFormResponses,
    //   };
    // }, [saveFormResponses]);

    if (host === CANVAS_HOSTS.RECIPE_BUILDER) {
      return (
        <RecipePublishLoader
          publishWorkflow={publishWorkflow}
          onClose={onClose}
          responseMappings={responseMappings}
          setPublishStatus={setPublishStatus}
          publishStatus={publishStatus}
        />
      );
    }

    return (
      <div
        className={classes["publish-form-container"]}
        style={{
          borderTop: publishStatus
            ? `0.0938rem solid ${canvasTheme?.dark}`
            : "none",
        }}
      >
        {publishStatus && <Overlay />}
        {publishStatus && (
          <PublishStatus
            publishStatus={publishStatus}
            setPublishStatus={setPublishStatus}
          />
        )}
        {!publishStatus && (
          <div className={classes["tab-container-wrapper"]}>
            <TabContainer
              ref={ref}
              tabs={tabData || []}
              colorPalette={{
                foreground: canvasTheme?.foreground,
                dark: canvasTheme?.dark,
                light: canvasTheme?.light,
                background: canvasTheme?.background,
              }}
            />
          </div>
        )}
        {!publishStatus && (
          <CommonFooter
            assetDetails={assetDetails}
            onPublish={publishWorkflow}
          />
        )}
      </div>
    );
  }
);

export default FormPublish;
