import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ODSColorInput = ({
  defaultColor = "#000000",
  onColorChange = () => { },
  format = "hex",
  isAlphaHidden = true,
  ...props
}) => {
  const [value, setValue] = useState(defaultColor);
  const [open, setOpen] = useState(false);

  const handleColorChange = (color) => {
    let colorValue;
    if (format === "hex") {
      colorValue = color.hex;
    } else if (format === "rgb") {
      colorValue = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    } else {
      colorValue = color.hex;
    }
    setValue(colorValue);
    onColorChange(colorValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex w-[9.375rem]">
          <Input
            value={value}
            readOnly
            className={cn(
              "rounded-[0.75rem] pr-0 cursor-pointer",
              props.className
            )}
            onClick={() => setOpen(true)}
            {...props}
          />
          <div
            className="w-8 h-8 rounded border border-input ml-2 cursor-pointer flex-shrink-0"
            style={{ backgroundColor: value }}
            onClick={() => setOpen(true)}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <SketchPicker
          color={value}
          onChange={handleColorChange}
          disableAlpha={isAlphaHidden}
        />
      </PopoverContent>
    </Popover>
  );
};

export default ODSColorInput;
