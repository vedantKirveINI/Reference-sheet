import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getGPTV3TemplateById } from "../constants";

export const useGPTState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );
  const [systemPrompt, setSystemPrompt] = useState(
    cloneDeep(initialData.persona) || null
  );
  const [query, setQuery] = useState(cloneDeep(initialData.query) || null);
  const [outputFormat, setOutputFormat] = useState(
    (initialData.outputFormat?.blocks?.[0]?.value) || (typeof initialData.outputFormat === 'string' ? initialData.outputFormat : null) || "text"
  );
  const [outputSchema, setOutputSchema] = useState(() => {
    const fromWrapped = initialData.format?.[0]?.schema;
    const fromFlat = Array.isArray(initialData.format) && initialData.format.length > 0 && initialData.format[0]?.key
      ? initialData.format
      : null;
    return cloneDeep(fromWrapped || fromFlat) || [];
  });
  const [temperature, setTemperature] = useState(
    initialData.temperature ?? 0.7
  );
  const [maxTokens, setMaxTokens] = useState(
    initialData.maxTokens ?? 1024
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setSystemPrompt(null);
    setQuery(null);
    setOutputFormat("text");
    setOutputSchema([
      { key: "response", type: "string", description: "The AI's response" },
    ]);
    setTemperature(0.7);
    setMaxTokens(1024);
  }, []);

  const applySelectedTemplate = useCallback(() => {
    if (selectedTemplateId) {
      const template = getGPTV3TemplateById(selectedTemplateId);
      if (template) {
        setSystemPrompt(cloneDeep(template.systemPrompt));
        setQuery(cloneDeep(template.query));
        setOutputFormat(template.outputFormat);
        setOutputSchema(cloneDeep(template.outputSchema));
      }
    }
  }, [selectedTemplateId]);

  const updateSystemPrompt = useCallback((blocks) => {
    setSystemPrompt({ type: "fx", blocks });
  }, []);

  const updateQuery = useCallback((blocks) => {
    setQuery({ type: "fx", blocks });
  }, []);

  const updateOutputSchema = useCallback((schema) => {
    setOutputSchema(schema);
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    
    const hasSystemPrompt = systemPrompt?.blocks?.length > 0;
    const hasQuery = query?.blocks?.length > 0;
    const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;

    if (!hasSystemPrompt) {
      errors.systemPrompt = "Define a system prompt or persona";
    }
    if (!hasQuery) {
      errors.query = "Provide a query or task";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [systemPrompt, query, outputSchema]);

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
      templateId: selectedTemplateId,
      isFromScratch,
      persona: systemPrompt,
      query,
      outputFormat: outputFormat === "text" ? "json" : outputFormat,
      format: formattedSchema,
      temperature,
      maxTokens,
      _originalOutputFormat: outputFormat,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    systemPrompt,
    query,
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
    selectedTemplateId,
    isFromScratch,
    hasInitialised,
    systemPrompt,
    query,
    outputFormat,
    outputSchema,
    temperature,
    maxTokens,
    validation,
    selectTemplate,
    startFromScratch,
    applySelectedTemplate,
    updateSystemPrompt,
    updateQuery,
    setOutputFormat,
    updateOutputSchema,
    setTemperature,
    setMaxTokens,
    getData,
    getError,
  };
};
