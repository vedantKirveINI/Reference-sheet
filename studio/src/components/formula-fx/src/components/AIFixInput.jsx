import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const AIFixInput = ({
  value: controlledValue,
  onChange,
  placeholder = "Explain your formula what you want to have.",
  onEnter,
}) => {
  const [internalValue, setInternalValue] = useState("");
  const inputRef = useRef(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEnter) {
        onEnter(value);
      }
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg p-2 shadow-sm flex gap-2 items-center w-full box-border transition-all hover:border-muted-foreground/30 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden relative bg-gradient-to-br from-indigo-500 to-purple-600" />
      <Input
        ref={inputRef}
        type="text"
        className={cn(
          "flex-1 border-none outline-none bg-transparent text-sm font-normal leading-tight text-muted-foreground min-w-0 placeholder:text-muted-foreground",
          "border-0 shadow-none focus-visible:ring-0"
        )}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
};

export default AIFixInput;

