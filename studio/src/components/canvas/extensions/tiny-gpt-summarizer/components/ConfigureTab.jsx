import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SUMMARY_STYLE_OPTIONS, LENGTH_OPTIONS } from "../constants";
import { getSummarizerTemplateById } from "../templates/presets";

const OptionButton = ({ option, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option.id)}
    className={cn(
      "flex flex-col items-start p-3 rounded-xl transition-all duration-200 text-left",
      "border",
      isSelected
        ? "border-gray-700 bg-gray-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    )}
  >
    <span className="text-sm font-medium text-gray-900">{option.label}</span>
    <span className="text-xs text-gray-500">{option.description}</span>
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

const ConfigureTab = ({
  state,
  variables,
}) => {
  const {
    selectedTemplateId,
    inputText,
    summaryStyle,
    length,
    customLength,
    focusAreas,
    additionalInstructions,
    validation,
    updateInputText,
    setSummaryStyle,
    setLength,
    setCustomLength,
    setFocusAreas,
    setAdditionalInstructions,
  } = state;

  const template = selectedTemplateId ? getSummarizerTemplateById(selectedTemplateId) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {template && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
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
          title="Content to Summarize"
          description="Enter or reference the long content you want to summarize"
          required
          error={validation.errors.inputText}
        >
          <Textarea
            placeholder="Paste the article, document, or text content you want to summarize..."
            value={inputText?.blocks?.[0]?.value || ""}
            onChange={(e) => updateInputText([{ type: "text", value: e.target.value }])}
            className={cn(
              "min-h-[7.5rem] rounded-xl border-gray-300 resize-none",
              validation.errors.inputText && "border-red-400"
            )}
          />
        </FormSection>

        <FormSection
          title="Summary Style"
          description="How should the summary be formatted?"
        >
          <div className="grid grid-cols-2 gap-2">
            {SUMMARY_STYLE_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={summaryStyle === option.id}
                onSelect={setSummaryStyle}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Summary Length"
          description="How long should the summary be?"
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
          {length === "custom" && (
            <Input
              placeholder="e.g., 100 words or 3 bullet points"
              value={customLength}
              onChange={(e) => setCustomLength(e.target.value)}
              className="mt-2 h-10 rounded-xl border-gray-300"
            />
          )}
        </FormSection>

        <FormSection
          title="Focus Areas"
          description="Optional: Specific topics or aspects to emphasize"
        >
          <Input
            placeholder="e.g., Focus on financial metrics, key decisions, and action items"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
            className="h-10 rounded-xl border-gray-300"
          />
        </FormSection>

        <FormSection
          title="Additional Instructions"
          description="Any specific requirements for the summary"
        >
          <Textarea
            placeholder="e.g., Use simple language, avoid technical jargon, include dates..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            className="min-h-[5rem] rounded-xl border-gray-300 resize-none"
          />
        </FormSection>
      </div>
    </div>
  );
};

export default ConfigureTab;
