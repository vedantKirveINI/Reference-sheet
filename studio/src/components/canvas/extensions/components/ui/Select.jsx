import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { ChevronDown, Check } from "lucide-react";
import "./ui.css";

const SelectContext = createContext({
  value: "",
  onChange: () => {},
  open: false,
  setOpen: () => {},
});

const Select = ({ value, defaultValue, onValueChange, children, disabled = false }) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider
      value={{
        value: currentValue,
        onChange: handleChange,
        open,
        setOpen,
        disabled,
      }}
    >
      <div className="ext-select">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = ({ children, placeholder = "Select...", className = "" }) => {
  const { value, open, setOpen, disabled } = useContext(SelectContext);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (triggerRef.current && !triggerRef.current.closest(".ext-select")?.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  return (
    <button
      ref={triggerRef}
      type="button"
      className={`ext-select-trigger ${open ? "ext-select-trigger-open" : ""} ${disabled ? "ext-select-trigger-disabled" : ""} ${className}`.trim()}
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
    >
      <span className="ext-select-value">
        {children || (!value && placeholder) || value}
      </span>
      <ChevronDown className={`ext-select-icon ${open ? "ext-select-icon-open" : ""}`} />
    </button>
  );
};

const SelectValue = ({ placeholder = "Select..." }) => {
  const { value } = useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

const SelectContent = ({ children, className = "" }) => {
  const { open } = useContext(SelectContext);

  if (!open) return null;

  return (
    <div className={`ext-select-content ${className}`.trim()}>
      {children}
    </div>
  );
};

const SelectItem = ({ value, children, disabled = false, className = "" }) => {
  const { value: currentValue, onChange } = useContext(SelectContext);
  const isSelected = currentValue === value;

  return (
    <div
      className={`ext-select-item ${isSelected ? "ext-select-item-selected" : ""} ${disabled ? "ext-select-item-disabled" : ""} ${className}`.trim()}
      onClick={() => !disabled && onChange(value)}
    >
      <span className="ext-select-item-text">{children}</span>
      {isSelected && <Check className="ext-select-item-check" />}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
