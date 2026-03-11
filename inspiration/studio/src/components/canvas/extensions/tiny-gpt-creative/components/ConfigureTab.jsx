import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STYLE_OPTIONS, LENGTH_OPTIONS, TONE_OPTIONS } from "../constants";
import { getCreativeTemplateById } from "../templates/presets";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";

const OptionButton = ({ option, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option.id)}
    className={cn(
      "flex flex-col items-start p-3 rounded-xl transition-all duration-200 text-left",
      "border",
      isSelected
        ? "border-[#F472B6] bg-pink-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    )}
  >
    <span className="text-sm font-medium text-gray-900">{option.label}</span>
    {option.description && (
      <span className="text-xs text-gray-500">{option.description}</span>
    )}
  </button>
);

const FormSection = ({ title, description, required, error, children }) => (
  <div className="space-y-2">
    <div>
      <Label className="text-sm font-medium text-gray-900">
        {title}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const ConfigureTab = ({ state, variables }) => {
  const {
    selectedTemplateId,
    prompt,
    style,
    length,
    tone,
    additionalInstructions,
    validation,
    updatePrompt,
    setStyle,
    setLength,
    setTone,
    setAdditionalInstructions,
  } = state;

  const template = selectedTemplateId ? getCreativeTemplateById(selectedTemplateId) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {template && (
          <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: template.iconBg }}
            >
              <template.icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">{template.description}</p>
            </div>
          </div>
        )}

        <FormSection
          title="What do you want to create?"
          description="Describe your topic, theme, or idea for the creative content"
          required
          error={validation.errors.prompt}
        >
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="e.g., A short story about a robot learning to love, or marketing copy for an eco-friendly water bottle..."
            defaultInputContent={prompt?.blocks || []}
            onInputContentChanged={(blocks) => updatePrompt(blocks)}
            slotProps={{
              container: {
                className: cn(
                  "min-h-[100px] rounded-xl border border-gray-300 bg-white",
                  validation.errors.prompt && "border-red-400"
                ),
              },
            }}
          />
        </FormSection>

        <FormSection
          title="Style"
          description="How should the content be written?"
        >
          <div className="grid grid-cols-2 gap-2">
            {STYLE_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={style === option.id}
                onSelect={setStyle}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Length"
          description="How long should the content be?"
        >
          <div className="grid grid-cols-2 gap-2">
            {LENGTH_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={length === option.id}
                onSelect={setLength}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Tone"
          description="What feeling should the content evoke?"
        >
          <div className="grid grid-cols-2 gap-2">
            {TONE_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={tone === option.id}
                onSelect={setTone}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Additional Instructions"
          description="Any specific requirements or creative direction"
        >
          <Textarea
            placeholder="e.g., Include a plot twist, use alliteration, maintain a specific brand voice..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            className="min-h-[80px] rounded-xl border-gray-300 resize-none"
          />
        </FormSection>
      </div>
    </div>
  );
};

export default ConfigureTab;
