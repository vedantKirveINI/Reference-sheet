import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, AlertTriangle, AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormulaFX } from "@/components/formula-fx/src";
import cloneDeep from "lodash/cloneDeep";

const LOG_LEVELS = {
  info: {
    id: "info",
    label: "Info",
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  warning: {
    id: "warning",
    label: "Warning",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  error: {
    id: "error",
    label: "Error",
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

const LogLevelDropdown = ({ value, onChange }) => {
  const selectedLevel = LOG_LEVELS[value] || LOG_LEVELS.info;
  const SelectedIcon = selectedLevel.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 h-8 px-3 text-sm rounded-lg transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
            selectedLevel.bgColor,
            "border",
            selectedLevel.borderColor,
          )}
        >
          <SelectedIcon className={cn("w-3.5 h-3.5", selectedLevel.color)} />
          <span className="text-zinc-700 font-medium">
            {selectedLevel.label}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px]">
        {Object.values(LOG_LEVELS).map((level) => {
          const LevelIcon = level.icon;
          return (
            <DropdownMenuItem
              key={level.id}
              onClick={() => onChange(level.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <LevelIcon className={cn("w-4 h-4", level.color)} />
              <span>{level.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const LogSection = ({
  label,
  description,
  variables,
  defaultContent,
  logLevel,
  onContentChange,
  onLevelChange,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <Label className="text-sm font-medium text-zinc-800">{label}</Label>
          <span className="text-xs text-zinc-500">{description}</span>
        </div>
        <LogLevelDropdown value={logLevel} onChange={onLevelChange} />
      </div>
      <div className="min-h-[80px] max-h-[120px] overflow-y-auto rounded-lg border border-zinc-200 bg-white">
        <FormulaFX
          variables={variables}
          defaultInputContent={cloneDeep(defaultContent)}
          onInputContentChanged={onContentChange}
          wrapContent={true}
          placeholder="Type your log message..."
          hideBorders={true}
          slotProps={{
            container: { style: { minHeight: "76px", height: "100%" } },
            content: { style: { minHeight: "76px" } },
          }}
        />
      </div>
    </div>
  );
};

const getNodeDisplayTitle = (nodeData) => {
  // Custom name takes priority
  if (nodeData?.go_data?.hasCustomName && nodeData?.name) {
    return nodeData.name;
  }
  // Question content label (extracted from question text)
  if (nodeData?.go_data?.label) {
    return nodeData.go_data.label;
  }
  // Fallback to displayTitle if set
  if (nodeData?.go_data?.displayTitle) {
    return nodeData.go_data.displayTitle;
  }
  // Description as another fallback
  if (nodeData?.go_data?.description) {
    return nodeData.go_data.description;
  }
  // Final fallback to title or name
  return nodeData?.title || nodeData?.name || "Add Logs";
};

const AddLogsPopover = ({
  nodeData,
  popoverCoordinates,
  variables = {},
  onSave = () => {},
  onDiscard = () => {},
  onClose = () => {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);

  const [beforeExecutionLogs, setBeforeExecutionLogs] = useState(
    nodeData?.logs?.before || { type: "fx", blocks: [] },
  );
  const [afterExecutionLogs, setAfterExecutionLogs] = useState(
    nodeData?.logs?.after || { type: "fx", blocks: [] },
  );
  const [beforeLogLevel, setBeforeLogLevel] = useState(
    nodeData?.logs?.beforeLevel || "info",
  );
  const [afterLogLevel, setAfterLogLevel] = useState(
    nodeData?.logs?.afterLevel || "info",
  );

  const displayTitle = useMemo(() => getNodeDisplayTitle(nodeData), [nodeData]);

  const beforeLogsVariables = useMemo(() => {
    if (!variables?.NODE) return variables;
    return {
      ...variables,
      NODE: variables.NODE.filter((node) => node.key !== nodeData?.key),
    };
  }, [nodeData?.key, variables]);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleSave = () => {
    onSave({
      before: beforeExecutionLogs,
      after: afterExecutionLogs,
      beforeLevel: beforeLogLevel,
      afterLevel: afterLogLevel,
    });
    handleClose();
  };

  const handleDiscard = () => {
    onDiscard();
    onClose();
  };

  return (
    <>
      <div
        ref={anchorRef}
        style={{
          position: "absolute",
          top: popoverCoordinates?.top || 0,
          left: popoverCoordinates?.left || 0,
          width: 1,
          height: 1,
          pointerEvents: "none",
        }}
      />
      <Popover open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <PopoverAnchor virtualRef={{ current: anchorRef.current }} />
        <PopoverContent
          side="right"
          align="start"
          sideOffset={12}
          className="w-[480px] p-0 rounded-xl border-0 shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="bg-white"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{
                    backgroundColor: nodeData?.background || "#18181b",
                    color: nodeData?.foreground || "#ffffff",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {nodeData?._src && (
                      <img
                        src={nodeData._src}
                        alt=""
                        className="w-6 h-6 rounded-md object-cover"
                      />
                    )}
                    <span className="font-semibold text-sm tracking-wide">
                      {displayTitle}
                    </span>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    data-testid="add-logs-close-icon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Intro text */}
                <div className="px-5 pt-4 pb-2">
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Add debug messages that will appear in your workflow logs.
                  </p>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 flex flex-col gap-5">
                  <LogSection
                    label="Before Execution"
                    description="Logs output before this step runs"
                    variables={beforeLogsVariables}
                    defaultContent={beforeExecutionLogs?.blocks || []}
                    logLevel={beforeLogLevel}
                    onContentChange={(content) => {
                      setBeforeExecutionLogs({
                        type: "fx",
                        blocks: content,
                      });
                    }}
                    onLevelChange={setBeforeLogLevel}
                  />

                  <LogSection
                    label="After Execution"
                    description="Logs output after this step completes"
                    variables={variables}
                    defaultContent={afterExecutionLogs?.blocks || []}
                    logLevel={afterLogLevel}
                    onContentChange={(content) => {
                      setAfterExecutionLogs({
                        type: "fx",
                        blocks: content,
                      });
                    }}
                    onLevelChange={setAfterLogLevel}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-zinc-100 bg-zinc-50/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDiscard}
                    className="h-9 px-4 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg font-medium"
                    data-testid="add-logs-discard"
                  >
                    Discard
                  </Button>
                  <Button
                    variant="black"
                    size="sm"
                    onClick={handleSave}
                    className="h-9 px-5 rounded-lg font-medium"
                    data-testid="add-logs-save"
                  >
                    Save Logs
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default AddLogsPopover;
