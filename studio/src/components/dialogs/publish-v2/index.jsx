import { useCallback, useEffect, useRef, useState } from "react";
import { X, Monitor, Smartphone, RotateCcw, Upload, Check, LayoutGrid, List, MessageCircle } from "lucide-react";
import cloneDeep from "lodash/cloneDeep";
import { motion } from "framer-motion";
import canvasServices from "../../../sdk-services/canvas-sdk-services";
import { SUCCESS, PENDING, FAILED } from "../../../constants/keys";
import { toast } from "sonner";
import { cookieUtils } from "@src/module/ods";
import {
  localStorageConstants,
} from "@oute/oute-ds.core.constants";
import { PublishProvider, usePublish } from "./context";
import { Mode, ViewPort, MODE_OPTIONS, VIEWPORT_OPTIONS } from "./constants";
import PreviewPanel from "./PreviewPanel";
import SettingsPanel from "./SettingsPanel";
import QrCodeModal from "./components/QrCodeModal";
import { PublishStatus } from "../publish/components/publish-status";
import Overlay from "../publish/components/overlay";
import { getFormattedDate } from "../../../utils/utils";
import { transformSettingsToPayload } from "./utils";
import { handleSheetsFlow } from "../../../pages/ic-canvas/utils/sheets-flow-helper";
import { validateFormResponsesMapping } from "../publish/forms/utils/formResponses";
import { sheetMappingToFormMapping } from "../publish/forms/utils";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ISLAND_SHADOW = "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]";
const ISLAND_BORDER = "border border-zinc-100";
const ISLAND_RADIUS = "rounded-2xl";

const modeIcons = {
  [Mode.CARD]: LayoutGrid,
  [Mode.CLASSIC]: List,
  [Mode.CHAT]: MessageCircle,
};

const viewportIcons = {
  [ViewPort.DESKTOP]: Monitor,
  [ViewPort.MOBILE]: Smartphone,
};

const PublishHeader = ({ 
  formName, 
  mode,
  setMode,
  viewport, 
  setViewport, 
  onRestart, 
  onClose 
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 pointer-events-auto",
            "bg-white",
            ISLAND_RADIUS,
            ISLAND_SHADOW,
            ISLAND_BORDER
          )}
        >
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-medium text-zinc-700 max-w-[16rem] truncate block cursor-default">
                  {formName || "Publish Form"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-sm">
                <p className="break-words">{formName || "Publish Form"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className={cn(
            "flex items-center gap-3 px-2 py-2 pointer-events-auto",
            "bg-white",
            ISLAND_RADIUS,
            ISLAND_SHADOW,
            ISLAND_BORDER
          )}
        >
          <div className="flex items-center p-1 bg-zinc-50 rounded-xl">
            {MODE_OPTIONS.map((option) => {
              const Icon = modeIcons[option.value];
              const isActive = mode === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mode-pill-publish"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-zinc-100"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon size={16} strokeWidth={1.75} />
                    <span className="hidden sm:inline">{option.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-6 bg-zinc-100" />

          <div className="flex items-center p-1 bg-zinc-50 rounded-xl">
            {VIEWPORT_OPTIONS.map((option) => {
              const Icon = viewportIcons[option.value];
              const isActive = viewport === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setViewport(option.value)}
                  className={cn(
                    "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                    isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                  )}
                  title={option.label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="viewport-pill-publish"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-zinc-100"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={1.75} className="relative" />
                </button>
              );
            })}
          </div>

          <div className="w-px h-6 bg-zinc-100" />

          <button
            onClick={onRestart}
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg",
              "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50",
              "transition-all duration-200"
            )}
            title="Restart Preview"
          >
            <RotateCcw size={18} strokeWidth={1.75} />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto"
        >
          <button
            onClick={onClose}
            className={cn(
              "flex items-center justify-center w-10 h-10",
              "bg-white",
              ISLAND_RADIUS,
              ISLAND_SHADOW,
              ISLAND_BORDER,
              "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50",
              "transition-all duration-200"
            )}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </motion.div>
      </div>
    </header>
  );
};

const PublishFooter = ({ onPublish }) => {
  const { assetDetails, isPublished, publishStatus } = usePublish();

  if (publishStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-3",
          "bg-white",
          ISLAND_RADIUS,
          ISLAND_SHADOW,
          ISLAND_BORDER
        )}
      >
        {isPublished && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
              <Check className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
            </div>
            <span className="text-sm text-zinc-600">
              Published {getFormattedDate(assetDetails?.asset?.published_info?.published_at)}
            </span>
            <div className="w-px h-5 bg-zinc-200 ml-2" />
          </div>
        )}
        <button
          onClick={onPublish}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl",
            "bg-zinc-900 hover:bg-zinc-800 text-white font-medium",
            "shadow-lg shadow-zinc-900/20",
            "transition-all duration-200"
          )}
        >
          <Upload size={16} strokeWidth={1.75} />
          <span>Publish</span>
        </button>
      </div>
    </motion.div>
  );
};

const FormPublishV2Content = ({
  userData,
  payload,
  theme,
  getSavePayload,
  initialAssetDetails,
  onPublishSuccess,
  onCustomDomainDataChange,
  nodes,
  onClose,
  params,
  variables,
  onEvent,
  onAnalyticsEvent,
  openNodeWithTheme,
  isPremiumUser,
}) => {
  const {
    assetDetails,
    setAssetDetails,
    publishStatus,
    setPublishStatus,
    settings,
    questions,
    responseMappings,
    setResponseMappings,
  } = usePublish();

  const previewRef = useRef(null);
  const settingsRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const payloadRef = useRef(payload);

  const [nodesForPreview, setNodesForPreview] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [showQrCode, setShowQrCode] = useState(false);
  const [mode, setModeState] = useState(
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_MODE) ||
      Mode.CARD,
  );
  const [viewport, setViewportState] = useState(
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_VIEWPORT) ||
      ViewPort.DESKTOP,
  );
  
  const setMode = useCallback((newMode) => {
    setModeState(newMode);
    cookieUtils?.setCookie(localStorageConstants.QUESTION_CREATOR_MODE, newMode);
  }, []);
  
  const setViewport = useCallback((newViewport) => {
    setViewportState(newViewport);
    cookieUtils?.setCookie(localStorageConstants.QUESTION_CREATOR_VIEWPORT, newViewport);
  }, []);
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const onToggleEmbedPreview = useCallback((show) => {
    setShowEmbedPreview(show);
  }, []);

  const projectId = payload?.project_id;
  const workspaceId = payload?.workspace_id;
  const canvasId = payload?._id;
  const parentId = payload?.parent_id;
  const allVariables = { ...params, ...variables };

  const onRestart = useCallback(() => {
    previewRef.current?.restart();
  }, []);

  const openFormSettings = useCallback(() => {
    previewRef.current?.toggleBranding();
    settingsRef.current?.goToTab("branding");
  }, []);

  /** Navigate to Configure → Branding only (no toggle). Use when clicking "Remove Branding" banner so we don't flip branding visibility. */
  const goToBrandingSection = useCallback(() => {
    settingsRef.current?.goToTab("branding");
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e?.key === "Escape") {
        onCloseRef.current?.();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const loadPreview = useCallback(() => {
    const currentPayload = payloadRef.current;
    if (!currentPayload) return;

    setPreviewLoading(true);
    setPreviewError(false);

    canvasServices
      .canvasToPublished(currentPayload)
      .then((res) => {
        if (res?.status === SUCCESS) {
          setNodesForPreview(res?.result?.flow);
          setPreviewError(false);
        } else {
          setPreviewError(true);
        }
      })
      .catch(() => {
        setPreviewError(true);
      })
      .finally(() => {
        setPreviewLoading(false);
      });
  }, []);

  useEffect(() => {
    if (payload && !nodesForPreview && !previewError) {
      payloadRef.current = payload;
      loadPreview();
    }
  }, [payload, nodesForPreview, previewError, loadPreview]);

  const publishWorkflow = useCallback(async () => {
    try {
      const _questions = cloneDeep(questions);

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
        form_name:
          assetDetails?.asset?.name || initialAssetDetails?.asset?.name,
        nodeDataArray: _questions,
        mappedSheetData: responseMappings,
        parent_id:
          assetDetails?.asset?.parent_id ||
          initialAssetDetails?.asset?.parent_id,
        sheetAssetDetails:
          assetDetails?.meta?.sheet || initialAssetDetails?.meta?.sheet,
        workspace_id:
          assetDetails?.asset?.workspace_id ||
          initialAssetDetails?.asset?.workspace_id,
      });

      if (sheetsResponse?.error) {
        toast.error(sheetsResponse.message);
        setPublishStatus(FAILED);
        return;
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

      const { form: formSettings, tracking: trackingSettings } =
        transformSettingsToPayload(settings);

      let updatedAssetDetails = await getSavePayload(
        assetDetails?.asset?.name || initialAssetDetails?.asset?.name,
        assetDetails || initialAssetDetails,
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
          form: {
            ...updatedAssetDetails?.settings?.form,
            ...formSettings,
          },
          tracking: {
            ...updatedAssetDetails?.settings?.tracking,
            ...trackingSettings,
          },
          execution_control: {
            enabled: true,
          },
        },
      };

      const saveCanvasResponse =
        await canvasServices.saveCanvas(updatedAssetDetails);

      if (saveCanvasResponse?.status !== SUCCESS) {
        setPublishStatus(FAILED);
        toast.error(
          saveCanvasResponse?.result?.message || "Failed to save form",
        );
        return;
      }

      const publishCanvasResponse =
        await canvasServices.publishCanvas(updatedAssetDetails);

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
      } else {
        setPublishStatus(FAILED);
        toast.error(
          publishCanvasResponse?.result?.message || "Failed to publish form",
        );
      }
    } catch (error) {
      setPublishStatus(FAILED);
      toast.error(error?.message || "Something went wrong while publishing");
    }
  }, [
    settings,
    assetDetails,
    initialAssetDetails,
    getSavePayload,
    onPublishSuccess,
    setAssetDetails,
    setPublishStatus,
    questions,
    responseMappings,
    setResponseMappings,
  ]);

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f9fa]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {publishStatus && <Overlay />}
      {publishStatus && (
        <PublishStatus
          publishStatus={publishStatus}
          setPublishStatus={setPublishStatus}
        />
      )}

      <PublishHeader
        formName={initialAssetDetails?.asset?.name}
        mode={mode}
        setMode={setMode}
        viewport={viewport}
        setViewport={setViewport}
        onRestart={onRestart}
        onClose={onClose}
      />

      <div className="flex h-full pt-[88px] pb-[100px]">
        <PreviewPanel
          ref={previewRef}
          viewport={viewport}
          mode={mode}
          previewError={previewError}
          previewLoading={previewLoading}
          nodesForPreview={nodesForPreview}
          showEmbedPreview={showEmbedPreview}
          theme={theme}
          initialAssetDetails={initialAssetDetails}
          onAnalyticsEvent={onAnalyticsEvent}
          onEvent={onEvent}
          variables={allVariables}
          parentId={parentId}
          projectId={projectId}
          workspaceId={workspaceId}
          canvasId={canvasId}
          openNodeWithTheme={openNodeWithTheme}
          onClose={onClose}
          isPremiumUser={isPremiumUser}
          onRetry={loadPreview}
          openFormSettings={openFormSettings}
          onBannerThemeClick={openFormSettings}
          onRemoveBrandingClick={goToBrandingSection}
        />

        <SettingsPanel
          ref={settingsRef}
          nodes={nodes}
          userData={userData}
          getSavePayload={getSavePayload}
          onPublishSuccess={onPublishSuccess}
          onCustomDomainDataChange={onCustomDomainDataChange}
          onAnalyticsEvent={onAnalyticsEvent}
          onClose={onClose}
          onToggleEmbedPreview={onToggleEmbedPreview}
          mode={mode}
          isPremiumUser={isPremiumUser}
          onShowQrCode={() => setShowQrCode(true)}
        />
      </div>

      <PublishFooter onPublish={publishWorkflow} />

      {showQrCode && <QrCodeModal onClose={() => setShowQrCode(false)} />}
    </div>
  );
};

const FormPublishV2 = ({
  userData = {},
  payload,
  theme,
  getSavePayload,
  initialAssetDetails,
  onPublishSuccess,
  onCustomDomainDataChange,
  nodes,
  onClose = () => {},
  params = {},
  variables = {},
  onEvent = () => {},
  onAnalyticsEvent = () => {},
  openNodeWithTheme = () => {},
  isPremiumUser,
  domainList = [],
  customUrls = [],
  onRefreshSubdomains,
  onAddNewSubdomain,
  onCustomUrlSaved,
  onCustomUrlDeleted,
  isDomainsLoading = false,
}) => {
  return (
    <PublishProvider
      initialAssetDetails={initialAssetDetails}
      nodes={nodes}
      domainList={domainList}
      customUrls={customUrls}
      onRefreshSubdomains={onRefreshSubdomains}
      onAddNewSubdomain={onAddNewSubdomain}
      onCustomUrlSaved={onCustomUrlSaved}
      onCustomUrlDeleted={onCustomUrlDeleted}
      isDomainsLoading={isDomainsLoading}
    >
      <FormPublishV2Content
        userData={userData}
        payload={payload}
        theme={theme}
        getSavePayload={getSavePayload}
        initialAssetDetails={initialAssetDetails}
        onPublishSuccess={onPublishSuccess}
        onCustomDomainDataChange={onCustomDomainDataChange}
        nodes={nodes}
        onClose={onClose}
        params={params}
        variables={variables}
        onEvent={onEvent}
        onAnalyticsEvent={onAnalyticsEvent}
        openNodeWithTheme={openNodeWithTheme}
        isPremiumUser={isPremiumUser}
      />
    </PublishProvider>
  );
};

export default FormPublishV2;
