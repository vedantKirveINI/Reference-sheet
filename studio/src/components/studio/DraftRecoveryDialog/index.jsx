import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import VersionCard from "./VersionCard";

dayjs.extend(relativeTime);

const COUNTDOWN_DURATION = 10;

const contentVariants = {
  collapsed: { 
    height: 0, 
    opacity: 0,
    transition: { duration: 0.15, ease: "easeOut" }
  },
  expanded: { 
    height: "auto", 
    opacity: 1,
    transition: { duration: 0.15, ease: "easeOut" }
  }
};

export function DraftRecoveryDialog({
  open,
  draftInfo,
  savedInfo,
  onContinueWithDraft,
  onLoadSaved,
  onClose,
  loading = false,
  fetchError = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("draft");
  const [rightDrawerWidth, setRightDrawerWidth] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const continueButtonRef = useRef(null);
  const draftCardRef = useRef(null);
  const savedCardRef = useRef(null);
  const dialogRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const draftTimeAgo = draftInfo?.timestamp
    ? dayjs(draftInfo.timestamp).fromNow(true)
    : "recently";

  useEffect(() => {
    if (open && continueButtonRef.current) {
      setTimeout(() => {
        continueButtonRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const cancelCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      setCountdown(0);
    }
  }, []);

  const pauseCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const resumeCountdown = useCallback(() => {
    if (countdown <= 0) return;
    if (countdownIntervalRef.current) return;
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          onContinueWithDraft?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [countdown, onContinueWithDraft]);

  useEffect(() => {
    if (!open) {
      setCountdown(COUNTDOWN_DURATION);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    setCountdown(COUNTDOWN_DURATION);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          onContinueWithDraft?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [open, onContinueWithDraft]);

  useEffect(() => {
    if (!open) {
      setRightDrawerWidth(0);
      return;
    }

    const detectRightDrawer = () => {
      const selectors = [
        '[data-testid="drawer-root"]',
        '.right-drawer',
        '[class*="right-column"] [class*="right-drawer"]',
        '[class*="right-drawer"]'
      ];
      
      let rightDrawer = null;
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.left > window.innerWidth / 2 && rect.width > 0 && rect.height > 0) {
            rightDrawer = el;
            break;
          }
        }
        if (rightDrawer) break;
      }
      
      if (rightDrawer) {
        const rect = rightDrawer.getBoundingClientRect();
        setRightDrawerWidth(rect.width);
      } else {
        setRightDrawerWidth(0);
      }
    };

    const timeoutId = setTimeout(detectRightDrawer, 100);
    const resizeObserver = new ResizeObserver(() => {
      detectRightDrawer();
    });

    if (document.body) {
      resizeObserver.observe(document.body);
    }

    window.addEventListener('resize', detectRightDrawer);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', detectRightDrawer);
    };
  }, [open]);

  const handleRadioGroupKeyDown = useCallback((e) => {
    if (!expanded) return;
    
    cancelCountdown();
    
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        setSelectedVersion("draft");
        draftCardRef.current?.focus();
        break;
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        setSelectedVersion("saved");
        savedCardRef.current?.focus();
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        cancelCountdown();
        onContinueWithDraft?.();
        break;
    }
  }, [expanded, onContinueWithDraft, cancelCountdown]);

  const handleDialogKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelCountdown();
      onContinueWithDraft?.();
    }
  }, [onContinueWithDraft, cancelCountdown]);

  const handlePrimaryAction = () => {
    cancelCountdown();
    if (selectedVersion === "draft") {
      onContinueWithDraft?.();
    } else {
      onLoadSaved?.();
    }
  };

  const handleSecondaryAction = () => {
    cancelCountdown();
    if (selectedVersion === "draft") {
      onLoadSaved?.();
    } else {
      onContinueWithDraft?.();
    }
  };

  const primaryButtonLabel = selectedVersion === "draft" 
    ? (countdown > 0 ? `Continue (${countdown}s)` : "Continue")
    : "Load Saved";

  const secondaryButtonLabel = selectedVersion === "draft"
    ? "Discard & Start Fresh"
    : "Keep Draft";

  const progress = countdown > 0 ? (countdown / COUNTDOWN_DURATION) * 100 : 0;

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onContinueWithDraft?.();
        }
      }}
    >
      <DialogContent
        ref={dialogRef}
        className={cn(
          "z-[10000] p-0 rounded-2xl overflow-hidden",
          "bg-white",
          "shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
          "border border-zinc-200/80",
          "!fixed !left-auto !top-auto !translate-x-0 !translate-y-0",
          "bottom-6 right-6",
          "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4 data-[state=open]:fade-in-0",
          "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:fade-out-0",
          "duration-300 ease-out",
          "w-[360px]",
          expanded && "w-[480px]"
        )}
        style={{ 
          fontFamily: "Archivo, sans-serif",
          ...(rightDrawerWidth > 0 && typeof window !== 'undefined' && window.innerWidth >= 640 ? {
            right: `${rightDrawerWidth + 24}px`,
            maxWidth: `min(360px, calc(100vw - 3rem - ${rightDrawerWidth}px))`
          } : {})
        }}
        onKeyDown={handleDialogKeyDown}
        onMouseEnter={pauseCountdown}
        onMouseLeave={resumeCountdown}
        hideCloseButton
        overlayClassName="z-[9999]"
        overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.08)' }}
        data-testid="draft-recovery-dialog"
      >
        {countdown > 0 && (
          <div className="h-1 bg-zinc-100 w-full">
            <motion.div 
              className="h-full bg-[#1C3693]"
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>
        )}

        <div className="p-5 flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-900">
              Welcome back
            </h3>
            <p className="text-sm text-zinc-500">
              You have unsaved changes from {draftTimeAgo} ago
            </p>
          </div>

          {fetchError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Saved version unavailable</span>
            </div>
          )}

          <Collapsible open={expanded} onOpenChange={(isOpen) => {
            if (isOpen) cancelCountdown();
            setExpanded(isOpen);
          }}>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                >
                  <CollapsibleContent forceMount className="overflow-hidden">
                    <div 
                      role="radiogroup"
                      aria-label="Version selection"
                      className="grid grid-cols-2 gap-3 mb-4"
                      onKeyDown={handleRadioGroupKeyDown}
                    >
                      <VersionCard
                        ref={draftCardRef}
                        type="draft"
                        selected={selectedVersion === "draft"}
                        nodeCount={draftInfo?.nodeCount || 0}
                        timestamp={draftInfo?.timestamp}
                        savedNodeCount={savedInfo?.nodeCount}
                        onClick={() => {
                          cancelCountdown();
                          setSelectedVersion("draft");
                        }}
                        onKeyDown={handleRadioGroupKeyDown}
                        tabIndex={expanded && selectedVersion === "draft" ? 0 : -1}
                        compact
                      />
                      <VersionCard
                        ref={savedCardRef}
                        type="saved"
                        selected={selectedVersion === "saved"}
                        nodeCount={savedInfo?.nodeCount || 0}
                        timestamp={savedInfo?.timestamp}
                        onClick={() => {
                          cancelCountdown();
                          setSelectedVersion("saved");
                        }}
                        onKeyDown={handleRadioGroupKeyDown}
                        tabIndex={expanded && selectedVersion === "saved" ? 0 : -1}
                        compact
                      />
                    </div>
                  </CollapsibleContent>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button
                  ref={continueButtonRef}
                  className="flex-1 h-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium"
                  onClick={handlePrimaryAction}
                  disabled={loading}
                >
                  {loading && selectedVersion === "draft" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {primaryButtonLabel}
                </Button>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-10 px-4 rounded-xl text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 font-medium",
                    selectedVersion === "draft" && "text-red-600 hover:text-red-700 hover:bg-red-50"
                  )}
                  onClick={handleSecondaryAction}
                  disabled={loading || (fetchError && selectedVersion === "draft")}
                >
                  {loading && selectedVersion !== "draft" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : selectedVersion !== "draft" ? (
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                  ) : null}
                  {secondaryButtonLabel}
                </Button>
              </div>

              <CollapsibleTrigger asChild>
                <button
                  className="flex items-center justify-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors py-1"
                  type="button"
                  onClick={cancelCountdown}
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      <span>Hide details</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      <span>Compare versions</span>
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
            </div>
          </Collapsible>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { useDraftStore } from "./hooks/useDraftStore";
export { VersionCard } from "./VersionCard";
export default DraftRecoveryDialog;
