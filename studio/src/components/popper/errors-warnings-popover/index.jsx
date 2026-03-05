import React, { useRef, useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, X, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const NodeIconDisplay = ({ iconSrc, hasErrors }) => {
  const [hasError, setHasError] = useState(false);

  if (!iconSrc || hasError) {
    return (
      <div className={cn(
        "w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center",
        "ring-1 ring-black/5"
      )}>
        {hasErrors ? (
          <AlertCircle className="w-5 h-5 text-red-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        )}
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

const IssueItem = ({ message, severity, hint }) => {
  const isError = severity === "error";
  return (
    <div className="flex items-start gap-3 py-3 px-1">
      <div className={cn(
        "flex-shrink-0 w-2 h-2 rounded-full mt-1.5",
        isError ? "bg-red-400" : "bg-amber-400"
      )} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          isError ? "text-red-700" : "text-amber-700"
        )}>
          {message}
        </p>
        {hint && (
          <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>
        )}
      </div>
    </div>
  );
};

const ErrorWarningPopover = ({
  data,
  onClose = () => {},
  onFixNow = () => {},
  onFixWithAI = () => {},
  popoverCoordinates,
}) => {
  const anchorRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const rawErrors = data?.errors || [];
  const rawWarnings = data?.warnings || [];
  const nodeKey = data?.nodeKey;
  const nodeType = data?.nodeType || '';
  const nodeName = data?.nodeName || '';
  const nodeIcon = data?.nodeIcon || '';
  const validationIssues = data?.validationIssues;
  const displayName = nodeName || nodeType || 'This step';

  const useStructuredIssues = Array.isArray(validationIssues) && validationIssues.length > 0;

  const structuredErrors = useStructuredIssues
    ? validationIssues.filter(i => i.severity === 'error')
    : rawErrors.map(msg => ({ message: msg, severity: 'error', hint: '' }));

  const structuredWarnings = useStructuredIssues
    ? validationIssues.filter(i => i.severity === 'warning')
    : rawWarnings.map(msg => ({ message: msg, severity: 'warning', hint: '' }));

  const hasErrors = structuredErrors.length > 0;
  const hasWarnings = structuredWarnings.length > 0;
  const totalIssues = structuredErrors.length + structuredWarnings.length;

  const issuesSummary = totalIssues === 1
    ? "1 issue needs attention"
    : `${totalIssues} issues need attention`;

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
          <div className={cn(
            "relative px-5 py-4",
            hasErrors
              ? "bg-gradient-to-br from-red-50 to-orange-50"
              : "bg-gradient-to-br from-amber-50 to-yellow-50"
          )}>
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-white/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-3">
              <NodeIconDisplay iconSrc={nodeIcon} hasErrors={hasErrors} />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-900 truncate">
                  {displayName}
                </h3>
                <p className={cn(
                  "text-xs mt-0.5",
                  hasErrors ? "text-red-600/70" : "text-amber-600/70"
                )}>
                  {issuesSummary}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <ScrollArea className="max-h-[260px]">
              <div className="bg-zinc-50 rounded-xl px-3">
                {hasErrors && (
                  <>
                    {(hasErrors && hasWarnings) && (
                      <div className="pt-3 pb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">
                          Errors
                        </span>
                      </div>
                    )}
                    <div className="divide-y divide-zinc-100">
                      {structuredErrors.map((issue, index) => (
                        <IssueItem
                          key={`error-${index}`}
                          message={issue.message}
                          severity="error"
                          hint={issue.hint}
                        />
                      ))}
                    </div>
                  </>
                )}

                {hasWarnings && (
                  <>
                    {(hasErrors && hasWarnings) && (
                      <div className={cn("pt-3 pb-1", hasErrors && "border-t border-zinc-200/60 mt-1")}>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                          Warnings
                        </span>
                      </div>
                    )}
                    <div className="divide-y divide-zinc-100">
                      {structuredWarnings.map((issue, index) => (
                        <IssueItem
                          key={`warning-${index}`}
                          message={issue.message}
                          severity="warning"
                          hint={issue.hint}
                        />
                      ))}
                    </div>
                  </>
                )}

                {!hasErrors && !hasWarnings && (
                  <div className="py-6 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-zinc-700">All good!</p>
                    <p className="text-xs text-zinc-400 mt-0.5">No validation issues found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {(hasErrors || hasWarnings) && (
            <div className="px-4 pb-4 space-y-2">
              <Button
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-10 text-sm font-medium gap-2"
                onClick={() => onFixNow(nodeKey)}
              >
                <Settings className="w-4 h-4" />
                Fix Now
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl h-9 text-sm font-medium gap-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                onClick={() => onFixWithAI(nodeKey)}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fix with AI
              </Button>
              <button
                onClick={handleClose}
                className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 py-1 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
};

export default ErrorWarningPopover;
