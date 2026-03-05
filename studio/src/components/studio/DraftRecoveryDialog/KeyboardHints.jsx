import React from "react";
import { cn } from "@/lib/utils";

function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 rounded",
        "bg-gray-100 border border-gray-200 text-gray-600",
        "font-mono text-[10px] font-medium",
        "min-w-[20px]",
        className
      )}
    >
      {children}
    </kbd>
  );
}

export function KeyboardHints({ showArrowKeys = false, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-[10px] text-gray-400",
        className
      )}
      style={{ fontFamily: "Archivo, sans-serif" }}
    >
      {showArrowKeys && (
        <span className="flex items-center gap-1">
          <Kbd>←</Kbd>
          <Kbd>→</Kbd>
          <span>switch</span>
        </span>
      )}
      <span className="flex items-center gap-1">
        <Kbd>Enter</Kbd>
        <span>continue</span>
      </span>
      <span className="flex items-center gap-1">
        <Kbd>Esc</Kbd>
        <span>continue</span>
      </span>
    </div>
  );
}

export default KeyboardHints;
