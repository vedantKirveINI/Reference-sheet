import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Settings, Bell } from "lucide-react";
import canvasServices from "../../../../sdk-services/canvas-sdk-services";
import { SUCCESS } from "../../../../constants/keys";
import { toast } from "sonner";

const SettingsTab = ({ assetDetails = {}, setAssetDetails, onAssetDetailsChange }) => {
  const [isWorkflowActive, setIsWorkflowActive] = useState(
    assetDetails?.asset?.settings?.execution_control?.enabled ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsWorkflowActive(
      assetDetails?.asset?.settings?.execution_control?.enabled ?? true
    );
  }, [assetDetails?.asset?.settings?.execution_control?.enabled]);

  const handleToggle = async () => {
    const newValue = !isWorkflowActive;
    setIsSaving(true);

    try {
      const payload = {
        asset_id: assetDetails?.asset?._id,
        settings: {
          execution_control: {
            enabled: newValue,
          },
        },
      };

      const response = await canvasServices.saveCanvas(payload);

      if (response?.status === SUCCESS) {
        setIsWorkflowActive(newValue);

        setAssetDetails((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            asset: {
              ...prev.asset,
              settings: {
                ...prev.asset?.settings,
                execution_control: {
                  enabled: newValue,
                },
              },
            },
          };
        });

        if (onAssetDetailsChange) {
          onAssetDetailsChange({ enabled: newValue, response });
        }
      } else {
        toast.error("Failed to update workflow status");
      }
    } catch {
      toast.error("Failed to toggle active state");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 py-1"
      data-testid="workflow-settings-tab"
    >
      <div
        className={cn(
          "bg-zinc-50 rounded-xl p-4",
          "border border-zinc-100"
        )}
        data-testid="workflow-status-card"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-zinc-100 shrink-0 mt-0.5">
              <Settings className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
            </div>
            <div>
              <p
                className="text-sm font-medium text-zinc-700"
                data-testid="workflow-status-label"
              >
                {isWorkflowActive
                  ? "Workflow is active"
                  : "Workflow is paused"}
              </p>
              <p
                className="text-xs text-zinc-400 mt-0.5 leading-relaxed"
                data-testid="workflow-status-description"
              >
                {isWorkflowActive
                  ? "When active, your workflow will run whenever it's triggered"
                  : "When paused, triggers will be ignored"}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggle}
            disabled={isSaving}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full",
              "transition-colors duration-200 ease-in-out",
              "focus:outline-none",
              isWorkflowActive ? "bg-emerald-500" : "bg-zinc-200",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
            role="switch"
            aria-checked={isWorkflowActive}
            data-testid="workflow-status-toggle"
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm",
                "transform transition-transform duration-200 ease-in-out",
                "mt-0.5",
                isWorkflowActive ? "translate-x-[22px]" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "bg-zinc-50 rounded-xl p-4",
          "border border-zinc-100",
          "opacity-60"
        )}
        data-testid="notifications-card"
      >
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-zinc-100 shrink-0 mt-0.5">
            <Bell className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Get notified</p>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Notification settings are coming soon. You'll be able to choose
              when to receive alerts about this workflow.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsTab;
