import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardDescription } from "@/components/ui/card";
import SectionCard from "../components/SectionCard";
import FormRow from "../components/FormRow";
import SizeSelector from "../components/SizeSelector";
import AlignmentSelector from "../components/AlignmentSelector";
import ColorPickerField from "../components/ColorPickerField";

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Archivo", label: "Archivo" },
  { value: "Radio Canada Big", label: "Radio Canada Big" },
  { value: "Noto Serif", label: "Noto Serif" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Merriweather", label: "Merriweather" },
];

const FontTabV2 = ({ fonts = {}, onChange }) => {
  const handleStyleChange = (style) => {
    onChange?.({ ...fonts, style });
  };

  const handleQuestionColorChange = (questionColor) => {
    onChange?.({ ...fonts, questionColor });
  };

  const handleAnswerColorChange = (answerColor) => {
    onChange?.({ ...fonts, answerColor });
  };

  const handleSizeChange = (size) => {
    onChange?.({ ...fonts, size });
  };

  const handleAlignmentChange = (alignment) => {
    onChange?.({ ...fonts, alignment });
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Font">
        <div className="space-y-3">
          <CardDescription className="text-sm font-medium m-0">Font Style</CardDescription>
          <Select value={fonts.style || "Inter"} onValueChange={handleStyleChange}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {FONT_OPTIONS.map((font) => (
                <SelectItem key={font.value} value={font.value} className="rounded-lg">
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </SectionCard>

      <SectionCard title="Color">
        <FormRow label="Question font color">
          <ColorPickerField
            value={fonts.questionColor || "#212121"}
            onChange={handleQuestionColorChange}
          />
        </FormRow>
        <FormRow label="Answer font color">
          <ColorPickerField
            value={fonts.answerColor || "#212121"}
            onChange={handleAnswerColorChange}
          />
        </FormRow>
      </SectionCard>

      <SectionCard title="Size and Positioning">
        <FormRow label="Font Size">
          <SizeSelector value={fonts.size || "M"} onChange={handleSizeChange} />
        </FormRow>
        <FormRow label="Text Alignment">
          <AlignmentSelector
            value={fonts.alignment || "left"}
            onChange={handleAlignmentChange}
          />
        </FormRow>
      </SectionCard>
    </div>
  );
};

export default FontTabV2;
