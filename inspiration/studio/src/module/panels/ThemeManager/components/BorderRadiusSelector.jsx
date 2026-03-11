import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const RADIUS_OPTIONS = [
  { value: "0px", label: "Sharp" },
  { value: "8px", label: "Rounded" },
  { value: "9999px", label: "Pill" },
];

const BorderRadiusSelector = ({ value = "8px", onChange }) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange?.(v)}
      variant="default"
      size="sm"
      className="inline-flex rounded-xl p-1 bg-muted gap-0.5"
    >
      {RADIUS_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="w-10 h-8 min-w-10 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
          title={option.label}
        >
          <div
            className="w-5 h-3 border-2 border-current"
            style={{ borderRadius: option.value }}
          />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default BorderRadiusSelector;
