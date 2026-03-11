import { useState, useEffect } from "react";
import * as go from "gojs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShieldAlert, OctagonX, SkipForward, RotateCcw, GitFork } from "lucide-react";
import { DEFAULT_ERROR_CONFIG, ERROR_STRATEGIES, STRATEGY_LABELS } from "./error-handling-constants";

const STRATEGY_OPTIONS = [
  {
    value: ERROR_STRATEGIES.STOP,
    label: "Stop Workflow",
    description: "Halt execution immediately when an error occurs",
    icon: OctagonX,
  },
  {
    value: ERROR_STRATEGIES.SKIP,
    label: "Skip & Continue",
    description: "Ignore the error and continue to the next step",
    icon: SkipForward,
  },
  {
    value: ERROR_STRATEGIES.RETRY,
    label: "Retry",
    description: "Retry this step before taking further action",
    icon: RotateCcw,
  },
  {
    value: ERROR_STRATEGIES.CUSTOM_ERROR_FLOW,
    label: "Custom Error Flow",
    description: "Route errors to a custom handling path",
    icon: GitFork,
  },
];

const FALLBACK_OPTIONS = [
  { value: ERROR_STRATEGIES.STOP, label: "Stop Workflow" },
  { value: ERROR_STRATEGIES.SKIP, label: "Skip & Continue" },
  { value: ERROR_STRATEGIES.CUSTOM_ERROR_FLOW, label: "Custom Error Flow" },
];

const ErrorHandlingModal = ({ open, onOpenChange, nodeData, canvasRef, onSave }) => {
  const [strategy, setStrategy] = useState(DEFAULT_ERROR_CONFIG.strategy);
  const [retryCount, setRetryCount] = useState(DEFAULT_ERROR_CONFIG.retryCount);
  const [retryDelay, setRetryDelay] = useState(DEFAULT_ERROR_CONFIG.retryDelay);
  const [retryFallback, setRetryFallback] = useState(DEFAULT_ERROR_CONFIG.retryFallback);

  useEffect(() => {
    if (nodeData?.errorConfig) {
      setStrategy(nodeData.errorConfig.strategy || DEFAULT_ERROR_CONFIG.strategy);
      setRetryCount(nodeData.errorConfig.retryCount ?? DEFAULT_ERROR_CONFIG.retryCount);
      setRetryDelay(nodeData.errorConfig.retryDelay ?? DEFAULT_ERROR_CONFIG.retryDelay);
      setRetryFallback(nodeData.errorConfig.retryFallback || DEFAULT_ERROR_CONFIG.retryFallback);
    } else {
      setStrategy(DEFAULT_ERROR_CONFIG.strategy);
      setRetryCount(DEFAULT_ERROR_CONFIG.retryCount);
      setRetryDelay(DEFAULT_ERROR_CONFIG.retryDelay);
      setRetryFallback(DEFAULT_ERROR_CONFIG.retryFallback);
    }
  }, [nodeData]);

  const handleStrategyChange = (value) => {
    setStrategy(value);
    if (value !== ERROR_STRATEGIES.RETRY) {
      setRetryCount(DEFAULT_ERROR_CONFIG.retryCount);
      setRetryDelay(DEFAULT_ERROR_CONFIG.retryDelay);
      setRetryFallback(DEFAULT_ERROR_CONFIG.retryFallback);
    }
  };

  const handleRetryCountChange = (e) => {
    const val = Math.min(10, Math.max(1, parseInt(e.target.value, 10) || 1));
    setRetryCount(val);
  };

  const handleRetryDelayChange = (e) => {
    const val = Math.min(60, Math.max(1, parseInt(e.target.value, 10) || 1));
    setRetryDelay(val);
  };

  const getErrorFangLabel = (config) => {
    if (config.strategy === ERROR_STRATEGIES.SKIP) return "On Error: Skip & Continue";
    if (config.strategy === ERROR_STRATEGIES.RETRY) {
      const fallbackLabel = STRATEGY_LABELS[config.retryFallback] || "Stop";
      return `On Error: Retry ${config.retryCount || 3}x → ${fallbackLabel}`;
    }
    if (config.strategy === ERROR_STRATEGIES.CUSTOM_ERROR_FLOW) return "On Error: Custom Flow";
    return "On Error";
  };

  const getTerminalNodeName = (config) => {
    if (config.strategy === ERROR_STRATEGIES.SKIP) return "Skip";
    if (config.strategy === ERROR_STRATEGIES.RETRY) return `Retry ${config.retryCount || 3}x`;
    return "End";
  };

  const isTerminalStrategy = (strategy) => {
    return strategy === ERROR_STRATEGIES.SKIP || strategy === ERROR_STRATEGIES.RETRY;
  };

  const handleErrorLinks = (config) => {
    const needsVisualFang = config.strategy !== ERROR_STRATEGIES.STOP;
    let resolvedJumpToId = null;

    if (canvasRef?.current && nodeData?.key) {
      const existingLinks = canvasRef.current.findLinksOutOf(nodeData.key);
      const existingErrorLinks = [];
      existingLinks?.each((link) => {
        if (link.data?.category === "errorLink") existingErrorLinks.push(link);
      });

      if (needsVisualFang) {
        const fangLabel = getErrorFangLabel(config);
        const useTerminalNode = isTerminalStrategy(config.strategy);

        if (existingErrorLinks.length > 0) {
          const diagram = canvasRef.current.getDiagram();
          diagram.startTransaction("updateErrorFang");
          existingErrorLinks.forEach((link) => {
            diagram.model.setDataProperty(link.data, "label", fangLabel);
            diagram.model.setDataProperty(link.data, "text", fangLabel);
            diagram.model.setDataProperty(link.data, "errorStrategy", config.strategy);
            resolvedJumpToId = link.data.to;

            const targetNode = diagram.findNodeForKey(link.data.to);
            const targetTemplate = targetNode?.data?.template;
            const isManagedTarget = targetTemplate === "placeholder" || targetTemplate === "errorTerminal";

            if (useTerminalNode) {
              if (targetTemplate === "placeholder") {
                diagram.model.setDataProperty(targetNode.data, "template", "errorTerminal");
                diagram.model.setDataProperty(targetNode.data, "type", "ErrorTerminal");
                diagram.model.setDataProperty(targetNode.data, "name", getTerminalNodeName(config));
                diagram.model.setDataProperty(targetNode.data, "errorStrategy", config.strategy);
                diagram.model.setDataProperty(targetNode.data, "sourceNodeKey", nodeData.key);
                diagram.model.setDataProperty(targetNode.data, "isErrorTerminal", true);
              } else if (targetTemplate === "errorTerminal") {
                diagram.model.setDataProperty(targetNode.data, "name", getTerminalNodeName(config));
                diagram.model.setDataProperty(targetNode.data, "errorStrategy", config.strategy);
              } else {
                canvasRef.current.removeLink(link.data);
                const sourceNode = diagram.findNodeForKey(nodeData.key);
                const sourceLocation = sourceNode?.location || new go.Point(0, 0);
                const terminalData = {
                  key: `error_terminal_${nodeData.key}_${Date.now()}`,
                  template: "errorTerminal",
                  type: "ErrorTerminal",
                  name: getTerminalNodeName(config),
                  errorStrategy: config.strategy,
                  sourceNodeKey: nodeData.key,
                  isErrorTerminal: true,
                  location: go.Point.stringify(
                    new go.Point(sourceLocation.x + 200, sourceLocation.y + 150)
                  ),
                };
                diagram.model.addNodeData(terminalData);
                canvasRef.current.createLink({
                  from: nodeData.key,
                  to: terminalData.key,
                  category: "errorLink",
                  label: fangLabel,
                  isErrorLink: true,
                  errorStrategy: config.strategy,
                });
                resolvedJumpToId = terminalData.key;
              }
            } else {
              if (targetTemplate === "errorTerminal") {
                diagram.model.setDataProperty(targetNode.data, "template", "placeholder");
                diagram.model.setDataProperty(targetNode.data, "type", "Placeholder");
                diagram.model.setDataProperty(targetNode.data, "name", "");
                diagram.model.setDataProperty(targetNode.data, "isErrorTerminal", false);
                diagram.model.setDataProperty(targetNode.data, "sourceNodeKey", null);
                diagram.model.setDataProperty(targetNode.data, "errorStrategy", null);
              }
            }
          });
          diagram.commitTransaction("updateErrorFang");
        } else {
          const diagram = canvasRef.current.getDiagram();
          const sourceNode = diagram.findNodeForKey(nodeData.key);
          if (sourceNode) {
            const sourceLocation = sourceNode.location;
            const targetNodeData = useTerminalNode
              ? {
                  key: `error_terminal_${nodeData.key}_${Date.now()}`,
                  template: "errorTerminal",
                  type: "ErrorTerminal",
                  name: getTerminalNodeName(config),
                  errorStrategy: config.strategy,
                  sourceNodeKey: nodeData.key,
                  isErrorTerminal: true,
                  location: go.Point.stringify(
                    new go.Point(sourceLocation.x + 200, sourceLocation.y + 150)
                  ),
                }
              : {
                  key: `error_placeholder_${nodeData.key}_${Date.now()}`,
                  template: "placeholder",
                  type: "Placeholder",
                  location: go.Point.stringify(
                    new go.Point(sourceLocation.x + 200, sourceLocation.y + 150)
                  ),
                };

            diagram.startTransaction("createErrorTarget");
            diagram.model.addNodeData(targetNodeData);
            diagram.commitTransaction("createErrorTarget");

            const linkDataToCreate = {
              from: nodeData.key,
              to: targetNodeData.key,
              category: "errorLink",
              label: fangLabel,
              isErrorLink: true,
              errorStrategy: config.strategy,
            };
            canvasRef.current.createLink(linkDataToCreate);
            resolvedJumpToId = targetNodeData.key;
          }
        }
      } else {
        const diagram = canvasRef.current.getDiagram();
        existingErrorLinks.forEach((link) => {
          const targetNode = diagram.findNodeForKey(link.data.to);
          if (targetNode?.data?.template === "placeholder" || targetNode?.data?.template === "errorTerminal") {
            diagram.startTransaction("removeErrorTarget");
            diagram.model.removeNodeData(targetNode.data);
            diagram.commitTransaction("removeErrorTarget");
          }
          canvasRef.current.removeLink(link.data);
        });
      }
    }
    return resolvedJumpToId;
  };

  const handleSave = () => {
    const config = { strategy, retryCount, retryDelay, retryFallback };
    const jumpToId = handleErrorLinks(config);
    if (jumpToId) {
      config.jump_to_id = jumpToId;
    }
    if (onSave) {
      onSave(nodeData.key, config);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 border border-blue-100">
              <ShieldAlert className="w-4 h-4 text-[#1C3693]" />
            </div>
            <DialogTitle className="text-base font-semibold">Error Handling</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Configure error behavior for <span className="font-medium text-foreground">{nodeData?.name || "this node"}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Strategy
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STRATEGY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = strategy === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleStrategyChange(option.value)}
                    className={`flex flex-col items-start gap-1.5 p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-[#1C3693] bg-blue-50 shadow-sm"
                        : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`w-4 h-4 ${
                          isSelected ? "text-[#1C3693]" : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-[#1C3693]" : "text-foreground"
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {strategy === ERROR_STRATEGIES.RETRY && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/40 border border-border/60">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Retry Configuration
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Retries
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={retryCount}
                    onChange={handleRetryCountChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Delay (seconds)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={retryDelay}
                    onChange={handleRetryDelayChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  After all retries fail
                </label>
                <Select value={retryFallback} onValueChange={setRetryFallback}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FALLBACK_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/60 bg-muted/20">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 text-white transition-colors"
            style={{ backgroundColor: "#1C3693" }}
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorHandlingModal;
