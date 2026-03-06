import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, Zap, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import canvasServices from "../../../sdk-services/canvas-sdk-services";
import { PENDING, FAILED, SUCCESS } from "../../../constants/keys";
import { PublishStatus } from "../publish/components/publish-status";
import Overlay from "../publish/components/overlay";
import { getFormattedDate } from "../../../utils/utils";
import { SEQUENCE_PUBLISH_TABS } from "./constants";
import OverviewTab from "./tabs/OverviewTab";
import ActivityTab from "./tabs/ActivityTab";
import SettingsTab from "./tabs/SettingsTab";
import WizardDrawer from "@src/module/drawer/WizardDrawer";

const MIN_STEP_DISPLAY_MS = 1200;
const delay = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

const SequencePublishV2 = ({
  nodes = [],
  initialAssetDetails = {},
  getSavePayload,
  sequenceId,
  sequenceData: initialSequenceData = {},
  workspaceId,
  assetId,
  onPublishSuccess,
  onAssetDetailsChange,
  onClose = () => {},
  onNavigateToNode,
}) => {
  const [activeTab, setActiveTab] = useState(SEQUENCE_PUBLISH_TABS.OVERVIEW);
  const [assetDetails, setAssetDetails] = useState(initialAssetDetails);
  const [publishStatus, setPublishStatus] = useState(null);
  const [publishStep, setPublishStep] = useState(null);

  const isPublished = !!assetDetails?.asset?.published_info?.published_at;

  const sequenceData = useMemo(() => ({
    ...initialSequenceData,
    name: assetDetails?.asset?.name || initialSequenceData?.name,
    status: isPublished ? "published" : (initialSequenceData?.status || "draft"),
    updated_at: assetDetails?.asset?.edited_at || initialSequenceData?.updated_at,
  }), [assetDetails, initialSequenceData, isPublished]);

  const wizardTabs = useMemo(
    () => [
      { id: SEQUENCE_PUBLISH_TABS.OVERVIEW, label: "Overview", icon: Zap },
      { id: SEQUENCE_PUBLISH_TABS.ACTIVITY, label: "Activity", icon: Activity },
      { id: SEQUENCE_PUBLISH_TABS.SETTINGS, label: "Settings", icon: Settings },
    ],
    []
  );

  const publishSequence = useCallback(async () => {
    setPublishStatus(PENDING);

    try {
      let updatedAssetDetails = await getSavePayload(
        assetDetails?.asset?.name,
        assetDetails
      );

      if (!updatedAssetDetails) {
        setPublishStep(null);
        setPublishStatus(FAILED);
        toast.error("Failed to prepare sequence for publishing.");
        return { status: FAILED, error: "Failed to prepare sequence for publishing." };
      }

      if (!isPublished) {
        updatedAssetDetails.settings = {
          execution_control: {
            enabled: true,
          },
        };
      }

      setPublishStep("saving");
      const saveStepStart = Date.now();
      const saveCanvasResponse = await canvasServices.saveCanvas(
        updatedAssetDetails
      );

      if (!saveCanvasResponse || saveCanvasResponse?.status !== SUCCESS) {
        setPublishStep(null);
        setPublishStatus(FAILED);
        return { status: FAILED, error: saveCanvasResponse?.message || "Failed to save sequence." };
      }

      await delay(MIN_STEP_DISPLAY_MS - (Date.now() - saveStepStart));

      setPublishStep("publishing");
      const publishStepStart = Date.now();
      const publishCanvasResponse = await canvasServices.publishCanvas(
        updatedAssetDetails
      );
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
        onPublishSuccess?.(updatedAssetDetails);
        return { status: SUCCESS };
      } else {
        setPublishStep(null);
        setPublishStatus(FAILED);
        return { status: FAILED, error: publishCanvasResponse?.message || "Failed to publish sequence." };
      }
    } catch (error) {
      setPublishStep(null);
      setPublishStatus(FAILED);
      return { status: FAILED, error: error?.message || "An unexpected error occurred while publishing." };
    }
  }, [getSavePayload, assetDetails, isPublished, onPublishSuccess]);

  const handleSequenceDataChange = useCallback((updates) => {
    const assetUpdates = { ...updates };
    if (updates?.status === "published") {
      assetUpdates.published_info = {
        published_at: new Date().toISOString(),
      };
      delete assetUpdates.status;
    } else if (updates?.status === "draft") {
      assetUpdates.published_info = null;
      delete assetUpdates.status;
    }

    setAssetDetails((prev) => ({
      ...prev,
      asset: {
        ...prev?.asset,
        ...assetUpdates,
      },
    }));
    onAssetDetailsChange?.(assetUpdates);
  }, [onAssetDetailsChange]);

  const handleSetSequenceData = useCallback((updaterOrValue) => {
    if (typeof updaterOrValue === "function") {
      setAssetDetails((prev) => {
        const prevSequenceData = {
          name: prev?.asset?.name,
          status: prev?.asset?.published_info?.published_at ? "published" : "draft",
          updated_at: prev?.asset?.edited_at,
        };
        const updated = updaterOrValue(prevSequenceData);
        const assetUpdates = {};
        if (updated?.name) assetUpdates.name = updated.name;
        if (updated?.status === "published") {
          assetUpdates.published_info = {
            ...prev?.asset?.published_info,
            published_at: prev?.asset?.published_info?.published_at || new Date().toISOString(),
          };
        } else if (updated?.status === "draft") {
          assetUpdates.published_info = null;
        }

        if (Object.keys(assetUpdates).length > 0) {
          onAssetDetailsChange?.(assetUpdates);
        }

        return {
          ...prev,
          asset: {
            ...prev?.asset,
            ...assetUpdates,
          },
        };
      });
    }
  }, [onAssetDetailsChange]);

  const renderTab = () => {
    switch (activeTab) {
      case SEQUENCE_PUBLISH_TABS.OVERVIEW:
        return (
          <OverviewTab
            nodes={nodes}
            sequenceData={sequenceData}
            workspaceId={workspaceId}
            assetId={assetId}
          />
        );
      case SEQUENCE_PUBLISH_TABS.ACTIVITY:
        return (
          <ActivityTab
            workspaceId={workspaceId}
            assetId={assetId}
          />
        );
      case SEQUENCE_PUBLISH_TABS.SETTINGS:
        return (
          <SettingsTab
            sequenceData={sequenceData}
            sequenceId={sequenceId}
            setSequenceData={handleSetSequenceData}
            onSequenceDataChange={handleSequenceDataChange}
          />
        );
      default:
        return null;
    }
  };

  const footerComponent = publishStatus ? null : (
    <div
      className={cn(
        "flex items-center gap-4 px-5 py-4 w-full",
        "border-t border-zinc-100 bg-white"
      )}
      data-testid="sequence-publish-v2-footer"
    >
      <button
        type="button"
        onClick={onClose}
        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors shrink-0"
        data-testid="sequence-publish-close-btn"
      >
        Close
      </button>
      {isPublished && (
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
            <Check
              className="w-3 h-3 text-emerald-600"
              strokeWidth={2.5}
            />
          </div>
          <span className="text-sm text-zinc-500">
            Published{" "}
            {getFormattedDate(assetDetails?.asset?.published_info?.published_at)}
          </span>
        </div>
      )}
      {!isPublished && <div className="flex-1" />}
      <button
        onClick={publishSequence}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl",
          "bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm",
          "shadow-lg shadow-zinc-900/20",
          "transition-all duration-200"
        )}
        data-testid="sequence-publish-btn"
      >
        <Upload size={15} strokeWidth={1.75} />
        <span>{isPublished ? "Republish" : "Publish"}</span>
      </button>
    </div>
  );

  return (
    <WizardDrawer
      open={true}
      title={assetDetails?.asset?.name || sequenceData?.name || "Sequence"}
      tabs={wizardTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
      showEditTitle={false}
      showSecondaryAction={false}
      fullFooterComponent={footerComponent}
      hideFooterBorder={true}
      footerBackground="transparent"
      data-testid="sequence-publish-v2-container"
    >
      {publishStatus && <Overlay />}
      {publishStatus && (
        <PublishStatus
          publishStatus={publishStatus}
          setPublishStatus={setPublishStatus}
          closeHandler={onClose}
          publishStep={publishStep}
          assetType="sequence"
        />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderTab()}
        </motion.div>
      </AnimatePresence>
    </WizardDrawer>
  );
};

export default SequencePublishV2;
