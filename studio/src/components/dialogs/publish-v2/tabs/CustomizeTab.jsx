import { useState, useRef } from "react";
import { Sparkles, Globe, Bell, Upload, X, Crown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePublish } from "../context";

const SettingCard = ({ icon: Icon, title, description, enabled, onToggle, premium, children }) => {
  return (
    <div className={`rounded-xl border-2 transition-all ${enabled ? "border-[#1C3693] bg-blue-50/50" : "border-zinc-200"}`}>
      <div className="flex items-start justify-between p-4">
        <div className="flex gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? "bg-[#1C3693] text-white" : "bg-zinc-100 text-zinc-500"}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-zinc-900">{title}</span>
              {premium && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Crown className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
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

const CustomizeTab = ({ isPremiumUser }) => {
  const { settings, updateSetting } = usePublish();
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(settings.customLogo);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
        updateSetting("customLogo", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    updateSetting("customLogo", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 space-y-4">
      <SettingCard
        icon={Sparkles}
        title="Remove Branding"
        description="Hide the 'Powered by' badge from your form"
        enabled={settings.removeBranding}
        onToggle={(v) => updateSetting("removeBranding", v)}
        premium={!isPremiumUser}
      >
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-700">Branding will be removed from your published form</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-zinc-600">Custom Logo (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {logoPreview ? (
              <div className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg">
                <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain rounded" />
                <span className="flex-1 text-sm text-zinc-600 truncate">Custom logo uploaded</span>
                <button
                  onClick={handleRemoveLogo}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-4 border-2 border-dashed border-zinc-300 rounded-xl hover:border-[#1C3693] hover:bg-blue-50/50 transition-all"
              >
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">Upload your logo</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </SettingCard>

      <SettingCard
        icon={Globe}
        title="Custom Domain"
        description="Use your own domain for the form URL"
        enabled={!!settings.customDomain}
        onToggle={(v) => updateSetting("customDomain", v ? "forms." : "")}
        premium={!isPremiumUser}
      >
        <div className="space-y-2 min-w-0">
          <Label className="text-sm text-zinc-600">Your Domain</Label>
          <div className="flex gap-2 min-w-0">
            <Input
              value={settings.customDomain}
              onChange={(e) => updateSetting("customDomain", e.target.value)}
              placeholder="forms.yourdomain.com"
              className="bg-white min-w-0"
            />
            <Button variant="outline">Verify</Button>
          </div>
          <p className="text-xs text-zinc-400">Add a CNAME record pointing to forms.app</p>
        </div>
      </SettingCard>

      <SettingCard
        icon={Bell}
        title="Email Notifications"
        description="Get notified when someone submits a response"
        enabled={settings.notifyOnResponse}
        onToggle={(v) => updateSetting("notifyOnResponse", v)}
      >
        <div className="space-y-2">
          <Label className="text-sm text-zinc-600">Notification Email</Label>
          <Input
            type="email"
            value={settings.notifyEmail}
            onChange={(e) => updateSetting("notifyEmail", e.target.value)}
            placeholder="you@example.com"
            className="bg-white"
          />
        </div>
      </SettingCard>
    </div>
  );
};

export default CustomizeTab;
