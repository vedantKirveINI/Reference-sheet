import React, { useState, useMemo, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import InputGridV3 from "@/module/input-grid-v3";
import { getTemplateById } from "../constants";

const createFxValue = (value) => ({
  type: 'fx',
  blocks: [{ type: 'PRIMITIVES', value: value || '' }],
  blockStr: value || '',
});

const extractFxValue = (fxValue) => {
  if (!fxValue) return '';
  if (typeof fxValue === 'string') return fxValue;
  return fxValue.blockStr || '';
};

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    selectedTemplateId,
    systemPrompt,
    prompt,
    outputSchema,
    temperature,
    maxTokens,
    validation,
    updateSystemPrompt,
    updatePrompt,
    updateOutputSchema,
    setTemperature,
    setMaxTokens,
  } = state;

  // Normalize type names: lowercase (from templates) to capitalized (for InputGridV3)
  const normalizeType = (type) => {
    if (!type) return "String";
    const typeMap = {
      'string': 'String',
      'number': 'Number',
      'int': 'Int',
      'boolean': 'Boolean',
      'object': 'Object',
      'array': 'Array',
    };
    return typeMap[type.toLowerCase()] || type;
  };

  // Use ref to track if initial value has been set with actual data - prevents feedback loop
  const initialGridValueRef = useRef(null);
  const initialGridValue = useMemo(() => {
    // Only return cached value if we already have data cached
    if (initialGridValueRef.current !== null && initialGridValueRef.current.length > 0) {
      return initialGridValueRef.current;
    }
    
    // Don't cache empty - wait for actual data
    if (!outputSchema || outputSchema.length === 0) {
      return [];
    }
    
    const value = outputSchema.map((item) => ({
      id: item.id || item._id || `field-${Date.now()}-${Math.random()}`,
      key: item.key || item.label || "",
      type: normalizeType(item.type),
      isValueMode: false,
      isMap: false,
      default: createFxValue(item.defaultValue || item.example || ""),
    }));
    
    // Only cache when we have actual data
    initialGridValueRef.current = value;
    return value;
  }, [outputSchema]);

  const handleGridDataChange = useCallback((data) => {
    let fields = [];
    if (Array.isArray(data)) {
      if (data.length === 1 && (data[0].type === 'Object' || data[0].type === 'Array')) {
        fields = data[0].schema || data[0].value || [];
      } else {
        fields = data;
      }
    } else {
      fields = data?.schema || data?.value || [];
    }
    
    const newSchema = fields.map((field) => ({
      id: field.id,
      key: field.key || "",
      type: field.type || "String",
      defaultValue: extractFxValue(field.default) || extractFxValue(field.value) || "",
    }));
    updateOutputSchema(newSchema);
  }, [updateOutputSchema]);

  const template = selectedTemplateId ? getTemplateById(selectedTemplateId) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {template && (
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: template.iconBg }}
            >
              <span className="text-white text-lg">✨</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">{template.description}</p>
            </div>
          </div>
        )}

        <FormSection
          title="System Prompt / Persona"
          description="Define who the AI should be and how it should behave"
          required
          error={validation.errors.systemPrompt}
        >
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="e.g., You are a senior business consultant..."
            defaultInputContent={systemPrompt?.blocks || []}
            onInputContentChanged={(blocks) => updateSystemPrompt(blocks)}
            slotProps={{
              container: {
                className: cn(
                  "min-h-[88px] rounded-xl border border-gray-300 bg-white",
                  validation.errors.systemPrompt && "border-red-400"
                ),
              },
            }}
          />
        </FormSection>

        <FormSection
          title="User Prompt / Query"
          description="What should the AI do? Use {{data}} to insert variables"
          required
          error={validation.errors.prompt}
        >
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="e.g., Provide strategic recommendations for..."
            defaultInputContent={prompt?.blocks || []}
            onInputContentChanged={(blocks) => updatePrompt(blocks)}
            slotProps={{
              container: {
                className: cn(
                  "min-h-[88px] rounded-xl border border-gray-300 bg-white",
                  validation.errors.prompt && "border-red-400"
                ),
              },
            }}
          />
        </FormSection>

        <FormSection
          title="Output Schema"
          description="Define what fields the AI should return"
          required
          error={validation.errors.output}
        >
          <div className={cn(
            validation.errors.output && "ring-1 ring-red-400 rounded-xl"
          )}>
            <InputGridV3
              initialValue={initialGridValue}
              onGridDataChange={handleGridDataChange}
              readOnly={false}
              hideColumnType={false}
              allowQuestionDataType={false}
            />
          </div>
        </FormSection>

        <div className="border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings2 size={16} />
            Advanced Settings
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-xl">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-700">Temperature</Label>
                  <span className="text-sm font-medium text-gray-900">{temperature}</span>
                </div>
                <Slider
                  value={[temperature]}
                  onValueChange={([val]) => setTemperature(val)}
                  min={0}
                  max={2}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-gray-700">Max Tokens</Label>
                  <span className="text-sm font-medium text-gray-900">{maxTokens}</span>
                </div>
                <Slider
                  value={[maxTokens]}
                  onValueChange={([val]) => setMaxTokens(val)}
                  min={256}
                  max={4096}
                  step={256}
                  className="w-full"
                />
                <p className="text-xs text-gray-400">
                  Maximum length of the AI response
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigureTab;
