import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const TOAST_ID = "draft-recovery";
const AUTO_DISMISS_SECONDS = 10;

let globalResolved = false;
let globalOnContinue = null;

function resolveOnce(callback) {
  if (globalResolved) return;
  globalResolved = true;
  callback?.();
}

function DraftRecoveryToastContent({ 
  toastId, 
  draftInfo, 
  onContinue, 
  onStartFresh 
}) {
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SECONDS);
  const intervalRef = useRef(null);

  const timeAgo = draftInfo?.timestamp
    ? dayjs(draftInfo.timestamp).fromNow(true)
    : "a while";

  const nodeCount = draftInfo?.nodeCount || 0;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          toast.dismiss(toastId);
          resolveOnce(onContinue);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [toastId, onContinue]);

  const handleStartFresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast.dismiss(toastId);
    resolveOnce(onStartFresh);
  };

  const handleContinue = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    toast.dismiss(toastId);
    resolveOnce(onContinue);
  };

  return (
    <div
      className="w-[360px] bg-white rounded-xl border border-zinc-200 shadow-lg overflow-hidden"
      style={{ fontFamily: "Archivo, sans-serif" }}
    >
      <div className="p-4 flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
          <RotateCcw className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 mb-0.5">
            Welcome back
          </p>
          <p className="text-sm text-zinc-500">
            You have unsaved changes from {timeAgo} ago
            {nodeCount > 0 && (
              <span className="text-zinc-400"> · {nodeCount} node{nodeCount !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
      </div>
      <div className="flex border-t border-zinc-100">
        <button
          onClick={handleStartFresh}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors border-r border-zinc-100"
        >
          Start fresh
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Continue</span>
          <span className="text-xs text-zinc-400 tabular-nums">({countdown}s)</span>
        </button>
      </div>
    </div>
  );
}

export function showDraftRecoveryToast({
  draftInfo,
  onContinue,
  onStartFresh,
}) {
  globalResolved = false;
  globalOnContinue = onContinue;

  toast.custom(
    (t) => (
      <DraftRecoveryToastContent
        toastId={t}
        draftInfo={draftInfo}
        onContinue={onContinue}
        onStartFresh={onStartFresh}
      />
    ),
    {
      id: TOAST_ID,
      duration: Infinity,
      position: "bottom-right",
      onDismiss: () => {
        resolveOnce(globalOnContinue);
      },
    }
  );
}

export function dismissDraftRecoveryToast() {
  toast.dismiss(TOAST_ID);
}

export default { showDraftRecoveryToast, dismissDraftRecoveryToast };
