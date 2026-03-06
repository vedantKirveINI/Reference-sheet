import { Lock, Calendar, Users, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePublish } from "../context";

const SettingCard = ({ icon: Icon, title, description, enabled, onToggle, children }) => {
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

const AccessTab = () => {
  const { settings, updateSetting, updateSettings } = usePublish();

  return (
    <div className="p-6 space-y-4">
      <SettingCard
        icon={Lock}
        title="Password Protection"
        description="Require a password to access the form"
        enabled={settings.isPasswordProtected}
        onToggle={(v) => updateSetting("isPasswordProtected", v)}
      >
        <div className="space-y-2">
          <Label className="text-sm text-zinc-600">Password</Label>
          <Input
            type="password"
            value={settings.password}
            onChange={(e) => updateSetting("password", e.target.value)}
            placeholder="Enter password"
            className="bg-white"
          />
        </div>
      </SettingCard>

      <SettingCard
        icon={Calendar}
        title="Schedule Publishing"
        description="Automatically publish at a specific date and time"
        enabled={settings.isScheduled}
        onToggle={(v) => updateSetting("isScheduled", v)}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm text-zinc-600">Date</Label>
            <Input
              type="date"
              value={settings.scheduleDate || ""}
              onChange={(e) => updateSetting("scheduleDate", e.target.value)}
              className="bg-white mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-zinc-600">Time</Label>
            <Input
              type="time"
              value={settings.scheduleTime || ""}
              onChange={(e) => updateSetting("scheduleTime", e.target.value)}
              className="bg-white mt-1"
            />
          </div>
        </div>
      </SettingCard>

      <SettingCard
        icon={Users}
        title="Response Limit"
        description="Close the form after reaching a maximum number of responses"
        enabled={settings.isRespondentLimitEnabled}
        onToggle={(v) => updateSetting("isRespondentLimitEnabled", v)}
      >
        <div className="space-y-2">
          <Label className="text-sm text-zinc-600">Maximum Responses</Label>
          <Input
            type="number"
            min="1"
            value={settings.respondentLimit}
            onChange={(e) => updateSetting("respondentLimit", parseInt(e.target.value) || 1)}
            className="bg-white"
          />
        </div>
      </SettingCard>

      <SettingCard
        icon={Clock}
        title="Auto-Close"
        description="Automatically close the form at a specific date"
        enabled={settings.isAutoCloseEnabled}
        onToggle={(v) => updateSetting("isAutoCloseEnabled", v)}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm text-zinc-600">Close Date</Label>
            <Input
              type="date"
              value={settings.autoCloseDate || ""}
              onChange={(e) => updateSetting("autoCloseDate", e.target.value)}
              className="bg-white mt-1"
            />
          </div>
          <div>
            <Label className="text-sm text-zinc-600">Close Time</Label>
            <Input
              type="time"
              value={settings.autoCloseTime || ""}
              onChange={(e) => updateSetting("autoCloseTime", e.target.value)}
              className="bg-white mt-1"
            />
          </div>
        </div>
      </SettingCard>
    </div>
  );
};

export default AccessTab;
