import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

const ODSToggleButtonGroup = ({
  className,
  exclusive = true,
  value,
  onChange,
  children,
  ...props
}) => {
  const handleValueChange = (newValue) => {
    if (onChange) onChange(null, newValue);
  };

  const renderChildren = () => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return (
          <ToggleGroupItem
            key={child.props.value}
            value={child.props.value}
            className={cn(child.props.className)}
            disabled={child.props.disabled}
          >
            {child.props.children}
          </ToggleGroupItem>
        );
      }
      return child;
    });
  };

  return (
    <ToggleGroup
      type={exclusive ? "single" : "multiple"}
      value={exclusive ? (value || "") : (Array.isArray(value) ? value : [])}
      onValueChange={handleValueChange}
      className={cn(className)}
      {...props}
    >
      {renderChildren()}
    </ToggleGroup>
  );
};

export default ODSToggleButtonGroup;
