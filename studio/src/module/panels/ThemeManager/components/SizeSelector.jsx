import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const SizeSelector = ({ value = "M", onChange }) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange?.(v)}
      variant="default"
      size="sm"
      className="inline-flex rounded-xl p-1 bg-muted gap-0.5"
    >
      {["S", "M", "L"].map((size) => (
        <ToggleGroupItem
          key={size}
          value={size}
          className="w-8 h-8 min-w-8 text-xs font-semibold rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
        >
          {size}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default SizeSelector;
