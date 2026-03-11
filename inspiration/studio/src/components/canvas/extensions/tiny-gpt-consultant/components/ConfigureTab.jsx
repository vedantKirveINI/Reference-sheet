import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONSULTATION_TYPE_OPTIONS, OUTPUT_FORMAT_OPTIONS } from "../constants";
import { getConsultantTemplateById } from "../templates/presets";
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
    context,
    consultationType,
    outputFormat,
    additionalRequirements,
    validation,
    updateContext,
    setConsultationType,
    setOutputFormat,
    setAdditionalRequirements,
  } = state;

  const template = selectedTemplateId ? getConsultantTemplateById(selectedTemplateId) : null;

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
          title="Context or Situation"
          description="Describe the situation, problem, or topic you need advice on"
          required
          error={validation.errors.context}
        >
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="e.g., We're a B2B SaaS startup considering expanding into the enterprise market. Our current ARR is $2M with 50 SMB customers..."
            defaultInputContent={context?.blocks || []}
            onInputContentChanged={(blocks) => updateContext(blocks)}
            slotProps={{
              container: {
                className: cn(
                  "min-h-[100px] rounded-xl border border-gray-300 bg-white",
                  validation.errors.context && "border-red-400"
                ),
              },
            }}
          />
        </FormSection>

        <FormSection
          title="Consultation Type"
          description="What kind of advice are you looking for?"
        >
          <div className="grid grid-cols-2 gap-2">
            {CONSULTATION_TYPE_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={consultationType === option.id}
                onSelect={setConsultationType}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Output Format"
          description="How should the advice be structured?"
        >
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_FORMAT_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={outputFormat === option.id}
                onSelect={setOutputFormat}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Additional Requirements"
          description="Any specific constraints, preferences, or context to consider"
        >
          <Textarea
            placeholder="e.g., Budget is limited to $500K, need to see results within 6 months, focus on low-risk options..."
            value={additionalRequirements}
            onChange={(e) => setAdditionalRequirements(e.target.value)}
            className="min-h-[80px] rounded-xl border-gray-300 resize-none"
          />
        </FormSection>
      </div>
    </div>
  );
};

export default ConfigureTab;
