import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FAILED, PENDING, SUCCESS } from "../../../../constants/keys";
import { icons } from "@/components/icons";

const MIN_SUCCESS_DISPLAY_MS = 1500;

const STEP_LABELS = {
  workflow: { saving: "Saving your workflow…", publishing: "Publishing…", success: "Your workflow is live" },
  sequence: { saving: "Saving your sequence…", publishing: "Publishing…", success: "Your sequence is live" },
  form: { saving: "Saving your form…", publishing: "Publishing…", success: "Your form is live" },
};

const CheckIcon = icons.checkCircle;
const AlertIcon = icons.alertCircle;

export const PublishStatus = ({
  publishStatus,
  setPublishStatus,
  closeHandler = () => {},
  publishStep = null,
  assetType = null,
}) => {
  const successStartedAtRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    if (publishStatus === SUCCESS) {
      successStartedAtRef.current = Date.now();
    }
  }, [publishStatus]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleSuccessComplete = () => {
    const elapsed = successStartedAtRef.current
      ? Date.now() - successStartedAtRef.current
      : 0;
    const remaining = Math.max(0, MIN_SUCCESS_DISPLAY_MS - elapsed);
    const runClear = () => {
      setPublishStatus(null);
    };
    if (remaining > 0) {
      closeTimeoutRef.current = setTimeout(runClear, remaining);
    } else {
      runClear();
    }
  };

  const hasStepInfo = publishStep && assetType && STEP_LABELS[assetType];
  const savingLabel = hasStepInfo ? STEP_LABELS[assetType].saving : null;
  const publishingLabel = hasStepInfo ? STEP_LABELS[assetType].publishing : null;
  const successHeadline = hasStepInfo ? STEP_LABELS[assetType].success : "Published";
  const isSaving = publishStep === "saving";
  const isPublishing = publishStep === "publishing";

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-10 p-6"
      data-testid="publish-status-container"
    >
      <div
        className="flex flex-col items-center justify-center w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/50 px-10 py-14"
        data-testid="publish-status-lottie-container"
      >
        {publishStatus === PENDING && (
          <>
            {hasStepInfo ? (
              <div className="flex flex-col items-center gap-10 w-full">
                <div className="flex items-center justify-center gap-4 w-full">
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full text-base font-semibold transition-colors shrink-0",
                        isSaving
                          ? "bg-zinc-900 text-white animate-pulse"
                          : "bg-emerald-100 text-emerald-700"
                      )}
                      data-testid="publish-status-step-1"
                    >
                      {!isSaving && isPublishing ? (
                        <icons.check className="w-6 h-6" />
                      ) : (
                        "1"
                      )}
                    </span>
                    <span className="text-base text-zinc-700 font-medium">
                      {savingLabel}
                    </span>
                  </div>
                  <div className="w-8 h-px bg-zinc-200 shrink-0" />
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full text-base font-semibold transition-colors shrink-0",
                        isPublishing
                          ? "bg-zinc-900 text-white animate-pulse"
                          : "bg-zinc-100 text-zinc-400"
                      )}
                      data-testid="publish-status-step-2"
                    >
                      2
                    </span>
                    <span className="text-base text-zinc-700 font-medium">
                      {publishingLabel}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-2">
                  <span className="w-3 h-3 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-3 h-3 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-3 h-3 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-base text-zinc-600 font-medium">Publishing…</span>
              </div>
            )}
          </>
        )}

        {publishStatus === SUCCESS && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onAnimationComplete={handleSuccessComplete}
            className="flex flex-col items-center gap-6"
            data-testid="publish-status-success-animation"
          >
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100">
              <CheckIcon className="w-12 h-12 text-emerald-600" />
            </div>
            <p className="text-xl font-semibold text-zinc-900 text-center">
              {successHeadline}
            </p>
          </motion.div>
        )}

        {publishStatus === FAILED && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-6"
            data-testid="publish-status-failed-animation"
          >
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-amber-100">
              <AlertIcon
                className="w-12 h-12 text-amber-600"
                data-testid="publish-status-warning-icon"
              />
            </div>
            <p
              className="text-xl font-semibold text-zinc-900 text-center"
              data-testid="publish-status-error-message"
            >
              Something went wrong
            </p>
            <button
              type="button"
              onClick={() => setPublishStatus(null)}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
