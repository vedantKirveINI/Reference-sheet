import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { getMode } from "../../canvas/config";
import { MODE } from "../../../constants/mode";
import { getFormattedDate } from "../../../utils/utils";
import { Island } from "@/components/ui/island";
import HeaderBrand from "./HeaderBrand";
import HeaderStatus from "./HeaderStatus";
import HeaderMetrics from "./HeaderMetrics";
import HeaderActions from "./HeaderActions";
import { MODE_CONFIG } from "./config";

/**
 * Studio header for canvas/scene pages (e.g. workflow canvas, sequence).
 * Expects assetDetails with asset.name, asset.edited_at, asset.published_info,
 * and optionally asset.settings. Pass mode so the header can pick the right
 * config (status, actions, and when re-enabled via showMetrics, metrics).
 */
const Header = ({
  mode: modeProp,
  assetDetails,
  updateWorkflow,
  saveButtonRef,
  publishBtnRef,
  loading,
  isRunning,
  onAssetDetailsChange,
  settings,
  metrics = {},
  isDraft: isDraftProp,
  isPublished: isPublishedProp,
  hasErrors = false,
  isInactive = false,
  compact = true,
  className,
  isDirty = false,
  onMarkDirty,
  showMetrics = false,
  isEmbedMode = false,
  isEmbedAuthenticated = false,
  onEmbedSignUp,
  onOpenGlobalParams,
  onOpenThemeManager,
  onOpenHelp,
}) => {
  const mode = useMemo(() => modeProp || getMode(), [modeProp]);
  const config = MODE_CONFIG[mode] || MODE_CONFIG[MODE.WORKFLOW_CANVAS];

  const isPublished =
    isPublishedProp ?? !!assetDetails?.asset?.published_info?.published_at;
  const isDraft =
    isDraftProp ?? (!isPublished && !!assetDetails?.asset?.edited_at);

  const subtitle = useMemo(() => {
    if (isPublished && assetDetails?.asset?.published_info?.published_at) {
      return `Last published on ${getFormattedDate(assetDetails.asset.published_info.published_at)}`;
    }
    if (assetDetails?.asset?.edited_at) {
      return `Last saved on ${getFormattedDate(assetDetails.asset.edited_at)}`;
    }
    return null;
  }, [isPublished, assetDetails]);

  const handleTitleChange = (newTitle) => {
    if (newTitle && newTitle !== assetDetails?.asset?.name) {
      onMarkDirty?.();
      updateWorkflow?.({
        name: newTitle,
        description: assetDetails?.asset?.meta?.description,
      });
    }
  };

  const handleSave = () => {
    updateWorkflow?.({
      name: assetDetails?.asset?.name,
      description: assetDetails?.asset?.meta?.description,
    });
  };

  const handlePublish = () => {
    updateWorkflow?.(
      {
        name: assetDetails?.asset?.name,
        description: assetDetails?.asset?.meta?.description,
      },
      { isPublish: true },
    );
  };

  const handleActiveToggle = (enabled) => {
    onAssetDetailsChange?.({ enabled });
  };

  const handleOnlineToggle = (online) => {
    onAssetDetailsChange?.({ online });
  };

  const effectiveSettings = settings || assetDetails?.asset?.settings;

  const hasMetrics = config.showMetrics && isPublished && (
    metrics.today !== undefined || 
    metrics.successRate !== undefined
  );

  return (
    <Island
      role="banner"
      elevation="base"
      rounded="default"
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 pointer-events-auto",
        className,
      )}
      data-testid="studio-header"
    >
      <HeaderBrand
        mode={mode}
        title={assetDetails?.asset?.name}
        subtitle={subtitle}
        onTitleChange={handleTitleChange}
        compact={compact}
      />

      <HeaderStatus
        isDraft={isDraft}
        isPublished={isPublished}
        isRunning={isRunning}
        hasErrors={hasErrors}
        isInactive={isInactive}
        compact={compact}
      />

      {/* Metrics card disabled – data is dummy; re-enable when backend provides real run_count/failure_count (pass showMetrics={true} from parent) */}
      {/* {showMetrics && hasMetrics && (
        <HeaderMetrics mode={mode} metrics={metrics} compact={compact} />
      )} */}

      <div className="flex-1" />

      <HeaderActions
        mode={mode}
        isPublished={isPublished}
        loading={loading}
        settings={effectiveSettings}
        onSave={handleSave}
        onPublish={handlePublish}
        onActiveToggle={handleActiveToggle}
        onOnlineToggle={handleOnlineToggle}
        saveButtonRef={saveButtonRef}
        publishBtnRef={publishBtnRef}
        compact={compact}
        isDirty={isDirty}
        isEmbedMode={isEmbedMode}
        isEmbedAuthenticated={isEmbedAuthenticated}
        onEmbedSignUp={onEmbedSignUp}
        onOpenGlobalParams={onOpenGlobalParams}
        onOpenThemeManager={onOpenThemeManager}
        onOpenHelp={onOpenHelp}
      />
    </Island>
  );
};

export default Header;
