import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { TINYGPT_TEMPLATES, getTemplateById } from "../constants";

export const useTinyGPTState = (initialData = {}) => {
  const [name, setName] = useState(initialData.name || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || initialData._isFromScratch || false
  );
  const [systemPrompt, setSystemPrompt] = useState(
    cloneDeep(initialData.persona || initialData.systemPrompt) || null
  );
  const [prompt, setPrompt] = useState(
    cloneDeep(initialData.query || initialData.prompt) || null
  );
  const [outputFormat, setOutputFormat] = useState(
    (initialData.outputFormat?.blocks?.[0]?.value) || (typeof initialData.outputFormat === 'string' ? initialData.outputFormat : null) || "text"
  );
  const [outputSchema, setOutputSchema] = useState(() => {
    const fromWrapped = initialData.format?.[0]?.schema;
    const fromFlat = Array.isArray(initialData.format) && initialData.format.length > 0 && initialData.format[0]?.key
      ? initialData.format
      : null;
    return cloneDeep(fromWrapped || fromFlat || initialData.outputSchema) || [
      { id: "field-default", key: "response", type: "string", required: true },
    ];
  });
  const [temperature, setTemperature] = useState(
    initialData.temperature ?? 0.7
  );
  const [maxTokens, setMaxTokens] = useState(initialData.maxTokens ?? 1024);

  const [touched, setTouched] = useState({
    systemPrompt: false,
    prompt: false,
    output: false,
  });

  const markFieldTouched = useCallback((fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  const markAllTouched = useCallback(() => {
    setTouched({
      systemPrompt: true,
      prompt: true,
      output: true,
    });
  }, []);

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setSystemPrompt(null);
    setPrompt(null);
    setOutputFormat("text");
    setOutputSchema([
      { id: "field-default", key: "response", type: "string", required: true },
    ]);
    setTemperature(0.7);
    setMaxTokens(1024);
    setTouched({
      systemPrompt: false,
      prompt: false,
      output: false,
    });
  }, []);

  const applySelectedTemplate = useCallback((templateIdOverride) => {
    const targetId = templateIdOverride || selectedTemplateId;
    if (targetId) {
      const template = getTemplateById(targetId);
      if (template?.defaults) {
        if (template.defaults.systemPrompt) {
          setSystemPrompt({
            type: "fx",
            blocks: [{ type: "PRIMITIVES", value: template.defaults.systemPrompt }],
          });
        }
        if (template.defaults.prompt) {
          setPrompt({
            type: "fx",
            blocks: [{ type: "PRIMITIVES", value: template.defaults.prompt }],
          });
        }
        if (template.defaults.outputFormat) {
          setOutputFormat(template.defaults.outputFormat);
        } else {
          setOutputFormat("text");
        }
        if (template.defaults.outputSchema) {
          setOutputSchema(cloneDeep(template.defaults.outputSchema));
        }
      }
    }
  }, [selectedTemplateId]);

  const updateSystemPrompt = useCallback((blocks) => {
    setSystemPrompt({ type: "fx", blocks });
  }, []);

  const updatePrompt = useCallback((blocks) => {
    setPrompt({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema(schema);
  }, []);

  const handleSetOutputFormat = useCallback((format) => {
    setOutputFormat(format);
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    const touchedErrors = {};

    const hasSystemPrompt = systemPrompt?.blocks?.length > 0;
    const hasPrompt = prompt?.blocks?.length > 0;
    const hasAnyOutputField = outputSchema.length > 0;
    const hasValidOutputField = outputSchema.some((field) => field.key?.trim());
    const hasOutput = outputFormat === "text" || hasValidOutputField;

    if (!hasSystemPrompt) {
      errors.systemPrompt = "Tell the AI how to behave";
      if (touched.systemPrompt) {
        touchedErrors.systemPrompt = errors.systemPrompt;
      }
    }
    if (!hasPrompt) {
      errors.prompt = "Provide instructions for the AI";
      if (touched.prompt) {
        touchedErrors.prompt = errors.prompt;
      }
    }
    if (outputFormat === "json" && !hasOutput) {
      if (hasAnyOutputField && !hasValidOutputField) {
        errors.output = "Enter a name for each output field";
      } else {
        errors.output = "Define at least one output field";
      }
      if (touched.output) {
        touchedErrors.output = errors.output;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      touchedErrors,
    };
  }, [systemPrompt, prompt, outputFormat, outputSchema, touched]);

  const getData = useCallback(() => {
    const plainTextFormat = [{
      id: "field-response",
      key: "response",
      type: "String",
      defaultValue: "",
      value: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      valueStr: "",
    }];
    const formattedSchema = outputFormat === "text"
      ? plainTextFormat
      : outputSchema.map(field => ({
          ...field,
          value: field.value || { type: "fx", blocks: [{ type: "PRIMITIVES", value: field.defaultValue || "" }] },
          valueStr: field.valueStr || field.defaultValue || "",
        }));
    return {
      name,
      templateId: selectedTemplateId,
      isFromScratch,
      persona: systemPrompt,
      query: prompt,
      outputFormat: outputFormat === "text" ? "json" : outputFormat,
      format: formattedSchema,
      temperature,
      maxTokens,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
      _originalOutputFormat: outputFormat,
    };
  }, [
    name,
    selectedTemplateId,
    isFromScratch,
    systemPrompt,
    prompt,
    outputFormat,
    outputSchema,
    temperature,
    maxTokens,
  ]);

  const getError = useCallback(() => {
    if (!validation.isValid) {
      return { 1: ["Please fill all required fields"] };
    }
    return { 1: [] };
  }, [validation]);

  return {
    name,
    setName,
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    systemPrompt,
    prompt,
    outputFormat,
    outputSchema,
    temperature,
    maxTokens,
    validation,
    touched,
    selectTemplate,
    startFromScratch,
    applySelectedTemplate,
    updateSystemPrompt,
    updatePrompt,
    setOutputFormat: handleSetOutputFormat,
    updateOutputSchema,
    setTemperature,
    setMaxTokens,
    markFieldTouched,
    markAllTouched,
    getData,
    getError,
  };
};

export default useTinyGPTState;
