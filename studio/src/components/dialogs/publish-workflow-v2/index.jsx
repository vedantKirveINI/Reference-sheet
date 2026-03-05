import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Check, Zap, Activity, Settings, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import canvasServices from "../../../sdk-services/canvas-sdk-services";
import { SUCCESS, PENDING, FAILED } from "../../../constants/keys";
import { PublishStatus } from "../publish/components/publish-status";
import Overlay from "../publish/components/overlay";
import { getFormattedDate } from "../../../utils/utils";
import { WORKFLOW_PUBLISH_TABS } from "./constants";
import OverviewTab from "./tabs/OverviewTab";
import ActivityTab from "./tabs/ActivityTab";
import SettingsTab from "./tabs/SettingsTab";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { usePublishValidation } from "./hooks/usePublishValidation";
import { ODSIcon as Icon } from "@src/module/ods";
import { Button } from "@/components/ui/button";

const MIN_STEP_DISPLAY_MS = 1200;
const delay = (ms) => new Promise((r) => setTimeout(r, Math.max(0, ms)));

const WorkflowPublishV2Icon = () => {
  return (
    <Icon
      outeIconName="OUTEWorkflowIcon"
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

const WorkflowPublishV2 = ({
  nodes = [],
  initialAssetDetails = {},
  getSavePayload,
  onPublishSuccess,
  onAssetDetailsChange,
  onClose = () => { },
  onNavigateToNode,
}) => {
  const [activeTab, setActiveTab] = useState(WORKFLOW_PUBLISH_TABS.OVERVIEW);
  const [assetDetails, setAssetDetails] = useState(initialAssetDetails);
  const [publishStatus, setPublishStatus] = useState(null);
  const [publishStep, setPublishStep] = useState(null);

  const isPublished = !!assetDetails?.asset?.published_info?.published_at;

  const validationData = usePublishValidation(nodes);

  const handleFixNow = useCallback((nodeKey) => {
    if (onNavigateToNode) {
      onClose();
      setTimeout(() => {
        onNavigateToNode(nodeKey);
      }, 200);
    }
  }, [onNavigateToNode, onClose]);

  const wizardTabs = useMemo(
    () => [
      { id: WORKFLOW_PUBLISH_TABS.OVERVIEW, label: "Overview", icon: Zap },
      { id: WORKFLOW_PUBLISH_TABS.ACTIVITY, label: "Activity", icon: Activity },
      { id: WORKFLOW_PUBLISH_TABS.SETTINGS, label: "Settings", icon: Settings },
    ],
    []
  );

  const publishWorkflow = useCallback(async () => {
    setPublishStatus(PENDING);

    try {
      let assetMeta = {};

      let updatedAssetDetails = await getSavePayload(
        assetDetails?.asset?.name,
        assetDetails
      );

      if (!updatedAssetDetails) {
        setPublishStep(null);
        setPublishStatus(FAILED);
        toast.error("Failed to prepare workflow for publishing.");
        return { status: FAILED, error: "Failed to prepare workflow for publishing." };
      }

      updatedAssetDetails = {
        ...updatedAssetDetails,
        asset_meta: {
          ...updatedAssetDetails?.asset_meta,
          ...assetMeta,
        },
      };

      if (!assetDetails?.asset?.published_info?.published_at) {
        updatedAssetDetails.settings = {
          ...updatedAssetDetails?.settings,
          execution_control: {
            enabled: assetDetails?.asset?.settings?.execution_control?.enabled ?? true,
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
        return { status: FAILED, error: saveCanvasResponse?.message || "Failed to save workflow." };
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
        return { status: FAILED, error: publishCanvasResponse?.message || "Failed to publish workflow." };
      }
    } catch (error) {
      setPublishStep(null);
      setPublishStatus(FAILED);
      return { status: FAILED, error: error?.message || "An unexpected error occurred while publishing." };
    }
  }, [getSavePayload, assetDetails, onPublishSuccess]);

  const renderTab = () => {
    switch (activeTab) {
      case WORKFLOW_PUBLISH_TABS.OVERVIEW:
        return (
          <OverviewTab
            nodes={nodes}
            assetDetails={assetDetails}
            validationData={validationData}
            onFixNow={handleFixNow}
          />
        );
      case WORKFLOW_PUBLISH_TABS.ACTIVITY:
        return <ActivityTab assetDetails={assetDetails} />;
      case WORKFLOW_PUBLISH_TABS.SETTINGS:
        return (
          <SettingsTab
            assetDetails={assetDetails}
            setAssetDetails={setAssetDetails}
            onAssetDetailsChange={onAssetDetailsChange}
          />
        );
      default:
        return null;
    }
  };

  const hasBlockingErrors = validationData.hasBlockingErrors;

  const footerComponent = publishStatus ? null : (
    <div
      className={cn(
        "flex flex-col gap-2 px-5 py-4",
        "border-t border-zinc-100 bg-white"
      )}
      data-testid="workflow-publish-v2-footer"
    >
      {hasBlockingErrors && (
        <div className="flex items-center gap-2 px-1">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="text-xs text-red-600 font-medium">
            Fix {validationData.totalErrors}{" "}
            {validationData.totalErrors === 1 ? "error" : "errors"} before
            publishing
          </span>
        </div>
      )}
      <div className="flex items-center gap-4 w-full">
        {isPublished ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100">
              <Check
                className="w-3 h-3 text-emerald-600"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-sm text-zinc-500">
              Published{" "}
              {getFormattedDate(
                assetDetails?.asset?.published_info?.published_at
              )}
            </span>
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            data-testid="workflow-publish-close-btn"
          >
            <X size={15} strokeWidth={1.75} />
            Close
          </Button>
          <Button
            onClick={publishWorkflow}
            disabled={hasBlockingErrors}
            className={cn(
              "flex items-center gap-2",
              "transition-all duration-200",
              hasBlockingErrors
                ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none"
                : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-900/20"
            )}
            data-testid="publish-btn"
          >
            <Upload size={15} strokeWidth={1.75} />
            <span>{isPublished ? "Republish" : "Publish"}</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <WizardDrawer
      open={true}
      title={assetDetails?.asset?.name || initialAssetDetails?.asset?.name || "Workflow"}
      icon={<WorkflowPublishV2Icon />}
      tabs={wizardTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onClose={onClose}
      showEditTitle={false}
      showSecondaryAction={false}
      fullFooterComponent={footerComponent}
      hideFooterBorder={true}
      footerBackground="transparent"
      data-testid="workflow-publish-v2-container"
    >
      {/* {publishStatus && <Overlay />} */}
      {publishStatus && (
        <PublishStatus
          publishStatus={publishStatus}
          setPublishStatus={setPublishStatus}
          closeHandler={onClose}
          publishStep={publishStep}
          assetType="workflow"
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

export default WorkflowPublishV2;
