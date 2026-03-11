import { useState } from "react";
import { Copy, Check, QrCode, Code2, Facebook, Twitter, Linkedin, Mail, ExternalLink, ChevronDown, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePublish } from "../context";
import { EMBED_MODES } from "../constants";

const CopyButton = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
        "bg-zinc-100 hover:bg-zinc-200 text-zinc-700",
        "transition-all duration-200",
        className
      )}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const FullPageIcon = ({ selected }) => (
  <div className={cn(
    "border rounded-lg p-1.5 h-11 w-14 flex items-center justify-center transition-colors",
    selected ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 bg-white"
  )}>
    <div className={cn("w-10 h-7 rounded-sm transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
  </div>
);

const StandardIcon = ({ selected }) => (
  <div className={cn(
    "border rounded-lg p-1.5 h-11 w-14 flex items-center justify-center transition-colors",
    selected ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 bg-white"
  )}>
    <div className="relative w-10 h-7">
      <div className={cn("absolute top-0 left-0 w-full h-0.5 rounded-full transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
      <div className={cn("absolute top-1.5 left-0 w-full h-4 rounded-sm transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
      <div className={cn("absolute bottom-0 left-0 w-full h-0.5 rounded-full transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
    </div>
  </div>
);

const PopupIcon = ({ selected }) => (
  <div className={cn(
    "border rounded-lg p-1.5 h-11 w-14 flex items-center justify-center transition-colors",
    selected ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 bg-white"
  )}>
    <div className={cn("w-9 h-5 rounded-sm transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
  </div>
);

const SliderIcon = ({ selected }) => (
  <div className={cn(
    "border rounded-lg p-1.5 h-11 w-14 flex items-center justify-center transition-colors",
    selected ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 bg-white"
  )}>
    <div className={cn("w-3.5 h-6 rounded-sm rounded-l-[2px] transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
  </div>
);

const PopoverIcon = ({ selected }) => (
  <div className={cn(
    "border rounded-lg p-1.5 h-11 w-14 flex items-center justify-center relative transition-colors",
    selected ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 bg-white"
  )}>
    <div className={cn("w-3.5 h-6 rounded-sm transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
    <div className={cn("absolute top-2 right-2 w-1.5 h-1.5 rounded-full transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
  </div>
);

const SideTabIcon = ({ selected }) => (
  <div className={cn(
    "border rounded-lg p-1.5 h-11 w-14 flex items-center justify-center transition-colors",
    selected ? "border-zinc-400 bg-zinc-50" : "border-zinc-200 bg-white"
  )}>
    <div className="flex items-center gap-0.5">
      <div className={cn("w-0.5 h-3.5 rounded-full transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
      <div className={cn("w-3.5 h-6 rounded-sm transition-colors", selected ? "bg-zinc-800" : "bg-zinc-300")} />
    </div>
  </div>
);

const embedOptions = [
  { mode: EMBED_MODES.FULL_PAGE, label: "Full page", Icon: FullPageIcon },
  { mode: EMBED_MODES.STANDARD, label: "Inline", Icon: StandardIcon },
  { mode: EMBED_MODES.POPUP, label: "Pop-up", Icon: PopupIcon },
  { mode: EMBED_MODES.SLIDER, label: "Slider", Icon: SliderIcon },
  { mode: EMBED_MODES.POPOVER, label: "Popover", Icon: PopoverIcon },
  { mode: EMBED_MODES.SIDE_TAB, label: "Side tab", Icon: SideTabIcon },
];

const ShareTab = ({ onShowQrCode, onToggleEmbedPreview }) => {
  const { formUrl, isPublished, embedMode, setEmbedMode, embedSettings, setEmbedSettings } = usePublish();
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const displayUrl = isPublished && formUrl ? formUrl : "";

  const handleEmbedModeChange = (mode) => {
    setEmbedMode(mode);
    setShowEmbedCode(true);
    onToggleEmbedPreview?.(mode !== EMBED_MODES.FULL_PAGE);
  };

  const generateEmbedCode = () => {
    const { width, height, buttonText, buttonColor, fontSize, roundedCorners, sliderPosition, callout, textLinkMode } = embedSettings;
    const borderRadius = `${roundedCorners}px`;
    
    switch (embedMode) {
      case EMBED_MODES.FULL_PAGE:
        return `<iframe src="${displayUrl}" width="100%" height="100%" frameborder="0" style="border:0;"></iframe>`;
      
      case EMBED_MODES.STANDARD:
        return `<iframe src="${displayUrl}" width="${width}" height="${height}" frameborder="0" style="border:0;border-radius:8px;"></iframe>`;
      
      case EMBED_MODES.POPUP:
        if (textLinkMode) {
          return `<script src="https://forms.app/embed.js"></script>
<a href="#" onclick="FormEmbed.popup('${displayUrl}'); return false;" style="color:${buttonColor};font-size:${fontSize}px;">${buttonText}</a>`;
        }
        return `<script src="https://forms.app/embed.js"></script>
<button onclick="FormEmbed.popup('${displayUrl}')" style="background:${buttonColor};color:white;padding:12px 24px;border:none;border-radius:${borderRadius};cursor:pointer;font-size:${fontSize}px;">${buttonText}</button>`;
      
      case EMBED_MODES.SLIDER:
        if (textLinkMode) {
          return `<script src="https://forms.app/embed.js"></script>
<a href="#" onclick="FormEmbed.slider('${displayUrl}', {position: '${sliderPosition}'}); return false;" style="color:${buttonColor};font-size:${fontSize}px;">${buttonText}</a>`;
        }
        return `<script src="https://forms.app/embed.js"></script>
<button onclick="FormEmbed.slider('${displayUrl}', {position: '${sliderPosition}'})" style="background:${buttonColor};color:white;padding:12px 24px;border:none;border-radius:${borderRadius};cursor:pointer;font-size:${fontSize}px;">${buttonText}</button>`;
      
      case EMBED_MODES.POPOVER:
        return `<script src="https://forms.app/embed.js"></script>
<script>
  FormEmbed.popover('${displayUrl}', {
    buttonColor: '${buttonColor}',
    callout: '${callout}'
  });
</script>`;
      
      case EMBED_MODES.SIDE_TAB:
        return `<script src="https://forms.app/embed.js"></script>
<script>
  FormEmbed.sideTab('${displayUrl}', {
    position: '${sliderPosition}',
    buttonText: '${buttonText}',
    buttonColor: '${buttonColor}',
    fontSize: ${fontSize},
    borderRadius: ${roundedCorners}
  });
</script>`;
      
      default:
        return `<iframe src="${displayUrl}" width="100%" height="500" frameborder="0"></iframe>`;
    }
  };

  const socialLinks = [
    { icon: Facebook, label: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(displayUrl)}` },
    { icon: Twitter, label: "Twitter", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(displayUrl)}` },
    { icon: Linkedin, label: "LinkedIn", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(displayUrl)}` },
    { icon: Mail, label: "Email", url: `mailto:?subject=Check out this form&body=${encodeURIComponent(displayUrl)}` },
  ];

  const renderModeSettings = () => {
    switch (embedMode) {
      case EMBED_MODES.FULL_PAGE:
        return null;
      
      case EMBED_MODES.STANDARD:
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-500 font-medium">Width</Label>
              <Input
                value={embedSettings.width}
                onChange={(e) => setEmbedSettings(prev => ({ ...prev, width: e.target.value }))}
                placeholder="100% or 500px"
                className="mt-1.5 h-10 rounded-xl border-zinc-200 focus:border-zinc-400"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500 font-medium">Height</Label>
              <Input
                value={embedSettings.height}
                onChange={(e) => setEmbedSettings(prev => ({ ...prev, height: e.target.value }))}
                placeholder="500px"
                className="mt-1.5 h-10 rounded-xl border-zinc-200 focus:border-zinc-400"
              />
            </div>
          </div>
        );
      
      case EMBED_MODES.POPUP:
      case EMBED_MODES.SLIDER:
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-500 font-medium">Button text</Label>
                <Input
                  value={embedSettings.buttonText}
                  onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="mt-1.5 h-10 rounded-xl border-zinc-200 focus:border-zinc-400"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-500 font-medium">Color</Label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="color"
                    value={embedSettings.buttonColor}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-zinc-200 cursor-pointer"
                  />
                  <Input
                    value={embedSettings.buttonColor}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="flex-1 h-10 rounded-xl border-zinc-200 focus:border-zinc-400 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            {embedMode === EMBED_MODES.SLIDER && (
              <div>
                <Label className="text-xs text-zinc-500 font-medium">Position</Label>
                <div className="flex gap-2 mt-1.5">
                  <button
                    onClick={() => setEmbedSettings(prev => ({ ...prev, sliderPosition: "left" }))}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                      embedSettings.sliderPosition === "left"
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    )}
                  >
                    Left
                  </button>
                  <button
                    onClick={() => setEmbedSettings(prev => ({ ...prev, sliderPosition: "right" }))}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                      embedSettings.sliderPosition === "right"
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    )}
                  >
                    Right
                  </button>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
              <Label className="text-sm text-zinc-700 font-medium">Use text link instead</Label>
              <Switch
                checked={embedSettings.textLinkMode}
                onCheckedChange={(checked) => setEmbedSettings(prev => ({ ...prev, textLinkMode: checked }))}
              />
            </div>
          </div>
        );
      
      case EMBED_MODES.POPOVER:
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-500 font-medium">Button color</Label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="color"
                  value={embedSettings.buttonColor}
                  onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                  className="w-10 h-10 rounded-xl border border-zinc-200 cursor-pointer"
                />
                <Input
                  value={embedSettings.buttonColor}
                  onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                  className="flex-1 h-10 rounded-xl border-zinc-200 focus:border-zinc-400 font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-zinc-500 font-medium">Callout message</Label>
              <Input
                value={embedSettings.callout}
                onChange={(e) => setEmbedSettings(prev => ({ ...prev, callout: e.target.value }))}
                placeholder="Got a question?"
                className="mt-1.5 h-10 rounded-xl border-zinc-200 focus:border-zinc-400"
              />
            </div>
          </div>
        );
      
      case EMBED_MODES.SIDE_TAB:
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-500 font-medium">Position</Label>
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={() => setEmbedSettings(prev => ({ ...prev, sliderPosition: "left" }))}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                    embedSettings.sliderPosition === "left"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  Left
                </button>
                <button
                  onClick={() => setEmbedSettings(prev => ({ ...prev, sliderPosition: "right" }))}
                  className={cn(
                    "flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all",
                    embedSettings.sliderPosition === "right"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  Right
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-500 font-medium">Tab text</Label>
                <Input
                  value={embedSettings.buttonText}
                  onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                  className="mt-1.5 h-10 rounded-xl border-zinc-200 focus:border-zinc-400"
                />
              </div>
              <div>
                <Label className="text-xs text-zinc-500 font-medium">Color</Label>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="color"
                    value={embedSettings.buttonColor}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-zinc-200 cursor-pointer"
                  />
                  <Input
                    value={embedSettings.buttonColor}
                    onChange={(e) => setEmbedSettings(prev => ({ ...prev, buttonColor: e.target.value }))}
                    className="flex-1 h-10 rounded-xl border-zinc-200 focus:border-zinc-400 font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
            <Link2 size={16} className="text-blue-600" strokeWidth={1.75} />
          </div>
          <Label className="text-sm font-semibold text-zinc-900">Form link</Label>
        </div>
        {isPublished && displayUrl ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={displayUrl}
                readOnly
                className="pr-10 bg-zinc-50 font-mono text-sm h-11 rounded-xl border-zinc-200"
              />
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <CopyButton text={displayUrl} />
          </div>
        ) : (
          <div className="p-4 bg-amber-50/80 border border-amber-200/60 rounded-xl">
            <p className="text-sm text-amber-700">
              Click <strong>Publish</strong> below to generate your shareable link.
            </p>
          </div>
        )}
      </div>

      {isPublished && displayUrl && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <Mail size={16} className="text-violet-600" strokeWidth={1.75} />
            </div>
            <Label className="text-sm font-semibold text-zinc-900">Share directly</Label>
          </div>
          <div className="flex gap-2">
            {socialLinks.map(({ icon: Icon, label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl",
                  "bg-zinc-100 hover:bg-zinc-200",
                  "text-zinc-600 hover:text-zinc-800",
                  "transition-all duration-200"
                )}
                title={`Share on ${label}`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </a>
            ))}
            <button
              onClick={onShowQrCode}
              className={cn(
                "flex items-center justify-center w-11 h-11 rounded-xl",
                "bg-zinc-100 hover:bg-zinc-200",
                "text-zinc-600 hover:text-zinc-800",
                "transition-all duration-200"
              )}
              title="Get QR code"
            >
              <QrCode className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Code2 size={16} className="text-emerald-600" strokeWidth={1.75} />
          </div>
          <Label className="text-sm font-semibold text-zinc-900">Add to website</Label>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {embedOptions.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              onClick={() => handleEmbedModeChange(mode)}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200",
                embedMode === mode
                  ? "bg-zinc-100"
                  : "hover:bg-zinc-50"
              )}
            >
              <Icon selected={embedMode === mode} />
              <span className={cn(
                "text-[11px] font-medium transition-colors",
                embedMode === mode ? "text-zinc-900" : "text-zinc-500"
              )}>{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showEmbedCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 overflow-hidden"
            >
              {renderModeSettings()}

              <div className="relative">
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
                  {generateEmbedCode()}
                </pre>
                <div className="absolute top-3 right-3">
                  <CopyButton 
                    text={generateEmbedCode()} 
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 h-8 text-xs" 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShareTab;
