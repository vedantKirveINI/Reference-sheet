import { useState, useRef, useEffect } from "react";
import {
  Lock,
  Calendar,
  Users,
  Clock,
  Sparkles,
  Bell,
  Upload,
  X,
  Crown,
  MapPin,
  ChevronDown,
  ChevronRight,
  Palette,
  BarChart3,
  Tag,
  TrendingUp,
  Eye,
  FileText,
  Link2,
  Shield,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePublish } from "../context";
import CustomDomainSection from "./CustomDomainSection";
import CopyableTextField from "../../publish/components/copyable-text-field";
import { getSheetURL } from "../../publish/forms/utils";
import ResponseMappingTable from "../../publish/forms/tabs/form-responses/response-mapping/components/response-mapping-table";
import UnmappedQuestions from "../../publish/forms/tabs/form-responses/response-mapping/components/unmapped-questions";
import ErrorMessage from "../../publish/forms/tabs/form-responses/response-mapping/components/error-message";
import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";

const SectionCard = ({ icon: Icon, title, description, children, defaultOpen = false, iconBg = "bg-zinc-100", iconColor = "text-zinc-600" }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) {
      setIsOpen(true);
    }
  }, [defaultOpen]);

  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200",
      isOpen ? "border-zinc-200 bg-white" : "border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("w-[18px] h-[18px]", iconColor)} strokeWidth={1.75} />
          </div>
          <div className="text-left">
            <div className="font-medium text-zinc-900 text-sm">{title}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
          </div>
        </div>
        <ChevronRight
          className={cn(
            "w-5 h-5 text-zinc-400 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
          strokeWidth={1.75}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-zinc-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingRow = ({ icon: Icon, title, description, enabled, onToggle, premium, children }) => {
  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200 p-3.5",
      enabled ? "border-zinc-300 bg-zinc-50" : "border-zinc-100 bg-white"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 flex-1">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
            enabled ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
          )}>
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-zinc-900">{title}</span>
              {premium && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-md">
                  <Crown className="w-3 h-3" />
                  Pro
                </span>
              )}
            </div>
            {description && (
              <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
            )}
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} className="flex-shrink-0" />
      </div>
      <AnimatePresence>
        {enabled && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pl-11">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrackerRow = ({ icon: Icon, title, placeholder, enabled, onToggle, value, onChange, helpText }) => {
  return (
    <div className={cn(
      "rounded-xl border transition-all duration-200 p-3.5",
      enabled ? "border-zinc-300 bg-zinc-50" : "border-zinc-100 bg-white"
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
            enabled ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500"
          )}>
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <span className="font-medium text-sm text-zinc-900">{title}</span>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pl-11 space-y-1.5">
              <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="bg-white font-mono text-sm h-10 rounded-xl border-zinc-200"
              />
              {helpText && (
                <p className="text-xs text-zinc-400">{helpText}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfigureTab = ({ isPremiumUser, onAnalyticsEvent, onCustomDomainDataChange, focusSection }) => {
  const {
    settings,
    updateSetting,
    assetDetails,
    questions,
    responseMappings,
    setResponseMappings,
  } = usePublish();

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

  const handleMappingsChange = (mappings) => {
    setResponseMappings(mappings);
  };

  return (
    <div className="p-6 space-y-3">
      <SectionCard
        icon={Shield}
        title="Access Control"
        description="Who can fill out this form?"
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
        defaultOpen={true}
      >
        <div className="space-y-3">
          <SettingRow
            icon={Lock}
            title="Password protection"
            enabled={settings.isPasswordProtected}
            onToggle={(v) => updateSetting("isPasswordProtected", v)}
          >
            <Input
              type="password"
              value={settings.password}
              onChange={(e) => updateSetting("password", e.target.value)}
              placeholder="Enter password"
              className="bg-white h-10 rounded-xl border-zinc-200"
            />
          </SettingRow>

          <SettingRow
            icon={Calendar}
            title="Schedule launch"
            description="Go live at a specific time"
            enabled={settings.isScheduled}
            onToggle={(v) => updateSetting("isScheduled", v)}
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={settings.scheduleDate || ""}
                onChange={(e) => updateSetting("scheduleDate", e.target.value)}
                className="bg-white h-10 rounded-xl border-zinc-200"
              />
              <Input
                type="time"
                value={settings.scheduleTime || ""}
                onChange={(e) => updateSetting("scheduleTime", e.target.value)}
                className="bg-white h-10 rounded-xl border-zinc-200"
              />
            </div>
          </SettingRow>

          <SettingRow
            icon={Users}
            title="Limit responses"
            enabled={settings.isRespondentLimitEnabled}
            onToggle={(v) => updateSetting("isRespondentLimitEnabled", v)}
          >
            <Input
              type="number"
              value={settings.respondentLimit}
              onChange={(e) => updateSetting("respondentLimit", parseInt(e.target.value) || 100)}
              placeholder="100"
              className="bg-white h-10 rounded-xl border-zinc-200 w-32"
            />
          </SettingRow>

          <SettingRow
            icon={Clock}
            title="Auto-close form"
            description="Close after a specific date"
            enabled={settings.isAutoCloseEnabled}
            onToggle={(v) => updateSetting("isAutoCloseEnabled", v)}
          >
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={settings.autoCloseDate || ""}
                onChange={(e) => updateSetting("autoCloseDate", e.target.value)}
                className="bg-white h-10 rounded-xl border-zinc-200"
              />
              <Input
                type="time"
                value={settings.autoCloseTime || ""}
                onChange={(e) => updateSetting("autoCloseTime", e.target.value)}
                className="bg-white h-10 rounded-xl border-zinc-200"
              />
            </div>
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard
        icon={Palette}
        title="Branding"
        description="Make it yours"
        iconBg="bg-violet-100"
        iconColor="text-violet-600"
        defaultOpen={focusSection === "branding"}
      >
        <div className="space-y-3">
          <SettingRow
            icon={Sparkles}
            title="Remove branding"
            description="Hide 'Powered by' footer"
            enabled={settings.removeBranding}
            onToggle={(v) => updateSetting("removeBranding", v)}
            premium={!isPremiumUser}
          />

          <div className="rounded-xl border border-zinc-100 bg-white p-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Upload className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
              </div>
              <span className="font-medium text-sm text-zinc-900">Custom logo</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            {logoPreview ? (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-12 w-auto rounded-xl border border-zinc-200"
                />
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 rounded-xl"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload logo
              </Button>
            )}
          </div>

          <CustomDomainSection isPremiumUser={isPremiumUser} />

          <SettingRow
            icon={Bell}
            title="Email notifications"
            description="Get notified on new responses"
            enabled={settings.notifyOnResponse}
            onToggle={(v) => updateSetting("notifyOnResponse", v)}
          >
            <Input
              type="email"
              value={settings.notifyEmail}
              onChange={(e) => updateSetting("notifyEmail", e.target.value)}
              placeholder="you@company.com"
              className="bg-white h-10 rounded-xl border-zinc-200"
            />
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard
        icon={FileText}
        title="Responses"
        description="Where do answers go?"
        iconBg="bg-emerald-100"
        iconColor="text-emerald-600"
      >
        <div className="space-y-4">
          <CopyableTextField
            title="Responses spreadsheet"
            value={
              !!assetDetails?.asset?.published_info
                ? getSheetURL({ assetDetails })
                : "Publish to get the sheet link"
            }
            isEnabled={!!assetDetails?.asset?.published_info}
            onCopy={(url) => {
              onAnalyticsEvent?.(UATU_CANVAS, {
                subEvent: UATU_PREDICATE_EVENTS_CANVAS.COPY_SHEET_URL,
                url,
              });
            }}
            dataTestId="form-response-sheet-link"
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-zinc-700">Column mapping</Label>
            <div className="border border-zinc-200 rounded-xl overflow-hidden">
              <div className="max-h-[200px] overflow-auto">
                <ResponseMappingTable
                  questions={questions}
                  mappings={responseMappings}
                  onChange={handleMappingsChange}
                  dataTestId="form-response-mapping-table"
                />
              </div>
            </div>
            
            <ErrorMessage
              mappings={responseMappings}
              questions={questions}
              dataTestId="form-response-mapping-errors"
            />
          </div>

          <UnmappedQuestions
            questions={questions}
            mappedQuestions={responseMappings}
            dataTestId="form-response-mapping-unmapped"
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={BarChart3}
        title="Analytics & Tracking"
        description="Measure performance"
        iconBg="bg-orange-100"
        iconColor="text-orange-600"
      >
        <div className="space-y-3">
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">Built-in analytics</p>
              <p className="text-xs text-zinc-500">Views and completions tracked automatically</p>
            </div>
          </div>

          <TrackerRow
            icon={BarChart3}
            title="Google Analytics"
            placeholder="G-XXXXXXXXXX"
            enabled={settings.gaEnabled}
            onToggle={(v) => updateSetting("gaEnabled", v)}
            value={settings.gaId}
            onChange={(v) => updateSetting("gaId", v)}
            helpText="Find in GA → Admin → Data Streams"
          />

          <TrackerRow
            icon={Tag}
            title="Google Tag Manager"
            placeholder="GTM-XXXXXXX"
            enabled={settings.gtmEnabled}
            onToggle={(v) => updateSetting("gtmEnabled", v)}
            value={settings.gtmId}
            onChange={(v) => updateSetting("gtmId", v)}
          />

          <TrackerRow
            icon={TrendingUp}
            title="Meta Pixel"
            placeholder="1234567890"
            enabled={settings.metaPixelEnabled}
            onToggle={(v) => updateSetting("metaPixelEnabled", v)}
            value={settings.metaPixelId}
            onChange={(v) => updateSetting("metaPixelId", v)}
          />

          <SettingRow
            icon={MapPin}
            title="Collect location"
            description="Get respondent's country & city"
            enabled={settings.collectLocation}
            onToggle={(v) => updateSetting("collectLocation", v)}
          />

          <SettingRow
            icon={Eye}
            title="Collect IP address"
            description="Store IP for fraud prevention"
            enabled={settings.collectIP}
            onToggle={(v) => updateSetting("collectIP", v)}
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default ConfigureTab;
