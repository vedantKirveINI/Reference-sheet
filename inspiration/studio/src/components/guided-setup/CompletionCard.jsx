import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Play, Upload, ArrowRight, SkipForward } from "lucide-react";

const CompletionCard = ({
  completedCount,
  skippedCount,
  totalSteps,
  onTestWorkflow,
  onPublish,
  onDismiss,
  onFixSkipped,
}) => {
  const allConfigured = skippedCount === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
    >
      <div
        className={cn(
          "w-[420px] bg-white rounded-2xl overflow-hidden pointer-events-auto",
          "shadow-[0_16px_64px_rgba(0,0,0,0.14),0_4px_16px_rgba(0,0,0,0.06)]",
          "border border-zinc-100/80"
        )}
      >
        <div className="bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white px-8 py-8 text-center border-b border-emerald-100/60">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xl font-semibold text-zinc-900 mb-2"
          >
            {allConfigured ? "You're all set!" : "Almost there!"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-zinc-600 leading-relaxed"
          >
            {allConfigured
              ? `All ${totalSteps} steps are configured and ready to go.`
              : `${completedCount} of ${totalSteps} steps configured. ${skippedCount} ${skippedCount === 1 ? "step was" : "steps were"} skipped.`}
          </motion.p>
        </div>

        <div className="px-6 py-4">
          {!allConfigured && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 rounded-xl border border-amber-100 mb-4">
              <SkipForward className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-[12px] text-amber-700">
                Skipped steps will need configuring before publishing.
              </span>
              <button
                onClick={onFixSkipped}
                className="ml-auto text-[12px] font-semibold text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap"
              >
                Fix now
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-700">
                {completedCount} configured
              </span>
            </div>
            {skippedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[11px] font-semibold text-amber-700">
                  {skippedCount} skipped
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center gap-2">
          <button
            onClick={onTestWorkflow}
            className={cn(
              "flex-1 flex items-center justify-center gap-2",
              "h-11 px-4 rounded-xl",
              "bg-[#1C3693] text-white text-[13px] font-semibold",
              "hover:bg-[#162d7a] active:bg-[#112266]",
              "transition-colors duration-150",
              "shadow-sm"
            )}
          >
            <Play className="w-4 h-4" />
            Test workflow
          </button>

          {allConfigured && (
            <button
              onClick={onPublish}
              className={cn(
                "flex items-center justify-center gap-2",
                "h-11 px-5 rounded-xl",
                "bg-emerald-500 text-white text-[13px] font-semibold",
                "hover:bg-emerald-600 active:bg-emerald-700",
                "transition-colors duration-150",
                "shadow-sm"
              )}
            >
              <Upload className="w-4 h-4" />
              Publish
            </button>
          )}

          <button
            onClick={onDismiss}
            className={cn(
              "h-11 px-4 rounded-xl",
              "text-zinc-400 text-[13px] font-medium",
              "hover:text-zinc-600 hover:bg-zinc-50",
              "transition-colors duration-150"
            )}
          >
            Done
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CompletionCard;
