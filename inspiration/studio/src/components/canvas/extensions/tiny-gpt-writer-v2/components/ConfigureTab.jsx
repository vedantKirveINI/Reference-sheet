import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TONE_OPTIONS, LENGTH_OPTIONS } from "../constants";
import { getWriterTemplateById } from "../templates/presets";

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
    topic,
    tone,
    length,
    customLength,
    audience,
    keywords,
    additionalInstructions,
    validation,
    updateTopic,
    setTone,
    setLength,
    setCustomLength,
    setAudience,
    setKeywords,
    setAdditionalInstructions,
  } = state;

  const template = selectedTemplateId ? getWriterTemplateById(selectedTemplateId) : null;

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
          title="What do you want to write about?"
          description="Describe your topic, key points, or paste content to transform"
          required
          error={validation.errors.topic}
        >
          <Textarea
            placeholder="e.g., Write a blog post about the benefits of remote work for software teams..."
            value={topic?.blocks?.[0]?.value || ""}
            onChange={(e) => updateTopic([{ type: "text", value: e.target.value }])}
            className={cn(
              "min-h-[6.25rem] rounded-xl border-gray-300 resize-none",
              validation.errors.topic && "border-red-400"
            )}
          />
        </FormSection>

        <FormSection
          title="Tone"
          description="How should the content sound?"
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
          {length === "custom" && (
            <Input
              placeholder="e.g., 750 words or 3 paragraphs"
              value={customLength}
              onChange={(e) => setCustomLength(e.target.value)}
              className="mt-2 h-10 rounded-xl border-gray-300"
            />
          )}
        </FormSection>

        <FormSection
          title="Target Audience"
          description="Who is this content for?"
          required
          error={validation.errors.audience}
        >
          <Input
            placeholder="e.g., Marketing managers at tech startups"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className={cn(
              "h-10 rounded-xl border-gray-300",
              validation.errors.audience && "border-red-400"
            )}
          />
        </FormSection>

        <FormSection
          title="Keywords"
          description="Optional SEO keywords or phrases to include (comma-separated)"
        >
          <Input
            placeholder="e.g., remote work, productivity, team collaboration"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="h-10 rounded-xl border-gray-300"
          />
        </FormSection>

        <FormSection
          title="Additional Instructions"
          description="Any specific requirements or style notes"
        >
          <Textarea
            placeholder="e.g., Include statistics, avoid jargon, add a call-to-action at the end..."
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
