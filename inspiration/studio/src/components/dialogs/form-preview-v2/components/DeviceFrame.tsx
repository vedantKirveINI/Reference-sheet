import React, { ReactNode, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Crown, Globe } from "lucide-react";
import { ViewPort, ViewPortType, DEVICE_DIMENSIONS } from "../constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PortalContainerProvider } from "../context/PortalContainerContext";

function useContainerSize(ref: React.RefObject<HTMLDivElement>) {
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

interface DeviceFrameProps {
  viewport: ViewPortType;
  children: ReactNode;
}

interface MobileFrameProps {
  children: ReactNode;
  containerSize: { width: number; height: number };
}

function MobileFrame({ children, containerSize }: MobileFrameProps) {
  const frameWidth = DEVICE_DIMENSIONS.MOBILE.width + 20;
  const frameHeight = DEVICE_DIMENSIONS.MOBILE.height + 20;
  const portalContainerRef = useRef<HTMLDivElement>(null);
  
  const validWidth = containerSize.width > 0 ? containerSize.width : frameWidth;
  const validHeight = containerSize.height > 0 ? containerSize.height : frameHeight;
  
  const scaleX = validWidth / frameWidth;
  const scaleY = validHeight / frameHeight;
  const scale = Math.max(0.15, Math.min(0.92, scaleX, scaleY));

  useEffect(() => {
    console.log("[PREVIEW_DEBUG] MobileFrame render:", {
      containerSize,
      frameWidth,
      frameHeight,
      validWidth,
      validHeight,
      scale,
      hasChildren: !!children,
    });
  }, [containerSize, scale, children]);

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
          ref={portalContainerRef}
          className="relative bg-white rounded-[42px] overflow-hidden"
          style={{
            width: DEVICE_DIMENSIONS.MOBILE.width,
            height: DEVICE_DIMENSIONS.MOBILE.height,
            transform: "translateZ(0)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          <PortalContainerProvider containerRef={portalContainerRef}>
            <div className="relative w-full h-full overflow-auto">
              {children}
            </div>
          </PortalContainerProvider>
        </div>

        <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[5px] bg-white/20 rounded-full z-20" />
      </div>
    </motion.div>
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

function DesktopFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full h-full max-w-5xl mx-auto px-8"
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
          
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1 px-4 py-1.5 bg-white rounded-lg border border-zinc-200/60 shadow-sm">
              <CustomDomainNudge />
            </div>
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

export function DeviceFrame({ viewport, children }: DeviceFrameProps) {
  const isMobile = viewport === ViewPort.MOBILE;
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useContainerSize(containerRef);

  useEffect(() => {
    console.log("[PREVIEW_DEBUG] DeviceFrame render:", {
      viewport,
      isMobile,
      containerSize,
      hasChildren: !!children,
    });
  }, [viewport, isMobile, containerSize, children]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex items-center justify-center",
        isMobile ? "w-full h-full" : "w-full h-full"
      )}
    >
      {isMobile ? (
        <MobileFrame containerSize={containerSize}>{children}</MobileFrame>
      ) : (
        <DesktopFrame>{children}</DesktopFrame>
      )}
    </div>
  );
}
