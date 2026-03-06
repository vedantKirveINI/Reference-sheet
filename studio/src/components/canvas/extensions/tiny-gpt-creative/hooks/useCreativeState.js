import { useState, useCallback, useMemo } from "react";
import { cloneDeep } from "lodash-es";
import { getCreativeTemplateById } from "../templates/presets";

export const useCreativeState = (initialData = {}) => {
  const isNewNode = !initialData.templateId && !initialData.isFromScratch;
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialData.templateId || null
  );
  const [isFromScratch, setIsFromScratch] = useState(
    initialData.isFromScratch || isNewNode
  );
  
  const [prompt, setPrompt] = useState(cloneDeep(initialData.prompt) || null);
  const [style, setStyle] = useState(initialData.style || "narrative");
  const [length, setLength] = useState(initialData.length || "medium");
  const [tone, setTone] = useState(initialData.tone || "inspiring");
  const [additionalInstructions, setAdditionalInstructions] = useState(
    initialData.additionalInstructions || ""
  );
  const [outputSchema, setOutputSchema] = useState(
    cloneDeep(initialData.outputSchema) || [
      { key: "content", type: "string", description: "Generated creative content" },
    ]
  );

  const selectTemplate = useCallback((templateId) => {
    setSelectedTemplateId(templateId);
    setIsFromScratch(false);
    const template = getCreativeTemplateById(templateId);
    if (template) {
      setStyle(template.defaults.style);
      setLength(template.defaults.length);
      setTone(template.defaults.tone);
      setOutputSchema(cloneDeep(template.outputSchema));
    }
  }, []);

  const startFromScratch = useCallback(() => {
    setSelectedTemplateId(null);
    setIsFromScratch(true);
    setPrompt(null);
    setStyle("narrative");
    setLength("medium");
    setTone("inspiring");
    setAdditionalInstructions("");
    setOutputSchema([
      { key: "content", type: "string", description: "Generated creative content" },
    ]);
  }, []);

  const updatePrompt = useCallback((blocks) => {
    setPrompt({ type: "fx", blocks });
  }, []);

  const hasInitialised = selectedTemplateId !== null || isFromScratch;

  const validation = useMemo(() => {
    const errors = {};
    
    const hasPrompt = prompt?.blocks?.length > 0;
    const hasOutput = outputSchema.length > 0 && outputSchema[0]?.key;

    if (!hasPrompt) {
      errors.prompt = "Describe what you want to create";
    }
    if (!hasOutput) {
      errors.output = "Define at least one output field";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [prompt, outputSchema]);

  const getData = useCallback(() => {
    const template = selectedTemplateId ? getCreativeTemplateById(selectedTemplateId) : null;
    
    return {
      templateId: selectedTemplateId,
      isFromScratch,
      prompt,
      style,
      length,
      tone,
      additionalInstructions,
      outputSchema,
      persona: template?.role || {
        type: "fx",
        blocks: [{ type: "text", value: `You are a creative content writer. Write in a ${style} style with a ${tone} tone.` }],
      },
      query: template?.task || {
        type: "fx",
        blocks: [{ type: "text", value: "Create creative content based on the following prompt:\n\n" }],
      },
      format: outputSchema,
    };
  }, [
    selectedTemplateId,
    isFromScratch,
    prompt,
    style,
    length,
    tone,
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
    prompt,
    style,
    length,
    tone,
    additionalInstructions,
    outputSchema,
    validation,
    selectTemplate,
    startFromScratch,
    updatePrompt,
    setStyle,
    setLength,
    setTone,
    setAdditionalInstructions,
    setOutputSchema,
    getData,
    getError,
  };
};
