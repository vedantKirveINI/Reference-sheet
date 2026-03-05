import { BarChart3, TrendingUp, Tag, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePublish } from "../context";

const TrackerCard = ({ icon: Icon, title, description, enabled, onToggle, children }) => {
  return (
    <div className={`rounded-xl border-2 transition-all ${enabled ? "border-[#1C3693] bg-blue-50/50" : "border-zinc-200"}`}>
      <div className="flex items-start justify-between p-4">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? "bg-[#1C3693] text-white" : "bg-zinc-100 text-zinc-500"}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-zinc-900">{title}</div>
            <div className="text-sm text-zinc-500 mt-0.5">{description}</div>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      {enabled && children && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-200 mt-2">
          {children}
        </div>
      )}
    </div>
  );
};

const AnalyticsTab = () => {
  const { settings, updateSetting } = usePublish();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">Analytics & Tracking</h3>
        <p className="text-sm text-zinc-500 mt-1">Connect analytics tools to track form performance</p>
      </div>

      <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1C3693]/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-[#1C3693]" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">Built-in Analytics</p>
            <p className="text-xs text-zinc-500">View responses, completion rates, and more in the Responses tab</p>
          </div>
        </div>
      </div>

      <TrackerCard
        icon={BarChart3}
        title="Google Analytics"
        description="Track form views and submissions with Google Analytics"
        enabled={settings.gaEnabled}
        onToggle={(v) => updateSetting("gaEnabled", v)}
      >
        <div className="space-y-2">
          <Label className="text-sm text-zinc-600">Measurement ID</Label>
          <Input
            value={settings.gaId}
            onChange={(e) => updateSetting("gaId", e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="bg-white font-mono"
          />
          <p className="text-xs text-zinc-400">Find this in Google Analytics → Admin → Data Streams</p>
        </div>
      </TrackerCard>

      <TrackerCard
        icon={Tag}
        title="Google Tag Manager"
        description="Manage all your tags with Google Tag Manager"
        enabled={settings.gtmEnabled}
        onToggle={(v) => updateSetting("gtmEnabled", v)}
      >
        <div className="space-y-2">
          <Label className="text-sm text-zinc-600">Container ID</Label>
          <Input
            value={settings.gtmId}
            onChange={(e) => updateSetting("gtmId", e.target.value)}
            placeholder="GTM-XXXXXXX"
            className="bg-white font-mono"
          />
        </div>
      </TrackerCard>

      <TrackerCard
        icon={TrendingUp}
        title="Meta Pixel"
        description="Track conversions and build audiences with Meta Pixel"
        enabled={settings.metaPixelEnabled}
        onToggle={(v) => updateSetting("metaPixelEnabled", v)}
      >
        <div className="space-y-2">
          <Label className="text-sm text-zinc-600">Pixel ID</Label>
          <Input
            value={settings.metaPixelId}
            onChange={(e) => updateSetting("metaPixelId", e.target.value)}
            placeholder="XXXXXXXXXXXXXXX"
            className="bg-white font-mono"
          />
          <p className="text-xs text-zinc-400">Find this in Meta Events Manager</p>
        </div>
      </TrackerCard>
    </div>
  );
};

export default AnalyticsTab;
