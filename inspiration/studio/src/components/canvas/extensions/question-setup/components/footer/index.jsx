import React, { useState, useRef, useEffect } from "react";
import { Mode, ViewPort } from "../../../../../../module/constants";
import { cn } from "@/lib/utils";
import { Monitor, Smartphone, List, LayoutGrid, MessageCircle, Asterisk, EyeOff } from "lucide-react";

const MODE_OPTIONS = [
  { value: Mode.CLASSIC, label: "Classic", icon: List },
  { value: Mode.CARD, label: "Card", icon: LayoutGrid },
  { value: Mode.CHAT, label: "Chat", icon: MessageCircle },
];

const VIEWPORT_OPTIONS = [
  { value: ViewPort.DESKTOP, icon: Monitor, label: "Desktop" },
  { value: ViewPort.MOBILE, icon: Smartphone, label: "Mobile" },
];

const COMPACT_THRESHOLD = 360;

const QuestionProperties = ({ properties = [] }) => {
  if (!properties || properties.length === 0) return null;
  
  return (
    <div className="flex items-center" style={{ gap: "clamp(0.5rem, 0.8vh, 0.625rem)" }}>
      {properties.map((prop, idx) => (
        <div
          key={idx}
          className="flex items-center rounded-[var(--wizard-radius-sm)] font-medium"
          style={{ 
            backgroundColor: prop.color || "rgba(0, 0, 0, 0.04)",
            color: prop.textColor || "#52525b",
            gap: "clamp(0.375rem, 0.6vh, 0.5rem)",
            padding: "clamp(0.25rem, 0.4vh, 0.375rem) clamp(0.5rem, 0.8vh, 0.625rem)",
            fontSize: "clamp(0.75rem, 1.2vh, 0.875rem)",
          }}
        >
          {prop.icon && <prop.icon style={{ width: "clamp(0.75rem, 1.2vh, 0.875rem)", height: "clamp(0.75rem, 1.2vh, 0.875rem)" }} />}
          <span>{prop.label}</span>
        </div>
      ))}
    </div>
  );
};

const AdaptiveModeSwitch = ({ activeMode, onModeChange, compact = false, theme = {} }) => {
  const defaultTheme = {
    tabContainerBg: "rgba(0, 0, 0, 0.04)",
    headerBorder: "rgba(0, 0, 0, 0.08)",
    activeTabBg: "#18181b",
    activeTabText: "#ffffff",
    inactiveTabText: "#71717a",
  };
  const mergedTheme = { ...defaultTheme, ...theme };

  return (
    <div
      className="flex items-center rounded-[var(--wizard-radius-md)] border"
      style={{ 
        backgroundColor: mergedTheme.tabContainerBg, 
        borderColor: mergedTheme.headerBorder,
        padding: "clamp(0.25rem, 0.5vh, 0.375rem)",
      }}
    >
      {MODE_OPTIONS.map((option) => {
        const isActive = activeMode === option.value;
        const Icon = option.icon;
        const showLabel = !compact || isActive;
        
        return (
          <button
            key={option.value}
            onClick={() => onModeChange(option.value)}
            className={cn(
              "flex items-center rounded-[var(--wizard-radius-md)] font-medium transition-all relative",
              isActive ? "shadow-sm" : "hover:bg-black/[0.06]"
            )}
            style={{
              gap: "clamp(0.375rem, 0.6vh, 0.5rem)",
              padding: showLabel 
                ? "clamp(0.375rem, 0.8vh, 0.5rem) clamp(0.75rem, 1.2vh, 1rem)" 
                : "clamp(0.375rem, 0.8vh, 0.5rem)",
              fontSize: "clamp(0.75rem, 1.2vh, 0.875rem)",
              ...(isActive
                ? {
                    backgroundColor: mergedTheme.activeTabBg,
                    color: mergedTheme.activeTabText,
                  }
                : { color: mergedTheme.inactiveTabText }),
            }}
            title={option.label}
            data-testid={`footer-mode-${option.value.toLowerCase()}`}
          >
            <Icon style={{ width: "clamp(0.875rem, 1.4vh, 1rem)", height: "clamp(0.875rem, 1.4vh, 1rem)" }} />
            {showLabel && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
};

const ViewSwitch = ({ activeView, onViewChange, theme = {} }) => {
  const defaultTheme = {
    tabContainerBg: "rgba(0, 0, 0, 0.04)",
    headerBorder: "rgba(0, 0, 0, 0.08)",
    activeTabBg: "#18181b",
    activeTabText: "#ffffff",
    inactiveTabText: "#71717a",
  };
  const mergedTheme = { ...defaultTheme, ...theme };

  return (
    <div 
className="flex items-center rounded-[var(--wizard-radius-md)] border"
    style={{ 
      backgroundColor: mergedTheme.tabContainerBg, 
      borderColor: mergedTheme.headerBorder,
      padding: "clamp(0.25rem, 0.5vh, 0.375rem)",
    }}
  >
    {VIEWPORT_OPTIONS.map((option) => {
      const Icon = option.icon;
      const isActive = activeView === option.value;
      return (
        <button
          key={option.value}
          onClick={() => onViewChange(option.value)}
          className={cn(
            "flex items-center rounded-[var(--wizard-radius-md)] transition-all relative",
              isActive ? "shadow-sm" : "hover:bg-black/[0.06]"
            )}
            style={{
              padding: "clamp(0.5rem, 0.8vh, 0.625rem)",
              ...(isActive
                ? {
                    backgroundColor: mergedTheme.activeTabBg,
                    color: mergedTheme.activeTabText,
                  }
                : { color: mergedTheme.inactiveTabText }),
            }}
            title={option.label}
            data-testid={`footer-viewport-${option.value.toLowerCase()}`}
          >
            <Icon style={{ width: "clamp(0.875rem, 1.4vh, 1rem)", height: "clamp(0.875rem, 1.4vh, 1rem)" }} />
          </button>
        );
      })}
    </div>
  );
};

const CTAButton = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-[var(--wizard-radius-md)] font-medium bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
      style={{
        padding: "clamp(0.5rem, 0.8vh, 0.625rem) clamp(1rem, 1.6vh, 1.25rem)",
        fontSize: "clamp(0.75rem, 1.2vh, 0.875rem)",
      }}
      data-testid="footer-close-button"
    >
      {label}
    </button>
  );
};

const Footer = ({
  mode,
  onModeChange,
  viewPort,
  onViewPortChange,
  onSave = () => {},
  onDiscard = () => {},
  questionProperties = [],
  theme = {},
}) => {
  const containerRef = useRef(null);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === "undefined" || typeof ResizeObserver === "undefined") return;
    
    const parentContainer = containerRef.current.parentElement;
    if (!parentContainer) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setIsCompact(width < COMPACT_THRESHOLD);
      }
    });
    
    observer.observe(parentContainer);
    return () => observer.disconnect();
  }, []);

  const hasProperties = questionProperties && questionProperties.length > 0;

  return (
    <footer
      ref={containerRef}
      className="flex w-full items-center justify-between border-t border-border/40 bg-background"
      style={{
        minHeight: "var(--wizard-footer-height)",
        padding: "0 var(--wizard-header-padding)",
      }}
      data-testid="footer"
    >
      {/* Left: Question Properties + Mode Switcher + View Toggle */}
      <div className="flex items-center" style={{ gap: "clamp(0.5rem, 0.8vh, 0.75rem)" }}>
        {hasProperties && (
          <>
            <QuestionProperties properties={questionProperties} />
            <div className="bg-zinc-200" style={{ width: "1px", height: "clamp(1.25rem, 2vh, 1.5rem)" }} />
          </>
        )}
        <AdaptiveModeSwitch 
          activeMode={mode} 
          onModeChange={onModeChange} 
          compact={isCompact}
          theme={theme}
        />
        <ViewSwitch activeView={viewPort} onViewChange={onViewPortChange} theme={theme} />
      </div>
      
      {/* Right: CTA */}
      <CTAButton label="Close" onClick={onSave} />
    </footer>
  );
};

export default Footer;
