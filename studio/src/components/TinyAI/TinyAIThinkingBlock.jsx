import React, { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";

const BrainIcon = ({ className, animated = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={cn(className, animated && "thinking-brain")}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C9.5 2 7.5 3.5 7 5.5C5 6 3.5 7.8 3.5 10c0 1.5.7 2.8 1.7 3.7-.2.6-.2 1.3 0 2 .3 1.2 1.2 2.1 2.3 2.5.3 1.5 1.5 2.8 3 3.2.5.2 1 .3 1.5.3s1-.1 1.5-.3c1.5-.4 2.7-1.7 3-3.2 1.1-.4 2-1.3 2.3-2.5.2-.7.2-1.4 0-2 1-.9 1.7-2.2 1.7-3.7 0-2.2-1.5-4-3.5-4.5C16.5 3.5 14.5 2 12 2z"
      fill="currentColor"
      opacity="0.15"
    />
    <path
      d="M12 2C9.5 2 7.5 3.5 7 5.5C5 6 3.5 7.8 3.5 10c0 1.5.7 2.8 1.7 3.7-.2.6-.2 1.3 0 2 .3 1.2 1.2 2.1 2.3 2.5.3 1.5 1.5 2.8 3 3.2.5.2 1 .3 1.5.3s1-.1 1.5-.3c1.5-.4 2.7-1.7 3-3.2 1.1-.4 2-1.3 2.3-2.5.2-.7.2-1.4 0-2 1-.9 1.7-2.2 1.7-3.7 0-2.2-1.5-4-3.5-4.5C16.5 3.5 14.5 2 12 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path d="M12 2v19.7" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <path d="M7.5 8.5C8.5 9 9.5 10 10.5 10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M16.5 8.5C15.5 9 14.5 10 13.5 10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M7 14c1 .3 2.5.8 3.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <path d="M17 14c-1 .3-2.5.8-3.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const TinyAIThinkingBlock = ({ steps = [], onStepChange, defaultCollapsed = false }) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const prevStepCountRef = useRef(0);

  const activeStep = useMemo(
    () => steps.find((step) => step.status === "active"),
    [steps]
  );

  const allDone = useMemo(
    () => steps.length > 0 && steps.every((s) => s.status === "done"),
    [steps]
  );

  useEffect(() => {
    if (defaultCollapsed) return;
    if (allDone && isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allDone, isExpanded, defaultCollapsed]);

  useEffect(() => {
    if (defaultCollapsed || allDone) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [allDone, defaultCollapsed]);

  useEffect(() => {
    if (defaultCollapsed) return;
    if (steps.length > prevStepCountRef.current) {
      if (!isExpanded) setIsExpanded(true);
      onStepChange?.();
    }
    prevStepCountRef.current = steps.length;
  }, [steps.length, defaultCollapsed]);

  useEffect(() => {
    if (!activeStep) {
      setDisplayedText("");
      return;
    }

    const text = activeStep.text;
    setDisplayedText("");
    let currentIndex = 0;
    const typewriterInterval = setInterval(() => {
      if (currentIndex < text.length) {
        currentIndex++;
        setDisplayedText(text.substring(0, currentIndex));
      } else {
        clearInterval(typewriterInterval);
      }
    }, 20);

    return () => clearInterval(typewriterInterval);
  }, [activeStep?.text]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2",
          "rounded-island-sm shadow-island-sm border border-black/[0.04]",
          "bg-surface-base hover:shadow-island hover:border-black/[0.08]",
          "transition-all text-left",
        )}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {!allDone ? (
            <BrainIcon className="w-4 h-4 text-[#1C3693] shrink-0" animated />
          ) : (
            <icons.check className="w-3.5 h-3.5 text-green-500 shrink-0" />
          )}
          <span className="text-[11px] text-slate-500 font-medium truncate">
            {allDone
              ? defaultCollapsed
                ? `${steps.length} reasoning steps`
                : `Thought for ${formatTime(elapsedTime)}`
              : "Thinking..."}
          </span>
        </div>
        <icons.chevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform",
            isExpanded ? "rotate-180" : "",
          )}
        />
      </button>

      {isExpanded && (
        <div className="overflow-hidden transition-all duration-300 max-h-96">
          <div className="px-3 py-2 space-y-1.5">
            {steps.map((step, idx) => {
              const isActive = step.status === "active";
              const isDone = step.status === "done";
              const isLast = idx === steps.length - 1;

              return (
                <div
                  key={`${idx}-${step.text}`}
                  className={cn(
                    "flex items-start gap-2 text-[11px]",
                    "transition-opacity duration-300",
                    isDone ? "text-slate-400" : isActive ? "text-slate-700" : "text-slate-400",
                  )}
                >
                  <div className="flex items-center justify-center w-3.5 h-3.5 mt-0.5 shrink-0">
                    {isActive && (
                      <div className="thinking-step-dot w-2 h-2 rounded-full bg-[#1C3693] shrink-0" />
                    )}
                    {isDone && (
                      <icons.check className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  <span className="min-w-0 break-words flex-1">
                    {isActive && isLast ? displayedText || step.text : step.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes thinking-brain-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.18); opacity: 0.75; }
        }
        .thinking-brain {
          animation: thinking-brain-pulse 1.4s ease-in-out infinite;
        }
        @keyframes thinking-step-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .thinking-step-dot {
          animation: thinking-step-pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TinyAIThinkingBlock;
