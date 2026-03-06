import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getSummarizerTemplateById } from "../templates/presets";

export const useSummarizerState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );

  const [inputText, setInputText] = useState(cloneDeep(initialData.inputText) || null);
  const [summaryStyle, setSummaryStyle] = useState(initialData.summaryStyle || "key-points");
  const [length, setLength] = useState(initialData.length || "standard");
  const [customLength, setCustomLength] = useState(initialData.customLength || "");
  const [focusAreas, setFocusAreas] = useState(initialData.focusAreas || "");
  const [additionalInstructions, setAdditionalInstructions] = useState(
    initialData.additionalInstructions || ""
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || []
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
    const template = getSummarizerTemplateById(templateId);
    if (template) {
      setSummaryStyle(template.defaults.summaryStyle);
      setLength(template.defaults.length);
      setOutputSchema(cloneDeep(template.outputSchema));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setInputText(null);
    setSummaryStyle("key-points");
    setLength("standard");
    setCustomLength("");
    setFocusAreas("");
    setAdditionalInstructions("");
    setOutputSchema([
      { key: "summary", type: "string", description: "Generated summary" },
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
      errors.inputText = "Provide the content to summarize";
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
    const template = selectedTemplateId ? getSummarizerTemplateById(selectedTemplateId) : null;

    return {
      templateId: selectedTemplateId,
      isFromScratch,
      inputText,
      summaryStyle,
      length: length === "custom" ? customLength : length,
      focusAreas,
      additionalInstructions,
      outputSchema,
      persona: template?.role || {
        type: "fx",
        blocks: [{ type: "text", value: `You are an expert summarizer. Create ${summaryStyle} summaries that are clear and concise.` }],
      },
      query: template?.task || {
        type: "fx",
        blocks: [{ type: "text", value: "Summarize the following content:\n\n" }],
      },
      format: outputSchema,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    inputText,
    summaryStyle,
    length,
    customLength,
    focusAreas,
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
    summaryStyle,
    length,
    customLength,
    focusAreas,
    additionalInstructions,
    outputSchema,
    validation,
    selectTemplate,
    startFromScratch,
    updateInputText,
    setSummaryStyle,
    setLength,
    setCustomLength,
    setFocusAreas,
    setAdditionalInstructions,
    setOutputSchema,
    getData,
    getError,
  };
};
