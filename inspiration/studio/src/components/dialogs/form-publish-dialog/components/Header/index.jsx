import { Mode, ViewPort } from "../../../../../module/constants";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X, RotateCcw, Monitor, Smartphone, LayoutGrid, List, MessageCircle } from "lucide-react";

const modeOptions = [
  { value: Mode.CARD, label: "Card", icon: LayoutGrid },
  { value: Mode.CLASSIC, label: "Classic", icon: List },
  { value: Mode.CHAT, label: "Chat", icon: MessageCircle },
];

const viewportOptions = [
  { value: ViewPort.DESKTOP, label: "Desktop", icon: Monitor },
  { value: ViewPort.MOBILE, label: "Mobile", icon: Smartphone },
];

const islandClassName = cn(
  "bg-white rounded-2xl",
  "shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.08)]",
  "border border-zinc-100"
);

const Header = ({
  mode,
  viewPort,
  setMode,
  setViewPort,
  onClose,
  onRestart,
  formName,
}) => {
  return (
    <div className="flex items-center justify-between px-2 py-2">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={cn(islandClassName, "flex items-center gap-3 px-4 py-2.5")}
      >
        <span className="text-sm font-medium text-zinc-700 max-w-[180px] truncate">
          {formName || "Publish"}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className={cn(islandClassName, "flex items-center gap-3 px-2 py-2")}
      >
        <button
          onClick={onRestart}
          data-testid="restart-button"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl",
            "text-sm font-medium text-zinc-500 hover:text-zinc-700",
            "hover:bg-zinc-50 transition-all duration-200"
          )}
        >
          <RotateCcw size={16} strokeWidth={1.75} />
          <span>Restart</span>
        </button>

        <div className="w-px h-6 bg-zinc-100" />

        <div className="flex items-center p-1 bg-zinc-50 rounded-xl">
          {modeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = mode === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="publish-mode-pill"
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
          {viewportOptions.map((option) => {
            const Icon = option.icon;
            const isActive = viewPort === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setViewPort(option.value)}
                className={cn(
                  "relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200",
                  isActive ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                )}
                title={option.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="publish-viewport-pill"
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
      >
        <button
          onClick={onClose}
          aria-label="Close and return to canvas"
          title="Close"
          className={cn(
            "flex items-center justify-center w-10 h-10",
            islandClassName,
            "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50",
            "transition-all duration-200"
          )}
        >
          <X size={18} strokeWidth={1.75} />
        </button>
      </motion.div>
    </div>
  );
};

export default Header;
