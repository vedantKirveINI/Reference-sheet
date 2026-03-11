import { Share2, Shield, Palette, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TABS } from "../constants";

const TAB_ICONS = {
  [TABS.SHARE]: Share2,
  [TABS.ACCESS]: Shield,
  [TABS.CUSTOMIZE]: Palette,
  [TABS.TRACKING]: BarChart3,
};

const TAB_LABELS = {
  [TABS.SHARE]: "Share",
  [TABS.ACCESS]: "Access",
  [TABS.CUSTOMIZE]: "Customize",
  [TABS.TRACKING]: "Tracking",
};

const TabNav = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-zinc-200 px-4 bg-white">
      {Object.values(TABS).map((tabId) => {
        const Icon = TAB_ICONS[tabId];
        const isActive = activeTab === tabId;

        return (
          <button
            key={tabId}
            onClick={() => onTabChange(tabId)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative",
              isActive
                ? "text-[#1C3693]"
                : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {TAB_LABELS[tabId]}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1C3693]" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabNav;
