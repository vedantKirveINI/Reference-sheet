import { forwardRef, useImperativeHandle, useRef, useMemo, useCallback, useEffect, useState } from "react";
import { X, RefreshCw, Globe, Sparkles, Crown, Palette, Wand2 } from "lucide-react";
import { debounce } from "lodash";
import { motion } from "framer-motion";
import Filler from "../form-publish-dialog/components/Filler";
import FillerEmbedModeLayout from "../form-publish-dialog/components/FillerEmbedModeLayout";
import { ViewPort } from "./constants";
import { usePublish } from "./context";
import {
  extractDomainFromUrl,
  getFillerEmbedModeLayoutProperties,
} from "../publish/utils";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const DEVICE_DIMENSIONS = {
  MOBILE: { width: 375, height: 667 },
  DESKTOP: { width: 1024, height: 640 },
};

function isThemeDefault(theme) {
  if (!theme) return true;
  if (typeof theme !== 'object') return true;
  
  const hasCustomization = 
    theme.backgroundColor ||
    theme.primaryColor ||
    theme.textColor ||
    theme.fontFamily ||
    theme.backgroundImage ||
    theme.logo ||
    (theme.colors && Object.keys(theme.colors).length > 0);
  
  return !hasCustomization;
}

function useContainerSize(ref) {
  const [size, setSize] = useState({ width: 800, height: 600 });
  
  useEffect(() => {
    if (!ref.current) return;
    
    const updateSize = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSize({ width: rect.width, height: rect.height });
        }
      }
    };
    
    requestAnimationFrame(() => {
      updateSize();
    });
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  
  return size;
}

function ThemeNudge({ isDefaultTheme, onCustomize }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isDefaultTheme) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors group border border-violet-200/60 bg-violet-50/50">
          <Palette size={12} className="text-violet-500" />
          <span className="text-xs text-violet-600 font-medium">Default theme</span>
          <Wand2 size={11} className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 rounded-2xl overflow-hidden border-zinc-200" align="center">
        <div className="p-4 bg-gradient-to-b from-violet-50/80 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Palette size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900">Customize theme</div>
              <div className="text-xs text-zinc-500">Make it uniquely yours</div>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
            Add your brand colors, fonts, and background to create a professional, on-brand form experience.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                onCustomize?.();
                setIsOpen(false);
              }}
              className="flex-1 gap-2 h-9 text-xs font-medium bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20"
            >
              <Wand2 size={14} />
              Customize Theme
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 h-9 text-xs hover:text-zinc-600 hover:bg-zinc-100"
            >
              Later
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CustomDomainNudge() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100/80 transition-colors group">
          <Globe size={12} className="text-zinc-400" />
          <span className="text-xs text-zinc-500 font-medium">yourform.oute.studio</span>
          <Sparkles size={11} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0 rounded-2xl overflow-hidden border-zinc-200" align="center">
        <div className="p-4 bg-gradient-to-b from-amber-50/80 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Crown size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900">Custom domain</div>
              <div className="text-xs text-zinc-500">yourcompany.com</div>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
            Use your own domain for a professional, on-brand experience your customers will love.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-2 h-9 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 shadow-lg shadow-zinc-900/10"
            >
              <Crown size={14} />
              Upgrade to Pro
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 h-9 text-xs hover:text-zinc-600 hover:bg-zinc-100"
            >
              Later
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function MobileFrame({ children, containerSize }) {
  const frameWidth = DEVICE_DIMENSIONS.MOBILE.width + 20;
  const frameHeight = DEVICE_DIMENSIONS.MOBILE.height + 20;
  
  const validWidth = containerSize.width > 0 ? containerSize.width : frameWidth;
  const validHeight = containerSize.height > 0 ? containerSize.height : frameHeight;
  
  const scaleX = validWidth / frameWidth;
  const scaleY = validHeight / frameHeight;
  const scale = Math.max(0.15, Math.min(0.92, scaleX, scaleY));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex-shrink-0"
      style={{
        width: frameWidth * scale,
        height: frameHeight * scale,
      }}
    >
      <div
        className={cn(
          "relative origin-top-left",
          "bg-gradient-to-b from-[#2a2a2e] via-[#1c1c1e] to-[#1c1c1e]",
          "rounded-[52px] p-[10px]"
        )}
        style={{
          width: frameWidth,
          height: frameHeight,
          transform: `scale(${scale})`,
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.1) inset,
            0 60px 100px -30px rgba(0,0,0,0.4),
            0 30px 60px -20px rgba(0,0,0,0.3),
            0 0 1px rgba(0,0,0,0.2)
          `,
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[95px] h-[30px] bg-[#1c1c1e] rounded-b-[18px] z-20 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-[10px] h-[10px] rounded-full bg-[#2a2a2e] ring-1 ring-[#3a3a3c]/50" />
            <div className="w-[52px] h-[6px] bg-[#2a2a2e] rounded-full" />
          </div>
        </div>

        <div
          className="relative bg-white rounded-[42px] overflow-hidden"
          style={{
            width: DEVICE_DIMENSIONS.MOBILE.width,
            height: DEVICE_DIMENSIONS.MOBILE.height,
            transform: "translateZ(0)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          {children}
        </div>

        <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[5px] bg-white/20 rounded-full z-20" />
      </div>
    </motion.div>
  );
}

function DesktopFrame({ children, isDefaultTheme, onCustomizeTheme }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-full max-w-4xl mx-auto px-8"
    >
      <div
        className={cn(
          "relative bg-white rounded-2xl overflow-hidden h-full",
          "border border-zinc-200/80"
        )}
        style={{
          minHeight: 480,
          boxShadow: `
            0 1px 3px rgba(0,0,0,0.02),
            0 8px 24px rgba(0,0,0,0.04),
            0 24px 48px rgba(0,0,0,0.06)
          `,
        }}
      >
        <div 
          className="flex items-center h-12 px-4 border-b border-zinc-100"
          style={{
            background: "linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.1)" }} />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.1)" }} />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.1)" }} />
          </div>
          
          <div className="flex-1 flex justify-center gap-2">
            <div className="flex items-center gap-1 px-4 py-1.5 bg-white rounded-lg border border-zinc-200/60 shadow-sm">
              <CustomDomainNudge />
            </div>
            <ThemeNudge isDefaultTheme={isDefaultTheme} onCustomize={onCustomizeTheme} />
          </div>
          
          <div className="w-[52px]" />
        </div>

        <div className="bg-white h-[calc(100%-48px)] overflow-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

const PreviewPanel = forwardRef(({
  viewport,
  mode,
  previewError,
  previewLoading,
  nodesForPreview,
  showEmbedPreview,
  theme,
  initialAssetDetails,
  onAnalyticsEvent,
  onEvent,
  variables,
  parentId,
  projectId,
  workspaceId,
  canvasId,
  openNodeWithTheme,
  onClose,
  isPremiumUser,
  onRetry,
  openFormSettings,
  /** When provided, banner "Choose theme" click opens theme section instead of closing (e.g. goToTab branding). */
  onBannerThemeClick,
  /** When provided, "Remove Branding" banner click only navigates to Configure → Branding (no toggle, so branding stays as-is). */
  onRemoveBrandingClick,
}, ref) => {
  const fillerRef = useRef(null);
  const embedLayoutRef = useRef(null);
  const brandingRef = useRef(null);
  const doesInitialRenderComplete = useRef(false);
  const containerRef = useRef(null);
  const containerSize = useContainerSize(containerRef);

  const { assetDetails, embedMode, embedSettings } = usePublish();

  const immediateRestart = useCallback(() => {
    if (embedLayoutRef.current) {
      embedLayoutRef.current.restart();
    }
  }, []);

  const debouncedRestart = useMemo(
    () =>
      debounce(
        () => {
          if (embedLayoutRef.current) {
            embedLayoutRef.current.restart();
          }
        },
        500,
        { leading: false, trailing: true }
      ),
    []
  );

  const fillerEmbedModeLayoutProperties = useMemo(() => {
    const domain = extractDomainFromUrl(process.env.REACT_APP_FORM_URL);
    return (
      getFillerEmbedModeLayoutProperties(
        embedMode,
        assetDetails?.asset?._id || initialAssetDetails?.asset?._id || "",
        domain,
        mode,
        embedSettings
      )?.attributes || {}
    );
  }, [assetDetails?.asset?._id, initialAssetDetails?.asset?._id, embedSettings, embedMode, mode]);

  useImperativeHandle(ref, () => ({
    restart: () => {
      if (showEmbedPreview) {
        immediateRestart();
      } else {
        fillerRef.current?.restart();
      }
    },
    toggleBranding: () => {
      brandingRef.current?.toogleBranding();
    },
  }), [showEmbedPreview, immediateRestart]);

  useEffect(() => {
    if (!doesInitialRenderComplete.current) {
      doesInitialRenderComplete.current = true;
      return;
    }
    if (showEmbedPreview) {
      debouncedRestart();
    }
  }, [embedMode, embedSettings, mode, debouncedRestart, showEmbedPreview]);

  useEffect(() => {
    return () => {
      debouncedRestart.cancel();
    };
  }, [debouncedRestart]);

  const isMobile = viewport === ViewPort.MOBILE;

  const renderContent = () => {
    if (previewError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
              <X className="w-7 h-7 text-red-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-zinc-800 font-medium text-base">Unable to load preview</p>
              <p className="text-zinc-500 text-sm mt-1">There was a problem loading your form preview.</p>
            </div>
            <button
              onClick={onRetry}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl",
                "bg-zinc-900 text-white font-medium",
                "hover:bg-zinc-800 transition-colors"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (previewLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-zinc-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (showEmbedPreview) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          data-testid="filler-preview"
        >
          <motion.div
            style={{ height: "100%" }}
            initial={false}
            animate={{ width: isMobile ? "45%" : "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <FillerEmbedModeLayout
              ref={embedLayoutRef}
              properties={fillerEmbedModeLayoutProperties}
              embedMode={embedMode}
              viewport={viewport}
            />
          </motion.div>
        </div>
      );
    }

    if (nodesForPreview) {
      return (
        <Filler
          ref={brandingRef}
          questions={nodesForPreview}
          theme={theme}
          mode={mode}
          viewPort={viewport}
          fillerRef={fillerRef}
          formName={initialAssetDetails?.asset?.name}
          onAnalyticsEvent={onAnalyticsEvent}
          onEvent={onEvent}
          variables={variables}
          parentId={parentId}
          projectId={projectId}
          workspaceId={workspaceId}
          assetId={initialAssetDetails?.asset_id}
          canvasId={canvasId}
          openNodeWithTheme={openNodeWithTheme}
          onClose={onClose}
          showRemoveBranding={isPremiumUser}
          hideBrandingButton={
            initialAssetDetails?.asset?.settings?.form?.remove_branding
          }
          openFormSettings={openFormSettings}
          onBannerThemeClick={onBannerThemeClick}
          onRemoveBrandingClick={onRemoveBrandingClick}
        />
      );
    }

    return null;
  };

  return (
    <div 
      ref={containerRef}
      className="w-1/2 flex items-center justify-center relative"
    >
      {isMobile ? (
        <MobileFrame containerSize={containerSize}>
          {renderContent()}
        </MobileFrame>
      ) : (
        <DesktopFrame 
          isDefaultTheme={isThemeDefault(theme)}
          onCustomizeTheme={openFormSettings}
        >
          {renderContent()}
        </DesktopFrame>
      )}
    </div>
  );
});

PreviewPanel.displayName = "PreviewPanel";

export default PreviewPanel;
