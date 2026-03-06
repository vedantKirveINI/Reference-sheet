import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ANALYSIS_TYPE_OPTIONS, OUTPUT_FORMAT_OPTIONS } from "../constants";
import { getAnalyzerTemplateById } from "../templates/presets";

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
    analysisType,
    outputFormat,
    customLabels,
    additionalInstructions,
    validation,
    updateInputText,
    setAnalysisType,
    setOutputFormat,
    setCustomLabels,
    setAdditionalInstructions,
  } = state;

  const template = selectedTemplateId ? getAnalyzerTemplateById(selectedTemplateId) : null;

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
          title="Text to Analyze"
          description="Enter or reference the text you want to analyze"
          required
          error={validation.errors.inputText}
        >
          <Textarea
            placeholder="e.g., The customer feedback was overwhelmingly positive about our new product launch..."
            value={inputText?.blocks?.[0]?.value || ""}
            onChange={(e) => updateInputText([{ type: "text", value: e.target.value }])}
            className={cn(
              "min-h-[100px] rounded-xl border-gray-300 resize-none",
              validation.errors.inputText && "border-red-400"
            )}
          />
        </FormSection>

        <FormSection
          title="Analysis Type"
          description="What kind of analysis do you want to perform?"
        >
          <div className="grid grid-cols-2 gap-2">
            {ANALYSIS_TYPE_OPTIONS.map((option) => (
              <OptionButton
                key={option.id}
                option={option}
                isSelected={analysisType === option.id}
                onSelect={setAnalysisType}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Output Format"
          description="How should the results be formatted?"
        >
          <div className="grid grid-cols-3 gap-2">
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

        {analysisType === "classification" && (
          <FormSection
            title="Custom Labels"
            description="Define custom classification labels (comma-separated)"
          >
            <Input
              placeholder="e.g., Bug Report, Feature Request, Question, Feedback"
              value={customLabels}
              onChange={(e) => setCustomLabels(e.target.value)}
              className="h-10 rounded-xl border-gray-300"
            />
          </FormSection>
        )}

        <FormSection
          title="Additional Instructions"
          description="Any specific requirements for the analysis"
        >
          <Textarea
            placeholder="e.g., Focus on customer sentiment regarding pricing, ignore neutral comments..."
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
