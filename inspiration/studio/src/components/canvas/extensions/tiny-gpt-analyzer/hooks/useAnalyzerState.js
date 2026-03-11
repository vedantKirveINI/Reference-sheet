import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getAnalyzerTemplateById } from "../templates/presets";

export const useAnalyzerState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );

  const [inputText, setInputText] = useState(cloneDeep(initialData.inputText) || null);
  const [analysisType, setAnalysisType] = useState(initialData.analysisType || "sentiment");
  const [outputFormat, setOutputFormat] = useState((initialData.outputFormat?.blocks?.[0]?.value) || (typeof initialData.outputFormat === 'string' ? initialData.outputFormat : null) || "structured");
  const [customLabels, setCustomLabels] = useState(initialData.customLabels || "");
  const [additionalInstructions, setAdditionalInstructions] = useState(
    initialData.additionalInstructions || ""
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || []
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
    const template = getAnalyzerTemplateById(templateId);
    if (template) {
      setAnalysisType(template.defaults.analysisType);
      setOutputFormat(template.defaults.outputFormat);
      setOutputSchema(cloneDeep(template.outputSchema));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setInputText(null);
    setAnalysisType("sentiment");
    setOutputFormat("structured");
    setCustomLabels("");
    setAdditionalInstructions("");
    setOutputSchema([
      { key: "result", type: "string", description: "Analysis result" },
      { key: "confidence", type: "number", description: "Confidence score" },
    ]);
  }, []);

  const updateInputText = useCallback((blocks) => {
    setInputText({ type: "fx", blocks });
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};

    const hasInput = inputText?.blocks?.length > 0;
    const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;

    if (!hasInput) {
      errors.inputText = "Provide the text to analyze";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [inputText, outputSchema]);

  const getData = useCallback(() => {
    const template = selectedTemplateId ? getAnalyzerTemplateById(selectedTemplateId) : null;
    const formattedSchema = outputSchema.map(field => ({
      ...field,
      value: field.value || { type: "fx", blocks: [{ type: "PRIMITIVES", value: field.defaultValue || "" }] },
      valueStr: field.valueStr || field.defaultValue || "",
    }));
    return {
      templateId: selectedTemplateId,
      isFromScratch,
      inputText,
      analysisType,
      outputFormat,
      customLabels,
      additionalInstructions,
      outputSchema,
      persona: template?.role || {
        type: "fx",
        blocks: [{ type: "text", value: `You are an expert ${analysisType} analyst. Analyze the provided text accurately.` }],
      },
      query: template?.task || {
        type: "fx",
        blocks: [{ type: "text", value: "Analyze the following text:\n\n" }],
      },
      format: formattedSchema,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    inputText,
    analysisType,
    outputFormat,
    customLabels,
    additionalInstructions,
    outputSchema,
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
    inputText,
    analysisType,
    outputFormat,
    customLabels,
    additionalInstructions,
    outputSchema,
    validation,
    selectTemplate,
    startFromScratch,
    updateInputText,
    setAnalysisType,
    setOutputFormat,
    setCustomLabels,
    setAdditionalInstructions,
    setOutputSchema,
    getData,
    getError,
  };
};
