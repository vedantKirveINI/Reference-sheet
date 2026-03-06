import React, { useRef, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

import ExecutionResult from "./ExecutionResult";

const NodeIconDisplay = ({ iconSrc }) => {
  const [hasError, setHasError] = useState(false);

  if (!iconSrc || hasError) {
    return (
      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center ring-1 ring-black/5">
        <div className="w-5 h-5 rounded bg-zinc-300" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center ring-1 ring-black/5">
      <img
        src={iconSrc}
        alt="Node icon"
        className="w-5 h-5"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

const ExecutionResultsPopover = ({
  data,
  onClose = () => {},
  popoverCoordinates,
}) => {
  const anchorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const executions = data?._executions || [];
  const hasMultiple = executions.length > 1;
  const currentExecution = executions[currentIndex] || {};
  const hasError = !!currentExecution?.error;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(executions.length - 1, prev + 1));
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
          side="top"
          align="center"
          sideOffset={12}
          className={cn(
            "w-[400px] max-w-[90vw] p-0 rounded-2xl border border-zinc-200/80 shadow-xl overflow-hidden",
            "bg-white",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div
            className={cn(
              "relative px-5 py-4",
              hasError
                ? "bg-gradient-to-br from-red-50 to-orange-50"
                : "bg-gradient-to-br from-blue-50 to-indigo-50",
            )}
          >
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3">
              <NodeIconDisplay iconSrc={data?._src} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 truncate">
                  {data?.name || "Node"}
                </h3>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    hasError ? "text-red-600/70" : "text-indigo-600/70",
                  )}
                >
                  {hasMultiple
                    ? `${executions.length} executions`
                    : "Execution result"}
                </p>
              </div>

              {hasMultiple && (
                <div className="flex items-center gap-1 mr-5">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                      currentIndex === 0
                        ? "text-zinc-300 cursor-not-allowed"
                        : "text-zinc-600 hover:bg-white/60",
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-zinc-700 tabular-nums min-w-[3rem] text-center">
                    {currentIndex + 1} / {executions.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex === executions.length - 1}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                      currentIndex === executions.length - 1
                        ? "text-zinc-300 cursor-not-allowed"
                        : "text-zinc-600 hover:bg-white/60",
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 py-3">
            <ScrollArea className="max-h-[360px]">
              {executions.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-sm font-medium text-zinc-700">No executions</p>
                  <p className="text-xs text-zinc-400 mt-0.5">This node hasn't been executed yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <ExecutionResult execution={currentExecution} />
                </div>
              )}
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ExecutionResultsPopover;
