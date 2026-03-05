import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

const DropdownInput = React.forwardRef(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = "Select value...",
      disabled = false,
      className,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const dropdownRef = useRef(null);

    const selectedOption = useMemo(() => {
      if (value === undefined || value === null) return null;
      return options.find((opt) => opt.value === value);
    }, [value, options]);

    const handleSelect = useCallback(
      (option) => {
        if (onChange) {
          onChange(option);
        }
        setIsOpen(false);
      },
      [onChange],
    );

    const handleKeyDown = useCallback(
      (e) => {
        if (disabled) return;
        
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        } else if (e.key === "Escape") {
          setIsOpen(false);
        } else if (e.key === "ArrowDown" && isOpen) {
          e.preventDefault();
          const currentIdx = options.findIndex((o) => o.value === value);
          const nextIdx = Math.min(currentIdx + 1, options.length - 1);
          if (options[nextIdx]) handleSelect(options[nextIdx]);
        } else if (e.key === "ArrowUp" && isOpen) {
          e.preventDefault();
          const currentIdx = options.findIndex((o) => o.value === value);
          const prevIdx = Math.max(currentIdx - 1, 0);
          if (options[prevIdx]) handleSelect(options[prevIdx]);
        }
      },
      [disabled, isOpen, options, value, handleSelect],
    );

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    if (!options || options.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            "flex-1 flex items-center min-h-[1.5rem]",
            "font-['Inter'] text-sm text-[#78909C]",
            "cursor-default",
            className,
          )}
        >
          {placeholder}
        </div>
      );
    }

    return (
      <div ref={containerRef} className={cn("relative flex-1", className)}>
        <button
          ref={ref}
          type="button"
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between gap-2",
            "min-h-[1.5rem] px-0 py-0",
            "bg-transparent border-0 outline-none",
            "text-left cursor-pointer",
            "focus:outline-none",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {selectedOption ? (
            <span
              className={cn(
                "inline-flex items-center",
                "px-2 py-0.5 rounded",
                "text-sm font-medium",
                "bg-[#E8F5E9] text-[#2E7D32]",
                "font-['IBM_Plex_Mono',monospace]",
              )}
            >
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-sm text-[#78909C] font-['Inter']">
              {placeholder}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[#9CA3AF] transition-transform duration-150",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute top-full left-0 z-[9999] mt-1",
              "min-w-[140px] max-w-[200px]",
              "bg-white rounded-lg",
              "border border-[#E5E7EB]",
              "shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
              "py-1",
              "animate-in fade-in-0 zoom-in-95 duration-150",
            )}
          >
            {options.map((option, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full flex items-center justify-between gap-2",
                  "px-3 py-2 text-sm text-left",
                  "font-['IBM_Plex_Mono',monospace]",
                  "transition-colors duration-100",
                  "hover:bg-[#F3F4F6]",
                  option.value === value && "bg-[#F0F7FF]",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded",
                    option.value === true && "bg-[#E8F5E9] text-[#2E7D32]",
                    option.value === false && "bg-[#FFEBEE] text-[#C62828]",
                    option.value !== true && option.value !== false && "bg-[#E8E8E8] text-[#263238]",
                  )}
                >
                  {option.label}
                </span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-[#1C3693]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

DropdownInput.displayName = "DropdownInput";

export { DropdownInput };
export default DropdownInput;
