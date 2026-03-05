import React from "react";
import { Input } from "@/components/ui/input";
import { CardDescription } from "@/components/ui/card";
import SectionCard from "../components/SectionCard";
import FormRow from "../components/FormRow";
import ColorPickerField from "../components/ColorPickerField";
import BorderRadiusSelector from "../components/BorderRadiusSelector";

const ButtonTabV2 = ({ buttons = {}, onChange }) => {
  const handleLabelChange = (e) => {
    onChange?.({ ...buttons, defaultLabel: e.target.value });
  };

  const handleFillColorChange = (fillColor) => {
    onChange?.({ ...buttons, fillColor });
  };

  const handleTextColorChange = (textColor) => {
    onChange?.({ ...buttons, textColor });
  };

  const handleBorderRadiusChange = (borderRadius) => {
    onChange?.({ ...buttons, borderRadius });
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Label">
        <div className="space-y-3">
          <CardDescription className="text-sm font-medium m-0">Button default label</CardDescription>
          <Input
            value={buttons.defaultLabel || "Next"}
            onChange={handleLabelChange}
            placeholder="Next"
            className="w-full rounded-xl"
          />
        </div>
      </SectionCard>

      <SectionCard title="Color">
        <FormRow label="Button fill color">
          <ColorPickerField
            value={buttons.fillColor || "#212121"}
            onChange={handleFillColorChange}
          />
        </FormRow>
        <FormRow label="Button text color">
          <ColorPickerField
            value={buttons.textColor || "#FFFFFF"}
            onChange={handleTextColorChange}
          />
        </FormRow>
      </SectionCard>

      <SectionCard title="Style">
        <FormRow label="Button shape">
          <BorderRadiusSelector
            value={buttons.borderRadius || "8px"}
            onChange={handleBorderRadiusChange}
          />
        </FormRow>
        <div className="pt-3">
          <CardDescription className="text-xs uppercase tracking-wider mb-2 font-medium text-muted-foreground">Preview</CardDescription>
          <div
            className="w-full py-3.5 text-center text-sm font-semibold transition-all shadow-md"
            style={{
              backgroundColor: buttons.fillColor || "#212121",
              color: buttons.textColor || "#FFFFFF",
              borderRadius: buttons.borderRadius || "8px",
            }}
          >
            {buttons.defaultLabel || "Next"}
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default ButtonTabV2;
