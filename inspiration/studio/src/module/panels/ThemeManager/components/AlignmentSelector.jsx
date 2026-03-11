import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { icons } from "@/components/icons";

const AlignLeftIcon = icons.alignLeft;
const AlignRightIcon = icons.alignRight;

const AlignmentSelector = ({ value = "left", onChange }) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange?.(v)}
      variant="default"
      size="sm"
      className="inline-flex rounded-xl p-1 bg-muted gap-0.5"
    >
      <ToggleGroupItem value="left" className="w-8 h-8 min-w-8 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
        {AlignLeftIcon ? <AlignLeftIcon className="w-4 h-4" /> : null}
      </ToggleGroupItem>
      <ToggleGroupItem value="right" className="w-8 h-8 min-w-8 rounded-lg data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm">
        {AlignRightIcon ? <AlignRightIcon className="w-4 h-4" /> : null}
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default AlignmentSelector;
