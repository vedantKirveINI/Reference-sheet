import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getLearningTemplateById } from "../templates/presets";

export const useLearningState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );
  
  const [topic, setTopic] = useState(cloneDeep(initialData.topic) || null);
  const [explanationStyle, setExplanationStyle] = useState(initialData.explanationStyle || "simple");
  const [audienceLevel, setAudienceLevel] = useState(initialData.audienceLevel || "beginner");
  const [additionalContext, setAdditionalContext] = useState(initialData.additionalContext || "");
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || []
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
    const template = getLearningTemplateById(templateId);
    if (template) {
      setExplanationStyle(template.defaults.explanationStyle);
      setAudienceLevel(template.defaults.audienceLevel);
      setOutputSchema(cloneDeep(template.outputSchema));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setTopic(null);
    setExplanationStyle("simple");
    setAudienceLevel("beginner");
    setAdditionalContext("");
    setOutputSchema([
      { key: "content", type: "string", description: "Educational content" },
    ]);
  }, []);

  const updateTopic = useCallback((blocks) => {
    setTopic({ type: "fx", blocks });
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    
    const hasTopic = topic?.blocks?.length > 0;
    const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;

    if (!hasTopic) {
      errors.topic = "Enter a topic or concept to explain";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [topic, outputSchema]);

  const getData = useCallback(() => {
    const template = selectedTemplateId ? getLearningTemplateById(selectedTemplateId) : null;
    
    return {
      templateId: selectedTemplateId,
      isFromScratch,
      topic,
      explanationStyle,
      audienceLevel,
      additionalContext,
      outputSchema,
      persona: template?.role || {
        type: "fx",
        blocks: [{ type: "text", value: `You are an educational content creator. Explain concepts in a ${explanationStyle} style for ${audienceLevel} level learners.` }],
      },
      query: template?.task || {
        type: "fx",
        blocks: [{ type: "text", value: "Create educational content about the following topic:\n\n" }],
      },
      format: outputSchema,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    topic,
    explanationStyle,
    audienceLevel,
    additionalContext,
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
    explanationStyle,
    audienceLevel,
    additionalContext,
    outputSchema,
    validation,
    selectTemplate,
    startFromScratch,
    updateTopic,
    setExplanationStyle,
    setAudienceLevel,
    setAdditionalContext,
    setOutputSchema,
    getData,
    getError,
  };
};
