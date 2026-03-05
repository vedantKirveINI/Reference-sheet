import React from "react";
import { cn } from "@/lib/utils";

const TinyAIQuickActions = ({
  showOnboarding,
  quickActions,
  onOnboardingBuild,
  onOnboardingShow,
  onOnboardingDismiss,
  onQuickAction,
}) => {
  if (showOnboarding) {
    const cardClass = cn(
      "flex items-start gap-2 px-3 py-2 w-full text-left",
      "rounded-island-sm shadow-island-sm",
      "border border-black/[0.04] bg-surface-base",
      "hover:shadow-island hover:border-black/[0.08]",
      "transition-all cursor-pointer",
    );

    return (
      <div className="flex flex-col gap-2">
        <button type="button" className={cardClass} onClick={onOnboardingBuild}>
          <span className="text-lg">🚀</span>
          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              Build my first workflow
            </div>
            <div className="text-[11.5px] text-slate-500">
              I'll walk you through creating an automation
            </div>
          </div>
        </button>
        <button type="button" className={cardClass} onClick={onOnboardingShow}>
          <span className="text-lg">💡</span>
          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              Show me what you can do
            </div>
            <div className="text-[11.5px] text-slate-500">
              Learn about all the ways I can help
            </div>
          </div>
        </button>
        <button type="button" className={cardClass} onClick={onOnboardingDismiss}>
          <span className="text-lg">👋</span>
          <div>
            <div className="text-[13px] font-semibold text-slate-900">
              I'll explore on my own
            </div>
            <div className="text-[11.5px] text-slate-500">
              Dismiss this and use quick actions
            </div>
          </div>
        </button>
      </div>
    );
  }

  const pillClass = cn(
    "px-2.5 py-1.5",
    "rounded-island-sm shadow-island-sm",
    "border border-black/[0.04] bg-surface-base",
    "text-slate-600 text-[11px]",
    "hover:shadow-island hover:border-black/[0.08] hover:text-[#1C3693]",
    "transition-all cursor-pointer",
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {quickActions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={pillClass}
          onClick={() => onQuickAction(action)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default TinyAIQuickActions;
