import { BarChart3, Activity, Target, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePublish } from "../context";

const TrackingCard = ({ icon: Icon, title, description, enabled, onToggle, inputLabel, inputPlaceholder, inputValue, onInputChange }) => {
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
      {enabled && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-200 mt-2">
          <div className="space-y-2">
            <Label className="text-sm text-zinc-600">{inputLabel}</Label>
            <Input
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={inputPlaceholder}
              className="bg-white font-mono"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TrackingTab = () => {
  const { settings, updateSetting } = usePublish();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 font-medium">Analytics Integration</p>
          <p className="text-sm text-blue-600 mt-1">
            Add your tracking IDs below to monitor form views, submissions, and user behavior.
          </p>
        </div>
      </div>

      <TrackingCard
        icon={BarChart3}
        title="Google Tag Manager"
        description="Deploy and manage marketing tags"
        enabled={settings.gtmEnabled}
        onToggle={(v) => updateSetting("gtmEnabled", v)}
        inputLabel="GTM Container ID"
        inputPlaceholder="GTM-XXXXXXX"
        inputValue={settings.gtmId}
        onInputChange={(v) => updateSetting("gtmId", v)}
      />

      <TrackingCard
        icon={Activity}
        title="Google Analytics"
        description="Track page views and user behavior"
        enabled={settings.gaEnabled}
        onToggle={(v) => updateSetting("gaEnabled", v)}
        inputLabel="Measurement ID"
        inputPlaceholder="G-XXXXXXXXXX"
        inputValue={settings.gaId}
        onInputChange={(v) => updateSetting("gaId", v)}
      />

      <TrackingCard
        icon={Target}
        title="Meta Pixel"
        description="Track conversions for Facebook & Instagram ads"
        enabled={settings.metaPixelEnabled}
        onToggle={(v) => updateSetting("metaPixelEnabled", v)}
        inputLabel="Pixel ID"
        inputPlaceholder="123456789012345"
        inputValue={settings.metaPixelId}
        onInputChange={(v) => updateSetting("metaPixelId", v)}
      />
    </div>
  );
};

export default TrackingTab;
