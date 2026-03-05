import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getWriterTemplateById } from "../templates/presets";

export const useWriterState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );
  
  const [topic, setTopic] = useState(cloneDeep(initialData.topic) || null);
  const [tone, setTone] = useState(initialData.tone || "professional");
  const [length, setLength] = useState(initialData.length || "medium");
  const [customLength, setCustomLength] = useState(initialData.customLength || "");
  const [audience, setAudience] = useState(initialData.audience || "");
  const [keywords, setKeywords] = useState(initialData.keywords || "");
  const [additionalInstructions, setAdditionalInstructions] = useState(
    initialData.additionalInstructions || ""
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || []
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
    const template = getWriterTemplateById(templateId);
    if (template) {
      setTone(template.defaults.tone);
      setLength(template.defaults.length);
      setAudience(template.defaults.audience);
      setOutputSchema(cloneDeep(template.outputSchema));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setTopic(null);
    setTone("professional");
    setLength("medium");
    setAudience("");
    setKeywords("");
    setAdditionalInstructions("");
    setOutputSchema([
      { key: "content", type: "string", description: "Generated content" },
    ]);
  }, []);


  const updateTopic = useCallback((blocks) => {
    setTopic({ type: "fx", blocks });
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    
    const hasTopic = topic?.blocks?.length > 0;
    const hasAudience = audience.trim().length > 0;
    const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;

    if (!hasTopic) {
      errors.topic = "Tell the AI what to write about";
    }
    if (!hasAudience) {
      errors.audience = "Define your target audience";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [topic, audience, outputSchema]);

  const getData = useCallback(() => {
    const template = selectedTemplateId ? getWriterTemplateById(selectedTemplateId) : null;
    
    return {
      templateId: selectedTemplateId,
      isFromScratch,
      topic,
      tone,
      length: length === "custom" ? customLength : length,
      audience,
      keywords,
      additionalInstructions,
      outputSchema,
      persona: template?.role || {
        type: "fx",
        blocks: [{ type: "text", value: `You are a professional content writer. Write in a ${tone} tone for ${audience}.` }],
      },
      query: template?.task || {
        type: "fx",
        blocks: [{ type: "text", value: "Write content about the following topic:\n\n" }],
      },
      format: outputSchema,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    topic,
    tone,
    length,
    customLength,
    audience,
    keywords,
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
    topic,
    tone,
    length,
    customLength,
    audience,
    keywords,
    additionalInstructions,
    outputSchema,
    validation,
    selectTemplate,
    startFromScratch,
    updateTopic,
    setTone,
    setLength,
    setCustomLength,
    setAudience,
    setKeywords,
    setAdditionalInstructions,
    setOutputSchema,
    getData,
    getError,
  };
};
