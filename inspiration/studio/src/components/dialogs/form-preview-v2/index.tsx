import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PreviewProvider, usePreviewContext } from "./context";
import { PreviewHeader } from "./components/PreviewHeader";
import { PreviewCanvas } from "./components/PreviewCanvas";
import { FloatingActions } from "./components/FloatingActions";
import { FormRenderer, FormRendererRef } from "./components/FormRenderer";
import { UnconfiguredStepScreen } from "./components/UnconfiguredStepScreen";
import { MultipleEntryPointsScreen } from "./components/MultipleEntryPointsScreen";
import { ModeType, ViewPortType, ViewPort } from "./constants";
import { previewSafeTransform } from "./utils/previewSafeTransform";
import { canvasSDKServices } from "@/components/canvas/services/canvasSDKServices";
import { icons } from "@/components/icons";

interface FormRendererWrapperProps {
  nodes: Record<string, any>;
  variables: Record<string, any>;
  resourceIds: Record<string, any>;
  onEvent: (event: any) => void;
  onReachBoundary: (boundaryNode: any) => void;
  hideBranding: boolean;
  restartKey: number;
  formRef: React.RefObject<FormRendererRef>;
  unconfiguredBoundary: any;
}

function DefaultThemeBanner({
  onChooseTheme,
  onDismiss,
  viewport,
}: {
  onChooseTheme: () => void;
  onDismiss: () => void;
  viewport: ViewPortType;
}) {
  const isMobile = viewport === ViewPort.MOBILE;
  const XIcon = icons.x;
  const PaletteIcon = icons.palette;
  return (
    <div
      className={cn(
        "absolute left-2.5 right-2.5 top-2.5 z-[100] flex flex-row items-center gap-3 rounded-2xl px-3 py-2.5",
        "bg-white/25 dark:bg-zinc-900/25 backdrop-blur-xl",
        "shadow-[0_4px_20px_rgba(0,0,0,0.08),0_0_1px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {PaletteIcon ? <PaletteIcon className="h-4 w-4" /> : null}
      </div>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-0",
          isMobile ? "items-start" : "flex-row flex-wrap items-center justify-between gap-2"
        )}
      >
        <div className="min-w-0">
          <h3 className="m-0 truncate text-sm font-semibold leading-tight text-foreground">
            Your form is using the default look.
          </h3>
          <p className="m-0 mt-0.5 line-clamp-1 text-xs font-normal leading-snug text-muted-foreground">
            Give your form a glow-up. Choose theme now!
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onChooseTheme}
            className="h-7 rounded-md px-2.5 text-xs"
          >
            Choose theme
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-7 w-7 flex-shrink-0 rounded-full"
            aria-label="Dismiss"
          >
            {XIcon ? <XIcon className="h-3.5 w-3.5" /> : null}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormContentWithBanner({
  children,
  onCustomizeTheme,
  onClose,
}: {
  children: React.ReactNode;
  onCustomizeTheme?: () => void;
  onClose: () => void;
}) {
  const { isDefaultTheme, viewport } = usePreviewContext();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = Boolean(isDefaultTheme && onCustomizeTheme && !bannerDismissed);

  const handleChooseTheme = () => {
    onClose();
    setTimeout(() => {
      onCustomizeTheme?.();
    }, 150);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="h-full w-full flex min-h-0 flex-1 flex-col">
        {children}
      </div>
      {showBanner && (
        <DefaultThemeBanner
          viewport={viewport}
          onChooseTheme={handleChooseTheme}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}
    </div>
  );
}

function FormRendererWrapper({
  nodes,
  variables,
  resourceIds,
  onEvent,
  onReachBoundary,
  hideBranding,
  restartKey,
  formRef,
  unconfiguredBoundary,
}: FormRendererWrapperProps) {
  const { effectiveTheme } = usePreviewContext();

  const handleSuccess = useCallback(async () => {
    if (unconfiguredBoundary) {
      onReachBoundary(unconfiguredBoundary);
    }
  }, [unconfiguredBoundary, onReachBoundary]);

  return (
    <FormRenderer
      key={restartKey}
      ref={formRef}
      nodes={nodes}
      theme={effectiveTheme}
      variables={variables}
      resourceIds={resourceIds}
      onEvent={onEvent}
      onSuccess={handleSuccess}
      hideBranding={hideBranding}
    />
  );
}

interface FormPreviewV2Props {
  open: boolean;
  onClose: () => void;
  onPublish: () => void;
  formName: string;
  payload: any;
  theme?: any;
  variables?: Record<string, any>;
  params?: Record<string, any>;
  resourceIds?: Record<string, any>;
  onEvent?: (event: any) => void;
  onAnalyticsEvent?: (event: any) => void;
  onThemeChange?: (theme: any) => void;
  hideBranding?: boolean;
  assetId?: string;
  initialMode?: ModeType;
  initialViewport?: ViewPortType;
  onNavigateToNode?: (nodeKey: string) => void;
  /** When provided and form uses default theme, clicking the theme banner calls this (e.g. open theme on canvas). */
  onCustomizeTheme?: () => void;
  /** When true, show embed-specific onboarding copy (e.g. in UnconfiguredStepScreen). */
  embedMode?: boolean;
  /** Called when user needs to sign up/log in (e.g. for auth-required step). */
  onEmbedAuthRequired?: () => void;
  /** When in embedMode, (nodeType) => true if this node type requires auth to configure. */
  embedRequiresAuthForNodeType?: (nodeType: string) => boolean;
}

export function FormPreviewV2({
  open,
  onClose,
  onPublish,
  formName,
  payload,
  theme,
  variables = {},
  params = {},
  resourceIds,
  onEvent,
  onAnalyticsEvent,
  onThemeChange,
  hideBranding = false,
  assetId,
  initialMode,
  initialViewport,
  onNavigateToNode,
  onCustomizeTheme,
  embedMode = false,
  onEmbedAuthRequired,
  embedRequiresAuthForNodeType,
}: FormPreviewV2Props) {
  const [nodes, setNodes] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorNodes, setErrorNodes] = useState<string[]>([]);
  const [allUnconfiguredNodes, setAllUnconfiguredNodes] = useState<any[]>([]);
  const [firstUnconfiguredBoundary, setFirstUnconfiguredBoundary] = useState<any>(null);
  const [showUnconfiguredScreen, setShowUnconfiguredScreen] = useState(false);
  const [currentErrorIndex, setCurrentErrorIndex] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [previewSnapshotId, setPreviewSnapshotId] = useState<string | null>(null);
  const formRef = useRef<FormRendererRef>(null);

  const allVariables = { ...params, ...variables };

  const computedResourceIds = useMemo(
    () => ({
      ...(resourceIds || {
        parentId: payload?.parent_id,
        projectId: payload?.project_id,
        workspaceId: payload?.workspace_id,
        assetId: assetId || payload?._id,
        _id: "",
        canvasId: payload?._id,
      }),
      ...(previewSnapshotId ? { snapshotCanvasId: previewSnapshotId } : {}),
    }),
    [resourceIds, payload?.parent_id, payload?.project_id, payload?.workspace_id, payload?._id, assetId, previewSnapshotId]
  );

  const loadPreviewNodes = useCallback(async () => {
    if (!payload) {
      setError("No form data available");
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorType(null);
    setErrorNodes([]);
    setAllUnconfiguredNodes([]);
    setFirstUnconfiguredBoundary(null);
    setShowUnconfiguredScreen(false);
    setCurrentErrorIndex(0);
    setPreviewSnapshotId(null);

    try {
      const canvasData = typeof payload._r === "string" ? payload._r : JSON.stringify(payload._r || {});
      if (!embedMode) {
        try {
          const snapshotResponse = await canvasSDKServices.saveSnapshot({
            _r: canvasData,
            asset_id: assetId || payload?.asset_id || payload?._id,
            workspace_id: payload?.workspace_id,
            project_id: payload?.project_id,
          });
          if (snapshotResponse?.status === "success" && snapshotResponse?.result?._id) {
            setPreviewSnapshotId(snapshotResponse.result._id);
          }
        } catch {
          // Best-effort: allow preview without snapshot if backend is unavailable
        }
      }

      const result = await previewSafeTransform(payload);

      const nodeKeys = result.nodes ? Object.keys(result.nodes) : [];
      console.log("[FormPreview] result:", result.status, "flowNodes:", nodeKeys.length, "allUnconfiguredNodes:", result.allUnconfiguredNodes?.length ?? 0, "firstUnconfiguredBoundary:", result.firstUnconfiguredBoundary ? { key: result.firstUnconfiguredBoundary.nodeKey, type: result.firstUnconfiguredBoundary.nodeType, error: result.firstUnconfiguredBoundary.error } : null);
      if ((result.allUnconfiguredNodes?.length ?? 0) > 0) {
        console.log("[FormPreview] steps to be configured:", result.allUnconfiguredNodes?.map((n: any) => ({ nodeKey: n.nodeKey, nodeType: n.nodeType, nodeName: n.nodeName, error: n.error })));
      }

      if (result.status === "success") {
        setNodes(result.nodes);
        setAllUnconfiguredNodes(result.allUnconfiguredNodes || []);
        setFirstUnconfiguredBoundary(result.firstUnconfiguredBoundary || null);
      } else if (result.status === "error" && result.errorType === "MULTIPLE_ENTRY_POINTS") {
        setErrorType("MULTIPLE_ENTRY_POINTS");
        setErrorNodes(result.errorNodes || []);
        setNodes(null);
      } else if (result.status === "partial") {
        setAllUnconfiguredNodes(result.allUnconfiguredNodes || []);
        setShowUnconfiguredScreen(true);
        setNodes(null);
      } else {
        setError(result.errorMessage || "Failed to load preview");
      }
    } catch (err) {
      setError("An error occurred while loading the preview");
    } finally {
      setIsLoading(false);
    }
  }, [payload, assetId, embedMode]);

  const handleRestart = useCallback(() => {
    setShowUnconfiguredScreen(false);
    setCurrentErrorIndex(0);
    setRestartKey((prev) => prev + 1);
  }, []);

  const handleEvent = useCallback(
    (event: any) => {
      onEvent?.(event);
      onAnalyticsEvent?.(event);
    },
    [onEvent, onAnalyticsEvent]
  );

  const handleReachBoundary = useCallback((boundaryNode: any) => {
    console.log("[FormPreview] handleReachBoundary", boundaryNode?.nodeKey, boundaryNode?.nodeType);
    setShowUnconfiguredScreen(true);
    setCurrentErrorIndex(0);
  }, []);

  const handleSetupNow = useCallback(() => {
    const nodeToNavigate = allUnconfiguredNodes[currentErrorIndex];
    if (nodeToNavigate?.nodeKey && onNavigateToNode) {
      onClose();
      setTimeout(() => {
        onNavigateToNode(nodeToNavigate.nodeKey);
      }, 100);
    } else {
      onClose();
    }
  }, [allUnconfiguredNodes, currentErrorIndex, onNavigateToNode, onClose]);

  const handleNavigatePrevError = useCallback(() => {
    setCurrentErrorIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNavigateNextError = useCallback(() => {
    setCurrentErrorIndex((prev) => Math.min(allUnconfiguredNodes.length - 1, prev + 1));
  }, [allUnconfiguredNodes.length]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      loadPreviewNodes();
    } else {
      document.body.style.overflow = "";
      setNodes(null);
      setError(null);
      setErrorType(null);
      setErrorNodes([]);
      setAllUnconfiguredNodes([]);
      setFirstUnconfiguredBoundary(null);
      setShowUnconfiguredScreen(false);
      setCurrentErrorIndex(0);
      setRestartKey(0);
      setPreviewSnapshotId(null);
    }

    return () => {
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const currentUnconfiguredNode = allUnconfiguredNodes[currentErrorIndex] || null;
  const requiresAuthForCurrentStep =
    embedMode && embedRequiresAuthForNodeType?.(currentUnconfiguredNode?.nodeType ?? "") === true;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn("absolute inset-0", "bg-white")}
          >
            <PreviewProvider
              formName={formName}
              onClose={onClose}
              onPublish={onPublish}
              onRestart={handleRestart}
              onThemeChange={onThemeChange}
              initialMode={initialMode}
              initialViewport={initialViewport}
              initialTheme={theme}
            >
              <PreviewHeader />
              <PreviewCanvas>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-zinc-200 border-t-zinc-600 rounded-full animate-spin" />
                    <span className="text-sm text-zinc-500">Loading preview...</span>
                  </div>
                </div>
              ) : showUnconfiguredScreen && allUnconfiguredNodes.length > 0 ? (
                <UnconfiguredStepScreen
                  nodeInfo={currentUnconfiguredNode}
                  totalErrors={allUnconfiguredNodes.length}
                  currentIndex={currentErrorIndex}
                  onPrevious={handleNavigatePrevError}
                  onNext={handleNavigateNextError}
                  onSetupNow={handleSetupNow}
                  onClose={onClose}
                  embedMode={embedMode}
                  requiresAuth={requiresAuthForCurrentStep}
                  onRequiresAuth={onEmbedAuthRequired}
                />
              ) : errorType === "MULTIPLE_ENTRY_POINTS" ? (
                <MultipleEntryPointsScreen errorNodes={errorNodes} onClose={onClose} />
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span className="text-sm text-zinc-600">{error}</span>
                    <Button
                      variant="secondary"
                      onClick={loadPreviewNodes}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-700"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : nodes ? (
                <FormContentWithBanner
                  onCustomizeTheme={onCustomizeTheme}
                  onClose={onClose}
                >
                  <FormRendererWrapper
                    restartKey={restartKey}
                    formRef={formRef}
                    nodes={nodes}
                    variables={allVariables}
                    resourceIds={computedResourceIds}
                    onEvent={handleEvent}
                    onReachBoundary={handleReachBoundary}
                    hideBranding={hideBranding}
                    unconfiguredBoundary={firstUnconfiguredBoundary}
                  />
                </FormContentWithBanner>
              ) : null}
            </PreviewCanvas>
              <FloatingActions />
            </PreviewProvider>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { Mode, ViewPort } from "./constants";
export type { ModeType, ViewPortType } from "./constants";
