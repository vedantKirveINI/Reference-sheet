import { forwardRef, useImperativeHandle, useState } from "react";
import { Share2, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import ShareTab from "./tabs/ShareTab";
import ConfigureTab from "./tabs/ConfigureTab";
import { cn } from "@/lib/utils";

const ISLAND_SHADOW = "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]";
const ISLAND_BORDER = "border border-zinc-100";
const ISLAND_RADIUS = "rounded-2xl";

const TABS_CONFIG = [
  { id: "share", label: "Share", icon: Share2 },
  { id: "configure", label: "Configure", icon: Settings2 },
];

const SettingsPanel = forwardRef(({
  nodes,
  userData,
  getSavePayload,
  onPublishSuccess,
  onCustomDomainDataChange,
  onAnalyticsEvent,
  onClose,
  onToggleEmbedPreview,
  mode,
  isPremiumUser,
  onShowQrCode,
}, ref) => {
  const [activeTab, setActiveTab] = useState("share");
  const [focusSection, setFocusSection] = useState(null);

  useImperativeHandle(ref, () => ({
    goToTab: (tabId, section = null) => {
      if (typeof tabId === "number") {
        const tab = TABS_CONFIG[tabId];
        if (tab) setActiveTab(tab.id);
        setFocusSection(section);
      } else if (tabId === "settings" || tabId === "analytics" || tabId === "responses") {
        setActiveTab("configure");
        setFocusSection(section);
      } else if (tabId === "branding") {
        setActiveTab("configure");
        setFocusSection("branding");
      } else {
        setActiveTab(tabId);
        setFocusSection(section);
      }
    },
  }));

  return (
    <div className="w-1/2 flex flex-col items-center py-4 pr-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "w-full max-w-lg flex flex-col h-full",
          "bg-white",
          ISLAND_RADIUS,
          ISLAND_SHADOW,
          ISLAND_BORDER
        )}
      >
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-zinc-100">
          {TABS_CONFIG.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === id 
                  ? "text-zinc-900 bg-zinc-100" 
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50"
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "share" && (
            <ShareTab 
              onShowQrCode={onShowQrCode} 
              onToggleEmbedPreview={onToggleEmbedPreview}
            />
          )}
          {activeTab === "configure" && (
            <ConfigureTab 
              isPremiumUser={isPremiumUser} 
              onAnalyticsEvent={onAnalyticsEvent}
              onCustomDomainDataChange={onCustomDomainDataChange}
              focusSection={focusSection}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
});

SettingsPanel.displayName = "SettingsPanel";

export default SettingsPanel;
