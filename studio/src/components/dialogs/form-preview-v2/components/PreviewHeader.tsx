import React from "react";
import { X, Monitor, Smartphone, LayoutGrid, List, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePreviewContext } from "../context";
import { Mode, ViewPort, MODE_OPTIONS, VIEWPORT_OPTIONS, ModeType, ViewPortType } from "../constants";

const modeIcons: Record<ModeType, React.ElementType> = {
  [Mode.CARD]: LayoutGrid,
  [Mode.CLASSIC]: List,
  [Mode.CHAT]: MessageCircle,
};

const viewportIcons: Record<ViewPortType, React.ElementType> = {
  [ViewPort.DESKTOP]: Monitor,
  [ViewPort.MOBILE]: Smartphone,
};

export function PreviewHeader() {
  const { mode, viewport, setMode, setViewport, close, resetSubmissionState } = usePreviewContext();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex items-center justify-between px-6 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 pointer-events-auto",
            "bg-white rounded-2xl",
            "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]",
            "border border-zinc-100"
          )}
        >
          {/* Form/canvas name hidden per product request — show only "Preview" */}
          <span className="text-sm font-medium text-zinc-700 max-w-[180px] truncate">
            {/* {formName || "Preview"} */}
            Preview
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className={cn(
            "flex items-center gap-3 px-2 py-2 pointer-events-auto",
            "bg-white rounded-2xl",
            "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]",
            "border border-zinc-100"
          )}
        >
          <div className="flex items-center p-1 bg-zinc-50 rounded-xl">
            {MODE_OPTIONS.map((option) => {
              const Icon = modeIcons[option.value];
              const isActive = mode === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setMode(option.value);
                    resetSubmissionState();
                  }}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mode-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-zinc-100"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon size={16} strokeWidth={1.75} />
                    <span className="hidden sm:inline">{option.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-6 bg-zinc-100" />

          <div className="flex items-center p-1 bg-zinc-50 rounded-xl">
            {VIEWPORT_OPTIONS.map((option) => {
              const Icon = viewportIcons[option.value];
              const isActive = viewport === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setViewport(option.value);
                    resetSubmissionState();
                  }}
                  className={cn(
                    "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                    isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                  )}
                  title={option.label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="viewport-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-zinc-100"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={1.75} className="relative" />
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto"
        >
          <button
            onClick={close}
            className={cn(
              "flex items-center justify-center w-10 h-10",
              "bg-white rounded-2xl",
              "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]",
              "border border-zinc-100",
              "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50",
              "transition-all duration-200"
            )}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </motion.div>
      </div>
    </header>
  );
}
