import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EXPLANATION_STYLE_OPTIONS, AUDIENCE_LEVEL_OPTIONS } from "../constants";
import { getLearningTemplateById } from "../templates/presets";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";

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
    explanationStyle,
    audienceLevel,
    additionalContext,
    validation,
    updateTopic,
    setExplanationStyle,
    setAudienceLevel,
    setAdditionalContext,
  } = state;

  const template = selectedTemplateId ? getLearningTemplateById(selectedTemplateId) : null;

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
          title="Topic or Concept"
          description="What do you want to explain or teach?"
          required
          error={validation.errors.topic}
        >
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="e.g., Explain how machine learning algorithms work, or teach the basics of React hooks..."
            defaultInputContent={topic?.blocks || []}
            onInputContentChanged={(blocks) => updateTopic(blocks)}
            slotProps={{
              container: {
                className: cn(
                  "min-h-[100px] rounded-xl border border-gray-300 bg-white",
                  validation.errors.topic && "border-red-400"
                ),
              },
            }}
          />
        </FormSection>

        <FormSection
          title="Explanation Style"
          description="How should the content be presented?"
        >
          <div className="grid grid-cols-2 gap-2">
            {EXPLANATION_STYLE_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={explanationStyle === option.id}
                onSelect={setExplanationStyle}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Audience Level"
          description="Who is the target audience?"
        >
          <div className="grid grid-cols-3 gap-2">
            {AUDIENCE_LEVEL_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={audienceLevel === option.id}
                onSelect={setAudienceLevel}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Additional Context"
          description="Any specific requirements or background information"
        >
          <Textarea
            placeholder="e.g., Focus on practical examples, include code snippets, avoid mathematical notation..."
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
            className="min-h-[80px] rounded-xl border-gray-300 resize-none"
          />
        </FormSection>
      </div>
    </div>
  );
};

export default ConfigureTab;
