import React, { useState } from "react";
import { SketchPicker } from "react-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";

const ColorPickerField = ({ value = "#1C3693", onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSketchChange = (color) => {
    onChange?.(color?.hex ?? value);
  };

  const ChevronDownIcon = icons.chevronDown;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2.5 min-w-[130px] justify-start"
        >
          <div
            className="w-5 h-5 rounded-full border shrink-0 shadow-sm bg-background"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm font-mono uppercase tracking-wide flex-1 text-left">
            {value}
          </span>
          {ChevronDownIcon ? <ChevronDownIcon className="w-3.5 h-3.5 ml-auto text-muted-foreground" /> : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0 rounded-2xl overflow-hidden">
        <SketchPicker
          color={value}
          onChange={handleSketchChange}
          disableAlpha
          presetColors={[]}
        />
      </PopoverContent>
    </Popover>
  );
};

export default ColorPickerField;
