import React from "react";
import { GitMerge, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { MERGE_TYPES, THEME } from "../constants";

const getIconComponent = (iconName) => {
  const icons = {
    Users: Users,
    Zap: Zap,
  };
  return icons[iconName] || Users;
};

const ConfigureTab = ({ state, variables }) => {
  const { mergeType, setMergeType } = state;
  const selectedType = MERGE_TYPES.find((t) => t.id === mergeType);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-3 bg-gray-100/50 rounded-lg border border-gray-200">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: THEME.iconBg }}
        >
          <GitMerge className="w-4 h-4" style={{ color: THEME.iconColor }} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 text-sm">Merge Branches</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Combine multiple parallel branches back into a single flow.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">Merge Strategy</Label>
        <div className="space-y-3">
          {MERGE_TYPES.map((type) => {
            const IconComponent = getIconComponent(type.icon);
            const isSelected = mergeType === type.id;

            return (
              <button
                key={type.id}
                onClick={() => setMergeType(type.id)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all flex items-start gap-3 text-left",
                  isSelected
                    ? "border-gray-700 bg-gray-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
                  )}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span
                    className={cn(
                      "text-sm font-medium block",
                      isSelected ? "text-gray-900" : "text-gray-700"
                    )}
                  >
                    {type.label}
                  </span>
                  <span className="text-xs text-gray-500 mt-0.5 block">
                    {type.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">How it works</h4>
        {mergeType === "wait_for_all" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Waits for all incoming branches to complete</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Combines output from all branches</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Best for parallel tasks that all need to complete</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Continues when first branch completes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Other branches are cancelled</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Best for race conditions or fallback scenarios</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Tip</h4>
        <p className="text-xs text-gray-600">
          Connect multiple branches to this node's input. The merge will combine
          the data from completed branches and continue the sequence.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
