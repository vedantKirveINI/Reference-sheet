import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";

export const useGPTState = (initialData = {}, templates = []) => {
  const isNewNode = !initialData.templateId && !initialData._templateId && !initialData.isFromScratch && !initialData._isFromScratch;
  const [name, setName] = useState(initialData.name || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || initialData._templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || initialData._isFromScratch || isNewNode
  );
  const [systemPrompt, setSystemPrompt] = useState(
    cloneDeep(initialData.persona || initialData.systemPrompt) || null
  );
  const [prompt, setPrompt] = useState(
    cloneDeep(initialData.query || initialData.prompt) || null
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
  const [outputFormat, setOutputFormat] = useState(
    (initialData.outputFormat?.blocks?.[0]?.value) || (typeof initialData.outputFormat === 'string' ? initialData.outputFormat : null) || "text"
  );
  const [temperature, setTemperature] = useState(
    initialData.temperature ?? 0.7
  );
  const [maxTokens, setMaxTokens] = useState(initialData.maxTokens ?? 1024);

  const getTemplateById = useCallback(
    (id) => templates.find((t) => t.id === id),
    [templates]
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setSystemPrompt(null);
    setPrompt(null);
    setOutputSchema([
      { id: "field-default", key: "response", type: "string", required: true },
    ]);
    setOutputFormat("text");
    setTemperature(0.7);
    setMaxTokens(1024);
  }, []);

  const applySelectedTemplate = useCallback(() => {
    if (selectedTemplateId) {
      const template = getTemplateById(selectedTemplateId);
      if (template?.defaults) {
        if (template.defaults.systemPrompt) {
          setSystemPrompt({
            type: "fx",
            blocks: [{ type: "text", value: template.defaults.systemPrompt }],
          });
        }
        if (template.defaults.prompt) {
          setPrompt({
            type: "fx",
            blocks: [{ type: "text", value: template.defaults.prompt }],
          });
        }
        if (template.defaults.outputSchema) {
          setOutputSchema(cloneDeep(template.defaults.outputSchema));
        }
        if (template.defaults.outputFormat) {
          setOutputFormat(template.defaults.outputFormat);
        }
      }
    }
  }, [selectedTemplateId, getTemplateById]);

  const updateSystemPrompt = useCallback((blocks) => {
    setSystemPrompt({ type: "fx", blocks });
  }, []);

  const updatePrompt = useCallback((blocks) => {
    setPrompt({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema(schema);
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};

    const hasSystemPrompt = systemPrompt?.blocks?.length > 0;
    const hasPrompt = prompt?.blocks?.length > 0;
    const hasOutput =
      outputSchema.length > 0 &&
      outputSchema.some((field) => field.key?.trim());

    if (!hasSystemPrompt) {
      errors.systemPrompt = "Define a system prompt or persona";
    }
    if (!hasPrompt) {
      errors.prompt = "Provide a prompt or task";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [systemPrompt, prompt, outputSchema]);

  const getData = useCallback(() => {
    const formattedSchema = outputSchema.map(field => ({
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
      outputFormat,
      format: formattedSchema,
      temperature,
      maxTokens,
      _templateId: selectedTemplateId,
      _isFromScratch: isFromScratch,
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
    selectTemplate,
    startFromScratch,
    applySelectedTemplate,
    updateSystemPrompt,
    updatePrompt,
    setOutputFormat,
    updateOutputSchema,
    setTemperature,
    setMaxTokens,
    getData,
    getError,
  };
};

export default useGPTState;
