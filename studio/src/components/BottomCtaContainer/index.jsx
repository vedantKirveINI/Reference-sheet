import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TooltipWrapper from "../tooltip-wrapper";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Play, Square, Eye, Wand2 } from "lucide-react";

const SearchIcon = icons.search;
import { MODE } from "../../constants/mode";
import { MODE_COLORS } from "../studio/Header/config";
import WorkflowSettingsPopover from "@src/components/canvas/extensions/common-components/WorkflowSettingsPopover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TinyAIChat, TinyAIButton, SuggestionPopper } from "@/components/TinyAI";
import { buildCandidatePool } from "@/components/studio/CommandPalette/suggestionPipeline";
import { FIX_WITH_AI_EVENT, buildFixWithAIPrompt } from "@/components/canvas/utils/fixWithAI";
import { recordAccepted } from "@/components/canvas-assistant/decisionMemory";
import { useSuggestionFetcher } from "@/components/canvas-assistant/useSuggestionFetcher";
import { createGetUserContext } from "@/components/canvas-assistant/getUserContext";
import { toast } from "sonner";

const CHAT_OPEN_HEIGHT = "55vh";

const BottomCtaContainer = ({
  showAddNodeDrawer,
  onAddNode,
  autoAlignHandler,
  onTest,
  onStop,
  onPreview,
  isRunning,
  mode,
  onShowNodeFinder,
  nodeCount = 0,
  onToggleExecutionHistory,
  executionHistoryOpen,
  getWorkflowContext,
  canvasRef,
  assetId,
  tabData,
  saveNodeDataHandler,
  workspaceId,
}) => {
  const [isChatMode, setIsChatMode] = useState(false);
  const [pendingFixRequest, setPendingFixRequest] = useState(null);
  const [popperDismissed, setPopperDismissed] = useState(false);
  const prevSuggestionRef = useRef(null);
  const [escHintShown, setEscHintShown] = useState(() => {
    try {
      return Boolean(localStorage.getItem("footer_chat_hint_shown"));
    } catch {
      return false;
    }
  });
  const footerRef = useRef(null);
  const hasChatSupport = Boolean(getWorkflowContext && canvasRef && assetId);
  const showRunButton = mode === MODE.WC_CANVAS || mode === MODE.AGENT_CANVAS || mode === MODE.SEQUENCE_CANVAS;

  const allNodes = useMemo(() => {
    if (!tabData) return [];
    const { allNodes: nodes } = buildCandidatePool(tabData);
    return nodes;
  }, [tabData]);

  const {
    suggestion,
    hasPending,
    dismissSuggestion,
    markSeen,
    clearSuggestion,
    muteSuggestions,
  } = useSuggestionFetcher({
    getWorkflowContext,
    assetId,
    allNodes,
    nodeCount,
  });

  const handleSuggestionNodeAdd = useCallback(
    (node) => {
      if (!canvasRef?.current) {
        console.warn("[SuggestionNodeAdd] canvasRef not available");
        return;
      }

      try {
        console.log("[handleSuggestionNodeAdd] Adding node:", {
          type: node.type,
          id: node.id,
          name: node.name,
        });

        const context = getWorkflowContext?.();
        const existingNodes = context?.nodes || [];
        const existingLinks = context?.links || [];

        console.log("[handleSuggestionNodeAdd] Existing nodes:", {
          count: existingNodes.length,
          nodes: existingNodes.map((n, i) => ({
            index: i,
            key: n.key || n.id,
            type: n.type,
            name: n.name,
          })),
        });

        let lastNodeKey = null;
        if (existingNodes.length > 0) {
          const sourceKeys = new Set(existingLinks.map((l) => l.from));

          const endNodes = existingNodes.filter((n) => {
            const key = n.key || n.id;
            return !sourceKeys.has(key);
          });

          console.log("[handleSuggestionNodeAdd] End nodes (not source of any link):", {
            count: endNodes.length,
            nodes: endNodes.map((n) => ({
              key: n.key || n.id,
              type: n.type,
              name: n.name,
            })),
          });

          const candidates = endNodes.length > 0 ? endNodes : existingNodes;

          let bestNode = candidates[0];
          let bestX = -Infinity;
          for (const n of candidates) {
            const key = n.key || n.id;
            if (canvasRef.current.findNode) {
              const goNode = canvasRef.current.findNode(key);
              const loc = goNode?.location || goNode?.data?.location;
              const x = loc?.x ?? 0;
              if (x > bestX) {
                bestX = x;
                bestNode = n;
              }
            }
          }
          lastNodeKey = bestNode.key || bestNode.id;

          console.log("[handleSuggestionNodeAdd] Selected lastNodeKey:", {
            lastNodeKey,
            bestNode: {
              key: bestNode.key || bestNode.id,
              type: bestNode.type,
              name: bestNode.name,
              x: bestX,
            },
            wasEndNode: endNodes.includes(bestNode),
          });
        } else {
          console.log("[handleSuggestionNodeAdd] No existing nodes, lastNodeKey will be null");
        }

        let locationHint = undefined;
        if (lastNodeKey && canvasRef.current.findNode) {
          const lastGoNode = canvasRef.current.findNode(lastNodeKey);
          if (lastGoNode?.location || lastGoNode?.data?.location) {
            const loc = lastGoNode.location || lastGoNode.data.location;
            locationHint = {
              x: (loc.x || 0) + 300,
              y: loc.y || 0,
            };
          }
        }

        const createOpts = {
          openNodeAfterCreate: true,
        };
        if (locationHint) {
          createOpts.location = locationHint;
        }

        const newNode = canvasRef.current.createNode(node, createOpts);

        console.log("[handleSuggestionNodeAdd] Created newNode:", {
          key: newNode?.data?.key,
          type: newNode?.data?.type,
          id: newNode?.data?.id,
          name: newNode?.data?.name,
          hasId: !!newNode?.data?.id,
        });

        if (lastNodeKey && newNode?.data?.key && canvasRef.current.createLink) {
          console.log("[handleSuggestionNodeAdd] Creating link:", {
            from: lastNodeKey,
            to: newNode.data.key,
          });
          canvasRef.current.createLink({
            from: lastNodeKey,
            to: newNode.data.key,
          });
        }

        const connectionHints = suggestion?.connectionHints || [];
        for (const hint of connectionHints) {
          if (hint.from === "last" && hint.to === "new") continue;
          const fromKey = hint.from === "last" ? lastNodeKey : hint.from;
          const toKey = hint.to === "new" ? newNode?.data?.key : hint.to;
          if (fromKey && toKey && fromKey !== toKey && canvasRef.current.createLink) {
            canvasRef.current.createLink({
              from: fromKey,
              to: toKey,
              ...(hint.label != null && { text: hint.label }),
            });
          }
        }

        const suggestedConfig = suggestion?.suggestedConfig;
        if (
          newNode?.data?.key &&
          suggestedConfig &&
          typeof suggestedConfig === "object" &&
          Object.keys(suggestedConfig).length > 0 &&
          saveNodeDataHandler
        ) {
          try {
            saveNodeDataHandler(
              newNode.data,
              { ...(newNode.data?.go_data || {}), ...suggestedConfig },
              {},
              false
            );
            toast.success("Node added and configured by AI. Review and save if needed.");
          } catch (e) {
            toast.info("Node added. Configure it manually.");
          }
        }

        const nodeName = newNode?.data?.name ?? node?.name;
        const nodeType = newNode?.data?.type ?? node?.type;
        console.log("[SuggestionNodeAdd] Node created & linked — name:", nodeName, ", type:", nodeType);
        if (assetId) {
          recordAccepted(assetId, nodeType, nodeName, suggestion?.summary || "");
        }
        clearSuggestion();
      } catch (err) {
        console.error("[SuggestionNodeAdd] Error creating node:", err);
      }
    },
    [canvasRef, assetId, suggestion, getWorkflowContext, clearSuggestion, saveNodeDataHandler],
  );

  const closeChatMode = useCallback(() => {
    setIsChatMode(false);
    setPendingFixRequest(null);
    try {
      localStorage.setItem("footer_chat_hint_shown", "1");
    } catch {}
    setEscHintShown(true);
  }, []);

  useEffect(() => {
    if (suggestion && suggestion !== prevSuggestionRef.current) {
      setPopperDismissed(false);
      prevSuggestionRef.current = suggestion;
    }
  }, [suggestion]);

  const handlePopperDismiss = useCallback(() => {
    setPopperDismissed(true);
  }, []);

  const handlePopperAdd = useCallback(
    (node) => {
      setPopperDismissed(true);
      handleSuggestionNodeAdd(node);
    },
    [handleSuggestionNodeAdd],
  );

  const openChatMode = useCallback(() => {
    setIsChatMode(true);
    setPopperDismissed(true);
    if (hasPending) {
      markSeen();
    }
  }, [hasPending, markSeen]);

  useEffect(() => {
    if (!hasChatSupport) return;
    const handleFixWithAI = (e) => {
      const detail = e.detail || {};
      const prompt = buildFixWithAIPrompt(detail);
      setPendingFixRequest({ prompt, mode: "debug" });
      setIsChatMode(true);
    };
    window.addEventListener(FIX_WITH_AI_EVENT, handleFixWithAI);
    return () => window.removeEventListener(FIX_WITH_AI_EVENT, handleFixWithAI);
  }, [hasChatSupport]);

  useEffect(() => {
    if (!isChatMode) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeChatMode();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isChatMode, closeChatMode]);
  const showPreviewButton = mode === MODE.WORKFLOW_CANVAS;
  const isPreviewDisabled = nodeCount === 0;
  const previewOrRunLabel = mode === MODE.WC_CANVAS ? "Run" : "Preview";

  const modeColors = MODE_COLORS[mode] || MODE_COLORS[MODE.WC_CANVAS];

  const footerLayoutClass = cn(
    "fixed bottom-6 right-1/2 translate-x-1/2 z-[9998]",
    "rounded-island shadow-island",
    "pointer-events-auto overflow-hidden transition-all duration-200",
  );
  const footerBaseClass = cn(footerLayoutClass);

  return (
    <>
    {hasChatSupport && !isChatMode && (
      <SuggestionPopper
        suggestion={suggestion}
        visible={hasPending && !popperDismissed && !isChatMode}
        onAdd={handlePopperAdd}
        onDismiss={handlePopperDismiss}
        onOpenChat={openChatMode}
        footerRef={footerRef}
      />
    )}
    {hasChatSupport && (
      <div
        className={cn(footerLayoutClass, "max-h-[85vh]")}
        style={{
          background: "rgba(255, 255, 255, 0.22)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          height: isChatMode ? CHAT_OPEN_HEIGHT : 0,
          width: isChatMode ? 600 : 0,
          overflow: "hidden",
          opacity: isChatMode ? 1 : 0,
          pointerEvents: isChatMode ? "auto" : "none",
          visibility: isChatMode ? "visible" : "hidden",
          transition: "height 0.4s cubic-bezier(0.32,0.72,0,1), width 0.4s cubic-bezier(0.32,0.72,0,1), opacity 0.3s ease",
        }}
      >
        <div className="flex flex-col h-full w-full min-h-0 min-w-0 overflow-hidden">
          <TinyAIChat
            onClose={closeChatMode}
            getWorkflowContext={getWorkflowContext}
            canvasRef={canvasRef}
            assetId={assetId}
            escHintShown={escHintShown}
            pendingFixRequest={pendingFixRequest}
            onFixRequestConsumed={() => setPendingFixRequest(null)}
            lastSuggestion={suggestion}
            onAddNode={handleSuggestionNodeAdd}
            onDismissSuggestion={dismissSuggestion}
            onMuteSuggestions={muteSuggestions}
            saveNodeDataHandler={saveNodeDataHandler}
            getUserContext={workspaceId ? createGetUserContext(workspaceId) : undefined}
            canvasType={mode}
          />
        </div>
      </div>
    )}
    <AnimatePresence mode="wait">
      {!isChatMode && (
        <motion.div
          key="toolbar"
          ref={footerRef}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          className={footerBaseClass}
          style={{
            background: modeColors.bgSubtle,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: modeColors.border,
            boxShadow: `0 2px 12px ${modeColors.border}, 0 8px 20px rgba(122, 124, 141, 0.12)`,
          }}
        >
          <div
            className={cn(
              "px-3 py-2 flex gap-2.5 items-center h-12",
            )}
          >
      {showRunButton && (
        <>
          {!isRunning ? (
            <Button
              variant="default"
              size="sm"
              onClick={onTest}
              data-testid="run-workflow-button"
              className="w-auto gap-1.5 px-3 h-8 shadow-sm text-white"
              style={{
                backgroundColor: modeColors.buttonBg,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = modeColors.buttonHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = modeColors.buttonBg; }}
            >
              <Play className="w-3.5 h-3.5" />
              {previewOrRunLabel}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onStop}
              data-testid="stop-workflow-button"
              className={cn(
                "w-auto gap-1.5 px-3 h-8",
                "bg-red-500 hover:bg-red-600",
                "shadow-sm",
              )}
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </Button>
          )}

          <div className="w-px h-6 bg-zinc-200" />
        </>
      )}

      {showPreviewButton && (
        <>
          {isPreviewDisabled ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="inline-block cursor-not-allowed"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Button
                      variant="default"
                      size="sm"
                      disabled
                      data-testid="preview-form-button"
                      className={cn(
                        "w-auto gap-1.5 px-3 h-8",
                        "shadow-sm text-white",
                        "opacity-50",
                        "pointer-events-none",
                      )}
                      style={{ backgroundColor: modeColors.buttonBg }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {previewOrRunLabel}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  sideOffset={14}
                  className={cn(
                    "text-base bg-[rgba(33,33,33,0.90)] text-white",
                    "font-['Inter'] border-[0.75px] border-[#CFD8DC]",
                    "w-auto h-auto max-w-64",
                  )}
                  style={{ zIndex: 999999999 }}
                >
                  No node has been configured yet
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onPreview}
              data-testid="preview-form-button"
              className="w-auto gap-1.5 px-3 h-8 shadow-sm text-white"
              style={{
                backgroundColor: modeColors.buttonBg,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = modeColors.buttonHover; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = modeColors.buttonBg; }}
            >
              <Eye className="w-3.5 h-3.5" />
              {previewOrRunLabel}
            </Button>
          )}

          <div className="w-px h-6 bg-zinc-200" />
        </>
      )}

      <Button
        variant="default"
        size="sm"
        onClick={() => {
          showAddNodeDrawer({ via: "add-node-button" });
        }}
        data-testid="add-node-button"
        className="w-auto gap-1.5 px-3 h-8 shadow-sm text-white"
        style={{
          backgroundColor: modeColors.buttonBg,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = modeColors.buttonHover; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = modeColors.buttonBg; }}
      >
        <icons.add className="w-3.5 h-3.5" />
        Add node
      </Button>

      <div className="w-px h-6 bg-zinc-200" />

      <TooltipWrapper
        title="Auto-align nodes"
        component={Button}
        variant="ghost"
        size="icon"
        onClick={autoAlignHandler}
        className={cn(
          "h-8 w-8 rounded-xl",
          "text-zinc-500 hover:text-zinc-900",
          "hover:bg-zinc-100",
          "transition-colors",
        )}
        data-testid="auto-align-button"
      >
        <Wand2 className="w-4 h-4" />
      </TooltipWrapper>

      <TooltipWrapper
        title="Find nodes (Ctrl+F)"
        component={Button}
        variant="ghost"
        size="icon"
        onClick={onShowNodeFinder}
        className={cn(
          "h-8 w-8 rounded-xl",
          "text-zinc-500 hover:text-zinc-900",
          "hover:bg-zinc-100",
          "transition-colors",
        )}
      >
        <SearchIcon className="w-4 h-4" />
      </TooltipWrapper>

      <TooltipWrapper
        title="Execution History"
        component={Button}
        variant="ghost"
        size="icon"
        onClick={onToggleExecutionHistory}
        className={cn(
          "h-8 w-8 rounded-xl",
          executionHistoryOpen ? "text-[#1C3693] bg-blue-50" : "text-zinc-500 hover:text-zinc-900",
          "hover:bg-zinc-100",
          "transition-colors",
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3" />
          <path d="M3.05 11a9 9 0 1 1 .5 4" />
          <path d="M3 16v-5h5" />
        </svg>
      </TooltipWrapper>

      <div className="w-px h-6 bg-zinc-200" />

      {hasChatSupport && (
        <>
          <TinyAIButton onClick={openChatMode} hasSuggestion={hasPending} />
          <div className="w-px h-6 bg-zinc-200" />
        </>
      )}

      <WorkflowSettingsPopover align="center" side="top" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};

export default BottomCtaContainer;
