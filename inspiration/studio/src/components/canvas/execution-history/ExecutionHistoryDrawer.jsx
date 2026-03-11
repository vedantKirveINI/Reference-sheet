import { useState, useEffect, useCallback, useRef } from "react";
import flowExecutionServices from "@src/sdk-services/flow-execution-sdk-services";
import { toast } from "sonner";
import RunList from "./RunList";
import RunDetail from "./RunDetail";
import { Terminal } from "@src/module/terminal/terminal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 200;
const MAX_HEIGHT_VH = 0.6;
const DEFAULT_HEIGHT = 300;
const EXPANDED_WIDTH = "min(72rem, calc(100vw - 2rem))";
const DEFAULT_WIDTH = "min(56rem, calc(100vw - 6rem))";
const EXPANDED_HEIGHT = 0.8; // 80vh
const EXPANDED_HEIGHT_MAX_PX = 800;

function ExecutionHistoryDrawer({
  workspaceId,
  assetId,
  isOpen,
  onToggle,
  liveLogs = [],
  isLiveRunActive = false,
  refetchTrigger = 0,
}) {
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [panelHeight, setPanelHeight] = useState(DEFAULT_HEIGHT);
  const [isExpanded, setIsExpanded] = useState(false);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(DEFAULT_HEIGHT);

  const expandedHeightPx =
    typeof window !== "undefined"
      ? Math.min(window.innerHeight * EXPANDED_HEIGHT, EXPANDED_HEIGHT_MAX_PX)
      : EXPANDED_HEIGHT_MAX_PX;
  const effectiveWidth = isExpanded ? EXPANDED_WIDTH : DEFAULT_WIDTH;
  const effectiveHeight = isExpanded ? expandedHeightPx : panelHeight;

  const fetchExecutions = useCallback(async () => {
    if (!workspaceId || !assetId) return;

    setIsLoading(true);
    try {
      const response = await flowExecutionServices.getList({
        workspace_id: workspaceId,
        asset_id: assetId,
        limit: 100,
        page: 1,
      });

      if (response?.status === "success") {
        const docs = response?.result?.docs || [];
        setExecutions(docs);
        if (docs.length > 0 && !selectedExecution) {
          setSelectedExecution(docs[0]);
        }
      } else {
        toast.error("Unable to fetch execution history");
      }
    } catch {
      toast.error("Unable to fetch execution history");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, assetId]);

  useEffect(() => {
    fetchExecutions();
  }, [fetchExecutions]);

  useEffect(() => {
    if (refetchTrigger > 0) {
      fetchExecutions();
    }
  }, [refetchTrigger, fetchExecutions]);

  useEffect(() => {
    if (isLiveRunActive || (liveLogs && liveLogs.length > 0)) {
      console.log("[ExecutionHistoryDrawer] live run state", {
        liveLogsCount: (liveLogs ?? []).length,
        isLiveRunActive,
      });
    }
  }, [isLiveRunActive, liveLogs]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onToggle();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    draggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = panelHeight;

    const handleMouseMove = (moveEvent) => {
      if (!draggingRef.current) return;
      const delta = startYRef.current - moveEvent.clientY;
      const maxHeight = window.innerHeight * MAX_HEIGHT_VH;
      const newHeight = Math.min(maxHeight, Math.max(MIN_HEIGHT, startHeightRef.current + delta));
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [panelHeight]);

  const handleSelect = useCallback((execution) => {
    setSelectedExecution(execution);
  }, []);

  const MaximizeIcon = icons.maximize2;
  const MinimizeIcon = icons.minimize2;
  const RefreshIcon = icons.refreshCw;
  const CloseIcon = icons.x;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Close execution history"
        className="fixed inset-0 z-[1000] cursor-default"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      />
      <div
        className="fixed left-1/2 bottom-[4.5rem] z-[1001] pointer-events-auto -translate-x-1/2 transition-[width,height] duration-200 ease-out"
        style={{
          width: effectiveWidth,
          height: effectiveHeight,
        }}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          {!isExpanded && (
            <div
              className="flex h-1.5 shrink-0 cursor-ns-resize items-center justify-center border-b border-border bg-background"
              onMouseDown={handleMouseDown}
            >
              <div className="h-1.5 w-8 rounded-sm bg-muted" />
            </div>
          )}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
            <span className="text-sm font-semibold tracking-tight text-foreground">Execution History</span>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={fetchExecutions}
                  >
                    <RefreshIcon className="h-3.5 w-3.5" />
                    <span className="sr-only">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsExpanded((prev) => !prev)}
                  >
                    {isExpanded ? (
                      <MinimizeIcon className="h-3.5 w-3.5" />
                    ) : (
                      <MaximizeIcon className="h-3.5 w-3.5" />
                    )}
                    <span className="sr-only">{isExpanded ? "Collapse" : "Expand"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isExpanded ? "Collapse" : "Expand"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={onToggle}
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                    <span className="sr-only">Close</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="w-[17.5rem] shrink-0 border-r border-border">
            <ScrollArea className="h-full">
              <RunList
                executions={executions}
                selectedId={selectedExecution?._id}
                onSelect={handleSelect}
                isLoading={isLoading}
              />
            </ScrollArea>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {isLiveRunActive || (liveLogs && liveLogs.length > 0) ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[0.6875rem] text-muted-foreground">
                      Current run
                      {isLiveRunActive && (
                        <span className="ml-2 text-amber-600 text-xs font-medium">
                          Running...
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <Terminal
                    logs={(liveLogs ?? []).filter(Boolean)}
                    onClearTerminal={() => {}}
                    verbose
                    onCollapseToggle={() => {}}
                    title=""
                    showHeader={false}
                    showClearTerminal={false}
                    hasStreaming={true}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <RunDetail
                  execution={selectedExecution}
                  workspaceId={workspaceId}
                  assetId={assetId}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default ExecutionHistoryDrawer;
