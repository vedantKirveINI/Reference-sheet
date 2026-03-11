import React, { useState, useMemo, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Settings2, Pencil, Sparkles, MessageSquare, FileText, LayoutList, Type } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import InputGridV3 from "@/module/input-grid-v3";
import { getTemplateById } from "../constants";
const TINYGPT_ICON_URL = "https://cdn-v1.tinycommand.com/1234567890/1770458055954/tiny%20gpt.svg";

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

const ConfigureTab = ({
  state,
  variables,
  onEditTemplate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const advancedRef = useRef(null);
  
  const {
    selectedTemplateId,
    systemPrompt,
    prompt,
    outputFormat,
    outputSchema,
    temperature,
    maxTokens,
    validation,
    updateSystemPrompt,
    updatePrompt,
    setOutputFormat,
    updateOutputSchema,
    setTemperature,
    setMaxTokens,
  } = state;

  const template = selectedTemplateId ? getTemplateById(selectedTemplateId) : null;
  const touchedErrors = validation.touchedErrors || {};

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

  const initialGridValueRef = useRef(null);
  const initialGridValue = useMemo(() => {
    if (initialGridValueRef.current !== null && initialGridValueRef.current.length > 0) {
      return initialGridValueRef.current;
    }
    
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

  return (
    <div className="space-y-6">
      {template && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
              <img src={TINYGPT_ICON_URL} alt="TinyGPT" className="w-4 h-4 brightness-0 invert" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">{template.description}</p>
            </div>
          </div>
          <button 
            onClick={onEditTemplate}
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Change
          </button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <Label className="text-sm font-medium text-gray-900">
            AI Instructions
          </Label>
        </div>
        <p className="text-xs text-gray-500 -mt-1">
          Define how the AI should behave. Think of this as giving it a role or personality.
        </p>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="e.g., You are a friendly customer support agent who speaks professionally..."
          defaultInputContent={systemPrompt?.blocks || []}
          hasError={!!touchedErrors.systemPrompt}
          onInputContentChanged={(blocks) => updateSystemPrompt(blocks)}
          slotProps={{
            container: {
              className: "min-h-[80px]",
            },
          }}
        />
        {touchedErrors.systemPrompt && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {touchedErrors.systemPrompt}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          <Label className="text-sm font-medium text-gray-900">
            Your Prompt
          </Label>
        </div>
        <p className="text-xs text-gray-500 -mt-1">
          What should the AI do? Click on the input field to add variables from previous steps.
        </p>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="e.g., Summarize the following text in 3 bullet points: {{input}}"
          defaultInputContent={prompt?.blocks || []}
          hasError={!!touchedErrors.prompt}
          onInputContentChanged={(blocks) => updatePrompt(blocks)}
          slotProps={{
            container: {
              className: "min-h-[80px]",
            },
          }}
        />
        {touchedErrors.prompt && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {touchedErrors.prompt}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutList className="w-4 h-4 text-indigo-500" />
          <Label className="text-sm font-medium text-gray-900">
            Response Format
          </Label>
        </div>
        <p className="text-xs text-gray-500 -mt-1">
          Choose how the AI should format its response.
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOutputFormat("text")}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
              outputFormat === "text"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              outputFormat === "text" ? "bg-indigo-500" : "bg-gray-100"
            )}>
              <Type className={cn(
                "w-4 h-4",
                outputFormat === "text" ? "text-white" : "text-gray-500"
              )} />
            </div>
            <div className="min-w-0">
              <p className={cn(
                "text-sm font-medium",
                outputFormat === "text" ? "text-indigo-700" : "text-gray-700"
              )}>Plain Text</p>
              <p className="text-xs text-gray-500 truncate">Simple text response</p>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setOutputFormat("json")}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all",
              outputFormat === "json"
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
              outputFormat === "json" ? "bg-indigo-500" : "bg-gray-100"
            )}>
              <LayoutList className={cn(
                "w-4 h-4",
                outputFormat === "json" ? "text-white" : "text-gray-500"
              )} />
            </div>
            <div className="min-w-0">
              <p className={cn(
                "text-sm font-medium",
                outputFormat === "json" ? "text-indigo-700" : "text-gray-700"
              )}>Structured Data</p>
              <p className="text-xs text-gray-500 truncate">Define specific fields</p>
            </div>
          </button>
        </div>
      </div>

      {outputFormat === "json" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <Label className="text-sm font-medium text-gray-900">
              Output Fields
            </Label>
          </div>
          <p className="text-xs text-gray-500 -mt-1">
            Define the fields you want the AI to return. Each field will be extracted from the response.
          </p>
          <div className={cn(
            "rounded-xl overflow-hidden border transition-colors",
            touchedErrors.output ? "border-red-300" : "border-gray-200"
          )}>
            <InputGridV3
              initialValue={initialGridValue}
              onGridDataChange={handleGridDataChange}
              readOnly={false}
              hideColumnType={false}
              allowQuestionDataType={false}
            />
          </div>
          {touchedErrors.output && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {touchedErrors.output}
            </p>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => {
            const next = !showAdvanced;
            setShowAdvanced(next);
            if (next) {
              setTimeout(() => {
                advancedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 50);
            }
          }}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          Advanced Settings
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div ref={advancedRef} className="mt-4 space-y-5 bg-gray-50 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Temperature
                </Label>
                <span className="text-sm font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {temperature}
                </span>
              </div>
              <Slider
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Lower values = more focused and consistent. Higher values = more creative and varied.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  Max Tokens
                </Label>
                <span className="text-sm font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {maxTokens}
                </span>
              </div>
              <Slider
                value={[maxTokens]}
                onValueChange={(value) => setMaxTokens(value[0])}
                min={256}
                max={4096}
                step={256}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Maximum length of the AI response. 1 token is roughly 4 characters.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigureTab;
