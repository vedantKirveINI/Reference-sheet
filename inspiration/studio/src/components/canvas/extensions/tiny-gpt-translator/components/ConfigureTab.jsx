import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TONE_OPTIONS, LANGUAGE_OPTIONS, TARGET_LANGUAGE_OPTIONS } from "../constants";
import { getTranslatorTemplateById } from "../templates/presets";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";

const OptionButton = ({ option, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(option.id)}
    className={cn(
      "flex flex-col items-start p-3 rounded-xl transition-all duration-200 text-left",
      "border",
      isSelected
        ? "border-[#0EA5E9] bg-sky-50"
        : "border-gray-200 bg-white hover:border-gray-300"
    )}
  >
    <span className="text-sm font-medium text-gray-900">{option.label}</span>
    {option.description && (
      <span className="text-xs text-gray-500">{option.description}</span>
    )}
  </button>
);

const LanguageSelect = ({ value, onChange, options, label }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-10 px-3 rounded-xl border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
  >
    {options.map((option) => (
      <option key={option.id} value={option.id}>
        {option.label}
      </option>
    ))}
  </select>
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
    inputText,
    sourceLanguage,
    targetLanguage,
    tone,
    additionalInstructions,
    validation,
    updateInputText,
    setSourceLanguage,
    setTargetLanguage,
    setTone,
    setAdditionalInstructions,
  } = state;

  const template = selectedTemplateId ? getTranslatorTemplateById(selectedTemplateId) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {template && (
          <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-xl">
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
          title="Text to Translate"
          description="Enter the text you want to translate or reference data from previous steps"
          required
          error={validation.errors.inputText}
        >
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="Enter text to translate or use {{variable}} to reference previous data..."
            defaultInputContent={inputText?.blocks || []}
            onInputContentChanged={(blocks) => updateInputText(blocks)}
            slotProps={{
              container: {
                className: cn(
                  "min-h-[100px] rounded-xl border border-gray-300 bg-white",
                  validation.errors.inputText && "border-red-400"
                ),
              },
            }}
          />
        </FormSection>

        <div className="grid grid-cols-2 gap-4">
          <FormSection
            title="Source Language"
            description="Detect automatically or select"
          >
            <LanguageSelect
              value={sourceLanguage}
              onChange={setSourceLanguage}
              options={LANGUAGE_OPTIONS}
            />
          </FormSection>

          <FormSection
            title="Target Language"
            description="Translate to"
            required
            error={validation.errors.targetLanguage}
          >
            <LanguageSelect
              value={targetLanguage}
              onChange={setTargetLanguage}
              options={TARGET_LANGUAGE_OPTIONS}
            />
          </FormSection>
        </div>

        <FormSection
          title="Translation Tone"
          description="How should the translation sound?"
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
          description="Any specific requirements or context for the translation"
        >
          <Textarea
            placeholder="e.g., Preserve brand names, use industry-specific terminology..."
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
