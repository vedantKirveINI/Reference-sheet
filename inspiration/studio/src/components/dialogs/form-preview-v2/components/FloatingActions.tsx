import { useState, useCallback } from "react";
import { RotateCcw, Upload, ChevronUp, Palette, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePreviewContext } from "../context";
import { PREVIEW_THEMES } from "@/module/constants/formThemeConstants";

interface Theme {
  [key: string]: any;
}

const getThemeColors = (theme: Theme) => {
  const backgroundColor = 
    theme?.styles?.backgroundColor || 
    theme?.background?.color || 
    "#FFFFFF";
  const accentColor = 
    theme?.styles?.buttons || 
    theme?.buttons?.fillColor || 
    "#1C3693";
  return { backgroundColor, accentColor };
};

function ThemeIsland() {
  const { theme, setTheme, isDefaultTheme } = usePreviewContext();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleThemeSelect = useCallback((selectedTheme: Theme) => {
    setTheme?.(selectedTheme);
    setIsExpanded(false);
  }, [setTheme]);

  const isThemeSelected = useCallback((checkTheme: Theme) => {
    return theme?.id === checkTheme.id || theme?.name === checkTheme.name;
  }, [theme]);

  const displayedSwatches = PREVIEW_THEMES.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-6 left-6 z-50"
    >
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-3 px-4 py-3",
            "bg-white rounded-2xl",
            "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]",
            "border border-zinc-100",
            "hover:bg-zinc-50",
            "transition-all duration-200"
          )}
        >
          <div className="flex items-center gap-1">
            {displayedSwatches.map((t, index) => {
              const { backgroundColor, accentColor } = getThemeColors(t);
              const themeWithId = { ...t, id: t.id || `theme-${index}` };
              return (
                <div
                  key={themeWithId.id}
                  className={cn(
                    "w-5 h-5 rounded-md overflow-hidden border-2 transition-all duration-200",
                    isThemeSelected(themeWithId) ? "border-zinc-900 scale-110" : "border-zinc-200"
                  )}
                >
                  <div className="h-3/4" style={{ backgroundColor }} />
                  <div className="h-1/4" style={{ backgroundColor: accentColor }} />
                </div>
              );
            })}
          </div>
          
          {isDefaultTheme && (
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg"
            >
              <Palette size={13} strokeWidth={1.75} />
              <span className="text-xs font-medium">Style it</span>
            </motion.div>
          )}
          
          <ChevronUp 
            size={16} 
            className={cn(
              "text-zinc-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )} 
          />
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "absolute bottom-full mb-3 left-0",
                "w-[340px] rounded-2xl overflow-hidden",
                "bg-white",
                "border border-zinc-100",
                "shadow-[0_4px_16px_rgba(0,0,0,0.08),0_12px_48px_rgba(0,0,0,0.12)]"
              )}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Palette size={15} className="text-white" strokeWidth={1.75} />
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">Choose a style</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X size={16} strokeWidth={1.75} />
                </button>
              </div>
              
              <div className="p-3 max-h-[320px] overflow-y-auto">
                <div className="grid grid-cols-3 gap-2">
                  {PREVIEW_THEMES.map((t, index) => {
                    const { backgroundColor, accentColor } = getThemeColors(t);
                    const questionColor = 
                      t?.styles?.questions || 
                      t?.fonts?.questionColor || 
                      "#212121";
                    const backgroundImage = 
                      t?.styles?.backgroundImage || 
                      t?.background?.image || 
                      "";
                    const selected = isThemeSelected(t);
                    const themeWithId = { ...t, id: t.id || `theme-${index}` };
                    
                    return (
                      <button
                        key={themeWithId.id}
                        onClick={() => handleThemeSelect(themeWithId)}
                        className={cn(
                          "relative rounded-xl transition-all duration-200 overflow-hidden group",
                          "border-2",
                          selected 
                            ? "border-zinc-900 ring-2 ring-zinc-900/10" 
                            : "border-zinc-100 hover:border-zinc-200 hover:shadow-md"
                        )}
                      >
                        <div
                          className="aspect-[4/3] p-2.5 flex flex-col"
                          style={{ 
                            backgroundColor,
                            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                            backgroundSize: backgroundImage ? 'cover' : undefined,
                            backgroundPosition: backgroundImage ? 'center' : undefined,
                          }}
                        >
                          <div className="space-y-1 flex-1">
                            <div
                              className="h-1.5 w-3/4 rounded-sm"
                              style={{ backgroundColor: questionColor, opacity: 0.8 }}
                            />
                            <div
                              className="h-1 w-1/2 rounded-sm"
                              style={{ backgroundColor: questionColor, opacity: 0.4 }}
                            />
                          </div>
                          <div
                            className="h-4 w-10 rounded-md mt-1.5"
                            style={{ backgroundColor: accentColor }}
                          />
                        </div>
                        <div className="px-2.5 py-2 bg-white border-t border-zinc-100">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-zinc-600 truncate">{t.name}</span>
                            {selected && (
                              <div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center">
                                <Check size={10} className="text-white" strokeWidth={2.5} />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ActionsIsland() {
  const { restart, onPublish } = usePreviewContext();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-6 right-6 z-50"
    >
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-2",
          "bg-white rounded-2xl",
          "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]",
          "border border-zinc-100"
        )}
      >
        <Button
          variant="ghost"
          onClick={restart}
          className="gap-2 px-4 h-10 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded-xl"
        >
          <RotateCcw size={16} strokeWidth={1.75} />
          <span className="font-medium">Restart</span>
        </Button>

        <Button
          onClick={onPublish}
          className={cn(
            "gap-2 px-5 h-10 rounded-xl",
            "bg-zinc-900 hover:bg-zinc-800 text-white font-medium",
            "shadow-lg shadow-zinc-900/20"
          )}
        >
          <Upload size={16} strokeWidth={1.75} />
          <span>Publish</span>
        </Button>
      </div>
    </motion.div>
  );
}

export function FloatingActions() {
  return (
    <>
      <ThemeIsland />
      <ActionsIsland />
    </>
  );
}
