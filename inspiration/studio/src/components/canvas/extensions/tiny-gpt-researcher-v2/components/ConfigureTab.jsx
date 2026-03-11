import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RESEARCH_DEPTH_OPTIONS,
  OUTPUT_FORMAT_OPTIONS,
  SOURCE_OPTIONS,
  FACT_CHECK_OPTIONS,
} from "../constants";

const OptionCard = ({ option, isSelected, onSelect }) => {
  const IconComponent = option.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "flex flex-col items-center p-3 rounded-xl transition-all duration-200 text-center w-full",
        "border",
        isSelected
          ? "border-violet-600 bg-violet-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      {IconComponent && (
        <IconComponent
          size={20}
          className={cn(
            "mb-2",
            isSelected ? "text-violet-600" : "text-gray-500"
          )}
        />
      )}
      <span className={cn(
        "text-sm font-medium",
        isSelected ? "text-violet-900" : "text-gray-900"
      )}>
        {option.label}
      </span>
      <span className="text-xs text-gray-500 mt-0.5">{option.description}</span>
    </button>
  );
};

const SourceCheckbox = ({ source, isSelected, onToggle }) => (
  <label
    className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
      isSelected
        ? "border-violet-600 bg-violet-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    )}
  >
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onToggle(source.id)}
      className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
    />
    <div>
      <span className="text-sm font-medium text-gray-900">{source.label}</span>
      <p className="text-xs text-gray-500">{source.description}</p>
    </div>
  </label>
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
  onContinue,
}) => {
  const {
    topic,
    researchDepth,
    outputFormat,
    selectedSources,
    factCheckLevel,
    additionalContext,
    validation,
    updateTopic,
    setResearchDepth,
    setOutputFormat,
    toggleSource,
    setFactCheckLevel,
    setAdditionalContext,
  } = state;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <FormSection
          title="Research Topic"
          description="What would you like to research? Be specific for better results."
          required
          error={validation.errors.topic}
        >
          <Textarea
            placeholder="e.g., What are the latest trends in renewable energy adoption in Southeast Asia?"
            value={topic?.blocks?.[0]?.value || ""}
            onChange={(e) => updateTopic([{ type: "text", value: e.target.value }])}
            className={cn(
              "min-h-[6.25rem] rounded-xl border-gray-300 resize-none",
              validation.errors.topic && "border-red-400"
            )}
          />
        </FormSection>

        <FormSection
          title="Research Depth"
          description="How thorough should the research be?"
        >
          <div className="grid grid-cols-3 gap-2">
            {RESEARCH_DEPTH_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={researchDepth === option.id}
                onSelect={setResearchDepth}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Source Types"
          description="Select which sources to include in the research"
          required
          error={validation.errors.sources}
        >
          <div className="space-y-2">
            {SOURCE_OPTIONS.map((source) => (
              <SourceCheckbox
                key={source.id}
                source={source}
                isSelected={selectedSources.includes(source.id)}
                onToggle={toggleSource}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Output Format"
          description="How should the research be presented?"
        >
          <div className="grid grid-cols-3 gap-2">
            {OUTPUT_FORMAT_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={outputFormat === option.id}
                onSelect={setOutputFormat}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Fact-Check Level"
          description="How rigorously should information be verified?"
        >
          <div className="grid grid-cols-3 gap-2">
            {FACT_CHECK_OPTIONS.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={factCheckLevel === option.id}
                onSelect={setFactCheckLevel}
              />
            ))}
          </div>
        </FormSection>

        <FormSection
          title="Additional Context"
          description="Any specific requirements, focus areas, or constraints"
        >
          <Textarea
            placeholder="e.g., Focus on data from the last 5 years, exclude opinion pieces..."
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
