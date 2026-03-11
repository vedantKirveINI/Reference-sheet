import React, { createContext, useContext, useState } from "react";
import "./ui.css";

const TabsContext = createContext({
  value: "",
  onChange: () => {},
});

const Tabs = ({ value, defaultValue, onValueChange, children, className = "" }) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onChange: handleChange }}>
      <div className={`ext-tabs ${className}`.trim()}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = "" }) => {
  return (
    <div className={`ext-tabs-list ${className}`.trim()} role="tablist">
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, disabled = false, children, className = "" }) => {
  const { value: currentValue, onChange } = useContext(TabsContext);
  const isActive = currentValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`ext-tabs-trigger ${isActive ? "ext-tabs-trigger-active" : ""} ${disabled ? "ext-tabs-trigger-disabled" : ""} ${className}`.trim()}
      onClick={() => !disabled && onChange(value)}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = "" }) => {
  const { value: currentValue } = useContext(TabsContext);

  if (currentValue !== value) {
    return null;
  }

  return (
    <div className={`ext-tabs-content ${className}`.trim()} role="tabpanel">
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
