import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Plus, X } from "lucide-react";

const AUTO_HIDE_MS = 8000;

const SuggestionPopper = ({
  suggestion,
  visible,
  onAdd,
  onDismiss,
  onOpenChat,
  footerRef,
}) => {
  const timerRef = useRef(null);
  const [footerRect, setFooterRect] = useState(null);

  const measureFooter = useCallback(() => {
    if (footerRef?.current) {
      const rect = footerRef.current.getBoundingClientRect();
      setFooterRect(rect);
    }
  }, [footerRef]);

  useEffect(() => {
    if (!visible) return;
    measureFooter();
    window.addEventListener("resize", measureFooter);
    return () => window.removeEventListener("resize", measureFooter);
  }, [visible, measureFooter]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (visible && suggestion) {
      timerRef.current = setTimeout(() => {
        onDismiss?.();
      }, AUTO_HIDE_MS);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, suggestion, onDismiss]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    onDismiss?.();
  };

  const handleAdd = (e, node) => {
    e.stopPropagation();
    e.preventDefault();
    onAdd?.(node);
  };

  const handleBodyClick = () => {
    onOpenChat?.();
  };

  if (!suggestion || !suggestion.nodes?.length) return null;

  const positionStyle = footerRect
    ? {
        position: "fixed",
        bottom: `calc(100vh - ${footerRect.top}px + 8px)`,
        left: `${footerRect.left}px`,
        width: `${footerRect.width}px`,
        zIndex: 1001,
      }
    : {
        position: "fixed",
        bottom: "72px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1001,
      };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={positionStyle}
          className={cn(
            "rounded-island shadow-island bg-surface-base border border-black/[0.04]",
            "cursor-pointer pointer-events-auto",
          )}
          onClick={handleBodyClick}
        >
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[12px] font-semibold text-slate-800">
                  Suggested next step
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[12px] leading-[1.6] text-slate-600 mb-2.5 line-clamp-5">
              {suggestion.summary}
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              {suggestion.nodes.map((node, idx) => (
                <button
                  key={`popper-node-${node.type || idx}`}
                  type="button"
                  onClick={(e) => handleAdd(e, node)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5",
                    "rounded-lg bg-white border border-emerald-200",
                    "text-[12px] font-medium text-slate-800",
                    "hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-sm",
                    "transition-all cursor-pointer whitespace-nowrap",
                  )}
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  {node.name || node.type}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuggestionPopper;
