import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { PLACEHOLDER } from "./constants";

const TinyAIInput = ({
  inputRef,
  value,
  onChange,
  onKeyDown,
  onSend,
  disabled,
}) => {
  return (
    <div className="flex items-end gap-2 shrink-0">
      <div
        className={cn(
          "flex-1 min-w-0 flex items-end",
          "rounded-island-sm",
          "border border-slate-200/80 shadow-sm",
          "bg-white",
          "transition-all duration-200",
          "focus-within:border-[#1C3693]/40 focus-within:shadow-[0_0_0_3px_rgba(28,54,147,0.1),0_1px_3px_rgba(0,0,0,0.06)]",
        )}
      >
        <Textarea
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={PLACEHOLDER}
          rows={1}
          disabled={disabled}
          className={cn(
            "min-h-[36px] max-h-20 resize-none border-0 shadow-none focus-visible:ring-0",
            "rounded-island-sm bg-transparent px-3 py-2 text-[13px]",
            "placeholder:text-slate-400 placeholder:italic",
          )}
        />
      </div>
      <button
        type="button"
        className={cn(
          "h-9 w-9 shrink-0 flex items-center justify-center",
          "rounded-island-sm",
          "bg-gradient-to-br from-[#1C3693] to-[#3b5de7] text-white",
          "hover:from-[#152b7a] hover:to-[#2a4cc7]",
          "disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed",
          "transition-all duration-200 shadow-sm",
        )}
        onClick={onSend}
        disabled={!value?.trim() || disabled}
        title="Send"
      >
        <icons.send className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TinyAIInput;
