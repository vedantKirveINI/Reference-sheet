import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getLucideIcon } from "@/components/icons";

const AIAssistTrigger = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder = "Describe what you want to do...",
  isLoading = false,
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit?.(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 w-7 p-0 rounded-md",
          "text-gray-400 hover:text-[var(--fx-brand-primary)]",
          "hover:bg-[var(--fx-brand-primary)]/5",
          "transition-all duration-200",
          isOpen && "text-[var(--fx-brand-primary)] bg-[var(--fx-brand-primary)]/5"
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <div className={cn(
          "transition-transform duration-300",
          isOpen && "scale-110"
        )}>
          {getLucideIcon("Sparkles", { 
            size: 15, 
            className: cn(
              "transition-all duration-300",
              isOpen ? "text-[var(--fx-brand-primary)]" : "text-current"
            )
          })}
        </div>
      </Button>
      
      {isOpen && (
        <div 
          className={cn(
            "absolute right-0 top-full mt-2 z-50",
            "w-72 p-3",
            "bg-white rounded-xl",
            "border border-gray-100",
            "shadow-lg shadow-gray-200/50",
            "animate-in fade-in-0 slide-in-from-top-2 duration-200"
          )}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className={cn(
              "flex items-center justify-center",
              "w-6 h-6 rounded-lg",
              "bg-gradient-to-br from-[var(--fx-brand-primary)] to-[#2548b8]",
              "text-white"
            )}>
              {getLucideIcon("Sparkles", { size: 12 })}
            </div>
            <span className="text-xs font-medium text-gray-700">AI Formula Assistant</span>
          </div>
          
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                "w-full h-9 pr-9 text-sm",
                "border-gray-200 rounded-lg",
                "focus-visible:ring-1 focus-visible:ring-[var(--fx-brand-primary)]/30",
                "focus-visible:border-[var(--fx-brand-primary)]",
                "placeholder:text-[var(--fx-text-muted)] placeholder:italic placeholder:opacity-70"
              )}
              style={{ fontFamily: "var(--fx-font-body)" }}
              disabled={isLoading}
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2",
                "h-7 w-7 rounded-md",
                "text-gray-400 hover:text-[var(--fx-brand-primary)]",
                "hover:bg-[var(--fx-brand-primary)]/10",
                "disabled:opacity-40"
              )}
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading}
            >
              {isLoading 
                ? getLucideIcon("OUTELoaderIcon", { size: 14, className: "animate-spin text-[var(--fx-brand-primary)]" })
                : getLucideIcon("ArrowRight", { size: 14 })
              }
            </Button>
          </div>
          
          {error ? (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-500">
              {getLucideIcon("AlertCircle", { size: 10 })}
              <span>{error}</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
              <span>Press</span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">Enter</kbd>
              <span>to generate</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistTrigger;
